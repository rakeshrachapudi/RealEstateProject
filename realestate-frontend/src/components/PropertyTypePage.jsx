// src/components/PropertyTypePage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropertyList from "./PropertyList";
import { BACKEND_BASE_URL } from "../config/config";
import "./PropertyTypePage.css";

const PropertyTypePage = () => {
  const { listingType, propertyType, areaName } = useParams();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingType, propertyType, areaName]);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties`);
      if (!response.ok)
        throw new Error(`Failed to fetch properties: ${response.status}`);

      const data = await response.json();

      let allProperties = [];
      if (Array.isArray(data)) {
        allProperties = data;
      } else if (data && Array.isArray(data.data)) {
        allProperties = data.data;
      }

      const filteredProperties = allProperties.filter((property) => {
        let matches = true;

        // listing type
        if (listingType && property.listingType) {
          matches =
            matches &&
            property.listingType.toLowerCase() === listingType.toLowerCase();
        }

        // property type (flexible)
        if (propertyType) {
          const searchType = propertyType.replace(/-/g, " ").toLowerCase();
          const propType = (
            property.type ||
            property.propertyType?.typeName ||
            ""
          ).toLowerCase();

          const exact = propType === searchType;
          const contains =
            propType.includes(searchType) || searchType.includes(propType);
          const synonym = checkPropertyTypeSynonyms(propType, searchType);

          matches = matches && (exact || contains || synonym);
        }

        // area name
        if (areaName) {
          const searchArea = areaName.replace(/-/g, " ").toLowerCase();
          const propArea = (
            property.areaName ||
            property.area?.areaName ||
            property.area?.name ||
            property.locality ||
            property.location?.area ||
            ""
          )
            .toLowerCase()
            .trim();
          matches = matches && propArea.includes(searchArea);
        }

        return matches;
      });

      setProperties(filteredProperties);
    } catch (err) {
      setError(
        "Failed to load properties. Please check if the backend is running."
      );
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const checkPropertyTypeSynonyms = (propType, searchType) => {
    const synonyms = {
      apartment: ["flat", "apartments"],
      flat: ["apartment", "apartments"],
      villa: ["house", "independent house", "bungalow"],
      house: ["villa", "independent house", "bungalow"],
      plot: ["land", "empty plot"],
      commercial: ["office", "shop", "retail"],
    };

    if (synonyms[searchType]) return synonyms[searchType].includes(propType);

    for (const [key, values] of Object.entries(synonyms)) {
      if (values.includes(searchType) && propType === key) return true;
    }
    return false;
  };

  const formatTitle = (text) =>
    (text || "").replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const title = areaName
    ? `Properties in ${formatTitle(areaName)}`
    : `${formatTitle(propertyType)} for ${
        listingType === "sale" ? "Sale" : "Rent"
      }`;

  return (
    <div className="ptp-container">
      <div className="ptp-header">
        <button
          className="ptp-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ← Back
        </button>

        <div className="ptp-headings">
          <h1 className="ptp-title">{title}</h1>
          <p className="ptp-subtitle" aria-live="polite" role="status">
            {loading
              ? "Searching..."
              : `${properties.length} ${
                  properties.length === 1 ? "property" : "properties"
                } found`}
          </p>
        </div>
      </div>

      {error && (
        <div className="ptp-error">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <div className="ptp-actions">
            <button
              className="ptp-btn ptp-btn-primary"
              onClick={fetchProperties}
            >
              Try Again
            </button>
            <button className="ptp-btn" onClick={() => navigate("/")}>
              Browse All Properties
            </button>
          </div>
        </div>
      )}

      {!error && (
        <>
          {!loading && properties.length === 0 ? (
            <div className="ptp-empty">
              <div className="ptp-empty-ic" aria-hidden="true">
                🏠
              </div>
              <h3 className="ptp-empty-title">No properties found</h3>
              <p className="ptp-empty-text">
                We couldn't find any {formatTitle(propertyType)} properties for{" "}
                {listingType === "sale" ? "sale" : "rent"}
                {areaName ? ` in ${formatTitle(areaName)}` : ""}.
              </p>
              <div className="ptp-actions">
                <button
                  className="ptp-btn ptp-btn-primary"
                  onClick={() => navigate("/")}
                >
                  Browse All Properties
                </button>
                <button className="ptp-btn" onClick={fetchProperties}>
                  Refresh Search
                </button>
              </div>
            </div>
          ) : (
            <PropertyList properties={properties} loading={loading} />
          )}
        </>
      )}
    </div>
  );
};

export default PropertyTypePage;
