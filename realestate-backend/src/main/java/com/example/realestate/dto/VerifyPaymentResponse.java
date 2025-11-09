package com.example.realestate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyPaymentResponse {
    private boolean success;
    private String message;
    private FeaturedPropertyResponse featuredProperty;
}
