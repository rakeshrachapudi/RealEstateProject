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

    // ==================== CASCADE DELETE METHODS ====================

    /**
     * DELETE ALL DEALS FOR AN AGENT (CASCADE DELETE)
     */
    @Transactional
    public void deleteAllDealsForAgent(Long agentId) {
        logger.info("🗑️ CASCADE DELETE: Deleting all deals for agent ID: {}", agentId);

        List<DealStatus> agentDeals = dealStatusRepository.findByAgentId(agentId);

        if (agentDeals.isEmpty()) {
            logger.info("✅ No deals found for agent {}. Nothing to delete.", agentId);
            return;
        }

        logger.info("Found {} deals assigned to agent {}. Deleting...", agentDeals.size(), agentId);

        for (DealStatus deal : agentDeals) {
            logger.info("  - Deleting Deal ID: {} (Property: {}, Buyer: {})",
                    deal.getId(),
                    deal.getProperty() != null ? deal.getProperty().getId() : "N/A",
                    deal.getBuyer() != null ? deal.getBuyer().getId() : "N/A");
        }

        dealStatusRepository.deleteAll(agentDeals);
        logger.info("✅ Successfully deleted {} deals for agent {}", agentDeals.size(), agentId);
    }

    /**
     * DELETE ALL DEALS FOR A USER (CASCADE DELETE)
     */
    @Transactional
    public void deleteAllDealsForUser(Long userId) {
        logger.info("🗑️ CASCADE DELETE: Deleting all deals for user ID: {}", userId);

        List<DealStatus> buyerDeals = dealStatusRepository.findByBuyerId(userId);
        logger.info("Found {} deals where user {} is the BUYER", buyerDeals.size(), userId);

        List<Property> userProperties = propertyRepository.findByUserId(userId);
        logger.info("Found {} properties owned by user {}", userProperties.size(), userId);

        List<DealStatus> sellerDeals = new ArrayList<>();
        for (Property property : userProperties) {
            List<DealStatus> propertyDeals = dealStatusRepository.findByPropertyId(property.getId());
            sellerDeals.addAll(propertyDeals);
        }
        logger.info("Found {} deals where user {} is the SELLER", sellerDeals.size(), userId);

        Set<DealStatus> allDealsToDelete = new HashSet<>();
        allDealsToDelete.addAll(buyerDeals);
        allDealsToDelete.addAll(sellerDeals);

        if (allDealsToDelete.isEmpty()) {
            logger.info("✅ No deals found for user {}. Nothing to delete.", userId);
            return;
        }

        logger.info("Total unique deals to delete: {}", allDealsToDelete.size());

        for (DealStatus deal : allDealsToDelete) {
            logger.info("  - Deleting Deal ID: {} (Property: {}, Stage: {})",
                    deal.getId(),
                    deal.getProperty() != null ? deal.getProperty().getTitle() : "N/A",
                    deal.getStage());
        }

        dealStatusRepository.deleteAll(allDealsToDelete);
        logger.info("✅ Successfully deleted {} deals for user {}", allDealsToDelete.size(), userId);
    }

    /**
     * DELETE ALL DEALS FOR A PROPERTY (CASCADE DELETE)
     */
    @Transactional
    public void deleteAllDealsForProperty(Long propertyId) {
        logger.info("🗑️ CASCADE DELETE: Deleting all deals for property ID: {}", propertyId);

        List<DealStatus> propertyDeals = dealStatusRepository.findByPropertyId(propertyId);

        if (propertyDeals.isEmpty()) {
            logger.info("✅ No deals found for property {}. Nothing to delete.", propertyId);
            return;
        }

        logger.info("Found {} deals for property {}. Deleting...", propertyDeals.size(), propertyId);

        for (DealStatus deal : propertyDeals) {
            logger.info("  - Deleting Deal ID: {} (Buyer: {}, Agent: {}, Stage: {})",
                    deal.getId(),
                    deal.getBuyer() != null ? deal.getBuyer().getId() : "N/A",
                    deal.getAgent() != null ? deal.getAgent().getId() : "N/A",
                    deal.getStage());
        }

        dealStatusRepository.deleteAll(propertyDeals);
        logger.info("✅ Successfully deleted {} deals for property {}", propertyDeals.size(), propertyId);
    }

    // ==================== CREATE DEAL WITH PRICE ====================
    /**
     * Creates a new deal with agreed price (typically by an agent)
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
        deal.setStage(DealStatus.DealStage.INQUIRY);
        deal.setAgreedPrice(dto.getAgreedPrice());
        deal.setNotes(dto.getNotes() != null ? dto.getNotes() : "Deal initiated - Agreed Price: " + dto.getAgreedPrice());
        deal.setLastUpdatedBy(agent.getUsername());
        deal.setInquiryDate(LocalDateTime.now());

        DealStatus savedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Deal created with price - Deal ID: {}, Property ID: {}, Buyer ID: {}, Agent ID: {}, Price: {}",
                savedDeal.getId(), property.getId(), buyer.getId(), agent.getId(), savedDeal.getAgreedPrice());
        return savedDeal;
    }

    // ==================== CREATE DEAL (3 PARAMETERS - BACKWARD COMPATIBLE) ====================
    /**
     * Creates a basic deal without agreed price (backward compatible)
     */
    public DealStatus createDeal(Long propertyId, Long buyerId, Long agentId) {
        logger.info("Creating basic deal - Property: {}, Buyer: {}, Agent: {}",
                propertyId, buyerId, agentId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with ID: " + propertyId));

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer user not found with ID: " + buyerId));

        if (dealStatusRepository.existsByPropertyIdAndBuyerId(propertyId, buyerId)) {
            logger.warn("Attempted to create duplicate deal for property {} and buyer {}", propertyId, buyerId);
            throw new RuntimeException("Deal already exists for this property and buyer");
        }

        User agent = null;
        if (agentId != null) {
            agent = userRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent user not found with ID: " + agentId));

            if (!agent.getRole().equals(User.UserRole.AGENT) && !agent.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("Attempted to assign non-agent user {} to deal.", agentId);
                throw new RuntimeException("Assigned user is not an agent or admin");
            }
        }

        DealStatus deal = new DealStatus();
        deal.setProperty(property);
        deal.setBuyer(buyer);
        deal.setAgent(agent);
        deal.setStage(DealStatus.DealStage.INQUIRY);
        deal.setNotes("Deal initiated - Initial Inquiry");
        deal.setLastUpdatedBy(buyer.getUsername());
        deal.setInquiryDate(LocalDateTime.now());

        DealStatus savedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Basic Deal created - Deal ID: {}, Property ID: {}, Buyer ID: {}",
                savedDeal.getId(), property.getId(), buyer.getId());
        return savedDeal;
    }

    // ==================== ⭐ NEW: CREATE DEAL WITH AGREED PRICE (4 PARAMETERS) ====================
    /**
     * ⭐ CRITICAL: Overloaded method that accepts agreed price
     * This is called from the frontend when users create deals with offer amounts
     */
    public DealStatus createDeal(Long propertyId, Long buyerId, Long agentId, Double agreedPrice) {
        logger.info("Creating deal with agreed price - Property: {}, Buyer: {}, Agent: {}, AgreedPrice: {}",
                propertyId, buyerId, agentId, agreedPrice);

        // Validate property exists
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> {
                    logger.error("Property not found with ID: {}", propertyId);
                    return new RuntimeException("Property not found with ID: " + propertyId);
                });

        // Validate buyer exists
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> {
                    logger.error("Buyer user not found with ID: {}", buyerId);
                    return new RuntimeException("Buyer user not found with ID: " + buyerId);
                });

        // Check for duplicate deal
        if (dealStatusRepository.existsByPropertyIdAndBuyerId(propertyId, buyerId)) {
            logger.warn("Deal already exists for property {} and buyer {}", propertyId, buyerId);
            throw new RuntimeException("Deal already exists for this property and buyer");
        }

        // Validate buyer is not the property owner
        if (property.getUser() != null && property.getUser().getId().equals(buyerId)) {
            logger.warn("Buyer cannot create deal on their own property: {}, {}", buyerId, propertyId);
            throw new RuntimeException("Cannot create deal on your own property");
        }

        // Handle optional agent
        User agent = null;
        if (agentId != null) {
            agent = userRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent user not found with ID: " + agentId));

            if (!agent.getRole().equals(User.UserRole.AGENT) && !agent.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("User is not an agent or admin: {}", agentId);
                throw new RuntimeException("Assigned user is not an agent or admin");
            }
        }

        // ✅ CREATE THE DEAL - FIXED TO START AT INQUIRY
        DealStatus deal = new DealStatus();
        deal.setProperty(property);
        deal.setBuyer(buyer);
        deal.setAgent(agent);
        deal.setStage(DealStatus.DealStage.INQUIRY); // ✅ FIXED - Start at INQUIRY

        // Set agreed price if provided
        if (agreedPrice != null && agreedPrice > 0) {
            deal.setAgreedPrice(BigDecimal.valueOf(agreedPrice));
            deal.setNotes("Deal initiated with offer amount: " + agreedPrice);
            logger.info("Agreed price set: {}", agreedPrice);
        } else {
            deal.setNotes("Deal initiated - Initial Inquiry");
        }

        deal.setLastUpdatedBy(buyer.getUsername());
        deal.setInquiryDate(LocalDateTime.now());
        // ✅ REMOVED - Don't set shortlist date for INQUIRY stage
        // deal.setShortlistDate(LocalDateTime.now());

        DealStatus savedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Deal created successfully - Deal ID: {}, Property: {}, Buyer: {}, Stage: INQUIRY, AgreedPrice: {}",
                savedDeal.getId(), propertyId, buyerId, savedDeal.getAgreedPrice());

        return savedDeal;
    }


    // ==================== ROLE-BASED DEAL FETCHING ====================
    public List<DealDetailDTO> getDealsByRole(Long userId, String userRole) {
        logger.info("Fetching deals for user ID: {} with provided role: '{}'", userId, userRole);

        List<DealStatus> deals = new ArrayList<>();
        String normalizedRole = (userRole != null) ? userRole : "UNKNOWN";
        logger.info("Normalized role for processing: '{}'", normalizedRole);

        switch (normalizedRole) {
            case "USER":
            case "BROKER":
                logger.info("Processing as USER role for user {}", userId);
                List<DealStatus> buyerDeals = dealStatusRepository.findByBuyerId(userId);
                logger.info("Found {} deals where user {} is BUYER", buyerDeals.size(), userId);
                deals.addAll(buyerDeals);

                List<Property> userProperties = propertyRepository.findByUserId(userId);
                logger.info("Found {} properties owned by user {}", userProperties.size(), userId);

                for (Property property : userProperties) {
                    List<DealStatus> propertyDeals = dealStatusRepository.findByPropertyId(property.getId());
                    logger.info("Property ID {} has {} deals", property.getId(), propertyDeals.size());
                    deals.addAll(propertyDeals);
                }
                break;

            case "AGENT":
                logger.info("Processing as AGENT role for user {}", userId);
                deals = dealStatusRepository.findByAgentId(userId);
                logger.info("Found {} deals for agent {}", deals.size(), userId);
                break;

            case "ADMIN":
                logger.info("Processing as ADMIN role - fetching all deals");
                deals = dealStatusRepository.findAll();
                logger.info("Found {} total deals", deals.size());
                break;

            default:
                logger.error("Invalid or unknown role: '{}'", normalizedRole);
                throw new RuntimeException("Invalid role: " + normalizedRole);
        }

        logger.info("Total deals found before conversion: {}", deals.size());
        List<DealDetailDTO> dtos = deals.stream()
                .map(this::convertToDealDetailDTO)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        logger.info("Successfully converted {} deals to DTOs", dtos.size());
        return dtos;
    }

    // ==================== CONVERT TO DTO ====================
    private DealDetailDTO convertToDealDetailDTO(DealStatus deal) {
        if (deal == null) {
            logger.warn("Attempted to convert null deal to DTO");
            return null;
        }

        DealDetailDTO dto = new DealDetailDTO();
        dto.setDealId(deal.getId());
        dto.setStage(deal.getStage() != null ? deal.getStage().toString() : "UNKNOWN");
        dto.setAgreedPrice(deal.getAgreedPrice());
        dto.setNotes(deal.getNotes());
        dto.setCreatedAt(deal.getCreatedAt());
        dto.setUpdatedAt(deal.getUpdatedAt());
        dto.setLastUpdatedBy(deal.getLastUpdatedBy());

        Property property = deal.getProperty();
        if (property != null) {
            dto.setPropertyId(property.getId());
            dto.setPropertyTitle(property.getTitle());
            dto.setPropertyPrice(property.getPrice());
            dto.setPropertyCity(property.getCity());

            User seller = property.getUser();
            if (seller != null) {
                dto.setSellerName(seller.getFirstName() + " " + seller.getLastName());
                dto.setSellerEmail(seller.getEmail());
                dto.setSellerMobile(seller.getMobileNumber());
            }
        }

        User buyer = deal.getBuyer();
        if (buyer != null) {
            dto.setBuyerName(buyer.getFirstName() + " " + buyer.getLastName());
            dto.setBuyerEmail(buyer.getEmail());
            dto.setBuyerMobile(buyer.getMobileNumber());
        }

        User agent = deal.getAgent();
        if (agent != null) {
            dto.setAgentName(agent.getFirstName() + " " + agent.getLastName());
            dto.setAgentEmail(agent.getEmail());
            dto.setAgentMobile(agent.getMobileNumber());
        }

        dto.setInquiryDate(deal.getInquiryDate());
        dto.setShortlistDate(deal.getShortlistDate());
        dto.setNegotiationDate(deal.getNegotiationDate());
        dto.setAgreementDate(deal.getAgreementDate());
        dto.setRegistrationDate(deal.getRegistrationDate());
        dto.setPaymentDate(deal.getPaymentDate());
        dto.setCompletedDate(deal.getCompletedDate());

        // Document upload flags
        dto.setAgreementUploaded(deal.isAgreementUploaded());
        dto.setRegistrationUploaded(deal.isRegistrationUploaded());

        return dto;
    }

    // ==================== UPDATE DEAL STAGE ====================
    public DealStatus updateDealStage(Long dealId, DealStatus.DealStage newStage,
                                      String notes, String updatedByUsername) {
        logger.info("Attempting to update deal {} to stage {} by user {}", dealId, newStage, updatedByUsername);

        DealStatus deal = dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        if (newStage == deal.getStage() && (notes == null || notes.trim().isEmpty())) {
            logger.warn("ℹ️ No update needed: Deal {} is already in stage {}. No new notes provided.", dealId, newStage);
            return deal;
        }

        if (deal.getStage() != null && newStage.getOrder() < deal.getStage().getOrder()) {
            logger.warn("❌ Failed update: Cannot move deal {} from {} to previous stage {}", dealId, deal.getStage(), newStage);
            throw new RuntimeException("Cannot move deal to a previous stage");
        }

        if (newStage == DealStatus.DealStage.REGISTRATION && !deal.isAgreementUploaded()) {
            logger.warn("❌ Failed update: Deal {} cannot move to REGISTRATION. Agreement is not uploaded.", dealId);
            throw new RuntimeException("Agreement document must be uploaded to move to Registration stage.");
        }

        if (newStage == DealStatus.DealStage.PAYMENT && !deal.isRegistrationUploaded()) {
            logger.warn("❌ Failed update: Deal {} cannot move to PAYMENT. Registration document is not uploaded.", dealId);
            throw new RuntimeException("Registration document must be uploaded to move to Payment stage.");
        }

        DealStatus.DealStage oldStage = deal.getStage();
        deal.setStage(newStage);
        LocalDateTime now = LocalDateTime.now();

        switch (newStage) {
            case INQUIRY: if (deal.getInquiryDate() == null) deal.setInquiryDate(now); break;
            case SHORTLIST: if (deal.getShortlistDate() == null) deal.setShortlistDate(now); break;
            case NEGOTIATION: if (deal.getNegotiationDate() == null) deal.setNegotiationDate(now); break;
            case AGREEMENT: if (deal.getAgreementDate() == null) deal.setAgreementDate(now); break;
            case REGISTRATION: if (deal.getRegistrationDate() == null) deal.setRegistrationDate(now); break;
            case PAYMENT: if (deal.getPaymentDate() == null) deal.setPaymentDate(now); break;
            case COMPLETED: if (deal.getCompletedDate() == null) deal.setCompletedDate(now); break;
        }

        if (notes != null && !notes.trim().isEmpty()) {
            String existingNotes = deal.getNotes() != null ? deal.getNotes() : "";
            String separator = existingNotes.isEmpty() ? "" : "\n";
            String timestamp = now.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            String newNotesEntry = "[" + timestamp + " - " + updatedByUsername + "] " + notes.trim();
            deal.setNotes(existingNotes + separator + newNotesEntry);
        }

        deal.setLastUpdatedBy(updatedByUsername);
        deal.setUpdatedAt(LocalDateTime.now());

        DealStatus updatedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Deal {} updated successfully from {} to {}", dealId, oldStage, newStage);
        return updatedDeal;
    }

    // ==================== ADMIN DASHBOARD & METRICS ====================

    /**
     * Get admin dashboard statistics
     */
    public AdminDealDashboardDTO getAdminDashboard() {
        logger.info("Generating admin dashboard statistics");

        AdminDealDashboardDTO dashboard = new AdminDealDashboardDTO();

        try {
            long totalDeals = dealStatusRepository.count();
            dashboard.setTotalDeals(totalDeals);

            for (DealStatus.DealStage stage : DealStatus.DealStage.values()) {
                Long count = dealStatusRepository.countByStage(stage);
                switch (stage) {
                    case INQUIRY: dashboard.setInquiryCount(count); break;
                    case SHORTLIST: dashboard.setShortlistCount(count); break;
                    case NEGOTIATION: dashboard.setNegotiationCount(count); break;
                    case AGREEMENT: dashboard.setAgreementCount(count); break;
                    case REGISTRATION: dashboard.setRegistrationCount(count); break;
                    case PAYMENT: dashboard.setPaymentCount(count); break;
                    case COMPLETED: dashboard.setCompletedCount(count); break;
                }
            }

            logger.info("✅ Admin dashboard generated - Total deals: {}", totalDeals);
            return dashboard;

        } catch (Exception e) {
            logger.error("❌ Error generating admin dashboard", e);
            throw new RuntimeException("Failed to generate admin dashboard", e);
        }
    }

    /**
     * Get agent performance metrics
     */
    public List<AgentPerformanceDTO> getAgentPerformanceMetrics() {
        logger.info("Generating agent performance metrics");

        try {
            List<User> agents = userRepository.findByRole(User.UserRole.AGENT);

            List<AgentPerformanceDTO> metrics = agents.stream()
                    .map(agent -> {
                        AgentPerformanceDTO dto = new AgentPerformanceDTO();
                        dto.setAgentId(agent.getId());
                        dto.setAgentName(agent.getFirstName() + " " + agent.getLastName());
                        dto.setAgentEmail(agent.getEmail());

                        List<DealStatus> agentDeals = dealStatusRepository.findByAgentId(agent.getId());
                        dto.setTotalDeals((long) agentDeals.size());

                        long activeDeals = agentDeals.stream()
                                .filter(deal -> deal.getStage() != DealStatus.DealStage.COMPLETED)
                                .count();
                        dto.setActiveDeals(activeDeals);

                        long completedDeals = agentDeals.stream()
                                .filter(deal -> deal.getStage() == DealStatus.DealStage.COMPLETED)
                                .count();
                        dto.setCompletedDeals(completedDeals);

                        BigDecimal totalValue = agentDeals.stream()
                                .filter(deal -> deal.getAgreedPrice() != null)
                                .map(DealStatus::getAgreedPrice)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        dto.setTotalDealValue(totalValue);

                        return dto;
                    })
                    .collect(Collectors.toList());

            logger.info("✅ Generated performance metrics for {} agents", metrics.size());
            return metrics;

        } catch (Exception e) {
            logger.error("❌ Error generating agent performance metrics", e);
            throw new RuntimeException("Failed to generate agent performance metrics", e);
        }
    }

    // ==================== OTHER DEAL METHODS ====================

    public DealStatus assignAgentToDeal(Long dealId, Long agentId, String updatedByUsername) {
        logger.info("Assigning agent {} to deal {} by user {}", agentId, dealId, updatedByUsername);
        DealStatus deal = getDealById(dealId);
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent user not found with ID: " + agentId));

        if (!agent.getRole().equals(User.UserRole.AGENT) && !agent.getRole().equals(User.UserRole.ADMIN)) {
            logger.warn("❌ Failed assignment: User {} is not an agent or admin.", agentId);
            throw new RuntimeException("User being assigned is not an agent or admin");
        }

        deal.setAgent(agent);
        deal.setLastUpdatedBy(updatedByUsername);
        return dealStatusRepository.save(deal);
    }

    public DealStatus getDealById(Long dealId) {
        return dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found with ID: " + dealId));
    }

    public List<DealDetailDTO> getDealsForPropertyAsDTO(Long propertyId) {
        logger.info("Fetching deals as DTO for property ID: {}", propertyId);
        List<DealStatus> deals = dealStatusRepository.findByPropertyId(propertyId);
        logger.info(" -> Found {} deals for property {}", deals.size(), propertyId);
        return deals.stream()
                .map(this::convertToDealDetailDTO)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<DealStatus> getDealsForProperty(Long propertyId) {
        return dealStatusRepository.findByPropertyId(propertyId);
    }

    public List<DealStatus> getDealsForAgent(Long agentId) {
        return dealStatusRepository.findByAgentId(agentId);
    }

    /**
     * Get deals by agent for admin - returns DTOs
     */
    public List<DealDetailDTO> getDealsByAgentForAdmin(Long agentId) {
        logger.info("Admin fetching deals for agent ID: {}", agentId);
        List<DealStatus> deals = dealStatusRepository.findByAgentId(agentId);
        return deals.stream()
                .map(this::convertToDealDetailDTO)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public List<DealStatus> getActiveDealsForAgent(Long agentId) {
        return dealStatusRepository.findActiveDealsForAgent(agentId);
    }

    public List<DealStatus> getBuyerDeals(Long buyerId) {
        return dealStatusRepository.findByBuyerId(buyerId);
    }

    public List<DealStatus> getActiveDealForBuyer(Long buyerId) {
        return dealStatusRepository.findActiveDealForBuyer(buyerId);
    }

    public List<DealStatus> getDealsByStage(DealStatus.DealStage stage) {
        return dealStatusRepository.findByStage(stage);
    }

    public Long getCountByStage(DealStatus.DealStage stage) {
        return dealStatusRepository.countByStage(stage);
    }

    public List<DealStatus> getAgentDealsAtStage(Long agentId, DealStatus.DealStage stage) {
        return dealStatusRepository.findByAgentIdAndStage(agentId, stage);
    }

    public DealStatus findOrCreateDeal(Long propertyId, Long buyerId, Long agentId) {
        Optional<DealStatus> existing = dealStatusRepository
                .findByPropertyIdAndBuyerId(propertyId, buyerId);

        if (existing.isPresent()) {
            logger.info("Found existing deal {} for property {} and buyer {}", existing.get().getId(), propertyId, buyerId);
            return existing.get();
        } else {
            logger.info("No existing deal found for property {} and buyer {}. Creating new one.", propertyId, buyerId);
            return createDeal(propertyId, buyerId, agentId);
        }
    }

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

    /**
     * DELETE A SINGLE DEAL BY ID
     */
    @Transactional
    public void deleteDeal(Long dealId) {
        logger.info("🗑️ Deleting single deal with ID: {}", dealId);

        DealStatus deal = dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found with ID: " + dealId));

        logger.info("Deleting Deal ID: {} (Property: {}, Buyer: {}, Stage: {})",
                deal.getId(),
                deal.getProperty() != null ? deal.getProperty().getTitle() : "N/A",
                deal.getBuyer() != null ? deal.getBuyer().getId() : "N/A",
                deal.getStage());

        dealStatusRepository.delete(deal);

        logger.info("✅ Successfully deleted deal {}", dealId);
    }

}