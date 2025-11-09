package com.example.realestate.service;

import com.example.realestate.dto.*;
import com.example.realestate.model.Coupon;
import com.example.realestate.model.FeaturedProperty;
import com.example.realestate.model.Property;
import com.example.realestate.repository.FeaturedPropertyRepository;
import com.example.realestate.repository.PropertyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class FeaturedPropertyService {

    @Autowired
    private FeaturedPropertyRepository featuredPropertyRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private CouponService couponService;

    private static final BigDecimal FEATURED_PRICE = BigDecimal.valueOf(499.00);
    private static final int DEFAULT_DURATION_MONTHS = 3;
    public Long extractUserId(UserDetails userDetails) {
        try {
            // If username = userId (your current behavior)
            return Long.parseLong(userDetails.getUsername());
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid user authentication. Cannot extract user ID.");
        }
    }

    /**
     * Apply featured status to a property with optional coupon
     */
    @Transactional
    public FeaturedPropertyResponse applyFeatured(Long userId, ApplyFeaturedRequest request) {
        // Validate property exists and belongs to user
        Optional<Property> propertyOpt = propertyRepository.findById(request.getPropertyId());
        if (propertyOpt.isEmpty()) {
            throw new RuntimeException("Property not found");
        }

        Property property = propertyOpt.get();
        if (!property.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: Property does not belong to user");
        }

        // Check if property is already featured
        if (featuredPropertyRepository.existsByPropertyIdAndIsActiveTrue(request.getPropertyId())) {
            throw new RuntimeException("Property is already featured");
        }

        // Initialize pricing
        BigDecimal originalPrice = FEATURED_PRICE;
        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal finalPrice = FEATURED_PRICE;
        Long couponId = null;
        String couponCode = null;
        FeaturedProperty.PaymentStatus paymentStatus = FeaturedProperty.PaymentStatus.PENDING;

        // Apply coupon if provided
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            CouponValidationResponse validation = couponService.validateCoupon(
                    request.getCouponCode(),
                    FEATURED_PRICE
            );

            if (!validation.isValid()) {
                throw new RuntimeException(validation.getMessage());
            }

            CouponDetails details = validation.getCouponDetails();
            discountAmount = details.getDiscountAmount();
            finalPrice = details.getFinalPrice();
            couponId = details.getCouponId();
            couponCode = details.getCouponCode();

            // If 100% discount, mark as FREE
            if (finalPrice.compareTo(BigDecimal.ZERO) == 0) {
                paymentStatus = FeaturedProperty.PaymentStatus.FREE;
            }
        }

        // Create featured property record
        FeaturedProperty featured = new FeaturedProperty();
        featured.setPropertyId(request.getPropertyId());
        featured.setUserId(userId);
        featured.setOriginalPrice(originalPrice);
        featured.setDiscountAmount(discountAmount);
        featured.setFinalPrice(finalPrice);
        featured.setCouponId(couponId);
        featured.setCouponCode(couponCode);
        featured.setFeaturedFrom(LocalDateTime.now());

        // Set featured until date
        int durationMonths = request.getDurationMonths() != null ?
                request.getDurationMonths() : DEFAULT_DURATION_MONTHS;
        featured.setFeaturedUntil(LocalDateTime.now().plusMonths(durationMonths));

        featured.setIsActive(true);
        featured.setPaymentStatus(paymentStatus);

        FeaturedProperty saved = featuredPropertyRepository.save(featured);

        // If free, increment coupon usage
        if (paymentStatus == FeaturedProperty.PaymentStatus.FREE && couponId != null) {
            couponService.incrementUsageCount(couponId);
        }

        return buildFeaturedPropertyResponse(saved,
                paymentStatus == FeaturedProperty.PaymentStatus.FREE ?
                        "Property featured successfully for free!" :
                        "Featured application created. Please complete payment.");
    }

    /**
     * Check if property is featured
     */
    public CheckFeaturedResponse checkIfFeatured(Long propertyId) {
        CheckFeaturedResponse response = new CheckFeaturedResponse();

        Optional<FeaturedProperty> featuredOpt = featuredPropertyRepository
                .findActiveByPropertyId(propertyId, LocalDateTime.now());

        if (featuredOpt.isPresent()) {
            response.setFeatured(true);
            response.setFeaturedDetails(buildFeaturedPropertyResponse(
                    featuredOpt.get(),
                    "Property is currently featured"
            ));
        } else {
            response.setFeatured(false);
        }

        return response;
    }

    /**
     * Get all currently active featured properties
     */
    public List<FeaturedProperty> getAllActiveFeaturedProperties() {
        return featuredPropertyRepository.findAllCurrentlyActive(LocalDateTime.now());
    }

    /**
     * Get user's featured properties
     */
    public List<FeaturedProperty> getUserFeaturedProperties(Long userId) {
        return featuredPropertyRepository.findByUserIdAndIsActiveTrue(userId);
    }

    /**
     * Complete payment for featured property
     */
    @Transactional
    public FeaturedPropertyResponse completePayment(Long featuredId, String paymentId, String orderId) {
        Optional<FeaturedProperty> featuredOpt = featuredPropertyRepository.findById(featuredId);
        if (featuredOpt.isEmpty()) {
            throw new RuntimeException("Featured property record not found");
        }

        FeaturedProperty featured = featuredOpt.get();
        featured.setPaymentStatus(FeaturedProperty.PaymentStatus.COMPLETED);
        featured.setPaymentId(paymentId);
        featured.setOrderId(orderId);

        FeaturedProperty saved = featuredPropertyRepository.save(featured);

        // Increment coupon usage if coupon was used
        if (featured.getCouponId() != null) {
            couponService.incrementUsageCount(featured.getCouponId());
        }

        return buildFeaturedPropertyResponse(saved, "Payment completed successfully!");
    }

    /**
     * Cancel featured property
     */
    @Transactional
    public void cancelFeatured(Long featuredId, Long userId) {
        Optional<FeaturedProperty> featuredOpt = featuredPropertyRepository.findById(featuredId);
        if (featuredOpt.isEmpty()) {
            throw new RuntimeException("Featured property record not found");
        }

        FeaturedProperty featured = featuredOpt.get();
        if (!featured.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        featured.setIsActive(false);
        featuredPropertyRepository.save(featured);
    }

    /**
     * Build response object
     */
    private FeaturedPropertyResponse buildFeaturedPropertyResponse(FeaturedProperty featured, String message) {
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

    /**
     * Get featured property by ID
     */
    public Optional<FeaturedProperty> getFeaturedPropertyById(Long featuredId) {
        return featuredPropertyRepository.findById(featuredId);
    }
}