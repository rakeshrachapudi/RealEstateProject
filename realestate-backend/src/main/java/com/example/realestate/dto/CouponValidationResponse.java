package com.example.realestate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponValidationResponse {
    private boolean valid;
    private String message;
    private CouponDetails couponDetails;
}
