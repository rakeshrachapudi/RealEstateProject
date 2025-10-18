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
     * ⭐ CORRECTED: Create deal with agreed price
     * Only AGENT can create deals (enforce in controller)
     * Agent cannot create deals on properties they own
     */
    public DealStatus createDealWithPrice(CreateDealWithPriceRequestDto dto, Long agentId) {
        logger.info("Creating deal with price - Property: {}, Buyer: {}, Agent: {}, Price: {}",
                dto.getPropertyId(), dto.getBuyerId(), agentId, dto.getAgreedPrice());

        // Validate property exists
        Property property = propertyRepository.findById(dto.getPropertyId())
                .orElseThrow(() -> {
                    logger.error("Property not found: {}", dto.getPropertyId());
                    return new RuntimeException("Property not found");
                });

        // Validate buyer exists
        User buyer = userRepository.findById(dto.getBuyerId())
                .orElseThrow(() -> {
                    logger.error("Buyer not found: {}", dto.getBuyerId());
                    return new RuntimeException("Buyer not found");
                });

        // ✅ FIXED: agentId() -> agentId (removed parentheses)
        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> {
                    logger.error("Agent not found: {}", agentId);
                    return new RuntimeException("Agent not found");
                });

        // Verify agent has AGENT role
        if (!agent.getRole().equals(User.UserRole.AGENT) &&
                !agent.getRole().equals(User.UserRole.ADMIN)) {
            logger.warn("User {} is not an agent", agentId);
            throw new RuntimeException("Only agents can create deals");
        }

        // ✅ NEW: Verify agent is not the property owner
        if (property.getUser() != null && property.getUser().getId().equals(agentId)) {
            logger.warn("Agent {} cannot create deal on property they own", agentId);
            throw new RuntimeException("Agents cannot create deals on properties they own");
        }

        // ✅ NEW: Verify buyer is not the property owner
        if (property.getUser() != null && property.getUser().getId().equals(dto.getBuyerId())) {
            logger.warn("Buyer cannot create deal on property they own");
            throw new RuntimeException("Buyer cannot create deal on their own property");
        }

        // Check for duplicate deal
        if (dealStatusRepository.existsByPropertyIdAndBuyerId(dto.getPropertyId(), dto.getBuyerId())) {
            logger.warn("Deal already exists for property {} and buyer {}",
                    dto.getPropertyId(), dto.getBuyerId());
            throw new RuntimeException("Deal already exists for this property and buyer");
        }

        // Validate agreed price
        if (dto.getAgreedPrice() == null || dto.getAgreedPrice().compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("Invalid agreed price: {}", dto.getAgreedPrice());
            throw new RuntimeException("Agreed price must be greater than 0");
        }

        // Create deal
        DealStatus deal = new DealStatus();
        deal.setProperty(property);
        deal.setBuyer(buyer);
        deal.setAgent(agent);
        deal.setStage(DealStatus.DealStage.INQUIRY);
        deal.setAgreedPrice(dto.getAgreedPrice());
        deal.setNotes(dto.getNotes() != null ? dto.getNotes() : "Deal initiated - Agreed Price: " + dto.getAgreedPrice());
        deal.setLastUpdatedBy(agent.getUsername());

        DealStatus savedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Deal created with price - Deal ID: {}, Agreed Price: {}",
                savedDeal.getId(), savedDeal.getAgreedPrice());
        return savedDeal;
    }

    // ==================== ORIGINAL CREATE DEAL ====================
    public DealStatus createDeal(Long propertyId, Long buyerId, Long agentId) {
        logger.info("Creating new deal - Property: {}, Buyer: {}, Agent: {}",
                propertyId, buyerId, agentId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new RuntimeException("Buyer not found"));

        if (dealStatusRepository.existsByPropertyIdAndBuyerId(propertyId, buyerId)) {
            logger.warn("Deal already exists");
            throw new RuntimeException("Deal already exists for this property and buyer");
        }

        User agent = null;
        if (agentId != null) {
            agent = userRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent not found"));

            if (!agent.getRole().equals(User.UserRole.AGENT) &&
                    !agent.getRole().equals(User.UserRole.ADMIN)) {
                throw new RuntimeException("User is not an agent");
            }
        }

        DealStatus deal = new DealStatus();
        deal.setProperty(property);
        deal.setBuyer(buyer);
        deal.setAgent(agent);
        deal.setStage(DealStatus.DealStage.INQUIRY);
        deal.setNotes("Deal initiated - Initial Inquiry");
        deal.setLastUpdatedBy(buyer.getUsername());

        DealStatus savedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Deal created - Deal ID: {}", savedDeal.getId());
        return savedDeal;
    }

    // ==================== ROLE-BASED DEAL FETCHING ⭐ CORRECTED ====================
    /**
     * ⭐ CORRECTED: Get deals based on user role
     * BUYER: Sees deals where they are the buyer
     * SELLER: Sees deals on their own properties
     * AGENT: Sees deals they created
     * ADMIN: Sees all deals
     */
    public List<DealDetailDTO> getDealsByRole(Long userId, String userRole) {
        logger.info("Fetching deals for user: {} with role: {}", userId, userRole);

        List<DealStatus> deals = new ArrayList<>();

        if ("BUYER".equalsIgnoreCase(userRole)) {
            logger.info("📋 Fetching deals where user {} is BUYER", userId);
            deals = dealStatusRepository.findByBuyerId(userId);

        } else if ("SELLER".equalsIgnoreCase(userRole)) {
            logger.info("📋 Fetching deals where user {} is SELLER", userId);
            // Get all properties owned by this user
            List<Property> sellerProperties = propertyRepository.findByUserId(userId);

            if (!sellerProperties.isEmpty()) {
                List<Long> propertyIds = sellerProperties.stream()
                        .map(Property::getId)
                        .collect(Collectors.toList());

                // Get all deals on seller's properties
                deals = dealStatusRepository.findAll().stream()
                        .filter(d -> propertyIds.contains(d.getProperty().getId()))
                        .sorted(Comparator.comparing(DealStatus::getUpdatedAt).reversed())
                        .collect(Collectors.toList());
            }
            logger.info("🏠 Found {} properties and {} deals for seller {}",
                    sellerProperties.size(), deals.size(), userId);

        } else if ("AGENT".equalsIgnoreCase(userRole)) {
            logger.info("📋 Fetching deals where user {} is AGENT", userId);
            deals = dealStatusRepository.findByAgentId(userId);

        } else if ("ADMIN".equalsIgnoreCase(userRole)) {
            logger.info("📋 Fetching ALL deals for ADMIN");
            deals = dealStatusRepository.findAll();
        }

        logger.info("Found {} deals for role: {}", deals.size(), userRole);
        return deals.stream()
                .map(this::convertToDealDetailDTO)
                .collect(Collectors.toList());
    }

    // ==================== ADMIN DASHBOARD ⭐ CORRECTED ====================
    /**
     * ⭐ CORRECTED: Get admin dashboard with all statistics
     */
    public AdminDealDashboardDTO getAdminDashboard() {
        logger.info("📊 Generating admin dashboard");

        List<DealStatus> allDeals = dealStatusRepository.findAll();
        AdminDealDashboardDTO dashboard = new AdminDealDashboardDTO();

        // Total counts
        Long totalDeals = (long) allDeals.size();
        Long activeDealCount = allDeals.stream()
                .filter(d -> d.getStage() != DealStatus.DealStage.COMPLETED)
                .count();
        Long completedDealCount = allDeals.stream()
                .filter(d -> d.getStage() == DealStatus.DealStage.COMPLETED)
                .count();

        dashboard.setTotalDeals(totalDeals);
        dashboard.setActiveDealCount(activeDealCount);
        dashboard.setCompletedDealCount(completedDealCount);

        // Deals by stage
        Map<String, Long> dealsByStage = new HashMap<>();
        for (DealStatus.DealStage stage : DealStatus.DealStage.values()) {
            long count = allDeals.stream()
                    .filter(d -> d.getStage() == stage)
                    .count();
            dealsByStage.put(stage.name(), count);
        }
        dashboard.setDealsByStage(dealsByStage);

        // Agent performance
        List<AgentPerformanceDTO> agentPerformance = getAgentPerformanceMetrics();
        dashboard.setAgentPerformance(agentPerformance);

        logger.info("✅ Admin dashboard generated - Total deals: {}", totalDeals);
        return dashboard;
    }

    // ==================== AGENT PERFORMANCE METRICS ====================
    /**
     * Get performance metrics for all agents
     */
    public List<AgentPerformanceDTO> getAgentPerformanceMetrics() {
        logger.info("📈 Calculating agent performance metrics");

        List<User> agents = userRepository.findByRole(User.UserRole.AGENT);
        List<AgentPerformanceDTO> performanceList = new ArrayList<>();

        for (User agent : agents) {
            List<DealStatus> agentDeals = dealStatusRepository.findByAgentId(agent.getId());

            Long totalDeals = (long) agentDeals.size();
            Long activeDeals = agentDeals.stream()
                    .filter(d -> d.getStage() != DealStatus.DealStage.COMPLETED)
                    .count();
            Long completedDeals = agentDeals.stream()
                    .filter(d -> d.getStage() == DealStatus.DealStage.COMPLETED)
                    .count();

            // Conversion rate
            String conversionRate = "0%";
            if (totalDeals > 0) {
                double rate = (completedDeals.doubleValue() / totalDeals.doubleValue()) * 100;
                conversionRate = String.format("%.2f%%", rate);
            }

            // Average deal price
            BigDecimal averagePrice = BigDecimal.ZERO;
            if (!agentDeals.isEmpty()) {
                BigDecimal totalPrice = agentDeals.stream()
                        .filter(d -> d.getAgreedPrice() != null)
                        .map(DealStatus::getAgreedPrice)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                averagePrice = totalPrice.divide(BigDecimal.valueOf(agentDeals.size()), BigDecimal.ROUND_HALF_UP);
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

            // Stage breakdown
            performance.setInquiryCount(agentDeals.stream()
                    .filter(d -> d.getStage() == DealStatus.DealStage.INQUIRY).count());
            performance.setShortlistCount(agentDeals.stream()
                    .filter(d -> d.getStage() == DealStatus.DealStage.SHORTLIST).count());
            performance.setNegotiationCount(agentDeals.stream()
                    .filter(d -> d.getStage() == DealStatus.DealStage.NEGOTIATION).count());
            performance.setAgreementCount(agentDeals.stream()
                    .filter(d -> d.getStage() == DealStatus.DealStage.AGREEMENT).count());
            performance.setRegistrationCount(agentDeals.stream()
                    .filter(d -> d.getStage() == DealStatus.DealStage.REGISTRATION).count());
            performance.setPaymentCount(agentDeals.stream()
                    .filter(d -> d.getStage() == DealStatus.DealStage.PAYMENT).count());

            performanceList.add(performance);
        }

        logger.info("✅ Agent performance metrics calculated for {} agents", performanceList.size());
        return performanceList;
    }

    // ==================== GET DEALS BY AGENT (FOR ADMIN) ====================
    /**
     * Get all deals for a specific agent (admin view)
     */
    public List<DealDetailDTO> getDealsByAgentForAdmin(Long agentId) {
        logger.info("👤 Fetching all deals for agent {} (Admin view)", agentId);

        List<DealStatus> deals = dealStatusRepository.findByAgentId(agentId);
        logger.info("Found {} deals for agent {}", deals.size(), agentId);

        return deals.stream()
                .map(this::convertToDealDetailDTO)
                .collect(Collectors.toList());
    }

    // ==================== CONVERT TO DETAIL DTO ====================
    /**
     * Convert DealStatus to DealDetailDTO with all mobile numbers
     */
    // Replace the convertToDealDetailDTO() method in DealService.java with this:

    private DealDetailDTO convertToDealDetailDTO(DealStatus deal) {
        DealDetailDTO dto = new DealDetailDTO();

        // Deal Info
        dto.setDealId(deal.getId());
        dto.setStage(deal.getStage().name());
        dto.setCurrentStage(deal.getStage().name());
        if (deal.getAgreedPrice() != null) {
            dto.setAgreedPrice(deal.getAgreedPrice());
        }
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
        }

        // Buyer Details (with mobile)
        if (deal.getBuyer() != null) {
            dto.setBuyerId(deal.getBuyer().getId());
            dto.setBuyerName(deal.getBuyer().getFirstName() + " " + deal.getBuyer().getLastName());
            dto.setBuyerEmail(deal.getBuyer().getEmail());
            dto.setBuyerMobile(deal.getBuyer().getMobileNumber());
        }

        // Seller Details (with mobile) - from property owner
        if (deal.getProperty() != null && deal.getProperty().getUser() != null) {
            User seller = deal.getProperty().getUser();
            dto.setSellerId(seller.getId());
            dto.setSellerName(seller.getFirstName() + " " + seller.getLastName());
            dto.setSellerEmail(seller.getEmail());
            dto.setSellerMobile(seller.getMobileNumber());
        }

        // Agent Details (with mobile)
        if (deal.getAgent() != null) {
            dto.setAgentId(deal.getAgent().getId());
            dto.setAgentName(deal.getAgent().getFirstName() + " " + deal.getAgent().getLastName());
            dto.setAgentEmail(deal.getAgent().getEmail());
            dto.setAgentMobile(deal.getAgent().getMobileNumber());
        }

        // ==================== NEW: MAP STAGE DATE FIELDS ====================
        dto.setInquiryDate(deal.getInquiryDate());
        dto.setShortlistDate(deal.getShortlistDate());
        dto.setNegotiationDate(deal.getNegotiationDate());
        dto.setAgreementDate(deal.getAgreementDate());
        dto.setRegistrationDate(deal.getRegistrationDate());
        dto.setPaymentDate(deal.getPaymentDate());
        dto.setCompletedDate(deal.getCompletedDate());

        return dto;
    }
    // ==================== EXISTING METHODS (KEPT FOR COMPATIBILITY) ====================


    public DealStatus updateDealStage(Long dealId, DealStatus.DealStage newStage,
                                      String notes, String updatedBy) {
        logger.info("Updating deal {} to stage {}", dealId, newStage);

        DealStatus deal = dealStatusRepository.findById(dealId)
                .orElseThrow(() -> {
                    logger.error("Deal not found: {}", dealId);
                    return new RuntimeException("Deal not found");
                });

        // Check if stage is valid progression (cannot go backwards)
        if (newStage.getOrder() < deal.getStage().getOrder()) {
            logger.warn("Attempted to move deal {} to previous stage", dealId);
            throw new RuntimeException("Cannot move deal to a previous stage");
        }

        // Store old stage for logging
        DealStatus.DealStage oldStage = deal.getStage();

        // Update stage
        deal.setStage(newStage);

        // ==================== NEW: Set the corresponding stage date field ====================
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        switch (newStage) {
            case INQUIRY:
                if (deal.getInquiryDate() == null) {
                    deal.setInquiryDate(now);
                    logger.info("Set inquiry date for deal {}", dealId);
                }
                break;
            case SHORTLIST:
                if (deal.getShortlistDate() == null) {
                    deal.setShortlistDate(now);
                    logger.info("Set shortlist date for deal {}", dealId);
                }
                break;
            case NEGOTIATION:
                if (deal.getNegotiationDate() == null) {
                    deal.setNegotiationDate(now);
                    logger.info("Set negotiation date for deal {}", dealId);
                }
                break;
            case AGREEMENT:
                if (deal.getAgreementDate() == null) {
                    deal.setAgreementDate(now);
                    logger.info("Set agreement date for deal {}", dealId);
                }
                break;
            case REGISTRATION:
                if (deal.getRegistrationDate() == null) {
                    deal.setRegistrationDate(now);
                    logger.info("Set registration date for deal {}", dealId);
                }
                break;
            case PAYMENT:
                if (deal.getPaymentDate() == null) {
                    deal.setPaymentDate(now);
                    logger.info("Set payment date for deal {}", dealId);
                }
                break;
            case COMPLETED:
                if (deal.getCompletedDate() == null) {
                    deal.setCompletedDate(now);
                    logger.info("Set completed date for deal {}", dealId);
                }
                break;
        }

        // Append notes with timestamp
        if (notes != null && !notes.trim().isEmpty()) {
            String existingNotes = deal.getNotes() != null ? deal.getNotes() : "";
            String timestamp = java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            String newNotes = existingNotes + "\n[" + timestamp + " - " + updatedBy + "] " + notes;
            deal.setNotes(newNotes);
        }

        // Update metadata
        deal.setLastUpdatedBy(updatedBy);
        deal.setUpdatedAt(LocalDateTime.now());


        DealStatus updatedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Deal updated - Stage changed from {} to {}, Stage date updated", oldStage, newStage);
        return updatedDeal;
    }

    public DealStatus assignAgentToDeal(Long dealId, Long agentId, String username) {
        DealStatus deal = dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        if (!agent.getRole().equals(User.UserRole.AGENT) &&
                !agent.getRole().equals(User.UserRole.ADMIN)) {
            throw new RuntimeException("User is not an agent");
        }

        deal.setAgent(agent);
        deal.setLastUpdatedBy(username);
        return dealStatusRepository.save(deal);
    }

    public DealStatus getDealById(Long dealId) {
        return dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
    }

    public List<DealStatus> getDealsForProperty(Long propertyId) {
        return dealStatusRepository.findByPropertyId(propertyId);
    }

    public List<DealStatus> getDealsForAgent(Long agentId) {
        return dealStatusRepository.findByAgentId(agentId);
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
            return existing.get();
        }

        return createDeal(propertyId, buyerId, agentId);
    }
}