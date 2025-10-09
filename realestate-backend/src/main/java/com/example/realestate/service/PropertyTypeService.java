package com.example.realestate.service;

import com.example.realestate.model.PropertyType;
import com.example.realestate.repository.PropertyTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PropertyTypeService {

    private static final Logger logger = LoggerFactory.getLogger(PropertyTypeService.class);
    private final PropertyTypeRepository propertyTypeRepository;

    public PropertyTypeService(PropertyTypeRepository propertyTypeRepository) {
        this.propertyTypeRepository = propertyTypeRepository;
    }

    /**
     * Get all active property types
     */
    public List<PropertyType> getAllPropertyTypes() {
        logger.info("Fetching all active property types");
        return propertyTypeRepository.findByIsActiveTrue();
    }

    /**
     * Get all property types (including inactive)
     */
    public List<PropertyType> getAllPropertyTypesIncludingInactive() {
        logger.info("Fetching all property types");
        return propertyTypeRepository.findAll();
    }

    /**
     * Get property type by ID
     */
    public PropertyType getPropertyTypeById(Integer typeId) {
        logger.info("Fetching property type with ID: {}", typeId);
        return propertyTypeRepository.findById(typeId)
                .orElseThrow(() -> new RuntimeException("Property type not found with id: " + typeId));
    }

    /**
     * Get property type by name
     */
    public PropertyType getPropertyTypeByName(String typeName) {
        logger.info("Fetching property type with name: {}", typeName);
        return propertyTypeRepository.findByTypeNameIgnoreCase(typeName)
                .orElse(null);
    }

    /**
     * Create new property type
     */
    public PropertyType createPropertyType(PropertyType propertyType) {
        logger.info("Creating new property type: {}", propertyType.getTypeName());

        // Check if property type already exists
        if (propertyTypeRepository.existsByTypeName(propertyType.getTypeName())) {
            throw new RuntimeException("Property type already exists: " + propertyType.getTypeName());
        }

        return propertyTypeRepository.save(propertyType);
    }

    /**
     * Update existing property type
     */
    public PropertyType updatePropertyType(Integer typeId, PropertyType typeDetails) {
        logger.info("Updating property type with ID: {}", typeId);
        PropertyType propertyType = propertyTypeRepository.findById(typeId)
                .orElseThrow(() -> new RuntimeException("Property type not found with id: " + typeId));

        propertyType.setTypeName(typeDetails.getTypeName());
        propertyType.setDescription(typeDetails.getDescription());
        propertyType.setIsActive(typeDetails.getIsActive());

        return propertyTypeRepository.save(propertyType);
    }

    /**
     * Delete property type (soft delete by setting isActive to false)
     */
    public void deletePropertyType(Integer typeId) {
        logger.info("Deleting property type with ID: {}", typeId);
        PropertyType propertyType = propertyTypeRepository.findById(typeId)
                .orElseThrow(() -> new RuntimeException("Property type not found with id: " + typeId));

        propertyType.setIsActive(false);
        propertyTypeRepository.save(propertyType);
    }
}