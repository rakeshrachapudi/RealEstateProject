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
    // -------------------------------------------------------------
    @ExceptionHandler({RuntimeException.class})
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<Map<String, Object>> handleBusinessException(RuntimeException ex) {
        logger.error("Business Exception: {}", ex.getMessage());

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("message", ex.getMessage());

        // Check for specific error types
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("no active subscription") ||
                    ex.getMessage().contains("BROKER_NO_ACTIVE_SUBSCRIPTION")) {
                errorResponse.put("error", "BROKER_NO_ACTIVE_SUBSCRIPTION");
            } else if (ex.getMessage().contains("property limit reached") ||
                    ex.getMessage().contains("BROKER_PROPERTY_LIMIT_REACHED")) {
                errorResponse.put("error", "BROKER_PROPERTY_LIMIT_REACHED");
            } else {
                errorResponse.put("error", "BUSINESS_RULE_VIOLATION");
            }
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
    }

    // -------------------------------------------------------------
    // ⭐ GENERAL EXCEPTION HANDLER
    // -------------------------------------------------------------
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
    // ⭐ CREATE PROPERTY
    // -------------------------------------------------------------
    @PostMapping
    public ResponseEntity<?> create(@RequestBody PropertyPostRequestDto dto) {
        try {
            logger.info("📝 Creating property: type={}, listingType={}, userId={}",
                    dto.getType(), dto.getListingType(), dto.getUserId());

            Property created = service.postProperty(dto);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Property created successfully");
            response.put("data", created);

            logger.info("✅ Property created successfully: id={}", created.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (EntityNotFoundException ex) {
            logger.error("❌ Entity not found: {}", ex.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", ex.getMessage());
            errorResponse.put("error", "ENTITY_NOT_FOUND");

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (RuntimeException ex) {
            // This will be caught by the @ExceptionHandler above
            throw ex;
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

    // -------------------------------------------------------------
    // ⭐ SMART QUICK SEARCH
    // -------------------------------------------------------------
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
    // ⭐ UPLOAD PROPERTY DOCUMENT (FIXED)
    // -------------------------------------------------------------
    /**
     * Upload property document (brochures, PDFs, etc.) to S3
     * Endpoint: POST /api/properties/upload-document
     */
    @PostMapping("/upload-document")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        logger.info("📄 Document upload request received - File: {}, Size: {} bytes",
                file.getOriginalFilename(), file.getSize());

        Path tempFile = null;

        try {
            // Authentication check (uncomment if needed)
            /*
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.warn("❌ Unauthorized document upload attempt");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("Authentication required"));
            }
            */

            // File validation
            if (file.isEmpty()) {
                logger.warn("❌ Empty document file received");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Document file is required"));
            }

            // Validate file size (10MB max)
            long maxSize = 10 * 1024 * 1024; // 10MB
            if (file.getSize() > maxSize) {
                logger.warn("❌ Document file too large: {} bytes", file.getSize());
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Document file size must not exceed 10MB"));
            }

            // Validate file type
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
                logger.warn("❌ Invalid document type: {}", contentType);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid file type. Allowed: PDF, Word, Excel, Text, Images"));
            }

            // Get file extension
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Generate unique filename with timestamp
            String timestamp = String.valueOf(System.currentTimeMillis());
            String s3Key = "documents/" + timestamp + "_" +
                    UUID.randomUUID().toString().substring(0, 8) + fileExtension;

            logger.info("📤 Preparing to upload document to S3: {}", s3Key);

            // Create temporary file from MultipartFile
            tempFile = Files.createTempFile("upload-", fileExtension);
            file.transferTo(tempFile.toFile());

            logger.info("✅ Temporary file created: {}", tempFile);

            // Upload to S3 using S3Service
            String documentUrl = s3Service.uploadFile(s3Key, tempFile, contentType);

            logger.info("✅ Document uploaded successfully: {}", documentUrl);

            return ResponseEntity.ok(ApiResponse.success(documentUrl));

        } catch (IOException e) {
            logger.error("❌ IO Error during document upload: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to process document: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Error uploading document: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to upload document: " + e.getMessage()));
        } finally {
            // Clean up temporary file
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                    logger.debug("🗑️ Temporary file deleted: {}", tempFile);
                } catch (IOException e) {
                    logger.warn("⚠️ Failed to delete temporary file: {}", tempFile, e);
                }
            }
        }
    }
}