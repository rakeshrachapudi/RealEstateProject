package com.example.realestate.dto;

import java.time.LocalDateTime;

public class DealDTO {
    private Long id;
    private Long dealId;
    private String stage;
    private String currentStage;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String lastUpdatedBy;

    // Property Information
    private Long propertyId;
    private PropertyInfo property;

    // Buyer Information
    private Long buyerId;
    private UserInfo buyer;

    // Agent Information
    private Long agentId;
    private UserInfo agent;

    // Constructors
    public DealDTO() {}

    public DealDTO(Long dealId, String stage, String notes) {
        this.dealId = dealId;
        this.id = dealId;
        this.stage = stage;
        this.currentStage = stage;
        this.notes = notes;
    }

    // ==================== GETTERS & SETTERS ====================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDealId() { return dealId; }
    public void setDealId(Long dealId) { this.dealId = dealId; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public String getCurrentStage() { return currentStage; }
    public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }

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

    public PropertyInfo getProperty() { return property; }
    public void setProperty(PropertyInfo property) { this.property = property; }

    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }

    public UserInfo getBuyer() { return buyer; }
    public void setBuyer(UserInfo buyer) { this.buyer = buyer; }

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public UserInfo getAgent() { return agent; }
    public void setAgent(UserInfo agent) { this.agent = agent; }

    // ==================== NESTED CLASS: PropertyInfo ====================
    public static class PropertyInfo {
        private Long propertyId;
        private String title;
        private String city;
        private Double price;
        private Integer bedrooms;
        private String imageUrl;

        // Constructors
        public PropertyInfo() {}

        public PropertyInfo(Long propertyId, String title, String city, Double price,
                            Integer bedrooms, String imageUrl) {
            this.propertyId = propertyId;
            this.title = title;
            this.city = city;
            this.price = price;
            this.bedrooms = bedrooms;
            this.imageUrl = imageUrl;
        }

        // Getters and Setters
        public Long getPropertyId() { return propertyId; }
        public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public Integer getBedrooms() { return bedrooms; }
        public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    }

    // ==================== NESTED CLASS: UserInfo ====================
    public static class UserInfo {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String mobileNumber;

        // Constructors
        public UserInfo() {}

        public UserInfo(Long id, String firstName, String lastName, String email, String mobileNumber) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.mobileNumber = mobileNumber;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getMobileNumber() { return mobileNumber; }
        public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

        // Convenience method
        public String getFullName() {
            return (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "");
        }
    }

    @Override
    public String toString() {
        return "DealDTO{" +
                "dealId=" + dealId +
                ", stage='" + stage + '\'' +
                ", propertyId=" + propertyId +
                ", buyerId=" + buyerId +
                ", agentId=" + agentId +
                '}';
    }
}