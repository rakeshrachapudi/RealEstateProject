package com.example.realestate.controller;

import com.example.realestate.model.Property;
import com.example.realestate.repository.PropertyRepository;
import com.example.realestate.service.PropertyService;
import com.example.realestate.dto.PropertyPostRequestDto;
import com.example.realestate.dto.PropertyDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityNotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyController.class);
    private final PropertyService service;

    @Autowired
    private PropertyRepository propertyRepository;

    public PropertyController(PropertyService service) {
        this.service = service;
    }

    // -------------------------------------------------------------
    // Specific Exception Handler for Subscription/Limit Errors
    // -------------------------------------------------------------
    @ExceptionHandler({RuntimeException.class})
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<String> handleBrokerSubscriptionException(RuntimeException ex) {
        String message = ex.getMessage();
        logger.error("Broker/Subscription error: {}", message);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(message);
    }

    // Create property
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PropertyPostRequestDto dto) {
        logger.info("Attempting to create new property from DTO.");
        try {
            Property createdProperty = service.postProperty(dto);
            return new ResponseEntity<>(createdProperty, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            logger.error("Error creating property: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getPropertyTypes() {
        List<String> types = service.getPropertyTypes();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/byType")
    public ResponseEntity<List<PropertyDTO>> getPropertiesByType(@RequestParam String type) {
        logger.info("Fetching properties of type: {}", type);
        List<PropertyDTO> properties = service.getPropertiesByTypeAsDTO(type);
        return ResponseEntity.ok(properties);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PropertyDTO>> byUser(@PathVariable Long userId) {
        logger.info("Fetching properties for user ID: {} with accurate featured status", userId);
        List<PropertyDTO> userProperties = service.getPropertiesByUserWithAccurateFeaturedStatus(userId);
        if (userProperties.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(userProperties);
    }

    @GetMapping
    public List<Property> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> findById(@PathVariable Long id) {
        Optional<Property> property = service.findById(id);
        return property.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<PropertyDTO>> getAllActiveProperties() {
        logger.info("Fetching all active properties with accurate featured status");
        List<PropertyDTO> properties = service.getAllActivePropertiesWithAccurateFeaturedStatus();
        return ResponseEntity.ok(properties);
    }

    @GetMapping("/{id}/is-featured")
    public ResponseEntity<Map<String, Boolean>> checkIfFeatured(@PathVariable Long id) {
        logger.info("Checking if property {} is featured", id);
        boolean isFeatured = service.isPropertyFeatured(id);
        return ResponseEntity.ok(Map.of("isFeatured", isFeatured));
    }

    @GetMapping("/byCity/{city}")
    public List<Property> byCity(@PathVariable String city) {
        logger.info("Fetching properties in city: {}", city);
        return service.findByCity(city);
    }

    @GetMapping("/byArea/{areaName}")
    public ResponseEntity<List<PropertyDTO>> byArea(@PathVariable String areaName) {
        logger.info("Fetching properties in area: {}", areaName);
        List<PropertyDTO> properties = service.searchByAreaAsDTO(areaName);
        return ResponseEntity.ok(properties);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Property> update(@PathVariable Long id, @RequestBody Property propertyDetails) {
        logger.info("Updating property with ID: {}", id);
        try {
            Property updated = service.updateProperty(id, propertyDetails);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException e) {
            logger.error("Error updating property: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        logger.info("Deleting property with ID: {}", id);
        try {
            service.deleteProperty(id);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            logger.error("Error deleting property: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * QUICK SEARCH (single q parameter) – returns DTOs with images
     * Example: GET /api/properties/search/quick?q=20132
     * Example: GET /api/properties/search/quick?q=Gachibowli
     * Example: GET /api/properties/search/quick?q=Palm Residency
     */
    @GetMapping("/search/quick")
    public ResponseEntity<?> quickSearchProperties(@RequestParam(required = false) String q) {
        try {
            if (q == null || q.trim().isEmpty()) {
                logger.warn("Quick search called with empty query parameter");
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Query parameter 'q' is required and cannot be empty"
                ));
            }

            logger.info("Quick search with query: {}", q);
            List<PropertyDTO> results = service.quickSearchAsDTO(q);

            if (results.isEmpty()) {
                logger.info("Quick search returned no results for query: {}", q);
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "data", results,
                        "message", "No properties found matching the search criteria"
                ));
            }

            logger.info("Quick search found {} properties for query: {}", results.size(), q);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", results,
                    "count", results.size()
            ));
        } catch (Exception e) {
            logger.error("Error in quick search for query '{}': {}", q, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Error searching properties: " + e.getMessage()
            ));
        }
    }
}