package com.example.realestate.dto;

import java.math.BigDecimal;

public class CreateDealRequestDto {
    private Long propertyId;
    private Long buyerId;
    private Long agentId;
    private BigDecimal agreedPrice;      // ⭐ NEW
    private String notes;

    // Constructors
    public CreateDealRequestDto() {}

    public CreateDealRequestDto(Long propertyId, Long buyerId, Long agentId, BigDecimal agreedPrice) {
        this.propertyId = propertyId;
        this.buyerId = buyerId;
        this.agentId = agentId;
        this.agreedPrice = agreedPrice;
    }

    // Getters and Setters
    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public BigDecimal getAgreedPrice() { return agreedPrice; }
    public void setAgreedPrice(BigDecimal agreedPrice) { this.agreedPrice = agreedPrice; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    @Override
    public String toString() {
        return "CreateDealRequestDto{" +
                "propertyId=" + propertyId +
                ", buyerId=" + buyerId +
                ", agentId=" + agentId +
                ", agreedPrice=" + agreedPrice +
                ", notes='" + notes + '\'' +
                '}';
    }
}
