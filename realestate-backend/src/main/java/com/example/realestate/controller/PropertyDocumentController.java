package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.model.PropertyDocument;
import com.example.realestate.service.PropertyDocumentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for Property Documents
 * Handles fetching documents for properties
 */
@RestController
@RequestMapping("/api/property-documents")
@CrossOrigin(origins = "*") // Allow all origins for document fetching
public class PropertyDocumentController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyDocumentController.class);

    @Autowired
    private PropertyDocumentService propertyDocumentService;

    /**
     * Get all documents for a specific property
     *
     * @param propertyId The property ID
     * @return List of documents
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> getDocumentsByProperty(@PathVariable Long propertyId) {
        logger.info("📄 Fetching documents for property: {}", propertyId);

        try {
            List<PropertyDocument> documents = propertyDocumentService.getDocumentsByPropertyId(propertyId);

            logger.info("✅ Found {} documents for property {}", documents.size(), propertyId);

            return ResponseEntity.ok(ApiResponse.success(documents));

        } catch (Exception e) {
            logger.error("❌ Error fetching documents for property {}: {}", propertyId, e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to fetch documents: " + e.getMessage()));
        }
    }

    /**
     * Get documents by type for a property
     *
     * @param propertyId The property ID
     * @param documentType The document type
     * @return List of documents
     */
    @GetMapping("/property/{propertyId}/type/{documentType}")
    public ResponseEntity<?> getDocumentsByType(
            @PathVariable Long propertyId,
            @PathVariable String documentType) {

        logger.info("📄 Fetching {} documents for property: {}", documentType, propertyId);

        try {
            List<PropertyDocument> documents = propertyDocumentService.getDocumentsByType(propertyId, documentType);

            logger.info("✅ Found {} {} documents for property {}",
                    documents.size(), documentType, propertyId);

            return ResponseEntity.ok(ApiResponse.success(documents));

        } catch (Exception e) {
            logger.error("❌ Error fetching {} documents for property {}: {}",
                    documentType, propertyId, e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to fetch documents: " + e.getMessage()));
        }
    }

    /**
     * Delete a document by ID
     *
     * @param documentId The document ID (as Integer to match service)
     * @return Success response
     */
    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable Integer documentId) {
        logger.info("🗑️ Deleting document: {}", documentId);

        try {
            propertyDocumentService.deleteDocument(documentId);

            logger.info("✅ Deleted document: {}", documentId);
            return ResponseEntity.ok(ApiResponse.success("Document deleted successfully"));

        } catch (RuntimeException e) {
            logger.error("❌ Error deleting document {}: {}", documentId, e.getMessage());
            return ResponseEntity.status(404)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            logger.error("❌ Unexpected error deleting document {}: {}", documentId, e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to delete document: " + e.getMessage()));
        }
    }

    /**
     * Delete all documents for a property
     *
     * @param propertyId The property ID
     * @return Success response
     */
    @DeleteMapping("/property/{propertyId}")
    public ResponseEntity<?> deleteAllDocumentsByProperty(@PathVariable Long propertyId) {
        logger.info("🗑️ Deleting all documents for property: {}", propertyId);

        try {
            propertyDocumentService.deleteAllDocumentsByPropertyId(propertyId);

            logger.info("✅ Deleted all documents for property: {}", propertyId);
            return ResponseEntity.ok(ApiResponse.success("All documents deleted successfully"));

        } catch (Exception e) {
            logger.error("❌ Error deleting documents for property {}: {}", propertyId, e.getMessage());
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to delete documents: " + e.getMessage()));
        }
    }
}