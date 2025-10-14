package com.example.realestate.service;

import com.example.realestate.model.Property;
import com.example.realestate.model.PropertyImage;
import com.example.realestate.repository.PropertyImageRepository;
import com.example.realestate.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PropertyImageService {

    private static final Logger logger = LoggerFactory.getLogger(PropertyImageService.class);
    private final PropertyImageRepository propertyImageRepository;
    private final PropertyRepository propertyRepository;

    public PropertyImageService(PropertyImageRepository propertyImageRepository,
                                PropertyRepository propertyRepository) {
        this.propertyImageRepository = propertyImageRepository;
        this.propertyRepository = propertyRepository;
    }

    /**
     * Get all images for a property
     */
    public List<PropertyImage> getImagesByPropertyId(Long propertyId) {
        logger.info("Fetching images for property ID: {}", propertyId);
        return propertyImageRepository.findByPropertyId(propertyId);
    }

    /**
     * Get primary image for a property
     */
    public PropertyImage getPrimaryImageByPropertyId(Long propertyId) {
        logger.info("Fetching primary image for property ID: {}", propertyId);
        return propertyImageRepository.findPrimaryImageByPropertyId(propertyId)
                .orElse(null);
    }

    /**
     * Add image to property
     */
    public PropertyImage addImageToProperty(Long propertyId, PropertyImage propertyImage) {
        logger.info("Adding image to property ID: {}", propertyId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        propertyImage.setProperty(property);
        propertyImage.setCreatedAt(LocalDateTime.now());

        // If this is the first image, make it primary
        List<PropertyImage> existingImages = propertyImageRepository.findByPropertyId(propertyId);
        if (existingImages.isEmpty()) {
            propertyImage.setIsPrimary(true);
            propertyImage.setDisplayOrder(0);
        } else {
            propertyImage.setDisplayOrder(existingImages.size());
        }

        return propertyImageRepository.save(propertyImage);
    }

    /**
     * Save multiple images for a property
     * NEW METHOD - This is what was missing!
     */
    public List<PropertyImage> saveImages(Long propertyId, List<PropertyImageRequest> imageRequests) {
        logger.info("Saving {} images for property ID: {}", imageRequests.size(), propertyId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        List<PropertyImage> savedImages = new ArrayList<>();

        for (int i = 0; i < imageRequests.size(); i++) {
            PropertyImageRequest request = imageRequests.get(i);

            PropertyImage image = new PropertyImage();
            image.setProperty(property);
            image.setImageUrl(request.getImageUrl());
            image.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : (i == 0));
            image.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : i);
            image.setCreatedAt(LocalDateTime.now());

            savedImages.add(propertyImageRepository.save(image));
        }

        logger.info("Successfully saved {} images", savedImages.size());
        return savedImages;
    }

    /**
     * Set image as primary
     */
    public void setPrimaryImage(Long propertyId, Integer imageId) {
        logger.info("Setting image {} as primary for property {}", imageId, propertyId);

        // Remove primary status from all images of this property
        List<PropertyImage> images = propertyImageRepository.findByPropertyId(propertyId);
        for (PropertyImage img : images) {
            img.setIsPrimary(false);
            propertyImageRepository.save(img);
        }

        // Set the selected image as primary
        PropertyImage primaryImage = propertyImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));

        primaryImage.setIsPrimary(true);
        propertyImageRepository.save(primaryImage);
    }

    /**
     * Delete image
     */
    public void deleteImage(Integer imageId) {
        logger.info("Deleting image with ID: {}", imageId);
        PropertyImage image = propertyImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));

        Long propertyId = image.getProperty().getId();
        boolean wasPrimary = image.getIsPrimary();

        propertyImageRepository.deleteById(imageId);

        // If the deleted image was primary, set another image as primary
        if (wasPrimary) {
            List<PropertyImage> remainingImages = propertyImageRepository.findByPropertyId(propertyId);
            if (!remainingImages.isEmpty()) {
                PropertyImage newPrimary = remainingImages.get(0);
                newPrimary.setIsPrimary(true);
                propertyImageRepository.save(newPrimary);
            }
        }
    }

    /**
     * Delete all images for a property
     */
    public void deleteAllImagesByPropertyId(Long propertyId) {
        logger.info("Deleting all images for property ID: {}", propertyId);
        propertyImageRepository.deleteByPropertyId(propertyId);
    }

    /**
     * Update image display order
     */
    public void updateImageOrder(Integer imageId, Integer newOrder) {
        logger.info("Updating display order for image {} to {}", imageId, newOrder);
        PropertyImage image = propertyImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found with id: " + imageId));

        image.setDisplayOrder(newOrder);
        propertyImageRepository.save(image);
    }

    /**
     * DTO class for image requests
     */
    public static class PropertyImageRequest {
        private String imageUrl;
        private Boolean isPrimary;
        private Integer displayOrder;

        public PropertyImageRequest() {}

        public PropertyImageRequest(String imageUrl, Boolean isPrimary, Integer displayOrder) {
            this.imageUrl = imageUrl;
            this.isPrimary = isPrimary;
            this.displayOrder = displayOrder;
        }

        public String getImageUrl() {
            return imageUrl;
        }

        public void setImageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
        }

        public Boolean getIsPrimary() {
            return isPrimary;
        }

        public void setIsPrimary(Boolean isPrimary) {
            this.isPrimary = isPrimary;
        }

        public Integer getDisplayOrder() {
            return displayOrder;
        }

        public void setDisplayOrder(Integer displayOrder) {
            this.displayOrder = displayOrder;
        }
    }
}