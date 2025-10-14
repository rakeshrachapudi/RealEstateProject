package com.example.realestate.service;

import com.example.realestate.model.Property;
import com.example.realestate.repository.PropertyRepository;
import com.example.realestate.model.User;
import com.example.realestate.model.Area;
import com.example.realestate.model.PropertyType;
import com.example.realestate.repository.UserRepository;
import com.example.realestate.repository.AreaRepository;
import com.example.realestate.repository.PropertyTypeRepository;
import com.example.realestate.dto.PropertyPostRequestDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class PropertyService {

    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);
    private final PropertyRepository repo;
    private final UserRepository userRepository;
    private final AreaRepository areaRepository;
    private final PropertyTypeRepository propertyTypeRepository;

    public PropertyService(PropertyRepository repo, UserRepository userRepository, AreaRepository areaRepository, PropertyTypeRepository propertyTypeRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.areaRepository = areaRepository;
        this.propertyTypeRepository = propertyTypeRepository;
    }

    /**
     * NEW METHOD: Creates a property from the frontend DTO payload, handling foreign keys.
     */
    public Property postProperty(PropertyPostRequestDto dto) {

        // 1. Validate and Fetch User Entity (Foreign Key) - Assumes User ID is Long
        Long userId = dto.getUser() != null ? dto.getUser().getId() : null;
        if (userId == null) {
            throw new IllegalArgumentException("User ID is missing in the request.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // 2. Validate and Fetch Area Entity (Foreign Key)
        Long areaIdLong = dto.getAreaId();
        if (areaIdLong == null) {
            throw new IllegalArgumentException("Area ID is missing in the request.");
        }

        // 💡 FIX APPLIED: Cast Long ID from DTO to Integer for AreaRepository lookup.
        Integer areaId = areaIdLong.intValue();
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new EntityNotFoundException("Area not found with ID: " + areaIdLong));

        // 3. Fetch PropertyType Entity
        // We must assume PropertyType also uses Integer ID, so we look it up by name instead of ID
        String propertyTypeName = dto.getType();
        PropertyType propertyType = propertyTypeRepository.findByTypeName(propertyTypeName)
                .orElseThrow(() -> new EntityNotFoundException("PropertyType not found with name: " + propertyTypeName));

        // 4. Map DTO to Property Entity
        Property property = new Property();
        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setImageUrl(dto.getImageUrl());

        // Convert Double from DTO to BigDecimal in Entity
        if (dto.getPrice() != null) {
            property.setPrice(BigDecimal.valueOf(dto.getPrice()));
        }
        if (dto.getAreaSqft() != null) {
            property.setAreaSqft(BigDecimal.valueOf(dto.getAreaSqft()));
        }

        property.setBedrooms(dto.getBedrooms());
        property.setBathrooms(dto.getBathrooms());
        property.setBalconies(dto.getBalconies() != null ? dto.getBalconies() : 0);

        property.setAddress(dto.getAddress());
        property.setAmenities(dto.getAmenities());

        // Set Foreign Key Entities
        property.setUser(user);
        property.setArea(area);
        property.setPropertyType(propertyType);

        // Set other simple fields
        property.setListingType(dto.getListingType());
        property.setType(dto.getType());
        property.setCity(dto.getCity());
        property.setStatus(dto.getStatus() != null ? dto.getStatus() : "available");
        property.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : true);
        property.setIsActive(true);
        property.setPriceDisplay(dto.getPriceDisplay());

        logger.info("Saving new property: {}", property.getTitle());
        return repo.save(property);
    }

    // ===============================================
    // Existing Service Methods (No change in existing logic)
    // ===============================================

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
     * Get properties by both type and listing type
     * Example: Apartments for Sale, Villas for Rent
     */
    public List<Property> findByTypeAndListingType(String type, String listingType) {
        logger.info("Fetching properties of type: {} and listing type: {}", type, listingType);
        return repo.findByTypeAndListingType(type, listingType);
    }

    /**
     * Get properties by area name
     */
    public List<Property> findByAreaName(String areaName) {
        logger.info("Fetching properties in area: {}", areaName);
        List<Property> properties = repo.findByAreaNameAndIsActiveTrue(areaName);

        // If no properties found in area table, try searching in the city field
        if (properties.isEmpty()) {
            logger.info("No properties found in area table, searching in city field");
            properties = repo.findByCityIgnoreCase(areaName);
        }

        return properties;
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
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));

        property.setIsActive(false);
        repo.save(property);
    }

    /**
     * Update property
     */
    public Property updateProperty(Long id, Property propertyDetails) {
        logger.info("Updating property with ID: {}", id);
        Property property = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));

        // Update fields
        if (propertyDetails.getTitle() != null) {
            property.setTitle(propertyDetails.getTitle());
        }
        if (propertyDetails.getDescription() != null) {
            property.setDescription(propertyDetails.getDescription());
        }
        if (propertyDetails.getPrice() != null) {
            property.setPrice(propertyDetails.getPrice());
        }
        if (propertyDetails.getAreaSqft() != null) {
            property.setAreaSqft(propertyDetails.getAreaSqft());
        }
        if (propertyDetails.getBedrooms() != null) {
            property.setBedrooms(propertyDetails.getBedrooms());
        }
        if (propertyDetails.getBathrooms() != null) {
            property.setBathrooms(propertyDetails.getBathrooms());
        }
        if (propertyDetails.getBalconies() != null) {
            property.setBalconies(propertyDetails.getBalconies());
        }
        if (propertyDetails.getAddress() != null) {
            property.setAddress(propertyDetails.getAddress());
        }
        if (propertyDetails.getAmenities() != null) {
            property.setAmenities(propertyDetails.getAmenities());
        }
        if (propertyDetails.getStatus() != null) {
            property.setStatus(propertyDetails.getStatus());
        }
        if (propertyDetails.getListingType() != null) {
            property.setListingType(propertyDetails.getListingType());
        }
        if (propertyDetails.getIsFeatured() != null) {
            property.setIsFeatured(propertyDetails.getIsFeatured());
        }

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