package com.example.realestate.controller;

import com.example.realestate.dto.CouponValidationResponse;
import com.example.realestate.dto.ValidateCouponRequest;
import com.example.realestate.model.Coupon;
import com.example.realestate.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(origins = "*")
public class CouponController {

    @Autowired
    private CouponService couponService;

    /**
     * Validate a coupon code
     * POST /api/coupons/validate
     */
    @PostMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestBody ValidateCouponRequest request) {
        try {
            if (request.getCouponCode() == null || request.getCouponCode().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Coupon code is required");
            }

            BigDecimal orderValue = request.getOrderValue() != null ?
                    request.getOrderValue() : BigDecimal.valueOf(499.00);

            CouponValidationResponse response = couponService.validateCoupon(
                    request.getCouponCode(),
                    orderValue
            );

            if (response.isValid()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error validating coupon: " + e.getMessage());
        }
    }

    /**
     * Get all active coupons (for display purposes)
     * GET /api/coupons/active
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveCoupons() {
        try {
            List<Coupon> coupons = couponService.getAllActiveCoupons();
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching coupons: " + e.getMessage());
        }
    }

    /**
     * Get coupon by code
     * GET /api/coupons/{couponCode}
     */
    @GetMapping("/{couponCode}")
    public ResponseEntity<?> getCouponByCode(@PathVariable String couponCode) {
        try {
            return couponService.getCouponByCode(couponCode)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching coupon: " + e.getMessage());
        }
    }

    // ===== ADMIN ENDPOINTS =====

    /**
     * Create new coupon (Admin only)
     * POST /api/coupons/admin/create
     */
    @PostMapping("/admin/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        try {
            Coupon created = couponService.createCoupon(coupon);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating coupon: " + e.getMessage());
        }
    }

    /**
     * Update coupon (Admin only)
     * PUT /api/coupons/admin/{couponId}
     */
    @PutMapping("/admin/{couponId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateCoupon(
            @PathVariable Long couponId,
            @RequestBody Coupon coupon) {
        try {
            Coupon updated = couponService.updateCoupon(couponId, coupon);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating coupon: " + e.getMessage());
        }
    }

    /**
     * Deactivate coupon (Admin only)
     * PATCH /api/coupons/admin/{couponId}/deactivate
     */
    @PatchMapping("/admin/{couponId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deactivateCoupon(@PathVariable Long couponId) {
        try {
            couponService.deactivateCoupon(couponId);
            return ResponseEntity.ok("Coupon deactivated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deactivating coupon: " + e.getMessage());
        }
    }

    /**
     * Delete coupon (Admin only)
     * DELETE /api/coupons/admin/{couponId}
     */
    @DeleteMapping("/admin/{couponId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long couponId) {
        try {
            couponService.deleteCoupon(couponId);
            return ResponseEntity.ok("Coupon deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting coupon: " + e.getMessage());
        }
    }
}