package com.example.realestate.service;

import com.example.realestate.model.BrokerSubscription;
import com.example.realestate.model.BrokerCoupon;
import com.example.realestate.model.BrokerCouponUsage;
import com.example.realestate.model.User;
import com.example.realestate.repository.BrokerSubscriptionRepository;
import com.example.realestate.repository.BrokerCouponRepository;
import com.example.realestate.repository.BrokerCouponUsageRepository;
import com.example.realestate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class BrokerSubscriptionService {

    private static final Logger logger = LoggerFactory.getLogger(BrokerSubscriptionService.class);

    @Autowired
    private BrokerSubscriptionRepository subscriptionRepository;

    @Autowired
    private BrokerCouponRepository couponRepository;

    @Autowired
    private BrokerCouponUsageRepository couponUsageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RazorpayService razorpayService;

    // Subscription pricing
    private static final Map<String, BigDecimal> SUBSCRIPTION_PRICES = new HashMap<>() {{
        put("MONTHLY", new BigDecimal("499.00"));
        put("QUARTERLY", new BigDecimal("1299.00"));
        put("YEARLY", new BigDecimal("4999.00"));
    }};

    /**
     * Check if broker has active subscription
     */
    public boolean hasActiveSubscription(Long brokerId) {
        Optional<BrokerSubscription> activeSub = subscriptionRepository
                .findActiveSubscriptionByBrokerId(brokerId, LocalDateTime.now());
        return activeSub.isPresent() && activeSub.get().isActive();
    }

    /**
     * Get active subscription for broker
     */
    public Optional<BrokerSubscription> getActiveSubscription(Long brokerId) {
        return subscriptionRepository.findActiveSubscriptionByBrokerId(
                brokerId, LocalDateTime.now()
        );
    }

    /**
     * Apply coupon and create free trial subscription
     */
    @Transactional
    public BrokerSubscription applyCouponAndCreateTrial(Long brokerId, String couponCode) {
        logger.info("Applying coupon '{}' for broker ID: {}", couponCode, brokerId);

        // Validate broker
        User broker = userRepository.findById(brokerId)
                .orElseThrow(() -> new RuntimeException("Broker not found"));

        if (broker.getRole() != User.UserRole.BROKER) {
            throw new RuntimeException("User is not a broker");
        }

        // Check if broker already has active subscription
        if (hasActiveSubscription(brokerId)) {
            throw new RuntimeException("Broker already has an active subscription");
        }

        // Find and validate coupon
        BrokerCoupon coupon = couponRepository.findByCodeIgnoreCase(couponCode)
                .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

        if (!coupon.isValid()) {
            throw new RuntimeException("Coupon is not valid or has expired");
        }

        // Check if broker already used this coupon
        if (couponUsageRepository.existsByBrokerIdAndCouponId(brokerId, coupon.getId())) {
            throw new RuntimeException("Coupon already used by this broker");
        }

        // Create free trial subscription
        BrokerSubscription subscription = new BrokerSubscription();
        subscription.setBroker(broker);
        subscription.setPlanType(BrokerSubscription.PlanType.FREE_TRIAL);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(LocalDateTime.now().plusMonths(coupon.getTrialMonths()));
        subscription.setStatus(BrokerSubscription.SubscriptionStatus.ACTIVE);
        subscription.setAmount(BigDecimal.ZERO);
        subscription.setMaxProperties(50);
        subscription.setPropertiesPosted(0);

        BrokerSubscription savedSubscription = subscriptionRepository.save(subscription);

        // Record coupon usage
        BrokerCouponUsage usage = new BrokerCouponUsage();
        usage.setBroker(broker);
        usage.setCoupon(coupon);
        usage.setSubscription(savedSubscription);
        couponUsageRepository.save(usage);

        // Update coupon used count
        coupon.setUsedCount(coupon.getUsedCount() + 1);
        couponRepository.save(coupon);

        logger.info("✅ Free trial subscription created for broker {} with coupon {}",
                brokerId, couponCode);

        return savedSubscription;
    }

    /**
     * Create paid subscription with Razorpay order
     */
    @Transactional
    public Map<String, Object> createPaidSubscription(Long brokerId, String planType) {
        logger.info("Creating paid subscription for broker: {}, Plan: {}", brokerId, planType);

        // Validate broker
        User broker = userRepository.findById(brokerId)
                .orElseThrow(() -> new RuntimeException("Broker not found"));

        if (broker.getRole() != User.UserRole.BROKER) {
            throw new RuntimeException("User is not a broker");
        }

        // Get plan price
        BigDecimal amount = SUBSCRIPTION_PRICES.get(planType.toUpperCase());
        if (amount == null) {
            throw new RuntimeException("Invalid plan type");
        }

        // Create Razorpay order
        String receipt = "BROKER_" + brokerId + "_" + System.currentTimeMillis();
        Map<String, String> notes = new HashMap<>();
        notes.put("broker_id", String.valueOf(brokerId));
        notes.put("plan_type", planType);
        notes.put("broker_email", broker.getEmail());

        Map<String, Object> razorpayOrder = razorpayService.createOrder(
                amount,
                "INR",
                receipt,
                notes
        );

        // Create pending subscription
        BrokerSubscription subscription = new BrokerSubscription();
        subscription.setBroker(broker);
        subscription.setPlanType(BrokerSubscription.PlanType.valueOf(planType.toUpperCase()));
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(calculateEndDate(planType));
        subscription.setStatus(BrokerSubscription.SubscriptionStatus.PENDING);
        subscription.setRazorpayOrderId(razorpayOrder.get("orderId").toString());
        subscription.setAmount(amount);
        subscription.setMaxProperties(50);
        subscription.setPropertiesPosted(0);

        BrokerSubscription savedSubscription = subscriptionRepository.save(subscription);

        // Prepare response with Razorpay details
        Map<String, Object> response = new HashMap<>();
        response.put("subscriptionId", savedSubscription.getId());
        response.put("razorpayOrderId", razorpayOrder.get("orderId"));
        response.put("amount", amount);
        response.put("currency", "INR");
        response.put("razorpayKeyId", razorpayService.getKeyId());
        response.put("brokerName", broker.getFirstName() + " " + broker.getLastName());
        response.put("brokerEmail", broker.getEmail());
        response.put("brokerPhone", broker.getMobileNumber());

        logger.info("✅ Pending subscription created with Razorpay order ID: {}",
                razorpayOrder.get("orderId"));

        return response;
    }

    /**
     * Verify and activate subscription after payment
     */
    @Transactional
    public BrokerSubscription verifyAndActivateSubscription(
            String orderId,
            String paymentId,
            String signature) {

        logger.info("Verifying and activating subscription - Order ID: {}", orderId);

        // Verify signature
        boolean isValid = razorpayService.verifyPaymentSignature(orderId, paymentId, signature);
        if (!isValid) {
            throw new RuntimeException("Invalid payment signature");
        }

        // Find subscription by order ID
        BrokerSubscription subscription = subscriptionRepository.findByRazorpayOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Subscription not found for order"));

        // Update subscription status
        subscription.setStatus(BrokerSubscription.SubscriptionStatus.ACTIVE);
        subscription.setRazorpayPaymentId(paymentId);
        subscription.setStartDate(LocalDateTime.now());
        subscription.setEndDate(calculateEndDate(subscription.getPlanType().name()));

        BrokerSubscription activatedSubscription = subscriptionRepository.save(subscription);

        logger.info("✅ Subscription activated for broker: {}",
                subscription.getBroker().getId());

        return activatedSubscription;
    }

    /**
     * Handle payment failure
     */
    @Transactional
    public void handlePaymentFailure(String orderId, String reason) {
        logger.warn("Payment failed for order: {}, Reason: {}", orderId, reason);

        Optional<BrokerSubscription> subscriptionOpt =
                subscriptionRepository.findByRazorpayOrderId(orderId);

        if (subscriptionOpt.isPresent()) {
            BrokerSubscription subscription = subscriptionOpt.get();
            subscription.setStatus(BrokerSubscription.SubscriptionStatus.CANCELLED);
            subscriptionRepository.save(subscription);
            logger.info("Subscription cancelled for order: {}", orderId);
        }
    }

    /**
     * Calculate end date based on plan type
     */
    private LocalDateTime calculateEndDate(String planType) {
        LocalDateTime now = LocalDateTime.now();
        return switch (planType.toUpperCase()) {
            case "MONTHLY" -> now.plusMonths(1);
            case "QUARTERLY" -> now.plusMonths(3);
            case "YEARLY" -> now.plusYears(1);
            default -> now.plusMonths(1);
        };
    }

    /**
     * Validate coupon code
     */
    public Map<String, Object> validateCoupon(Long brokerId, String couponCode) {
        Map<String, Object> result = new HashMap<>();

        try {
            BrokerCoupon coupon = couponRepository.findByCodeIgnoreCase(couponCode)
                    .orElseThrow(() -> new RuntimeException("Coupon not found"));

            if (!coupon.isValid()) {
                result.put("valid", false);
                result.put("message", "Coupon is expired or not active");
                return result;
            }

            if (couponUsageRepository.existsByBrokerIdAndCouponId(brokerId, coupon.getId())) {
                result.put("valid", false);
                result.put("message", "You have already used this coupon");
                return result;
            }

            result.put("valid", true);
            result.put("message", "Coupon is valid");
            result.put("coupon", Map.of(
                    "code", coupon.getCode(),
                    "description", coupon.getDescription(),
                    "discountType", coupon.getDiscountType().name(),
                    "trialMonths", coupon.getTrialMonths(),
                    "validUntil", coupon.getValidUntil()
            ));

            return result;

        } catch (Exception e) {
            result.put("valid", false);
            result.put("message", e.getMessage());
            return result;
        }
    }

    /**
     * Get subscription price
     */
    public BigDecimal getSubscriptionPrice(String planType) {
        return SUBSCRIPTION_PRICES.getOrDefault(planType.toUpperCase(), BigDecimal.ZERO);
    }

    /**
     * Get all subscription plans
     */
    public Map<String, Object> getAllPlans() {
        Map<String, Object> plans = new HashMap<>();

        plans.put("MONTHLY", Map.of(
                "name", "Monthly Plan",
                "price", SUBSCRIPTION_PRICES.get("MONTHLY"),
                "duration", "1 month",
                "maxProperties", 50,
                "features", List.of(
                        "Post up to 50 properties",
                        "Direct buyer contact",
                        "Priority support",
                        "Analytics dashboard"
                )
        ));

        plans.put("QUARTERLY", Map.of(
                "name", "Quarterly Plan",
                "price", SUBSCRIPTION_PRICES.get("QUARTERLY"),
                "duration", "3 months",
                "maxProperties", 50,
                "savings", "13% OFF",
                "features", List.of(
                        "Post up to 50 properties per month",
                        "Direct buyer contact",
                        "Priority support",
                        "Analytics dashboard",
                        "Save ₹198"
                )
        ));

        plans.put("YEARLY", Map.of(
                "name", "Yearly Plan",
                "price", SUBSCRIPTION_PRICES.get("YEARLY"),
                "duration", "12 months",
                "maxProperties", 50,
                "savings", "17% OFF",
                "features", List.of(
                        "Post up to 50 properties per month",
                        "Direct buyer contact",
                        "Priority support",
                        "Analytics dashboard",
                        "Save ₹1,000"
                )
        ));

        return plans;
    }

    /**
     * Increment properties posted count
     */
    @Transactional
    public void incrementPropertiesPosted(Long brokerId) {
        Optional<BrokerSubscription> activeSub = getActiveSubscription(brokerId);
        if (activeSub.isPresent()) {
            BrokerSubscription sub = activeSub.get();
            sub.setPropertiesPosted(sub.getPropertiesPosted() + 1);
            subscriptionRepository.save(sub);
            logger.info("Incremented properties posted for broker {}. Total: {}",
                    brokerId, sub.getPropertiesPosted());
        }
    }

    /**
     * Check if broker can post property
     */
    public boolean canPostProperty(Long brokerId) {
        Optional<BrokerSubscription> activeSub = getActiveSubscription(brokerId);
        if (activeSub.isEmpty()) {
            return false;
        }

        BrokerSubscription sub = activeSub.get();
        return sub.getPropertiesPosted() < sub.getMaxProperties();
    }

    /**
     * Get broker subscription status
     */
    public Map<String, Object> getSubscriptionStatus(Long brokerId) {
        Map<String, Object> status = new HashMap<>();

        Optional<BrokerSubscription> activeSub = getActiveSubscription(brokerId);

        if (activeSub.isPresent()) {
            BrokerSubscription sub = activeSub.get();
            status.put("hasActiveSubscription", true);
            status.put("planType", sub.getPlanType().name());
            status.put("startDate", sub.getStartDate());
            status.put("endDate", sub.getEndDate());
            status.put("propertiesPosted", sub.getPropertiesPosted());
            status.put("maxProperties", sub.getMaxProperties());
            status.put("remainingProperties", sub.getMaxProperties() - sub.getPropertiesPosted());
            status.put("daysRemaining", java.time.temporal.ChronoUnit.DAYS.between(
                    LocalDateTime.now(), sub.getEndDate()
            ));
        } else {
            status.put("hasActiveSubscription", false);
            status.put("message", "No active subscription");
        }

        return status;
    }

    /**
     * Expire old subscriptions (scheduled task - runs daily at 2 AM)
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void expireOldSubscriptions() {
        logger.info("🔄 Running scheduled task to expire old subscriptions");

        List<BrokerSubscription> expiredSubs = subscriptionRepository
                .findExpiredSubscriptions(LocalDateTime.now());

        for (BrokerSubscription sub : expiredSubs) {
            sub.setStatus(BrokerSubscription.SubscriptionStatus.EXPIRED);
            subscriptionRepository.save(sub);
            logger.info("Expired subscription ID: {} for broker: {}",
                    sub.getId(), sub.getBroker().getId());
        }

        logger.info("✅ Expired {} subscriptions", expiredSubs.size());
    }
}