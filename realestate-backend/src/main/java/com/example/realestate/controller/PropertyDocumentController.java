package com.example.realestate.controller;

import com.example.realestate.model.PropertyDocument;
import com.example.realestate.service.PropertyDocumentService;
import com.example.realestate.service.PropertyDocumentService.PropertyDocumentRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/property-documents")
public class PropertyDocumentController {

    private static final Logger logger = LoggerFactory.getLogger(PropertyDocumentController.class);
    private final PropertyDocumentService propertyDocumentService;

    public PropertyDocumentController(PropertyDocumentService propertyDocumentService) {
        this.propertyDocumentService = propertyDocumentService;
    }

    /**
     * Get all documents for a property
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<List<PropertyDocument>> getPropertyDocuments(@PathVariable Long propertyId) {
        logger.info("Fetching documents for property ID: {}", propertyId);
        List<PropertyDocument> documents = propertyDocumentService.getDocumentsByPropertyId(propertyId);
        return ResponseEntity.ok(documents);
    }

    /**
     * Get documents by type
     */
    @GetMapping("/property/{propertyId}/type/{documentType}")
    public ResponseEntity<List<PropertyDocument>> getDocumentsByType(
            @PathVariable Long propertyId,
            @PathVariable String documentType) {
        logger.info("Fetching {} documents for property ID: {}", documentType, propertyId);
        List<PropertyDocument> documents = propertyDocumentService.getDocumentsByType(propertyId, documentType);
        return ResponseEntity.ok(documents);
    }

    /**
     * Add multiple documents to a property
     */
    @PostMapping("/property/{propertyId}")
    public ResponseEntity<List<PropertyDocument>> addDocuments(
            @PathVariable Long propertyId,
            @RequestBody List<PropertyDocumentRequest> documentRequests) {
        logger.info("Adding {} documents to property ID: {}", documentRequests.size(), propertyId);

        try {
            List<PropertyDocument> savedDocuments = propertyDocumentService.saveDocuments(propertyId, documentRequests);
            return ResponseEntity.ok(savedDocuments);
        } catch (RuntimeException e) {
            logger.error("Error adding documents: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a document
     */
    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Integer documentId) {
        logger.info("Deleting document with ID: {}", documentId);
        try {
            propertyDocumentService.deleteDocument(documentId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            logger.error("Error deleting document: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}