package com.example.realestate.dto;

import lombok.Data;

@Data
public class CreateFeaturedOrderRequest {
    private Long propertyId;
    private Long userId;
    private String couponCode;
    private Integer durationMonths; // optional, default to 3
}
