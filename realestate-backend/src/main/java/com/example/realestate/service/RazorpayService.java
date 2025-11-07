package com.example.realestate.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class RazorpayService {

    private static final Logger logger = LoggerFactory.getLogger(RazorpayService.class);

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private RazorpayClient razorpayClient;

    /**
     * Initialize Razorpay client
     */
    private RazorpayClient getRazorpayClient() throws RazorpayException {
        if (razorpayClient == null) {
            razorpayClient = new RazorpayClient(keyId, keySecret);
            logger.info("✅ Razorpay client initialized with key: {}", maskKey(keyId));
        }
        return razorpayClient;
    }

    /**
     * Create Razorpay order for subscription payment
     */
    public Map<String, Object> createOrder(BigDecimal amount, String currency,
                                           String receipt, Map<String, String> notes) {
        logger.info("Creating Razorpay order - Amount: {} {}, Receipt: {}", amount, currency, receipt);

        try {
            RazorpayClient client = getRazorpayClient();

            // Convert amount to paise (smallest currency unit)
            int amountInPaise = amount.multiply(BigDecimal.valueOf(100)).intValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);

            if (notes != null && !notes.isEmpty()) {
                JSONObject notesJson = new JSONObject(notes);
                orderRequest.put("notes", notesJson);
            }

            Order order = client.orders.create(orderRequest);

            Map<String, Object> orderData = new HashMap<>();
            orderData.put("orderId", order.get("id"));
            orderData.put("amount", order.get("amount"));
            orderData.put("currency", order.get("currency"));
            orderData.put("receipt", order.get("receipt"));
            orderData.put("status", order.get("status"));
            orderData.put("created_at", order.get("created_at"));

            logger.info("✅ Razorpay order created successfully - Order ID: {}", order.get("id"));
            return orderData;

        } catch (RazorpayException e) {
            logger.error("❌ Error creating Razorpay order", e);
            throw new RuntimeException("Failed to create Razorpay order: " + e.getMessage());
        }
    }

    /**
     * Verify payment signature
     */
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        logger.info("Verifying payment signature - Order ID: {}, Payment ID: {}", orderId, paymentId);

        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(attributes, keySecret);

            if (isValid) {
                logger.info("✅ Payment signature verified successfully");
            } else {
                logger.warn("⚠️ Payment signature verification failed");
            }

            return isValid;

        } catch (RazorpayException e) {
            logger.error("❌ Error verifying payment signature", e);
            return false;
        }
    }

    /**
     * Verify webhook signature
     */
    public boolean verifyWebhookSignature(String payload, String signature, String secret) {
        logger.info("Verifying webhook signature");

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );
            mac.init(secretKeySpec);

            byte[] hash = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String generatedSignature = bytesToHex(hash);

            boolean isValid = generatedSignature.equals(signature);

            if (isValid) {
                logger.info("✅ Webhook signature verified successfully");
            } else {
                logger.warn("⚠️ Webhook signature verification failed");
            }

            return isValid;

        } catch (Exception e) {
            logger.error("❌ Error verifying webhook signature", e);
            return false;
        }
    }

    /**
     * Fetch payment details
     */
    public Map<String, Object> fetchPaymentDetails(String paymentId) {
        logger.info("Fetching payment details for Payment ID: {}", paymentId);

        try {
            RazorpayClient client = getRazorpayClient();
            com.razorpay.Payment payment = client.payments.fetch(paymentId);

            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("id", payment.get("id"));
            paymentData.put("entity", payment.get("entity"));
            paymentData.put("amount", payment.get("amount"));
            paymentData.put("currency", payment.get("currency"));
            paymentData.put("status", payment.get("status"));
            paymentData.put("order_id", payment.get("order_id"));
            paymentData.put("method", payment.get("method"));
            paymentData.put("email", payment.get("email"));
            paymentData.put("contact", payment.get("contact"));
            paymentData.put("created_at", payment.get("created_at"));

            logger.info("✅ Payment details fetched successfully");
            return paymentData;

        } catch (RazorpayException e) {
            logger.error("❌ Error fetching payment details", e);
            throw new RuntimeException("Failed to fetch payment details: " + e.getMessage());
        }
    }

    /**
     * Capture payment (for authorized payments)
     */
    public Map<String, Object> capturePayment(String paymentId, BigDecimal amount) {
        logger.info("Capturing payment - Payment ID: {}, Amount: {}", paymentId, amount);

        try {
            RazorpayClient client = getRazorpayClient();
            int amountInPaise = amount.multiply(BigDecimal.valueOf(100)).intValue();

            JSONObject captureRequest = new JSONObject();
            captureRequest.put("amount", amountInPaise);

            com.razorpay.Payment payment = client.payments.capture(paymentId, captureRequest);

            Map<String, Object> paymentData = new HashMap<>();
            paymentData.put("id", payment.get("id"));
            paymentData.put("status", payment.get("status"));
            paymentData.put("amount", payment.get("amount"));

            logger.info("✅ Payment captured successfully");
            return paymentData;

        } catch (RazorpayException e) {
            logger.error("❌ Error capturing payment", e);
            throw new RuntimeException("Failed to capture payment: " + e.getMessage());
        }
    }

    /**
     * Refund payment
     */
    public Map<String, Object> refundPayment(String paymentId, BigDecimal amount) {
        logger.info("Refunding payment - Payment ID: {}, Amount: {}", paymentId, amount);

        try {
            RazorpayClient client = getRazorpayClient();
            int amountInPaise = amount.multiply(BigDecimal.valueOf(100)).intValue();

            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", amountInPaise);

            com.razorpay.Refund refund = client.payments.refund(paymentId, refundRequest);

            Map<String, Object> refundData = new HashMap<>();
            refundData.put("id", refund.get("id"));
            refundData.put("entity", refund.get("entity"));
            refundData.put("amount", refund.get("amount"));
            refundData.put("payment_id", refund.get("payment_id"));
            refundData.put("status", refund.get("status"));

            logger.info("✅ Payment refunded successfully - Refund ID: {}", refund.get("id"));
            return refundData;

        } catch (RazorpayException e) {
            logger.error("❌ Error refunding payment", e);
            throw new RuntimeException("Failed to refund payment: " + e.getMessage());
        }
    }

    /**
     * Get Razorpay key ID for frontend
     */
    public String getKeyId() {
        return keyId;
    }

    /**
     * Helper method to convert bytes to hex string
     */
    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    /**
     * Mask key for logging
     */
    private String maskKey(String key) {
        if (key == null || key.length() < 8) return "****";
        return key.substring(0, 4) + "****" + key.substring(key.length() - 4);
    }
}