package com.example.realestate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity to track property views by buyers for notification purposes.
 * Stores view data and notification status for scheduled batch processing.
 */
@Entity
@Table(name = "property_view_tracking", indexes = {
        @Index(name = "idx_notification_sent", columnList = "notification_sent"),
        @Index(name = "idx_buyer_id", columnList = "buyer_id"),
        @Index(name = "idx_property_id", columnList = "property_id"),
        @Index(name = "idx_viewed_at", columnList = "viewed_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyViewTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "property_title", length = 500)
    private String propertyTitle;

    @Column(name = "property_area", length = 255)
    private String propertyArea;

    @Column(name = "property_city", length = 100)
    private String propertyCity;

    @Column(name = "property_price", length = 50)
    private String propertyPrice;

    @Column(name = "property_url", length = 500)
    private String propertyUrl;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "buyer_name", length = 255)
    private String buyerName;

    @Column(name = "buyer_mobile", length = 20)
    private String buyerMobile;

    @Column(name = "buyer_email", length = 255)
    private String buyerEmail;

    @Column(name = "owner_name", length = 255)
    private String ownerName;

    @Column(name = "owner_phone", length = 20)
    private String ownerPhone;

    @Column(name = "owner_email", length = 255)
    private String ownerEmail;

    @Column(name = "user_type", length = 20)
    private String userType; // "buyer" or "seller"

    @Column(name = "property_count")
    private Integer propertyCount; // Number of properties user has posted

    @Column(name = "viewed_at", nullable = false)
    private LocalDateTime viewedAt;

    @Column(name = "notification_sent", nullable = false)
    private Boolean notificationSent = false;

    @Column(name = "notification_sent_at")
    private LocalDateTime notificationSentAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (notificationSent == null) {
            notificationSent = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}