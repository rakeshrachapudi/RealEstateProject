package com.example.realestate.controller;

import com.example.realestate.model.Property;
import com.example.realestate.service.PropertyService;
import com.example.realestate.dto.PropertyPostRequestDto;
import com.example.realestate.dto.PropertyDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Map;
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
     * Create a new property listing.
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> create(@RequestBody PropertyPostRequestDto dto) {
        logger.info("Attempting to create new property from DTO.");
        try {
            Property createdProperty = service.postProperty(dto);
            return new ResponseEntity<>(createdProperty, HttpStatus.CREATED);
        } catch (EntityNotFoundException e) {
            logger.error("Error creating property: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating property.", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred.");
        }
    }

    /**
     * Get all properties listed by a specific user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PropertyDTO>> byUser(@PathVariable Long userId) {
        logger.info("Fetching properties for user ID: {}", userId);
        List<PropertyDTO> userProperties = service.getPropertiesByUser(userId);
        if (userProperties.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(userProperties);
    }

    /**
     * Update the deal status of a property. Restricted to AGENT and ADMIN roles.
     */
    @PutMapping("/{id}/deal-status")
    @PreAuthorize("hasRole('AGENT') or hasRole('ADMIN')")
    public ResponseEntity<?> updateDealStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        logger.info("Updating deal status for property ID: {}", id);
        try {
            Property.DealStatus dealStatus = Property.DealStatus.valueOf(payload.get("dealStatus"));
            Property updatedProperty = service.updateDealStatus(id, dealStatus);
            return ResponseEntity.ok(updatedProperty);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid deal status provided.");
        }
    }

    /**
     * Endpoint for a user (buyer) to upload proof of registration.
     */
    @PostMapping("/{id}/upload-proof")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> uploadRegistrationProof(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        logger.info("Uploading registration proof for property ID: {}", id);
        try {
            String proofUrl = payload.get("proofUrl");
            if (proofUrl == null || proofUrl.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "proofUrl cannot be empty."));
            }
            service.uploadRegistrationProof(id, proofUrl);
            return ResponseEntity.ok(Map.of("message", "Registration proof uploaded successfully. Awaiting admin verification."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Endpoint for the property owner (seller) to manually confirm registration.
     */
    @PostMapping("/{id}/confirm-registration")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> confirmRegistrationBySeller(@PathVariable Long id) {
        logger.info("Seller confirming registration for property ID: {}", id);
        try {
            service.confirmRegistrationBySeller(id);
            return ResponseEntity.ok(Map.of("message", "Registration confirmed by seller. Awaiting admin verification."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }


    // --- Standard Property Endpoints ---

    @GetMapping
    public List<Property> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> findById(@PathVariable Long id) {
        Optional<Property> property = service.findById(id);
        return property.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
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
    @PreAuthorize("isAuthenticated()")
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
