package com.example.realestate.repository;

import com.example.realestate.model.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    // Find by city (backward compatibility)
    List<Property> findByCityIgnoreCase(String city);

    // Find featured properties
    List<Property> findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc();

    // Find properties by area
    @Query("SELECT p FROM Property p WHERE p.area.areaId = :areaId AND p.isActive = true")
    List<Property> findByAreaId(@Param("areaId") Integer areaId);

    // Find properties by property type
    @Query("SELECT p FROM Property p WHERE p.propertyType.propertyTypeId = :typeId AND p.isActive = true")
    List<Property> findByPropertyTypeId(@Param("typeId") Integer typeId);

    // Find properties by listing type
    List<Property> findByListingTypeAndIsActiveTrue(String listingType);

    // Complex search query with multiple filters
    @Query("SELECT p FROM Property p " +
            "LEFT JOIN p.propertyType pt " +
            "LEFT JOIN p.area a " +
            "LEFT JOIN a.city c " +
            "WHERE p.isActive = true " +
            "AND (:propertyType IS NULL OR pt.typeName = :propertyType) " +
            "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
            "AND (:city IS NULL OR c.cityName = :city) " +
            "AND (:area IS NULL OR a.areaName = :area) " +
            "AND (:listingType IS NULL OR p.listingType = :listingType) " +
            "AND (:minBedrooms IS NULL OR p.bedrooms >= :minBedrooms) " +
            "AND (:maxBedrooms IS NULL OR p.bedrooms <= :maxBedrooms)")
    Page<Property> searchProperties(
            @Param("propertyType") String propertyType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("city") String city,
            @Param("area") String area,
            @Param("listingType") String listingType,
            @Param("minBedrooms") Integer minBedrooms,
            @Param("maxBedrooms") Integer maxBedrooms,
            Pageable pageable
    );

    // Find properties by user
    @Query("SELECT p FROM Property p WHERE p.user.id = :userId AND p.isActive = true")
    List<Property> findByUserId(@Param("userId") Long userId);

    // Find properties by status
    List<Property> findByStatusAndIsActiveTrue(String status);

    // Count properties by city
    @Query("SELECT COUNT(p) FROM Property p LEFT JOIN p.area a LEFT JOIN a.city c WHERE c.cityName = :city AND p.isActive = true")
    Long countByCity(@Param("city") String city);
}