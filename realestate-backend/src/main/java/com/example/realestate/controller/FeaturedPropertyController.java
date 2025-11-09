package com.example.realestate.controller;

import com.example.realestate.dto.*;
import com.example.realestate.model.FeaturedProperty;
import com.example.realestate.service.FeaturedPropertyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/featured-properties")
@CrossOrigin(origins = "*")
public class FeaturedPropertyController {

    @Autowired
    private FeaturedPropertyService featuredPropertyService;

    /**
     * Apply featured status to a property
     * POST /api/featured-properties/apply
     */
    @PostMapping("/apply")
    public ResponseEntity<?> applyFeatured(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ApplyFeaturedRequest request) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not authenticated");
            }

            Long userId = extractUserIdFromUserDetails(userDetails);

            FeaturedPropertyResponse response = featuredPropertyService.applyFeatured(userId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error applying featured status: " + e.getMessage());
        }
    }

    /**
     * Check if a property is featured
     * GET /api/featured-properties/check/{propertyId}
     */
    @GetMapping("/check/{propertyId}")
    public ResponseEntity<?> checkIfFeatured(@PathVariable Long propertyId) {
        try {
            CheckFeaturedResponse response = featuredPropertyService.checkIfFeatured(propertyId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error checking featured status: " + e.getMessage());
        }
    }

    /**
     * Get all active featured properties
     * GET /api/featured-properties/active
     */
    @GetMapping("/active")
    public ResponseEntity<?> getAllActiveFeaturedProperties() {
        try {
            List<FeaturedProperty> featuredProperties =
                    featuredPropertyService.getAllActiveFeaturedProperties();
            return ResponseEntity.ok(featuredProperties);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching featured properties: " + e.getMessage());
        }
    }

    /**
     * Get user's featured properties
     * GET /api/featured-properties/my-featured
     */
    @GetMapping("/my-featured")
    public ResponseEntity<?> getMyFeaturedProperties(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not authenticated");
            }

            Long userId = extractUserIdFromUserDetails(userDetails);
            List<FeaturedProperty> featuredProperties =
                    featuredPropertyService.getUserFeaturedProperties(userId);
            return ResponseEntity.ok(featuredProperties);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching your featured properties: " + e.getMessage());
        }
    }

    /**
     * Complete payment for featured property
     * POST /api/featured-properties/complete-payment
     */
    @PostMapping("/complete-payment")
    public ResponseEntity<?> completePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody VerifyPaymentRequest request) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not authenticated");
            }

            FeaturedPropertyResponse response = featuredPropertyService.completePayment(
                    request.getFeaturedId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpayOrderId()
            );

            VerifyPaymentResponse verifyResponse = new VerifyPaymentResponse();
            verifyResponse.setSuccess(true);
            verifyResponse.setMessage("Payment verified and featured status activated!");
            verifyResponse.setFeaturedProperty(response);

            return ResponseEntity.ok(verifyResponse);
        } catch (RuntimeException e) {
            VerifyPaymentResponse errorResponse = new VerifyPaymentResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage(e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error completing payment: " + e.getMessage());
        }
    }

    /**
     * Cancel featured property
     * DELETE /api/featured-properties/{featuredId}
     */
    @DeleteMapping("/{featuredId}")
    public ResponseEntity<?> cancelFeatured(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long featuredId) {
        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("User not authenticated");
            }

            Long userId = extractUserIdFromUserDetails(userDetails);
            featuredPropertyService.cancelFeatured(featuredId, userId);
            return ResponseEntity.ok("Featured property cancelled successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error cancelling featured property: " + e.getMessage());
        }
    }

    /**
     * Helper method to extract user ID from UserDetails
     */
    private Long extractUserIdFromUserDetails(UserDetails userDetails) {
        // Assuming username contains user ID or you have a custom UserDetails implementation
        // Adjust this based on your actual implementation
        try {
            return Long.parseLong(userDetails.getUsername());
        } catch (NumberFormatException e) {
            // If username is not the ID, you might need to query the database
            // or use a custom UserDetails implementation that includes userId
            throw new RuntimeException("Unable to extract user ID from authentication");
        }
    }
}