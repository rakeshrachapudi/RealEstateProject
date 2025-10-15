package com.example.realestate.service;

import com.example.realestate.dto.PropertyDTO;
import com.example.realestate.dto.PropertyPostRequestDto;
import com.example.realestate.model.Area;
import com.example.realestate.model.DealStatusAudit;
import com.example.realestate.model.Property;
import com.example.realestate.model.PropertyType;
import com.example.realestate.model.User;
import com.example.realestate.repository.AreaRepository;
import com.example.realestate.repository.DealStatusAuditRepository;
import com.example.realestate.repository.PropertyRepository;
import com.example.realestate.repository.PropertyTypeRepository;
import com.example.realestate.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PropertyService {

    private static final Logger logger = LoggerFactory.getLogger(PropertyService.class);
    private final PropertyRepository repo;
    private final UserRepository userRepository;
    private final AreaRepository areaRepository;
    private final PropertyTypeRepository propertyTypeRepository;
    private final DealStatusAuditRepository auditRepository;

    public PropertyService(PropertyRepository repo, UserRepository userRepository, AreaRepository areaRepository, PropertyTypeRepository propertyTypeRepository, DealStatusAuditRepository auditRepository) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.areaRepository = areaRepository;
        this.propertyTypeRepository = propertyTypeRepository;
        this.auditRepository = auditRepository;
    }

    @Transactional
    public PropertyDTO postProperty(PropertyPostRequestDto dto) { // ✅ FIX: Return DTO
        Integer areaId = dto.getArea().getId();
        Long userId = dto.getUser().getId();

        Area area = areaRepository.findById(areaId)
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
        property.setDealStatus(Property.DealStatus.INQUIRY);

        Property savedProperty = repo.save(property);
        return convertToDTO(savedProperty); // Convert to DTO before returning
    }

    // ... (rest of the service methods remain the same)

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

        if (property.getPropertyType() != null) {
            dto.setPropertyType(property.getPropertyType().getTypeName());
        } else {
            dto.setPropertyType(property.getType());
        }

        if (property.getArea() != null) {
            dto.setAreaName(property.getArea().getAreaName());
            dto.setPincode(property.getArea().getPincode());
            if (property.getArea().getCity() != null) {
                dto.setCityName(property.getArea().getCity().getCityName());
                dto.setState(property.getArea().getCity().getState());
            }
        }

        if (property.getUser() != null) {
            PropertyDTO.UserDTO userDTO = new PropertyDTO.UserDTO();
            userDTO.setId(property.getUser().getId());
            userDTO.setFirstName(property.getUser().getFirstName());
            userDTO.setLastName(property.getUser().getLastName());
            userDTO.setEmail(property.getUser().getEmail());
            userDTO.setMobileNumber(property.getUser().getMobileNumber());
            dto.setUser(userDTO);
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public List<PropertyDTO> findAll() {
        return repo.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public Property updateDealStatus(Long id, Property.DealStatus newStatus) {
        Property property = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));

        Property.DealStatus oldStatus = property.getDealStatus();

        if (oldStatus != newStatus) {
            DealStatusAudit audit = new DealStatusAudit();
            audit.setProperty(property);
            audit.setOldStatus(oldStatus);
            audit.setNewStatus(newStatus);

            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            userRepository.findByUsername(username).ifPresent(audit::setChangedBy);

            auditRepository.save(audit);

            property.setDealStatus(newStatus);
        }
        return repo.save(property);
    }

    @Transactional
    public void approveRegistration(Long propertyId) {
        Property property = repo.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + propertyId));

        property.setRegistrationConfirmedBy("ADMIN");
        updateDealStatus(propertyId, Property.DealStatus.REGISTRATION);
    }

    @Transactional
    public void uploadRegistrationProof(Long propertyId, String proofUrl) {
        Property property = repo.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + propertyId));
        property.setRegistrationProofUrl(proofUrl);
        property.setRegistrationConfirmedBy("BUYER");
        repo.save(property);
    }

    @Transactional
    public void confirmRegistrationBySeller(Long propertyId) {
        Property property = repo.findById(propertyId)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + propertyId));
        property.setRegistrationConfirmedBy("SELLER");
        repo.save(property);
    }

    @Transactional(readOnly = true)
    public List<DealStatusAudit> getAuditTrail(Long propertyId) {
        return auditRepository.findByPropertyIdOrderByTimestampDesc(propertyId);
    }

    @Transactional(readOnly = true)
    public List<PropertyDTO> getPropertiesByUser(Long userId) {
        List<Property> properties = repo.findByUserId(userId);
        return properties.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Property> findById(Long id) { return repo.findById(id); }

    @Transactional
    public Property updateProperty(Long id, Property propertyDetails) {
        Property property = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));
        // ... (full update logic is needed here) ...
        return repo.save(property);
    }

    @Transactional
    public void deleteProperty(Long id) {
        Property property = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Property not found with id: " + id));
        property.setIsActive(false); // Soft delete
        repo.save(property);
    }
}