package com.example.realestate.service;

// Import for the new DTO
import com.example.realestate.dto.PriceInterestRequest;

// Imports for new Price Request logic
import com.example.realestate.model.PriceRequest;
import com.example.realestate.model.PriceRequestStatus;
import com.example.realestate.repository.PriceRequestRepository;

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
    private final PriceRequestRepository priceRequestRepository; // ⭐ 1. ADD PriceRequest REPOSITORY

    // ⭐ 2. UPDATE CONSTRUCTOR
    public PropertyService(PropertyRepository repo, UserRepository userRepository,
                           AreaRepository areaRepository, PropertyTypeRepository propertyTypeRepository,
                           PriceRequestRepository priceRequestRepository) { // ⭐ Add PriceRequestRepository
        this.repo = repo;
        this.userRepository = userRepository;
        this.areaRepository = areaRepository;
        this.propertyTypeRepository = propertyTypeRepository;
        this.priceRequestRepository = priceRequestRepository; // ⭐ Add this line
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

        // New fields
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

    /**
     * Helper method to convert Property Entity to PropertyDTO
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
        dto.setIsReadyToMove(property.getIsReadyToMove());
        dto.setOwnerType(property.getOwnerType());
        dto.setIsVerified(property.getIsVerified());

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

    // Existing methods
    public List<Property> findAll() { return repo.findAll(); }

    public Optional<Property> findById(Long id) { return repo.findById(id); }

    public List<Property> findByCity(String city) { return repo.findByCityIgnoreCase(city); }

    public List<Property> findByAreaName(String areaName) { return repo.findByAreaNameAndIsActiveTrue(areaName); }

    /**
     * Update property
     */
    public Property updateProperty(Long id, Property propertyDetails) {
        Property property = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));

        // ... (all your update logic) ...
        if (propertyDetails.getTitle() != null) property.setTitle(propertyDetails.getTitle());
        if (propertyDetails.getDescription() != null) property.setDescription(propertyDetails.getDescription());
        // ... etc ...

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

        // ... (rest of your update logic) ...

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

    // =================================================================
    // ⭐ 3. REPLACED METHOD FOR HANDLING INTERESTED PRICE ⭐
    // =================================================================
    /**
     * Creates a single Price Request (a notification) that agents/admins can see.
     */
    public void notifyAdminsAndAgents(PriceInterestRequest request) {

        Property property = repo.findById(request.getPropertyId())
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + request.getPropertyId()));

        User submittingUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("Submitting user not found with id: " + request.getUserId()));

        System.out.println("--- NEW PRICE REQUEST RECEIVED ---");
        System.out.println("Property: " + property.getTitle());
        System.out.println("From User: " + submittingUser.getEmail());

        // Create ONE price request and put it in the "PENDING" pool
        PriceRequest newRequest = new PriceRequest();
        newRequest.setProperty(property);
        newRequest.setBuyer(submittingUser);
        if (request.getPrice() != null) {
            newRequest.setInterestedPrice(BigDecimal.valueOf(request.getPrice()));
        }
        newRequest.setStatus(PriceRequestStatus.PENDING); // Set as PENDING

        priceRequestRepository.save(newRequest);

        System.out.println("✅ Price Request saved. Awaiting agent acceptance.");
    }
}