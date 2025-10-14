package com.example.realestate.dto;

public class PropertyPostRequestDto {

    // Nested DTO to match frontend JSON structure: { "user": { "id": 6 } }
    public static class UserReferenceDto {
        private Long id; // Corresponds to the user who posted
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
    }

    // --- Fields mapped from Frontend Form Data ---
    private String title;
    private String description;
    private String imageUrl;
    private Double price; // Frontend sends a numeric price (e.g., 5000000)
    private String priceDisplay; // Frontend generated display string (e.g., '₹50 Lac')
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer balconies;
    private Double areaSqft;

    // --- Foreign Key fields / Core Type fields ---
    private Long areaId; // The ID selected from the 'area' dropdown in the frontend
    private UserReferenceDto user; // The user object with ID
    private String type; // Corresponds to frontend's 'type'
    private String listingType;
    private String city;
    private String address;

    // --- Other Attributes ---
    private String amenities;
    private String status = "available";
    private Boolean isFeatured = true;
    private Boolean isActive = true;

    // --- Getters and Setters (Manual for consistency with PropertyDTO) ---
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
    public Long getAreaId() { return areaId; }
    public void setAreaId(Long areaId) { this.areaId = areaId; }
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
}