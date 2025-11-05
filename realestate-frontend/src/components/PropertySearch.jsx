// src/components/PropertySearch.jsx
import React, { useState, useEffect } from "react";
import { BACKEND_BASE_URL } from "../config/config";
import "./PropertySearch.css";

const PropertySearch = ({ onSearchResults, onSearchStart, onReset }) => {
  const [searchParams, setSearchParams] = useState({
    propertyType: "",
    minPrice: "",
    maxPrice: "",
    city: "Hyderabad",
    area: "",
    listingType: "",
    minBedrooms: "",
    maxBedrooms: "",
  });

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Prefetch filters
  useEffect(() => {
    loadPropertyTypes();
    loadAreas();
  }, []);

  const loadPropertyTypes = async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/property-types`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data)) {
        setPropertyTypes(data.data);
      } else {
        setPropertyTypes([]);
      }
    } catch (e) {
      console.error("Error loading property types:", e);
      setPropertyTypes([]);
    }
  };

  const loadAreas = async () => {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/areas?city=Hyderabad`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data?.data)) {
        setAreas(data.data);
      } else {
        setAreas([]);
      }
    } catch (e) {
      console.error("Error loading areas:", e);
      setAreas([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    onSearchStart && onSearchStart();

    try {
      const params = {
        ...searchParams,
        minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : null,
        maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : null,
        minBedrooms: searchParams.minBedrooms
          ? Number(searchParams.minBedrooms)
          : null,
        maxBedrooms: searchParams.maxBedrooms
          ? Number(searchParams.maxBedrooms)
          : null,
        propertyType: searchParams.propertyType || null,
        area: searchParams.area || null,
        listingType: searchParams.listingType || null,
      };

      // Validate numeric ranges (basic)
      if (
        params.minPrice != null &&
        params.maxPrice != null &&
        params.minPrice > params.maxPrice
      ) {
        alert("Min Price cannot be greater than Max Price");
        setLoading(false);
        return;
      }
      if (
        params.minBedrooms != null &&
        params.maxBedrooms != null &&
        params.minBedrooms > params.maxBedrooms
      ) {
        alert("Min Bedrooms cannot be greater than Max Bedrooms");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data?.success && Array.isArray(data?.data)) {
        onSearchResults && onSearchResults(data.data);
      } else {
        onSearchResults && onSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching properties:", error);
      onSearchResults && onSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      propertyType: "",
      minPrice: "",
      maxPrice: "",
      city: "Hyderabad",
      area: "",
      listingType: "",
      minBedrooms: "",
      maxBedrooms: "",
    });
    onReset && onReset();
  };

  return (
    <section className="ps-container" aria-labelledby="ps-title">
      <header className="ps-header">
        <h2 id="ps-title" className="ps-title">
          Find Your Perfect Property
        </h2>
        <p className="ps-subtitle">
          Search thousands of properties in Hyderabad
        </p>
      </header>

      <form className="ps-form" onSubmit={handleSearch}>
        <div className="ps-grid">
          {/* Property Type */}
          <div className="ps-group">
            <label className="ps-label" htmlFor="ps-propertyType">
              <span className="ps-label-ic">🏠</span> Property Type
              {propertyTypes.length > 0 ? ` (${propertyTypes.length})` : ""}
            </label>
            <select
              id="ps-propertyType"
              name="propertyType"
              value={searchParams.propertyType}
              onChange={handleInputChange}
              className="ps-select"
            >
              <option value="">All Types</option>
              {propertyTypes.map((type) => (
                <option key={type.propertyTypeId} value={type.typeName}>
                  {type.typeName}
                </option>
              ))}
            </select>
          </div>

          {/* Listing Type */}
          <div className="ps-group">
            <label className="ps-label" htmlFor="ps-listingType">
              <span className="ps-label-ic">📋</span> Listing Type
            </label>
            <select
              id="ps-listingType"
              name="listingType"
              value={searchParams.listingType}
              onChange={handleInputChange}
              className="ps-select"
            >
              <option value="">All Listings</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Area */}
          <div className="ps-group">
            <label className="ps-label" htmlFor="ps-area">
              <span className="ps-label-ic">📍</span> Area
              {areas.length > 0 ? ` (${areas.length})` : ""}
            </label>
            <select
              id="ps-area"
              name="area"
              value={searchParams.area}
              onChange={handleInputChange}
              className="ps-select"
            >
              <option value="">All Areas</option>
              {areas.map((area) => (
                <option key={area.areaId} value={area.areaName}>
                  {area.areaName} {area.pincode ? `(${area.pincode})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div className="ps-group">
            <label className="ps-label" htmlFor="ps-minPrice">
              <span className="ps-label-ic">💰</span> Min Price (₹)
            </label>
            <input
              id="ps-minPrice"
              type="number"
              name="minPrice"
              placeholder="0"
              value={searchParams.minPrice}
              onChange={handleInputChange}
              className="ps-input"
              min="0"
              inputMode="numeric"
            />
          </div>

          {/* Max Price */}
          <div className="ps-group">
            <label className="ps-label" htmlFor="ps-maxPrice">
              <span className="ps-label-ic">💰</span> Max Price (₹)
            </label>
            <input
              id="ps-maxPrice"
              type="number"
              name="maxPrice"
              placeholder="50000000"
              value={searchParams.maxPrice}
              onChange={handleInputChange}
              className="ps-input"
              min="0"
              inputMode="numeric"
            />
          </div>

          {/* Min Bedrooms */}
          <div className="ps-group">
            <label className="ps-label" htmlFor="ps-minBedrooms">
              <span className="ps-label-ic">🛏️</span> Min Bedrooms
            </label>
            <input
              id="ps-minBedrooms"
              type="number"
              name="minBedrooms"
              placeholder="1"
              value={searchParams.minBedrooms}
              onChange={handleInputChange}
              className="ps-input"
              min="0"
              max="10"
              inputMode="numeric"
            />
          </div>

          {/* Max Bedrooms */}
          <div className="ps-group">
            <label className="ps-label" htmlFor="ps-maxBedrooms">
              <span className="ps-label-ic">🛏️</span> Max Bedrooms
            </label>
            <input
              id="ps-maxBedrooms"
              type="number"
              name="maxBedrooms"
              placeholder="2"
              value={searchParams.maxBedrooms}
              onChange={handleInputChange}
              className="ps-input"
              min="0"
              max="10"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="ps-actions">
          <button
            type="button"
            onClick={handleReset}
            className="ps-btn ps-btn-secondary"
          >
            <span className="ps-btn-ic" aria-hidden="true">
              🔄
            </span>
            Reset Filters
          </button>

          <button
            type="submit"
            className="ps-btn ps-btn-primary"
            disabled={loading}
            aria-busy={loading}
          >
            <span className="ps-btn-ic" aria-hidden="true">
              {loading ? "⏳" : "🔍"}
            </span>
            {loading ? "Searching..." : "Search Properties"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default PropertySearch;
