package com.example.realestate.repository;

import com.example.realestate.model.PropertyViewTracking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for PropertyViewTracking entity.
 * Handles database operations for property view tracking.
 */
@Repository
public interface PropertyViewTrackingRepository extends JpaRepository<PropertyViewTracking, Long> {

    /**
     * Find all property views that haven't been notified yet.
     * Used by scheduler to batch process notifications.
     */
    List<PropertyViewTracking> findByNotificationSentFalse();

    /**
     * Find all property views for a specific buyer that haven't been notified.
     */
    List<PropertyViewTracking> findByBuyerIdAndNotificationSentFalse(Long buyerId);

    /**
     * Find property views by buyer within a date range.
     */
    List<PropertyViewTracking> findByBuyerIdAndViewedAtBetween(
            Long buyerId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    /**
     * Find all property views for a specific property.
     */
    List<PropertyViewTracking> findByPropertyIdOrderByViewedAtDesc(Long propertyId);

    /**
     * Get count of views for a property by buyers (user_type = 'buyer').
     */
    @Query("SELECT COUNT(v) FROM PropertyViewTracking v WHERE v.propertyId = :propertyId AND v.userType = 'buyer'")
    Long countBuyerViewsByPropertyId(@Param("propertyId") Long propertyId);

    /**
     * Get distinct buyers who viewed a property.
     */
    @Query("SELECT DISTINCT v.buyerId FROM PropertyViewTracking v WHERE v.propertyId = :propertyId AND v.userType = 'buyer'")
    List<Long> findDistinctBuyersByPropertyId(@Param("propertyId") Long propertyId);

    /**
     * Find recent views (last N hours) that haven't been notified.
     */
    @Query("SELECT v FROM PropertyViewTracking v WHERE v.notificationSent = false AND v.viewedAt >= :cutoffTime ORDER BY v.viewedAt DESC")
    List<PropertyViewTracking> findRecentUnnotifiedViews(@Param("cutoffTime") LocalDateTime cutoffTime);

    /**
     * Get all unique buyers with pending notifications.
     */
    @Query("SELECT DISTINCT v.buyerId FROM PropertyViewTracking v WHERE v.notificationSent = false AND v.userType = 'buyer'")
    List<Long> findDistinctBuyersWithPendingNotifications();

    /**
     * Check if buyer has already viewed this property (to avoid duplicate tracking).
     */
    boolean existsByPropertyIdAndBuyerIdAndNotificationSentFalse(Long propertyId, Long buyerId);

    /**
     * Count pending notifications.
     */
    @Query("SELECT COUNT(v) FROM PropertyViewTracking v WHERE v.notificationSent = false")
    Long countPendingNotifications();
}