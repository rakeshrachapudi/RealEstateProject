package com.example.realestate.repository;

import com.example.realestate.model.PropertyImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyImageRepository extends JpaRepository<PropertyImage, Integer> {

    // Find all images for a property
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.property.id = :propertyId ORDER BY pi.displayOrder")
    List<PropertyImage> findByPropertyId(@Param("propertyId") Long propertyId);

    // Find primary image for a property
    @Query("SELECT pi FROM PropertyImage pi WHERE pi.property.id = :propertyId AND pi.isPrimary = true")
    Optional<PropertyImage> findPrimaryImageByPropertyId(@Param("propertyId") Long propertyId);

    @Modifying
    @Transactional
    @Query("DELETE FROM PropertyImage pi WHERE pi.property.id = :propertyId")
    void deleteByPropertyId(@Param("propertyId") Long propertyId);
}