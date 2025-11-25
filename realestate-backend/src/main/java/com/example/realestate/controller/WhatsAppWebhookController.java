package com.example.realestate.controller;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
public class WhatsAppWebhookController {

    private static final Logger logger = LoggerFactory.getLogger(WhatsAppWebhookController.class);

    /**
     * Verification endpoint for Meta
     */
    @GetMapping("/whatsapp")
    public ResponseEntity<String> verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String token,
            @RequestParam("hub.challenge") String challenge) {

        logger.info("🔐 Webhook verification request received");

        // Set this token in Meta Webhook settings
        String VERIFY_TOKEN = "PropertyDealz2025Webhook";

        if ("subscribe".equals(mode) && VERIFY_TOKEN.equals(token)) {
            logger.info("✅ Webhook verified successfully");
            return ResponseEntity.ok(challenge);
        } else {
            logger.warn("❌ Webhook verification failed");
            return ResponseEntity.status(403).body("Forbidden");
        }
    }

    /**
     * Receive webhook events
     */
    @PostMapping("/whatsapp")
    public ResponseEntity<?> handleWebhook(@RequestBody String payload) {
        logger.info("📨 WhatsApp webhook received");

        try {
            JSONObject data = new JSONObject(payload);

            // Process webhook data
            if (data.has("entry")) {
                // Handle message status updates
                logger.info("Webhook data: {}", data.toString(2));
            }

            return ResponseEntity.ok("OK");

        } catch (Exception e) {
            logger.error("❌ Error processing webhook: {}", e.getMessage());
            return ResponseEntity.ok("OK");
        }
    }
}