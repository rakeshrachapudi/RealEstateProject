package com.example.realestate.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "deal_status")
public class DealStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ⭐ NEW: dealId for frontend compatibility
    @JsonProperty("dealId")
    public Long getDealId() {
        return this.id;
    }

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agent_id")
    private User agent;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false)
    private DealStage stage = DealStage.INQUIRY;

    // ⭐ NEW: currentStage alias for frontend
    @JsonProperty("currentStage")
    public DealStage getCurrentStage() {
        return this.stage;
    }

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // ⭐ NEW: Agreed Price
    @Column(name = "agreed_price", precision = 15, scale = 2)
    private BigDecimal agreedPrice;

    // ⭐ NEW: Document tracking
    @Column(name = "buyer_doc_url", columnDefinition = "TEXT")
    private String buyerDocUrl;

    @Column(name = "buyer_doc_uploaded")
    private Boolean buyerDocUploaded = false;

    // ⭐ NEW: Confirmation tracking
    @Column(name = "seller_confirmed")
    private Boolean sellerConfirmed = false;

    @Column(name = "admin_verified")
    private Boolean adminVerified = false;

    // ⭐ NEW: Payment tracking
    @Column(name = "payment_initiated")
    private Boolean paymentInitiated = false;

    @Column(name = "payment_completed")
    private Boolean paymentCompleted = false;

    // ⭐ NEW: Stage-specific timestamps
    @Column(name = "inquiry_date")
    private LocalDateTime inquiryDate;

    @Column(name = "shortlist_date")
    private LocalDateTime shortlistDate;

    @Column(name = "negotiation_date")
    private LocalDateTime negotiationDate;

    @Column(name = "agreement_date")
    private LocalDateTime agreementDate;

    @Column(name = "registration_date")
    private LocalDateTime registrationDate;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "completed_date")
    private LocalDateTime completedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "last_updated_by")
    private String lastUpdatedBy;

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

        public int getOrder() { return order; }
        public String getLabel() { return label; }
    }

    // ==================== JPA CALLBACKS ====================
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        inquiryDate = LocalDateTime.now(); // Set inquiry date on creation
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
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Property getProperty() { return property; }
    public void setProperty(Property property) { this.property = property; }

    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }

    public User getAgent() { return agent; }
    public void setAgent(User agent) { this.agent = agent; }

    public DealStage getStage() { return stage; }
    public void setStage(DealStage stage) { this.stage = stage; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public BigDecimal getAgreedPrice() { return agreedPrice; }
    public void setAgreedPrice(BigDecimal agreedPrice) { this.agreedPrice = agreedPrice; }

    public String getBuyerDocUrl() { return buyerDocUrl; }
    public void setBuyerDocUrl(String buyerDocUrl) { this.buyerDocUrl = buyerDocUrl; }

    public Boolean getBuyerDocUploaded() { return buyerDocUploaded; }
    public void setBuyerDocUploaded(Boolean buyerDocUploaded) { this.buyerDocUploaded = buyerDocUploaded; }

    public Boolean getSellerConfirmed() { return sellerConfirmed; }
    public void setSellerConfirmed(Boolean sellerConfirmed) { this.sellerConfirmed = sellerConfirmed; }

    public Boolean getAdminVerified() { return adminVerified; }
    public void setAdminVerified(Boolean adminVerified) { this.adminVerified = adminVerified; }

    public Boolean getPaymentInitiated() { return paymentInitiated; }
    public void setPaymentInitiated(Boolean paymentInitiated) { this.paymentInitiated = paymentInitiated; }

    public Boolean getPaymentCompleted() { return paymentCompleted; }
    public void setPaymentCompleted(Boolean paymentCompleted) { this.paymentCompleted = paymentCompleted; }

    public LocalDateTime getInquiryDate() { return inquiryDate; }
    public void setInquiryDate(LocalDateTime inquiryDate) { this.inquiryDate = inquiryDate; }

    public LocalDateTime getShortlistDate() { return shortlistDate; }
    public void setShortlistDate(LocalDateTime shortlistDate) { this.shortlistDate = shortlistDate; }

    public LocalDateTime getNegotiationDate() { return negotiationDate; }
    public void setNegotiationDate(LocalDateTime negotiationDate) { this.negotiationDate = negotiationDate; }

    public LocalDateTime getAgreementDate() { return agreementDate; }
    public void setAgreementDate(LocalDateTime agreementDate) { this.agreementDate = agreementDate; }

    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }

    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }

    public LocalDateTime getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDateTime completedDate) { this.completedDate = completedDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getLastUpdatedBy() { return lastUpdatedBy; }
    public void setLastUpdatedBy(String lastUpdatedBy) { this.lastUpdatedBy = lastUpdatedBy; }

    @Override
    public String toString() {
        return "DealStatus{" +
                "id=" + id +
                ", stage=" + stage +
                ", buyerDocUploaded=" + buyerDocUploaded +
                ", sellerConfirmed=" + sellerConfirmed +
                ", paymentCompleted=" + paymentCompleted +
                ", createdAt=" + createdAt +
                '}';
    }
}