package com.example.realestate.service;

import com.example.realestate.model.Property;
import com.example.realestate.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PropertyService {

    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);
    private final PropertyRepository repo;

    public PropertyService(PropertyRepository repo) {
        this.repo = repo;
    }

    /**
     * Get all properties
     */
    public List<Property> findAll() {
        logger.info("Fetching all properties");
        return repo.findAll();
    }

    /**
     * Get properties by city
     */
    public List<Property> findByCity(String city) {
        logger.info("Fetching properties in city: {}", city);
        return repo.findByCityIgnoreCase(city);
    }

    /**
     * Get properties by property type (e.g., Apartment, Villa, House)
     */
    public List<Property> findByType(String type) {
        logger.info("Fetching properties of type: {}", type);
        return repo.findByTypeIgnoreCaseAndIsActiveTrue(type);
    }

    /**
     * Get properties by listing type (sale/rent)
     */
    public List<Property> findByListingType(String listingType) {
        logger.info("Fetching properties with listing type: {}", listingType);
        return repo.findByListingTypeAndIsActiveTrue(listingType);
    }

    /**
     * Get properties by area name
     */
    public List<Property> findByAreaName(String areaName) {
        logger.info("Fetching properties in area: {}", areaName);
        return repo.findByAreaNameAndIsActiveTrue(areaName);
    }

    /**
     * Save property
     */
    public Property save(Property p) {
        logger.info("Saving property: {}", p.getTitle());
        return repo.save(p);
    }

    /**
     * Get property by ID
     */
    public Optional<Property> findById(Long id) {
        logger.info("Fetching property with ID: {}", id);
        return repo.findById(id);
    }

    /**
     * Delete property (soft delete)
     */
    public void deleteProperty(Long id) {
        logger.info("Deleting property with ID: {}", id);
        Property property = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));

        property.setIsActive(false);
        repo.save(property);
    }

    /**
     * Update property
     */
    public Property updateProperty(Long id, Property propertyDetails) {
        logger.info("Updating property with ID: {}", id);
        Property property = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + id));

        // Update fields
        property.setTitle(propertyDetails.getTitle());
        property.setDescription(propertyDetails.getDescription());
        property.setPrice(propertyDetails.getPrice());
        property.setAreaSqft(propertyDetails.getAreaSqft());
        property.setBedrooms(propertyDetails.getBedrooms());
        property.setBathrooms(propertyDetails.getBathrooms());
        property.setAddress(propertyDetails.getAddress());
        property.setAmenities(propertyDetails.getAmenities());
        property.setStatus(propertyDetails.getStatus());
        property.setListingType(propertyDetails.getListingType());
        property.setIsFeatured(propertyDetails.getIsFeatured());

        if (propertyDetails.getPropertyType() != null) {
            property.setPropertyType(propertyDetails.getPropertyType());
        }

        if (propertyDetails.getArea() != null) {
            property.setArea(propertyDetails.getArea());
        }

        return repo.save(property);
    }

    /**
     * Get featured properties
     */
    public List<Property> getFeaturedProperties() {
        logger.info("Fetching featured properties");
        return repo.findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc();
    }

    /**
     * Get properties by user
     */
    public List<Property> getPropertiesByUser(Long userId) {
        logger.info("Fetching properties for user ID: {}", userId);
        return repo.findByUserId(userId);
    }

    /**
     * Count properties in a city
     */
    public Long countPropertiesByCity(String city) {
        logger.info("Counting properties in city: {}", city);
        return repo.countByCity(city);
    }
}