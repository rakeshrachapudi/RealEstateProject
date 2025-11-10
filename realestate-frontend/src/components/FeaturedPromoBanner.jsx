// Insert this promotional banner component right after the import statements
// and before the HomePage function

// Add this FeaturedPromoBanner component before HomePage function
import React from "react";
import "./FeaturedPromoBanner.css";
import { useNavigate } from "react-router-dom";

const FeaturedPromoBanner = () => {
  const navigate = useNavigate();

  const [timeLeft, setTimeLeft] = React.useState({
    days: 89,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  const handleMyPropertiesClick = () => {
    navigate("/my-properties");
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newSeconds = prev.seconds > 0 ? prev.seconds - 1 : 59;
        const newMinutes =
          newSeconds === 59 && prev.seconds === 0
            ? prev.minutes > 0
              ? prev.minutes - 1
              : 59
            : prev.minutes;
        const newHours =
          newMinutes === 59 && prev.minutes === 0 && newSeconds === 59
            ? prev.hours > 0
              ? prev.hours - 1
              : 23
            : prev.hours;
        const newDays =
          newHours === 23 &&
          prev.hours === 0 &&
          newMinutes === 59 &&
          newSeconds === 59
            ? Math.max(0, prev.days - 1)
            : prev.days;

        return {
          days: newDays,
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hp-promo-banner">
      <div className="hp-promo-container">
        <div className="hp-promo-badge">🎉 LIMITED TIME OFFER</div>

        <div className="hp-promo-content">
          <h2 className="hp-promo-title">
            ⭐ Make Your Property{" "}
            <span className="hp-promo-highlight">FEATURED</span> for FREE!
          </h2>
          <p className="hp-promo-desc">
            Get 3X more visibility with featured listing - Normally ₹499, now
            FREE with code <strong>FEATURED3M</strong>
          </p>

          <div className="hp-promo-features">
            <div className="hp-promo-feature">
              <span className="hp-promo-icon">🚀</span>
              <span>Top of Search Results</span>
            </div>
            <div className="hp-promo-feature">
              <span className="hp-promo-icon">💰</span>
              <span>100% Free for 3 Months</span>
            </div>
            <div className="hp-promo-feature">
              <span className="hp-promo-icon">📈</span>
              <span>Get 3X More Inquiries</span>
            </div>
          </div>

          <div className="hp-promo-coupon">
            <div className="hp-coupon-label">Use Coupon Code:</div>
            <div className="hp-coupon-code">
              <span className="hp-coupon-text">FEATURED3M</span>
              <button
                className="hp-coupon-copy"
                onClick={() => {
                  navigator.clipboard.writeText("FEATURED3M");
                  alert("Coupon code copied!");
                }}
              >
                📋 Copy
              </button>
            </div>
          </div>

          <div className="hp-promo-timer">
            <div className="hp-timer-label">⏰ Offer Ends In:</div>
            <div className="hp-timer-boxes">
              <div className="hp-timer-box">
                <div className="hp-timer-value">{timeLeft.days}</div>
                <div className="hp-timer-unit">Days</div>
              </div>
              <div className="hp-timer-sep">:</div>
              <div className="hp-timer-box">
                <div className="hp-timer-value">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="hp-timer-unit">Hours</div>
              </div>
              <div className="hp-timer-sep">:</div>
              <div className="hp-timer-box">
                <div className="hp-timer-value">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="hp-timer-unit">Minutes</div>
              </div>
              <div className="hp-timer-sep">:</div>
              <div className="hp-timer-box">
                <div className="hp-timer-value">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="hp-timer-unit">Seconds</div>
              </div>
            </div>
          </div>
        </div>

        <div className="hp-promo-cta">
          <button
            className="hp-promo-btn"
            onClick={() => {
              handleMyPropertiesClick();
            }}
          >
            🎯 Make My Property Featured Now
          </button>
          <p className="hp-promo-note">
            💡 Already have a property listed? Go to your property details and
            apply the coupon code!
          </p>
        </div>
      </div>
    </div>
  );
};

// In your HomePage component's return statement, add this banner right after opening <div className="hp-container">
// and before the <section className="hp-banner">

// Example placement in HomePage return:
/*
return (
  <>
    <div className="hp-container">

      <!-- ADD THIS PROMOTIONAL BANNER HERE -->
      <FeaturedPromoBanner />

      <!-- Existing content continues -->
      <section className="hp-banner">
        ...
      </section>
      ...
    </div>
  </>
);
*/

export default FeaturedPromoBanner;
