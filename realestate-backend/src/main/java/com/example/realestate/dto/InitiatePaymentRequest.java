package com.example.realestate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InitiatePaymentRequest {
    private Long featuredId;
    private String paymentMethod; // RAZORPAY, FREE
}
