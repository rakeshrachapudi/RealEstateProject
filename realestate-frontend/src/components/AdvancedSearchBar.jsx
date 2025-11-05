// src/components/AdvancedSearchBar.jsx
import React, { useState } from "react";
import "./AdvancedSearchBar.css";
import { BACKEND_BASE_URL } from "../config/config";

const AdvancedSearchBar = ({ onSearchResults }) => {
  const [location, setLocation] = useState("Hyderabad");
  const [additionalLocations, setAdditionalLocations] = useState([]);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [budget, setBudget] = useState("");

  const propertyTypes = [
    "Apartment",
    "Villa",
    "House",
    "Plot",
    "Commercial",
    "PG",
  ];

  const budgetRanges = [
    { label: "Budget", value: "" },
    { label: "Under ₹20L", value: "0-2000000" },
    { label: "₹20L - ₹40L", value: "2000000-4000000" },
    { label: "₹40L - ₹60L", value: "4000000-6000000" },
    { label: "₹60L - ₹80L", value: "6000000-8000000" },
    { label: "₹80L - ₹1Cr", value: "8000000-10000000" },
    { label: "Above ₹1Cr", value: "10000000-999999999" },
  ];

  const handleAddLocation = () => {
    const trimmed = newLocation.trim();
    if (!trimmed) return;
    setAdditionalLocations((prev) => [...prev, trimmed]);
    setNewLocation("");
    setShowAddLocation(false);
  };

  const handleRemoveLocation = (idx) => {
    setAdditionalLocations((prev) => prev.filter((_, i) => i !== idx));
  };

  const parseBudget = (range) => {
    if (!range) return { minPrice: null, maxPrice: null };
    const [min, max] = range.split("-").map((n) => Number(n));
    return {
      minPrice: isFinite(min) ? min : null,
      maxPrice: isFinite(max) ? max : null,
    };
  };

  const handleSearch = async () => {
    const allLocations = [location, ...additionalLocations].filter(Boolean);

    const { minPrice, maxPrice } = parseBudget(budget);
    const params = {
      city: "Hyderabad",
      area: allLocations[0] || "", // primary location as area
      listingType: "", // can be set by parent if needed
      propertyType: propertyType || null,
      minPrice,
      maxPrice,
    };

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        console.error("Search failed:", response.status);
        onSearchResults && onSearchResults([]);
        return;
      }

      const data = await response.json();
      if (data?.success && Array.isArray(data?.data)) {
        onSearchResults && onSearchResults(data.data);
      } else {
        onSearchResults && onSearchResults([]);
      }
    } catch (error) {
      console.error("Error during search:", error);
      onSearchResults && onSearchResults([]);
    }
  };

  const handleKeyDownAdd = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLocation();
    }
  };

  return (
    <section className="asb-container" aria-label="Advanced property search">
      <div className="asb">
        {/* Location */}
        <div className="asb-section asb-location">
          <span className="asb-ic asb-ic-loc" aria-hidden="true">
            📍
          </span>
          <div className="asb-location-wrap">
            <label className="sr-only" htmlFor="asb-location">
              Location
            </label>
            <input
              id="asb-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="asb-input asb-input-loc"
              placeholder="Enter location"
              inputMode="text"
            />

            {additionalLocations.length > 0 && (
              <div className="asb-tags">
                {additionalLocations.map((loc, idx) => (
                  <span key={`${loc}-${idx}`} className="asb-tag">
                    {loc}
                    <button
                      type="button"
                      className="asb-tag-close"
                      onClick={() => handleRemoveLocation(idx)}
                      aria-label={`Remove ${loc}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {showAddLocation ? (
              <div className="asb-add-loc">
                <label className="sr-only" htmlFor="asb-add">
                  Add another location
                </label>
                <input
                  id="asb-add"
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyDown={handleKeyDownAdd}
                  placeholder="Add location"
                  className="asb-input"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddLocation}
                  className="asb-btn asb-btn-light"
                >
                  Add
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="asb-add-more"
                onClick={() => setShowAddLocation(true)}
              >
                Add more...
              </button>
            )}
          </div>
        </div>

        <div className="asb-divider" aria-hidden="true"></div>

        {/* Property Type */}
        <div className="asb-section">
          <span className="asb-ic asb-ic-home" aria-hidden="true">
            🏠
          </span>
          <label className="sr-only" htmlFor="asb-type">
            Property Type
          </label>
          <select
            id="asb-type"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="asb-select"
          >
            <option value="">All Types</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div className="asb-divider" aria-hidden="true"></div>

        {/* Budget */}
        <div className="asb-section">
          <span className="asb-ic asb-ic-rupee" aria-hidden="true">
            ₹
          </span>
          <label className="sr-only" htmlFor="asb-budget">
            Budget
          </label>
          <select
            id="asb-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="asb-select"
          >
            {budgetRanges.map((range) => (
              <option key={range.label} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <button type="button" className="asb-search" onClick={handleSearch}>
          🔍 Search
        </button>
      </div>
    </section>
  );
};

export default AdvancedSearchBar;
