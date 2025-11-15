package com.example.realestate.repository;

import com.example.realestate.model.Property;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {

    List<Property> findByUserIdAndIsActiveTrue(Long userId);

    // Find by city
    List<Property> findByCityIgnoreCase(String city);

    // Find by property type (Apartment, Villa, etc.)
    List<Property> findByTypeIgnoreCaseAndIsActiveTrue(String type);

    // Get distinct property types
    @Query("SELECT DISTINCT p.type FROM Property p WHERE p.isActive = true AND p.type IS NOT NULL")
    List<String> findDistinctPropertyTypes();

    // Find by area name
    @Query("SELECT p FROM Property p LEFT JOIN p.area a WHERE LOWER(a.areaName) = LOWER(:areaName) AND p.isActive = true")
    List<Property> findByAreaNameAndIsActiveTrue(@Param("areaName") String areaName);

    // Featured properties
    List<Property> findByIsFeaturedTrueAndIsActiveTrueOrderByCreatedAtDesc();

    // Find by area ID
    @Query("SELECT p FROM Property p WHERE p.area.areaId = :areaId AND p.isActive = true")
    List<Property> findByAreaId(@Param("areaId") Integer areaId);

    // Find by property type ID
    @Query("SELECT p FROM Property p WHERE p.propertyType.propertyTypeId = :typeId AND p.isActive = true")
    List<Property> findByPropertyTypeId(@Param("typeId") Integer typeId);

    // Find by listing type
    List<Property> findByListingTypeAndIsActiveTrue(String listingType);

    // Main property search (filters)
    @Query("""
            SELECT p FROM Property p 
            LEFT JOIN p.propertyType pt 
            LEFT JOIN p.area a 
            LEFT JOIN a.city c 
            WHERE p.isActive = true 
            AND (:propertyType IS NULL OR pt.typeName = :propertyType OR p.type = :propertyType)
            AND (:minPrice IS NULL OR p.price >= :minPrice)
            AND (:maxPrice IS NULL OR p.price <= :maxPrice)
            AND (:city IS NULL OR c.cityName = :city OR p.city = :city)
            AND (:area IS NULL OR a.areaName = :area)
            AND (:listingType IS NULL OR p.listingType = :listingType)
            AND (:minBedrooms IS NULL OR p.bedrooms >= :minBedrooms)
            AND (:maxBedrooms IS NULL OR p.bedrooms <= :maxBedrooms)
            AND (:isVerified IS NULL OR p.isVerified = :isVerified)
            AND (:ownerType IS NULL OR p.ownerType = :ownerType)
            AND (:isReadyToMove IS NULL OR p.isReadyToMove = :isReadyToMove)
            """)
    Page<Property> searchProperties(
            @Param("propertyType") String propertyType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("city") String city,
            @Param("area") String area,
            @Param("listingType") String listingType,
            @Param("minBedrooms") Double minBedrooms,
            @Param("maxBedrooms") Double maxBedrooms,
            @Param("isVerified") Boolean isVerified,
            @Param("ownerType") String ownerType,
            @Param("isReadyToMove") Boolean isReadyToMove,
            Pageable pageable
    );

    // Check if property is featured — FIXED: ensure property is active
    @Query("""
            SELECT CASE WHEN COUNT(fp) > 0 THEN true ELSE false END
            FROM FeaturedProperty fp
            JOIN Property p ON p.id = fp.propertyId
            WHERE fp.propertyId = :propertyId
            AND fp.isActive = true
            AND p.isActive = true
            AND (fp.featuredFrom IS NULL OR fp.featuredFrom <= :now)
            AND (fp.featuredUntil IS NULL OR fp.featuredUntil > :now)
            AND (fp.paymentStatus = 'COMPLETED' OR fp.paymentStatus = 'FREE')
            """)
    boolean isPropertyActuallyFeatured(@Param("propertyId") Long propertyId,
                                       @Param("now") LocalDateTime now);

    // Batch featured — FIXED: do NOT include deleted properties
    @Query("""
            SELECT fp.propertyId
            FROM FeaturedProperty fp
            JOIN Property p ON p.id = fp.propertyId
            WHERE fp.propertyId IN :propertyIds
            AND fp.isActive = true
            AND p.isActive = true
            AND (fp.featuredFrom IS NULL OR fp.featuredFrom <= :now)
            AND (fp.featuredUntil IS NULL OR fp.featuredUntil > :now)
            AND (fp.paymentStatus = 'COMPLETED' OR fp.paymentStatus = 'FREE')
            """)
    List<Long> findFeaturedPropertyIds(@Param("propertyIds") List<Long> propertyIds,
                                       @Param("now") LocalDateTime now);

    // User properties
    @Query("SELECT p FROM Property p WHERE p.user.id = :userId AND p.isActive = true")
    List<Property> findByUserId(@Param("userId") Long userId);

    // Find by status
    List<Property> findByStatusAndIsActiveTrue(String status);

    // Count properties by city
    @Query("SELECT COUNT(p) FROM Property p LEFT JOIN p.area a LEFT JOIN a.city c WHERE (c.cityName = :city OR p.city = :city) AND p.isActive = true")
    Long countByCity(@Param("city") String city);

    // Find by type and listing type
    @Query("SELECT p FROM Property p WHERE LOWER(p.type) = LOWER(:type) AND LOWER(p.listingType) = LOWER(:listingType) AND p.isActive = true")
    List<Property> findByTypeAndListingType(@Param("type") String type,
                                            @Param("listingType") String listingType);

    // Active properties
    List<Property> findByIsActiveTrueOrderByCreatedAtDesc();

    // Search by title
    List<Property> findByTitleContainingIgnoreCase(String title);

    // Search by ID/title/description
    @Query("""
            SELECT p FROM Property p WHERE 
            CAST(p.id AS string) LIKE CONCAT('%', :searchTerm, '%') 
            OR LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            OR LOWER(p.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
            """)
    List<Property> searchByNameOrDescription(@Param("searchTerm") String searchTerm);

    // Global quick search
    @Query("""
            SELECT p FROM Property p WHERE 
            CAST(p.id AS string) LIKE CONCAT('%', :q, '%')
            OR LOWER(p.title) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(p.address) LIKE LOWER(CONCAT('%', :q, '%'))
            OR LOWER(p.city) LIKE LOWER(CONCAT('%', :q, '%'))
            """)
    List<Property> quickSearch(@Param("q") String q);

    // Partial area match
    @Query("""
            SELECT p FROM Property p 
            LEFT JOIN p.area a 
            WHERE LOWER(a.areaName) LIKE LOWER(CONCAT('%', :area, '%'))
            """)
    List<Property> searchByArea(@Param("area") String area);
}
