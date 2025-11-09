package com.example.realestate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplyFeaturedRequest {
    private Long propertyId;
    private String couponCode;
    private Integer durationMonths = 3; // Default 3 months
}
