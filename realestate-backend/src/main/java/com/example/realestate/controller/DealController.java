package com.example.realestate.controller;

import com.example.realestate.model.DealStatus;
import com.example.realestate.model.User;
import com.example.realestate.service.DealService;
import com.example.realestate.dto.*; // This imports CreateDealRequestDto
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/deals")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
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
            // Extract agent ID from request - Or better, get from Authentication
            Long agentId = null;
            String agentUsername = null;
            if (authentication != null && authentication.isAuthenticated()) {
                agentUsername = authentication.getName();
                User agent = userRepository.findByUsername(agentUsername)
                        .orElseThrow(() -> new RuntimeException("Authenticated agent not found in database"));
                agentId = agent.getId();

                // Verify only AGENT/ADMIN can create deals
                if (!agent.getRole().equals(User.UserRole.AGENT) &&
                        !agent.getRole().equals(User.UserRole.ADMIN)) {
                    logger.warn("❌ User {} attempted to create deal but is not an agent/admin. Role: {}",
                            agentId, agent.getRole());
                    return new ResponseEntity<>(
                            ApiResponse.error("Only agents or admins can create deals"),
                            HttpStatus.FORBIDDEN
                    );
                }
            } else {
                return new ResponseEntity<>(ApiResponse.error("User must be authenticated"), HttpStatus.UNAUTHORIZED);
            }


            // Create deal using the service
            DealStatus deal = dealService.createDealWithPrice(request, agentId);

            // Convert to detail DTO
            DealDetailDTO dealDTO = convertToDetailDTO(deal);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(dealDTO));

        } catch (RuntimeException e) {
            logger.error("❌ Error creating deal with price: {}", e.getMessage());
            // Return specific status codes based on exception type if possible
            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(e.getMessage()));
            }
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error during deal creation: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred"));
        }
    }

    // ==================== GET MY DEALS BY ROLE ====================
    @GetMapping("/my-deals")
    public ResponseEntity<?> getMyDeals(
            @RequestParam String userRole,
            @RequestParam Long userId,
            Authentication authentication) {

        // Security check: Ensure the request is for the authenticated user or an admin
        String currentUsername = (authentication != null) ? authentication.getName() : null;
        if (currentUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }
        User authenticatedUser = userRepository.findByUsername(currentUsername).orElse(null);
        if (authenticatedUser == null || (!authenticatedUser.getId().equals(userId) && authenticatedUser.getRole() != User.UserRole.ADMIN)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied"));
        }


        logger.info("Fetching deals for user {} with role: {}", userId, userRole);

        try {
            // Fetch user by ID (already validated by security check above)
            User currentUser = authenticatedUser; // Use the already fetched user

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
            logger.error("❌ Error fetching deals for user {}: {}", userId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An error occurred while fetching deals: " + e.getMessage()));
        }
    }

    // ⭐ ==================== GET DEALS FOR A SPECIFIC PROPERTY ==================== ⭐
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> getDealsForProperty(@PathVariable Long propertyId, Authentication authentication) {
        // Log who is making the request (optional but helpful)
        String username = (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal()))
                ? authentication.getName()
                : "anonymous/unauthenticated";
        logger.info("Fetching deals for property ID: {} requested by user: {}", propertyId, username);

        // Security check passed implicitly by SecurityConfig (.authenticated())
        if ("anonymous/unauthenticated".equals(username)) {
            logger.warn("Unauthenticated access attempt to /property/{}", propertyId);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }


        try {
            // Use the existing service method to get deals by property ID
            List<DealStatus> deals = dealService.getDealsForProperty(propertyId);

            // Convert the DealStatus entities to the DTO your frontend expects (e.g., DealDetailDTO)
            List<DealDetailDTO> dealDTOs = deals.stream()
                    .map(this::convertToDetailDTO) // Use your existing conversion method
                    .collect(Collectors.toList());

            logger.info("✅ Found {} deals for property {}", dealDTOs.size(), propertyId);
            // Return the list wrapped in ApiResponse
            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

        } catch (Exception e) {
            logger.error("❌ Error fetching deals for property {}: {}", propertyId, e.getMessage(), e);
            // Return a generic server error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch deals for property: " + e.getMessage()));
        }
    }


    // ==================== ADMIN DASHBOARD ====================
    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> getAdminDashboard(Authentication authentication) { // Use Authentication
        logger.info("Fetching admin dashboard");

        // Verify ADMIN role only from Authentication
        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            logger.warn("❌ Non-admin user attempted to access admin dashboard");
            return new ResponseEntity<>(
                    ApiResponse.error("Only admins can access this resource"),
                    HttpStatus.FORBIDDEN
            );
        }
        String adminUsername = authentication.getName();
        logger.info("Request by admin: {}", adminUsername);

        try {
            AdminDealDashboardDTO dashboard = dealService.getAdminDashboard();
            logger.info("✅ Admin dashboard generated");
            return ResponseEntity.ok(ApiResponse.success(dashboard));

        } catch (Exception e) {
            logger.error("❌ Error fetching admin dashboard: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching admin dashboard: " + e.getMessage()));
        }
    }

    // ==================== AGENT PERFORMANCE METRICS ====================
    @GetMapping("/admin/agents-performance")
    public ResponseEntity<?> getAgentPerformance(Authentication authentication) { // Use Authentication
        logger.info("Fetching agent performance metrics");

        // Verify ADMIN role only from Authentication
        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            logger.warn("❌ Non-admin user attempted to access agent performance");
            return new ResponseEntity<>(
                    ApiResponse.error("Only admins can access this resource"),
                    HttpStatus.FORBIDDEN
            );
        }
        String adminUsername = authentication.getName();
        logger.info("Request by admin: {}", adminUsername);

        try {
            List<AgentPerformanceDTO> performance = dealService.getAgentPerformanceMetrics();
            logger.info("✅ Agent performance metrics fetched for {} agents", performance.size());
            return ResponseEntity.ok(ApiResponse.success(performance));

        } catch (Exception e) {
            logger.error("❌ Error fetching performance metrics: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching performance metrics: " + e.getMessage()));
        }
    }

    // ==================== GET DEALS BY AGENT (ADMIN) ====================
    @GetMapping("/admin/agent/{agentId}")
    public ResponseEntity<?> getDealsByAgent(
            @PathVariable Long agentId,
            Authentication authentication) { // Use Authentication

        logger.info("Fetching deals for agent {} (Admin view)", agentId);

        // Verify ADMIN role only from Authentication
        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            logger.warn("❌ Non-admin user attempted to access deals for agent {}", agentId);
            return new ResponseEntity<>(
                    ApiResponse.error("Only admins can access this resource"),
                    HttpStatus.FORBIDDEN
            );
        }
        String adminUsername = authentication.getName();
        logger.info("Request by admin: {}", adminUsername);

        try {
            List<DealDetailDTO> deals = dealService.getDealsByAgentForAdmin(agentId);
            logger.info("✅ Found {} deals for agent {}", deals.size(), agentId);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching agent {} deals: {}", agentId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching agent deals: " + e.getMessage()));
        }
    }

    // ==================== CREATE DEAL (Simple version) ====================
    @PostMapping("/create")
    public ResponseEntity<?> createDeal(@RequestBody CreateDealRequestDto request, Authentication authentication) {
        logger.info("Creating new deal via /create endpoint");

        // Get authenticated user (could be buyer, agent, admin)
        String username = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : null;
        if (username == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        User creatingUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));


        try {
            // ⭐ ERROR FIX: Use DTO fields directly. If DTO uses public fields, this is fine.
            // Since the DTO you provided uses private fields with getters, we should use getters here.
            if (request.getPropertyId() == null || request.getBuyerId() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Property ID and Buyer ID are required"));
            }

            // Determine agentId - use agentId from request body
            Long agentId = request.getAgentId();

            DealStatus deal = dealService.createDeal(
                    request.getPropertyId(),
                    request.getBuyerId(),
                    agentId // Pass agentId to service
            );

            DealDTO dealDTO = convertToDTO(deal); // Use simple DTO
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(dealDTO));

        } catch (RuntimeException e) { // Catch specific errors from service
            logger.error("❌ Error creating deal via /create: {}", e.getMessage());
            if (e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error(e.getMessage()));
            }
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error creating deal via /create: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred"));
        }
    }

    // ==================== GET DEAL BY ID ====================
    @GetMapping("/{dealId}")
    public ResponseEntity<?> getDeal(@PathVariable Long dealId, Authentication authentication) {
        logger.info("Fetching deal details for ID: {}", dealId);
        // Add security check if needed (e.g., only involved parties or admin can view)
        // Example: check if authenticated user is buyer, agent, seller (via property), or admin

        try {
            DealStatus deal = dealService.getDealById(dealId);
            // Use the detailed DTO for viewing details
            DealDetailDTO dealDTO = convertToDetailDTO(deal);
            return ResponseEntity.ok(ApiResponse.success(dealDTO));

        } catch (RuntimeException e) { // Catch "Deal not found"
            logger.error("❌ Error fetching deal {}: {}", dealId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error fetching deal {}: ", dealId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred"));
        }
    }

    // ==================== UPDATE DEAL STAGE ====================
    @PutMapping("/{dealId}/stage")
    public ResponseEntity<?> updateDealStage(
            @PathVariable Long dealId,
            @RequestBody UpdateDealStageRequest request,
            Authentication authentication) {

        logger.info("Updating deal stage - DealId: {}, NewStage: {}", dealId, request.stage);

        // Get authenticated username for logging/tracking
        String username = (authentication != null && authentication.isAuthenticated()) ? authentication.getName() : "system";
        if ("system".equals(username)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Authentication required"));
        }
        // Optional: Add role check (e.g., only Agent/Admin can update stage)

        try {
            DealStatus.DealStage stage = DealStatus.DealStage.valueOf(request.stage.toUpperCase());

            DealStatus deal = dealService.updateDealStage(
                    dealId,
                    stage,
                    request.notes,
                    username // Pass username who made the update
            );

            DealDetailDTO dealDTO = convertToDetailDTO(deal); // Return detailed DTO after update
            return ResponseEntity.ok(ApiResponse.success(dealDTO));

        } catch (IllegalArgumentException e) {
            logger.error("❌ Invalid stage value provided: {}", request.stage);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid stage value: " + request.stage));
        } catch (RuntimeException e) { // Catch errors from service (e.g., "Deal not found", "Cannot move backwards")
            logger.error("❌ Error updating deal stage for deal {}: {}", dealId, e.getMessage());
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error updating deal stage for deal {}: ", dealId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred"));
        }
    }

    // ==================== GET DEALS FOR LOGGED-IN AGENT ====================
    // This handles the request from AgentDashboard: GET /api/deals/agent/{agentId}
    @GetMapping("/agent/{agentId}")
    public ResponseEntity<?> getAgentDeals(@PathVariable Long agentId, Authentication authentication) {
        logger.info("Fetching all deals for agent ID: {}", agentId);

        // Security check: Ensure the request is for the logged-in agent or by an admin
        String currentUsername = (authentication != null) ? authentication.getName() : null;
        if (currentUsername == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Not authenticated"));
        }
        User authenticatedUser = userRepository.findByUsername(currentUsername).orElse(null);
        if (authenticatedUser == null || (!authenticatedUser.getId().equals(agentId) && authenticatedUser.getRole() != User.UserRole.ADMIN)) {
            logger.warn("❌ Access denied: User {} attempting to fetch deals for agent {}", currentUsername, agentId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("Access denied"));
        }


        try {
            // Call the service method to get deals
            List<DealStatus> deals = dealService.getDealsForAgent(agentId);

            // Convert results to the DTO expected by AgentDashboard (likely DealDetailDTO)
            List<DealDetailDTO> dealDTOs = deals.stream()
                    .map(this::convertToDetailDTO) // Use detailed DTO conversion
                    .collect(Collectors.toList());

            logger.info("✅ Found {} deals for agent {}", dealDTOs.size(), agentId);
            return ResponseEntity.ok(ApiResponse.success(dealDTOs)); // Wrap in ApiResponse

        } catch (Exception e) {
            logger.error("❌ Error fetching deals for agent {}: {}", agentId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching agent deals: " + e.getMessage()));
        }
    }

    // ==================== GET ALL DEALS BY STAGE (ADMIN) ====================
    @GetMapping("/stage/{stage}")
    public ResponseEntity<?> getDealsByStage(
            @PathVariable String stage,
            Authentication authentication) { // Use Authentication

        logger.info("Fetching deals by stage: {} (Admin view)", stage);

        // Verify ADMIN role only from Authentication
        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            logger.warn("❌ Non-admin user attempted to access deals by stage {}", stage);
            return new ResponseEntity<>(
                    ApiResponse.error("Only admins can access this resource"),
                    HttpStatus.FORBIDDEN
            );
        }
        String adminUsername = authentication.getName();
        logger.info("Request by admin: {}", adminUsername);

        // Convert stage string to enum
        DealStatus.DealStage dealStage;
        try {
            dealStage = DealStatus.DealStage.valueOf(stage.toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.error("❌ Invalid stage parameter: {}", stage);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid stage parameter: " + stage));
        }

        try {
            // Get deals by stage using the service
            List<DealStatus> deals = dealService.getDealsByStage(dealStage);
            // Convert to detailed DTOs
            List<DealDetailDTO> dealDTOs = deals.stream()
                    .map(this::convertToDetailDTO)
                    .collect(Collectors.toList());

            logger.info("✅ Found {} deals in stage: {}", dealDTOs.size(), stage);
            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

        } catch (Exception e) {
            logger.error("❌ Error fetching deals by stage {}: {}", stage, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching deals by stage: " + e.getMessage()));
        }
    }

    // ==================== GET STATS BY STAGE (ADMIN) ====================
    @GetMapping("/stats/by-stage")
    public ResponseEntity<?> getStatsByStage(Authentication authentication) { // Use Authentication
        logger.info("Fetching deal stats by stage (Admin view)");

        // Verify ADMIN role only from Authentication
        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            logger.warn("❌ Non-admin user attempted to access deal stats");
            return new ResponseEntity<>(
                    ApiResponse.error("Only admins can access this resource"),
                    HttpStatus.FORBIDDEN
            );
        }
        String adminUsername = authentication.getName();
        logger.info("Request by admin: {}", adminUsername);

        try {
            // Get stats by stage
            Map<String, Long> statsByStage = new HashMap<>();
            for (DealStatus.DealStage stageEnum : DealStatus.DealStage.values()) {
                Long count = dealService.getCountByStage(stageEnum);
                statsByStage.put(stageEnum.name(), count);
            }

            logger.info("✅ Stats by stage calculated");
            return ResponseEntity.ok(ApiResponse.success(statsByStage));

        } catch (Exception e) {
            logger.error("❌ Error fetching deal stats: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching deal stats: " + e.getMessage()));
        }
    }

    // ==================== GET DEALS FOR A SPECIFIC BUYER ====================
    // Note: Security might be needed here - should only buyer or admin/agent see this?
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<?> getBuyerDeals(@PathVariable Long buyerId, Authentication authentication) {
        logger.info("Fetching deals for buyer ID: {}", buyerId);
        // Add security check if necessary

        try {
            List<DealStatus> deals = dealService.getBuyerDeals(buyerId);
            // Convert to detailed DTOs for consistency
            List<DealDetailDTO> dealDTOs = deals.stream()
                    .map(this::convertToDetailDTO)
                    .collect(Collectors.toList());

            logger.info("✅ Found {} deals for buyer {}", dealDTOs.size(), buyerId);
            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

        } catch (Exception e) {
            logger.error("❌ Error fetching deals for buyer {}: {}", buyerId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Error fetching buyer deals: " + e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    // Checks if the provided role string is one of the valid roles (case-insensitive)
    private boolean isValidRole(String role) {
        if (role == null) return false;
        String upperRole = role.toUpperCase();
        return "BUYER".equals(upperRole) ||
                "SELLER".equals(upperRole) || // Assuming SELLER is used conceptually, roles are USER, AGENT, ADMIN, BUYER
                "AGENT".equals(upperRole) ||
                "ADMIN".equals(upperRole) ||
                "USER".equals(upperRole); // Include USER if relevant
    }

    // Converts DealStatus entity to detailed DTO including related user info
    private DealDetailDTO convertToDetailDTO(DealStatus deal) {
        if (deal == null) return null;

        DealDetailDTO dto = new DealDetailDTO();

        // Deal Info
        dto.setDealId(deal.getId());
        dto.setStage(deal.getStage() != null ? deal.getStage().name() : null); // Handle null stage safely
        dto.setCurrentStage(deal.getStage() != null ? deal.getStage().name() : null);
        dto.setAgreedPrice(deal.getAgreedPrice());
        dto.setNotes(deal.getNotes());
        dto.setCreatedAt(deal.getCreatedAt());
        dto.setUpdatedAt(deal.getUpdatedAt());
        dto.setLastUpdatedBy(deal.getLastUpdatedBy());

        // Property Details
        if (deal.getProperty() != null) {
            dto.setPropertyId(deal.getProperty().getId());
            dto.setPropertyTitle(deal.getProperty().getTitle());
            dto.setPropertyPrice(deal.getProperty().getPrice());
            dto.setPropertyCity(deal.getProperty().getCity());
            // Add Property Owner (Seller) details from Property's User
            if (deal.getProperty().getUser() != null) {
                User seller = deal.getProperty().getUser();
                dto.setSellerId(seller.getId());
                dto.setSellerName(seller.getFirstName() + " " + seller.getLastName());
                dto.setSellerEmail(seller.getEmail());
                dto.setSellerMobile(seller.getMobileNumber());
            }
        }

        // Buyer Details
        if (deal.getBuyer() != null) {
            dto.setBuyerId(deal.getBuyer().getId());
            dto.setBuyerName(deal.getBuyer().getFirstName() + " " + deal.getBuyer().getLastName());
            dto.setBuyerEmail(deal.getBuyer().getEmail());
            dto.setBuyerMobile(deal.getBuyer().getMobileNumber());
        }

        // Agent Details
        if (deal.getAgent() != null) {
            dto.setAgentId(deal.getAgent().getId());
            dto.setAgentName(deal.getAgent().getFirstName() + " " + deal.getAgent().getLastName());
            dto.setAgentEmail(deal.getAgent().getEmail());
            dto.setAgentMobile(deal.getAgent().getMobileNumber());
        }

        // Stage Dates
        dto.setInquiryDate(deal.getInquiryDate());
        dto.setShortlistDate(deal.getShortlistDate());
        dto.setNegotiationDate(deal.getNegotiationDate());
        dto.setAgreementDate(deal.getAgreementDate());
        dto.setRegistrationDate(deal.getRegistrationDate());
        dto.setPaymentDate(deal.getPaymentDate());
        dto.setCompletedDate(deal.getCompletedDate());

        return dto;
    }

    // Converts DealStatus entity to simpler DTO (used by older /create endpoint)
    private DealDTO convertToDTO(DealStatus deal) {
        if (deal == null) return null;

        DealDTO dto = new DealDTO();
        dto.setId(deal.getId());
        dto.setDealId(deal.getId());
        dto.setStage(deal.getStage() != null ? deal.getStage().name() : null);
        dto.setPropertyId(deal.getProperty() != null ? deal.getProperty().getId() : null);
        dto.setBuyerId(deal.getBuyer() != null ? deal.getBuyer().getId() : null);
        dto.setAgentId(deal.getAgent() != null ? deal.getAgent().getId() : null);
        dto.setAgreedPrice(deal.getAgreedPrice());
        return dto;
    }
}