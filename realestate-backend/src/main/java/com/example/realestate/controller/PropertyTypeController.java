package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.model.PropertyType;
import com.example.realestate.service.PropertyTypeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/property-types")
public class PropertyTypeController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyTypeController.class);
    private final PropertyTypeService propertyTypeService;

    public PropertyTypeController(PropertyTypeService propertyTypeService) {
        this.propertyTypeService = propertyTypeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PropertyType>>> getAllPropertyTypes() {
        logger.info("Fetching all property types");
        try {
            List<PropertyType> propertyTypes = propertyTypeService.getAllPropertyTypes();
            return ResponseEntity.ok(ApiResponse.success(propertyTypes));
        } catch (Exception e) {
            logger.error("Error fetching property types", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching property types"));
        }
    }
}