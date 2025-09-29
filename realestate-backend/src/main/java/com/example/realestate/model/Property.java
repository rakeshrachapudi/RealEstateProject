package com.example.realestate.model;

import jakarta.persistence.*;

@Entity
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String type;
    private String city;
    private String imageUrl;
    private String priceDisplay;

    @Column(columnDefinition = "TEXT")
    private String description;

    // --- NEW FIELDS ---
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer balconies;
    private Double expectedPrice;

    // --- RELATIONSHIP WITH USER ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;


    // --- GETTERS AND SETTERS FOR ALL FIELDS ---

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
    public Integer getBedrooms() { return bedrooms; }
    public void setBedrooms(Integer bedrooms) { this.bedrooms = bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public void setBathrooms(Integer bathrooms) { this.bathrooms = bathrooms; }
    public Integer getBalconies() { return balconies; }
    public void setBalconies(Integer balconies) { this.balconies = balconies; }
    public Double getExpectedPrice() { return expectedPrice; }
    public void setExpectedPrice(Double expectedPrice) { this.expectedPrice = expectedPrice; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}
