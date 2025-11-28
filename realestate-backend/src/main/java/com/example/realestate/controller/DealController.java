package com.example.realestate.controller;

import com.example.realestate.model.DealStatus;
import com.example.realestate.model.User;
import com.example.realestate.service.DealService;
import com.example.realestate.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/deals")
public class DealController {

    private static final Logger logger = LoggerFactory.getLogger(DealController.class);

    @Autowired
    private DealService dealService;

    @Autowired
    private com.example.realestate.repository.UserRepository userRepository;

    @Autowired
    private com.example.realestate.repository.DealStatusRepository dealStatusRepository;

    // ==================== ⭐ NEW: CHECK EXISTING DEAL FOR BUYER AND PROPERTY ====================
    /**
     * ⭐ CRITICAL: Check if a deal exists for a specific buyer-property combination
     * Endpoint: GET /api/deals/buyer/{buyerId}/property/{propertyId}
     * Returns: 200 OK with deal if exists, 404 NOT_FOUND if no deal (expected behavior)
     */
    @GetMapping("/buyer/{buyerId}/property/{propertyId}")
    public ResponseEntity<?> checkExistingDeal(
            @PathVariable Long buyerId,
            @PathVariable Long propertyId,
            Authentication authentication) {

        logger.info("🔍 Checking for existing deal - Buyer: {}, Property: {}", buyerId, propertyId);

        try {
            // Validate parameters
            if (buyerId == null || buyerId <= 0) {
                logger.warn("Invalid buyer ID provided: {}", buyerId);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid buyer ID is required"));
            }

            if (propertyId == null || propertyId <= 0) {
                logger.warn("Invalid property ID provided: {}", propertyId);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid property ID is required"));
            }

            // Check if deal exists
            java.util.Optional<DealStatus> existingDeal =
                    dealStatusRepository.findByPropertyIdAndBuyerId(propertyId, buyerId);

            if (existingDeal.isPresent()) {
                DealStatus deal = existingDeal.get();
                logger.info("✅ Found existing deal ID: {} (Stage: {})", deal.getId(), deal.getStage());

                // Convert to DTO
                DealDetailDTO dealDTO = convertToDetailDTO(deal);
                return ResponseEntity.ok(ApiResponse.success(dealDTO));
            } else {
                logger.info("ℹ️ No deal found for Buyer {} and Property {}", buyerId, propertyId);
                // Return 404 - this is EXPECTED behavior when no deal exists
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No deal found for this buyer and property"));
            }

        } catch (Exception e) {
            logger.error("❌ Error checking existing deal: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while checking for existing deal"));
        }
    }

    // ==================== GET DEALS BY USER AND ROLE (CORRECTED) ====================
    @GetMapping("/user/{userId}/role/{userRole}")
    public ResponseEntity<?> getDealsByUserAndRole(
            @PathVariable Long userId,
            @PathVariable String userRole,
            Authentication authentication) {
        logger.info("Deal Controller started");
        logger.info("Received request to fetch deals for user {} (Path role: '{}' - will be ignored)", userId, userRole);

        try {
            if (userId == null || userId <= 0) {
                logger.warn("Invalid user ID provided: {}", userId);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid user ID is required"));
            }

            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("❌ User not found with ID: {}", userId);
                        return new RuntimeException("User not found with ID: " + userId);
                    });

            String actualUserRole = currentUser.getRole().name();
            logger.info("Fetched user {} has actual role: {}", userId, actualUserRole);

            List<DealDetailDTO> deals = dealService.getDealsByRole(userId, actualUserRole);

            logger.info("✅ Found {} deals for user {} with actual role {}", deals.size(), userId, actualUserRole);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (RuntimeException e) {
            logger.error("❌ Error fetching deals for user {}: ", userId, e);
            if (e.getMessage().startsWith("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error fetching deals for user {}: ", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred"));
        }
    }

    // ==================== GET DEALS BY USER ID ONLY (SIMPLIFIED) ====================
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getDealsByUserId(
            @PathVariable Long userId,
            Authentication authentication) {

        logger.info("📊 Fetching deals for user {} (auto-detecting role)", userId);

        try {
            if (userId == null || userId <= 0) {
                logger.warn("Invalid user ID provided: {}", userId);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid user ID is required"));
            }

            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("❌ User not found with ID: {}", userId);
                        return new RuntimeException("User not found with ID: " + userId);
                    });

            String actualUserRole = currentUser.getRole().name();
            logger.info("✅ User {} has role: {}", userId, actualUserRole);

            List<DealDetailDTO> deals = dealService.getDealsByRole(userId, actualUserRole);

            logger.info("✅ Found {} deals for user {} with role {}", deals.size(), userId, actualUserRole);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (RuntimeException e) {
            logger.error("❌ Error fetching deals for user {}: ", userId, e);
            if (e.getMessage().startsWith("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error fetching deals for user {}: ", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred"));
        }
    }

    // ==================== CREATE DEAL WITH PRICE ====================
    @PostMapping("/create-with-price")
    public ResponseEntity<?> createDealWithPrice(
            @RequestBody CreateDealWithPriceRequestDto request,
            Authentication authentication) {

        Long agentId = request.getAgentId();
        logger.info("Creating deal with agreed price by Agent ID: {}", agentId);

        try {
            if (agentId == null || agentId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid agent ID is required (from auth or request)"));
            }

            User agentUser = userRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent user not found with ID: " + agentId));

            if (!agentUser.getRole().equals(User.UserRole.AGENT) &&
                    !agentUser.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("❌ User {} (Role: {}) attempted to create deal but is not an agent/admin.",
                        agentId, agentUser.getRole());
                return new ResponseEntity<>(
                        ApiResponse.error("Only agents or admins can create deals"),
                        HttpStatus.FORBIDDEN
                );
            }

            DealStatus deal = dealService.createDealWithPrice(request, agentId);
            DealDetailDTO dealDTO = convertToDetailDTO(deal);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(dealDTO));

        } catch (RuntimeException e) {
            logger.error("❌ Error creating deal with price: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error during deal creation: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred during deal creation."));
        }
    }

    // ==================== CREATE BASIC DEAL (WITH AGREED PRICE SUPPORT) ====================
    /**
     * ⭐ UPDATED: Now accepts agreedPrice parameter
     */
    @PostMapping("/create")
    public ResponseEntity<?> createDeal(@RequestBody CreateDealRequest request, Authentication authentication) {
        logger.info("📝 CREATE DEAL REQUEST - Property: {}, Buyer: {}, Agent: {}, AgreedPrice: {}",
                request.propertyId, request.buyerId, request.agentId, request.agreedPrice);

        try {
            if (request.propertyId == null || request.buyerId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Property ID and Buyer ID are required"));
            }

            // Check for existing deal first
            java.util.Optional<DealStatus> existingDeal =
                    dealStatusRepository.findByPropertyIdAndBuyerId(request.propertyId, request.buyerId);

            if (existingDeal.isPresent()) {
                logger.info("⚠️ Deal already exists for Property {} and Buyer {}",
                        request.propertyId, request.buyerId);
                DealDetailDTO dealDTO = convertToDetailDTO(existingDeal.get());
                // Return existing deal instead of error (user-friendly)
                return ResponseEntity.ok(ApiResponse.success(dealDTO));
            }

            // Create new deal with optional agreed price
            DealStatus deal = dealService.createDeal(
                    request.propertyId,
                    request.buyerId,
                    request.agentId,
                    request.agreedPrice // Now accepts agreed price
            );

            DealDTO dealDTO = convertToDTO(deal);
            logger.info("✅ Deal created successfully - Deal ID: {}", deal.getId());

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(dealDTO));

        } catch (RuntimeException e) {
            logger.error("❌ Error creating basic deal: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error creating basic deal: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred creating the deal."));
        }
    }

    // ==================== ADMIN DASHBOARD ====================
    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> getAdminDashboard(Authentication authentication) {
        logger.info("Fetching admin dashboard...");
        try {
            AdminDealDashboardDTO dashboard = dealService.getAdminDashboard();
            logger.info("✅ Admin dashboard generated");
            return ResponseEntity.ok(ApiResponse.success(dashboard));

        } catch (Exception e) {
            logger.error("❌ Error fetching admin dashboard: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate admin dashboard."));
        }
    }

    // ==================== AGENT PERFORMANCE METRICS (ADMIN ONLY) ====================
    @GetMapping("/admin/agents-performance")
    public ResponseEntity<?> getAgentPerformance(Authentication authentication) {
        logger.info("Fetching agent performance metrics...");
        try {
            List<AgentPerformanceDTO> performance = dealService.getAgentPerformanceMetrics();
            logger.info("✅ Agent performance metrics fetched for {} agents", performance.size());
            return ResponseEntity.ok(ApiResponse.success(performance));

        } catch (Exception e) {
            logger.error("❌ Error fetching performance metrics: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch agent performance metrics."));
        }
    }

    // ==================== GET DEALS BY SPECIFIC AGENT (ADMIN ONLY) ====================
    @GetMapping("/admin/agent/{agentId}")
    public ResponseEntity<?> getDealsByAgent(
            @PathVariable Long agentId,
            Authentication authentication) {

        logger.info("Admin fetching deals for agent ID: {}", agentId);
        try {
            if (agentId == null || agentId <= 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Valid Agent ID required."));
            }

            List<DealDetailDTO> deals = dealService.getDealsByAgentForAdmin(agentId);
            logger.info("✅ Found {} deals for agent {}", deals.size(), agentId);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching agent deals for agent {}: ", agentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch deals for the specified agent."));
        }
    }

    // ==================== GET DEAL BY ID ====================
    @GetMapping("/{dealId}")
    public ResponseEntity<?> getDeal(@PathVariable Long dealId) {
        logger.info("Fetching deal details for Deal ID: {}", dealId);
        try {
            DealStatus deal = dealService.getDealById(dealId);
            DealDetailDTO dealDTO = convertToDetailDTO(deal);
            if (dealDTO == null) {
                logger.error("❌ Failed to convert Deal {} to DTO.", dealId);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error("Error retrieving deal details."));
            }
            return ResponseEntity.ok(ApiResponse.success(dealDTO));
        } catch (RuntimeException e) {
            logger.error("❌ Error fetching deal {}: {}", dealId, e.getMessage());
            if (e.getMessage().contains("Deal not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Deal not found with ID: " + dealId));
            }
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error fetching deal {}: ", dealId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred fetching the deal."));
        }
    }

    // ==================== UPDATE DEAL STAGE ====================
    @PutMapping("/{dealId}/stage")
    public ResponseEntity<?> updateDealStage(
            @PathVariable Long dealId,
            @RequestBody UpdateDealStageRequest request,
            Authentication authentication) {

        logger.info("Request to update Deal ID: {} to Stage: '{}'", dealId, request.stage);
        String username = (authentication != null && authentication.getName() != null)
                ? authentication.getName()
                : "system-debug";

        try {
            DealStatus.DealStage stageEnum;
            try {
                stageEnum = DealStatus.DealStage.valueOf(request.stage.trim().toUpperCase());
            } catch (IllegalArgumentException | NullPointerException e) {
                logger.error("❌ Invalid stage value provided: '{}'", request.stage);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid stage value: " + request.stage));
            }

            DealStatus updatedDeal = dealService.updateDealStage(
                    dealId,
                    stageEnum,
                    request.notes,
                    username
            );

            DealDetailDTO dealDTO = convertToDetailDTO(updatedDeal);
            logger.info("✅ Deal {} stage updated successfully to {}", dealId, stageEnum.name());
            return ResponseEntity.ok(ApiResponse.success(dealDTO));

        } catch (RuntimeException e) {
            logger.error("❌ Error updating deal stage for deal {}: {}", dealId, e.getMessage());
            if (e.getMessage().contains("Deal not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            if (e.getMessage().contains("Cannot move deal to a previous stage")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error updating deal stage for deal {}: ", dealId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred updating the deal stage."));
        }
    }

    // ==================== GET DEALS BY AGENT ====================
    @GetMapping("/agent/{agentId}")
    public ResponseEntity<?> getAgentDeals(@PathVariable Long agentId, Authentication authentication) {
        logger.info("Fetching deals for agent ID: {}", agentId);
        try {
            if (agentId == null || agentId <= 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Valid Agent ID required."));
            }
            List<DealStatus> deals = dealService.getDealsForAgent(agentId);
            List<DealDTO> dealDTOs = deals.stream()
                    .map(this::convertToDTO)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            logger.info("✅ Found {} deals for agent {}", dealDTOs.size(), agentId);
            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

        } catch (Exception e) {
            logger.error("❌ Error fetching agent deals for agent {}: ", agentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch deals for the specified agent."));
        }
    }

    // ==================== GET DEALS BY STAGE (ADMIN ONLY) ====================
    @GetMapping("/stage/{stage}")
    public ResponseEntity<?> getDealsByStage(
            @PathVariable String stage,
            Authentication authentication) {

        logger.info("Admin fetching deals by stage: {}", stage);
        try {
            DealStatus.DealStage dealStage;
            try {
                dealStage = DealStatus.DealStage.valueOf(stage.trim().toUpperCase());
            } catch (IllegalArgumentException | NullPointerException e) {
                logger.error("❌ Invalid stage value provided: '{}'", stage);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid stage value: " + stage));
            }

            List<DealStatus> deals = dealService.getDealsByStage(dealStage);
            List<DealDetailDTO> dealDTOs = deals.stream()
                    .map(this::convertToDetailDTO)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            logger.info("✅ Found {} deals in stage: {}", dealDTOs.size(), stage);
            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

        } catch (Exception e) {
            logger.error("❌ Error fetching deals by stage '{}': ", stage, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch deals by stage."));
        }
    }

    // ==================== GET STATS BY STAGE (ADMIN ONLY) ====================
    @GetMapping("/stats/by-stage")
    public ResponseEntity<?> getStatsByStage(Authentication authentication) {
        logger.info("Admin fetching deal stats by stage...");
        try {
            Map<String, Long> statsByStage = new HashMap<>();
            for (DealStatus.DealStage stageEnum : DealStatus.DealStage.values()) {
                Long count = dealService.getCountByStage(stageEnum);
                statsByStage.put(stageEnum.name(), count != null ? count : 0L);
            }

            logger.info("✅ Stats by stage calculated");
            return ResponseEntity.ok(ApiResponse.success(statsByStage));

        } catch (Exception e) {
            logger.error("❌ Error fetching stats by stage: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch deal statistics."));
        }
    }

    // ==================== GET DEALS BY BUYER ID ====================
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<?> getBuyerDeals(@PathVariable Long buyerId, Authentication authentication) {
        logger.info("Fetching deals for buyer ID: {}", buyerId);
        try {
            if (buyerId == null || buyerId <= 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Valid Buyer ID required."));
            }
            List<DealStatus> deals = dealService.getBuyerDeals(buyerId);
            List<DealDTO> dealDTOs = deals.stream()
                    .map(this::convertToDTO)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            logger.info("✅ Found {} deals for buyer {}", dealDTOs.size(), buyerId);
            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

        } catch (Exception e) {
            logger.error("❌ Error fetching buyer deals for buyer {}: ", buyerId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch deals for the specified buyer."));
        }
    }

    // ==================== GET DEALS BY PROPERTY ID ====================
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> getDealsByProperty(@PathVariable Long propertyId) {
        logger.info("Fetching deals for property ID: {}", propertyId);
        try {
            if (propertyId == null || propertyId <= 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Valid Property ID required."));
            }
            List<DealDetailDTO> dealDTOs = dealService.getDealsForPropertyAsDTO(propertyId);

            logger.info("✅ Found {} deals for property {}", dealDTOs.size(), propertyId);
            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

        } catch (Exception e) {
            logger.error("❌ Error fetching deals for property {}: ", propertyId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch deals for the specified property."));
        }
    }

    // ==================== DELETE DEAL BY ID ====================
    @DeleteMapping("/{dealId}")
    public ResponseEntity<?> deleteDeal(
            @PathVariable Long dealId,
            Authentication authentication) {

        logger.info("🗑️ DELETE DEAL REQUEST - Deal ID: {}", dealId);

        try {
            DealStatus deal = dealService.getDealById(dealId);

            logger.info("Deleting deal {} for property {} (Buyer: {}, Agent: {})",
                    dealId,
                    deal.getProperty() != null ? deal.getProperty().getId() : "N/A",
                    deal.getBuyer() != null ? deal.getBuyer().getId() : "N/A",
                    deal.getAgent() != null ? deal.getAgent().getId() : "N/A");

            dealService.deleteDeal(dealId);

            logger.info("✅ Deal {} deleted successfully", dealId);

            return ResponseEntity.ok(ApiResponse.success("Deal deleted successfully"));

        } catch (RuntimeException e) {
            logger.error("❌ Error deleting deal {}: {}", dealId, e.getMessage());
            if (e.getMessage().contains("Deal not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Deal not found with ID: " + dealId));
            }
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error deleting deal {}: ", dealId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred while deleting the deal."));
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Converts DealStatus entity to DealDetailDTO with all fields
     */
    private DealDetailDTO convertToDetailDTO(DealStatus deal) {
        if (deal == null) return null;
        DealDetailDTO dto = new DealDetailDTO();

        dto.setDealId(deal.getId());
        dto.setStage(deal.getStage() != null ? deal.getStage().name() : null);
        dto.setCurrentStage(deal.getStage() != null ? deal.getStage().name() : null);
        dto.setAgreedPrice(deal.getAgreedPrice());
        dto.setNotes(deal.getNotes());
        dto.setCreatedAt(deal.getCreatedAt());
        dto.setUpdatedAt(deal.getUpdatedAt());
        dto.setLastUpdatedBy(deal.getLastUpdatedBy());

        // Document upload flags
        dto.setAgreementUploaded(deal.isAgreementUploaded());
        dto.setRegistrationUploaded(deal.isRegistrationUploaded());

        // Stage Timestamps
        dto.setInquiryDate(deal.getInquiryDate());
        dto.setShortlistDate(deal.getShortlistDate());
        dto.setNegotiationDate(deal.getNegotiationDate());
        dto.setAgreementDate(deal.getAgreementDate());
        dto.setRegistrationDate(deal.getRegistrationDate());
        dto.setPaymentDate(deal.getPaymentDate());
        dto.setCompletedDate(deal.getCompletedDate());

        if (deal.getProperty() != null) {
            dto.setPropertyId(deal.getProperty().getId());
            dto.setPropertyTitle(deal.getProperty().getTitle());
            dto.setPropertyPrice(deal.getProperty().getPrice());
            dto.setPropertyCity(deal.getProperty().getCity());

            if (deal.getProperty().getUser() != null) {
                User seller = deal.getProperty().getUser();
                dto.setSellerId(seller.getId());
                dto.setSellerName(seller.getFirstName() + " " + seller.getLastName());
                dto.setSellerEmail(seller.getEmail());
                dto.setSellerMobile(seller.getMobileNumber());
            }
        }

        if (deal.getBuyer() != null) {
            dto.setBuyerId(deal.getBuyer().getId());
            dto.setBuyerName(deal.getBuyer().getFirstName() + " " + deal.getBuyer().getLastName());
            dto.setBuyerEmail(deal.getBuyer().getEmail());
            dto.setBuyerMobile(deal.getBuyer().getMobileNumber());
        }

        if (deal.getAgent() != null) {
            dto.setAgentId(deal.getAgent().getId());
            dto.setAgentName(deal.getAgent().getFirstName() + " " + deal.getAgent().getLastName());
            dto.setAgentEmail(deal.getAgent().getEmail());
            dto.setAgentMobile(deal.getAgent().getMobileNumber());
        }

        return dto;
    }

    /**
     * Converts DealStatus entity to simpler DealDTO
     */
    private DealDTO convertToDTO(DealStatus deal) {
        if (deal == null) return null;
        DealDTO dto = new DealDTO();

        dto.setId(deal.getId());
        dto.setDealId(deal.getId());
        dto.setStage(deal.getStage() != null ? deal.getStage().name() : null);
        dto.setCurrentStage(deal.getStage() != null ? deal.getStage().name() : null);
        dto.setNotes(deal.getNotes());
        dto.setCreatedAt(deal.getCreatedAt());
        dto.setUpdatedAt(deal.getUpdatedAt());
        dto.setLastUpdatedBy(deal.getLastUpdatedBy());

        if (deal.getProperty() != null) {
            dto.setPropertyId(deal.getProperty().getId());
            dto.setProperty(new DealDTO.PropertyInfo(
                    deal.getProperty().getId(),
                    deal.getProperty().getTitle(),
                    deal.getProperty().getCity(),
                    deal.getProperty().getPrice() != null ? deal.getProperty().getPrice().doubleValue() : 0.0,
                    deal.getProperty().getBedrooms() != null ? deal.getProperty().getBedrooms().intValue() : null,
                    deal.getProperty().getImageUrl()
            ));
        }

        if (deal.getBuyer() != null) {
            dto.setBuyerId(deal.getBuyer().getId());
            dto.setBuyer(new DealDTO.UserInfo(
                    deal.getBuyer().getId(),
                    deal.getBuyer().getFirstName(),
                    deal.getBuyer().getLastName(),
                    deal.getBuyer().getEmail(),
                    deal.getBuyer().getMobileNumber()
            ));
        }

        if (deal.getAgent() != null) {
            dto.setAgentId(deal.getAgent().getId());
            dto.setAgent(new DealDTO.UserInfo(
                    deal.getAgent().getId(),
                    deal.getAgent().getFirstName(),
                    deal.getAgent().getLastName(),
                    deal.getAgent().getEmail(),
                    deal.getAgent().getMobileNumber()
            ));
        }

        return dto;
    }

    // ==================== INNER DTOs ====================

    /**
     * Request body for basic deal creation
     * ⭐ UPDATED: Now includes agreedPrice field
     */
    static class CreateDealRequest {
        public Long propertyId;
        public Long buyerId;
        public Long agentId;
        public Double agreedPrice; // ⭐ NEW: Optional agreed price

        public Long getPropertyId() { return propertyId; }
        public Long getBuyerId() { return buyerId; }
        public Long getAgentId() { return agentId; }
        public Double getAgreedPrice() { return agreedPrice; }

        public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }
        public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }
        public void setAgentId(Long agentId) { this.agentId = agentId; }
        public void setAgreedPrice(Double agreedPrice) { this.agreedPrice = agreedPrice; }
    }

    /**
     * Request body for updating deal stage
     */
    static class UpdateDealStageRequest {
        private String stage;
        private String notes;
        private String username;

        public String getStage() { return stage; }
        public String getNotes() { return notes; }
        public String getUsername() { return username; }

        public void setStage(String stage) { this.stage = stage; }
        public void setNotes(String notes) { this.notes = notes; }
        public void setUsername(String username) { this.username = username; }
    }
}