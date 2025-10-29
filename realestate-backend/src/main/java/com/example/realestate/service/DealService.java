package com.example.realestate.service;

import com.example.realestate.model.DealStatus;
import com.example.realestate.model.Property;
import com.example.realestate.model.User;
import com.example.realestate.dto.CreateDealWithPriceRequestDto;
import com.example.realestate.dto.DealDetailDTO;
import com.example.realestate.dto.AgentPerformanceDTO;
import com.example.realestate.dto.AdminDealDashboardDTO;
import com.example.realestate.repository.DealStatusRepository;
import com.example.realestate.repository.PropertyRepository;
import com.example.realestate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class DealService {

    private static final Logger logger = LoggerFactory.getLogger(DealService.class);

    @Autowired
    private DealStatusRepository dealStatusRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    // ==================== CREATE DEAL WITH PRICE ====================
    /**
     * Creates a new deal, typically by an agent, including an agreed price.
     */
    public DealStatus createDealWithPrice(CreateDealWithPriceRequestDto dto, Long agentId) {
        logger.info("Creating deal with price - Property: {}, Buyer: {}, Agent: {}, Price: {}",
                dto.getPropertyId(), dto.getBuyerId(), agentId, dto.getAgreedPrice());

        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found with ID: " + dto.getPropertyId()));

        User buyer = userRepository.findById(dto.getBuyerId())
                .orElseThrow(() -> new RuntimeException("Buyer user not found with ID: " + dto.getBuyerId()));

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent user not found with ID: " + agentId));

        if (!agent.getRole().equals(User.UserRole.AGENT) && !agent.getRole().equals(User.UserRole.ADMIN)) {
            logger.warn("User {} attempted to create deal but is not an agent/admin.", agentId);
            throw new RuntimeException("Only agents or admins can create deals");
        }

        if (property.getUser() != null && property.getUser().getId().equals(agentId)) {
            logger.warn("Agent {} cannot create deal on property they own (ID: {})", agentId, property.getId());
            throw new RuntimeException("Agents cannot create deals on properties they own");
        }

        if (property.getUser() != null && property.getUser().getId().equals(dto.getBuyerId())) {
            logger.warn("Buyer (User ID: {}) cannot create deal on property they own (ID: {})", dto.getBuyerId(), property.getId());
            throw new RuntimeException("Buyer cannot create deal on their own property");
        }

        if (dealStatusRepository.existsByPropertyIdAndBuyerId(dto.getPropertyId(), dto.getBuyerId())) {
            logger.warn("Deal already exists for property {} and buyer {}", dto.getPropertyId(), dto.getBuyerId());
            throw new RuntimeException("Deal already exists for this property and buyer");
        }

        if (dto.getAgreedPrice() == null || dto.getAgreedPrice().compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("Invalid agreed price provided: {}", dto.getAgreedPrice());
            throw new RuntimeException("Agreed price must be greater than 0");
        }

        DealStatus deal = new DealStatus();
        deal.setProperty(property);
        deal.setBuyer(buyer);
        deal.setAgent(agent);
        deal.setStage(DealStatus.DealStage.INQUIRY); // Initial stage
        deal.setAgreedPrice(dto.getAgreedPrice());
        deal.setNotes(dto.getNotes() != null ? dto.getNotes() : "Deal initiated - Agreed Price: " + dto.getAgreedPrice());
        deal.setLastUpdatedBy(agent.getUsername());
        deal.setInquiryDate(LocalDateTime.now()); // Set initial timestamp

        DealStatus savedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Deal created with price - Deal ID: {}, Property ID: {}, Buyer ID: {}, Agent ID: {}, Price: {}",
                savedDeal.getId(), property.getId(), buyer.getId(), agent.getId(), savedDeal.getAgreedPrice());
        return savedDeal;
    }

    // ==================== ORIGINAL CREATE DEAL (Used for basic inquiries) ====================
    /**
     * Creates a basic deal (e.g., from user inquiry) without an agreed price.
     */
    public DealStatus createDeal(Long propertyId, Long buyerId, Long agentId) {
        logger.info("Creating basic deal - Property: {}, Buyer: {}, Agent: {}",
                propertyId, buyerId, agentId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with ID: " + propertyId));

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer user not found with ID: " + buyerId));

        // Prevent duplicate deals for the same property and buyer
        if (dealStatusRepository.existsByPropertyIdAndBuyerId(propertyId, buyerId)) {
            logger.warn("Attempted to create duplicate deal for property {} and buyer {}", propertyId, buyerId);
            throw new RuntimeException("Deal already exists for this property and buyer");
        }

        User agent = null;
        if (agentId != null) {
            agent = userRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent user not found with ID: " + agentId));

            // Ensure assigned agent is actually an AGENT or ADMIN
            if (!agent.getRole().equals(User.UserRole.AGENT) && !agent.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("Attempted to assign non-agent user {} to deal.", agentId);
                throw new RuntimeException("Assigned user is not an agent or admin");
            }
        }

        DealStatus deal = new DealStatus();
        deal.setProperty(property);
        deal.setBuyer(buyer);
        deal.setAgent(agent); // Can be null if not assigned initially
        deal.setStage(DealStatus.DealStage.INQUIRY);
        deal.setNotes("Deal initiated - Initial Inquiry");
        deal.setLastUpdatedBy(buyer.getUsername()); // Assume buyer initiated
        deal.setInquiryDate(LocalDateTime.now()); // Set initial timestamp

        DealStatus savedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Basic Deal created - Deal ID: {}, Property ID: {}, Buyer ID: {}",
                savedDeal.getId(), property.getId(), buyer.getId());
        return savedDeal;
    }

    // ==================== ROLE-BASED DEAL FETCHING (CORRECTED) ====================
    /**
     * ⭐ CORRECTED: Gets deals relevant to a user based on their system role (USER, AGENT, ADMIN).
     * USER: Sees deals where they are the buyer OR the seller (property owner).
     * AGENT: Sees deals they created/are assigned to.
     * ADMIN: Sees all deals.
     * The `userRole` parameter MUST be one of 'USER', 'AGENT', 'ADMIN'.
     */
    public List<DealDetailDTO> getDealsByRole(Long userId, String userRole) {
        // Log the exact input received from the controller
        logger.info("Fetching deals ::::  getDealsByRole");
        logger.info("Fetching deals for user ID: {} with provided role: '{}'", userId, userRole);

        List<DealStatus> deals = new ArrayList<>();
        // Normalize the role string: convert to uppercase and handle null
        logger.info("Before Normalized role for processing:");
        String normalizedRole = (userRole != null) ? userRole : "UNKNOWN";
        logger.info("Normalized role for processing: '{}'", normalizedRole);



        switch (normalizedRole) {
            case "USER":
                logger.info("Processing as USER role for user {}", userId);

                // 1. Find deals where the user is the BUYER
                List<DealStatus> buyerDeals = dealStatusRepository.findByBuyerId(userId);
                logger.info(" -> Found {} deals where user {} is the Buyer.", buyerDeals.size(), userId);

                // 2. Find deals where the user is the SELLER (property owner)
                List<Property> sellerProperties = propertyRepository.findByUserId(userId);
                List<DealStatus> sellerDeals = new ArrayList<>();

                if (sellerProperties != null && !sellerProperties.isEmpty()) {
                    List<Long> propertyIds = sellerProperties.stream()
                            .map(Property::getId)
                            .collect(Collectors.toList());
                    logger.info(" -> User {} owns {} properties with IDs: {}", userId, sellerProperties.size(), propertyIds);

                    // Use the required repository method findByPropertyIdIn
                    sellerDeals = dealStatusRepository.findByPropertyIdIn(propertyIds);
                    logger.info(" -> Found {} deals associated with these properties (user as Seller).", sellerDeals.size());
                } else {
                    logger.info(" -> User {} owns no properties.", userId);
                }

                // 3. Combine lists using a Map to ensure uniqueness by Deal ID
                Map<Long, DealStatus> combinedDeals = new HashMap<>();
                buyerDeals.forEach(deal -> combinedDeals.put(deal.getId(), deal));
                sellerDeals.forEach(deal -> combinedDeals.put(deal.getId(), deal)); // Overwrites duplicates which is fine

                deals = new ArrayList<>(combinedDeals.values());
                // Sort by last updated (most recent first) for combined list
                deals.sort(Comparator.comparing(DealStatus::getUpdatedAt, Comparator.nullsLast(Comparator.reverseOrder())));
                logger.info(" -> Combined unique deals for USER {}: {}", userId, deals.size());
                break;

            case "AGENT":
                logger.info("Processing as AGENT role for user {}", userId);
                deals = dealStatusRepository.findByAgentId(userId);
                break;

            case "ADMIN":
                logger.info("Processing as ADMIN role for user {}. Fetching all deals.", userId);
                deals = dealStatusRepository.findAll();
                break;

            default:
                // Handles "BUYER", "SELLER", null, or any other invalid string
                logger.warn("❌ Unknown or unsupported role provided: '{}'. Cannot fetch deals based on this role.", userRole);
                deals = Collections.emptyList(); // Return empty list for safety
        }

        logger.info("✅ Found {} total deals for user {}: {}", deals.size(), userId, normalizedRole);
        // Convert the final list of deals to DTOs
        return deals.stream()
                .map(this::convertToDealDetailDTO)
                .collect(Collectors.toList());
    }


    // ==================== ADMIN DASHBOARD ====================
    /**
     * Generates a dashboard with aggregate statistics for an Admin.
     */
    public AdminDealDashboardDTO getAdminDashboard() {
        logger.info("📊 Generating admin dashboard");
        List<DealStatus> allDeals = dealStatusRepository.findAll();
        AdminDealDashboardDTO dashboard = new AdminDealDashboardDTO();

        Long totalDeals = (long) allDeals.size();
        Long completedDealCount = allDeals.stream()
                .filter(d -> d.getStage() == DealStatus.DealStage.COMPLETED)
                .count();
        Long activeDealCount = totalDeals - completedDealCount;

        dashboard.setTotalDeals(totalDeals);
        dashboard.setActiveDealCount(activeDealCount);
        dashboard.setCompletedDealCount(completedDealCount);

        // Group deals by stage and count them using Streams API
        Map<String, Long> dealsByStage = allDeals.stream()
                .filter(d -> d.getStage() != null) // Avoid potential NullPointerException
                .collect(Collectors.groupingBy(d -> d.getStage().name(), Collectors.counting()));
        dashboard.setDealsByStage(dealsByStage);

        dashboard.setAgentPerformance(getAgentPerformanceMetrics()); // Fetch agent performance
        logger.info("✅ Admin dashboard generated - Total deals: {}", totalDeals);
        return dashboard;
    }

    // ==================== AGENT PERFORMANCE METRICS ====================
    /**
     * Calculates performance metrics for all users with the AGENT role.
     */
    public List<AgentPerformanceDTO> getAgentPerformanceMetrics() {
        logger.info("📈 Calculating agent performance metrics");
        List<User> agents = userRepository.findByRole(User.UserRole.AGENT);
        List<AgentPerformanceDTO> performanceList = new ArrayList<>();

        for (User agent : agents) {
            List<DealStatus> agentDeals = dealStatusRepository.findByAgentId(agent.getId());
            Long totalDeals = (long) agentDeals.size();
            Long completedDeals = agentDeals.stream()
                    .filter(d -> d.getStage() == DealStatus.DealStage.COMPLETED)
                    .count();
            Long activeDeals = totalDeals - completedDeals;

            // Calculate conversion rate
            String conversionRate = "0.00%";
            if (totalDeals > 0) {
                double rate = (completedDeals.doubleValue() / totalDeals.doubleValue()) * 100;
                conversionRate = String.format("%.2f%%", rate);
            }

            // Calculate average agreed price
            BigDecimal averagePrice = BigDecimal.ZERO;
            List<BigDecimal> pricedDeals = agentDeals.stream()
                    .map(DealStatus::getAgreedPrice)
                    .filter(Objects::nonNull) // Filter out null prices
                    .collect(Collectors.toList());

            if (!pricedDeals.isEmpty()) {
                BigDecimal totalPrice = pricedDeals.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
                // Use ROUND_HALF_UP and ensure divisor is not zero
                averagePrice = totalPrice.divide(BigDecimal.valueOf(pricedDeals.size()), 2, BigDecimal.ROUND_HALF_UP);
            }

            AgentPerformanceDTO performance = new AgentPerformanceDTO();
            performance.setAgentId(agent.getId());
            performance.setAgentName(agent.getFirstName() + " " + agent.getLastName());
            performance.setAgentEmail(agent.getEmail());
            performance.setAgentMobile(agent.getMobileNumber());
            performance.setTotalDeals(totalDeals);
            performance.setActiveDeals(activeDeals);
            performance.setCompletedDeals(completedDeals);
            performance.setConversionRate(conversionRate);
            performance.setAverageDealPrice(averagePrice);

            // Count deals in each stage for this agent
            Map<DealStatus.DealStage, Long> stageCounts = agentDeals.stream()
                    .filter(d -> d.getStage() != null)
                    .collect(Collectors.groupingBy(DealStatus::getStage, Collectors.counting()));

            performance.setInquiryCount(stageCounts.getOrDefault(DealStatus.DealStage.INQUIRY, 0L));
            performance.setShortlistCount(stageCounts.getOrDefault(DealStatus.DealStage.SHORTLIST, 0L));
            performance.setNegotiationCount(stageCounts.getOrDefault(DealStatus.DealStage.NEGOTIATION, 0L));
            performance.setAgreementCount(stageCounts.getOrDefault(DealStatus.DealStage.AGREEMENT, 0L));
            performance.setRegistrationCount(stageCounts.getOrDefault(DealStatus.DealStage.REGISTRATION, 0L));
            performance.setPaymentCount(stageCounts.getOrDefault(DealStatus.DealStage.PAYMENT, 0L));
            // Note: Completed count is already calculated above

            performanceList.add(performance);
        }

        logger.info("✅ Agent performance metrics calculated for {} agents", performanceList.size());
        return performanceList;
    }

    // ==================== GET DEALS BY AGENT (FOR ADMIN) ====================
    /**
     * Gets all deals for a specific agent, returns as DTOs (intended for Admin view).
     */
    public List<DealDetailDTO> getDealsByAgentForAdmin(Long agentId) {
        logger.info("👤 Fetching all deals for agent {} (Admin view)", agentId);
        List<DealStatus> deals = dealStatusRepository.findByAgentId(agentId);
        logger.info(" -> Found {} deals for agent {}", deals.size(), agentId);
        return deals.stream()
                .map(this::convertToDealDetailDTO)
                .collect(Collectors.toList());
    }

    // ==================== CONVERT TO DETAIL DTO (CORRECTED) ====================
    /**
     * Private helper method to convert a DealStatus entity to a DealDetailDTO.
     * Includes details of property, buyer, seller, and agent.
     * ⭐ CORRECTED: Now includes document upload flags.
     */
    private DealDetailDTO convertToDealDetailDTO(DealStatus deal) {
        if (deal == null) {
            logger.warn("Attempted to convert a null DealStatus to DTO.");
            return null;
        }
        DealDetailDTO dto = new DealDetailDTO();

        // Basic Deal Info
        dto.setDealId(deal.getId());
        dto.setStage(deal.getStage() != null ? deal.getStage().name() : "UNKNOWN");
        dto.setCurrentStage(deal.getStage() != null ? deal.getStage().name() : "UNKNOWN");
        dto.setAgreedPrice(deal.getAgreedPrice()); // Can be null
        dto.setNotes(deal.getNotes());
        dto.setCreatedAt(deal.getCreatedAt());
        dto.setUpdatedAt(deal.getUpdatedAt());
        dto.setLastUpdatedBy(deal.getLastUpdatedBy());

        // ✅ ADDED: Document upload flags
        dto.setAgreementUploaded(deal.isAgreementUploaded());
        dto.setRegistrationUploaded(deal.isRegistrationUploaded());

        // Property & Seller Info
        Property property = deal.getProperty();
        if (property != null) {
            dto.setPropertyId(property.getId());
            dto.setPropertyTitle(property.getTitle());
            dto.setPropertyPrice(property.getPrice());
            dto.setPropertyCity(property.getCity());

            // Seller is the user associated with the property
            User seller = property.getUser();
            if (seller != null) {
                dto.setSellerId(seller.getId());
                dto.setSellerName(seller.getFirstName() + " " + seller.getLastName());
                dto.setSellerEmail(seller.getEmail());
                dto.setSellerMobile(seller.getMobileNumber());
            } else {
                logger.warn("Deal {} refers to Property {} which has no associated User (Seller).", deal.getId(), property.getId());
            }
        } else {
            logger.warn("Deal {} has no associated Property.", deal.getId());
        }

        // Buyer Info
        User buyer = deal.getBuyer();
        if (buyer != null) {
            dto.setBuyerId(buyer.getId());
            dto.setBuyerName(buyer.getFirstName() + " " + buyer.getLastName());
            dto.setBuyerEmail(buyer.getEmail());
            dto.setBuyerMobile(buyer.getMobileNumber());
        } else {
            logger.warn("Deal {} has no associated Buyer.", deal.getId());
        }

        // Agent Info
        User agent = deal.getAgent();
        if (agent != null) {
            dto.setAgentId(agent.getId());
            dto.setAgentName(agent.getFirstName() + " " + agent.getLastName());
            dto.setAgentEmail(agent.getEmail());
            dto.setAgentMobile(agent.getMobileNumber());
        } // Agent can be null, so no warning needed

        // Stage Timestamps
        dto.setInquiryDate(deal.getInquiryDate());
        dto.setShortlistDate(deal.getShortlistDate());
        dto.setNegotiationDate(deal.getNegotiationDate());
        dto.setAgreementDate(deal.getAgreementDate());
        dto.setRegistrationDate(deal.getRegistrationDate());
        dto.setPaymentDate(deal.getPaymentDate());
        dto.setCompletedDate(deal.getCompletedDate());

        return dto;
    }

    // ==================== UPDATE DEAL STAGE ====================
    /**
     * Updates the stage of a specific deal.
     * Sets the timestamp for the new stage if not already set.
     * Appends notes with user and timestamp.
     */
    public DealStatus updateDealStage(Long dealId, DealStatus.DealStage newStage,
                                      String notes, String updatedByUsername) {
        logger.info("Attempting to update deal {} to stage {} by user {}", dealId, newStage, updatedByUsername);

        DealStatus deal = dealStatusRepository.findDealWithRelations(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));


        // Prevent moving to a previous stage (based on enum order)
        if (deal.getStage() != null && newStage.getOrder() < deal.getStage().getOrder()) {
            logger.warn("❌ Failed update: Cannot move deal {} from {} to previous stage {}", dealId, deal.getStage(), newStage);
            throw new RuntimeException("Cannot move deal to a previous stage");
        }

        // If stage is the same and no notes are added, do nothing
        if (newStage == deal.getStage() && (notes == null || notes.trim().isEmpty())) {
            logger.warn("ℹ️ No update needed: Deal {} is already in stage {}. No new notes provided.", dealId, newStage);
            return deal; // Return existing deal without saving
        }

        DealStatus.DealStage oldStage = deal.getStage();
        deal.setStage(newStage);
        LocalDateTime now = LocalDateTime.now();

        // Set the corresponding stage date field, but only if it's null (first time reaching this stage)
        switch (newStage) {
            case INQUIRY: if (deal.getInquiryDate() == null) deal.setInquiryDate(now); break;
            case SHORTLIST: if (deal.getShortlistDate() == null) deal.setShortlistDate(now); break;
            case NEGOTIATION: if (deal.getNegotiationDate() == null) deal.setNegotiationDate(now); break;
            case AGREEMENT: if (deal.getAgreementDate() == null) deal.setAgreementDate(now); break;
            case REGISTRATION: if (deal.getRegistrationDate() == null) deal.setRegistrationDate(now); break;
            case PAYMENT: if (deal.getPaymentDate() == null) deal.setPaymentDate(now); break;
            case COMPLETED: if (deal.getCompletedDate() == null) deal.setCompletedDate(now); break;
        }

        // Append notes if provided
        if (notes != null && !notes.trim().isEmpty()) {
            String existingNotes = deal.getNotes() != null ? deal.getNotes() : "";
            // Add newline only if existing notes are present
            String separator = existingNotes.isEmpty() ? "" : "\n";
            String timestamp = now.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            String newNotesEntry = "[" + timestamp + " - " + updatedByUsername + "] " + notes.trim();
            deal.setNotes(existingNotes + separator + newNotesEntry);
        }

        // Update metadata
        deal.setLastUpdatedBy(updatedByUsername);
        // Note: `updated_at` should be handled automatically by your JPA entity or DB trigger
        // If not, uncomment the line below:
        // deal.setUpdatedAt(LocalDateTime.now());

        DealStatus updatedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Deal {} updated successfully from {} to {}", dealId, oldStage, newStage);
        return updatedDeal;
    }

    // ==================== OTHER DEAL METHODS ====================

    /**
     * Assigns an agent to a specific deal.
     */
    public DealStatus assignAgentToDeal(Long dealId, Long agentId, String updatedByUsername) {
        logger.info("Assigning agent {} to deal {} by user {}", agentId, dealId, updatedByUsername);
        DealStatus deal = getDealById(dealId); // Reuse getDealById for consistency
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent user not found with ID: " + agentId));

        // Ensure the user being assigned is actually an AGENT or ADMIN
        if (!agent.getRole().equals(User.UserRole.AGENT) && !agent.getRole().equals(User.UserRole.ADMIN)) {
            logger.warn("❌ Failed assignment: User {} is not an agent or admin.", agentId);
            throw new RuntimeException("User being assigned is not an agent or admin");
        }

        deal.setAgent(agent);
        deal.setLastUpdatedBy(updatedByUsername);
        // `updated_at` handled automatically
        return dealStatusRepository.save(deal);
    }

    /**
     * Gets a single deal by its ID, throwing exception if not found.
     */
    public DealStatus getDealById(Long dealId) {
        return dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found with ID: " + dealId));
    }

    /**
     * Gets all deals associated with a specific property, returned as DTOs.
     * Useful for a controller endpoint like /api/deals/property/{propertyId}
     */
    public List<DealDetailDTO> getDealsForPropertyAsDTO(Long propertyId) {
        logger.info("Fetching deals as DTO for property ID: {}", propertyId);
        List<DealStatus> deals = dealStatusRepository.findByPropertyId(propertyId);
        logger.info(" -> Found {} deals for property {}", deals.size(), propertyId);
        return deals.stream()
                .map(this::convertToDealDetailDTO) // Converts each deal to DTO
                .filter(Objects::nonNull) // Filter out any null DTOs from conversion issues
                .collect(Collectors.toList());
    }

    /**
     * Gets all deals associated with a specific property (internal use).
     */
    public List<DealStatus> getDealsForProperty(Long propertyId) {
        return dealStatusRepository.findByPropertyId(propertyId);
    }

    /**
     * Gets all deals associated with a specific agent.
     */
    public List<DealStatus> getDealsForAgent(Long agentId) {
        return dealStatusRepository.findByAgentId(agentId);
    }

    /**
     * Gets only active (not COMPLETED) deals for a specific agent.
     * Requires a custom query in the repository: findActiveDealsForAgent.
     */
    public List<DealStatus> getActiveDealsForAgent(Long agentId) {
        // Assuming findActiveDealsForAgent exists in the repository
        return dealStatusRepository.findActiveDealsForAgent(agentId);
    }

    /**
     * Gets all deals where a specific user is the buyer.
     */
    public List<DealStatus> getBuyerDeals(Long buyerId) {
        return dealStatusRepository.findByBuyerId(buyerId);
    }

    /**
     * Gets only active (not COMPLETED) deals where a specific user is the buyer.
     * Requires a custom query in the repository: findActiveDealForBuyer.
     */
    public List<DealStatus> getActiveDealForBuyer(Long buyerId) {
        // Assuming findActiveDealForBuyer exists in the repository
        return dealStatusRepository.findActiveDealForBuyer(buyerId);
    }

    /**
     * Gets all deals currently in a specific stage.
     */
    public List<DealStatus> getDealsByStage(DealStatus.DealStage stage) {
        return dealStatusRepository.findByStage(stage);
    }

    /**
     * Counts the number of deals currently in a specific stage.
     */
    public Long getCountByStage(DealStatus.DealStage stage) {
        return dealStatusRepository.countByStage(stage);
    }

    /**
     * Gets deals for a specific agent that are currently in a specific stage.
     */
    public List<DealStatus> getAgentDealsAtStage(Long agentId, DealStatus.DealStage stage) {
        return dealStatusRepository.findByAgentIdAndStage(agentId, stage);
    }

    /**
     * Finds an existing deal for a property and buyer, or creates a new one if none exists.
     */
    public DealStatus findOrCreateDeal(Long propertyId, Long buyerId, Long agentId) {
        Optional<DealStatus> existing = dealStatusRepository
                .findByPropertyIdAndBuyerId(propertyId, buyerId);

        if (existing.isPresent()) {
            logger.info("Found existing deal {} for property {} and buyer {}", existing.get().getId(), propertyId, buyerId);
            return existing.get();
        } else {
            logger.info("No existing deal found for property {} and buyer {}. Creating new one.", propertyId, buyerId);
            // Use the basic createDeal method here
            return createDeal(propertyId, buyerId, agentId);
        }
    }

    /**
     * ✅ Sets document upload flag for a deal
     */
    @Transactional
    public void setDocumentFlag(Long dealId, String docType) {
        logger.info("Setting document flag - Deal ID: {}, DocType: {}", dealId, docType);

        DealStatus deal = dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found with id: " + dealId));

        if ("AGREEMENT".equalsIgnoreCase(docType)) {
            deal.setAgreementUploaded(true);
            logger.info("✅ Agreement document flag set to TRUE for Deal ID: {}", dealId);
        } else if ("REGISTRATION".equalsIgnoreCase(docType)) {
            deal.setRegistrationUploaded(true);
            logger.info("✅ Registration document flag set to TRUE for Deal ID: {}", dealId);
        } else {
            logger.warn("⚠️ Invalid document type: {}", docType);
            throw new IllegalArgumentException("Invalid document type: " + docType + ". Must be AGREEMENT or REGISTRATION");
        }

        deal.setUpdatedAt(LocalDateTime.now());
        dealStatusRepository.save(deal);
    }

    // ==================== DUPLICATE METHODS REMOVED ====================
    // The duplicate convertToDealDetailDTO and getDealsByRole methods
    // that were here have been removed to fix the ambiguity error.
}