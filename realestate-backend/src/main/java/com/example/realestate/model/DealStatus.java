package com.example.realestate.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "deal_status")
public class DealStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @ManyToOne
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne
    @JoinColumn(name = "agent_id")
    private User agent;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DealStage stage = DealStage.INQUIRY;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column
    private BigDecimal agreedPrice;

    @Column
    private String lastUpdatedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column
    private LocalDateTime updatedAt = LocalDateTime.now();

    // ==================== NEW: STAGE DATE FIELDS ====================
    @Column
    private LocalDateTime inquiryDate;

    @Column
    private LocalDateTime shortlistDate;

    @Column
    private LocalDateTime negotiationDate;

    @Column
    private LocalDateTime agreementDate;

    @Column
    private LocalDateTime registrationDate;

    @Column
    private LocalDateTime paymentDate;

    @Column
    private LocalDateTime completedDate;

    // ==================== STAGE ENUM ====================
    public enum DealStage {
        INQUIRY(1),
        SHORTLIST(2),
        NEGOTIATION(3),
        AGREEMENT(4),
        REGISTRATION(5),
        PAYMENT(6),
        COMPLETED(7);

        private final int order;

        DealStage(int order) {
            this.order = order;
        }

        public int getOrder() {
            return order;
        }
    }

    // ==================== CONSTRUCTORS ====================
    public DealStatus() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
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

    public BigDecimal getAgreedPrice() {
        return agreedPrice;
    }

    public void setAgreedPrice(BigDecimal agreedPrice) {
        this.agreedPrice = agreedPrice;
    }

    public String getLastUpdatedBy() {
        return lastUpdatedBy;
    }

    public void setLastUpdatedBy(String lastUpdatedBy) {
        this.lastUpdatedBy = lastUpdatedBy;
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

    // Stage Date Getters & Setters
    public LocalDateTime getInquiryDate() {
        return inquiryDate;
    }

    public void setInquiryDate(LocalDateTime inquiryDate) {
        this.inquiryDate = inquiryDate;
    }

    public LocalDateTime getShortlistDate() {
        return shortlistDate;
    }

    public void setShortlistDate(LocalDateTime shortlistDate) {
        this.shortlistDate = shortlistDate;
    }

    public LocalDateTime getNegotiationDate() {
        return negotiationDate;
    }

    public void setNegotiationDate(LocalDateTime negotiationDate) {
        this.negotiationDate = negotiationDate;
    }

    public LocalDateTime getAgreementDate() {
        return agreementDate;
    }

    public void setAgreementDate(LocalDateTime agreementDate) {
        this.agreementDate = agreementDate;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public LocalDateTime getCompletedDate() {
        return completedDate;
    }

    public void setCompletedDate(LocalDateTime completedDate) {
        this.completedDate = completedDate;
    }
}