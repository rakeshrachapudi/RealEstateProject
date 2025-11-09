package com.example.realestate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "coupon_id")
    private Long couponId;

    @Column(name = "coupon_code", nullable = false, unique = true, length = 50)
    private String couponCode;

    @Column(name = "description", length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "max_discount", precision = 10, scale = 2)
    private BigDecimal maxDiscount;

    @Column(name = "min_order_value", precision = 10, scale = 2)
    private BigDecimal minOrderValue;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count")
    private Integer usedCount = 0;

    @Column(name = "valid_from")
    private LocalDateTime validFrom;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (validFrom == null) {
            validFrom = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum DiscountType {
        PERCENTAGE, FLAT
    }

    // Helper method to check if coupon is valid
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        return isActive != null && isActive
                && (validFrom == null || validFrom.isBefore(now) || validFrom.isEqual(now))
                && (validUntil == null || validUntil.isAfter(now))
                && (usageLimit == null || usedCount < usageLimit);
    }

    // Helper method to calculate discount
    public BigDecimal calculateDiscount(BigDecimal orderValue) {
        if (discountType == DiscountType.PERCENTAGE) {
            BigDecimal discount = orderValue.multiply(discountValue).divide(BigDecimal.valueOf(100));
            if (maxDiscount != null && discount.compareTo(maxDiscount) > 0) {
                return maxDiscount;
            }
            return discount;
        } else {
            return discountValue;
        }
    }
}