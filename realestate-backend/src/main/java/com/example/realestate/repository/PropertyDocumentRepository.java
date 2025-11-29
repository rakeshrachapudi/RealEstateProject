package com.example.realestate.repository;

import com.example.realestate.model.PropertyDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface PropertyDocumentRepository extends JpaRepository<PropertyDocument, Integer> {

    // Find all documents for a property
    @Query("SELECT pd FROM PropertyDocument pd WHERE pd.property.id = :propertyId ORDER BY pd.createdAt DESC")
    List<PropertyDocument> findByPropertyId(@Param("propertyId") Long propertyId);

    // Find documents by type
    @Query("SELECT pd FROM PropertyDocument pd WHERE pd.property.id = :propertyId AND pd.documentType = :docType")
    List<PropertyDocument> findByPropertyIdAndDocumentType(
            @Param("propertyId") Long propertyId,
            @Param("docType") String docType
    );

    // Delete all documents for a property
    @Modifying
    @Transactional
    @Query("DELETE FROM PropertyDocument pd WHERE pd.property.id = :propertyId")
    void deleteByPropertyId(@Param("propertyId") Long propertyId);
}