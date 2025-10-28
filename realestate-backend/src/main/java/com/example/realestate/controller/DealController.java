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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors; // Added missing import

@RestController
@RequestMapping("/api/deals")
public class DealController {

    private static final Logger logger = LoggerFactory.getLogger(DealController.class);

    @Autowired
    private DealService dealService;

    @Autowired
    private com.example.realestate.repository.UserRepository userRepository;

    // ==================== GET DEALS BY USER AND ROLE (CORRECTED) ====================
    /**
     * ⭐ CORRECTED: Fetches deals relevant to the specified user based on their ACTUAL system role.
     * It IGNORES the {userRole} path variable and uses the role fetched from the database.
     */
    @GetMapping("/user/{userId}/role/{userRole}") // Keep path for compatibility, but ignore {userRole}
    public ResponseEntity<?> getDealsByUserAndRole(
            @PathVariable Long userId,
            @PathVariable String userRole, // This path variable is now ignored
            Authentication authentication) {
        logger.info("Deal Controller started");
        // Log the received path variable, but note that it won't be used for logic
        logger.info("Received request to fetch deals for user {} (Path role: '{}' - will be ignored)", userId, userRole);

        try {
            // Validate userId
            if (userId == null || userId <= 0) {
                logger.warn("Invalid user ID provided: {}", userId);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid user ID is required"));
            }

            // Fetch user by ID to get their ACTUAL role
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        logger.error("❌ User not found with ID: {}", userId);
                        // Use ResponseStatusException for cleaner error handling if preferred
                        return new RuntimeException("User not found with ID: " + userId);
                    });

            // ⭐ FIX: Get the ACTUAL role from the fetched user object
            String actualUserRole = currentUser.getRole().name(); // e.g., "USER", "AGENT", "ADMIN"
            logger.info("Fetched user {} has actual role: {}", userId, actualUserRole);


            // ⭐ FIX: Pass the ACTUAL role to the service method
            List<DealDetailDTO> deals = dealService.getDealsByRole(userId, actualUserRole);

            // Log using the actual role
            logger.info("✅ Found {} deals for user {} with actual role {}", deals.size(), userId, actualUserRole);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (RuntimeException e) { // Catch specific exceptions if needed
            logger.error("❌ Error fetching deals for user {}: ", userId, e);
            // Return appropriate error status based on exception type
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
            Authentication authentication) { // Assumes JWT/authentication provides the agent's ID/details

        // Get authenticated agent's ID safely
        // You'll need a way to extract the user details from the Authentication object
        // Example (assuming UserDetails implementation):
        // UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        // String username = userDetails.getUsername();
        // User agent = userRepository.findByUsername(username).orElseThrow(...);
        // Long agentId = agent.getId();

        // TEMPORARY: Using agentId from request until Authentication is fully integrated
        Long agentId = request.getAgentId();
        logger.info("Creating deal with agreed price by Agent ID: {}", agentId);


        try {
            if (agentId == null || agentId <= 0) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Valid agent ID is required (from auth or request)"));
            }
            // Fetch Agent User to verify role (redundant if fetched from Auth)
            User agentUser = userRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent user not found with ID: " + agentId));

            // Verify only AGENT or ADMIN can create deals
            if (!agentUser.getRole().equals(User.UserRole.AGENT) &&
                    !agentUser.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("❌ User {} (Role: {}) attempted to create deal but is not an agent/admin.",
                        agentId, agentUser.getRole());
                return new ResponseEntity<>(
                        ApiResponse.error("Only agents or admins can create deals"),
                        HttpStatus.FORBIDDEN
                );
            }

            // Call service to create the deal
            DealStatus deal = dealService.createDealWithPrice(request, agentId);

            // Convert result to DTO for response
            DealDetailDTO dealDTO = convertToDetailDTO(deal); // Use the controller's helper

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(dealDTO));

        } catch (RuntimeException e) {
            logger.error("❌ Error creating deal with price: {}", e.getMessage());
            // Provide more specific feedback based on the exception type if possible
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error during deal creation: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred during deal creation."));
        }
    }

    // ==================== GET MY DEALS (using Request Params - potentially redundant) ====================
    // This endpoint seems redundant given getDealsByUserAndRole. Consider removing or securing it.
    @GetMapping("/my-deals")
    public ResponseEntity<?> getMyDeals(
            @RequestParam String userRole, // Still problematic if FE sends "BUYER"/"SELLER"
            @RequestParam Long userId,
            Authentication authentication) {

        logger.warn("⚠️ Endpoint /my-deals called for user {} with role param '{}'. This might be deprecated. Consider using /user/{userId}/role/{actualRole}", userId, userRole);

        try {
            if (userId == null || userId <= 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Valid user ID is required"));
            }
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

            // ⭐ FIX: Use the ACTUAL role from the fetched user, ignore userRole param
            String actualUserRole = currentUser.getRole().name();
            logger.info("Fetching deals for user {} using actual role: {}", userId, actualUserRole);

            List<DealDetailDTO> deals = dealService.getDealsByRole(currentUser.getId(), actualUserRole);

            logger.info("✅ Found {} deals for user {} (Role: {}) via /my-deals", deals.size(), userId, actualUserRole);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (RuntimeException e) {
            logger.error("❌ Error fetching /my-deals for user {}: {}", userId, e.getMessage());
            if (e.getMessage().startsWith("User not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error(e.getMessage()));
            }
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
        catch (Exception e) {
            logger.error("❌ Unexpected error fetching /my-deals: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred."));
        }
    }


    // ==================== ADMIN DASHBOARD ====================
    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> getAdminDashboard(Authentication authentication) { // Use Authentication
        // Extract user details from authentication
        // Example: String username = authentication.getName(); User adminUser = userRepository.findByUsername...
        // Verify adminUser.getRole() == User.UserRole.ADMIN

        // For now, assuming security config handles authorization
        logger.info("Fetching admin dashboard...");
        try {
            // No need to fetch user if security config enforces ADMIN role for this path
            AdminDealDashboardDTO dashboard = dealService.getAdminDashboard();
            logger.info("✅ Admin dashboard generated");
            return ResponseEntity.ok(ApiResponse.success(dashboard));

        } catch (Exception e) {
            logger.error("❌ Error fetching admin dashboard: ", e);
            // Don't expose internal errors directly
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to generate admin dashboard."));
        }
    }

    // ==================== AGENT PERFORMANCE METRICS (ADMIN ONLY) ====================
    @GetMapping("/admin/agents-performance")
    public ResponseEntity<?> getAgentPerformance(Authentication authentication) { // Use Authentication
        // Verify user from authentication is ADMIN
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
            Authentication authentication) { // Use Authentication

        // Verify user from authentication is ADMIN
        logger.info("Admin fetching deals for agent ID: {}", agentId);
        try {
            if (agentId == null || agentId <= 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Valid Agent ID required."));
            }
            // Optional: Check if agentId actually exists and is an AGENT
            // userRepository.findById(agentId).filter(u -> u.getRole() == User.UserRole.AGENT)...

            List<DealDetailDTO> deals = dealService.getDealsByAgentForAdmin(agentId);
            logger.info("✅ Found {} deals for agent {}", deals.size(), agentId);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching agent deals for agent {}: ", agentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch deals for the specified agent."));
        }
    }

    // ==================== CREATE BASIC DEAL ====================
    @PostMapping("/create")
    public ResponseEntity<?> createDeal(@RequestBody CreateDealRequest request, Authentication authentication) {
        logger.info("Creating new basic deal request: Prop={}, Buyer={}, Agent={}",
                request.propertyId, request.buyerId, request.agentId);

        try {
            if (request.propertyId == null || request.buyerId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Property ID and Buyer ID are required"));
            }
            // Agent ID is optional in this basic creation endpoint

            DealStatus deal = dealService.createDeal(
                    request.propertyId,
                    request.buyerId,
                    request.agentId // Pass agentId if provided
            );

            DealDTO dealDTO = convertToDTO(deal); // Use controller's helper
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(dealDTO));

        } catch (RuntimeException e) {
            logger.error("❌ Error creating basic deal: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
        catch (Exception e) {
            logger.error("❌ Unexpected error creating basic deal: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred creating the deal."));
        }
    }

    // ==================== GET DEAL BY ID ====================
    @GetMapping("/{dealId}")
    public ResponseEntity<?> getDeal(@PathVariable Long dealId) {
        logger.info("Fetching deal details for Deal ID: {}", dealId);
        try {
            DealStatus deal = dealService.getDealById(dealId);
            DealDetailDTO dealDTO = convertToDetailDTO(deal); // Use detailed DTO
            if (dealDTO == null) { // Handle conversion issues
                logger.error("❌ Failed to convert Deal {} to DTO.", dealId);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error("Error retrieving deal details."));
            }
            return ResponseEntity.ok(ApiResponse.success(dealDTO));
        } catch (RuntimeException e) {
            logger.error("❌ Error fetching deal {}: {}", dealId, e.getMessage());
            // If the service throws "Deal not found", return 404
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

  package com.example.realestate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

    @Configuration
    @EnableWebSecurity
    public class SecurityConfig {

        @Bean
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
            CorsConfiguration config = new CorsConfiguration();
            config.setAllowedOrigins(List.of(
                    "https://propertydealz.in",
                    "https://www.propertydealz.in",
                    "http://propertydealz.in",
                    "http://www.propertydealz.in",
                    "http://localhost:3000",
                    "http://localhost:5173",
                    "http://127.0.0.1:5173"
            ));
            config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            config.setAllowedHeaders(List.of("*"));
            config.setExposedHeaders(List.of("Authorization", "Content-Type"));
            config.setAllowCredentials(true);
            config.setMaxAge(3600L);

            UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
            source.registerCorsConfiguration("/**", config);
            return source;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                    .cors(withDefaults())
                    .csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(authz -> authz
                            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                            // Public endpoints
                            .requestMatchers("/api/auth/**").permitAll()
                            .requestMatchers("/api/properties/**").permitAll()
                            .requestMatchers("/api/areas/**").permitAll()
                            .requestMatchers("/api/users/**").permitAll()
                            .requestMatchers("/api/upload/image/**").permitAll()
                            .requestMatchers("/api/property-types/**").permitAll()

                            // ⭐ All /api/deals/ endpoints are now permitted for debugging
                            .requestMatchers("/api/deals/**").permitAll()

                            // Agent endpoints (still secured, but /api/deals/ won't be)
                            .requestMatchers("/api/agents/**").authenticated()

                            // All other requests require authentication
                            .anyRequest().authenticated()
                    )
                    .sessionManagement(session -> session
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

            return http.build();
        }
    }

    // ==================== GET DEALS BY AGENT (for the agent themselves) ====================
    @GetMapping("/agent/{agentId}")
    public ResponseEntity<?> getAgentDeals(@PathVariable Long agentId, Authentication authentication) {
        // Security check: Ensure logged-in user matches agentId or is ADMIN
        logger.info("Fetching deals for agent ID: {}", agentId);
        try {
            // Basic validation
            if (agentId == null || agentId <= 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Valid Agent ID required."));
            }
            // Fetch deals using the service method that returns entities
            List<DealStatus> deals = dealService.getDealsForAgent(agentId);
            // Convert to basic DTO for this potentially public endpoint
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
            Authentication authentication) { // Use Authentication

        // Verify user from authentication is ADMIN
        logger.info("Admin fetching deals by stage: {}", stage);
        try {
            // Convert stage string to enum
            DealStatus.DealStage dealStage;
            try {
                dealStage = DealStatus.DealStage.valueOf(stage.trim().toUpperCase());
            } catch (IllegalArgumentException | NullPointerException e) {
                logger.error("❌ Invalid stage value provided: '{}'", stage);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid stage value: " + stage));
            }

            // Get deals by stage using service
            List<DealStatus> deals = dealService.getDealsByStage(dealStage);
            // Convert to detailed DTO for admin view
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
    public ResponseEntity<?> getStatsByStage(Authentication authentication) { // Use Authentication
        // Verify user from authentication is ADMIN
        logger.info("Admin fetching deal stats by stage...");
        try {
            Map<String, Long> statsByStage = new HashMap<>();
            for (DealStatus.DealStage stage : DealStatus.DealStage.values()) {
                Long count = dealService.getCountByStage(stage);
                statsByStage.put(stage.name(), count != null ? count : 0L); // Ensure count is not null
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
        // Security check: Ensure logged-in user matches buyerId or is ADMIN/AGENT
        logger.info("Fetching deals for buyer ID: {}", buyerId);
        try {
            if (buyerId == null || buyerId <= 0) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Valid Buyer ID required."));
            }
            // Fetch deals using service method returning entities
            List<DealStatus> deals = dealService.getBuyerDeals(buyerId);
            // Convert to basic DTO
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
            // Use the specific service method returning DTOs
            List<DealDetailDTO> dealDTOs = dealService.getDealsForPropertyAsDTO(propertyId);

            logger.info("✅ Found {} deals for property {}", dealDTOs.size(), propertyId);
            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

        } catch (Exception e) {
            logger.error("❌ Error fetching deals for property {}: ", propertyId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch deals for the specified property."));
        }
    }

    /**
     * Converts DealStatus entity to DealDetailDTO.
     * Moved from DealService to be a private helper here for encapsulation if preferred,
     * or could remain public in DealService.
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

            if (deal.getProperty().getUser() != null) { // Seller
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
     * Converts DealStatus entity to DealDTO (a simpler DTO).
     */
    private DealDTO convertToDTO(DealStatus deal) {
        if (deal == null) return null;
        DealDTO dto = new DealDTO();

        dto.setId(deal.getId());
        dto.setDealId(deal.getId()); // Redundant? id should be enough.
        dto.setStage(deal.getStage() != null ? deal.getStage().name() : null);
        dto.setCurrentStage(deal.getStage() != null ? deal.getStage().name() : null); // Also redundant?
        dto.setNotes(deal.getNotes());
        dto.setCreatedAt(deal.getCreatedAt());
        dto.setUpdatedAt(deal.getUpdatedAt());
        dto.setLastUpdatedBy(deal.getLastUpdatedBy());

        if (deal.getProperty() != null) {
            dto.setPropertyId(deal.getProperty().getId());
            // Create nested PropertyInfo DTO
            dto.setProperty(new DealDTO.PropertyInfo(
                    deal.getProperty().getId(),
                    deal.getProperty().getTitle(),
                    deal.getProperty().getCity(),
                    deal.getProperty().getPrice() != null ? deal.getProperty().getPrice().doubleValue() : 0.0, // Handle null price
                    deal.getProperty().getBedrooms(),
                    deal.getProperty().getImageUrl()
            ));
        }

        if (deal.getBuyer() != null) {
            dto.setBuyerId(deal.getBuyer().getId());
            // Create nested UserInfo DTO
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
            // Create nested UserInfo DTO
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

    // Request body for basic deal creation
    static class CreateDealRequest {
        public Long propertyId;
        public Long buyerId;
        public Long agentId; // Optional agent ID

        // Getters might be needed if using frameworks that require them
        public Long getPropertyId() { return propertyId; }
        public Long getBuyerId() { return buyerId; }
        public Long getAgentId() { return agentId; }
    }

    // Request body for updating deal stage
    static class UpdateDealStageRequest {
        public String stage; // Should correspond to DealStage enum names (e.g., "NEGOTIATION")
        public String notes;

        public String getStage() { return stage; }
        public String getNotes() { return notes; }
    }
}