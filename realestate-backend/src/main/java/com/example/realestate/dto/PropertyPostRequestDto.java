package com.example.realestate.dto;

import java.math.BigDecimal;

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
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer balconies;
    private Double areaSqft;

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

    // ⭐ NEW FIELDS
    private String ownerType = "owner"; // "owner" or "broker"
    private Boolean isReadyToMove = false;
    private Boolean isVerified = false; // Only agents can verify

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

    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }

    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }

    public Integer getBalconies() { return balconies; }
    public void setBalconies(Integer balconies) { this.balconies = balconies; }

    public Double getAreaSqft() { return areaSqft; }
    public void setAreaSqft(Double areaSqft) { this.areaSqft = areaSqft; }

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

    // ⭐ NEW GETTERS AND SETTERS
    public String getOwnerType() { return ownerType; }
    public void setOwnerType(String ownerType) { this.ownerType = ownerType; }

    public Boolean getIsReadyToMove() { return isReadyToMove; }
    public void setIsReadyToMove(Boolean isReadyToMove) { this.isReadyToMove = isReadyToMove; }

    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
}