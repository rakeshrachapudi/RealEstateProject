// src/pages/SearchResultsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropertyList from "../components/PropertyList";
import { BACKEND_BASE_URL } from "../config/config";
import "./SearchResultsPage.css";

function SearchResultsPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParams = Object.fromEntries(params.entries());
    fetchFilteredProperties(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const fetchFilteredProperties = async (searchParams) => {
    setLoading(true);

    try {
      const requestBody = {
        propertyType: searchParams.propertyType || null,
        minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : null,
        maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : null,
        city: searchParams.city || null,
        area: searchParams.area || null,
        listingType: searchParams.listingType || null,
        minBedrooms: searchParams.minBedrooms
          ? Number(searchParams.minBedrooms)
          : null,
        maxBedrooms: searchParams.maxBedrooms
          ? Number(searchParams.maxBedrooms)
          : null,
        isVerified: searchParams.isVerified === "true" ? true : null,
        ownerType: searchParams.ownerType || null,
        isReadyToMove: searchParams.isReadyToMove === "true" ? true : null,
        sortBy: "createdAt",
        sortOrder: "DESC",
        page: 0,
        size: 50,
      };

      // Basic validation
      if (
        requestBody.minPrice != null &&
        requestBody.maxPrice != null &&
        requestBody.minPrice > requestBody.maxPrice
      ) {
        // Swap if incorrect
        const tmp = requestBody.minPrice;
        requestBody.minPrice = requestBody.maxPrice;
        requestBody.maxPrice = tmp;
      }

      if (
        requestBody.minBedrooms != null &&
        requestBody.maxBedrooms != null &&
        requestBody.minBedrooms > requestBody.maxBedrooms
      ) {
        const tmp = requestBody.minBedrooms;
        requestBody.minBedrooms = requestBody.maxBedrooms;
        requestBody.maxBedrooms = tmp;
      }

      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/search`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      setProperties(
        data?.success && Array.isArray(data?.data) ? data.data : []
      );
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const getPageTitle = () => {
    const params = new URLSearchParams(location.search);
    const type = params.get("propertyType");
    const listingType = params.get("listingType");
    const area = params.get("area");

    if (area) return `Properties in ${area}`;
    if (type && listingType)
      return `${type}s for ${listingType === "sale" ? "Sale" : "Rent"}`;
    if (listingType)
      return `Properties for ${listingType === "sale" ? "Sale" : "Rent"}`;
    return "Search Results";
  };

  const title = getPageTitle();

  return (
    <div className="srp-container">
      <div className="srp-header">
        <button
          className="srp-back"
          onClick={() => navigate("/")}
          aria-label="Back to Home"
        >
          ← Back to Home
        </button>

        <div className="srp-pagehead">
          <h1 className="srp-title">{title}</h1>
          <p className="srp-subtitle" aria-live="polite" role="status">
            {loading
              ? "Searching..."
              : `${properties.length} ${
                  properties.length === 1 ? "property" : "properties"
                } found`}
          </p>
        </div>
      </div>

      {!loading && properties.length === 0 ? (
        <div className="srp-empty">
          <div className="srp-empty-ic" aria-hidden="true">
            🏚️
          </div>
          <h3 className="srp-empty-title">No properties found</h3>
          <p className="srp-empty-text">
            Try adjusting your filters or browse all properties.
          </p>
          <button className="srp-browse-btn" onClick={() => navigate("/")}>
            Browse All Properties
          </button>
        </div>
      ) : (
        <PropertyList properties={properties} loading={loading} />
      )}
    </div>
  );
}

export default SearchResultsPage;
