package com.example.realestate.service;

import com.example.realestate.dto.*;
import com.example.realestate.model.Coupon;
import com.example.realestate.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    /**
     * Validate a coupon code and calculate discount
     */
    public CouponValidationResponse validateCoupon(String couponCode, BigDecimal orderValue) {
        CouponValidationResponse response = new CouponValidationResponse();

        Optional<Coupon> couponOpt = couponRepository.findValidCouponByCode(
                couponCode.toUpperCase().trim(),
                LocalDateTime.now()
        );

        if (couponOpt.isEmpty()) {
            response.setValid(false);
            response.setMessage("Invalid or expired coupon code");
            return response;
        }

        Coupon coupon = couponOpt.get();

        // Check minimum order value
        if (coupon.getMinOrderValue() != null &&
                orderValue.compareTo(coupon.getMinOrderValue()) < 0) {
            response.setValid(false);
            response.setMessage("Minimum order value of ₹" + coupon.getMinOrderValue() + " required");
            return response;
        }

        // Calculate discount
        BigDecimal discountAmount = coupon.calculateDiscount(orderValue);
        BigDecimal finalPrice = orderValue.subtract(discountAmount);

        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            finalPrice = BigDecimal.ZERO;
        }

        // Build coupon details
        CouponDetails details = new CouponDetails();
        details.setCouponId(coupon.getCouponId());
        details.setCouponCode(coupon.getCouponCode());
        details.setDescription(coupon.getDescription());
        details.setDiscountType(coupon.getDiscountType().name());
        details.setDiscountValue(coupon.getDiscountValue());
        details.setDiscountAmount(discountAmount);
        details.setOriginalPrice(orderValue);
        details.setFinalPrice(finalPrice);

        response.setValid(true);
        response.setMessage("Coupon applied successfully!");
        response.setCouponDetails(details);

        return response;
    }

    /**
     * Increment usage count when coupon is used
     */
    @Transactional
    public void incrementUsageCount(Long couponId) {
        Optional<Coupon> couponOpt = couponRepository.findById(couponId);
        if (couponOpt.isPresent()) {
            Coupon coupon = couponOpt.get();
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }
    }

    /**
     * Get all active coupons
     */
    public List<Coupon> getAllActiveCoupons() {
        return couponRepository.findAllActiveCoupons(LocalDateTime.now());
    }

    /**
     * Get coupon by code
     */
    public Optional<Coupon> getCouponByCode(String couponCode) {
        return couponRepository.findByCouponCode(couponCode.toUpperCase().trim());
    }

    /**
     * Create a new coupon (Admin only)
     */
    @Transactional
    public Coupon createCoupon(Coupon coupon) {
        coupon.setCouponCode(coupon.getCouponCode().toUpperCase().trim());
        return couponRepository.save(coupon);
    }

    /**
     * Update coupon (Admin only)
     */
    @Transactional
    public Coupon updateCoupon(Long couponId, Coupon updatedCoupon) {
        Optional<Coupon> existingOpt = couponRepository.findById(couponId);
        if (existingOpt.isEmpty()) {
            throw new RuntimeException("Coupon not found");
        }

        Coupon existing = existingOpt.get();
        existing.setDescription(updatedCoupon.getDescription());
        existing.setDiscountType(updatedCoupon.getDiscountType());
        existing.setDiscountValue(updatedCoupon.getDiscountValue());
        existing.setMaxDiscount(updatedCoupon.getMaxDiscount());
        existing.setMinOrderValue(updatedCoupon.getMinOrderValue());
        existing.setIsActive(updatedCoupon.getIsActive());
        existing.setUsageLimit(updatedCoupon.getUsageLimit());
        existing.setValidFrom(updatedCoupon.getValidFrom());
        existing.setValidUntil(updatedCoupon.getValidUntil());

        return couponRepository.save(existing);
    }

    /**
     * Delete coupon (Admin only)
     */
    @Transactional
    public void deleteCoupon(Long couponId) {
        couponRepository.deleteById(couponId);
    }

    /**
     * Deactivate coupon
     */
    @Transactional
    public void deactivateCoupon(Long couponId) {
        Optional<Coupon> couponOpt = couponRepository.findById(couponId);
        if (couponOpt.isPresent()) {
            Coupon coupon = couponOpt.get();
            coupon.setIsActive(false);
            couponRepository.save(coupon);
        }
    }
}