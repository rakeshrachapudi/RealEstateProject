package com.example.realestate.service;

import com.example.realestate.model.DealStatus;
import com.example.realestate.model.Property;
import com.example.realestate.model.User;
import com.example.realestate.repository.DealStatusRepository;
import com.example.realestate.repository.PropertyRepository;
import com.example.realestate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

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

    // ==================== CREATE DEAL ====================
    /**
     * Create new deal (Initial Inquiry)
     * @param propertyId Property ID
     * @param buyerId Buyer ID
     * @param agentId Optional Agent ID
     * @return Created DealStatus
     */
    public DealStatus createDeal(Long propertyId, Long buyerId, Long agentId) {
        logger.info("Creating new deal - Property: {}, Buyer: {}, Agent: {}",
                propertyId, buyerId, agentId);

        // Validate property exists
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> {
                    logger.error("Property not found: {}", propertyId);
                    return new RuntimeException("Property not found");
                });

        // Validate buyer exists
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> {
                    logger.error("Buyer not found: {}", buyerId);
                    return new RuntimeException("Buyer not found");
                });

        // Check if deal already exists
        if (dealStatusRepository.existsByPropertyIdAndBuyerId(propertyId, buyerId)) {
            logger.warn("Deal already exists for property {} and buyer {}", propertyId, buyerId);
            throw new RuntimeException("Deal already exists for this property and buyer");
        }

        // Get agent if provided
        User agent = null;
        if (agentId != null) {
            agent = userRepository.findById(agentId)
                    .orElseThrow(() -> {
                        logger.error("Agent not found: {}", agentId);
                        return new RuntimeException("Agent not found");
                    });

            // Validate agent role
            if (!agent.getRole().equals(User.UserRole.AGENT) &&
                    !agent.getRole().equals(User.UserRole.ADMIN)) {
                logger.warn("User {} is not an agent", agentId);
                throw new RuntimeException("User is not an agent");
            }
        }

        // Create new deal
        DealStatus deal = new DealStatus();
        deal.setProperty(property);
        deal.setBuyer(buyer);
        deal.setAgent(agent);
        deal.setStage(DealStatus.DealStage.INQUIRY);
        deal.setNotes("Deal initiated - Initial Inquiry");
        deal.setLastUpdatedBy(buyer.getUsername());

        DealStatus savedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Deal created successfully - Deal ID: {}", savedDeal.getId());
        return savedDeal;
    }

    // ==================== UPDATE DEAL STAGE ====================
    /**
     * Update deal stage (Only Agent/Admin can do this)
     * @param dealId Deal ID
     * @param newStage New stage
     * @param notes Optional notes
     * @param updatedBy Username who made the update
     * @return Updated DealStatus
     */
    public DealStatus updateDealStage(Long dealId, DealStatus.DealStage newStage,
                                      String notes, String updatedBy) {
        logger.info("Updating deal {} to stage {} by {}", dealId, newStage, updatedBy);

        DealStatus deal = dealStatusRepository.findById(dealId)
                .orElseThrow(() -> {
                    logger.error("Deal not found: {}", dealId);
                    return new RuntimeException("Deal not found");
                });

        // Validate stage progression (can't go backwards)
        if (newStage.getOrder() < deal.getStage().getOrder()) {
            logger.warn("Cannot move deal {} backwards from {} to {}",
                    dealId, deal.getStage(), newStage);
            throw new RuntimeException("Cannot move deal to a previous stage");
        }

        // Update stage
        DealStatus.DealStage oldStage = deal.getStage();
        deal.setStage(newStage);

        // Add notes if provided
        if (notes != null && !notes.trim().isEmpty()) {
            String existingNotes = deal.getNotes() != null ? deal.getNotes() : "";
            String timestamp = java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
            deal.setNotes(existingNotes + "\n[" + timestamp + " - " + updatedBy + "] " + notes);
        }

        deal.setLastUpdatedBy(updatedBy);

        DealStatus updatedDeal = dealStatusRepository.save(deal);
        logger.info("✅ Deal updated - Stage changed from {} to {}", oldStage, newStage);
        return updatedDeal;
    }
    public List<DealStatus> getDealsByStage(DealStatus.DealStage stage) {
        return dealStatusRepository.findByStage(stage);
    }



    public List<DealStatus> getActiveDealForBuyer(Long buyerId) {
        return dealStatusRepository.findActiveDealForBuyer(buyerId);
    }




    // ==================== ASSIGN AGENT ====================
    /**
     * Assign agent to deal
     * @param dealId Deal ID
     * @param agentId Agent ID
     * @return Updated DealStatus
     */
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


    // ==================== GET DEAL ====================
    /**
     * Get deal by ID
     */
    public DealStatus getDealById(Long dealId) {
        logger.info("Fetching deal: {}", dealId);
        return dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found"));
    }

    // ==================== GET DEALS BY PROPERTY ====================
    /**
     * Get all deals for a property
     */
    public List<DealStatus> getDealsForProperty(Long propertyId) {
        logger.info("Fetching deals for property: {}", propertyId);
        List<DealStatus> deals = dealStatusRepository.findByPropertyId(propertyId);
        logger.info("Found {} deals for property {}", deals.size(), propertyId);
        return deals;
    }

    // ==================== GET DEALS BY AGENT ====================
    /**
     * Get all deals for an agent
     */
    public List<DealStatus> getDealsForAgent(Long agentId) {
        logger.info("Fetching all deals for agent: {}", agentId);
        List<DealStatus> deals = dealStatusRepository.findByAgentId(agentId);
        logger.info("Found {} deals for agent {}", deals.size(), agentId);
        return deals;
    }

    /**
     * Get active deals for an agent (not completed)
     */
    public List<DealStatus> getActiveDealsForAgent(Long agentId) {
        logger.info("Fetching active deals for agent: {}", agentId);
        List<DealStatus> deals = dealStatusRepository.findActiveDealsForAgent(agentId);
        logger.info("Found {} active deals for agent {}", deals.size(), agentId);
        return deals;
    }



    // ==================== GET BUYER DEALS ====================
    /**
     * Get all deals for a buyer
     */
    public List<DealStatus> getBuyerDeals(Long buyerId) {
        logger.info("Fetching deals for buyer: {}", buyerId);
        List<DealStatus> deals = dealStatusRepository.findByBuyerId(buyerId);
        logger.info("Found {} deals for buyer {}", deals.size(), buyerId);
        return deals;
    }




    // ==================== FIND OR CREATE ====================
    /**
     * Find existing deal or create new one
     */
    public DealStatus findOrCreateDeal(Long propertyId, Long buyerId, Long agentId) {
        logger.info("Finding or creating deal - Property: {}, Buyer: {}", propertyId, buyerId);
        Optional<DealStatus> existing = dealStatusRepository
                .findByPropertyIdAndBuyerId(propertyId, buyerId);

        if (existing.isPresent()) {
            logger.info("Existing deal found: {}", existing.get().getId());
            return existing.get();
        }

        logger.info("No existing deal, creating new one");
        return createDeal(propertyId, buyerId, agentId);
    }

    // ==================== STATISTICS ====================
    /**
     * Get count of deals at stage
     */
    public Long getCountByStage(DealStatus.DealStage stage) {
        return dealStatusRepository.countByStage(stage);
    }

    /**
     * Get deals for agent at specific stage
     */
    public List<DealStatus> getAgentDealsAtStage(Long agentId, DealStatus.DealStage stage) {
        logger.info("Fetching deals for agent {} at stage {}", agentId, stage);
        return dealStatusRepository.findByAgentIdAndStage(agentId, stage);
    }


}