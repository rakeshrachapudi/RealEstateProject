package com.example.realestate.controller;

import com.example.realestate.model.Property;
import com.example.realestate.service.PropertyService;
import com.example.realestate.dto.PropertyPostRequestDto;
import com.example.realestate.dto.PropertyDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyController.class);
    private final PropertyService service;


    public PropertyController(PropertyService service) {
        this.service = service;
    }
// -------------------------------------------------------------
// ⭐ NEW: Specific Exception Handler for Subscription/Limit Errors
// -------------------------------------------------------------

    @ExceptionHandler({RuntimeException.class})
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<String> handleBrokerSubscriptionException(RuntimeException ex) {
        String message = ex.getMessage();
        logger.error("Broker/Subscription error: {}", message);

        // This is a simple way to return a FORBIDDEN (403) status for controlled business exceptions.
        // In a complex app, you might use custom exceptions and more detailed response objects.

        // Use FORBIDDEN (403) for permission/subscription-based refusal.
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(message);
    }

// -------------------------------------------------------------
// ⭐ UPDATED METHOD: Property Creation with refined exception handling
// -------------------------------------------------------------

    /**
     * UPDATED METHOD: Create new property using the dedicated DTO.
     * Exceptions handled by the specific handlers above and below.
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PropertyPostRequestDto dto) {
        logger.info("Attempting to create new property from DTO.");
        try {
            Property createdProperty = service.postProperty(dto);
            // Return 201 Created status
            return new ResponseEntity<>(createdProperty, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            logger.error("Error creating property: {}", e.getMessage());
            // Return 400 Bad Request for validation/missing FK errors
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        // Note: RuntimeException (Broker checks) is now handled by the @ExceptionHandler above
        // Any other unexpected exception will fall through to a global 500 handler if one exists,
        // or just throw a 500 status by default.
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

    /**
     * ⭐ CRITICAL FIX: Get properties by user (UPDATED to return DTOs)
     * Endpoint: GET /api/properties/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PropertyDTO>> byUser(@PathVariable Long userId) {
        logger.info("Fetching properties for user ID: {}", userId);
        List<PropertyDTO> userProperties = service.getPropertiesByUser(userId);

        if (userProperties.isEmpty()) {
            // Return 204 No Content if the list is empty
            return ResponseEntity.noContent().build();
        }

        // Return 200 OK with the list of DTOs
        return ResponseEntity.ok(userProperties);
    }

    // --- Existing methods (kept for completeness) ---

    @GetMapping
    public List<Property> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> findById(@PathVariable Long id) {
        Optional<Property> property = service.findById(id);
        return property.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Get all active properties (returns DTOs)
     * Endpoint: GET /api/properties/all
     */
    @GetMapping("/all")
    public ResponseEntity<List<PropertyDTO>> getAllActiveProperties() {
        logger.info("Fetching all active properties as DTOs");
        List<PropertyDTO> properties = service.getAllActivePropertiesAsDTO();
        return ResponseEntity.ok(properties);
    }

    @GetMapping("/byCity/{city}")
    public List<Property> byCity(@PathVariable String city) {
        logger.info("Fetching properties in city: {}", city);
        return service.findByCity(city);
    }

    @GetMapping("/byArea/{areaName}")
    public ResponseEntity<List<PropertyDTO>> byArea(@PathVariable String areaName) {
        logger.info("Fetching properties in area: {}", areaName);
        List<PropertyDTO> properties = service.findByAreaNameAsDTO(areaName);
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

}