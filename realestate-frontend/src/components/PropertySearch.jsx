import React, { useState, useEffect } from "react";
import { BACKEND_BASE_URL } from "../config/config";

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
  const [debugInfo, setDebugInfo] = useState({
    types: "loading...",
    areas: "loading...",
  });

  useEffect(() => {
    loadPropertyTypes();
    loadAreas();
  }, []);

  const loadPropertyTypes = async () => {
    console.log("🔍 Loading property types...");
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/property-types`);
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Property Types Response:", data);

      if (data && data.success && data.data) {
        console.log("✅ Setting", data.data.length, "property types");
        setPropertyTypes(data.data);
        setDebugInfo((prev) => ({
          ...prev,
          types: `Loaded ${data.data.length} types`,
        }));
      } else {
        console.error("❌ Invalid response structure:", data);
        setDebugInfo((prev) => ({ ...prev, types: "Invalid response" }));
      }
    } catch (error) {
      console.error("❌ Error loading property types:", error);
      setDebugInfo((prev) => ({ ...prev, types: `Error: ${error.message}` }));
    }
  };

  const loadAreas = async () => {
    console.log("🔍 Loading areas...");
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/areas?city=Hyderabad`
      );
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Areas Response:", data);

      if (data && data.success && data.data) {
        console.log("✅ Setting", data.data.length, "areas");
        setAreas(data.data);
        setDebugInfo((prev) => ({
          ...prev,
          areas: `Loaded ${data.data.length} areas`,
        }));
      } else {
        console.error("❌ Invalid response structure:", data);
        setDebugInfo((prev) => ({ ...prev, areas: "Invalid response" }));
      }
    } catch (error) {
      console.error("❌ Error loading areas:", error);
      setDebugInfo((prev) => ({ ...prev, areas: `Error: ${error.message}` }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    onSearchStart();

    try {
      const params = {
        ...searchParams,
        minPrice: searchParams.minPrice
          ? parseFloat(searchParams.minPrice)
          : null,
        maxPrice: searchParams.maxPrice
          ? parseFloat(searchParams.maxPrice)
          : null,
        minBedrooms: searchParams.minBedrooms
          ? parseInt(searchParams.minBedrooms)
          : null,
        maxBedrooms: searchParams.maxBedrooms
          ? parseInt(searchParams.maxBedrooms)
          : null,
        propertyType: searchParams.propertyType || null,
        area: searchParams.area || null,
        listingType: searchParams.listingType || null,
      };

      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        onSearchResults(data.data);
      }
    } catch (error) {
      console.error("Error searching properties:", error);
      onSearchResults([]);
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
    onReset();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>🔍 Find Your Perfect Property</h2>
        <p style={styles.subtitle}>
          Search through thousands of properties in Hyderabad
        </p>

        {/* Debug Info */}
        {/*         <div style={styles.debugInfo}> */}
        {/*           <small>Debug: {debugInfo.types} | {debugInfo.areas}</small> */}
        {/*         </div> */}
      </div>

      <form onSubmit={handleSearch} style={styles.form}>
        <div style={styles.grid}>
          {/* Property Type */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🏠</span>
              Property Type ({propertyTypes.length} types loaded)
            </label>
            <select
              name="propertyType"
              value={searchParams.propertyType}
              onChange={handleInputChange}
              style={styles.select}
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
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📋</span>
              Listing Type
            </label>
            <select
              name="listingType"
              value={searchParams.listingType}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="">All Listings</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* Area */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>📍</span>
              Area ({areas.length} areas loaded)
            </label>
            <select
              name="area"
              value={searchParams.area}
              onChange={handleInputChange}
              style={styles.select}
            >
              <option value="">All Areas</option>
              {areas.map((area) => (
                <option key={area.areaId} value={area.areaName}>
                  {area.areaName} ({area.pincode})
                </option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>💰</span>
              Min Price (₹)
            </label>
            <input
              type="number"
              name="minPrice"
              placeholder="Minimum Price"
              value={searchParams.minPrice}
              onChange={handleInputChange}
              style={styles.input}
              min="0"
            />
          </div>

          {/* Max Price */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>💰</span>
              Max Price (₹)
            </label>
            <input
              type="number"
              name="maxPrice"
              placeholder="500000000"
              value={searchParams.maxPrice}
              onChange={handleInputChange}
              style={styles.input}
              min="0"
            />
          </div>

          {/* Min Bedrooms */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🛏️</span>
              Min Bedrooms
            </label>
            <input
              type="number"
              name="minBedrooms"
              placeholder="1"
              value={searchParams.minBedrooms}
              onChange={handleInputChange}
              style={styles.input}
              min="0"
              max="10"
            />
          </div>

          {/* Max Bedrooms */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <span style={styles.labelIcon}>🛏️</span>
              Max Bedrooms
            </label>
            <input
              type="number"
              name="maxBedrooms"
              placeholder="2"
              value={searchParams.maxBedrooms}
              onChange={handleInputChange}
              style={styles.input}
              min="0"
              max="10"
            />
          </div>
        </div>

        <div style={styles.actions}>
          <button
            type="button"
            onClick={handleReset}
            style={styles.resetButton}
          >
            <span style={styles.buttonIcon}>🔄</span>
            Reset Filters
          </button>
          <button type="submit" style={styles.searchButton} disabled={loading}>
            <span style={styles.buttonIcon}>{loading ? "⏳" : "🔍"}</span>
            {loading ? "Searching..." : "Search Properties"}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    padding: "2.5rem",
    borderRadius: "24px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
    marginBottom: "3rem",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  header: {
    textAlign: "center",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "0.5rem",
    color: "#1e293b",
    fontWeight: "800",
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    fontWeight: "500",
  },
  debugInfo: {
    marginTop: "0.5rem",
    padding: "0.5rem",
    background: "#fef3c7",
    borderRadius: "8px",
    color: "#92400e",
  },
  form: {
    width: "100%",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "1.5rem",
    marginBottom: "2rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#374151",
  },
  labelIcon: {
    fontSize: "16px",
  },
  input: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "15px",
    background: "white",
    fontWeight: "500",
  },
  select: {
    padding: "14px 16px",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    fontSize: "15px",
    backgroundColor: "white",
    cursor: "pointer",
    fontWeight: "500",
  },
  actions: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  resetButton: {
    padding: "14px 28px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  searchButton: {
    padding: "14px 32px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  buttonIcon: {
    fontSize: "16px",
  },
};

export default PropertySearch;
