package com.example.realestate.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "broker_coupon_usage")
public class BrokerCouponUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "broker_id", nullable = false)
    private User broker;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coupon_id", nullable = false)
    private BrokerCoupon coupon;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subscription_id")
    private BrokerSubscription subscription;

    @Column(nullable = false, updatable = false)
    private LocalDateTime usedAt = LocalDateTime.now();

    // Constructors
    public BrokerCouponUsage() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getBroker() { return broker; }
    public void setBroker(User broker) { this.broker = broker; }

    public BrokerCoupon getCoupon() { return coupon; }
    public void setCoupon(BrokerCoupon coupon) { this.coupon = coupon; }

    public BrokerSubscription getSubscription() { return subscription; }
    public void setSubscription(BrokerSubscription subscription) {
        this.subscription = subscription;
    }

    public LocalDateTime getUsedAt() { return usedAt; }
    public void setUsedAt(LocalDateTime usedAt) { this.usedAt = usedAt; }

    @PrePersist
    protected void onCreate() {
        usedAt = LocalDateTime.now();
    }
}