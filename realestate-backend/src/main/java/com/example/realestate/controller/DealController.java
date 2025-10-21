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
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deals")
public class DealController {

    private static final Logger logger = LoggerFactory.getLogger(DealController.class);

    @Autowired
    private DealService dealService;

    @Autowired
    private com.example.realestate.repository.UserRepository userRepository;

    // ==================== GET DEALS BY USER AND ROLE ====================
    @GetMapping("/user/{userId}/role/{userRole}")
    public ResponseEntity<?> getDealsByUserAndRole(
            @PathVariable Long userId,
            @PathVariable String userRole,
            Authentication authentication) {

        logger.info("Fetching deals for user {} with role {}", userId, userRole);

        try {
            // Validate userId
            if (userId == null || userId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid user ID is required"));
            }

            // Fetch user by ID
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("❌ User not found with ID: {}", userId);
                        return new RuntimeException("User not found with ID: " + userId);
                    });

            // Validate role parameter
            if (!isValidRole(userRole)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid role: " + userRole));
            }

            // Get deals by role
            List<DealDetailDTO> deals = dealService.getDealsByRole(userId, userRole);

            logger.info("✅ Found {} deals for {} user {}", deals.size(), userRole, userId);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching deals: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== CREATE DEAL WITH PRICE ====================
    @PostMapping("/create-with-price")
    public ResponseEntity<?> createDealWithPrice(
            @RequestBody CreateDealWithPriceRequestDto request,
            Authentication authentication) {

        logger.info("Creating deal with agreed price");

        try {
            // Extract agent ID from request
            if (request.getAgentId() == null || request.getAgentId() <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid agent ID is required"));
            }

            // Fetch user by ID
            User currentUser = userRepository.findById(request.getAgentId())
                    .orElseThrow(() -> {
                        logger.error("❌ User not found with ID: {}", request.getAgentId());
                        return new RuntimeException("User not found with ID: " + request.getAgentId());
                    });

            // Verify only AGENT can create deals
            if (!currentUser.getRole().equals(User.UserRole.AGENT) &&
                    !currentUser.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("❌ User {} attempted to create deal but is not an agent. Role: {}",
                        currentUser.getId(), currentUser.getRole());
                return new ResponseEntity<>(
                        ApiResponse.error("Only agents can create deals"),
                        HttpStatus.FORBIDDEN
                );
            }

            // Create deal with current authenticated agent
            DealStatus deal = dealService.createDealWithPrice(request, currentUser.getId());

            // Convert to detail DTO
            DealDetailDTO dealDTO = convertToDetailDTO(deal);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(dealDTO));

        } catch (RuntimeException e) {
            logger.error("❌ Error creating deal with price: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred"));
        }
    }

    // ==================== GET MY DEALS BY ROLE ====================
    @GetMapping("/my-deals")
    public ResponseEntity<?> getMyDeals(
            @RequestParam String userRole,
            @RequestParam Long userId,
            Authentication authentication) {

        logger.info("Fetching deals for user {} with role: {}", userId, userRole);

        try {
            // Validate userId
            if (userId == null || userId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid user ID is required"));
            }

            // Fetch user by ID
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("❌ User not found with ID: {}", userId);
                        return new RuntimeException("User not found with ID: " + userId);
                    });

            logger.debug("✅ Found user: {} with role: {}", currentUser.getId(), currentUser.getRole());

            // Validate role parameter
            if (!isValidRole(userRole)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid role: " + userRole));
            }

            // Get deals by role
            List<DealDetailDTO> deals = dealService.getDealsByRole(currentUser.getId(), userRole);

            logger.info("✅ Found {} deals for {} user {}", deals.size(), userRole, currentUser.getId());
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching deals: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== ADMIN DASHBOARD ====================
    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> getAdminDashboard(
            @RequestParam Long userId,
            Authentication authentication) {
        logger.info("Fetching admin dashboard for user {}", userId);

        try {
            // Validate userId
            if (userId == null || userId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid user ID is required"));
            }

            // Fetch user by ID
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("❌ User not found with ID: {}", userId);
                        return new RuntimeException("User not found with ID: " + userId);
                    });

            // Verify ADMIN role only
            if (!currentUser.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("❌ User {} attempted to access admin dashboard but is not admin. Role: {}",
                        userId, currentUser.getRole());
                return new ResponseEntity<>(
                        ApiResponse.error("Only admins can access this resource"),
                        HttpStatus.FORBIDDEN
                );
            }

            AdminDealDashboardDTO dashboard = dealService.getAdminDashboard();
            logger.info("✅ Admin dashboard generated");
            return ResponseEntity.ok(ApiResponse.success(dashboard));

        } catch (Exception e) {
            logger.error("❌ Error fetching admin dashboard: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== AGENT PERFORMANCE METRICS ====================
    @GetMapping("/admin/agents-performance")
    public ResponseEntity<?> getAgentPerformance(
            @RequestParam Long userId,
            Authentication authentication) {
        logger.info("Fetching agent performance metrics for user {}", userId);

        try {
            // Validate userId
            if (userId == null || userId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid user ID is required"));
            }

            // Fetch user by ID
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("❌ User not found with ID: {}", userId);
                        return new RuntimeException("User not found with ID: " + userId);
                    });

            // Verify ADMIN role only
            if (!currentUser.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("❌ User {} attempted to access performance metrics but is not admin", userId);
                return new ResponseEntity<>(
                        ApiResponse.error("Only admins can access this resource"),
                        HttpStatus.FORBIDDEN
                );
            }

            List<AgentPerformanceDTO> performance = dealService.getAgentPerformanceMetrics();
            logger.info("✅ Agent performance metrics fetched for {} agents", performance.size());
            return ResponseEntity.ok(ApiResponse.success(performance));

        } catch (Exception e) {
            logger.error("❌ Error fetching performance metrics: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET DEALS BY AGENT (ADMIN) ====================
    @GetMapping("/admin/agent/{agentId}")
    public ResponseEntity<?> getDealsByAgent(
            @PathVariable Long agentId,
            @RequestParam Long userId,
            Authentication authentication) {

        logger.info("Fetching deals for agent {} (Admin view) requested by user {}", agentId, userId);

        try {
            // Validate userId
            if (userId == null || userId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid user ID is required"));
            }

            // Fetch user by ID
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("❌ User not found with ID: {}", userId);
                        return new RuntimeException("User not found with ID: " + userId);
                    });

            // Verify ADMIN role only
            if (!currentUser.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("❌ User {} attempted to access agent deals but is not admin", userId);
                return new ResponseEntity<>(
                        ApiResponse.error("Only admins can access this resource"),
                        HttpStatus.FORBIDDEN
                );
            }

            List<DealDetailDTO> deals = dealService.getDealsByAgentForAdmin(agentId);
            logger.info("✅ Found {} deals for agent {}", deals.size(), agentId);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching agent deals: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== EXISTING ENDPOINTS (KEPT) ====================

    @PostMapping("/create")
    public ResponseEntity<?> createDeal(@RequestBody CreateDealRequest request) {
        logger.info("Creating new deal");

        try {
            if (request.propertyId == null || request.buyerId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Property ID and Buyer ID are required"));
            }

            DealStatus deal = dealService.createDeal(
                    request.propertyId,
                    request.buyerId,
                    request.agentId
            );

            DealDTO dealDTO = convertToDTO(deal);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(dealDTO));

        } catch (Exception e) {
            logger.error("❌ Error creating deal: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{dealId}")
    public ResponseEntity<?> getDeal(@PathVariable Long dealId) {
        logger.info("Fetching deal: {}", dealId);

        try {
            DealStatus deal = dealService.getDealById(dealId);
            DealDTO dealDTO = convertToDTO(deal);
            return ResponseEntity.ok(ApiResponse.success(dealDTO));

        } catch (Exception e) {
            logger.error("❌ Error fetching deal: ", e);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{dealId}/stage")
    public ResponseEntity<?> updateDealStage(
            @PathVariable Long dealId,
            @RequestBody UpdateDealStageRequest request,
            Authentication authentication) {

        logger.info("Updating deal stage - DealId: {}, NewStage: {}", dealId, request.stage);

        try {
            String username = authentication != null ? authentication.getName() : "system";

            DealStatus.DealStage stage = DealStatus.DealStage.valueOf(request.stage.toUpperCase());

            DealStatus deal = dealService.updateDealStage(
                    dealId,
                    stage,
                    request.notes,
                    username
            );

            DealDTO dealDTO = convertToDTO(deal);
            return ResponseEntity.ok(ApiResponse.success(dealDTO));

        } catch (IllegalArgumentException e) {
            logger.error("❌ Invalid stage: {}", request.stage);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid stage: " + request.stage));

        } catch (Exception e) {
            logger.error("❌ Error updating deal stage: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/agent/{agentId}")
    public ResponseEntity<?> getAgentDeals(@PathVariable Long agentId) {
        logger.info("Fetching all deals for agent: {}", agentId);

        try {
            List<DealStatus> deals = dealService.getDealsForAgent(agentId);
            List<DealDTO> dealDTOs = deals.stream()
                    .map(this::convertToDTO)
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

        } catch (Exception e) {
            logger.error("❌ Error fetching agent deals: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET ALL DEALS BY STAGE (ADMIN) ====================
    @GetMapping("/stage/{stage}")
    public ResponseEntity<?> getDealsByStage(
            @PathVariable String stage,
            @RequestParam Long userId,
            Authentication authentication) {

        logger.info("Fetching deals by stage: {} (Admin) for user {}", stage, userId);

        try {
            // Validate userId
            if (userId == null || userId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid user ID is required"));
            }

            // Fetch user by ID
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("❌ User not found with ID: {}", userId);
                        return new RuntimeException("User not found with ID: " + userId);
                    });

            // Verify ADMIN role only
            if (!currentUser.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("❌ User {} attempted to access stage deals but is not admin", userId);
                return new ResponseEntity<>(
                        ApiResponse.error("Only admins can access this resource"),
                        HttpStatus.FORBIDDEN
                );
            }

            // Convert stage string to enum
            DealStatus.DealStage dealStage;
            try {
                dealStage = DealStatus.DealStage.valueOf(stage.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.error("❌ Invalid stage: {}", stage);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid stage: " + stage));
            }

            // Get deals by stage
            List<DealStatus> deals = dealService.getDealsByStage(dealStage);
            List<DealDetailDTO> dealDTOs = deals.stream()
                    .map(this::convertToDetailDTO)
                    .collect(java.util.stream.Collectors.toList());

            logger.info("✅ Found {} deals in stage: {}", dealDTOs.size(), stage);
            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

        } catch (Exception e) {
            logger.error("❌ Error fetching deals by stage: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET STATS BY STAGE (ADMIN) ====================
    @GetMapping("/stats/by-stage")
    public ResponseEntity<?> getStatsByStage(
            @RequestParam Long userId,
            Authentication authentication) {
        logger.info("Fetching deal stats by stage (Admin) for user {}", userId);

        try {
            // Validate userId
            if (userId == null || userId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid user ID is required"));
            }

            // Fetch user by ID
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("❌ User not found with ID: {}", userId);
                        return new RuntimeException("User not found with ID: " + userId);
                    });

            // Verify ADMIN role only
            if (!currentUser.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("❌ User {} attempted to access stats but is not admin", userId);
                return new ResponseEntity<>(
                        ApiResponse.error("Only admins can access this resource"),
                        HttpStatus.FORBIDDEN
                );
            }

            // Get stats by stage
            Map<String, Long> statsByStage = new HashMap<>();
            for (DealStatus.DealStage stage : DealStatus.DealStage.values()) {
                Long count = dealService.getCountByStage(stage);
                statsByStage.put(stage.name(), count);
            }

            logger.info("✅ Stats by stage calculated");
            return ResponseEntity.ok(ApiResponse.success(statsByStage));

        } catch (Exception e) {
            logger.error("❌ Error fetching stats: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<?> getBuyerDeals(@PathVariable Long buyerId) {
        logger.info("Fetching deals for buyer: {}", buyerId);

        try {
            List<DealStatus> deals = dealService.getBuyerDeals(buyerId);
            List<DealDTO> dealDTOs = deals.stream()
                    .map(this::convertToDTO)
                    .collect(java.util.stream.Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

        } catch (Exception e) {
            logger.error("❌ Error fetching buyer deals: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    private boolean isValidRole(String role) {
        return role != null &&
                (role.equalsIgnoreCase("BUYER") ||
                        role.equalsIgnoreCase("SELLER") ||
                        role.equalsIgnoreCase("AGENT") ||
                        role.equalsIgnoreCase("ADMIN"));
    }

    private DealDetailDTO convertToDetailDTO(DealStatus deal) {
        DealDetailDTO dto = new DealDetailDTO();

        dto.setDealId(deal.getId());
        dto.setStage(deal.getStage().name());
        dto.setCurrentStage(deal.getStage().name());
        dto.setAgreedPrice(deal.getAgreedPrice());
        dto.setNotes(deal.getNotes());
        dto.setCreatedAt(deal.getCreatedAt());
        dto.setUpdatedAt(deal.getUpdatedAt());
        dto.setLastUpdatedBy(deal.getLastUpdatedBy());

        if (deal.getProperty() != null) {
            dto.setPropertyId(deal.getProperty().getId());
            dto.setPropertyTitle(deal.getProperty().getTitle());
            dto.setPropertyPrice(deal.getProperty().getPrice());
            dto.setPropertyCity(deal.getProperty().getCity());
        }

        if (deal.getBuyer() != null) {
            dto.setBuyerId(deal.getBuyer().getId());
            dto.setBuyerName(deal.getBuyer().getFirstName() + " " + deal.getBuyer().getLastName());
            dto.setBuyerEmail(deal.getBuyer().getEmail());
            dto.setBuyerMobile(deal.getBuyer().getMobileNumber());
        }

        if (deal.getProperty() != null && deal.getProperty().getUser() != null) {
            User seller = deal.getProperty().getUser();
            dto.setSellerId(seller.getId());
            dto.setSellerName(seller.getFirstName() + " " + seller.getLastName());
            dto.setSellerEmail(seller.getEmail());
            dto.setSellerMobile(seller.getMobileNumber());
        }

        if (deal.getAgent() != null) {
            dto.setAgentId(deal.getAgent().getId());
            dto.setAgentName(deal.getAgent().getFirstName() + " " + deal.getAgent().getLastName());
            dto.setAgentEmail(deal.getAgent().getEmail());
            dto.setAgentMobile(deal.getAgent().getMobileNumber());
        }

        return dto;
    }

    private DealDTO convertToDTO(DealStatus deal) {
        DealDTO dto = new DealDTO();

        dto.setId(deal.getId());
        dto.setDealId(deal.getId());
        dto.setStage(deal.getStage().name());
        dto.setCurrentStage(deal.getStage().name());
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
                    deal.getProperty().getPrice() != null ? deal.getProperty().getPrice().doubleValue() : 0,
                    deal.getProperty().getBedrooms(),
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

    // ==================== INNER DTOs (Request Classes) ====================

    static class CreateDealRequest {
        public Long propertyId;
        public Long buyerId;
        public Long agentId;

        public Long getPropertyId() { return propertyId; }
        public Long getBuyerId() { return buyerId; }
        public Long getAgentId() { return agentId; }
    }

    static class UpdateDealStageRequest {
        public String stage;
        public String notes;

        public String getStage() { return stage; }
        public String getNotes() { return notes; }
    }
}