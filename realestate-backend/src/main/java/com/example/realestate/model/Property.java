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

    // Existing fields (keep for backward compatibility)
    private String title;
    private String type; // String type for backward compatibility (can also be mapped to propertyType entity name)
    private String city;
    private String imageUrl;
    private String priceDisplay;

    @Column(columnDefinition = "TEXT")
    private String description;

    // NEW fields for enhanced functionality
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "property_type_id")
    private PropertyType propertyType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "area_id")
    private Area area;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "price", precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "area_sqft", precision = 10, scale = 2)
    private BigDecimal areaSqft;

    private Integer bedrooms;
    private Integer bathrooms;

    private Integer balconies; // 💡 NEW FIELD ADDED TO RESOLVE ERROR

    @Column(name = "amenities", columnDefinition = "TEXT")
    private String amenities;

    @Column(name = "status")
    private String status = "available";

    @Column(name = "listing_type")
    private String listingType = "sale";

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;
    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "owner_type")
    private String ownerType = "owner"; // "owner" or "broker"

    // Add getters and setters
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }

    public String getOwnerType() { return ownerType; }
    public void setOwnerType(String ownerType) { this.ownerType = ownerType; }
    @Column(name = "is_ready_to_move")
    private Boolean isReadyToMove = false;

    // Getter and Setter
    public Boolean getIsReadyToMove() {
        return isReadyToMove;
    }

    public void setIsReadyToMove(Boolean isReadyToMove) {
        this.isReadyToMove = isReadyToMove;
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

    // Constructors
    public Property() {}

    // ALL Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getPriceDisplay() { return priceDisplay; }
    public void setPriceDisplay(String priceDisplay) { this.priceDisplay = priceDisplay; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public PropertyType getPropertyType() { return propertyType; }
    public void setPropertyType(PropertyType propertyType) { this.propertyType = propertyType; }

    public Area getArea() { return area; }
    public void setArea(Area area) { this.area = area; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getAreaSqft() { return areaSqft; }
    public void setAreaSqft(BigDecimal areaSqft) { this.areaSqft = areaSqft; }

    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }

    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }

    // 💡 NEW GETTER/SETTER
    public Integer getBalconies() { return balconies; }
    public void setBalconies(Integer balconies) { this.balconies = balconies; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getListingType() { return listingType; }
    public void setListingType(String listingType) { this.listingType = listingType; }

    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}