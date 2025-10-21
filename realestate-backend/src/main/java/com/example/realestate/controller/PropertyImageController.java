package com.example.realestate.controller;

import com.example.realestate.model.PropertyImage;
import com.example.realestate.service.PropertyImageService;
import com.example.realestate.service.PropertyImageService.PropertyImageRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/property-images")
public class PropertyImageController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyImageController.class);
    private final PropertyImageService propertyImageService;

    public PropertyImageController(PropertyImageService propertyImageService) {
        this.propertyImageService = propertyImageService;
    }

    /**
     * Get all images for a property
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<PropertyImage>> getPropertyImages(@PathVariable Long propertyId) {
        logger.info("Fetching images for property ID: {}", propertyId);
        List<PropertyImage> images = propertyImageService.getImagesByPropertyId(propertyId);
        return ResponseEntity.ok(images);
    }

    /**
     * Get primary image for a property
     */
    @GetMapping("/property/{propertyId}/primary")
    public ResponseEntity<PropertyImage> getPrimaryImage(@PathVariable Long propertyId) {
        logger.info("Fetching primary image for property ID: {}", propertyId);
        PropertyImage image = propertyImageService.getPrimaryImageByPropertyId(propertyId);
        if (image != null) {
            return ResponseEntity.ok(image);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Add multiple images to a property
     * Used after uploading to Cloudinary
     */
    @PostMapping("/property/{propertyId}")
    public ResponseEntity<List<PropertyImage>> addImages(
            @PathVariable Long propertyId,
            @RequestBody List<PropertyImageRequest> imageRequests) {
        logger.info("Adding {} images to property ID: {}", imageRequests.size(), propertyId);

        try {
            List<PropertyImage> savedImages = propertyImageService.saveImages(propertyId, imageRequests);
            return ResponseEntity.ok(savedImages);
        } catch (RuntimeException e) {
            logger.error("Error adding images: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete an image
     */
    @DeleteMapping("/{imageId}")
    public ResponseEntity<Void> deleteImage(@PathVariable Integer imageId) {
        logger.info("Deleting image with ID: {}", imageId);
        try {
            propertyImageService.deleteImage(imageId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            logger.error("Error deleting image: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Set image as primary
     */
    @PutMapping("/{imageId}/set-primary")
    public ResponseEntity<Void> setPrimaryImage(
            @PathVariable Integer imageId,
            @RequestBody Map<String, Long> request) {
        logger.info("Setting image {} as primary", imageId);
        Long propertyId = request.get("propertyId");

        try {
            propertyImageService.setPrimaryImage(propertyId, imageId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            logger.error("Error setting primary image: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update image display order
     */
    @PutMapping("/{imageId}/order")
    public ResponseEntity<Void> updateImageOrder(
            @PathVariable Integer imageId,
            @RequestBody Map<String, Integer> request) {
        logger.info("Updating order for image {}", imageId);
        Integer newOrder = request.get("order");

        try {
            propertyImageService.updateImageOrder(imageId, newOrder);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            logger.error("Error updating image order: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}