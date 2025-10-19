package com.example.realestate.controller;

// ⭐ Import the DTO for the price request
import com.example.realestate.dto.PriceInterestRequest;
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
import java.util.HashMap; // For success message
import java.util.Map;     // For success message
import java.util.List;
import java.util.Optional;

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
     * UPDATED METHOD: Create new property using the dedicated DTO and error handling.
     */
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PropertyPostRequestDto dto) {
        // ... (your existing create method is perfect) ...
        logger.info("Attempting to create new property from DTO.");
        try {
            Property createdProperty = service.postProperty(dto);
            // Return 201 Created status
            return new ResponseEntity<>(createdProperty, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            logger.error("Error creating property: {}", e.getMessage());
            // Return 400 Bad Request for validation/missing FK errors
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating property.", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    // =================================================================
    // ⭐ NEW METHOD TO ADD FOR INTERESTED PRICE ⭐
    // =================================================================
    /**
     * Handles the submission of an interested price from a user.
     * This will call the service logic to notify all agents and admins.
     * Endpoint: POST /api/properties/interested-price
     */
    @PostMapping("/interested-price")
    public ResponseEntity<?> submitInterestedPrice(@RequestBody PriceInterestRequest request) {
        logger.info("Received interested price request for propertyId: {} from userId: {}",
                request.getPropertyId(), request.getUserId());
        try {
            // The service will handle finding all agents/admins and notifying them
            service.notifyAdminsAndAgents(request);

            // Create a simple success response
            Map<String, String> response = new HashMap<>();
            response.put("message", "Price request submitted successfully.");

            // Return 200 OK
            return ResponseEntity.ok(response);

        } catch (EntityNotFoundException e) {
            logger.error("Error submitting price request: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error submitting price request.", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
    // =================================================================
    // (End of new method)
    // =================================================================


    /**
     * ⭐ CRITICAL FIX: Get properties by user (UPDATED to return DTOs)
     * Endpoint: GET /api/properties/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PropertyDTO>> byUser(@PathVariable Long userId) {
        // ... (your existing byUser method is perfect) ...
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

    @GetMapping("/byCity/{city}")
    public List<Property> byCity(@PathVariable String city) {
        logger.info("Fetching properties in city: {}", city);
        return service.findByCity(city);
    }

    @GetMapping("/byArea/{areaName}")
    public List<Property> byArea(@PathVariable String areaName) {
        logger.info("Fetching properties in area: {}", areaName);
        return service.findByAreaName(areaName);
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