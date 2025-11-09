package com.example.realestate.service;

import com.example.realestate.dto.*;
import com.example.realestate.model.*;
import com.example.realestate.repository.FeaturedPropertyRepository;
import com.example.realestate.repository.PropertyRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FeaturedPropertyService {

    private static final Logger log = LoggerFactory.getLogger(FeaturedPropertyService.class);

    private final FeaturedPropertyRepository featuredPropertyRepository;
    private final PropertyRepository propertyRepository;
    private final CouponService couponService;
    private final PropertyImageService propertyImageService;

    private static final BigDecimal FEATURED_PRICE = BigDecimal.valueOf(499.00);
    private static final int DEFAULT_DURATION_MONTHS = 3;

    public FeaturedPropertyService(FeaturedPropertyRepository featuredPropertyRepository,
                                   PropertyRepository propertyRepository,
                                   CouponService couponService,
                                   PropertyImageService propertyImageService) {
        this.featuredPropertyRepository = featuredPropertyRepository;
        this.propertyRepository = propertyRepository;
        this.couponService = couponService;
        this.propertyImageService = propertyImageService;
    }

    /**
     * Returns enriched FeaturedPropertyDTO list for all currently active featured properties.
     * Includes primary image, location, user summary, and type.
     */
    public List<FeaturedPropertyDTO> getActiveFeaturedProperties() {
        LocalDateTime now = LocalDateTime.now();

        // Fetch active & valid featured rows
        List<FeaturedProperty> active = featuredPropertyRepository.findAllCurrentlyActive(now);
        if (active == null || active.isEmpty()) {
            log.info("No active featured properties at {}", now);
            return Collections.emptyList();
        }

        // Load all property IDs referenced by active featured rows
        Set<Long> propIds = active.stream()
                .map(FeaturedProperty::getPropertyId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (propIds.isEmpty()) {
            log.info("Active featured rows had no valid propertyIds");
            return Collections.emptyList();
        }

        // Fetch properties in bulk
        List<Property> props = propertyRepository.findAllById(propIds);

        // Map propertyId -> Property for quick lookup
        Map<Long, Property> propMap = props.stream()
                .collect(Collectors.toMap(Property::getId, p -> p));

        // Build DTOs
        List<FeaturedPropertyDTO> out = new ArrayList<>();
        for (FeaturedProperty fp : active) {
            Long propertyId = fp.getPropertyId();
            if (propertyId == null) continue;

            Property p = propMap.get(propertyId);
            if (p == null) continue;

            FeaturedPropertyDTO dto = toDto(p);

            // Attach primary image from PropertyImageService
            String primaryImage = resolvePrimaryImage(propertyId);
            dto.setImageUrl(primaryImage);

            // Ensure isFeatured true (it is featured now)
            dto.setIsFeatured(Boolean.TRUE);

            out.add(dto);
        }

        // Sort by property createdAt (or adjust to featured recency if needed)
        out.sort(Comparator.comparing(FeaturedPropertyDTO::getCreatedAt,
                Comparator.nullsLast(Comparator.naturalOrder())).reversed());

        log.info("Returning {} active featured property DTOs", out.size());
        return out;
    }

    private String resolvePrimaryImage(Long propertyId) {
        try {
            List<PropertyImage> images = propertyImageService.getImagesByPropertyId(propertyId);
            if (images == null || images.isEmpty()) return null;

            PropertyImage primary = images.stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .orElse(images.get(0));

            return primary.getImageUrl();
        } catch (Exception e) {
            log.warn("Could not resolve primary image for property {}: {}", propertyId, e.getMessage());
            return null;
        }
    }

    private FeaturedPropertyDTO toDto(Property p) {
        FeaturedPropertyDTO dto = new FeaturedPropertyDTO();

        dto.setPropertyId(p.getId());
        dto.setTitle(nz(p.getTitle()));
        dto.setDescription(nz(p.getDescription()));
        dto.setListingType(nz(p.getListingType()));
        dto.setStatus(nz(p.getStatus()));
        dto.setAddress(nz(p.getAddress()));

        // areaSqft → Double (DTO expects Double). Handle BigDecimal/Double safely.
        if (p.getAreaSqft() != null) {
            try {
                dto.setAreaSqft(Double.valueOf(p.getAreaSqft().toString()));
            } catch (Exception ignore) {
                dto.setAreaSqft(null);
            }
        }

        dto.setBedrooms(p.getBedrooms());
        dto.setBathrooms(p.getBathrooms());
        dto.setBalconies(p.getBalconies());
        dto.setAmenities(nz(p.getAmenities()));
        dto.setPrice(p.getPrice());
        dto.setPriceDisplay(nz(p.getPriceDisplay()));
        dto.setIsFeatured(Boolean.TRUE.equals(p.getIsFeatured()));
        dto.setIsVerified(Boolean.TRUE.equals(p.getIsVerified()));
        dto.setIsReadyToMove(Boolean.TRUE.equals(p.getIsReadyToMove()));
        dto.setOwnerType(nz(p.getOwnerType()));
        dto.setCreatedAt(p.getCreatedAt());

        // property type (try entity's typeName, fallback to plain string "type")
        String typeName = null;
        if (p.getPropertyType() != null) {
            typeName = p.getPropertyType().getTypeName();
        }
        if (typeName == null || typeName.isBlank()) {
            typeName = p.getType(); // fallback
        }
        dto.setPropertyType(typeName);
        dto.setType(typeName); // keep for frontend fallbacks

        // area + city/state
        if (p.getArea() != null) {
            dto.setAreaName(nz(p.getArea().getAreaName()));
            dto.setPincode(nz(p.getArea().getPincode()));
            if (p.getArea().getCity() != null) {
                dto.setCityName(nz(p.getArea().getCity().getCityName()));
                dto.setState(nz(p.getArea().getCity().getState()));
            } else {
                dto.setCityName(nz(p.getCity()));
            }
        } else {
            dto.setCityName(nz(p.getCity()));
        }

        // user summary
        if (p.getUser() != null) {
            FeaturedPropertyDTO.UserSummary us = new FeaturedPropertyDTO.UserSummary();
            us.setId(p.getUser().getId());
            us.setFirstName(nz(p.getUser().getFirstName()));
            us.setLastName(nz(p.getUser().getLastName()));
            us.setEmail(nz(p.getUser().getEmail()));
            us.setMobileNumber(nz(p.getUser().getMobileNumber()));
            dto.setUser(us);
        }

        return dto;
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }

    // ---------------------------------------------------------------------
    // ✅ Extract User ID from Spring Security Principal
    // ---------------------------------------------------------------------
    public Long extractUserId(org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            return Long.parseLong(userDetails.getUsername());
        } catch (Exception e) {
            throw new RuntimeException("Invalid user authentication. Cannot extract user ID.");
        }
    }

    // ---------------------------------------------------------------------
    // ✅ Apply Featured Property Logic
    // ---------------------------------------------------------------------
    @Transactional
    public FeaturedPropertyResponse applyFeatured(Long userId, ApplyFeaturedRequest request) {

        Optional<Property> propertyOpt = propertyRepository.findById(request.getPropertyId());
        if (propertyOpt.isEmpty()) throw new RuntimeException("Property not found");

        Property property = propertyOpt.get();

        if (property.getUser() == null || !Objects.equals(property.getUser().getId(), userId))
            throw new RuntimeException("Unauthorized: Property does not belong to user");

        if (featuredPropertyRepository.existsByPropertyIdAndIsActiveTrue(request.getPropertyId()))
            throw new RuntimeException("Property is already featured");

        BigDecimal originalPrice = FEATURED_PRICE;
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal finalPrice = FEATURED_PRICE;

        Long couponId = null;
        String couponCode = null;

        FeaturedProperty.PaymentStatus paymentStatus = FeaturedProperty.PaymentStatus.PENDING;

        // ✅ Apply coupon
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            CouponValidationResponse validation =
                    couponService.validateCoupon(request.getCouponCode(), FEATURED_PRICE);

            if (!validation.isValid())
                throw new RuntimeException(validation.getMessage());

            CouponDetails details = validation.getCouponDetails();
            discountAmount = details.getDiscountAmount();
            finalPrice = details.getFinalPrice();

            couponId = details.getCouponId();
            couponCode = details.getCouponCode();

            if (finalPrice.compareTo(BigDecimal.ZERO) == 0)
                paymentStatus = FeaturedProperty.PaymentStatus.FREE;
        }

        FeaturedProperty featured = new FeaturedProperty();
        featured.setPropertyId(request.getPropertyId());
        featured.setUserId(userId);
        featured.setOriginalPrice(originalPrice);
        featured.setDiscountAmount(discountAmount);
        featured.setFinalPrice(finalPrice);
        featured.setCouponId(couponId);
        featured.setCouponCode(couponCode);

        featured.setFeaturedFrom(LocalDateTime.now());
        featured.setFeaturedUntil(LocalDateTime.now().plusMonths(
                request.getDurationMonths() != null ? request.getDurationMonths() : DEFAULT_DURATION_MONTHS
        ));

        featured.setIsActive(true);
        featured.setPaymentStatus(paymentStatus);

        FeaturedProperty saved = featuredPropertyRepository.save(featured);

        // ✅ update property table also
        property.setIsFeatured(true);
        propertyRepository.save(property);

        if (paymentStatus == FeaturedProperty.PaymentStatus.FREE && couponId != null)
            couponService.incrementUsageCount(couponId);

        return buildFeaturedPropertyResponse(saved,
                paymentStatus == FeaturedProperty.PaymentStatus.FREE
                        ? "Property featured successfully for free!"
                        : "Featured application created. Please complete payment.");
    }

    // ---------------------------------------------------------------------
    // ✅ Featured Status Check
    // ---------------------------------------------------------------------
    public CheckFeaturedResponse checkFeatured(Long propertyId) {

        Optional<FeaturedProperty> fp =
                featuredPropertyRepository.findActiveByPropertyId(propertyId, LocalDateTime.now());

        CheckFeaturedResponse response = new CheckFeaturedResponse();

        if (fp.isEmpty()) {
            response.setFeatured(false);
            response.setFeaturedProperty(null);
            return response;
        }

        FeaturedProperty featured = fp.get();

        FeaturedPropertyResponse dto = new FeaturedPropertyResponse();
        dto.setFeaturedId(featured.getFeaturedId());
        dto.setPropertyId(featured.getPropertyId());
        dto.setUserId(featured.getUserId());
        dto.setOriginalPrice(featured.getOriginalPrice());
        dto.setDiscountAmount(featured.getDiscountAmount());
        dto.setFinalPrice(featured.getFinalPrice());
        dto.setCouponCode(featured.getCouponCode());
        dto.setFeaturedFrom(featured.getFeaturedFrom());
        dto.setFeaturedUntil(featured.getFeaturedUntil());
        dto.setIsActive(featured.getIsActive());
        dto.setPaymentStatus(featured.getPaymentStatus().name());

        response.setFeatured(true);
        response.setFeaturedProperty(dto);

        return response;
    }

    // ---------------------------------------------------------------------
    // ✅ Get All Active
    // ---------------------------------------------------------------------
    public List<FeaturedProperty> getAllActiveFeaturedProperties() {
        return featuredPropertyRepository.findAllCurrentlyActive(LocalDateTime.now());
    }

    // ---------------------------------------------------------------------
    // ✅ Get User's Featured Properties
    // ---------------------------------------------------------------------
    public List<FeaturedProperty> getUserFeaturedProperties(Long userId) {
        return featuredPropertyRepository.findByUserIdAndIsActiveTrue(userId);
    }

    // ---------------------------------------------------------------------
    // ✅ Complete Payment
    // ---------------------------------------------------------------------
    @Transactional
    public FeaturedPropertyResponse completePayment(Long featuredId, String paymentId, String orderId) {

        FeaturedProperty featured = featuredPropertyRepository.findById(featuredId)
                .orElseThrow(() -> new RuntimeException("Featured property record not found"));

        featured.setPaymentStatus(FeaturedProperty.PaymentStatus.COMPLETED);
        featured.setPaymentId(paymentId);
        featured.setOrderId(orderId);

        FeaturedProperty saved = featuredPropertyRepository.save(featured);

        if (featured.getCouponId() != null)
            couponService.incrementUsageCount(featured.getCouponId());

        return buildFeaturedPropertyResponse(saved, "Payment completed successfully!");
    }

    // ---------------------------------------------------------------------
    // ✅ Cancel Featured
    // ---------------------------------------------------------------------
    @Transactional
    public void cancelFeatured(Long featuredId, Long userId) {

        FeaturedProperty featured = featuredPropertyRepository.findById(featuredId)
                .orElseThrow(() -> new RuntimeException("Featured property record not found"));

        if (!Objects.equals(featured.getUserId(), userId))
            throw new RuntimeException("Unauthorized");

        featured.setIsActive(false);
        featuredPropertyRepository.save(featured);
    }

    // ---------------------------------------------------------------------
    // ✅ Build Response DTO
    // ---------------------------------------------------------------------
    private FeaturedPropertyResponse buildFeaturedPropertyResponse(FeaturedProperty featured,
                                                                   String message) {

        FeaturedPropertyResponse response = new FeaturedPropertyResponse();

        response.setFeaturedId(featured.getFeaturedId());
        response.setPropertyId(featured.getPropertyId());
        response.setUserId(featured.getUserId());
        response.setOriginalPrice(featured.getOriginalPrice());
        response.setDiscountAmount(featured.getDiscountAmount());
        response.setFinalPrice(featured.getFinalPrice());
        response.setCouponCode(featured.getCouponCode());
        response.setFeaturedFrom(featured.getFeaturedFrom());
        response.setFeaturedUntil(featured.getFeaturedUntil());
        response.setIsActive(featured.getIsActive());
        response.setPaymentStatus(featured.getPaymentStatus().name());
        response.setMessage(message);

        return response;
    }

    // ---------------------------------------------------------------------
    // ✅ Find By ID
    // ---------------------------------------------------------------------
    public Optional<FeaturedProperty> getFeaturedPropertyById(Long featuredId) {
        return featuredPropertyRepository.findById(featuredId);
    }
}
