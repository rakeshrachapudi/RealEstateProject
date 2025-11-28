package com.example.realestate.dto;

public class PropertyPostRequestDto {

    // --- Fields mapped from Frontend Form Data ---
    private String title;
    private String description;
    private String imageUrl;
    private String imageUrls;        // ⭐ Comma-separated URLs
    private String documentUrls;     // ⭐ Comma-separated document URLs
    private Double price;
    private String priceDisplay;

    // ⭐ UPDATED to Double to support 2.5 bathrooms/bedrooms
    private Double bedrooms;
    private Double bathrooms;
    private Double balconies;

    private Double areaSqft;

    // ⭐ NEW FIELD: Fixed Amenities Price (NOT sqft-based)
    private Double amenitiesPrice;

    // ⭐ Price per square foot
    private Double pricePerSqft;

    // --- Foreign Key fields as simple IDs (matching frontend) ---
    private Long areaId;             // Frontend sends: areaId
    private Long userId;             // Frontend sends: userId
    private String type;
    private String listingType;
    private String city;
    private String address;

    // --- Other Attributes ---
    private String amenities;
    private String status = "available";
    private Boolean isFeatured = false;
    private Boolean isActive = true;

    // ⭐ STATUS FIELDS
    private String ownerType = "owner"; // "owner" or "broker"
    private Boolean isVerified = false;

    // ⭐ CONSTRUCTION & REGULATORY FIELDS
    private String constructionStatus;
    private String possessionYear;
    private String possessionMonth;
    private String reraId;
    private String hmdaId;

    // --- Getters and Setters ---

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // ⭐ NEW: imageUrls getter/setter
    public String getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(String imageUrls) {
        this.imageUrls = imageUrls;
    }

    // ⭐ NEW: documentUrls getter/setter
    public String getDocumentUrls() {
        return documentUrls;
    }

    public void setDocumentUrls(String documentUrls) {
        this.documentUrls = documentUrls;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getPriceDisplay() {
        return priceDisplay;
    }

    public void setPriceDisplay(String priceDisplay) {
        this.priceDisplay = priceDisplay;
    }

    public Double getBedrooms() {
        return bedrooms;
    }

    public void setBedrooms(Double bedrooms) {
        this.bedrooms = bedrooms;
    }

    public Double getBathrooms() {
        return bathrooms;
    }

    public void setBathrooms(Double bathrooms) {
        this.bathrooms = bathrooms;
    }

    public Double getBalconies() {
        return balconies;
    }

    public void setBalconies(Double balconies) {
        this.balconies = balconies;
    }

    public Double getAreaSqft() {
        return areaSqft;
    }

    public void setAreaSqft(Double areaSqft) {
        this.areaSqft = areaSqft;
    }

    // ⭐ amenitiesPrice getter/setter
    public Double getAmenitiesPrice() {
        return amenitiesPrice;
    }

    public void setAmenitiesPrice(Double amenitiesPrice) {
        this.amenitiesPrice = amenitiesPrice;
    }

    public Double getPricePerSqft() {
        return pricePerSqft;
    }

    public void setPricePerSqft(Double pricePerSqft) {
        this.pricePerSqft = pricePerSqft;
    }

    // ⭐ Simple ID getters/setters (matching frontend)
    public Long getAreaId() {
        return areaId;
    }

    public void setAreaId(Long areaId) {
        this.areaId = areaId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getListingType() {
        return listingType;
    }

    public void setListingType(String listingType) {
        this.listingType = listingType;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getIsFeatured() {
        return isFeatured;
    }

    public void setIsFeatured(Boolean isFeatured) {
        this.isFeatured = isFeatured;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getOwnerType() {
        return ownerType;
    }

    public void setOwnerType(String ownerType) {
        this.ownerType = ownerType;
    }

    public Boolean getIsVerified() {
        return isVerified;
    }

    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }

    public String getConstructionStatus() {
        return constructionStatus;
    }

    public void setConstructionStatus(String constructionStatus) {
        this.constructionStatus = constructionStatus;
    }

    public String getPossessionYear() {
        return possessionYear;
    }

    public void setPossessionYear(String possessionYear) {
        this.possessionYear = possessionYear;
    }

    public String getPossessionMonth() {
        return possessionMonth;
    }

    public void setPossessionMonth(String possessionMonth) {
        this.possessionMonth = possessionMonth;
    }

    public String getReraId() {
        return reraId;
    }

    public void setReraId(String reraId) {
        this.reraId = reraId;
    }

    public String getHmdaId() {
        return hmdaId;
    }

    public void setHmdaId(String hmdaId) {
        this.hmdaId = hmdaId;
    }

    @Override
    public String toString() {
        return "PropertyPostRequestDto{" +
                "title='" + title + '\'' +
                ", type='" + type + '\'' +
                ", listingType='" + listingType + '\'' +
                ", userId=" + userId +
                ", areaId=" + areaId +
                ", price=" + price +
                ", city='" + city + '\'' +
                ", ownerType='" + ownerType + '\'' +
                ", constructionStatus='" + constructionStatus + '\'' +
                '}';
    }
}