package com.example.realestate.controller;

import com.example.realestate.model.DealStatusAudit;
import com.example.realestate.service.PropertyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuditController {

    private final PropertyService propertyService;

    public AuditController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GetMapping("/property/{propertyId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<List<DealStatusAudit>> getAuditTrail(@PathVariable Long propertyId) {
        List<DealStatusAudit> auditTrail = propertyService.getAuditTrail(propertyId);
        return ResponseEntity.ok(auditTrail);
    }
}