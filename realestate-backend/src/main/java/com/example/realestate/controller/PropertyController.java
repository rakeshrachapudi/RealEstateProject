package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.model.Property;
import com.example.realestate.dto.PropertyDTO;
import com.example.realestate.dto.PropertyPostRequestDto;
import com.example.realestate.repository.PropertyRepository;
import com.example.realestate.service.PropertyService;
import com.example.realestate.service.S3Service;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

@RestController
@RequestMapping("/api/properties")
public class PropertyController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyController.class);

    @Autowired
    private PropertyService service;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private PropertyRepository propertyRepository;

    // -------------------------------------------------------------
    // ⭐ GLOBAL HANDLER FOR SUBSCRIPTION / BROKER LIMIT ERRORS
    // ✅ FIXED: Added "Subscription required" and "Property limit reached" checks
    // -------------------------------------------------------------
    @ExceptionHandler({RuntimeException.class})
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<Map<String, Object>> handleBusinessException(RuntimeException ex) {
        logger.error("Business Exception: {}", ex.getMessage());

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", ex.getMessage());

        if (ex.getMessage() != null) {
            String message = ex.getMessage().toLowerCase();

            // ✅ FIXED: Check for subscription-related errors
            if (message.contains("no active subscription") ||
                    message.contains("subscription required") ||
                    message.contains("broker_no_active_subscription")) {
                errorResponse.put("error", "BROKER_NO_ACTIVE_SUBSCRIPTION");
                logger.info("🔒 Broker subscription error detected - returning BROKER_NO_ACTIVE_SUBSCRIPTION");
            }
            // ✅ FIXED: Check for property limit errors
            else if (message.contains("property limit reached") ||
                    message.contains("property limit") ||
                    message.contains("broker_property_limit_reached")) {
                errorResponse.put("error", "BROKER_PROPERTY_LIMIT_REACHED");
                logger.info("🔒 Broker limit error detected - returning BROKER_PROPERTY_LIMIT_REACHED");
            }
            else {
                errorResponse.put("error", "BUSINESS_RULE_VIOLATION");
            }
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    @ExceptionHandler({Exception.class})
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
        logger.error("Unexpected error: {}", ex.getMessage(), ex);

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", "An unexpected error occurred: " + ex.getMessage());
        errorResponse.put("error", "INTERNAL_SERVER_ERROR");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }



    // -------------------------------------------------------------
    // ⭐ PROPERTY TYPES
    // -------------------------------------------------------------
    @GetMapping("/types")
    public ResponseEntity<List<String>> getPropertyTypes() {
        return ResponseEntity.ok(service.getPropertyTypes());
    }

    @GetMapping("/byType")
    public ResponseEntity<List<PropertyDTO>> getByType(@RequestParam String type) {
        logger.info("Fetching properties of type {}", type);
        return ResponseEntity.ok(service.getPropertiesByTypeAsDTO(type));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PropertyDTO>> getByUser(@PathVariable Long userId) {
        logger.info("Fetching properties for user {}", userId);
        List<PropertyDTO> list = service.getPropertiesByUserWithAccurateFeaturedStatus(userId);
        return list.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(list);
    }

    @GetMapping
    public List<Property> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Property> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/all")
    public ResponseEntity<List<PropertyDTO>> getAllActive() {
        return ResponseEntity.ok(service.getAllActivePropertiesWithAccurateFeaturedStatus());
    }

    @GetMapping("/{id}/is-featured")
    public ResponseEntity<Map<String, Boolean>> checkFeatured(@PathVariable Long id) {
        boolean featured = service.isPropertyFeatured(id);
        return ResponseEntity.ok(Map.of("isFeatured", featured));
    }

    @GetMapping("/byCity/{city}")
    public List<Property> getByCity(@PathVariable String city) {
        logger.info("Fetching by city {}", city);
        return service.findByCity(city);
    }

    @GetMapping("/byArea/{areaName}")
    public ResponseEntity<List<PropertyDTO>> getByArea(@PathVariable String areaName) {
        return ResponseEntity.ok(service.findByAreaNameAsDTO(areaName));
    }

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
            List<PropertyDTO> results = service.quickSearchAsDTO(input.trim());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            logger.error("Smart quick search error", e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // -------------------------------------------------------------
    // ⭐ CREATE NEW PROPERTY
    // -------------------------------------------------------------
    @PostMapping
    public ResponseEntity<?> createProperty(
            @RequestBody PropertyPostRequestDto propertyDto,
            Authentication authentication) {

        logger.info("📝 Creating new property - Type: {}, City: {}, User: {}",
                propertyDto.getType(),
                propertyDto.getCity(),
                authentication != null ? authentication.getName() : "anonymous");

        try {
            // Create property using service
            Property createdProperty = service.createProperty(propertyDto, authentication);

            logger.info("✅ Property created successfully - ID: {}", createdProperty.getId());

            // Return the created property with DTOs for consistency
            PropertyDTO responseDto = service.convertToDTO(createdProperty);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(responseDto));

        } catch (RuntimeException ex) {
            // This will be caught by the @ExceptionHandler methods above
            logger.error("❌ Error creating property: {}", ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            logger.error("❌ Unexpected error creating property", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create property: " + ex.getMessage()));
        }
    }

    // -------------------------------------------------------------
    // ⭐ UPLOAD DOCUMENT TO TEMP (will be moved after property creation)
    // -------------------------------------------------------------
    @PostMapping("/upload-document")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        logger.info("📄 Document upload request - File: {}, Size: {} bytes",
                file.getOriginalFilename(), file.getSize());

        Path tempFile = null;

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Document file is required"));
            }

            long maxSize = 10 * 1024 * 1024; // 10MB
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Document file size must not exceed 10MB"));
            }

            String contentType = file.getContentType();
            List<String> allowedTypes = Arrays.asList(
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "text/plain",
                    "image/jpeg",
                    "image/png"
            );

            if (contentType == null || !allowedTypes.contains(contentType)) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid file type"));
            }

            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String timestamp = String.valueOf(System.currentTimeMillis());
            String uniqueId = UUID.randomUUID().toString().substring(0, 8);
            String s3Key = "temp/documents/" + timestamp + "_" + uniqueId + fileExtension;

            tempFile = Files.createTempFile("upload-", fileExtension);
            file.transferTo(tempFile.toFile());

            String documentUrl = s3Service.uploadFile(s3Key, tempFile, contentType);

            logger.info("✅ Document uploaded to TEMP: {}", s3Key);

            return ResponseEntity.ok(ApiResponse.success(documentUrl));

        } catch (Exception e) {
            logger.error("❌ Error uploading document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload document: " + e.getMessage()));
        } finally {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException e) {
                    logger.warn("Failed to delete temp file", e);
                }
            }
        }
    }
}