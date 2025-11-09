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

    @Query("SELECT fp FROM FeaturedProperty fp WHERE fp.isActive = true " +
            "AND (fp.featuredFrom IS NULL OR fp.featuredFrom <= :now) " +
            "AND (fp.featuredUntil IS NULL OR fp.featuredUntil > :now) " +
            "AND (fp.paymentStatus = 'COMPLETED' OR fp.paymentStatus = 'FREE')")
    List<FeaturedProperty> findAllCurrentlyActive(LocalDateTime now);

    @Query("SELECT fp FROM FeaturedProperty fp WHERE fp.propertyId = :propertyId " +
            "AND fp.isActive = true " +
            "AND (fp.featuredFrom IS NULL OR fp.featuredFrom <= :now) " +
            "AND (fp.featuredUntil IS NULL OR fp.featuredUntil > :now) " +
            "AND (fp.paymentStatus = 'COMPLETED' OR fp.paymentStatus = 'FREE')")
    Optional<FeaturedProperty> findActiveByPropertyId(Long propertyId, LocalDateTime now);

    boolean existsByPropertyIdAndIsActiveTrue(Long propertyId);

    @Query("SELECT COUNT(fp) FROM FeaturedProperty fp WHERE fp.userId = :userId " +
            "AND fp.isActive = true " +
            "AND (fp.featuredFrom IS NULL OR fp.featuredFrom <= :now) " +
            "AND (fp.featuredUntil IS NULL OR fp.featuredUntil > :now) " +
            "AND (fp.paymentStatus = 'COMPLETED' OR fp.paymentStatus = 'FREE')")
    Long countActiveByUserId(Long userId, LocalDateTime now);
    @Query("""
        select f
        from FeaturedProperty f
        where f.isActive = true
          and (f.featuredFrom is null or f.featuredFrom <= :now)
          and (f.featuredUntil is null or f.featuredUntil > :now)
          and (f.paymentStatus = 'COMPLETED' or f.paymentStatus = 'FREE')
    """)
    List<FeaturedProperty> findActiveValid(@Param("now") LocalDateTime now);

}