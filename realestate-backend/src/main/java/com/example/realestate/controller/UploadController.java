package com.example.realestate.controller;

import com.example.realestate.service.S3Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    private static final Logger logger = LoggerFactory.getLogger(UploadController.class);

    @Autowired
    private S3Service s3Service;

    /**
     * ⭐ LEGACY ENDPOINT - Upload image without propertyId (for new properties)
     * Used during property creation when propertyId doesn't exist yet
     * Images go to: temp/images/{filename}
     */
    @PostMapping("/image")
    public ResponseEntity<Map<String, Object>> uploadImage(@RequestParam("file") MultipartFile file) {
        logger.info("📸 Legacy image upload endpoint called - File: {}", file.getOriginalFilename());

        Map<String, Object> response = new HashMap<>();

        try {
            // Validate file
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("message", "Only image files are allowed");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file size (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "File size must be less than 10MB");
                return ResponseEntity.badRequest().body(response);
            }

            // Save to temp file
            Path tempFile = Files.createTempFile("upload-", "-" + file.getOriginalFilename());
            Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);

            // Upload to S3 in temp folder (will be moved later when property is created)
            String key = "temp/images/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String fileUrl = s3Service.uploadFile(key, tempFile, contentType);

            // Clean up temp file
            Files.deleteIfExists(tempFile);

            logger.info("✅ Image uploaded to temp location: {}", fileUrl);

            response.put("success", true);
            response.put("url", fileUrl);
            response.put("message", "Image uploaded successfully");
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("❌ Error uploading image: ", e);
            response.put("success", false);
            response.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * ⭐ NEW ENDPOINT - Upload image with propertyId (for editing existing properties)
     * Images go to: properties/{propertyId}/images/{filename}
     * This is the RECOMMENDED endpoint to use
     */
    @PostMapping("/property-image")
    public ResponseEntity<Map<String, Object>> uploadPropertyImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("propertyId") Long propertyId) {

        logger.info("📸 Property image upload - Property ID: {}, File: {}", propertyId, file.getOriginalFilename());

        Map<String, Object> response = new HashMap<>();

        try {
            // Validate propertyId
            if (propertyId == null || propertyId <= 0) {
                response.put("success", false);
                response.put("message", "Valid property ID is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("message", "Only image files are allowed");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file size (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "File size must be less than 10MB");
                return ResponseEntity.badRequest().body(response);
            }

            // Save to temp file
            Path tempFile = Files.createTempFile("upload-", "-" + file.getOriginalFilename());
            Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);

            // Upload to S3 in property folder structure
            String fileUrl = s3Service.uploadPropertyImage(propertyId, tempFile,
                    file.getOriginalFilename(), contentType);

            // Clean up temp file
            Files.deleteIfExists(tempFile);

            logger.info("✅ Property image uploaded: {}", fileUrl);

            response.put("success", true);
            response.put("url", fileUrl);
            response.put("message", "Property image uploaded successfully");
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("❌ Error uploading property image: ", e);
            response.put("success", false);
            response.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * ⭐ Upload property document (non-deal related documents)
     * Documents go to: properties/{propertyId}/documents/{filename}
     */
    @PostMapping("/document")
    public ResponseEntity<Map<String, Object>> uploadPropertyDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("propertyId") Long propertyId) {

        logger.info("📄 Property document upload - Property ID: {}, File: {}",
                propertyId, file.getOriginalFilename());

        Map<String, Object> response = new HashMap<>();

        try {
            // Validate propertyId
            if (propertyId == null || propertyId <= 0) {
                response.put("success", false);
                response.put("message", "Valid property ID is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type (documents only)
            String contentType = file.getContentType();
            if (contentType == null ||
                    (!contentType.equals("application/pdf") &&
                            !contentType.equals("application/msword") &&
                            !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
                response.put("success", false);
                response.put("message", "Only PDF, DOC, and DOCX files are allowed");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file size (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "File size must be less than 10MB");
                return ResponseEntity.badRequest().body(response);
            }

            // Save to temp file
            Path tempFile = Files.createTempFile("upload-", "-" + file.getOriginalFilename());
            Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);

            // Upload to S3 in property documents folder
            String fileUrl = s3Service.uploadPropertyDocument(propertyId, tempFile,
                    file.getOriginalFilename(), contentType);

            // Clean up temp file
            Files.deleteIfExists(tempFile);

            logger.info("✅ Property document uploaded: {}", fileUrl);

            response.put("success", true);
            response.put("url", fileUrl);
            response.put("message", "Document uploaded successfully");
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("❌ Error uploading property document: ", e);
            response.put("success", false);
            response.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * ⭐ Upload deal document (deal-specific documents)
     * Documents go to: properties/{propertyId}/deals/{dealId}/documents/{filename}
     */
    @PostMapping("/deal-document")
    public ResponseEntity<Map<String, Object>> uploadDealDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("dealId") Long dealId,
            @RequestParam("propertyId") Long propertyId) {

        logger.info("📑 Deal document upload - Deal ID: {}, Property ID: {}, File: {}",
                dealId, propertyId, file.getOriginalFilename());

        Map<String, Object> response = new HashMap<>();

        try {
            // Validate IDs
            if (dealId == null || dealId <= 0) {
                response.put("success", false);
                response.put("message", "Valid deal ID is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (propertyId == null || propertyId <= 0) {
                response.put("success", false);
                response.put("message", "Valid property ID is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "File is empty");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type (documents only)
            String contentType = file.getContentType();
            if (contentType == null ||
                    (!contentType.equals("application/pdf") &&
                            !contentType.equals("application/msword") &&
                            !contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
                response.put("success", false);
                response.put("message", "Only PDF, DOC, and DOCX files are allowed");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file size (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "File size must be less than 10MB");
                return ResponseEntity.badRequest().body(response);
            }

            // Save to temp file
            Path tempFile = Files.createTempFile("upload-", "-" + file.getOriginalFilename());
            Files.copy(file.getInputStream(), tempFile, StandardCopyOption.REPLACE_EXISTING);

            // Upload to S3 in deal documents folder
            String fileUrl = s3Service.uploadDealDocument(dealId, propertyId, tempFile,
                    file.getOriginalFilename(), contentType);

            // Clean up temp file
            Files.deleteIfExists(tempFile);

            logger.info("✅ Deal document uploaded: {}", fileUrl);

            response.put("success", true);
            response.put("url", fileUrl);
            response.put("message", "Deal document uploaded successfully");
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("❌ Error uploading deal document: ", e);
            response.put("success", false);
            response.put("message", "Upload failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}