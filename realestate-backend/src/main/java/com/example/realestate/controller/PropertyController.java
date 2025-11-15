package com.example.realestate.controller;

import com.example.realestate.model.Property;
import com.example.realestate.dto.PropertyDTO;
import com.example.realestate.dto.PropertyPostRequestDto;
import com.example.realestate.repository.PropertyRepository;
import com.example.realestate.service.PropertyService;

import jakarta.persistence.EntityNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*")
public class PropertyController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyController.class);

    @Autowired
    private PropertyService service;

    @Autowired
    private PropertyRepository propertyRepository;

    // -------------------------------------------------------------
    // ⭐ GLOBAL HANDLER FOR SUBSCRIPTION / BROKER LIMIT ERRORS
    // -------------------------------------------------------------
    @ExceptionHandler({RuntimeException.class})
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<String> handleBusinessException(RuntimeException ex) {
        logger.error("Business Exception: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ex.getMessage());
    }

    // -------------------------------------------------------------
    // ⭐ CREATE PROPERTY
    // -------------------------------------------------------------
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PropertyPostRequestDto dto) {
        try {
            Property created = service.postProperty(dto);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
        }
    }

    // -------------------------------------------------------------
    // ⭐ PROPERTY TYPES
    // -------------------------------------------------------------
    @GetMapping("/types")
    public ResponseEntity<List<String>> getPropertyTypes() {
        return ResponseEntity.ok(service.getPropertyTypes());
    }

    // -------------------------------------------------------------
    // ⭐ PROPERTIES BY TYPE (DTO)
    // -------------------------------------------------------------
    @GetMapping("/byType")
    public ResponseEntity<List<PropertyDTO>> getByType(@RequestParam String type) {
        logger.info("Fetching properties of type {}", type);
        return ResponseEntity.ok(service.getPropertiesByTypeAsDTO(type));
    }

    // -------------------------------------------------------------
    // ⭐ USER PROPERTIES (DTO)
    // -------------------------------------------------------------
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PropertyDTO>> getByUser(@PathVariable Long userId) {
        logger.info("Fetching properties for user {}", userId);
        List<PropertyDTO> list = service.getPropertiesByUserWithAccurateFeaturedStatus(userId);
        return list.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(list);
    }

    // -------------------------------------------------------------
    // ⭐ GET ALL (ENTITY)
    // -------------------------------------------------------------
    @GetMapping
    public List<Property> getAll() {
        return service.findAll();
    }

    // -------------------------------------------------------------
    // ⭐ GET BY ID (ENTITY)
    // -------------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<Property> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // -------------------------------------------------------------
    // ⭐ ALL ACTIVE WITH CORRECT FEATURED STATUS (DTO)
    // -------------------------------------------------------------
    @GetMapping("/all")
    public ResponseEntity<List<PropertyDTO>> getAllActive() {
        return ResponseEntity.ok(service.getAllActivePropertiesWithAccurateFeaturedStatus());
    }

    // -------------------------------------------------------------
    // ⭐ CHECK FEATURED STATUS
    // -------------------------------------------------------------
    @GetMapping("/{id}/is-featured")
    public ResponseEntity<Map<String, Boolean>> checkFeatured(@PathVariable Long id) {
        boolean featured = service.isPropertyFeatured(id);
        return ResponseEntity.ok(Map.of("isFeatured", featured));
    }

    // -------------------------------------------------------------
    // ⭐ GET BY CITY (ENTITY)
    // -------------------------------------------------------------
    @GetMapping("/byCity/{city}")
    public List<Property> getByCity(@PathVariable String city) {
        logger.info("Fetching by city {}", city);
        return service.findByCity(city);
    }

    // -------------------------------------------------------------
    // ⭐ GET BY AREA (DTO)
    // -------------------------------------------------------------
    @GetMapping("/byArea/{areaName}")
    public ResponseEntity<List<PropertyDTO>> getByArea(@PathVariable String areaName) {
        return ResponseEntity.ok(service.findByAreaNameAsDTO(areaName));
    }

    // -------------------------------------------------------------
    // ⭐ UPDATE
    // -------------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestBody Property propertyDetails
    ) {
        try {
            Property updated = service.updateProperty(id, propertyDetails);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    // -------------------------------------------------------------
    // ⭐ DELETE
    // -------------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.deleteProperty(id);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search/quick")
    public ResponseEntity<?> smartQuickSearch(@RequestParam(required = false) String q,
                                              @RequestParam(required = false) Long propertyId,
                                              @RequestParam(required = false) String name) {
        try {
            String input = q != null ? q : propertyId != null ? String.valueOf(propertyId) : name;
            if (input == null || input.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Query is required: q OR propertyId OR name");
            }
            // Use the advanced service search
            List<PropertyDTO> results = service.quickSearchAsDTO(input.trim());
            return ResponseEntity.ok(results); // Always return 200 OK with possible empty list
        } catch (Exception e) {
            logger.error("Smart quick search error", e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

}
