package com.example.realestate.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "deal_status")
public class DealStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agent_id")
    private User agent; // Agent assigned to this deal

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false)
    private DealStage stage = DealStage.INQUIRY;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_updated_by")
    private String lastUpdatedBy; // Username of who updated

    // ==================== ENUM: Deal Stages ====================
    public enum DealStage {
        INQUIRY(1, "🔍 Inquiry"),
        SHORTLIST(2, "⭐ Shortlist"),
        NEGOTIATION(3, "💬 Negotiation"),
        AGREEMENT(4, "✅ Agreement"),
        REGISTRATION(5, "📋 Registration"),
        PAYMENT(6, "💰 Payment"),
        COMPLETED(7, "🎉 Completed");

        private final int order;
        private final String label;

        DealStage(int order, String label) {
            this.order = order;
            this.label = label;
        }

        public int getOrder() {
            return order;
        }

        public String getLabel() {
            return label;
        }
    }

    // ==================== JPA CALLBACKS ====================
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ==================== CONSTRUCTORS ====================
    public DealStatus() {}

    public DealStatus(Property property, User buyer) {
        this.property = property;
        this.buyer = buyer;
        this.stage = DealStage.INQUIRY;
    }

    public DealStatus(Property property, User buyer, User agent) {
        this.property = property;
        this.buyer = buyer;
        this.agent = agent;
        this.stage = DealStage.INQUIRY;
    }

    // ==================== GETTERS & SETTERS ====================
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Property getProperty() {
        return property;
    }

    public void setProperty(Property property) {
        this.property = property;
    }

    public User getBuyer() {
        return buyer;
    }

    public void setBuyer(User buyer) {
        this.buyer = buyer;
    }

    public User getAgent() {
        return agent;
    }

    public void setAgent(User agent) {
        this.agent = agent;
    }

    public DealStage getStage() {
        return stage;
    }

    public void setStage(DealStage stage) {
        this.stage = stage;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getLastUpdatedBy() {
        return lastUpdatedBy;
    }

    public void setLastUpdatedBy(String lastUpdatedBy) {
        this.lastUpdatedBy = lastUpdatedBy;
    }

    // ==================== HELPER METHODS ====================
    public String getStageLable() {
        return this.stage.getLabel();
    }

    public int getStageOrder() {
        return this.stage.getOrder();
    }

    @Override
    public String toString() {
        return "DealStatus{" +
                "id=" + id +
                ", property=" + property.getId() +
                ", buyer=" + buyer.getUsername() +
                ", agent=" + (agent != null ? agent.getUsername() : "null") +
                ", stage=" + stage +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}