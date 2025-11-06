import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./PlaceholderPage.css";

const PlaceholderPage = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Get page title from URL or props
  const getPageTitle = () => {
    const path = location.pathname;
    const pathSegments = path.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1];

    if (lastSegment) {
      return lastSegment
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    return "New Feature";
  };

  const [countdown, setCountdown] = useState({
    days: 30,
    hours: 12,
    minutes: 45,
    seconds: 30,
  });

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        let { days, hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }

        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Save to localStorage for now
      const existingSubscribers = JSON.parse(
        localStorage.getItem("newsletterSubscribers") || "[]"
      );
      if (!existingSubscribers.includes(email)) {
        existingSubscribers.push(email);
        localStorage.setItem(
          "newsletterSubscribers",
          JSON.stringify(existingSubscribers)
        );
      }

      setIsSubscribed(true);
      setEmail("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const features = [
    {
      icon: "🏠",
      title: "Advanced Property Search",
      description: "AI-powered search with smart filters and recommendations",
    },
    {
      icon: "📊",
      title: "Market Analytics",
      description: "Real-time market trends and property value insights",
    },
    {
      icon: "📱",
      title: "Mobile App",
      description: "Native mobile app for iOS and Android platforms",
    },
    {
      icon: "🤖",
      title: "AI Assistant",
      description: "Smart chatbot to help with property queries and decisions",
    },
    {
      icon: "📋",
      title: "Enhanced Documents",
      description: "Advanced legal document generation with e-signature",
    },
    {
      icon: "🔔",
      title: "Smart Notifications",
      description: "Personalized alerts for properties matching your criteria",
    },
  ];

  return (
    <div className="pp-container">
      {/* Background Animation */}
      <div className="pp-bg-animation">
        <div className="pp-floating-shape pp-shape-1"></div>
        <div className="pp-floating-shape pp-shape-2"></div>
        <div className="pp-floating-shape pp-shape-3"></div>
        <div className="pp-floating-shape pp-shape-4"></div>
      </div>

      {/* Header */}
      <header className="pp-header">
        <button className="pp-back-btn" onClick={handleGoBack}>
          ← Back
        </button>
        <div className="pp-logo">
          <span className="pp-logo-icon">🏢</span>
          <span className="pp-logo-text">PropertyDealz</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="pp-main">
        <div className="pp-hero">
          <div className="pp-hero-icon">🚀</div>
          <h1 className="pp-hero-title">{getPageTitle()} Coming Soon!</h1>
          <p className="pp-hero-subtitle">
            We're working hard to bring you an amazing new experience. Get ready
            for something extraordinary!
          </p>

          {/* Countdown Timer */}
          <div className="pp-countdown">
            <div className="pp-countdown-item">
              <span className="pp-countdown-number">{countdown.days}</span>
              <span className="pp-countdown-label">Days</span>
            </div>
            <div className="pp-countdown-divider">:</div>
            <div className="pp-countdown-item">
              <span className="pp-countdown-number">{countdown.hours}</span>
              <span className="pp-countdown-label">Hours</span>
            </div>
            <div className="pp-countdown-divider">:</div>
            <div className="pp-countdown-item">
              <span className="pp-countdown-number">{countdown.minutes}</span>
              <span className="pp-countdown-label">Minutes</span>
            </div>
            <div className="pp-countdown-divider">:</div>
            <div className="pp-countdown-item">
              <span className="pp-countdown-number">{countdown.seconds}</span>
              <span className="pp-countdown-label">Seconds</span>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <section className="pp-newsletter">
          <div className="pp-newsletter-content">
            <h2 className="pp-newsletter-title">Be The First To Know</h2>
            <p className="pp-newsletter-text">
              Subscribe to get notified when we launch this exciting new feature
            </p>

            {!isSubscribed ? (
              <form className="pp-newsletter-form" onSubmit={handleSubscribe}>
                <div className="pp-input-group">
                  <input
                    type="email"
                    className="pp-email-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    className="pp-subscribe-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? "Subscribing..." : "Notify Me"}
                  </button>
                </div>
                {error && <div className="pp-error-message">{error}</div>}
              </form>
            ) : (
              <div className="pp-success-message">
                <div className="pp-success-icon">✅</div>
                <div className="pp-success-text">
                  <h3>Thank you for subscribing!</h3>
                  <p>We'll notify you as soon as this feature is available.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Preview */}
        <section className="pp-features">
          <h2 className="pp-features-title">What's Coming</h2>
          <div className="pp-features-grid">
            {features.map((feature, index) => (
              <div key={index} className="pp-feature-card">
                <div className="pp-feature-icon">{feature.icon}</div>
                <h3 className="pp-feature-title">{feature.title}</h3>
                <p className="pp-feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Progress Bar */}
        <section className="pp-progress">
          <div className="pp-progress-content">
            <h3 className="pp-progress-title">Development Progress</h3>
            <div className="pp-progress-bar">
              <div className="pp-progress-fill" style={{ width: "75%" }}></div>
            </div>
            <div className="pp-progress-text">75% Complete</div>
          </div>
        </section>

        {/* Social Links */}
        <section className="pp-social">
          <h3 className="pp-social-title">Follow Us For Updates</h3>
          <div className="pp-social-links">
            <a href="#" className="pp-social-link" aria-label="Facebook">
              <span className="pp-social-icon">📘</span>
              Facebook
            </a>
            <a href="#" className="pp-social-link" aria-label="Twitter">
              <span className="pp-social-icon">🐦</span>
              Twitter
            </a>
            <a href="#" className="pp-social-link" aria-label="Instagram">
              <span className="pp-social-icon">📷</span>
              Instagram
            </a>
            <a href="#" className="pp-social-link" aria-label="LinkedIn">
              <span className="pp-social-icon">💼</span>
              LinkedIn
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="pp-footer">
        <p className="pp-footer-text">
          © 2025 PropertyDealz. All rights reserved. |
          <button className="pp-footer-link" onClick={() => navigate("/legal")}>
            Privacy Policy
          </button>
        </p>
      </footer>
    </div>
  );
};

export default PlaceholderPage;
