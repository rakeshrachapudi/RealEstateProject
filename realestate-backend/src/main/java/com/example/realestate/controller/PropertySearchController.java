package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.dto.PropertyDTO;
import com.example.realestate.dto.PropertySearchRequest;
import com.example.realestate.service.PropertySearchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
public class PropertySearchController {

    private static final Logger logger = LoggerFactory.getLogger(PropertySearchController.class);
    private final PropertySearchService propertySearchService;

    public PropertySearchController(PropertySearchService propertySearchService) {
        this.propertySearchService = propertySearchService;
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<PropertyDTO>>> searchProperties(
            @RequestBody PropertySearchRequest request) {
        logger.info("Search request received: {}", request);
        try {
            List<PropertyDTO> result = propertySearchService.searchProperties(request);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            logger.error("Error searching properties", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error searching properties: " + e.getMessage()));
        }
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<PropertyDTO>>> getFeaturedProperties() {
        logger.info("Fetching featured properties");
        try {
            List<PropertyDTO> properties = propertySearchService.getFeaturedProperties();
            return ResponseEntity.ok(ApiResponse.success(properties));
        } catch (Exception e) {
            logger.error("Error fetching featured properties", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching featured properties"));
        }
    }
}