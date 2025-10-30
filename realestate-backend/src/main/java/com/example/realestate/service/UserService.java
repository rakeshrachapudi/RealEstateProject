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
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private S3Service s3Service;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private DealStatusRepository dealStatusRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * ✅ NEW: Delete a user with complete cascade deletion
     * This method will:
     * 1. Delete all properties owned by the user (and their S3 files)
     * 2. Delete all deals where user is involved (buyer/seller/agent) and their S3 documents
     * 3. Delete the user account itself
     *
     * @param userId The ID of the user to delete
     * @return Map containing deletion statistics
     */
    @Transactional
    public Map<String, Object> deleteUserCascade(Long userId) {
        logger.info("🗑️ Starting cascade deletion for User ID: {}", userId);

        Map<String, Object> result = new HashMap<>();
        int propertiesDeleted = 0;
        int dealsDeleted = 0;
        int s3FilesDeleted = 0;

        try {
            // Find the user
            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isEmpty()) {
                logger.warn("⚠️ User not found with ID: {}", userId);
                result.put("success", false);
                result.put("message", "User not found");
                return result;
            }

            User user = userOptional.get();
            logger.info("ℹ️ User found: {} {} (Role: {})",
                    user.getFirstName(), user.getLastName(), user.getRole());

            // ==================== STEP 1: Delete deals where user is BUYER ====================
            logger.info("🔍 Finding deals where user is buyer...");
            List<DealStatus> buyerDeals = dealStatusRepository.findByBuyerId(userId);
            logger.info("📊 Found {} deals where user is buyer", buyerDeals.size());

            for (DealStatus deal : buyerDeals) {
                Long propertyId = deal.getProperty() != null ? deal.getProperty().getId() : null;
                if (propertyId != null) {
                    int deleted = s3Service.deleteDealDocuments(propertyId, deal.getId());
                    s3FilesDeleted += deleted;
                    logger.info("   ✅ Deleted {} S3 files for Deal ID: {}", deleted, deal.getId());
                }
                dealStatusRepository.delete(deal);
                dealsDeleted++;
            }

            // ==================== STEP 2: Delete deals where user is AGENT ====================
            logger.info("🔍 Finding deals where user is agent...");
            List<DealStatus> agentDeals = dealStatusRepository.findByAgentId(userId);
            logger.info("📊 Found {} deals where user is agent", agentDeals.size());

            for (DealStatus deal : agentDeals) {
                // Skip if already deleted (in case user was both buyer and agent)
                if (dealStatusRepository.existsById(deal.getId())) {
                    Long propertyId = deal.getProperty() != null ? deal.getProperty().getId() : null;
                    if (propertyId != null) {
                        int deleted = s3Service.deleteDealDocuments(propertyId, deal.getId());
                        s3FilesDeleted += deleted;
                        logger.info("   ✅ Deleted {} S3 files for Deal ID: {}", deleted, deal.getId());
                    }
                    dealStatusRepository.delete(deal);
                    dealsDeleted++;
                }
            }

            // ==================== STEP 3: Delete properties owned by user ====================
            logger.info("🔍 Finding properties owned by user...");
            List<Property> userProperties = propertyRepository.findByUserId(userId);
            logger.info("📊 Found {} properties owned by user", userProperties.size());

            for (Property property : userProperties) {
                // Delete any remaining deals associated with this property
                List<DealStatus> propertyDeals = dealStatusRepository.findByPropertyId(property.getId());
                for (DealStatus deal : propertyDeals) {
                    if (dealStatusRepository.existsById(deal.getId())) {
                        int deleted = s3Service.deleteDealDocuments(property.getId(), deal.getId());
                        s3FilesDeleted += deleted;
                        dealStatusRepository.delete(deal);
                        dealsDeleted++;
                        logger.info("   ✅ Deleted Deal ID: {} for Property ID: {}", deal.getId(), property.getId());
                    }
                }

                // Delete all S3 files for this property (images, documents, and any remaining deal docs)
                int deleted = s3Service.deletePropertyFiles(property.getId());
                s3FilesDeleted += deleted;
                logger.info("   ✅ Deleted {} S3 files for Property ID: {}", deleted, property.getId());

                // Delete the property from database
                propertyRepository.delete(property);
                propertiesDeleted++;
                logger.info("   ✅ Deleted Property ID: {} - {}", property.getId(), property.getTitle());
            }

            // ==================== STEP 4: Delete the user ====================
            userRepository.delete(user);
            logger.info("✅ User ID: {} deleted from database successfully", userId);

            // Prepare result
            result.put("success", true);
            result.put("message", "User and all associated data deleted successfully");
            result.put("userId", userId);
            result.put("userName", user.getFirstName() + " " + user.getLastName());
            result.put("propertiesDeleted", propertiesDeleted);
            result.put("dealsDeleted", dealsDeleted);
            result.put("s3FilesDeleted", s3FilesDeleted);

            logger.info("✅ CASCADE DELETION COMPLETE:");
            logger.info("   - User ID: {} deleted", userId);
            logger.info("   - Properties deleted: {}", propertiesDeleted);
            logger.info("   - Deals deleted: {}", dealsDeleted);
            logger.info("   - S3 files deleted: {}", s3FilesDeleted);

            return result;

        } catch (Exception e) {
            logger.error("❌ Error during cascade deletion for user {}: ", userId, e);
            result.put("success", false);
            result.put("message", "Failed to delete user: " + e.getMessage());
            result.put("propertiesDeleted", propertiesDeleted);
            result.put("dealsDeleted", dealsDeleted);
            result.put("s3FilesDeleted", s3FilesDeleted);
            throw new RuntimeException("Failed to delete user with cascade: " + e.getMessage(), e);
        }
    }
}