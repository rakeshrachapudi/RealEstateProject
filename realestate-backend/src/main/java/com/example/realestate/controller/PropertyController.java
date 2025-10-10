package com.example.realestate.controller;

import com.example.realestate.model.Property;
import com.example.realestate.service.PropertyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PropertyController {
    private final PropertyService service;

    public PropertyController(PropertyService service) {
        this.service = service;
    }

    /**
     * Get all properties
     */
    @GetMapping
    public List<Property> all() {
        return service.findAll();
    }

    /**
     * Get property by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Property> getPropertyById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get properties by city
     */
    @GetMapping("/city/{city}")
    public List<Property> byCity(@PathVariable String city) {
        return service.findByCity(city);
    }

    /**
     * Get properties by type (Apartment, Villa, House, etc.)
     */
    @GetMapping("/type/{type}")
    public List<Property> byType(@PathVariable String type) {
        return service.findByType(type);
    }

    /**
     * Get properties by listing type (sale/rent)
     */
    @GetMapping("/listing/{listingType}")
    public List<Property> byListingType(@PathVariable String listingType) {
        return service.findByListingType(listingType);
    }

    /**
     * Get properties by area name
     */
    @GetMapping("/area/{areaName}")
    public List<Property> byArea(@PathVariable String areaName) {
        return service.findByAreaName(areaName);
    }

    /**
     * Get properties by user
     */
    @GetMapping("/user/{userId}")
    public List<Property> byUser(@PathVariable Long userId) {
        return service.getPropertiesByUser(userId);
    }

    /**
     * Create new property
     */
    @PostMapping
    public Property create(@RequestBody Property property) {
        return service.save(property);
    }

    /**
     * Update property
     */
    @PutMapping("/{id}")
    public ResponseEntity<Property> update(@PathVariable Long id, @RequestBody Property propertyDetails) {
        try {
            Property updated = service.updateProperty(id, propertyDetails);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete property (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            service.deleteProperty(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}