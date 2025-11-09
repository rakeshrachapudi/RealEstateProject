package com.example.realestate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
class InitiatePaymentResponse {
    private String orderId;
    private String paymentId;
    private BigDecimal amount;
    private String currency;
    private String razorpayKeyId;
    private String message;
}
