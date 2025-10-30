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

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class DealService {

    private static final Logger logger = LoggerFactory.getLogger(DealService.class);

    @Autowired
    private DealStatusRepository dealStatusRepository;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    /**
     * ✅ DELETE DEAL WITH CASCADE
     * Deletes deal and all associated S3 documents
     */
    public Map<String, Object> deleteDealCascade(Long dealId) {
        logger.info("🗑️ Starting cascade deletion for Deal ID: {}", dealId);

        Map<String, Object> result = new HashMap<>();
        int s3FilesDeleted = 0;

        try {
            // Find the deal
            Optional<DealStatus> dealOptional = dealStatusRepository.findById(dealId);

            if (dealOptional.isEmpty()) {
                logger.warn("⚠️ Deal not found with ID: {}", dealId);
                result.put("success", false);
                result.put("message", "Deal not found");
                return result;
            }

            DealStatus deal = dealOptional.get();
            Long propertyId = deal.getProperty() != null ? deal.getProperty().getId() : null;

            logger.info("ℹ️ Deal found: ID={}, Property={}, Stage={}",
                    deal.getId(),
                    deal.getProperty() != null ? deal.getProperty().getTitle() : "N/A",
                    deal.getCurrentStage());

            // Delete all S3 documents for this deal
            if (propertyId != null) {
                logger.info("🗑️ Deleting S3 documents for Deal ID: {}", dealId);
                s3FilesDeleted = s3Service.deleteDealDocuments(propertyId, dealId);
                logger.info("✅ Deleted {} S3 files for Deal ID: {}", s3FilesDeleted, dealId);
            }

            // Delete the deal from database
            dealStatusRepository.delete(deal);
            logger.info("✅ Deal ID: {} deleted from database successfully", dealId);

            // Prepare result
            result.put("success", true);
            result.put("message", "Deal deleted successfully");
            result.put("dealId", dealId);
            result.put("s3FilesDeleted", s3FilesDeleted);

            logger.info("✅ CASCADE DELETION COMPLETE:");
            logger.info("   - Deal ID: {} deleted", dealId);
            logger.info("   - S3 files deleted: {}", s3FilesDeleted);

            return result;

        } catch (Exception e) {
            logger.error("❌ Error during cascade deletion for deal {}: ", dealId, e);
            result.put("success", false);
            result.put("message", "Failed to delete deal: " + e.getMessage());
            result.put("s3FilesDeleted", s3FilesDeleted);
            throw new RuntimeException("Failed to delete deal with cascade: " + e.getMessage(), e);
        }
    }

    /**
     * ✅ UPDATE BUYER
     * Updates the buyer for a deal
     */
    public DealStatus updateBuyer(Long dealId, Long newBuyerId) {
        logger.info("🔄 Updating buyer for Deal ID: {} to User ID: {}", dealId, newBuyerId);

        DealStatus deal = dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found with ID: " + dealId));

        User newBuyer = userRepository.findById(newBuyerId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + newBuyerId));

        deal.setBuyer(newBuyer);
        DealStatus updatedDeal = dealStatusRepository.save(deal);

        logger.info("✅ Buyer updated for Deal ID: {}", dealId);
        return updatedDeal;
    }

    /**
     * ✅ UPDATE SELLER
     * Updates the seller (property owner) for a deal
     */
    public DealStatus updateSeller(Long dealId, Long newSellerId) {
        logger.info("🔄 Updating seller for Deal ID: {} to User ID: {}", dealId, newSellerId);

        DealStatus deal = dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found with ID: " + dealId));

        User newSeller = userRepository.findById(newSellerId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + newSellerId));

        // Update the property owner
        Property property = deal.getProperty();
        if (property == null) {
            throw new RuntimeException("Deal has no associated property");
        }

        property.setUser(newSeller);
        propertyRepository.save(property);

        // Reload the deal to get updated property info
        DealStatus updatedDeal = dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found after update"));

        logger.info("✅ Seller updated for Deal ID: {}", dealId);
        return updatedDeal;
    }

    /**
     * ✅ UPDATE AGENT
     * Updates the agent assigned to a deal
     */
    public DealStatus updateAgent(Long dealId, Long newAgentId) {
        logger.info("🔄 Updating agent for Deal ID: {} to User ID: {}", dealId, newAgentId);

        DealStatus deal = dealStatusRepository.findById(dealId)
                .orElseThrow(() -> new RuntimeException("Deal not found with ID: " + dealId));

        User newAgent = userRepository.findById(newAgentId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + newAgentId));

        // Verify the new user is actually an agent
        if (!newAgent.getRole().equals(User.UserRole.AGENT) &&
                !newAgent.getRole().equals(User.UserRole.ADMIN)) {
            throw new RuntimeException("User is not an agent. Only agents can be assigned to deals.");
        }

        deal.setAgent(newAgent);
        DealStatus updatedDeal = dealStatusRepository.save(deal);

        logger.info("✅ Agent updated for Deal ID: {}", dealId);
        return updatedDeal;
    }

    /**
     * ✅ GET ALL DEALS
     * Returns all deals in the system
     */
    public List<DealStatus> getAllDeals() {
        logger.info("📋 Fetching all deals");
        return dealStatusRepository.findAll();
    }

    /**
     * ✅ GET DEAL BY ID
     */
    public Optional<DealStatus> getDealById(Long dealId) {
        logger.info("🔍 Fetching deal with ID: {}", dealId);
        return dealStatusRepository.findById(dealId);
    }

    /**
     * ✅ GET DEALS BY AGENT
     */
    public List<DealStatus> getDealsByAgent(Long agentId) {
        logger.info("📋 Fetching deals for agent: {}", agentId);
        return dealStatusRepository.findByAgentId(agentId);
    }

    /**
     * ✅ GET DEALS BY BUYER
     */
    public List<DealStatus> getDealsByBuyer(Long buyerId) {
        logger.info("📋 Fetching deals for buyer: {}", buyerId);
        return dealStatusRepository.findByBuyerId(buyerId);
    }

    /**
     * ✅ GET DEALS BY PROPERTY
     */
    public List<DealStatus> getDealsByProperty(Long propertyId) {
        logger.info("📋 Fetching deals for property: {}", propertyId);
        return dealStatusRepository.findByPropertyId(propertyId);
    }
}