package com.example.realestate.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "price_requests")
public class PriceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER) // Eager fetch for simple display
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @Column(name = "interested_price")
    private BigDecimal interestedPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PriceRequestStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    // This field will store which agent accepted it
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_by_agent_id")
    private User acceptedBy;

    // --- Getters and Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }
    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }
    public BigDecimal getInterestedPrice() { return interestedPrice; }
    public void setInterestedPrice(BigDecimal interestedPrice) { this.interestedPrice = interestedPrice; }
    public PriceRequestStatus getStatus() { return status; }
    public void setStatus(PriceRequestStatus status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public User getAcceptedBy() { return acceptedBy; }
    public void setAcceptedBy(User acceptedBy) { this.acceptedBy = acceptedBy; }
}