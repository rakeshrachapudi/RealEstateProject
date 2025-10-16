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
     *
     * @param propertyId Property ID
     * @param buyerId    Buyer ID
     * @param agentId    Optional Agent ID
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
     *
     * @param dealId    Deal ID
     * @param newStage  New stage
     * @param notes     Optional notes
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
}