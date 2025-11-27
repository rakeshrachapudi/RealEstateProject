// src/components/HomePage/PopularAreasSection.jsx
import React from "react";

const POPULAR_AREAS = [
  { name: "Gachibowli", emoji: "🏢" },
  { name: "HITEC City", emoji: "🌆" },
  { name: "Madhapur", emoji: "🏙️" },
  { name: "Kondapur", emoji: "🏢" },
  { name: "Kukatpally", emoji: "🏘️" },
  { name: "Miyapur", emoji: "🌇" },
  { name: "Jubilee Hills", emoji: "🏙️" },
];

function PopularAreasSection({ onAreaClick }) {
  return (
    <section className="hp-popular-areas">
      <h2 className="hp-section-title">
        <span className="hp-section-ic">📍</span> Popular Areas in Hyderabad
      </h2>
      <p className="hp-section-subtitle">
        Explore properties in the most sought-after locations
      </p>

      <div className="hp-areas-grid">
        {POPULAR_AREAS.map((area) => (
          <button
            key={area.name}
            className="hp-area-card"
            onClick={() => onAreaClick(area.name)}
            aria-label={`View properties in ${area.name}`}
          >
            <div className="hp-area-icon">{area.emoji}</div>
            <div className="hp-area-name">{area.name}</div>
            <div className="hp-area-arrow">→</div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default PopularAreasSection;