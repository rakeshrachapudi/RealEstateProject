package com.example.realestate.service;

import com.example.realestate.dto.PropertyDTO;
import com.example.realestate.dto.PropertySearchRequest;
import com.example.realestate.model.Property;
import com.example.realestate.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PropertySearchService {

    private static final Logger logger = LoggerFactory.getLogger(PropertySearchService.class);
    private final PropertyRepository propertyRepository;

    public PropertySearchService(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    /**
     * Search properties based on multiple filters
     */
    public List<PropertyDTO> searchProperties(PropertySearchRequest request) {
        logger.info("Searching properties with request: {}", request);

        Sort sort = Sort.by(
                request.getSortOrder().equalsIgnoreCase("ASC") ?
                        Sort.Direction.ASC : Sort.Direction.DESC,
                request.getSortBy()
        );

        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize(),
                sort
        );

        Page<Property> propertyPage = propertyRepository.searchProperties(
                request.getPropertyType(),
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getCity(),
                request.getArea(),
                request.getListingType(),
                request.getMinBedrooms(),
                request.getMaxBedrooms(),
                request.getIsVerified(),
                request.getOwnerType(),
                request.getIsReadyToMove(),
                pageable
        );

        logger.info("Found {} properties", propertyPage.getTotalElements());

        return propertyPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get featured properties
     */
    public List<PropertyDTO> getFeaturedProperties() {
        logger.info("Fetching featured properties");
        List<Property> properties = propertyRepository.findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc();

        return properties.stream()
                .limit(6)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get properties by listing type (sale/rent)
     */
    public List<PropertyDTO> getPropertiesByListingType(String listingType) {
        logger.info("Fetching properties with listing type: {}", listingType);
        List<Property> properties = propertyRepository.findByListingTypeAndIsActiveTrue(listingType);

        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get properties by area
     */
    public List<PropertyDTO> getPropertiesByArea(Integer areaId) {
        logger.info("Fetching properties in area ID: {}", areaId);
        List<Property> properties = propertyRepository.findByAreaId(areaId);

        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get properties by user
     */
    public List<PropertyDTO> getPropertiesByUser(Long userId) {
        logger.info("Fetching properties for user ID: {}", userId);
        List<Property> properties = propertyRepository.findByUserId(userId);

        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * ⭐ UPDATED: Convert Property entity to PropertyDTO
     * NOW INCLUDES USER INFORMATION!
     */
    private PropertyDTO convertToDTO(Property property) {
        PropertyDTO dto = new PropertyDTO();

        dto.setPropertyId(property.getId());
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
        dto.setIsReadyToMove(property.getIsReadyToMove());
        dto.setOwnerType(property.getOwnerType());
        dto.setIsVerified(property.getIsVerified());

        // ⭐ NEW: Set user information
        if (property.getUser() != null) {
            PropertyDTO.UserDTO userDTO = new PropertyDTO.UserDTO();
            userDTO.setId(property.getUser().getId());
            userDTO.setFirstName(property.getUser().getFirstName());
            userDTO.setLastName(property.getUser().getLastName());
            userDTO.setEmail(property.getUser().getEmail());
            userDTO.setMobileNumber(property.getUser().getMobileNumber());
            dto.setUser(userDTO);

            logger.debug("Set user info for property {}: User ID {}", property.getId(), userDTO.getId());
        } else {
            logger.warn("Property {} has no user associated!", property.getId());
        }

        // Set property type
        if (property.getPropertyType() != null) {
            dto.setPropertyType(property.getPropertyType().getTypeName());
        } else if (property.getType() != null) {
            dto.setPropertyType(property.getType());
        }

        // Set location details
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

        return dto;
    }
}