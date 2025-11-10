package com.example.realestate.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class FeaturedOrderResponse {
    private Long featuredId;               // required for verification
    private String razorpayOrderId;        // Razorpay order
    private String razorpayKeyId;          // key id for frontend
    private BigDecimal finalAmount;        // amount after coupon
    private String currency;               // INR
    private boolean free;                  // coupon free = true
    private String message;
    private boolean success;// success / error
}
