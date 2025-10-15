package com.example.realestate.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "property")
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String type;
    private String city;
    private BigDecimal price;
    private String priceDisplay;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer balconies;
    private BigDecimal areaSqft;
    private String address;
    private String amenities;
    private String imageUrl;
    private String status;
    private String listingType;
    private Boolean isFeatured;
    private Boolean isActive;
    private Boolean isVerified;
    private String ownerType;
    private Boolean isReadyToMove;
    private String registrationProofUrl;
    private String registrationConfirmedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private DealStatus dealStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    private Area area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_type_id")
    private PropertyType propertyType;

    public enum DealStatus {
        INQUIRY, SHORTLIST, NEGOTIATION, AGREEMENT, REGISTRATION, PAYMENT
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Getters and Setters for all fields ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public String getPriceDisplay() { return priceDisplay; }
    public void setPriceDisplay(String priceDisplay) { this.priceDisplay = priceDisplay; }
    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }
    public Integer getBalconies() { return balconies; }
    public void setBalconies(Integer balconies) { this.balconies = balconies; }
    public BigDecimal getAreaSqft() { return areaSqft; }
    public void setAreaSqft(BigDecimal areaSqft) { this.areaSqft = areaSqft; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getListingType() { return listingType; }
    public void setListingType(String listingType) { this.listingType = listingType; }
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean featured) { isFeatured = featured; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean verified) { isVerified = verified; }
    public String getOwnerType() { return ownerType; }
    public void setOwnerType(String ownerType) { this.ownerType = ownerType; }
    public Boolean getIsReadyToMove() { return isReadyToMove; }
    public void setIsReadyToMove(Boolean readyToMove) { isReadyToMove = readyToMove; }
    public String getRegistrationProofUrl() { return registrationProofUrl; }
    public void setRegistrationProofUrl(String registrationProofUrl) { this.registrationProofUrl = registrationProofUrl; }
    public String getRegistrationConfirmedBy() { return registrationConfirmedBy; }
    public void setRegistrationConfirmedBy(String registrationConfirmedBy) { this.registrationConfirmedBy = registrationConfirmedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public DealStatus getDealStatus() { return dealStatus; }
    public void setDealStatus(DealStatus dealStatus) { this.dealStatus = dealStatus; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Area getArea() { return area; }
    public void setArea(Area area) { this.area = area; }
    public PropertyType getPropertyType() { return propertyType; }
    public void setPropertyType(PropertyType propertyType) { this.propertyType = propertyType; }
}
