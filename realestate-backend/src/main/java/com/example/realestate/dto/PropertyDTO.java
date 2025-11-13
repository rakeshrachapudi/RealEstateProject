package com.example.realestate.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PropertyDTO {
    private Long propertyId;
    private String propertyType;
    private String title;
    private String description;
    private BigDecimal price;
    private BigDecimal areaSqft;

    // ⭐ UPDATED to Double to support 2.5 bathrooms/bedrooms
    private Double bedrooms;
    private Double bathrooms;
    private Double balconies;

    private String address;
    private String status;
    private String listingType;
    private String imageUrl;
    private String amenities;
    private Boolean isFeatured;
    private String areaName;
    private String pincode;
    private String cityName;
    private String state;
    private LocalDateTime createdAt;
    private String priceDisplay;
    private Boolean isReadyToMove;
    private String ownerType;
    private Boolean isVerified;

    // ⭐ NEW FIELDS ADDED
    private String constructionStatus;
    private String possessionYear;
    private String possessionMonth;
    private String reraId;
    private String hmdaId;
    private BigDecimal pricePerSqft;


    private UserDTO user; // ✅ Contact information (broker or owner)

    // ✅ Nested UserDTO class
    public static class UserDTO {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String mobileNumber;
        private String role; // ✅ IMPORTANT: To identify if BROKER or USER

        public UserDTO() {}

        public UserDTO(Long id, String firstName, String lastName, String email, String mobileNumber, String role) {
            this.id = id;
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.mobileNumber = mobileNumber;
            this.role = role;
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
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    // Getters and Setters for all fields
    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }

    public Boolean getIsReadyToMove() { return isReadyToMove; }
    public void setIsReadyToMove(Boolean isReadyToMove) { this.isReadyToMove = isReadyToMove; }

    public String getOwnerType() { return ownerType; }
    public void setOwnerType(String ownerType) { this.ownerType = ownerType; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public Long getPropertyId() { return propertyId; }
    public void setPropertyId(Long propertyId) { this.propertyId = propertyId; }

    public String getPropertyType() { return propertyType; }
    public void setPropertyType(String propertyType) { this.propertyType = propertyType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getAreaSqft() { return areaSqft; }
    public void setAreaSqft(BigDecimal areaSqft) { this.areaSqft = areaSqft; }

    // ⭐ UPDATED Getters/Setters
    public Double getBedrooms() { return bedrooms; }
    public void setBedrooms(Double bedrooms) { this.bedrooms = bedrooms; }

    public Double getBathrooms() { return bathrooms; }
    public void setBathrooms(Double bathrooms) { this.bathrooms = bathrooms; }

    public Double getBalconies() { return balconies; }
    public void setBalconies(Double balconies) { this.balconies = balconies; }
    // END UPDATED Getters/Setters

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getListingType() { return listingType; }
    public void setListingType(String listingType) { this.listingType = listingType; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }

    public String getAreaName() { return areaName; }
    public void setAreaName(String areaName) { this.areaName = areaName; }

    public String getPincode() { return pincode; }
    public void setPincode(String pincode) { this.pincode = pincode; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getPriceDisplay() { return priceDisplay; }
    public void setPriceDisplay(String priceDisplay) { this.priceDisplay = priceDisplay; }

    // ⭐ NEW Getters and Setters
    public String getConstructionStatus() { return constructionStatus; }
    public void setConstructionStatus(String constructionStatus) { this.constructionStatus = constructionStatus; }

    public String getPossessionYear() { return possessionYear; }
    public void setPossessionYear(String possessionYear) { this.possessionYear = possessionYear; }

    public String getPossessionMonth() { return possessionMonth; }
    public void setPossessionMonth(String possessionMonth) { this.possessionMonth = possessionMonth; }

    public String getReraId() { return reraId; }
    public void setReraId(String reraId) { this.reraId = reraId; }

    public String getHmdaId() { return hmdaId; }
    public void setHmdaId(String hmdaId) { this.hmdaId = hmdaId; }

    public BigDecimal getPricePerSqft() { return pricePerSqft; }
    public void setPricePerSqft(BigDecimal pricePerSqft) { this.pricePerSqft = pricePerSqft; }
}