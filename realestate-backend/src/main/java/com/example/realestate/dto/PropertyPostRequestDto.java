package com.example.realestate.dto;

public class PropertyPostRequestDto {
    private String title;
    private String description;
    private String imageUrl;
    private double price;
    private String priceDisplay;
    private int bedrooms;
    private int bathrooms;
    private int balconies;
    private Double areaSqft;
    private String city;
    private String address;
    private String amenities;
    private String status;
    private String listingType;
    private String type;
    private Boolean isFeatured;
    private Boolean isActive;
    private String ownerType;
    private Boolean isReadyToMove;
    private Boolean isVerified;

    private AreaReferenceDto area;
    private UserReferenceDto user;

    // Getters and Setters for all fields

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public String getPriceDisplay() { return priceDisplay; }
    public void setPriceDisplay(String priceDisplay) { this.priceDisplay = priceDisplay; }
    public int getBedrooms() { return bedrooms; }
    public void setBedrooms(int bedrooms) { this.bedrooms = bedrooms; }
    public int getBathrooms() { return bathrooms; }
    public void setBathrooms(int bathrooms) { this.bathrooms = bathrooms; }
    public int getBalconies() { return balconies; }
    public void setBalconies(int balconies) { this.balconies = balconies; }
    public Double getAreaSqft() { return areaSqft; }
    public void setAreaSqft(Double areaSqft) { this.areaSqft = areaSqft; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getListingType() { return listingType; }
    public void setListingType(String listingType) { this.listingType = listingType; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean featured) { isFeatured = featured; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public String getOwnerType() { return ownerType; }
    public void setOwnerType(String ownerType) { this.ownerType = ownerType; }
    public Boolean getIsReadyToMove() { return isReadyToMove; }
    public void setIsReadyToMove(Boolean readyToMove) { isReadyToMove = readyToMove; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean verified) { isVerified = verified; }
    public AreaReferenceDto getArea() { return area; }
    public void setArea(AreaReferenceDto area) { this.area = area; }
    public UserReferenceDto getUser() { return user; }
    public void setUser(UserReferenceDto user) { this.user = user; }

    public static class AreaReferenceDto {
        private Integer id; // CORRECTED: Changed from Long to Integer

        public Integer getId() { return id; }
        public void setId(Integer id) { this.id = id; }
    }

    public static class UserReferenceDto {
        private Long id;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
    }
}

