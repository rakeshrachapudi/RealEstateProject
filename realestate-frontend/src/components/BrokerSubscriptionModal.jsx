import React, { useState, useEffect } from "react";
import { BACKEND_BASE_URL } from "../config/config";
import "./BrokerSubscriptionModal.css";

const BrokerSubscriptionModal = ({ brokerId, onClose, onSubscriptionActivated }) => {
  const [view, setView] = useState("check"); // check, coupon, plans, active
  const [couponCode, setCouponCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [couponInfo, setCouponInfo] = useState(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [plans, setPlans] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [brokerId]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/broker-subscription/status/${brokerId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setSubscriptionStatus(data.data);
        if (data.data.hasActiveSubscription) {
          setView("active");
        }
      }
    } catch (err) {
      console.error("Error fetching subscription status:", err);
    }
  };

  const fetchPlans = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/broker-subscription/plans`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setValidating(true);
    setError(null);
    setCouponInfo(null);

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/broker-subscription/validate-coupon`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            brokerId: brokerId,
            couponCode: couponCode.trim().toUpperCase(),
          }),
        }
      );

      const data = await response.json();

      if (data.success && data.data.valid) {
        setCouponInfo(data.data.coupon);
        setSuccess("✅ Coupon is valid!");
      } else {
        setError(data.data.message || "Invalid coupon code");
      }
    } catch (err) {
      setError("Error validating coupon. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Please enter a coupon code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/broker-subscription/apply-coupon`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            brokerId: brokerId,
            couponCode: couponCode.trim().toUpperCase(),
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("🎉 Subscription activated successfully!");
        setTimeout(() => {
          onSubscriptionActivated && onSubscriptionActivated();
          onClose && onClose();
        }, 2000);
      } else {
        setError(data.message || "Failed to apply coupon");
      }
    } catch (err) {
      setError("Error applying coupon. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planType) => {
    setLoading(true);
    setError(null);

    try {
      // Create subscription and get Razorpay order
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/broker-subscription/create-paid`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            brokerId: brokerId,
            planType: planType,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        const orderData = data.data;

        // Initialize Razorpay checkout
        const options = {
          key: orderData.razorpayKeyId,
          amount: orderData.amount * 100, // Convert to paise
          currency: orderData.currency,
          name: "PropertyDealz",
          description: `${planType} Subscription`,
          order_id: orderData.razorpayOrderId,
          handler: async function (response) {
            await verifyPayment(response);
          },
          prefill: {
            name: orderData.brokerName,
            email: orderData.brokerEmail,
            contact: orderData.brokerPhone,
          },
          theme: {
            color: "#667eea",
          },
          modal: {
            ondismiss: function() {
              setLoading(false);
              setError("Payment cancelled");
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        setError(data.message || "Failed to create subscription");
      }
    } catch (err) {
      setError("Error creating subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentResponse) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/broker-subscription/verify-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(paymentResponse),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("🎉 Payment successful! Your subscription is now active.");
        setTimeout(() => {
          onSubscriptionActivated && onSubscriptionActivated();
          onClose && onClose();
        }, 2000);
      } else {
        setError(data.message || "Payment verification failed");
      }
    } catch (err) {
      setError("Error verifying payment. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("bsm-backdrop")) {
      onClose && onClose();
    }
  };

  const renderCheckView = () => (
    <>
      <h2 className="bsm-title">🏢 Broker Subscription Required</h2>
      <p className="bsm-desc">
        To post properties, you need an active broker subscription.
        Choose how you'd like to proceed:
      </p>

      {error && <div className="bsm-alert error">{error}</div>}

      <div className="bsm-options">
        <button
          onClick={() => setView("coupon")}
          className="bsm-option-card"
          disabled={loading}
        >
          <div className="bsm-option-icon">🎟️</div>
          <h3>Have a Coupon?</h3>
          <p>Get 3 months free trial</p>
        </button>

        <button
          onClick={() => {
            fetchPlans();
            setView("plans");
          }}
          className="bsm-option-card"
          disabled={loading}
        >
          <div className="bsm-option-icon">💳</div>
          <h3>Buy Subscription</h3>
          <p>View pricing plans</p>
        </button>
      </div>
    </>
  );

  const renderCouponView = () => (
    <>
      <button onClick={() => setView("check")} className="bsm-back">
        ← Back
      </button>

      <h2 className="bsm-title">🎟️ Apply Coupon Code</h2>
      <p className="bsm-desc">
        Enter your coupon code to activate your free trial subscription.
      </p>

      {error && <div className="bsm-alert error">{error}</div>}
      {success && <div className="bsm-alert success">{success}</div>}

      {couponInfo && (
        <div className="bsm-coupon-info">
          <h4>✅ {couponInfo.description}</h4>
          <p>
            You will get <strong>{couponInfo.trialMonths} months</strong> free trial!
          </p>
        </div>
      )}

      <div className="bsm-input-group">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => {
            setCouponCode(e.target.value.toUpperCase());
            setError(null);
            setSuccess(null);
            setCouponInfo(null);
          }}
          placeholder="Enter Coupon Code (e.g., BROKER3FREE)"
          className="bsm-input"
          disabled={loading}
        />
        <button
          onClick={handleValidateCoupon}
          className="bsm-btn bsm-btn-secondary"
          disabled={validating || loading}
        >
          {validating ? "⏳" : "Validate"}
        </button>
      </div>

      <button
        onClick={handleApplyCoupon}
        className="bsm-btn bsm-btn-primary"
        disabled={loading || !couponInfo}
      >
        {loading ? "⏳ Activating..." : "🎉 Activate Free Trial"}
      </button>

      <div className="bsm-footer">
        <p className="bsm-hint">
          💡 <strong>Pro Tip:</strong> Use code <code>BROKER3FREE</code> for 3 months free!
        </p>
      </div>
    </>
  );

  const renderPlansView = () => (
    <>
      <button onClick={() => setView("check")} className="bsm-back">
        ← Back
      </button>

      <h2 className="bsm-title">💎 Choose Your Plan</h2>
      <p className="bsm-desc">Select the subscription plan that works best for you</p>

      {error && <div className="bsm-alert error">{error}</div>}

      <div className="bsm-plans">
        {plans && Object.entries(plans).map(([key, plan]) => (
          <div key={key} className="bsm-plan-card">
            {plan.savings && (
              <div className="bsm-plan-badge">{plan.savings}</div>
            )}
            <h3>{plan.name}</h3>
            <div className="bsm-plan-price">
              ₹{plan.price}
              <span>/{plan.duration}</span>
            </div>
            <ul className="bsm-plan-features">
              {plan.features.map((feature, idx) => (
                <li key={idx}>✓ {feature}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSelectPlan(key)}
              className="bsm-btn bsm-btn-primary"
              disabled={loading}
            >
              {loading ? "⏳ Processing..." : "Select Plan"}
            </button>
          </div>
        ))}
      </div>
    </>
  );

  const renderActiveView = () => (
    <>
      <h2 className="bsm-title">✅ Active Subscription</h2>

      <div className="bsm-active-info">
        <div className="bsm-badge success">Active</div>

        <div className="bsm-info">
          <div className="bsm-info-row">
            <span>Plan:</span>
            <strong>{subscriptionStatus?.planType}</strong>
          </div>
          <div className="bsm-info-row">
            <span>Properties Posted:</span>
            <strong>
              {subscriptionStatus?.propertiesPosted} / {subscriptionStatus?.maxProperties}
            </strong>
          </div>
          <div className="bsm-info-row">
            <span>Remaining:</span>
            <strong>{subscriptionStatus?.remainingProperties} properties</strong>
          </div>
          <div className="bsm-info-row">
            <span>Expires In:</span>
            <strong>{subscriptionStatus?.daysRemaining} days</strong>
          </div>
        </div>
      </div>

      <button className="bsm-btn bsm-btn-primary" onClick={onClose}>
        Continue Posting
      </button>
    </>
  );

  return (
    <div className="bsm-backdrop" onClick={handleBackdropClick}>
      <div className="bsm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="bsm-close" onClick={onClose}>
          ×
        </button>

        {view === "check" && renderCheckView()}
        {view === "coupon" && renderCouponView()}
        {view === "plans" && renderPlansView()}
        {view === "active" && renderActiveView()}
      </div>
    </div>
  );
};

export default BrokerSubscriptionModal;