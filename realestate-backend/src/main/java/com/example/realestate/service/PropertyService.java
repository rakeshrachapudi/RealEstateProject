package com.example.realestate.service;

import com.example.realestate.model.*;
import com.example.realestate.repository.*;
import com.example.realestate.dto.PropertyPostRequestDto;
import com.example.realestate.dto.PropertyDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class PropertyService {

    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);

    private final PropertyRepository repo;
    private final UserRepository userRepository;
    private final AreaRepository areaRepository;
    private final PropertyTypeRepository propertyTypeRepository;

    @Autowired
    private BrokerSubscriptionService brokerSubscriptionService;
    @Autowired
    private PropertyImageRepository propertyImageRepository;

    @Autowired
    private FeaturedPropertyRepository featuredPropertyRepository;

    public PropertyService(PropertyRepository repo, UserRepository userRepository,
                           AreaRepository areaRepository, PropertyTypeRepository propertyTypeRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.areaRepository = areaRepository;
        this.propertyTypeRepository = propertyTypeRepository;
    }

    // ==================== PROPERTY CREATION ====================

    public Property postProperty(PropertyPostRequestDto dto) {
        Long areaId = dto.getArea().getId();
        Long userId = dto.getUser().getId();

        Area area = areaRepository.findById(areaId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Area not found with ID: " + areaId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        // ENFORCE BROKER SUBSCRIPTION
        if (user.getRole() == User.UserRole.BROKER) {
            logger.info("User {} is a BROKER - checking subscription status", userId);

            if (!brokerSubscriptionService.hasActiveSubscription(userId)) {
                logger.error("Broker {} has NO active subscription", userId);
                throw new RuntimeException(
                        "Subscription required. Please activate a subscription or use a trial coupon to post properties."
                );
            }

            if (!brokerSubscriptionService.canPostProperty(userId)) {
                logger.error("Broker {} has reached property posting limit", userId);
                var status = brokerSubscriptionService.getSubscriptionStatus(userId);
                throw new RuntimeException(
                        String.format("Property limit reached (%s/%s). Please upgrade your subscription to post more properties.",
                                status.get("propertiesPosted"),
                                status.get("maxProperties"))
                );
            }

            dto.setOwnerType("broker");
            logger.info("Broker subscription check passed - ownerType='broker'");
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

        // Numeric fields
        property.setPrice(dto.getPrice() != null ? BigDecimal.valueOf(dto.getPrice()) : null);
        property.setPriceDisplay(dto.getPriceDisplay());

        property.setBedrooms(dto.getBedrooms());
        property.setBathrooms(dto.getBathrooms());
        property.setBalconies(dto.getBalconies());

        property.setPricePerSqft(dto.getPricePerSqft() != null ? BigDecimal.valueOf(dto.getPricePerSqft()) : null);
        property.setAreaSqft(dto.getAreaSqft() != null ? BigDecimal.valueOf(dto.getAreaSqft()) : null);

        // Foreign keys and info
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

        // status/owner/regulatory fields
        property.setOwnerType(dto.getOwnerType());
        property.setIsVerified(dto.getIsVerified());
        property.setIsReadyToMove("ready_to_move".equalsIgnoreCase(dto.getConstructionStatus()));
        property.setConstructionStatus(dto.getConstructionStatus());
        property.setPossessionYear(dto.getPossessionYear());
        property.setPossessionMonth(dto.getPossessionMonth());
        property.setReraId(dto.getReraId());
        property.setHmdaId(dto.getHmdaId());

        Property savedProperty = repo.save(property);
        logger.info("Property {} created successfully by user {} (Role: {})",
                savedProperty.getId(), userId, user.getRole());

        if (user.getRole() == User.UserRole.BROKER) {
            brokerSubscriptionService.incrementPropertiesPosted(userId);
            logger.info("Incremented property count for broker {}", userId);
        }

        return savedProperty;
    }

    // ==================== SOFT DELETE USER PROPERTIES ====================

    /**
     * Deactivate featured entries for a given property
     */
    private void deactivateFeaturedForProperty(Long propertyId) {
        List<FeaturedProperty> fps = featuredPropertyRepository.findByPropertyId(propertyId);
        if (fps == null || fps.isEmpty()) return;
        for (FeaturedProperty fp : fps) {
            fp.setIsActive(false);
        }
        featuredPropertyRepository.saveAll(fps);
    }

    @Transactional
    public void softDeleteAllPropertiesForUser(Long userId) {
        logger.info("Soft-deleting all properties for user ID: {}", userId);

        List<Property> userProperties = repo.findByUserId(userId);
        if (userProperties.isEmpty()) {
            logger.info("No properties found for user {}.", userId);
            return;
        }

        for (Property property : userProperties) {
            property.setIsActive(false);
            property.setStatus("DELETED");

            // ⭐ ALSO deactivate featured records for each property
            deactivateFeaturedForProperty(property.getId());
        }

        repo.saveAll(userProperties);
        logger.info("Soft-deleted {} properties for user {}", userProperties.size(), userId);
    }

    // ==================== Convert to DTO (with images) ====================

    private PropertyDTO convertToDTO(Property property) {
        PropertyDTO dto = new PropertyDTO();

        dto.setPropertyId(property.getId());
        dto.setTitle(property.getTitle());
        dto.setDescription(property.getDescription());

        // ⭐ FIX: Get primary image URL from PropertyImage table
        String imageUrl = getPrimaryImageUrl(property.getId());
        dto.setImageUrl(imageUrl != null ? imageUrl : property.getImageUrl());

        dto.setPrice(property.getPrice());
        dto.setPriceDisplay(property.getPriceDisplay());
        dto.setBedrooms(property.getBedrooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setBalconies(property.getBalconies());
        dto.setAreaSqft(property.getAreaSqft());
        dto.setPricePerSqft(property.getPricePerSqft());
        dto.setAddress(property.getAddress());
        dto.setAmenities(property.getAmenities());
        dto.setStatus(property.getStatus());
        dto.setListingType(property.getListingType());
        dto.setIsFeatured(property.getIsFeatured());
        dto.setOwnerType(property.getOwnerType());
        dto.setIsReadyToMove(property.getIsReadyToMove());
        dto.setIsVerified(property.getIsVerified());

        // Extra fields
        dto.setConstructionStatus(property.getConstructionStatus());
        dto.setPossessionYear(property.getPossessionYear());
        dto.setPossessionMonth(property.getPossessionMonth());
        dto.setReraId(property.getReraId());
        dto.setHmdaId(property.getHmdaId());

        dto.setCreatedAt(property.getCreatedAt());

        if (property.getArea() != null) {
            dto.setAreaName(property.getArea().getAreaName());
            dto.setPincode(property.getArea().getPincode());
            if (property.getArea().getCity() != null) {
                dto.setCityName(property.getArea().getCity().getCityName());
                dto.setState(property.getArea().getCity().getState());
            }
        } else if (property.getCity() != null) {
            dto.setCityName(property.getCity());
        }

        if (property.getPropertyType() != null) {
            dto.setPropertyType(property.getPropertyType().getTypeName());
        } else if (property.getType() != null) {
            dto.setPropertyType(property.getType());
        }

        if (property.getUser() != null) {
            PropertyDTO.UserDTO userDTO = new PropertyDTO.UserDTO();
            userDTO.setId(property.getUser().getId());
            userDTO.setFirstName(property.getUser().getFirstName());
            userDTO.setLastName(property.getUser().getLastName());
            userDTO.setEmail(property.getUser().getEmail());
            userDTO.setMobileNumber(property.getUser().getMobileNumber());
            userDTO.setRole(property.getUser().getRole().name());
            dto.setUser(userDTO);
        }

        return dto;
    }

    private String getPrimaryImageUrl(Long propertyId) {
        try {
            List<PropertyImage> images = propertyImageRepository.findByPropertyId(propertyId);
            if (images == null || images.isEmpty()) {
                return null;
            }

            PropertyImage primaryImage = images.stream()
                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                    .findFirst()
                    .orElse(images.get(0));

            return primaryImage.getImageUrl();
        } catch (Exception e) {
            logger.warn("Could not resolve primary image for property {}: {}", propertyId, e.getMessage());
            return null;
        }
    }

    // ==================== BASIC READ ====================

    public List<String> getPropertyTypes() {
        return repo.findDistinctPropertyTypes();
    }

    public List<Property> findAll() {
        return repo.findAll();
    }

    public Optional<Property> findById(Long id) {
        return repo.findById(id);
    }

    public List<PropertyDTO> getAllActivePropertiesWithAccurateFeaturedStatus() {
        logger.info("Fetching all active properties with accurate featured status");
        List<Property> properties = repo.findByIsActiveTrueOrderByCreatedAtDesc();
        if (properties.isEmpty()) return List.of();

        List<Long> propertyIds = properties.stream().map(Property::getId).collect(Collectors.toList());
        LocalDateTime now = LocalDateTime.now();
        List<Long> actuallyFeaturedIds = repo.findFeaturedPropertyIds(propertyIds, now);
        Set<Long> featuredIdSet = new HashSet<>(actuallyFeaturedIds);

        return properties.stream()
                .map(p -> {
                    PropertyDTO dto = convertToDTO(p);
                    dto.setIsFeatured(featuredIdSet.contains(p.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<PropertyDTO> getPropertiesByTypeAsDTO(String type) {
        logger.info("Fetching properties of type: {} as DTOs", type);
        List<Property> properties = repo.findByTypeIgnoreCaseAndIsActiveTrue(type);
        return properties.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<PropertyDTO> getPropertiesByUserWithAccurateFeaturedStatus(Long userId) {
        logger.info("Fetching properties for user ID: {} with accurate featured status", userId);
        List<Property> properties = repo.findByUserId(userId);
        if (properties.isEmpty()) return List.of();

        List<Long> propertyIds = properties.stream().map(Property::getId).collect(Collectors.toList());
        LocalDateTime now = LocalDateTime.now();
        List<Long> actuallyFeaturedIds = repo.findFeaturedPropertyIds(propertyIds, now);
        Set<Long> featuredIdSet = new HashSet<>(actuallyFeaturedIds);

        return properties.stream()
                .map(p -> {
                    PropertyDTO dto = convertToDTO(p);
                    dto.setIsFeatured(featuredIdSet.contains(p.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ==================== UPDATE / DELETE ====================

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
        if (propertyDetails.getOwnerType() != null) property.setOwnerType(propertyDetails.getOwnerType());
        if (propertyDetails.getIsReadyToMove() != null) property.setIsReadyToMove(propertyDetails.getIsReadyToMove());
        if (propertyDetails.getIsVerified() != null) property.setIsVerified(propertyDetails.getIsVerified());
        if (propertyDetails.getConstructionStatus() != null) property.setConstructionStatus(propertyDetails.getConstructionStatus());
        if (propertyDetails.getPossessionYear() != null) property.setPossessionYear(propertyDetails.getPossessionYear());
        if (propertyDetails.getPossessionMonth() != null) property.setPossessionMonth(propertyDetails.getPossessionMonth());
        if (propertyDetails.getReraId() != null) property.setReraId(propertyDetails.getReraId());
        if (propertyDetails.getHmdaId() != null) property.setHmdaId(propertyDetails.getHmdaId());
        if (propertyDetails.getPricePerSqft() != null) property.setPricePerSqft(propertyDetails.getPricePerSqft());

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

        if (propertyDetails.getType() != null) property.setType(propertyDetails.getType());

        return repo.save(property);
    }

    public void deleteProperty(Long id) {
        Property property = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));

        property.setIsActive(false);
        property.setStatus("DELETED");

        // ⭐ Deactivate featured entries when property is deleted
        deactivateFeaturedForProperty(id);

        repo.save(property);
    }

    // ==================== QUICK SEARCH (DTO) ====================

    public List<PropertyDTO> quickSearchAsDTO(String q) {
        if (q == null || q.trim().isEmpty()) return List.of();

        String trimmed = q.trim();

        List<Property> primary = repo.quickSearch(trimmed);
        List<Property> byArea = repo.searchByArea(trimmed);
        List<Property> byId = new ArrayList<>();

        Map<Long, Property> merged = new LinkedHashMap<>();
        for (Property p : primary) {
            if (p != null && p.getId() != null) merged.putIfAbsent(p.getId(), p);
        }
        for (Property p : byArea) {
            if (p != null && p.getId() != null) merged.putIfAbsent(p.getId(), p);
        }
        for (Property p : byId) {
            if (p != null && p.getId() != null) merged.putIfAbsent(p.getId(), p);
        }

        List<User> matchingUsers = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(trimmed, trimmed, trimmed);
        for (User user : matchingUsers) {
            List<Property> byUser = repo.findByUserIdAndIsActiveTrue(user.getId());
            for (Property p : byUser) {
                if (p != null && p.getId() != null) merged.putIfAbsent(p.getId(), p);
            }
        }

        try {
            long maybeId = Long.parseLong(trimmed);
            repo.findById(maybeId).ifPresent(byId::add);
        } catch (NumberFormatException ignore) {}

        List<Property> mergedList = new ArrayList<>(merged.values());
        if (mergedList.isEmpty()) return List.of();

        List<Long> ids = mergedList.stream().map(Property::getId).collect(Collectors.toList());
        List<Long> actuallyFeatured = repo.findFeaturedPropertyIds(ids, LocalDateTime.now());
        Set<Long> featuredSet = new HashSet<>(actuallyFeatured);

        return mergedList.stream()
                .map(p -> {
                    PropertyDTO dto = convertToDTO(p);
                    dto.setIsFeatured(featuredSet.contains(p.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<PropertyDTO> searchByAreaAsDTO(String area) {
        if (area == null || area.trim().isEmpty()) return List.of();
        List<Property> list = repo.searchByArea(area.trim());
        if (list.isEmpty()) return List.of();

        List<Long> ids = list.stream().map(Property::getId).collect(Collectors.toList());
        List<Long> actuallyFeatured = repo.findFeaturedPropertyIds(ids, LocalDateTime.now());
        Set<Long> featuredSet = new HashSet<>(actuallyFeatured);

        return list.stream()
                .map(p -> {
                    PropertyDTO dto = convertToDTO(p);
                    dto.setIsFeatured(featuredSet.contains(p.getId()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public boolean isPropertyFeatured(Long propertyId) {
        if (propertyId == null) return false;
        try {
            return repo.isPropertyActuallyFeatured(propertyId, LocalDateTime.now());
        } catch (Exception e) {
            logger.error("Error while checking featured status for property {}: {}", propertyId, e.getMessage(), e);
            return false;
        }
    }

    public List<Property> findByCity(String city) {
        if (city == null || city.trim().isEmpty()) return List.of();
        return repo.findByCityIgnoreCase(city.trim());
    }

    public List<PropertyDTO> findByAreaNameAsDTO(String areaName) {
        logger.info("Finding properties by area name as DTOs: {}", areaName);
        List<Property> properties = repo.findByAreaNameAndIsActiveTrue(areaName);
        return properties.stream().map(this::convertToDTO).collect(Collectors.toList());
    }
}
