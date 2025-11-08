package com.example.realestate.controller;

import com.example.realestate.service.BrokerSubscriptionService;
import com.example.realestate.service.RazorpayService;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
public class RazorpayWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayWebhookController.class);

    @Autowired
    private RazorpayService razorpayService;

    @Autowired
    private BrokerSubscriptionService subscriptionService;

    @Value("${razorpay.webhook.secret:}")
    private String webhookSecret;

    /**
     * Handle Razorpay webhooks
     */
    @PostMapping("/razorpay")
    public ResponseEntity<?> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signature) {

        logger.info("🔔 Received Razorpay webhook");

        try {
            // Verify webhook signature
            if (webhookSecret != null && !webhookSecret.isEmpty()) {
                boolean isValid = razorpayService.verifyWebhookSignature(
                        payload, signature, webhookSecret
                );

                if (!isValid) {
                    logger.warn("⚠️ Invalid webhook signature");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("status", "invalid_signature"));
                }
            }

            // Parse webhook payload
            JSONObject webhookData = new JSONObject(payload);
            String event = webhookData.getString("event");
            JSONObject payloadData = webhookData.getJSONObject("payload");
            JSONObject payment = payloadData.getJSONObject("payment");
            JSONObject entity = payment.getJSONObject("entity");

            logger.info("Webhook event: {}", event);

            // Handle different webhook events
            switch (event) {
                case "payment.captured":
                    handlePaymentCaptured(entity);
                    break;

                case "payment.failed":
                    handlePaymentFailed(entity);
                    break;

                case "order.paid":
                    handleOrderPaid(entity);
                    break;

                default:
                    logger.info("Unhandled webhook event: {}", event);
            }

            return ResponseEntity.ok(Map.of("status", "success"));

        } catch (Exception e) {
            logger.error("❌ Error processing webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    /**
     * Handle payment captured event
     */
    private void handlePaymentCaptured(JSONObject entity) {
        String paymentId = entity.getString("id");
        String orderId = entity.getString("order_id");

        logger.info("💰 Payment captured - Payment ID: {}, Order ID: {}", paymentId, orderId);

        // Payment is already captured, just log
        // Actual activation happens in verify-payment endpoint
    }

    /**
     * Handle payment failed event
     */
    private void handlePaymentFailed(JSONObject entity) {
        String orderId = entity.getString("order_id");
        String errorReason = entity.optString("error_reason", "Unknown error");

        logger.warn("❌ Payment failed - Order ID: {}, Reason: {}", orderId, errorReason);

        // Handle payment failure
        subscriptionService.handlePaymentFailure(orderId, errorReason);
    }

    /**
     * Handle order paid event
     */
    private void handleOrderPaid(JSONObject entity) {
        String orderId = entity.getString("id");

        logger.info("✅ Order paid - Order ID: {}", orderId);
    }
}