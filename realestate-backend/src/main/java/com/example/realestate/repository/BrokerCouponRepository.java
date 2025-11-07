package com.example.realestate.repository;

import com.example.realestate.model.BrokerCoupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BrokerCouponRepository extends JpaRepository<BrokerCoupon, Long> {

    // Find by code
    Optional<BrokerCoupon> findByCodeIgnoreCase(String code);

    // Find valid coupons
    @Query("SELECT c FROM BrokerCoupon c WHERE c.isActive = true " +
            "AND c.usedCount < c.maxUses AND c.validFrom <= :now AND c.validUntil >= :now")
    List<BrokerCoupon> findValidCoupons(@Param("now") LocalDateTime now);

    // Check if code exists
    boolean existsByCodeIgnoreCase(String code);
}