package com.example.realestate.service;

import com.example.realestate.dto.ApplyFeaturedRequest;
import com.example.realestate.dto.CheckFeaturedResponse;
import com.example.realestate.dto.CouponDetails;
import com.example.realestate.dto.CouponValidationResponse;
import com.example.realestate.dto.CreateFeaturedOrderRequest;
import com.example.realestate.dto.FeaturedOrderResponse;
import com.example.realestate.dto.FeaturedPropertyDTO;
import com.example.realestate.dto.FeaturedPropertyResponse;
import com.example.realestate.model.FeaturedProperty;
import com.example.realestate.model.Property;
import com.example.realestate.model.PropertyImage;
import com.example.realestate.repository.FeaturedPropertyRepository;
import com.example.realestate.repository.PropertyRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Autowired
    private RazorpayService razorpayService;

    // ---------------------------------------------------------------------
    // ✅ Option-1: Create Featured Order (FREE → activate, PAID → create Razorpay order)
    // ---------------------------------------------------------------------
    @Transactional
    public FeaturedOrderResponse createFeaturedOrder(CreateFeaturedOrderRequest request) {
        Long propertyId = request.getPropertyId();
        Long userId = request.getUserId();
        Integer months = request.getDurationMonths() != null ? request.getDurationMonths() : DEFAULT_DURATION_MONTHS;
        String couponCode = request.getCouponCode() != null ? request.getCouponCode().trim() : null;

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // 🔒 Reject if property is soft-deleted
        if (Boolean.FALSE.equals(property.getIsActive())) {
            throw new RuntimeException("Cannot feature a deleted property");
        }

        // Prevent duplicates: if already active, do not allow new order
        if (featuredPropertyRepository.existsByPropertyIdAndIsActiveTrue(propertyId)) {
            throw new RuntimeException("Property is already featured");
        }

        // Price calculation (with coupon if provided)
        BigDecimal original = FEATURED_PRICE;
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal finalAmount = original;
        Long couponId = null;

        if (couponCode != null && !couponCode.isBlank()) {
            CouponValidationResponse cv = couponService.validateCoupon(couponCode, original);
            if (cv != null && cv.isValid()) {
                CouponDetails cd = cv.getCouponDetails();
                discount = cd.getDiscountAmount() != null ? cd.getDiscountAmount() : BigDecimal.ZERO;
                finalAmount = cd.getFinalPrice() != null ? cd.getFinalPrice().max(BigDecimal.ZERO) : original;
                couponId = cd.getCouponId();
                couponCode = cd.getCouponCode();
            } else {
                // keep discount=0 and finalAmount=original if invalid
                log.info("Coupon invalid or not applicable: {}", couponCode);
            }
        }

        // Create the FeaturedProperty record
        FeaturedProperty fp = new FeaturedProperty();
        fp.setPropertyId(propertyId);
        fp.setUserId(userId);
        fp.setOriginalPrice(original);
        fp.setDiscountAmount(discount);
        fp.setFinalPrice(finalAmount);
        fp.setCouponId(couponId);
        fp.setCouponCode(couponCode);
        fp.setFeaturedFrom(LocalDateTime.now());
        fp.setFeaturedUntil(LocalDateTime.now().plusMonths(months));

        FeaturedOrderResponse out = new FeaturedOrderResponse();
        out.setCurrency("INR");
        out.setFeaturedId(null); // set after save

        // FREE path → activate immediately
        if (finalAmount.compareTo(BigDecimal.ZERO) == 0) {
            fp.setPaymentStatus(FeaturedProperty.PaymentStatus.FREE);
            fp.setIsActive(true);
            FeaturedProperty saved = featuredPropertyRepository.save(fp);

            // reflect on property now
            Property p = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found"));
            p.setIsFeatured(true);
            propertyRepository.save(p);

            if (couponId != null) {
                couponService.incrementUsageCount(couponId);
            }

            out.setSuccess(true);
            out.setMessage("Property featured successfully for free!");
            out.setFeaturedId(saved.getFeaturedId());
            out.setFinalAmount(BigDecimal.ZERO);
            out.setFree(true);
            return out;
        }

        // PAID path → create Razorpay order, activation after verification
        fp.setPaymentStatus(FeaturedProperty.PaymentStatus.PENDING);
        fp.setIsActive(false); // IMPORTANT: not active until /verify-payment success
        FeaturedProperty saved = featuredPropertyRepository.save(fp);

        String receipt = "FEATURED_" + propertyId + "_" + System.currentTimeMillis();
        Map<String, String> notes = new HashMap<>();
        notes.put("property_id", String.valueOf(propertyId));
        notes.put("user_id", String.valueOf(userId));
        if (couponCode != null) notes.put("coupon", couponCode);

        Map<String, Object> order = razorpayService.createOrder(finalAmount, "INR", receipt, notes);

        // Persist order id from Razorpay onto our record
        String orderId = String.valueOf(order.get("orderId"));
        saved.setOrderId(orderId);
        featuredPropertyRepository.save(saved);

        out.setSuccess(true);
        out.setMessage("Featured order created. Complete payment to activate.");
        out.setFeaturedId(saved.getFeaturedId());
        out.setRazorpayOrderId(orderId);
        out.setRazorpayKeyId(razorpayService.getKeyId());
        out.setFinalAmount(finalAmount);
        out.setFree(false);
        return out;
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

        // Collect property IDs
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

        // propertyId -> Property
        Map<Long, Property> propMap = props.stream()
                .collect(Collectors.toMap(Property::getId, p -> p));

        // Build DTOs
        List<FeaturedPropertyDTO> out = new ArrayList<>();
        for (FeaturedProperty fp : active) {
            Long pid = fp.getPropertyId();
            if (pid == null) continue;

            Property p = propMap.get(pid);
            if (p == null) continue;

            FeaturedPropertyDTO dto = toDto(p);

            // Attach primary image
            String primaryImage = resolvePrimaryImage(pid);
            dto.setImageUrl(primaryImage);

            // Ensure isFeatured true in DTO context
            dto.setIsFeatured(Boolean.TRUE);

            out.add(dto);
        }

        // Sort: newest first by property createdAt
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

    // ---------------------------------------------------------------------
    // ✅ NEW: Helper for safe BigDecimal to Double conversion
    // ---------------------------------------------------------------------
    private static Double safeBigDecimalToDouble(BigDecimal bd) {
        return bd == null ? null : bd.doubleValue();
    }

    // ---------------------------------------------------------------------
    // ✅ NEW: Helper for safe Double (room counts) to Double (DTO) conversion
    // ---------------------------------------------------------------------
    private static Double safeDoubleToDouble(Double d) {
        return d; // Added for conceptual completeness, mainly for future non-Double types
    }

    // ---------------------------------------------------------------------
    // ✅ UPDATED: toDto
    // ---------------------------------------------------------------------
    private FeaturedPropertyDTO toDto(Property p) {
        FeaturedPropertyDTO dto = new FeaturedPropertyDTO();

        dto.setPropertyId(p.getId());
        dto.setTitle(nz(p.getTitle()));
        dto.setDescription(nz(p.getDescription()));
        dto.setListingType(nz(p.getListingType()));
        dto.setStatus(nz(p.getStatus()));
        dto.setAddress(nz(p.getAddress()));

        // ⭐ IMPROVED: Use safe conversion helpers
        dto.setAreaSqft(safeBigDecimalToDouble(p.getAreaSqft()));

        // ⭐ NEW/IMPROVED: Add PricePerSqft and use safe conversion
        dto.setPricePerSqft(safeBigDecimalToDouble(p.getPricePerSqft()));

        // ⭐ IMPROVED: Use safe conversion helpers for room counts
        dto.setBedrooms(safeDoubleToDouble(p.getBedrooms()));
        dto.setBathrooms(safeDoubleToDouble(p.getBathrooms()));
        dto.setBalconies(safeDoubleToDouble(p.getBalconies()));

        dto.setAmenities(nz(p.getAmenities()));
        dto.setPrice(p.getPrice());
        dto.setPriceDisplay(nz(p.getPriceDisplay()));
        dto.setIsFeatured(Boolean.TRUE.equals(p.getIsFeatured()));
        dto.setIsVerified(Boolean.TRUE.equals(p.getIsVerified()));
        dto.setIsReadyToMove(Boolean.TRUE.equals(p.getIsReadyToMove()));
        dto.setOwnerType(nz(p.getOwnerType()));
        dto.setCreatedAt(p.getCreatedAt());

        String typeName = null;
        if (p.getPropertyType() != null) {
            typeName = p.getPropertyType().getTypeName();
        }
        if (typeName == null || typeName.isBlank()) {
            typeName = p.getType();
        }
        dto.setPropertyType(typeName);
        dto.setType(typeName);

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
    // ✅ OLD FLOW (kept): Apply Featured Property
    //     - Activate immediately ONLY for FREE
    //     - For paid (PENDING), keep inactive until payment completion
    // ---------------------------------------------------------------------
    @Transactional
    public FeaturedPropertyResponse applyFeatured(Long userId, ApplyFeaturedRequest request) {

        Optional<Property> propertyOpt = propertyRepository.findById(request.getPropertyId());
        if (propertyOpt.isEmpty()) throw new RuntimeException("Property not found");

        Property property = propertyOpt.get();

        if (property.getUser() == null || !Objects.equals(property.getUser().getId(), userId))
            throw new RuntimeException("Unauthorized: Property does not belong to user");

        // 🔒 Reject if property is soft-deleted
        if (Boolean.FALSE.equals(property.getIsActive())) {
            throw new RuntimeException("Cannot feature a deleted property");
        }

        if (featuredPropertyRepository.existsByPropertyIdAndIsActiveTrue(request.getPropertyId()))
            throw new RuntimeException("Property is already featured");

        BigDecimal originalPrice = FEATURED_PRICE;
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal finalPrice = FEATURED_PRICE;

        Long couponId = null;
        String couponCode = null;

        FeaturedProperty.PaymentStatus paymentStatus = FeaturedProperty.PaymentStatus.PENDING;

        // Apply coupon (optional)
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

        // ✅ IMPORTANT: Activate immediately ONLY if FREE; otherwise keep inactive
        boolean activateNow = (paymentStatus == FeaturedProperty.PaymentStatus.FREE);
        featured.setIsActive(activateNow);
        featured.setPaymentStatus(paymentStatus);

        FeaturedProperty saved = featuredPropertyRepository.save(featured);

        // ✅ Reflect to property table ONLY when FREE
        if (activateNow) {
            property.setIsFeatured(true);
            propertyRepository.save(property);
            if (couponId != null) {
                couponService.incrementUsageCount(couponId);
            }
        }

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
    // ✅ Complete Payment (called after successful Razorpay verification)
    //     - Mark COMPLETED
    //     - Set isActive = true
    //     - Set property.isFeatured = true
    // ---------------------------------------------------------------------
    @Transactional
    public FeaturedPropertyResponse completePayment(Long featuredId, String paymentId, String orderId) {

        FeaturedProperty featured = featuredPropertyRepository.findById(featuredId)
                .orElseThrow(() -> new RuntimeException("Featured property record not found"));

        // Mark payment details
        featured.setPaymentStatus(FeaturedProperty.PaymentStatus.COMPLETED);
        featured.setPaymentId(paymentId);
        featured.setOrderId(orderId);
        featured.setIsActive(true); // ✅ ACTIVATE NOW

        FeaturedProperty saved = featuredPropertyRepository.save(featured);

        // Reflect on property table now
        Property property = propertyRepository.findById(saved.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found"));

        // If property has been soft-deleted, deactivate featured and cancel
        if (!Boolean.TRUE.equals(property.getIsActive())) {
            // Deactivate featured record
            saved.setIsActive(false);
            saved.setPaymentStatus(FeaturedProperty.PaymentStatus.CANCELLED);
            featuredPropertyRepository.save(saved);

            throw new RuntimeException("Property is deleted; cannot activate featured status.");
        }

        if (!Boolean.TRUE.equals(property.getIsFeatured())) {
            property.setIsFeatured(true);
            propertyRepository.save(property);
        }

        // Increment coupon usage if applicable
        if (saved.getCouponId() != null) {
            couponService.incrementUsageCount(saved.getCouponId());
        }

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

    // ---------------------------------------------------------------------
    // ✅ Utility: Deactivate featured records for a property (used by PropertyService soft-delete)
    // ---------------------------------------------------------------------
    @Transactional
    public void deactivateFeaturedForProperty(Long propertyId) {
        List<FeaturedProperty> fps = featuredPropertyRepository.findByPropertyId(propertyId);
        if (fps == null || fps.isEmpty()) return;
        for (FeaturedProperty fp : fps) {
            fp.setIsActive(false);
            fp.setPaymentStatus(FeaturedProperty.PaymentStatus.CANCELLED);
        }
        featuredPropertyRepository.saveAll(fps);
    }
}
