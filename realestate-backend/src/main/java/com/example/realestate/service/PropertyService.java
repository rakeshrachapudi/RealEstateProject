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
import org.springframework.beans.factory.annotation.Autowired;
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

    // ✅ NEW: Add BrokerSubscriptionService dependency
    @Autowired
    private BrokerSubscriptionService brokerSubscriptionService;

    public PropertyService(PropertyRepository repo, UserRepository userRepository,
                           AreaRepository areaRepository, PropertyTypeRepository propertyTypeRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.areaRepository = areaRepository;
        this.propertyTypeRepository = propertyTypeRepository;
    }

    // ==================== ⭐ UPDATED: PROPERTY CREATION WITH BROKER CHECKS ====================

    /**
     * Create new property from DTO with broker subscription enforcement.
     * ✅ FIXED: Now checks broker subscription before allowing property creation
     */
    public Property postProperty(PropertyPostRequestDto dto) {
        Long areaId = dto.getArea().getId();
        Long userId = dto.getUser().getId();

        Area area = areaRepository.findById(areaId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Area not found with ID: " + areaId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // ✅ NEW: ENFORCE BROKER SUBSCRIPTION
        if (user.getRole() == User.UserRole.BROKER) {
            logger.info("🔍 User {} is a BROKER - checking subscription status", userId);

            // Check #1: Does broker have active subscription?
            if (!brokerSubscriptionService.hasActiveSubscription(userId)) {
                logger.error("❌ Broker {} has NO active subscription", userId);
                throw new RuntimeException(
                        "Subscription required. Please activate a subscription or use a trial coupon to post properties."
                );
            }

            // Check #2: Has broker reached property limit?
            if (!brokerSubscriptionService.canPostProperty(userId)) {
                logger.error("❌ Broker {} has reached property posting limit", userId);

                // Get current subscription info for detailed message
                var status = brokerSubscriptionService.getSubscriptionStatus(userId);
                throw new RuntimeException(
                        String.format("Property limit reached (%s/%s). Please upgrade your subscription to post more properties.",
                                status.get("propertiesPosted"),
                                status.get("maxProperties"))
                );
            }

            // ✅ Auto-set ownerType to "broker" for broker users
            dto.setOwnerType("broker");
            logger.info("✅ Broker subscription check passed - auto-setting ownerType='broker'");
        }

        // Fetch or default property type
        PropertyType propertyType = propertyTypeRepository.findByTypeName(dto.getType())
                .orElseGet(() -> {
                    logger.warn("PropertyType '{}' not found. Defaulting to 'Apartment'.", dto.getType());
                    return propertyTypeRepository.findByTypeName("Apartment").orElse(null);
                });

        // Create property entity
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

        property.setOwnerType(dto.getOwnerType()); // Already set to "broker" above if broker
        property.setIsReadyToMove(dto.getIsReadyToMove());
        property.setIsVerified(dto.getIsVerified());

        // Save property
        Property savedProperty = repo.save(property);
        logger.info("✅ Property {} created successfully by user {} (Role: {})",
                savedProperty.getId(), userId, user.getRole());

        // ✅ NEW: Increment broker's property count after successful save
        if (user.getRole() == User.UserRole.BROKER) {
            brokerSubscriptionService.incrementPropertiesPosted(userId);
            logger.info("✅ Incremented property count for broker {}", userId);
        }

        return savedProperty;
    }

    // ==================== ⭐ CASCADE DELETE METHOD ====================

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

    // ==================== OTHER METHODS ====================

    public List<String> getPropertyTypes() {
        return repo.findDistinctPropertyTypes();
    }

    public List<Property> findByType(String type) {
        return repo.findByTypeIgnoreCaseAndIsActiveTrue(type);
    }

    public List<PropertyDTO> findByAreaNameAsDTO(String areaName) {
        logger.info("Finding properties by area name as DTOs: {}", areaName);
        List<Property> properties = repo.findByAreaNameAndIsActiveTrue(areaName);
        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PropertyDTO> getPropertiesByUser(Long userId) {
        logger.info("Fetching properties for user ID: {}", userId);
        List<Property> properties = repo.findByUserId(userId);

        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

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

        // ✅ Include role in user DTO
        if (property.getUser() != null) {
            PropertyDTO.UserDTO userDTO = new PropertyDTO.UserDTO();
            userDTO.setId(property.getUser().getId());
            userDTO.setFirstName(property.getUser().getFirstName());
            userDTO.setLastName(property.getUser().getLastName());
            userDTO.setEmail(property.getUser().getEmail());
            userDTO.setMobileNumber(property.getUser().getMobileNumber());
            userDTO.setRole(property.getUser().getRole().name());
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

    public List<Property> getAllActiveProperties() {
        logger.info("Fetching all active properties");
        return repo.findByIsActiveTrueOrderByCreatedAtDesc();
    }

    public List<PropertyDTO> getAllActivePropertiesAsDTO() {
        logger.info("Fetching all active properties as DTOs");
        List<Property> properties = repo.findByIsActiveTrueOrderByCreatedAtDesc();

        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PropertyDTO> getPropertiesByTypeAsDTO(String type) {
        logger.info("Fetching properties of type: {} as DTOs", type);
        List<Property> properties = repo.findByTypeIgnoreCaseAndIsActiveTrue(type);

        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

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

    public void deleteProperty(Long id) {
        Property property = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));
        property.setIsActive(false);
        repo.save(property);
    }
}