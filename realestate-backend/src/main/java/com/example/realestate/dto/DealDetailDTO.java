package com.example.realestate.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DealDetailDTO {
    private Long dealId;
    private String stage;
    private String currentStage;
    private BigDecimal agreedPrice;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String lastUpdatedBy;

    // Property Details
    private Long propertyId;
    private String propertyTitle;
    private BigDecimal propertyPrice;
    private String propertyCity;

    // Buyer Details
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private String buyerMobile;

    // Seller Details
    private Long sellerId;
    private String sellerName;
    private String sellerEmail;
    private String sellerMobile;

    // Agent Details
    private Long agentId;
    private String agentName;
    private String agentEmail;
    private String agentMobile;

    // ==================== NEW: STAGE DATE FIELDS ====================
    private LocalDateTime inquiryDate;
    private LocalDateTime shortlistDate;
    private LocalDateTime negotiationDate;
    private LocalDateTime agreementDate;
    private LocalDateTime registrationDate;
    private LocalDateTime paymentDate;
    private LocalDateTime completedDate;

    // Constructors
    public DealDetailDTO() {}

    // Getters and Setters
    public Long getDealId() { return dealId; }
    public void setDealId(Long dealId) { this.dealId = dealId; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public String getCurrentStage() { return currentStage; }
    public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }

    public BigDecimal getAgreedPrice() { return agreedPrice; }
    public void setAgreedPrice(BigDecimal agreedPrice) { this.agreedPrice = agreedPrice; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getLastUpdatedBy() { return lastUpdatedBy; }
    public void setLastUpdatedBy(String lastUpdatedBy) { this.lastUpdatedBy = lastUpdatedBy; }

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public String getPropertyTitle() { return propertyTitle; }
    public void setPropertyTitle(String propertyTitle) { this.propertyTitle = propertyTitle; }

    public BigDecimal getPropertyPrice() { return propertyPrice; }
    public void setPropertyPrice(BigDecimal propertyPrice) { this.propertyPrice = propertyPrice; }

    public String getPropertyCity() { return propertyCity; }
    public void setPropertyCity(String propertyCity) { this.propertyCity = propertyCity; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }

    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }

    public String getBuyerMobile() { return buyerMobile; }
    public void setBuyerMobile(String buyerMobile) { this.buyerMobile = buyerMobile; }

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

    public String getSellerName() { return sellerName; }
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    public String getSellerEmail() { return sellerEmail; }
    public void setSellerEmail(String sellerEmail) { this.sellerEmail = sellerEmail; }

    public String getSellerMobile() { return sellerMobile; }
    public void setSellerMobile(String sellerMobile) { this.sellerMobile = sellerMobile; }

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getAgentEmail() { return agentEmail; }
    public void setAgentEmail(String agentEmail) { this.agentEmail = agentEmail; }

    public String getAgentMobile() { return agentMobile; }
    public void setAgentMobile(String agentMobile) { this.agentMobile = agentMobile; }

    // Stage Date Getters and Setters (NEW)
    public LocalDateTime getInquiryDate() { return inquiryDate; }
    public void setInquiryDate(LocalDateTime inquiryDate) { this.inquiryDate = inquiryDate; }

    public LocalDateTime getShortlistDate() { return shortlistDate; }
    public void setShortlistDate(LocalDateTime shortlistDate) { this.shortlistDate = shortlistDate; }

    public LocalDateTime getNegotiationDate() { return negotiationDate; }
    public void setNegotiationDate(LocalDateTime negotiationDate) { this.negotiationDate = negotiationDate; }

    public LocalDateTime getAgreementDate() { return agreementDate; }
    public void setAgreementDate(LocalDateTime agreementDate) { this.agreementDate = agreementDate; }

    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }

    public LocalDateTime getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDateTime completedDate) { this.completedDate = completedDate; }
}