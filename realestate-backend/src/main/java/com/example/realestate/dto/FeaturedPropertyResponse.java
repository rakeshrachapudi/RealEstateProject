package com.example.realestate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeaturedPropertyResponse {
    private Long featuredId;
    private Long propertyId;
    private Long userId;
    private BigDecimal originalPrice;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    private String couponCode;
    private LocalDateTime featuredFrom;
    private LocalDateTime featuredUntil;
    private Boolean isActive;
    private String paymentStatus;
    private String message;
}
