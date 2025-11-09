package com.example.realestate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

// ===== Coupon DTOs =====

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateCouponRequest {
    private String couponCode;
    private BigDecimal orderValue;
}


// ===== Featured Property DTOs =====

// ===== Payment DTOs =====

