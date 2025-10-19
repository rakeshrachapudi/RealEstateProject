package com.example.realestate.dto;

public class PriceInterestRequest {
    private Long propertyId;
    private Long userId; // The user submitting the price
    private Double price;

    // --- Getters and Setters ---

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}