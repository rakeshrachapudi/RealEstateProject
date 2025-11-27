// src/components/HomePage/HeroSection.jsx
import React from "react";
import BannerCarousel from "../BannerCorousel.jsx";

function HeroSection() {
  return (
    <section className="hp-hero">
      <div className="hp-banner-wrapper">
        <BannerCarousel />
      </div>

      <div className="hp-hero-content">
        <h1 className="hp-hero-title">
          Find Your Dream Property
          <span className="hp-hero-subtitle">Zero Brokerage • Verified Listings</span>
        </h1>
      </div>
    </section>
  );
}

export default HeroSection;