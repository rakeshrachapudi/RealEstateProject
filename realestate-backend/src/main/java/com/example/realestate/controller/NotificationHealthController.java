package com.example.realestate.controller;

import com.example.realestate.service.WhatsAppCloudService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationHealthController {

    @Autowired
    private WhatsAppCloudService whatsAppCloudService;

    /**
     * Check notification services health
     */
    @GetMapping("/health")
    public ResponseEntity<?> checkHealth() {
        Map<String, Object> health = new HashMap<>();

        boolean whatsappHealthy = whatsAppCloudService.checkHealth();

        health.put("whatsapp", whatsappHealthy ? "healthy" : "unhealthy");
        health.put("email", "configured"); // SES is always available if credentials are correct
        health.put("overall", whatsappHealthy ? "healthy" : "degraded");

        return ResponseEntity.ok(health);
    }

    /**
     * Send test notification
     */
    @PostMapping("/test")
    public ResponseEntity<?> sendTestNotification(
            @RequestParam String phone,
            @RequestParam(required = false) String email) {

        Map<String, Object> result = new HashMap<>();

        // Test WhatsApp
        boolean whatsappSent = whatsAppCloudService.sendTextMessage(
                phone,
                "🏠 Test notification from PropertyDealz.in! Your notification system is working correctly. ✅"
        );

        result.put("whatsapp", whatsappSent ? "sent" : "failed");
        result.put("phone", phone);

        return ResponseEntity.ok(result);
    }
}