package com.example.realestate.dto;

import lombok.Data;

@Data
public class ApplyFeaturedRequest {
    private Long propertyId;
    private String couponCode;
    private Integer durationMonths;

    // ✅ ADD THIS FIELD
    private Long userId;
}
