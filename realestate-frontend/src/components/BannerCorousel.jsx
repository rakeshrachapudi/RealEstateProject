import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./BannerCorousel.css";

const BannerCarousel = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const autoSlideRef = useRef(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 89,
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  const ownerFeatures = [
    "No Subscription Required — Post your property for free",
    "Buyer connects to our Agent — Direct communication",
    "Dedicated Agent Support — From enquiry to site visit",
    "End-to-End Documentation — Agent handles paperwork till registration",
    "Only 0.5% Service Fee — Split equally between buyer & seller",
  ];

  const brokerFeatures = [
    "Subscription-Based Access",
    "Get Direct Buyer Contact Numbers",
    "Unlimited Listings",
    "Instant Lead Access — No middle agent involved",
    "Use coupon codes BROKER3FREE or WELCOME2024 to enjoy exclusive subscription discounts.",
  ];

  // Auto-slide effect
  useEffect(() => {
    const startAutoSlide = () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }

      autoSlideRef.current = setInterval(() => {
        if (!isDragging) {
          setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
        }
      }, 5000); // ---------------------------------------------------------------------------------------Autoscroll
    };

    startAutoSlide();

    return () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [isDragging]);

  // Timer countdown
  useEffect(() => {
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

  const handleMyPropertiesClick = () => {
    navigate("/my-properties");
  };

  const handleStart = (clientX) => {
    setIsDragging(true);
    setStartX(clientX);
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (translateX < -50) {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    } else if (translateX > 50) {
      setCurrentSlide((prev) => (prev === 0 ? 1 : 0));
    }

    setTranslateX(0);
  };

  const handleIndicatorClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="banner-carousel-wrapper">
      <div
        className="banner-carousel-container"
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        <div
          className="banner-carousel-track"
          style={{
            transform: `translateX(calc(-${
              currentSlide * 50
            }% + ${translateX}px))`,
            transition: isDragging ? "none" : "transform 0.6s ease-in-out",
          }}
        >
          {/* Slide 1: How It Works */}
          <div className="banner-carousel-slide">
            <section className="hp-banner">
              <div className="hp-banner-content">
                <div className="hp-banner-header">
                  <div className="hp-banner-header-content">
                    <span className="hp-banner-badge">✨ How It Works</span>
                    <h2 className="hp-banner-title">PropertyDealz Platform</h2>
                    <p className="hp-banner-subtitle">
                      Simple, transparent, and hassle-free property deals for
                      everyone
                    </p>
                  </div>

                  <div className="hp-banner-illustration" aria-hidden="true">
                    <div className="hp-illustration-emoji">🤝</div>
                    <div className="hp-illustration-text">
                      Connecting Everyone
                    </div>
                  </div>
                </div>

                <div className="hp-feature-cards">
                  <div className="hp-feature-card hp-feature-card-owner">
                    <div className="hp-feature-card-header">
                      <div className="hp-feature-icon">🏠</div>
                      <h3 className="hp-feature-title">For Property Owners</h3>
                      <p className="hp-feature-desc">
                        List your property with zero hassle
                      </p>
                    </div>
                    <div className="hp-feature-list">
                      {ownerFeatures.map((feature, idx) => (
                        <div key={idx} className="hp-feature-item">
                          <span className="hp-checkmark">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="hp-feature-shine"></div>
                  </div>

                  <div className="hp-feature-card hp-feature-card-broker">
                    <div className="hp-feature-card-header">
                      <div className="hp-feature-icon">💼</div>
                      <h3 className="hp-feature-title">For Brokers</h3>
                      <p className="hp-feature-desc">
                        Premium access to quality leads
                      </p>
                    </div>
                    <div className="hp-feature-list">
                      {brokerFeatures.map((feature, idx) => (
                        <div key={idx} className="hp-feature-item">
                          <span className="hp-checkmark">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <div className="hp-feature-shine"></div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Slide 2: Limited Time Offer */}
          <div className="banner-carousel-slide">
            <div className="hp-promo-banner">
              <div className="hp-promo-container">
                <div className="hp-promo-badge">🎉 LIMITED TIME OFFER</div>

                <div className="hp-promo-content">
                  <h2 className="hp-promo-title">
                    ⭐ Make Your Property{" "}
                    <span className="hp-promo-highlight">FEATURED</span> for
                    FREE!
                  </h2>
                  <p className="hp-promo-desc">
                    Get 3X more visibility with featured listing - Normally
                    ₹499, now FREE with code <strong>FEATURED3M</strong>
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

                  {/* MODIFIED: Coupon and Timer in ONE ROW */}
                  <div className="hp-promo-row">
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
                </div>

                <div className="hp-promo-cta">
                  <button
                    className="hp-promo-btn"
                    onClick={handleMyPropertiesClick}
                  >
                    🎯 Make My Property Featured Now
                  </button>
                  <p className="hp-promo-note">
                    💡 Already have a property listed? Go to your property
                    details and apply the coupon code!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="banner-carousel-indicators">
        <button
          className={`carousel-indicator ${currentSlide === 0 ? "active" : ""}`}
          onClick={() => handleIndicatorClick(0)}
          aria-label="Go to How It Works banner"
        />
        <button
          className={`carousel-indicator ${currentSlide === 1 ? "active" : ""}`}
          onClick={() => handleIndicatorClick(1)}
          aria-label="Go to Limited Time Offer banner"
        />
      </div>
    </div>
  );
};

export default BannerCarousel;
