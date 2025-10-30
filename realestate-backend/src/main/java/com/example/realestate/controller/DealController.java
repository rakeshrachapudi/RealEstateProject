package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.model.DealStatus;
import com.example.realestate.model.User;
import com.example.realestate.repository.UserRepository;
import com.example.realestate.service.DealService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/deals")
public class DealController {

    private static final Logger logger = LoggerFactory.getLogger(DealController.class);

    @Autowired
    private DealService dealService;

    @Autowired
    private UserRepository userRepository;

    // ==================== DELETE DEAL (AGENT/ADMIN) ====================
    /**
     * Delete a deal and all associated S3 documents
     * Only accessible by agents and admins
     */
    @DeleteMapping("/{dealId}")
    public ResponseEntity<?> deleteDeal(
            @PathVariable Long dealId,
            Authentication authentication) {

        logger.info("🗑️ DELETE request received for Deal ID: {}", dealId);

        try {
            // Verify authentication
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("❌ Unauthorized delete attempt for Deal ID: {}", dealId);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            // Get the authenticated user
            String username = authentication.getName();
            User currentUser = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Verify user is AGENT or ADMIN
            if (!currentUser.getRole().equals(User.UserRole.AGENT) &&
                    !currentUser.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("❌ Non-agent/admin user {} attempted to delete Deal ID: {}", username, dealId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only agents and admins can delete deals"));
            }

            // Call service to delete deal with S3 cleanup
            Map<String, Object> deletionResult = dealService.deleteDealCascade(dealId);

            if ((Boolean) deletionResult.get("success")) {
                logger.info("✅ Deal {} deleted successfully by user: {}", dealId, username);
                return ResponseEntity.ok(ApiResponse.success(
                        "Deal deleted successfully",
                        deletionResult
                ));
            } else {
                logger.warn("⚠️ Deal {} not found", dealId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Deal not found"));
            }

        } catch (Exception e) {
            logger.error("❌ Error deleting deal {}: ", dealId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete deal: " + e.getMessage()));
        }
    }

    // ==================== UPDATE BUYER (AGENT/ADMIN) ====================
    /**
     * Update the buyer for a deal
     */
    @PutMapping("/{dealId}/buyer")
    public ResponseEntity<?> updateBuyer(
            @PathVariable Long dealId,
            @RequestBody Map<String, Long> request,
            Authentication authentication) {

        logger.info("🔄 UPDATE buyer request for Deal ID: {}", dealId);

        try {
            // Verify authentication and role
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = authentication.getName();
            User currentUser = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!currentUser.getRole().equals(User.UserRole.AGENT) &&
                    !currentUser.getRole().equals(User.UserRole.ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only agents and admins can update deals"));
            }

            Long newBuyerId = request.get("buyerId");
            if (newBuyerId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Buyer ID is required"));
            }

            DealStatus updatedDeal = dealService.updateBuyer(dealId, newBuyerId);
            logger.info("✅ Buyer updated for Deal ID: {}", dealId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Buyer updated successfully",
                    updatedDeal
            ));

        } catch (Exception e) {
            logger.error("❌ Error updating buyer for deal {}: ", dealId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update buyer: " + e.getMessage()));
        }
    }

    // ==================== UPDATE SELLER (AGENT/ADMIN) ====================
    /**
     * Update the seller (property owner) for a deal
     * This updates the property owner, which affects the deal
     */
    @PutMapping("/{dealId}/seller")
    public ResponseEntity<?> updateSeller(
            @PathVariable Long dealId,
            @RequestBody Map<String, Long> request,
            Authentication authentication) {

        logger.info("🔄 UPDATE seller request for Deal ID: {}", dealId);

        try {
            // Verify authentication and role
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = authentication.getName();
            User currentUser = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!currentUser.getRole().equals(User.UserRole.AGENT) &&
                    !currentUser.getRole().equals(User.UserRole.ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only agents and admins can update deals"));
            }

            Long newSellerId = request.get("sellerId");
            if (newSellerId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Seller ID is required"));
            }

            DealStatus updatedDeal = dealService.updateSeller(dealId, newSellerId);
            logger.info("✅ Seller updated for Deal ID: {}", dealId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Seller updated successfully",
                    updatedDeal
            ));

        } catch (Exception e) {
            logger.error("❌ Error updating seller for deal {}: ", dealId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update seller: " + e.getMessage()));
        }
    }

    // ==================== UPDATE AGENT (ADMIN) ====================
    /**
     * Reassign a deal to a different agent
     */
    @PutMapping("/{dealId}/agent")
    public ResponseEntity<?> updateAgent(
            @PathVariable Long dealId,
            @RequestBody Map<String, Long> request,
            Authentication authentication) {

        logger.info("🔄 UPDATE agent request for Deal ID: {}", dealId);

        try {
            // Verify authentication and role
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = authentication.getName();
            User currentUser = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Only admins can reassign agents
            if (!currentUser.getRole().equals(User.UserRole.ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only admins can reassign agents"));
            }

            Long newAgentId = request.get("agentId");
            if (newAgentId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Agent ID is required"));
            }

            DealStatus updatedDeal = dealService.updateAgent(dealId, newAgentId);
            logger.info("✅ Agent updated for Deal ID: {}", dealId);

            return ResponseEntity.ok(ApiResponse.success(
                    "Agent updated successfully",
                    updatedDeal
            ));

        } catch (Exception e) {
            logger.error("❌ Error updating agent for deal {}: ", dealId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update agent: " + e.getMessage()));
        }
    }

    // ==================== GET ALL DEALS (AGENT/ADMIN) ====================
    @GetMapping
    public ResponseEntity<?> getAllDeals(Authentication authentication) {
        logger.info("📋 Fetching all deals");
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }

            String username = authentication.getName();
            User currentUser = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!currentUser.getRole().equals(User.UserRole.AGENT) &&
                    !currentUser.getRole().equals(User.UserRole.ADMIN)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("Only agents and admins can view all deals"));
            }

            var deals = dealService.getAllDeals();
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching deals: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch deals"));
        }
    }
}