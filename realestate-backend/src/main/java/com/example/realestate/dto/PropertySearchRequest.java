package com.example.realestate.dto;

import java.math.BigDecimal;

public class PropertySearchRequest {
    private String propertyType;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String city;
    private String area;
    private String listingType;
    private Integer minBedrooms;
    private Integer maxBedrooms;
    private String sortBy = "createdAt";
    private String sortOrder = "DESC";
    private Integer page = 0;
    private Integer size = 20;
    private Boolean isVerified;
    private String ownerType;
    private String status;

    private Boolean isReadyToMove;

    public Boolean getIsReadyToMove() { return isReadyToMove; }
    public void setIsReadyToMove(Boolean isReadyToMove) { this.isReadyToMove = isReadyToMove; }

    // Add getters and setters
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public String getOwnerType() { return ownerType; }
    public void setOwnerType(String ownerType) { this.ownerType = ownerType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // Getters and Setters
    public String getPropertyType() { return propertyType; }
    public void setPropertyType(String propertyType) { this.propertyType = propertyType; }
    public BigDecimal getMinPrice() { return minPrice; }
    public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }
    public BigDecimal getMaxPrice() { return maxPrice; }
    public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public String getListingType() { return listingType; }
    public void setListingType(String listingType) { this.listingType = listingType; }
    public Integer getMinBedrooms() { return minBedrooms; }
    public void setMinBedrooms(Integer minBedrooms) { this.minBedrooms = minBedrooms; }
    public Integer getMaxBedrooms() { return maxBedrooms; }
    public void setMaxBedrooms(Integer maxBedrooms) { this.maxBedrooms = maxBedrooms; }
    public String getSortBy() { return sortBy; }
    public void setSortBy(String sortBy) { this.sortBy = sortBy; }
    public String getSortOrder() { return sortOrder; }
    public void setSortOrder(String sortOrder) { this.sortOrder = sortOrder; }
    public Integer getPage() { return page; }
    public void setPage(Integer page) { this.page = page; }
    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }
}