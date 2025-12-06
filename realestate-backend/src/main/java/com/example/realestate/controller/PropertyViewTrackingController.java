package com.example.realestate.controller;

import com.example.realestate.model.Property;
import com.example.realestate.model.PropertyViewTracking;
import com.example.realestate.repository.PropertyRepository;
import com.example.realestate.repository.PropertyViewTrackingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for tracking property views.
 * ✅ ONLY tracks BUYER views (users with 0 properties)
 * ❌ Ignores SELLER views (users with 1+ properties), ADMIN, AGENT, BROKER
 */
@RestController
@RequestMapping("/api/property-tracking")
public class PropertyViewTrackingController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyViewTrackingController.class);

    @Autowired
    private PropertyViewTrackingRepository viewTrackingRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Value("${property.tracking.enabled:true}")
    private boolean trackingEnabled;

    @Value("${frontend.base.url:https://propertydealz.in}")
    private String frontendBaseUrl;

    /**
     * Track property view - ONLY saves BUYER views to database for batch processing.
     * POST /api/property-tracking/view/{propertyId}
     *
     * BUYER IDENTIFICATION LOGIC:
     * - Role = "USER" AND propertyCount = 0 → BUYER (SAVE)
     * - Role = "USER" AND propertyCount > 0 → SELLER (IGNORE)
     * - Role = "ADMIN", "AGENT", "BROKER" → IGNORE
     */
    @PostMapping("/view/{propertyId}")
    public ResponseEntity<Map<String, Object>> trackPropertyView(
            @PathVariable Long propertyId,
            @RequestBody Map<String, Object> requestBody
    ) {
        Map<String, Object> response = new HashMap<>();

        try {
            if (!trackingEnabled) {
                logger.info("⚠️ Property tracking is disabled in configuration");
                response.put("success", false);
                response.put("message", "Property tracking is disabled");
                return ResponseEntity.ok(response);
            }

            // Extract user data from request
            Long userId = getLongFromMap(requestBody, "userId");
            String userName = getStringFromMap(requestBody, "userName");
            String userMobile = getStringFromMap(requestBody, "userMobile");
            String userEmail = getStringFromMap(requestBody, "userEmail");
            String userRole = getStringFromMap(requestBody, "userRole");

            if (userId == null) {
                logger.warn("⚠️ Missing userId in request body");
                response.put("success", false);
                response.put("message", "Missing userId");
                return ResponseEntity.badRequest().body(response);
            }

            if (userRole == null || userRole.isEmpty()) {
                logger.warn("⚠️ Missing userRole in request body");
                response.put("success", false);
                response.put("message", "Missing userRole");
                return ResponseEntity.badRequest().body(response);
            }

            logger.info("📊 Received property view - Property ID: {}, User: {} ({}), Role: {}",
                    propertyId, userName, userEmail, userRole);

            // === CRITICAL FILTERING LOGIC ===

            // 1. Check if Admin, Agent, or Broker - IGNORE immediately
            if ("ADMIN".equalsIgnoreCase(userRole) ||
                    "AGENT".equalsIgnoreCase(userRole) ||
                    "BROKER".equalsIgnoreCase(userRole)) {

                logger.info("ℹ️ {} view detected - Ignoring (not saving)", userRole);
                response.put("success", true);
                response.put("message", "View ignored - only buyer views are tracked");
                response.put("saved", false);
                response.put("userRole", userRole);
                response.put("reason", "Only BUYER views trigger notifications");
                return ResponseEntity.ok(response);
            }

            // 2. If USER role - check property count to determine BUYER vs SELLER
            if ("USER".equalsIgnoreCase(userRole)) {
                // Check how many properties this user has posted
                List<Property> userProperties = propertyRepository.findByUserId(userId);
                int propertyCount = userProperties.size();

                logger.info("🔍 USER role detected - Checking property count: {} properties", propertyCount);

                // If user has ANY properties → SELLER (ignore)
                if (propertyCount > 0) {
                    logger.info("ℹ️ User is a SELLER (has {} propert{}) - Ignoring view",
                            propertyCount, propertyCount == 1 ? "y" : "ies");
                    response.put("success", true);
                    response.put("message", "View ignored - user is a seller/broker");
                    response.put("saved", false);
                    response.put("userRole", "SELLER");
                    response.put("propertyCount", propertyCount);
                    response.put("reason", "Only BUYER views trigger notifications");
                    return ResponseEntity.ok(response);
                }

                // If user has ZERO properties → BUYER (continue to save)
                logger.info("✅ User is a BUYER (0 properties) - Will track view");
            }

            // Fetch property details
            Property property = propertyRepository.findById(propertyId)
                    .orElse(null);

            if (property == null) {
                logger.warn("⚠️ Property not found: {}", propertyId);
                response.put("success", false);
                response.put("message", "Property not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Check if user is the property owner (additional safety check)
            if (property.getUser() != null && property.getUser().getId().equals(userId)) {
                logger.info("ℹ️ User is property owner - skipping tracking");
                response.put("success", true);
                response.put("message", "Property owner - tracking skipped");
                response.put("saved", false);
                return ResponseEntity.ok(response);
            }

            // Check for duplicate view (same buyer + property, not yet notified)
            boolean alreadyTracked = viewTrackingRepository
                    .existsByPropertyIdAndBuyerIdAndNotificationSentFalse(propertyId, userId);

            if (alreadyTracked) {
                logger.info("ℹ️ View already tracked for buyer {} on property {}", userName, propertyId);
                response.put("success", true);
                response.put("message", "View already tracked");
                response.put("saved", false);
                response.put("userRole", "BUYER");
                return ResponseEntity.ok(response);
            }

            // Build property view tracking record
            PropertyViewTracking tracking = PropertyViewTracking.builder()
                    .propertyId(propertyId)
                    .propertyTitle(property.getTitle())
                    .propertyArea(getAreaName(property.getArea()))
                    .propertyCity(property.getCity())
                    .propertyPrice(formatPrice(property.getPrice()))
                    .propertyUrl(frontendBaseUrl + "/property/" + propertyId)
                    .buyerId(userId)
                    .buyerName(userName)
                    .buyerMobile(userMobile)
                    .buyerEmail(userEmail)
                    .ownerName(getOwnerName(property))
                    .ownerPhone(getOwnerPhone(property))
                    .ownerEmail(getOwnerEmail(property))
                    .userType("buyer") // Always "buyer" since we only save buyer views
                    .propertyCount(0) // Buyer always has 0 properties
                    .viewedAt(LocalDateTime.now())
                    .notificationSent(false)
                    .build();

            // Save to database
            PropertyViewTracking saved = viewTrackingRepository.save(tracking);
            logger.info("✅ BUYER view saved to database - ID: {}", saved.getId());

            // Build response
            response.put("success", true);
            response.put("message", "Buyer view tracked successfully");
            response.put("saved", true);
            response.put("trackingId", saved.getId());
            response.put("userRole", "BUYER");
            response.put("viewedAt", saved.getViewedAt().toString());
            response.put("note", "Buyer interest recorded - notification will be sent in next batch");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("❌ Error tracking property view", e);
            response.put("success", false);
            response.put("message", "Error tracking property view: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get tracking statistics.
     * GET /api/property-tracking/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getTrackingStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            Long pendingCount = viewTrackingRepository.countPendingNotifications();
            Long totalCount = viewTrackingRepository.count();

            stats.put("pendingNotifications", pendingCount);
            stats.put("totalBuyerViews", totalCount);
            stats.put("notifiedViews", totalCount - pendingCount);
            stats.put("trackingEnabled", trackingEnabled);
            stats.put("filterLogic", "propertyCount == 0 → BUYER (save), propertyCount > 0 → SELLER (ignore)");

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error getting tracking stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(stats);
        }
    }

    /**
     * Get property view history.
     * GET /api/property-tracking/property/{propertyId}
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<PropertyViewTracking>> getPropertyViews(@PathVariable Long propertyId) {
        try {
            List<PropertyViewTracking> views = viewTrackingRepository
                    .findByPropertyIdOrderByViewedAtDesc(propertyId);
            return ResponseEntity.ok(views);
        } catch (Exception e) {
            logger.error("Error getting property views", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint.
     * GET /api/property-tracking/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("trackingEnabled", trackingEnabled);
        health.put("filteringLogic", "BUYER (propertyCount=0) ONLY");
        health.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }

    // Helper methods
    private String getAreaName(Object areaObj) {
        if (areaObj == null) return "Unknown Area";
        try {
            // If Area object, try to get areaName property
            return areaObj.getClass().getMethod("getAreaName").invoke(areaObj).toString();
        } catch (Exception e) {
            return areaObj.toString();
        }
    }

    private String formatPrice(Object priceObj) {
        if (priceObj == null) return "Price not available";
        try {
            double price = Double.parseDouble(priceObj.toString());
            if (price >= 10000000) {
                return String.format("₹%.2f Cr", price / 10000000);
            } else if (price >= 100000) {
                return String.format("₹%.2f L", price / 100000);
            } else {
                return String.format("₹%.2f", price);
            }
        } catch (Exception e) {
            return priceObj.toString();
        }
    }

    private String getOwnerName(Property property) {
        if (property.getUser() == null) return "Owner";
        String firstName = property.getUser().getFirstName() != null ? property.getUser().getFirstName() : "";
        String lastName = property.getUser().getLastName() != null ? property.getUser().getLastName() : "";
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? "Owner" : fullName;
    }

    private String getOwnerPhone(Property property) {
        if (property.getUser() == null || property.getUser().getMobileNumber() == null) {
            return "";
        }
        return property.getUser().getMobileNumber();
    }

    private String getOwnerEmail(Property property) {
        if (property.getUser() == null || property.getUser().getEmail() == null) {
            return "";
        }
        return property.getUser().getEmail();
    }

    private Long getLongFromMap(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value == null) return null;
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String getStringFromMap(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : "";
    }
}