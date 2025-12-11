import React, { useState, useEffect } from "react";
import axios from "axios";
import "./BrokerSubscriptionModal.css";

const BrokerSubscriptionModal = ({
  isOpen,
  onClose,
  brokerId,
  onSubscriptionSuccess,
}) => {
  const [activeTab, setActiveTab] = useState("plans"); // 'plans' or 'coupon'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponValidation, setCouponValidation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  // Load Razorpay script helper
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        console.log("✅ Razorpay already loaded");
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        console.log("✅ Razorpay script loaded successfully");
        resolve(true);
      };
      script.onerror = () => {
        console.error("❌ Failed to load Razorpay script");
        reject(new Error("Failed to load Razorpay"));
      };
      document.body.appendChild(script);
    });
  };

  // Load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript().catch(console.error);
  }, []);

  // Subscription plans
  const plans = {
    MONTHLY: {
      name: "Monthly Plan",
      price: 1999,
      duration: "1 month",
      features: [
        "Post up to 50 properties",
        "Direct buyer contact",
        "Priority support",
        "Analytics dashboard",
      ],
      savings: null,
    },
    QUARTERLY: {
      name: "Quarterly Plan",
      price: 4999,
      duration: "3 months",
      features: [
        "Post up to 50 properties per month",
        "Direct buyer contact",
        "Priority support",
        "Analytics dashboard",
        "Save ₹998",
      ],
      savings: "17% OFF",
    },
    YEARLY: {
      name: "Yearly Plan",
      price: 9999,
      duration: "12 months",
      features: [
        "Post up to 50 properties per month",
        "Direct buyer contact",
        "Priority support",
        "Analytics dashboard",
        "Save ₹13,989",
      ],
      savings: "58% OFF",
    },
  };

  useEffect(() => {
    if (isOpen && brokerId) {
      fetchSubscriptionStatus();
    }
  }, [isOpen, brokerId]);

  // Fetch current subscription status
  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/broker-subscription/status/${brokerId}`
      );
      setSubscriptionStatus(response.data.data);
    } catch (error) {
      console.error("Error fetching subscription status:", error);
    }
  };

  // Validate coupon code
  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError("");
    setCouponValidation(null);

    try {
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/broker-subscription/validate-coupon`,
        {
          brokerId: brokerId,
          couponCode: couponCode.trim(),
        }
      );

      if (response.data.data.valid) {
        setCouponValidation({
          valid: true,
          message: response.data.data.message,
          coupon: response.data.data.coupon,
        });
      } else {
        setError(response.data.data.message);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  // Apply coupon and activate free trial (NO PAYMENT GATEWAY CALL - AMOUNT IS ZERO)
  const applyCoupon = async () => {
    if (!couponValidation?.valid) {
      setError("Please validate the coupon first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ✅ FREE TRIAL - Direct activation without Razorpay
      // Amount is ₹0, so we skip payment gateway entirely
      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/broker-subscription/apply-coupon`,
        {
          brokerId: brokerId,
          couponCode: couponCode.trim(),
        }
      );

      // Success - Free trial activated!
      alert(
        "🎉 " +
          response.data.data.message +
          "\n\n✅ No payment required - Your free trial is active!"
      );

      if (onSubscriptionSuccess) {
        onSubscriptionSuccess(response.data.data.subscription);
      }

      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to apply coupon");
    } finally {
      setLoading(false);
    }
  };

  // Handle PAID subscription purchase (Amount > ₹0 - Razorpay payment gateway)
  const handlePurchase = async (planType) => {
    setLoading(true);
    setError("");

    try {
      // Step 0: Ensure Razorpay script is loaded
      console.log("Step 0: Loading Razorpay script...");
      await loadRazorpayScript();

      // Step 1: Create subscription order with Razorpay
      console.log("Step 1: Creating order for plan:", planType);

      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/broker-subscription/create-paid`,
        {
          brokerId: brokerId,
          planType: planType,
        }
      );

      console.log("Full API Response:", response.data);

      const orderData = response.data.data;
      console.log("Order Data:", orderData);

      // ✅ FIX: Handle both possible field names from backend
      // Backend may return 'orderId' or 'razorpayOrderId'
      const razorpayOrderId = orderData.razorpayOrderId || orderData.orderId;
      const razorpayKeyId = orderData.razorpayKeyId || orderData.keyId;
      // Backend returns amount in RUPEES (e.g., 499), Razorpay needs PAISE (e.g., 49900)
      const amountInPaise = Math.round(Number(orderData.amount) * 100);
      const currency = orderData.currency || "INR";

      // ✅ Validate required fields before opening Razorpay
      if (!razorpayOrderId) {
        console.error("Missing Razorpay Order ID in response:", orderData);
        setError("Payment order created but missing order ID. Please try again.");
        setLoading(false);
        return;
      }

      if (!razorpayKeyId) {
        console.error("Missing Razorpay Key ID in response:", orderData);
        setError("Payment configuration error. Please contact support.");
        setLoading(false);
        return;
      }

      if (!amountInPaise || amountInPaise <= 0) {
        console.error("Invalid amount in response:", orderData);
        setError("Invalid payment amount. Please try again.");
        setLoading(false);
        return;
      }

      // Check if Razorpay script is loaded (should be loaded by now)
      if (typeof window.Razorpay === "undefined") {
        console.error("❌ Razorpay is still undefined after script load attempt");
        setError("Payment gateway failed to load. Please refresh the page and try again.");
        setLoading(false);
        return;
      }

      console.log("Step 2: Razorpay is available, initializing payment...");

      console.log("Initializing Razorpay with:", {
        key: razorpayKeyId,
        amount: amountInPaise,
        order_id: razorpayOrderId,
        currency: currency
      });

      // Step 2: Initialize Razorpay
      const options = {
        key: razorpayKeyId,
        amount: amountInPaise, // Amount in paise (₹499 = 49900 paise)
        currency: currency,
        name: "Property Dealz",
        description: `${plans[planType].name} Subscription`,
        order_id: razorpayOrderId,
        prefill: {
          name: orderData.brokerName || "",
          email: orderData.brokerEmail || "",
          contact: orderData.brokerPhone || "",
        },
        theme: {
          color: "#667eea",
        },
        handler: async function (response) {
          // Payment successful - verify on backend
          console.log("Payment success response:", response);
          await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError("Payment cancelled by user");
          },
        },
      };

      console.log("Step 3: Creating Razorpay instance with options:", options);

      let razorpay;
      try {
        razorpay = new window.Razorpay(options);
      } catch (razorpayError) {
        console.error("❌ Error creating Razorpay instance:", razorpayError);
        setError("Failed to initialize payment gateway: " + razorpayError.message);
        setLoading(false);
        return;
      }

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        setError(response.error.description || "Payment failed. Please try again.");
        setLoading(false);
      });

      console.log("Step 4: Opening Razorpay modal...");
      razorpay.open();
      console.log("✅ Razorpay modal opened");
    } catch (error) {
      console.error("Error in handlePurchase:", error);
      console.error("Error response:", error.response?.data);
      setError(
        error.response?.data?.message || error.message || "Failed to create payment order. Please try again."
      );
      setLoading(false);
    }
  };

  const verifyPayment = async (orderId, paymentId, signature) => {
    try {
      console.log("Verifying payment:", { orderId, paymentId, signature });

      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_BASE_URL
        }/api/broker-subscription/verify-payment`,
        {
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
        }
      );

      console.log("Payment verification response:", response.data);

      alert("🎉 " + response.data.data.message);

      if (onSubscriptionSuccess) {
        onSubscriptionSuccess(response.data.data.subscription);
      }

      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Payment verification error:", error);
      setError(error.response?.data?.message || "Payment verification failed");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="subscription-modal-overlay" onClick={onClose}>
      <div className="subscription-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="subscription-modal-header">
          <h2>Choose Your Subscription Plan</h2>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Current Status */}
        {subscriptionStatus?.hasActiveSubscription && (
          <div className="current-subscription-banner">
            <div className="subscription-info">
              <span className="status-badge active">Active</span>
              <span className="plan-name">
                {subscriptionStatus.planType} Plan
              </span>
              <span className="days-remaining">
                {subscriptionStatus.daysRemaining} days remaining
              </span>
            </div>
            <div className="usage-info">
              {subscriptionStatus.propertiesPosted} /{" "}
              {subscriptionStatus.maxProperties} properties posted
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="subscription-tabs">
          <button
            className={`tab-btn ${activeTab === "plans" ? "active" : ""}`}
            onClick={() => setActiveTab("plans")}
          >
            📋 Subscription Plans
          </button>
          <button
            className={`tab-btn ${activeTab === "coupon" ? "active" : ""}`}
            onClick={() => setActiveTab("coupon")}
          >
            🎟️ Have a Coupon?
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Content */}
        <div className="subscription-modal-content">
          {activeTab === "plans" ? (
            // Subscription Plans
            <div className="plans-grid">
              {Object.entries(plans).map(([key, plan]) => (
                <div
                  key={key}
                  className={`plan-card ${
                    selectedPlan === key ? "selected" : ""
                  } ${key === "YEARLY" ? "popular" : ""}`}
                >
                  {key === "YEARLY" && (
                    <div className="popular-badge">Most Popular</div>
                  )}
                  {plan.savings && (
                    <div className="savings-badge">{plan.savings}</div>
                  )}

                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="currency">₹</span>
                    <span className="amount">{plan.price}</span>
                    <span className="duration">/{plan.duration}</span>
                  </div>

                  <ul className="plan-features">
                    {plan.features.map((feature, index) => (
                      <li key={index}>
                        <span className="check-icon">✔</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="plan-btn"
                    onClick={() => handlePurchase(key)}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Choose Plan"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            // Coupon Section
            <div className="coupon-section">
              <div className="coupon-info-box">
                <h3>🎁 Activate Free Trial with Coupon</h3>
                <p>
                  Have a coupon code? Enter it below to activate your free trial
                  subscription!
                </p>
              </div>

              <div className="coupon-input-group">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  disabled={loading || couponValidation?.valid}
                  className="coupon-input"
                />
                <button
                  onClick={validateCoupon}
                  disabled={
                    loading || couponValidation?.valid || !couponCode.trim()
                  }
                  className="validate-btn"
                >
                  {loading ? "Validating..." : "Validate"}
                </button>
              </div>

              {/* Coupon Validation Result */}
              {couponValidation?.valid && (
                <div className="coupon-valid-box">
                  <div className="valid-header">
                    <span className="success-icon">✔</span>
                    <span className="valid-text">Coupon Valid!</span>
                  </div>

                  <div className="coupon-details">
                    <p className="coupon-description">
                      {couponValidation.coupon.description}
                    </p>

                    {/* ✅ FREE TRIAL INDICATOR */}
                    <div className="free-trial-badge">
                      <span className="badge-icon">🎁</span>
                      <span className="badge-text">
                        100% FREE - No Payment Required
                      </span>
                    </div>

                    <div className="trial-info">
                      <strong>Free Trial Duration:</strong>{" "}
                      {couponValidation.coupon.trialMonths} months
                    </div>
                    <div className="valid-until">
                      <strong>Coupon Valid Until:</strong>{" "}
                      {new Date(
                        couponValidation.coupon.validUntil
                      ).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={applyCoupon}
                    disabled={loading}
                    className="apply-coupon-btn"
                  >
                    {loading
                      ? "Activating..."
                      : "🎉 Activate Free Trial (No Payment)"}
                  </button>
                </div>
              )}

              <div className="coupon-help">
                <p>
                  💡 <strong>Don't have a coupon?</strong>
                </p>
                <p>
                  Contact our team or check your email for exclusive offers!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="subscription-modal-footer">
          <p className="footer-note">
            🔒 Secure payment powered by Razorpay • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrokerSubscriptionModal;