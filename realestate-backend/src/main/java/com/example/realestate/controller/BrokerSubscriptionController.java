package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.model.BrokerSubscription;
import com.example.realestate.service.BrokerSubscriptionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/broker-subscription")
public class BrokerSubscriptionController {

    private static final Logger logger = LoggerFactory.getLogger(BrokerSubscriptionController.class);

    @Autowired
    private BrokerSubscriptionService subscriptionService;

    /**
     * Get broker subscription status
     */
    @GetMapping("/status/{brokerId}")
    public ResponseEntity<?> getSubscriptionStatus(@PathVariable Long brokerId) {
        logger.info("Fetching subscription status for broker: {}", brokerId);
        try {
            Map<String, Object> status = subscriptionService.getSubscriptionStatus(brokerId);
            return ResponseEntity.ok(ApiResponse.success(status));
        } catch (Exception e) {
            logger.error("Error fetching subscription status", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all subscription plans
     */
    @GetMapping("/plans")
    public ResponseEntity<?> getAllPlans() {
        logger.info("Fetching all subscription plans");
        try {
            Map<String, Object> plans = subscriptionService.getAllPlans();
            return ResponseEntity.ok(ApiResponse.success(plans));
        } catch (Exception e) {
            logger.error("Error fetching plans", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Validate coupon code
     */
    @PostMapping("/validate-coupon")
    public ResponseEntity<?> validateCoupon(@RequestBody Map<String, Object> request) {
        logger.info("Validating coupon code");
        try {
            Long brokerId = Long.valueOf(request.get("brokerId").toString());
            String couponCode = request.get("couponCode").toString();

            Map<String, Object> result = subscriptionService.validateCoupon(brokerId, couponCode);
            return ResponseEntity.ok(ApiResponse.success(result));

        } catch (Exception e) {
            logger.error("Error validating coupon", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Apply coupon and activate free trial
     */
    @PostMapping("/apply-coupon")
    public ResponseEntity<?> applyCoupon(@RequestBody Map<String, Object> request) {
        logger.info("Applying coupon for broker");
        try {
            Long brokerId = Long.valueOf(request.get("brokerId").toString());
            String couponCode = request.get("couponCode").toString();

            BrokerSubscription subscription = subscriptionService
                    .applyCouponAndCreateTrial(brokerId, couponCode);

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "message", "Coupon applied successfully! Your free trial is now active.",
                    "subscription", subscription
            )));

        } catch (Exception e) {
            logger.error("Error applying coupon", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create paid subscription (returns Razorpay order details)
     */
    @PostMapping("/create-paid")
    public ResponseEntity<?> createPaidSubscription(@RequestBody Map<String, Object> request) {
        logger.info("Creating paid subscription");
        try {
            Long brokerId = Long.valueOf(request.get("brokerId").toString());
            String planType = request.get("planType").toString();

            Map<String, Object> orderDetails = subscriptionService
                    .createPaidSubscription(brokerId, planType);

            return ResponseEntity.ok(ApiResponse.success(orderDetails));

        } catch (Exception e) {
            logger.error("Error creating paid subscription", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Verify payment and activate subscription
     * FIXED: Added null checks to prevent NullPointerException
     */
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, Object> request) {
        logger.info("Verifying payment");
        logger.info("Request payload: {}", request);

        try {
            // Validate required parameters
            if (request.get("razorpay_order_id") == null) {
                logger.error("Missing razorpay_order_id in request");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Missing required parameter: razorpay_order_id"));
            }
            if (request.get("razorpay_payment_id") == null) {
                logger.error("Missing razorpay_payment_id in request");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Missing required parameter: razorpay_payment_id"));
            }
            if (request.get("razorpay_signature") == null) {
                logger.error("Missing razorpay_signature in request");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Missing required parameter: razorpay_signature"));
            }

            String orderId = request.get("razorpay_order_id").toString();
            String paymentId = request.get("razorpay_payment_id").toString();
            String signature = request.get("razorpay_signature").toString();

            logger.info("Verifying payment - Order ID: {}, Payment ID: {}", orderId, paymentId);

            BrokerSubscription subscription = subscriptionService
                    .verifyAndActivateSubscription(orderId, paymentId, signature);

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "message", "Payment verified! Your subscription is now active.",
                    "subscription", subscription
            )));

        } catch (Exception e) {
            logger.error("Error verifying payment", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Check if broker can post property
     */
    @GetMapping("/can-post/{brokerId}")
    public ResponseEntity<?> canPostProperty(@PathVariable Long brokerId) {
        logger.info("Checking if broker {} can post property", brokerId);
        try {
            boolean canPost = subscriptionService.canPostProperty(brokerId);
            Map<String, Object> status = subscriptionService.getSubscriptionStatus(brokerId);

            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "canPost", canPost,
                    "subscriptionStatus", status
            )));

        } catch (Exception e) {
            logger.error("Error checking post permission", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get subscription pricing
     */
    @GetMapping("/pricing")
    public ResponseEntity<?> getPricing() {
        logger.info("Fetching subscription pricing");
        try {
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "MONTHLY", subscriptionService.getSubscriptionPrice("MONTHLY"),
                    "QUARTERLY", subscriptionService.getSubscriptionPrice("QUARTERLY"),
                    "YEARLY", subscriptionService.getSubscriptionPrice("YEARLY")
            )));
        } catch (Exception e) {
            logger.error("Error fetching pricing", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}