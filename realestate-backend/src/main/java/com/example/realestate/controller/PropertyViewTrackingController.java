package com.example.realestate.controller;

import com.example.realestate.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/property-tracking")
@CrossOrigin(origins = "*")
public class PropertyViewTrackingController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyViewTrackingController.class);

    @Autowired
    private NotificationService notificationService;

    // 🆕 NEW: Read feature flag from application.properties
    @Value("${property.tracking.enabled:true}")
    private boolean trackingEnabled;

    /**
     * 🆕 NEW: Check if property tracking feature is enabled
     */
    @GetMapping("/feature-status")
    public ResponseEntity<?> getFeatureStatus() {
        logger.info("📊 Feature status check - Tracking enabled: {}", trackingEnabled);

        return ResponseEntity.ok(Map.of(
                "enabled", trackingEnabled,
                "message", trackingEnabled ?
                        "Property view tracking is enabled" :
                        "Property view tracking is disabled"
        ));
    }

    /**
     * Track property view and send notifications
     */
    @PostMapping("/view/{propertyId}")
    public ResponseEntity<?> trackPropertyView(
            @PathVariable Long propertyId,
            HttpServletRequest request) {

        logger.info("🔍 Property viewed - ID: {}", propertyId);

        // 🆕 NEW: Check if tracking is enabled
        if (!trackingEnabled) {
            logger.info("   Tracking disabled via feature flag - skipping notification");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Property view recorded (tracking disabled)"
            ));
        }

        try {
            // Extract guest information
            String guestIp = getClientIp(request);
            String userAgent = request.getHeader("User-Agent");
            String guestDevice = extractDeviceInfo(userAgent);

            logger.info("   Guest IP: {}", guestIp);
            logger.info("   Device: {}", guestDevice);

            // Send notifications asynchronously
            notificationService.sendPropertyViewNotification(propertyId, guestIp, guestDevice);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Property view tracked successfully"
            ));

        } catch (Exception e) {
            logger.error("❌ Error tracking property view: {}", e.getMessage(), e);
            // Return success even if tracking fails (don't disrupt user experience)
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Property view recorded"
            ));
        }
    }

    /**
     * Get client IP address
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");

        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_CLIENT_IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("HTTP_X_FORWARDED_FOR");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }

        // If multiple IPs, get the first one
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }

        return ip;
    }

    /**
     * Extract device information from User-Agent
     */
    private String extractDeviceInfo(String userAgent) {
        if (userAgent == null || userAgent.isEmpty()) {
            return "Unknown Device";
        }

        userAgent = userAgent.toLowerCase();

        if (userAgent.contains("mobile") || userAgent.contains("android")) {
            if (userAgent.contains("android")) {
                return "Android Mobile";
            }
            return "Mobile Device";
        } else if (userAgent.contains("iphone") || userAgent.contains("ipad")) {
            return userAgent.contains("ipad") ? "iPad" : "iPhone";
        } else if (userAgent.contains("windows")) {
            return "Windows PC";
        } else if (userAgent.contains("mac")) {
            return "Mac";
        } else if (userAgent.contains("linux")) {
            return "Linux";
        }

        return "Desktop";
    }
}