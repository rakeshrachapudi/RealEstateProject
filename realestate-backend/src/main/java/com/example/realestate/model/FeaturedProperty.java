package com.example.realestate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "featured_properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeaturedProperty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "featured_id")
    private Long featuredId;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "original_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice = BigDecimal.valueOf(499.00);

    @Column(name = "discount_amount", precision = 10, scale = 2)
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalPrice;

    @Column(name = "coupon_id")
    private Long couponId;

    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    @Column(name = "featured_from")
    private LocalDateTime featuredFrom;

    @Column(name = "featured_until", nullable = false)
    private LocalDateTime featuredUntil;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "payment_id", length = 255)
    private String paymentId;

    @Column(name = "order_id", length = 255)
    private String orderId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (featuredFrom == null) {
            featuredFrom = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum PaymentStatus {
        PENDING, COMPLETED, FREE , CANCELLED
    }

    // Helper method to check if featured property is currently active
    public boolean isCurrentlyActive() {
        LocalDateTime now = LocalDateTime.now();
        return isActive != null && isActive
                && (featuredFrom == null || featuredFrom.isBefore(now) || featuredFrom.isEqual(now))
                && (featuredUntil == null || featuredUntil.isAfter(now))
                && (paymentStatus == PaymentStatus.COMPLETED || paymentStatus == PaymentStatus.FREE);
    }
}