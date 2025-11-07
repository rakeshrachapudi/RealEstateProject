package com.example.realestate.repository;

import com.example.realestate.model.BrokerSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BrokerSubscriptionRepository extends JpaRepository<BrokerSubscription, Long> {

    // Find active subscription for a broker
    @Query("SELECT s FROM BrokerSubscription s WHERE s.broker.id = :brokerId " +
            "AND s.status = 'ACTIVE' AND s.endDate > :now ORDER BY s.endDate DESC")
    Optional<BrokerSubscription> findActiveSubscriptionByBrokerId(
            @Param("brokerId") Long brokerId,
            @Param("now") LocalDateTime now
    );

    // Find all subscriptions for a broker
    List<BrokerSubscription> findByBrokerIdOrderByCreatedAtDesc(Long brokerId);

    // Find by Razorpay subscription ID
    Optional<BrokerSubscription> findByRazorpaySubscriptionId(String razorpaySubscriptionId);

    Optional<BrokerSubscription> findByRazorpayOrderId(String orderId);
    // Find expired subscriptions
    @Query("SELECT s FROM BrokerSubscription s WHERE s.status = 'ACTIVE' AND s.endDate < :now")
    List<BrokerSubscription> findExpiredSubscriptions(@Param("now") LocalDateTime now);

    // Count active brokers
    @Query("SELECT COUNT(DISTINCT s.broker.id) FROM BrokerSubscription s " +
            "WHERE s.status = 'ACTIVE' AND s.endDate > :now")
    Long countActiveBrokers(@Param("now") LocalDateTime now);
}