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

    // Find by property type (Apartment, Villa, etc.)
    List<Property> findByTypeIgnoreCaseAndIsActiveTrue(String type);

    // Find by area name
    @Query("SELECT p FROM Property p LEFT JOIN p.area a WHERE LOWER(a.areaName) = LOWER(:areaName) AND p.isActive = true")
    List<Property> findByAreaNameAndIsActiveTrue(@Param("areaName") String areaName);

    // Find featured properties
    List<Property> findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc();

    // Find properties by area ID
    @Query("SELECT p FROM Property p WHERE p.area.areaId = :areaId AND p.isActive = true")
    List<Property> findByAreaId(@Param("areaId") Integer areaId);

    // Find properties by property type ID
    @Query("SELECT p FROM Property p WHERE p.propertyType.propertyTypeId = :typeId AND p.isActive = true")
    List<Property> findByPropertyTypeId(@Param("typeId") Integer typeId);

    // Find properties by listing type (sale/rent)
    List<Property> findByListingTypeAndIsActiveTrue(String listingType);

    @Query("SELECT p FROM Property p " +
            "LEFT JOIN p.propertyType pt " +
            "LEFT JOIN p.area a " +
            "LEFT JOIN a.city c " +
            "WHERE p.isActive = true " +
            "AND (:propertyType IS NULL OR pt.typeName = :propertyType OR p.type = :propertyType) " +
            "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice) " +
            "AND (:city IS NULL OR c.cityName = :city OR p.city = :city) " +
            "AND (:area IS NULL OR a.areaName = :area) " +
            "AND (:listingType IS NULL OR p.listingType = :listingType) " +
            "AND (:minBedrooms IS NULL OR p.bedrooms >= :minBedrooms) " +
            "AND (:maxBedrooms IS NULL OR p.bedrooms <= :maxBedrooms) " +
            "AND (:isVerified IS NULL OR p.isVerified = :isVerified) " +
            "AND (:ownerType IS NULL OR p.ownerType = :ownerType) " +
            "AND (:isReadyToMove IS NULL OR p.isReadyToMove = :isReadyToMove)")
    Page<Property> searchProperties(
            @Param("propertyType") String propertyType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("city") String city,
            @Param("area") String area,
            @Param("listingType") String listingType,
            @Param("minBedrooms") Integer minBedrooms,
            @Param("maxBedrooms") Integer maxBedrooms,
            @Param("isVerified") Boolean isVerified,
            @Param("ownerType") String ownerType,
            @Param("isReadyToMove") Boolean isReadyToMove,  // NEW
            Pageable pageable
    );



    // Find properties by user
    @Query("SELECT p FROM Property p WHERE p.user.id = :userId AND p.isActive = true")
    List<Property> findByUserId(@Param("userId") Long userId);

    // Find properties by status
    List<Property> findByStatusAndIsActiveTrue(String status);

    // Count properties by city
    @Query("SELECT COUNT(p) FROM Property p LEFT JOIN p.area a LEFT JOIN a.city c WHERE (c.cityName = :city OR p.city = :city) AND p.isActive = true")
    Long countByCity(@Param("city") String city);

    // Find properties by type and listing type
    @Query("SELECT p FROM Property p WHERE LOWER(p.type) = LOWER(:type) AND LOWER(p.listingType) = LOWER(:listingType) AND p.isActive = true")
    List<Property> findByTypeAndListingType(@Param("type") String type, @Param("listingType") String listingType);

    // Find all active properties
    List<Property> findByIsActiveTrueOrderByCreatedAtDesc();
}