package com.example.realestate.dto;

import java.math.BigDecimal; // Not strictly needed here, but kept if you plan to use it later

public class PropertyPostRequestDto {

    // ⭐ Nested DTO to match frontend JSON structure: { "user": { "id": 6 } }
    public static class UserReferenceDto {
        private Long id; // Corresponds to the user who posted
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
    }

    // ⭐ Nested DTO to match frontend JSON structure: { "area": { "id": 1 } }
    public static class AreaReferenceDto {
        private Long id; // Corresponds to the area selected
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
    }

    // --- Fields mapped from Frontend Form Data ---
    private String title;
    private String description;
    private String imageUrl;
    private Double price;
    private String priceDisplay;

    // ⭐ UPDATED to Double to support 2.5 bathrooms/bedrooms
    private Double bedrooms;
    private Double bathrooms;
    private Double balconies;

    private Double areaSqft;
    // ⭐ NEW: Price per square foot
    private Double pricePerSqft;

    // --- Foreign Key fields / Core Type fields ---
    private AreaReferenceDto area;
    private UserReferenceDto user;
    private String type;
    private String listingType;
    private String city;
    private String address;

    // --- Other Attributes ---
    private String amenities;
    private String status = "available";
    private Boolean isFeatured = false;
    private Boolean isActive = true;

    // ⭐ NEW FIELDS ADDED FROM FRONTEND
    private String ownerType = "owner"; // "owner" or "broker"
    private Boolean isVerified = false; // Only agents can verify

    // ⭐ NEW: Construction Status and Possession Details
    private String constructionStatus; // e.g., "ready_to_move", "under_construction"
    private String possessionYear;
    private String possessionMonth;

    // ⭐ NEW: Regulatory IDs
    private String reraId;
    private String hmdaId;

    // --- Getters and Setters ---

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getPriceDisplay() { return priceDisplay; }
    public void setPriceDisplay(String priceDisplay) { this.priceDisplay = priceDisplay; }

    // ⭐ UPDATED GETTERS/SETTERS FOR DECIMAL SUPPORT
    public Double getBedrooms() { return bedrooms; }
    public void setBedrooms(Double bedrooms) { this.bedrooms = bedrooms; }

    public Double getBathrooms() { return bathrooms; }
    public void setBathrooms(Double bathrooms) { this.bathrooms = bathrooms; }

    public Double getBalconies() { return balconies; }
    public void setBalconies(Double balconies) { this.balconies = balconies; }
    // ---------------------------------------------

    public Double getAreaSqft() { return areaSqft; }
    public void setAreaSqft(Double areaSqft) { this.areaSqft = areaSqft; }

    // ⭐ NEW GETTERS/SETTERS
    public Double getPricePerSqft() { return pricePerSqft; }
    public void setPricePerSqft(Double pricePerSqft) { this.pricePerSqft = pricePerSqft; }
    // ---------------------------------------------


    public AreaReferenceDto getArea() { return area; }
    public void setArea(AreaReferenceDto area) { this.area = area; }

    public UserReferenceDto getUser() { return user; }
    public void setUser(UserReferenceDto user) { this.user = user; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getListingType() { return listingType; }
    public void setListingType(String listingType) { this.listingType = listingType; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    // ⭐ NEW GETTERS AND SETTERS FOR STATUS AND REGULATORY IDs
    public String getOwnerType() { return ownerType; }
    public void setOwnerType(String ownerType) { this.ownerType = ownerType; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

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
}