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

    /**
     * Create new property from DTO.
     */
    public Property postProperty(PropertyPostRequestDto dto) {
        // Get area ID and User ID from the nested DTO structure
        Long areaId = dto.getArea().getId();
        Long userId = dto.getUser().getId();

        // Fetch entities
        Area area = areaRepository.findById(areaId.intValue())
                .orElseThrow(() -> new EntityNotFoundException("Area not found with ID: " + areaId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + userId));

        PropertyType propertyType = propertyTypeRepository.findByTypeName(dto.getType())
                .orElseGet(() -> {
                    logger.warn("PropertyType '{}' not found. Defaulting to 'Apartment'.", dto.getType());
                    return propertyTypeRepository.findByTypeName("Apartment").orElse(null);
                });

        // Create and populate the Property entity
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
        property.setCity(dto.getCity()); // Retaining for backward compatibility
        property.setAddress(dto.getAddress());
        property.setAmenities(dto.getAmenities());
        property.setStatus(dto.getStatus());
        property.setIsFeatured(dto.getIsFeatured());
        property.setIsActive(dto.getIsActive());

        return repo.save(property);
    }

    /**
     * Get properties by user and convert to DTOs
     */
    public List<PropertyDTO> getPropertiesByUser(Long userId) {
        logger.info("Fetching properties for user ID: {}", userId);
        List<Property> properties = repo.findByUserId(userId);

        // CONVERT LIST OF ENTITIES TO LIST OF DTOS
        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Helper method to convert Property Entity to PropertyDTO
     * ⭐ CRITICAL FIXES APPLIED HERE
     */
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
        dto.setAddress(property.getAddress());
        dto.setStatus(property.getStatus());
        dto.setListingType(property.getListingType());
        dto.setImageUrl(property.getImageUrl());
        dto.setAmenities(property.getAmenities());
        dto.setIsFeatured(property.getIsFeatured());
        dto.setCreatedAt(property.getCreatedAt());
        dto.setPriceDisplay(property.getPriceDisplay());

        // Area/Location details (safe checks to prevent NullPointerExceptions)
        if (property.getArea() != null) {
            // ⭐ FIX: Use getAreaName() instead of getName()
            dto.setAreaName(property.getArea().getAreaName());

            if (property.getArea().getCity() != null) {
                // ⭐ FIX: Use getCityName() instead of getName()
                dto.setCityName(property.getArea().getCity().getCityName());
                // Use getState() (Assuming a simple 'state' field in the City model)
                dto.setState(property.getArea().getCity().getState());
                // You can also set pincode if your City/Area model has it:
                // dto.setPincode(property.getArea().getPincode());
            }
        }

        return dto;
    }

    // --- Existing methods (kept for completeness) ---

    public List<Property> findAll() { return repo.findAll(); }
    public Optional<Property> findById(Long id) { return repo.findById(id); }
    public List<Property> findByCity(String city) { return repo.findByCityIgnoreCase(city); }
    public List<Property> findByAreaName(String areaName) { return repo.findByAreaNameAndIsActiveTrue(areaName); }

    public Property updateProperty(Long id, Property propertyDetails) {
        Property property = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));

        if (propertyDetails.getTitle() != null) { property.setTitle(propertyDetails.getTitle()); }
        if (propertyDetails.getDescription() != null) { property.setDescription(propertyDetails.getDescription()); }
        if (propertyDetails.getPrice() != null) { property.setPrice(propertyDetails.getPrice()); }
        if (propertyDetails.getPriceDisplay() != null) { property.setPriceDisplay(propertyDetails.getPriceDisplay()); }
        if (propertyDetails.getBedrooms() != null) { property.setBedrooms(propertyDetails.getBedrooms()); }
        if (propertyDetails.getBathrooms() != null) { property.setBathrooms(propertyDetails.getBathrooms()); }
        if (propertyDetails.getBalconies() != null) { property.setBalconies(propertyDetails.getBalconies()); }
        if (propertyDetails.getAreaSqft() != null) { property.setAreaSqft(propertyDetails.getAreaSqft()); }
        if (propertyDetails.getAddress() != null) { property.setAddress(propertyDetails.getAddress()); }
        if (propertyDetails.getImageUrl() != null) { property.setImageUrl(propertyDetails.getImageUrl()); }
        if (propertyDetails.getAmenities() != null) { property.setAmenities(propertyDetails.getAmenities()); }
        if (propertyDetails.getStatus() != null) { property.setStatus(propertyDetails.getStatus()); }
        if (propertyDetails.getListingType() != null) { property.setListingType(propertyDetails.getListingType()); }
        if (propertyDetails.getIsFeatured() != null) { property.setIsFeatured(propertyDetails.getIsFeatured()); }
        if (propertyDetails.getPropertyType() != null) { property.setPropertyType(propertyDetails.getPropertyType()); }
        if (propertyDetails.getArea() != null) { property.setArea(propertyDetails.getArea()); }

        return repo.save(property);
    }
    public void deleteProperty(Long id) {
        Property property = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));
        property.setIsActive(false); // Soft delete
        repo.save(property);
    }
}