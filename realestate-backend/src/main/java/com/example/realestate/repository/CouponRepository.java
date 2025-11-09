package com.example.realestate.repository;

import com.example.realestate.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCouponCode(String couponCode);

    @Query("SELECT c FROM Coupon c WHERE c.couponCode = :couponCode " +
            "AND c.isActive = true " +
            "AND (c.validFrom IS NULL OR c.validFrom <= :now) " +
            "AND (c.validUntil IS NULL OR c.validUntil > :now) " +
            "AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)")
    Optional<Coupon> findValidCouponByCode(String couponCode, LocalDateTime now);

    @Query("SELECT c FROM Coupon c WHERE c.isActive = true " +
            "AND (c.validFrom IS NULL OR c.validFrom <= :now) " +
            "AND (c.validUntil IS NULL OR c.validUntil > :now) " +
            "AND (c.usageLimit IS NULL OR c.usedCount < c.usageLimit)")
    List<Coupon> findAllActiveCoupons(LocalDateTime now);

    List<Coupon> findByIsActiveTrue();

    boolean existsByCouponCode(String couponCode);
}