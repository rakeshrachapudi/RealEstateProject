package com.example.realestate.repository;

import com.example.realestate.model.BrokerCouponUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrokerCouponUsageRepository extends JpaRepository<BrokerCouponUsage, Long> {

    // Check if broker has used a coupon
    boolean existsByBrokerIdAndCouponId(Long brokerId, Long couponId);

    // Find usage by broker and coupon
    Optional<BrokerCouponUsage> findByBrokerIdAndCouponId(Long brokerId, Long couponId);

    // Find all usages by broker
    List<BrokerCouponUsage> findByBrokerIdOrderByUsedAtDesc(Long brokerId);

    // Find all usages for a coupon
    List<BrokerCouponUsage> findByCouponIdOrderByUsedAtDesc(Long couponId);
}