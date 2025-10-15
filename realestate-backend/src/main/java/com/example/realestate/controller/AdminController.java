package com.example.realestate.controller;

import com.example.realestate.dto.PropertyDTO;
import com.example.realestate.service.PropertyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final PropertyService propertyService;

    public AdminController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping("/properties")
    public List<PropertyDTO> getAllProperties() {
        return propertyService.findAll();
    }

    @PostMapping("/properties/{id}/approve-registration")
    public ResponseEntity<?> approveRegistration(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("message", "Registration approved for property " + id));
    }

    @PostMapping("/properties/{id}/trigger-payment")
    public ResponseEntity<?> triggerPayment(@PathVariable Long id) {
        return ResponseEntity.ok(Map.of("message", "Payment triggered for property " + id));
    }
}