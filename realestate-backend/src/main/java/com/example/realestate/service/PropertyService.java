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
import com.example.realestate.dto.PropertyDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
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

    // ==================== ⭐ CASCADE DELETE METHOD (NEW) ====================

    /**
     * ⭐ SOFT DELETE ALL PROPERTIES FOR A USER (CASCADE DELETE)
     * Called when a user is deleted
     */
    @Transactional
    public void softDeleteAllPropertiesForUser(Long userId) {
        logger.info("🗑️ CASCADE DELETE: Soft-deleting all properties for user ID: {}", userId);

        List<Property> userProperties = repo.findByUserId(userId);

        if (userProperties.isEmpty()) {
            logger.info("✅ No properties found for user {}. Nothing to delete.", userId);
            return;
        }

        logger.info("Found {} properties owned by user {}. Soft-deleting...", userProperties.size(), userId);

        for (Property property : userProperties) {
            logger.info("  - Soft-deleting Property ID: {} (Title: {}, Status: {})",
                    property.getId(),
                    property.getTitle(),
                    property.getStatus());
            property.setIsActive(false);
            property.setStatus("DELETED");
        }

        repo.saveAll(userProperties);
        logger.info("✅ Successfully soft-deleted {} properties for user {}", userProperties.size(), userId);
    }

    // ==================== EXISTING METHODS ====================

    public List<String> getPropertyTypes() {
        return repo.findDistinctPropertyTypes();
    }

    public List<Property> findByType(String type) {
        return repo.findByTypeIgnoreCaseAndIsActiveTrue(type);
    }
    /**
     * Get properties by area name and convert to DTOs
     */
    public List<PropertyDTO> findByAreaNameAsDTO(String areaName) {
        logger.info("Finding properties by area name as DTOs: {}", areaName);
        List<Property> properties = repo.findByAreaNameAndIsActiveTrue(areaName);
        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }


    /**
     * Create new property from DTO.
     */
    public Property postProperty(PropertyPostRequestDto dto) {
        Long areaId = dto.getArea().getId();
        Long userId = dto.getUser().getId();

        Area area = areaRepository.findById(areaId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Area not found with ID: " + areaId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        PropertyType propertyType = propertyTypeRepository.findByTypeName(dto.getType())
                .orElseGet(() -> {
                    logger.warn("PropertyType '{}' not found. Defaulting to 'Apartment'.", dto.getType());
                    return propertyTypeRepository.findByTypeName("Apartment").orElse(null);
                });

        Property property = new Property();
        property.setTitle(dto.getTitle());
        property.setDescription(dto.getDescription());
        property.setImageUrl(dto.getImageUrl());
        property.setPrice(BigDecimal.valueOf(dto.getPrice()));
        property.setPriceDisplay(dto.getPriceDisplay());
        property.setBedrooms(dto.getBedrooms());
        property.setBathrooms(dto.getBathrooms());
        property.setBalconies(dto.getBalconies());
        property.setAreaSqft(dto.getAreaSqft() != null ? BigDecimal.valueOf(dto.getAreaSqft()) : null);

        property.setArea(area);
        property.setUser(user);
        property.setPropertyType(propertyType);

        property.setType(dto.getType());
        property.setListingType(dto.getListingType());
        property.setCity(dto.getCity());
        property.setAddress(dto.getAddress());
        property.setAmenities(dto.getAmenities());
        property.setStatus(dto.getStatus());
        property.setIsFeatured(dto.getIsFeatured());
        property.setIsActive(dto.getIsActive());

        property.setOwnerType(dto.getOwnerType());
        property.setIsReadyToMove(dto.getIsReadyToMove());
        property.setIsVerified(dto.getIsVerified());

        return repo.save(property);
    }

    /**
     * Get properties by user and convert to DTOs
     */
    public List<PropertyDTO> getPropertiesByUser(Long userId) {
        logger.info("Fetching properties for user ID: {}", userId);
        List<Property> properties = repo.findByUserId(userId);

        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // In PropertyService.java, update this method:

    private PropertyDTO convertToDTO(Property property) {
        PropertyDTO dto = new PropertyDTO();

        dto.setPropertyId(property.getId());
        dto.setPropertyType(property.getType());
        dto.setTitle(property.getTitle());
        dto.setDescription(property.getDescription());
        dto.setPrice(property.getPrice());
        dto.setAreaSqft(property.getAreaSqft());
        dto.setBedrooms(property.getBedrooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setBalconies(property.getBalconies());
        dto.setAddress(property.getAddress());
        dto.setStatus(property.getStatus());
        dto.setListingType(property.getListingType());
        dto.setImageUrl(property.getImageUrl());
        dto.setAmenities(property.getAmenities());
        dto.setIsFeatured(property.getIsFeatured());
        dto.setCreatedAt(property.getCreatedAt());
        dto.setPriceDisplay(property.getPriceDisplay());
        dto.setIsReadyToMove(property.getIsReadyToMove());
        dto.setOwnerType(property.getOwnerType());
        dto.setIsVerified(property.getIsVerified());

        // ✅ UPDATED: Include role in user DTO
        if (property.getUser() != null) {
            PropertyDTO.UserDTO userDTO = new PropertyDTO.UserDTO();
            userDTO.setId(property.getUser().getId());
            userDTO.setFirstName(property.getUser().getFirstName());
            userDTO.setLastName(property.getUser().getLastName());
            userDTO.setEmail(property.getUser().getEmail());
            userDTO.setMobileNumber(property.getUser().getMobileNumber());
            userDTO.setRole(property.getUser().getRole().name()); // ✅ ADDED
            dto.setUser(userDTO);

            logger.debug("Set user info for property {}: User ID {} (Role: {})",
                    property.getId(), userDTO.getId(), userDTO.getRole());
        } else {
            logger.warn("Property {} has no user associated!", property.getId());
        }

        if (property.getArea() != null) {
            dto.setAreaName(property.getArea().getAreaName());
            dto.setPincode(property.getArea().getPincode());

            if (property.getArea().getCity() != null) {
                dto.setCityName(property.getArea().getCity().getCityName());
                dto.setState(property.getArea().getCity().getState());
            }
        }

        return dto;
    }

    public List<Property> findAll() {
        return repo.findAll();
    }

    public Optional<Property> findById(Long id) {
        return repo.findById(id);
    }

    public List<Property> findByCity(String city) {
        return repo.findByCityIgnoreCase(city);
    }

    public List<Property> findByAreaName(String areaName) {
        return repo.findByAreaNameAndIsActiveTrue(areaName);
    }

    /**
     * Get all active properties
     */
    public List<Property> getAllActiveProperties() {
        logger.info("Fetching all active properties");
        return repo.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    /**
     * Get all active properties and convert to DTOs
     */
    public List<PropertyDTO> getAllActivePropertiesAsDTO() {
        logger.info("Fetching all active properties as DTOs");
        List<Property> properties = repo.findByIsActiveTrueOrderByCreatedAtDesc();

        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get properties by type and convert to DTOs
     */
    public List<PropertyDTO> getPropertiesByTypeAsDTO(String type) {
        logger.info("Fetching properties of type: {} as DTOs", type);
        List<Property> properties = repo.findByTypeIgnoreCaseAndIsActiveTrue(type);

        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update property
     */
    public Property updateProperty(Long id, Property propertyDetails) {
        Property property = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));

        if (propertyDetails.getTitle() != null) property.setTitle(propertyDetails.getTitle());
        if (propertyDetails.getDescription() != null) property.setDescription(propertyDetails.getDescription());
        if (propertyDetails.getPrice() != null) property.setPrice(propertyDetails.getPrice());
        if (propertyDetails.getPriceDisplay() != null) property.setPriceDisplay(propertyDetails.getPriceDisplay());
        if (propertyDetails.getBedrooms() != null) property.setBedrooms(propertyDetails.getBedrooms());
        if (propertyDetails.getBathrooms() != null) property.setBathrooms(propertyDetails.getBathrooms());
        if (propertyDetails.getBalconies() != null) property.setBalconies(propertyDetails.getBalconies());
        if (propertyDetails.getAreaSqft() != null) property.setAreaSqft(propertyDetails.getAreaSqft());
        if (propertyDetails.getAddress() != null) property.setAddress(propertyDetails.getAddress());
        if (propertyDetails.getImageUrl() != null) property.setImageUrl(propertyDetails.getImageUrl());
        if (propertyDetails.getAmenities() != null) property.setAmenities(propertyDetails.getAmenities());
        if (propertyDetails.getStatus() != null) property.setStatus(propertyDetails.getStatus());
        if (propertyDetails.getListingType() != null) property.setListingType(propertyDetails.getListingType());
        if (propertyDetails.getIsFeatured() != null) property.setIsFeatured(propertyDetails.getIsFeatured());

        if (propertyDetails.getArea() != null) {
            Integer areaId = propertyDetails.getArea().getAreaId();
            if (areaId != null) {
                Area area = areaRepository.findById(areaId)
                        .orElseThrow(() -> new EntityNotFoundException("Area not found with ID: " + areaId));
                property.setArea(area);
            }
        }

        if (propertyDetails.getPropertyType() != null) {
            Integer propertyTypeId = propertyDetails.getPropertyType().getPropertyTypeId();
            if (propertyTypeId != null) {
                PropertyType propertyType = propertyTypeRepository.findById(propertyTypeId)
                        .orElseThrow(() -> new EntityNotFoundException("PropertyType not found with ID: " + propertyTypeId));
                property.setPropertyType(propertyType);
            }
        }

        if (propertyDetails.getOwnerType() != null) property.setOwnerType(propertyDetails.getOwnerType());
        if (propertyDetails.getIsReadyToMove() != null) property.setIsReadyToMove(propertyDetails.getIsReadyToMove());
        if (propertyDetails.getIsVerified() != null) property.setIsVerified(propertyDetails.getIsVerified());

        if (propertyDetails.getType() != null) property.setType(propertyDetails.getType());

        return repo.save(property);
    }

    /**
     * Soft delete property
     */
    public void deleteProperty(Long id) {
        Property property = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));
        property.setIsActive(false);
        repo.save(property);
    }

}