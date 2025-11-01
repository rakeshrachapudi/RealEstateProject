package com.example.realestate.dto;

public class AdminDealDashboardDTO {
    private Long totalDeals;
    private Long inquiryCount;
    private Long shortlistCount;
    private Long negotiationCount;
    private Long agreementCount;
    private Long registrationCount;
    private Long paymentCount;
    private Long completedCount;

    // Constructors
    public AdminDealDashboardDTO() {}

    // Getters and Setters
    public Long getTotalDeals() { return totalDeals; }
    public void setTotalDeals(Long totalDeals) { this.totalDeals = totalDeals; }

    public Long getInquiryCount() { return inquiryCount; }
    public void setInquiryCount(Long inquiryCount) { this.inquiryCount = inquiryCount; }

    public Long getShortlistCount() { return shortlistCount; }
    public void setShortlistCount(Long shortlistCount) { this.shortlistCount = shortlistCount; }

    public Long getNegotiationCount() { return negotiationCount; }
    public void setNegotiationCount(Long negotiationCount) { this.negotiationCount = negotiationCount; }

    public Long getAgreementCount() { return agreementCount; }
    public void setAgreementCount(Long agreementCount) { this.agreementCount = agreementCount; }

    public Long getRegistrationCount() { return registrationCount; }
    public void setRegistrationCount(Long registrationCount) { this.registrationCount = registrationCount; }

    public Long getPaymentCount() { return paymentCount; }
    public void setPaymentCount(Long paymentCount) { this.paymentCount = paymentCount; }

    public Long getCompletedCount() { return completedCount; }
    public void setCompletedCount(Long completedCount) { this.completedCount = completedCount; }
}