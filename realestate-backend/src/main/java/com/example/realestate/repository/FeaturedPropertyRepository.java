package com.example.realestate.repository;

import com.example.realestate.model.FeaturedProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeaturedPropertyRepository extends JpaRepository<FeaturedProperty, Long> {

    Optional<FeaturedProperty> findByPropertyIdAndIsActiveTrue(Long propertyId);

    List<FeaturedProperty> findByUserIdAndIsActiveTrue(Long userId);

    List<FeaturedProperty> findByPropertyId(Long propertyId);

    /**
     * Return ALL active featured properties AND ensure
     * linked Property isActive = true (soft delete fix)
     */
    @Query("""
            SELECT fp FROM FeaturedProperty fp
            JOIN Property p ON p.id = fp.propertyId
            WHERE fp.isActive = true
              AND p.isActive = true
              AND (fp.featuredFrom IS NULL OR fp.featuredFrom <= :now)
              AND (fp.featuredUntil IS NULL OR fp.featuredUntil > :now)
              AND (fp.paymentStatus = 'COMPLETED' OR fp.paymentStatus = 'FREE')
            """)
    List<FeaturedProperty> findAllCurrentlyActive(@Param("now") LocalDateTime now);

    /**
     * Fetch a single featured property with property active check
     */
    @Query("""
            SELECT fp FROM FeaturedProperty fp
            JOIN Property p ON p.id = fp.propertyId
            WHERE fp.propertyId = :propertyId
              AND fp.isActive = true
              AND p.isActive = true
              AND (fp.featuredFrom IS NULL OR fp.featuredFrom <= :now)
              AND (fp.featuredUntil IS NULL OR fp.featuredUntil > :now)
              AND (fp.paymentStatus = 'COMPLETED' OR fp.paymentStatus = 'FREE')
            """)
    Optional<FeaturedProperty> findActiveByPropertyId(@Param("propertyId") Long propertyId,
                                                      @Param("now") LocalDateTime now);

    boolean existsByPropertyIdAndIsActiveTrue(Long propertyId);

    @Query("""
            SELECT COUNT(fp) FROM FeaturedProperty fp
            JOIN Property p ON p.id = fp.propertyId
            WHERE fp.userId = :userId
              AND fp.isActive = true
              AND p.isActive = true
              AND (fp.featuredFrom IS NULL OR fp.featuredFrom <= :now)
              AND (fp.featuredUntil IS NULL OR fp.featuredUntil > :now)
              AND (fp.paymentStatus = 'COMPLETED' OR fp.paymentStatus = 'FREE')
            """)
    Long countActiveByUserId(@Param("userId") Long userId,
                             @Param("now") LocalDateTime now);

    /**
     * Generic active featured list (same fix: ensure p.isActive = true)
     */
    @Query("""
            SELECT f FROM FeaturedProperty f
            JOIN Property p ON p.id = f.propertyId
            WHERE f.isActive = true
              AND p.isActive = true
              AND (f.featuredFrom IS NULL OR f.featuredFrom <= :now)
              AND (f.featuredUntil IS NULL OR f.featuredUntil > :now)
              AND (f.paymentStatus = 'COMPLETED' OR f.paymentStatus = 'FREE')
            """)
    List<FeaturedProperty> findActiveValid(@Param("now") LocalDateTime now);

}
