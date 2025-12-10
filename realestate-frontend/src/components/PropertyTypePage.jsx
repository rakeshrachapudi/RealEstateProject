// src/components/PropertyTypePage.jsx - OPTIMIZED WITH INFINITE SCROLL (8 per batch)
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropertyList from "./PropertyList";
import { BACKEND_BASE_URL } from "../config/config";
import "./PropertyTypePage.css";

const PropertyTypePage = () => {
  const { listingType, propertyType, areaName } = useParams();
  const navigate = useNavigate();

  // Pagination states
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Scroll detection
  const observerTarget = useRef(null);
  const allPropertiesCache = useRef([]);

  // Fetch ALL properties once and cache them
  const fetchAllProperties = useCallback(async () => {
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

      // Filter properties based on URL params
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

      // Cache all filtered properties
      allPropertiesCache.current = filteredProperties;
      return filteredProperties;
    } catch (err) {
      console.error("Error fetching properties:", err);
      setError(
        "Failed to load properties. Please check if the backend is running."
      );
      return [];
    }
  }, [listingType, propertyType, areaName]);

  // Load paginated results from cache
  const loadPaginatedResults = useCallback((pageNum = 1, append = false) => {
    const limit = 8; // Load 8 properties at a time
    const startIndex = (pageNum - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProperties = allPropertiesCache.current.slice(
      startIndex,
      endIndex
    );

    if (append) {
      setProperties((prev) => [...prev, ...paginatedProperties]);
    } else {
      setProperties(paginatedProperties);
    }

    // Check if there are more properties
    setHasMore(endIndex < allPropertiesCache.current.length);

    if (pageNum === 1) {
      setLoading(false);
    } else {
      setLoadingMore(false);
    }
  }, []);

  // Initial load - fetch all properties then show first batch
  useEffect(() => {
    setLoading(true);
    setPage(1);
    setProperties([]);
    setError(null);

    const initialize = async () => {
      const allProps = await fetchAllProperties();
      if (allProps.length > 0) {
        loadPaginatedResults(1, false);
      } else {
        setLoading(false);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingType, propertyType, areaName]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          setLoadingMore(true);
          loadPaginatedResults(nextPage, true); // Append mode
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [page, hasMore, loading, loadingMore, loadPaginatedResults]);

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
              : `${properties.length} of ${allPropertiesCache.current.length} ${
                  allPropertiesCache.current.length === 1
                    ? "property"
                    : "properties"
                } loaded`}
          </p>
        </div>
      </div>

      {error && !loading && (
        <div className="ptp-error">
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <div className="ptp-actions">
            <button
              className="ptp-btn ptp-btn-primary"
              onClick={() => window.location.reload()}
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
          {loading && properties.length === 0 ? (
            <div className="ptp-loading">
              <div className="ptp-spinner"></div>
              <p>Loading properties...</p>
            </div>
          ) : properties.length === 0 ? (
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
                <button
                  className="ptp-btn"
                  onClick={() => window.location.reload()}
                >
                  Refresh Search
                </button>
              </div>
            </div>
          ) : (
            <>
              <PropertyList
                properties={properties}
                loading={false}
                loadingMore={loadingMore}
                onPropertyUpdated={handlePropertyUpdated}
                onPropertyDeleted={handlePropertyDeleted}
                onViewDealDetails={handleViewDealDetails}
              />

              {/* Infinite scroll trigger element */}
              <div ref={observerTarget} className="ptp-scroll-trigger">
                {loadingMore && (
                  <div className="ptp-loading-more">
                    <div className="ptp-spinner-small"></div>
                    <p>Loading more properties...</p>
                  </div>
                )}
                {!hasMore && properties.length > 0 && (
                  <div className="ptp-end-message">
                    <p>✅ You've reached the end of results</p>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PropertyTypePage;
