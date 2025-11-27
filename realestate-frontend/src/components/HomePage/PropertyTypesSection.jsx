// src/components/HomePage/PropertyTypesSection.jsx
import React from "react";

const PROPERTY_TYPE_ICONS = {
  Apartment: "🏢",
  Villa: "🏡",
  House: "🏠",
  Plot: "📏",
  Commercial: "🏪",
  Penthouse: "🏰",
  Studio: "🛋️",
  Duplex: "🏘️",
  PG: "🏨",
};

function PropertyTypesSection({ propertyTypes, loadingTypes, onBrowseTypeClick }) {
  return (
    <section className="hp-browse-types">
      <h2 className="hp-section-title">
        <span className="hp-section-ic">🏘️</span> Browse by Property Type
      </h2>
      <p className="hp-section-subtitle">
        Find your perfect property from our diverse range of options
      </p>

      {loadingTypes ? (
        <div className="hp-types-loading">
          <span className="hp-loading-spinner">⏳</span> Loading property types...
        </div>
      ) : propertyTypes.length === 0 ? (
        <div className="hp-types-empty">
          <span className="hp-empty-ic">📭</span>
          <p>No property types available at the moment.</p>
        </div>
      ) : (
        <div className="hp-types-grid">
          {propertyTypes
            .filter((type) => type !== "All")
            .map((type) => (
              <button
                key={type}
                className="hp-type-card"
                onClick={() => onBrowseTypeClick(type)}
                aria-label={`Browse ${type} properties`}
              >
                <div className="hp-type-icon">
                  {PROPERTY_TYPE_ICONS[type] || "🏠"}
                </div>
                <div className="hp-type-name">{type}</div>
                <div className="hp-type-arrow">→</div>
              </button>
            ))}
        </div>
      )}
    </section>
  );
}

export default PropertyTypesSection;