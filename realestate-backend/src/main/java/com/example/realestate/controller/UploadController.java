package com.example.realestate.controller;

import com.example.realestate.service.S3Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private static final Logger logger = LoggerFactory.getLogger(UploadController.class);

    @Autowired
    private S3Service s3Service;

    // Allowed image types
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    // Allowed document types
    private static final List<String> ALLOWED_DOCUMENT_TYPES = Arrays.asList(
            "application/pdf",
            "application/msword", // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
    );

    // Maximum file sizes
    private static final long MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * Upload property image
     * Endpoint: POST /api/upload/image?propertyId={propertyId}
     */
    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "propertyId", required = false) Long propertyId) {

        logger.info("📸 Image upload request - File: {}, Size: {} bytes, PropertyId: {}",
                file.getOriginalFilename(), file.getSize(), propertyId);

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No file uploaded"));
            }

            if (file.getSize() > MAX_IMAGE_SIZE) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("File size exceeds 10MB limit"));
            }

            if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Invalid file type. Only JPG, PNG, GIF, WebP allowed"));
            }

            // Create temp file
            Path tempFile = Files.createTempFile("upload-", file.getOriginalFilename());
            file.transferTo(tempFile.toFile());

            String fileUrl;

            if (propertyId != null && propertyId > 0) {
                // Upload to property-specific folder
                fileUrl = s3Service.uploadPropertyImage(
                        propertyId,
                        tempFile,
                        file.getOriginalFilename(),
                        file.getContentType()
                );
            } else {
                // Upload to general properties folder
                String s3Key = "properties/" + file.getOriginalFilename();
                fileUrl = s3Service.uploadFile(s3Key, tempFile, file.getContentType());
            }

            // Delete temp file
            Files.deleteIfExists(tempFile);

            logger.info("✅ Image uploaded successfully: {}", fileUrl);
            return ResponseEntity.ok(createSuccessResponse(fileUrl, "Image uploaded successfully"));

        } catch (Exception e) {
            logger.error("❌ Image upload error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to upload image: " + e.getMessage()));
        }
    }

    /**
     * Upload property document (PDF, DOC, DOCX)
     * Endpoint: POST /api/upload/document?propertyId={propertyId}
     */
    @PostMapping("/document")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("propertyId") Long propertyId) {

        logger.info("📄 Document upload request - File: {}, Size: {} bytes, PropertyId: {}",
                file.getOriginalFilename(), file.getSize(), propertyId);

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No file uploaded"));
            }

            if (propertyId == null || propertyId <= 0) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Property ID is required"));
            }

            if (file.getSize() > MAX_DOCUMENT_SIZE) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("File size exceeds 10MB limit"));
            }

            if (!ALLOWED_DOCUMENT_TYPES.contains(file.getContentType())) {
                logger.warn("Invalid document type attempted: {}", file.getContentType());
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Invalid file type. Only PDF, DOC, DOCX allowed"));
            }

            // Create temp file
            Path tempFile = Files.createTempFile("upload-doc-", file.getOriginalFilename());
            file.transferTo(tempFile.toFile());

            // Upload to S3 in property-specific folder
            String fileUrl = s3Service.uploadPropertyDocument(
                    propertyId,
                    tempFile,
                    file.getOriginalFilename(),
                    file.getContentType()
            );

            // Delete temp file
            Files.deleteIfExists(tempFile);

            logger.info("✅ Document uploaded successfully: {}", fileUrl);
            return ResponseEntity.ok(createSuccessResponse(fileUrl, "Document uploaded successfully"));

        } catch (Exception e) {
            logger.error("❌ Document upload error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to upload document: " + e.getMessage()));
        }
    }

    /**
     * Upload deal document (for registration documents, agreements, etc.)
     * Endpoint: POST /api/upload/deal-document?dealId={dealId}&propertyId={propertyId}
     */
    @PostMapping("/deal-document")
    public ResponseEntity<?> uploadDealDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("dealId") Long dealId,
            @RequestParam("propertyId") Long propertyId) {

        logger.info("📑 Deal document upload request - File: {}, DealId: {}, PropertyId: {}",
                file.getOriginalFilename(), dealId, propertyId);

        try {
            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("No file uploaded"));
            }

            if (dealId == null || dealId <= 0) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Deal ID is required"));
            }

            if (propertyId == null || propertyId <= 0) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Property ID is required"));
            }

            if (file.getSize() > MAX_DOCUMENT_SIZE) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("File size exceeds 10MB limit"));
            }

            if (!ALLOWED_DOCUMENT_TYPES.contains(file.getContentType())) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Invalid file type. Only PDF, DOC, DOCX allowed"));
            }

            // Create temp file
            Path tempFile = Files.createTempFile("upload-deal-", file.getOriginalFilename());
            file.transferTo(tempFile.toFile());

            // Upload to S3 in deal-specific folder
            String fileUrl = s3Service.uploadDealDocument(
                    dealId,
                    propertyId,
                    tempFile,
                    file.getOriginalFilename(),
                    file.getContentType()
            );

            // Delete temp file
            Files.deleteIfExists(tempFile);

            logger.info("✅ Deal document uploaded successfully: {}", fileUrl);
            return ResponseEntity.ok(createSuccessResponse(fileUrl, "Deal document uploaded successfully"));

        } catch (Exception e) {
            logger.error("❌ Deal document upload error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to upload deal document: " + e.getMessage()));
        }
    }

    // ==================== HELPER METHODS ====================

    private Map<String, Object> createSuccessResponse(String url, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("url", url);
        return response;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("url", null);
        return response;
    }
}