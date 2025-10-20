package com.example.realestate.dto;

import java.util.Map;
import java.util.stream.Collectors; // Placeholder import if needed for role conversion logic

// Assuming you have User.UserRole enum available for mapping keys,
// but using String here for role keys to match typical Map<String, Long> usage.
public class AdminUserDashboardDTO {
    private Long totalUsers;
    private Long totalAdmins;
    private Long totalAgents;
    private Long totalBuyers; // Assuming Buyers are users without property listings
    private Long totalSellers; // Assuming Sellers are users with property listings
    private Map<String, Long> usersByRole; // Role name (String) to Count (Long)

    // Constructors
    public AdminUserDashboardDTO() {}

    public AdminUserDashboardDTO(Long totalUsers, Long totalAdmins, Long totalAgents,
                                 Long totalBuyers, Long totalSellers,
                                 Map<String, Long> usersByRole) {
        this.totalUsers = totalUsers;
        this.totalAdmins = totalAdmins;
        this.totalAgents = totalAgents;
        this.totalBuyers = totalBuyers;
        this.totalSellers = totalSellers;
        this.usersByRole = usersByRole;
    }

    // Getters and Setters
    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

    public Long getTotalAdmins() { return totalAdmins; }
    public void setTotalAdmins(Long totalAdmins) { this.totalAdmins = totalAdmins; }

    public Long getTotalAgents() { return totalAgents; }
    public void setTotalAgents(Long totalAgents) { this.totalAgents = totalAgents; }

    public Long getTotalBuyers() { return totalBuyers; }
    public void setTotalBuyers(Long totalBuyers) { this.totalBuyers = totalBuyers; }

    public Long getTotalSellers() { return totalSellers; }
    public void setTotalSellers(Long totalSellers) { this.totalSellers = totalSellers; }

    public Map<String, Long> getUsersByRole() { return usersByRole; }
    public void setUsersByRole(Map<String, Long> usersByRole) { this.usersByRole = usersByRole; }
}