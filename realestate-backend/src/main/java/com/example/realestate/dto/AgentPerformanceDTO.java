package com.example.realestate.dto;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class AgentPerformanceDTO {
    // Getters and Setters
    private Long agentId;
    private String agentName;
    private String agentEmail;
    private Long totalDeals;
    private Long activeDeals;
    private Long completedDeals;
    private BigDecimal totalDealValue;

    // Constructors
    public AgentPerformanceDTO() {}

    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public void setAgentName(String agentName) { this.agentName = agentName; }

    public void setAgentEmail(String agentEmail) { this.agentEmail = agentEmail; }

    public void setTotalDeals(Long totalDeals) { this.totalDeals = totalDeals; }

    public void setActiveDeals(Long activeDeals) { this.activeDeals = activeDeals; }

    public void setCompletedDeals(Long completedDeals) { this.completedDeals = completedDeals; }

    public void setTotalDealValue(BigDecimal totalDealValue) { this.totalDealValue = totalDealValue; }
}