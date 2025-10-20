// src/components/PropertyTypePage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropertyList from "./PropertyList";
import { BACKEND_BASE_URL } from "../config/config";

const PropertyTypePage = () => {
  const { listingType, propertyType, areaName } = useParams();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, [listingType, propertyType, areaName]);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    console.log("🔍 Fetching properties with:", {
      listingType,
      propertyType,
      areaName,
    });

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties`);

      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ All properties from API:", data);

      let allProperties = [];

      // Handle response format
      if (Array.isArray(data)) {
        allProperties = data;
      } else if (data && Array.isArray(data.data)) {
        allProperties = data.data;
      } else {
        allProperties = [];
      }

      console.log(`📊 Total properties found: ${allProperties.length}`);

      // Filter properties based on URL parameters
      const filteredProperties = allProperties.filter((property) => {
        let matches = true;

        // Filter by listing type (sale/rent)
        if (listingType && property.listingType) {
          const propListingType = property.listingType.toLowerCase();
          const searchListingType = listingType.toLowerCase();
          matches = matches && propListingType === searchListingType;
          console.log(
            `Listing type check: ${propListingType} === ${searchListingType} = ${matches}`
          );
        }

        // Filter by property type
        if (propertyType && property.type) {
          const searchType = propertyType.replace(/-/g, " ").toLowerCase();
          const propType = property.type.toLowerCase();

          console.log(`Type check: "${propType}" vs "${searchType}"`);

          // Flexible matching for property types
          const exactMatch = propType === searchType;
          const containsMatch =
            propType.includes(searchType) || searchType.includes(propType);
          const synonymMatch = checkPropertyTypeSynonyms(propType, searchType);

          matches = matches && (exactMatch || containsMatch || synonymMatch);
          console.log(`Type match result: ${matches}`);
        }

        // Filter by area name
        if (areaName && property.areaName) {
          const searchArea = areaName.replace(/-/g, " ").toLowerCase();
          const propArea = property.areaName.toLowerCase();
          matches = matches && propArea.includes(searchArea);
          console.log(
            `Area check: ${propArea} includes ${searchArea} = ${matches}`
          );
        }

        console.log(`Property "${property.title}" - matches: ${matches}`);
        return matches;
      });

      console.log(`✅ Filtered properties found: ${filteredProperties.length}`);
      setProperties(filteredProperties);
    } catch (err) {
      console.error("❌ Error fetching properties:", err);
      setError(
        "Failed to load properties. Please check if the backend is running."
      );
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle property type synonyms
  const checkPropertyTypeSynonyms = (propType, searchType) => {
    const synonyms = {
      apartment: ["flat", "apartments"],
      flat: ["apartment", "apartments"],
      villa: ["house", "independent house", "bungalow"],
      house: ["villa", "independent house", "bungalow"],
      plot: ["land", "empty plot"],
    };

    if (synonyms[searchType]) {
      return synonyms[searchType].includes(propType);
    }

    // Check reverse mapping
    for (const [key, values] of Object.entries(synonyms)) {
      if (values.includes(searchType) && propType === key) {
        return true;
      }
    }

    return false;
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>⏳</div>
        <p>Loading properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.error}>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchProperties} style={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  const formatTitle = (text) => {
    return text.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const title = areaName
    ? `Properties in ${formatTitle(areaName)}`
    : `${formatTitle(propertyType)} for ${
        listingType === "sale" ? "Sale" : "Rent"
      }`;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.count}>{properties.length} properties found</p>

      <PropertyList properties={properties} loading={loading} />

      {properties.length === 0 && !loading && (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>🏠</div>
          <h3 style={styles.emptyTitle}>No properties found</h3>
          <p style={styles.emptyText}>
            We couldn't find any {formatTitle(propertyType)} properties for{" "}
            {listingType === "sale" ? "sale" : "rent"}
            {areaName && ` in ${formatTitle(areaName)}`}.
          </p>
          <div style={styles.buttonGroup}>
            <button onClick={() => navigate("/")} style={styles.browseButton}>
              Browse All Properties
            </button>
            <button onClick={fetchProperties} style={styles.retryButton}>
              Refresh Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "24px",
  },
  loading: {
    textAlign: "center",
    padding: "80px 20px",
  },
  spinner: {
    fontSize: "64px",
    marginBottom: "24px",
  },
  error: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#fef2f2",
    borderRadius: "16px",
    border: "2px solid #fecaca",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    marginTop: "20px",
    flexWrap: "wrap",
  },
  retryButton: {
    padding: "12px 24px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  backButton: {
    padding: "10px 20px",
    borderRadius: "8px",
    background: "#6b7280",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginBottom: "20px",
    fontSize: "14px",
    fontWeight: 500,
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#111827",
    marginBottom: "8px",
  },
  count: {
    fontSize: "16px",
    color: "#6b7280",
    marginBottom: "24px",
  },
  emptyContainer: {
    textAlign: "center",
    padding: "80px 20px",
    backgroundColor: "#f9fafb",
    borderRadius: "16px",
    border: "2px dashed #e5e7eb",
  },
  emptyIcon: {
    fontSize: "64px",
    marginBottom: "24px",
  },
  emptyTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "12px",
  },
  emptyText: {
    fontSize: "16px",
    color: "#6b7280",
    marginBottom: "24px",
    maxWidth: "500px",
    margin: "0 auto 24px",
  },
  browseButton: {
    padding: "12px 24px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

export default PropertyTypePage;
