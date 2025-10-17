package com.example.realestate.dto;

import java.util.List;
import java.util.Map;

public class AdminDealDashboardDTO {
    private Long totalDeals;
    private Long activeDealCount;
    private Long completedDealCount;
    private Map<String, Long> dealsByStage; // INQUIRY: 5, SHORTLIST: 3, etc.
    private List<AgentPerformanceDTO> agentPerformance;
    private Map<String, Long> dealsTrendByMonth; // Optional: for charts

    // Constructors
    public AdminDealDashboardDTO() {}

    public AdminDealDashboardDTO(Long totalDeals, Long activeDealCount, Long completedDealCount,
                                 Map<String, Long> dealsByStage,
                                 List<AgentPerformanceDTO> agentPerformance) {
        this.totalDeals = totalDeals;
        this.activeDealCount = activeDealCount;
        this.completedDealCount = completedDealCount;
        this.dealsByStage = dealsByStage;
        this.agentPerformance = agentPerformance;
    }

    // Getters and Setters
    public Long getTotalDeals() { return totalDeals; }
    public void setTotalDeals(Long totalDeals) { this.totalDeals = totalDeals; }

    public Long getActiveDealCount() { return activeDealCount; }
    public void setActiveDealCount(Long activeDealCount) { this.activeDealCount = activeDealCount; }

    public Long getCompletedDealCount() { return completedDealCount; }
    public void setCompletedDealCount(Long completedDealCount) { this.completedDealCount = completedDealCount; }

    public Map<String, Long> getDealsByStage() { return dealsByStage; }
    public void setDealsByStage(Map<String, Long> dealsByStage) { this.dealsByStage = dealsByStage; }

    public List<AgentPerformanceDTO> getAgentPerformance() { return agentPerformance; }
    public void setAgentPerformance(List<AgentPerformanceDTO> agentPerformance) {
        this.agentPerformance = agentPerformance;
    }

    public Map<String, Long> getDealsTrendByMonth() { return dealsTrendByMonth; }
    public void setDealsTrendByMonth(Map<String, Long> dealsTrendByMonth) {
        this.dealsTrendByMonth = dealsTrendByMonth;
    }
}
