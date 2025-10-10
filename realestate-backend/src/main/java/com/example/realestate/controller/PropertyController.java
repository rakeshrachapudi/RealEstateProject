package com.example.realestate.controller;

import com.example.realestate.model.Property;
import com.example.realestate.service.PropertyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PropertyController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyController.class);
    private final PropertyService service;

    public PropertyController(PropertyService service) {
        this.service = service;
    }

    /**
     * Get all properties
     */
    @GetMapping
    public List<Property> all() {
        logger.info("Fetching all properties");
        return service.findAll();
    }

    /**
     * Get property by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        logger.info("Fetching property with ID: {}", id);
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Filter properties by type and/or listing type
     * Example: /api/properties/filter?type=Apartment&listingType=sale
     */
    @GetMapping("/filter")
    public List<Property> filterProperties(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String listingType) {

        logger.info("Filtering properties - type: {}, listingType: {}", type, listingType);

        if (type != null && listingType != null) {
            return service.findByTypeAndListingType(type, listingType);
        } else if (type != null) {
            return service.findByType(type);
        } else if (listingType != null) {
            return service.findByListingType(listingType);
        } else {
            return service.findAll();
        }
    }

    /**
     * Get properties by city
     */
    @GetMapping("/city/{city}")
    public List<Property> byCity(@PathVariable String city) {
        logger.info("Fetching properties in city: {}", city);
        return service.findByCity(city);
    }

    /**
     * Get properties by type (Apartment, Villa, House, etc.)
     */
    @GetMapping("/type/{type}")
    public List<Property> byType(@PathVariable String type) {
        logger.info("Fetching properties of type: {}", type);
        return service.findByType(type);
    }

    /**
     * Get properties by listing type (sale/rent)
     */
    @GetMapping("/listing/{listingType}")
    public List<Property> byListingType(@PathVariable String listingType) {
        logger.info("Fetching properties with listing type: {}", listingType);
        return service.findByListingType(listingType);
    }

    /**
     * Get properties by area name
     */
    @GetMapping("/area/{areaName}")
    public List<Property> byArea(@PathVariable String areaName) {
        logger.info("Fetching properties in area: {}", areaName);
        return service.findByAreaName(areaName);
    }

    /**
     * Get properties by user
     */
    @GetMapping("/user/{userId}")
    public List<Property> byUser(@PathVariable Long userId) {
        logger.info("Fetching properties for user ID: {}", userId);
        return service.getPropertiesByUser(userId);
    }

    /**
     * Create new property
     */
    @PostMapping
    public Property create(@RequestBody Property property) {
        logger.info("Creating new property: {}", property.getTitle());
        return service.save(property);
    }

    /**
     * Update property
     */
    @PutMapping("/{id}")
    public ResponseEntity<Property> update(@PathVariable Long id, @RequestBody Property propertyDetails) {
        logger.info("Updating property with ID: {}", id);
        try {
            Property updated = service.updateProperty(id, propertyDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.error("Error updating property: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete property (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        logger.info("Deleting property with ID: {}", id);
        try {
            service.deleteProperty(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            logger.error("Error deleting property: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}