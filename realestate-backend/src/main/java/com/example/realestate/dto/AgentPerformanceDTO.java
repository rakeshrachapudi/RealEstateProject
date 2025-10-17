package com.example.realestate.dto;

import java.math.BigDecimal;

public class AgentPerformanceDTO {
    private Long agentId;
    private String agentName;
    private String agentEmail;
    private String agentMobile;
    private Long totalDeals;
    private Long activeDeals;
    private Long completedDeals;
    private String conversionRate; // Format: "75.50%"
    private BigDecimal averageDealPrice;
    private Long inquiryCount;
    private Long shortlistCount;
    private Long negotiationCount;
    private Long agreementCount;
    private Long registrationCount;
    private Long paymentCount;

    // Constructors
    public AgentPerformanceDTO() {}

    public AgentPerformanceDTO(Long agentId, String agentName, String agentEmail,
                               String agentMobile, Long totalDeals, Long activeDeals,
                               Long completedDeals, String conversionRate,
                               BigDecimal averageDealPrice) {
        this.agentId = agentId;
        this.agentName = agentName;
        this.agentEmail = agentEmail;
        this.agentMobile = agentMobile;
        this.totalDeals = totalDeals;
        this.activeDeals = activeDeals;
        this.completedDeals = completedDeals;
        this.conversionRate = conversionRate;
        this.averageDealPrice = averageDealPrice;
    }

    // Getters and Setters
    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getAgentEmail() { return agentEmail; }
    public void setAgentEmail(String agentEmail) { this.agentEmail = agentEmail; }

    public String getAgentMobile() { return agentMobile; }
    public void setAgentMobile(String agentMobile) { this.agentMobile = agentMobile; }

    public Long getTotalDeals() { return totalDeals; }
    public void setTotalDeals(Long totalDeals) { this.totalDeals = totalDeals; }

    public Long getActiveDeals() { return activeDeals; }
    public void setActiveDeals(Long activeDeals) { this.activeDeals = activeDeals; }

    public Long getCompletedDeals() { return completedDeals; }
    public void setCompletedDeals(Long completedDeals) { this.completedDeals = completedDeals; }

    public String getConversionRate() { return conversionRate; }
    public void setConversionRate(String conversionRate) { this.conversionRate = conversionRate; }

    public BigDecimal getAverageDealPrice() { return averageDealPrice; }
    public void setAverageDealPrice(BigDecimal averageDealPrice) { this.averageDealPrice = averageDealPrice; }

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
}

