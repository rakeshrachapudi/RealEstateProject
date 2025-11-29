package com.example.realestate.service;

import com.example.realestate.model.Property;
import com.example.realestate.model.PropertyDocument;
import com.example.realestate.repository.PropertyDocumentRepository;
import com.example.realestate.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class PropertyDocumentService {

    private static final Logger logger = LoggerFactory.getLogger(PropertyDocumentService.class);
    private final PropertyDocumentRepository propertyDocumentRepository;
    private final PropertyRepository propertyRepository;

    public PropertyDocumentService(PropertyDocumentRepository propertyDocumentRepository,
                                   PropertyRepository propertyRepository) {
        this.propertyDocumentRepository = propertyDocumentRepository;
        this.propertyRepository = propertyRepository;
    }

    /**
     * Get all documents for a property
     */
    public List<PropertyDocument> getDocumentsByPropertyId(Long propertyId) {
        logger.info("Fetching documents for property ID: {}", propertyId);
        return propertyDocumentRepository.findByPropertyId(propertyId);
    }

    /**
     * Get documents by type
     */
    public List<PropertyDocument> getDocumentsByType(Long propertyId, String documentType) {
        logger.info("Fetching {} documents for property ID: {}", documentType, propertyId);
        return propertyDocumentRepository.findByPropertyIdAndDocumentType(propertyId, documentType);
    }

    /**
     * Add document to property
     */
    public PropertyDocument addDocumentToProperty(Long propertyId, PropertyDocument document) {
        logger.info("Adding document to property ID: {}", propertyId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        document.setProperty(property);
        document.setCreatedAt(LocalDateTime.now());

        return propertyDocumentRepository.save(document);
    }

    /**
     * Save multiple documents for a property
     */
    public List<PropertyDocument> saveDocuments(Long propertyId, List<PropertyDocumentRequest> documentRequests) {
        logger.info("Saving {} documents for property ID: {}", documentRequests.size(), propertyId);

        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found with id: " + propertyId));

        List<PropertyDocument> savedDocuments = new ArrayList<>();

        for (PropertyDocumentRequest request : documentRequests) {
            PropertyDocument document = new PropertyDocument();
            document.setProperty(property);
            document.setDocumentUrl(request.getDocumentUrl());
            document.setFileName(request.getFileName());
            document.setFileType(request.getFileType());
            document.setFileSize(request.getFileSize());
            document.setDocumentType(request.getDocumentType() != null ? request.getDocumentType() : "other");
            document.setCreatedAt(LocalDateTime.now());

            savedDocuments.add(propertyDocumentRepository.save(document));
        }

        logger.info("Successfully saved {} documents", savedDocuments.size());
        return savedDocuments;
    }

    /**
     * Delete document
     */
    public void deleteDocument(Integer documentId) {
        logger.info("Deleting document with ID: {}", documentId);
        PropertyDocument document = propertyDocumentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found with id: " + documentId));

        propertyDocumentRepository.deleteById(documentId);
    }

    /**
     * Delete all documents for a property
     */
    public void deleteAllDocumentsByPropertyId(Long propertyId) {
        logger.info("Deleting all documents for property ID: {}", propertyId);
        propertyDocumentRepository.deleteByPropertyId(propertyId);
    }

    /**
     * DTO class for document requests
     */
    public static class PropertyDocumentRequest {
        private String documentUrl;
        private String fileName;
        private String fileType;
        private Long fileSize;
        private String documentType;

        public PropertyDocumentRequest() {}

        public PropertyDocumentRequest(String documentUrl, String fileName, String fileType,
                                       Long fileSize, String documentType) {
            this.documentUrl = documentUrl;
            this.fileName = fileName;
            this.fileType = fileType;
            this.fileSize = fileSize;
            this.documentType = documentType;
        }

        // Getters and Setters
        public String getDocumentUrl() { return documentUrl; }
        public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }

        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }

        public String getFileType() { return fileType; }
        public void setFileType(String fileType) { this.fileType = fileType; }

        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

        public String getDocumentType() { return documentType; }
        public void setDocumentType(String documentType) { this.documentType = documentType; }
    }
}