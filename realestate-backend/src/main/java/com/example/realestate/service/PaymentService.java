package com.example.realestate.service;


import com.example.realestate.model.Property;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final PropertyService propertyService;

    public PaymentService(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    public Order createOrder(Long propertyId) throws RazorpayException {
        Property property = propertyService.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        RazorpayClient razorpayClient = new RazorpayClient(keyId, keySecret);

        BigDecimal amount = property.getPrice().multiply(new BigDecimal("0.005")).setScale(2, RoundingMode.HALF_UP);
        int amountInPaisa = amount.multiply(new BigDecimal("100")).intValue();

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountInPaisa); // amount in the smallest currency unit
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "receipt_prop_" + propertyId);

        return razorpayClient.orders.create(orderRequest);
    }

    public String getKeyId() {
        return this.keyId;
    }
}
