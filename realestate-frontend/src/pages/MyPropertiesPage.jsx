// realestate-frontend/src/pages/MyPropertiesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import PropertyCard from "../components/PropertyCard";
import { BACKEND_BASE_URL } from "../config/config";
import "./MyPropertiesPage.css";

function MyPropertiesPage({ onPostPropertyClick }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) {
      navigate("/");
      return;
    }
    fetchMyProperties();
  }, [user?.id]);

  /**
   * Fetch user properties
   * Backend now returns DTOs with imageUrl already populated
   */
  const fetchMyProperties = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.status === 404 || response.status === 204) {
        setProperties([]);
        return;
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const propertiesArray = Array.isArray(data) ? data : data.data || [];

      // Backend DTOs already include imageUrl, so we can use them directly
      const normalized = propertiesArray.map((p) => normalizeProperty(p));
      setProperties(normalized);
    } catch (err) {
      console.error("Failed to load properties:", err);
      setError("Failed to load properties. Please check your connection.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Normalize property data to ensure consistent structure
   */
  const normalizeProperty = (p) => {
    if (!p) return null;

    const id = p.propertyId ?? p.id ?? null;

    // Handle property type
    const propertyTypeRaw = p.propertyType ?? p.type ?? null;
    let typeName = null;
    if (typeof propertyTypeRaw === "string") {
      typeName = propertyTypeRaw;
    } else if (propertyTypeRaw && typeof propertyTypeRaw === "object") {
      typeName = propertyTypeRaw.typeName || propertyTypeRaw.name || null;
    }

    // Image URL is already in DTO from backend
    const imageUrl =
      p.imageUrl && p.imageUrl !== "null" && String(p.imageUrl).trim() !== ""
        ? p.imageUrl
        : null;

    // Handle amenities
    const amenities =
      typeof p.amenities === "string"
        ? p.amenities
        : Array.isArray(p.amenities)
        ? p.amenities.join(", ")
        : "";

    // Handle area name
    const areaName =
      p.areaName ||
      p.cityName ||
      (p.area && (p.area.areaName || p.area.name)) ||
      p.location ||
      p.city ||
      "";

    // Handle user object
    const userObj =
      p.user && typeof p.user === "object"
        ? {
            id: p.user.id ?? null,
            firstName: p.user.firstName ?? p.user.first_name ?? "",
            lastName: p.user.lastName ?? p.user.last_name ?? "",
            mobile: p.user.mobile ?? p.user.phone ?? "",
          }
        : { id: null, firstName: "", lastName: "", mobile: "" };

    return {
      ...p,
      id,
      propertyId: id,
      imageUrl,
      propertyType: typeName ? { typeName } : null,
      type: typeName,
      areaName,
      amenities,
      user: userObj,
      priceDisplay: p.priceDisplay ?? null,
      isFeatured: p.isFeatured === true || p.isFeatured === 1 || p.isFeatured === "true",
      isActive: p.isActive === undefined ? true : !!p.isActive,
    };
  };

  const handlePropertyUpdated = () => {
    fetchMyProperties();
  };

  const handlePropertyDeleted = () => {
    fetchMyProperties();
  };

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Filter properties based on activeFilter
  const filteredProperties = properties.filter((p) => {
    if (activeFilter === "all") return true;
    return p.listingType?.toLowerCase() === activeFilter;
  });

  if (loading) {
    return (
      <div className="mp-container">
        <div className="mp-state mp-loading" role="status" aria-live="polite">
          <div className="mp-spinner" aria-hidden="true" />
          <h3 className="mp-loading-title">Loading your properties...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mp-container">
        <div className="mp-state mp-error">
          <h2 className="mp-error-title">Loading Failed</h2>
          <p className="mp-error-text">{error}</p>
          <button onClick={fetchMyProperties} className="mp-btn mp-btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const saleCount = properties.filter((p) => p.listingType === "sale").length;
  const rentCount = properties.filter((p) => p.listingType === "rent").length;
  const verifiedCount = properties.filter((p) => p.isVerified).length;

  return (
    <div className="mp-container">
      <header className="mp-header">
        <h1 className="mp-title">My Posted Properties</h1>
        <p className="mp-subtitle">
          Manage and track the properties you've listed
        </p>
      </header>

      {properties.length > 0 ? (
        <>
          <div className="mp-stats">
            <div className="mp-stat">
              <span className="mp-stat-label">Total Properties:</span>
              <span className="mp-stat-value">{properties.length}</span>
            </div>
            <div className="mp-stat">
              <span className="mp-stat-label">For Sale:</span>
              <span className="mp-stat-value">{saleCount}</span>
            </div>
            <div className="mp-stat">
              <span className="mp-stat-label">For Rent:</span>
              <span className="mp-stat-value">{rentCount}</span>
            </div>
            <div className="mp-stat">
              <span className="mp-stat-label">Verified:</span>
              <span className="mp-stat-value">{verifiedCount}</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="mp-filter-bar">
            <button
              className={`mp-filter-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => handleFilterChange("all")}
            >
              All ({properties.length})
            </button>
            <button
              className={`mp-filter-btn ${activeFilter === "sale" ? "active" : ""}`}
              onClick={() => handleFilterChange("sale")}
            >
              For Sale ({saleCount})
            </button>
            <button
              className={`mp-filter-btn ${activeFilter === "rent" ? "active" : ""}`}
              onClick={() => handleFilterChange("rent")}
            >
              For Rent ({rentCount})
            </button>
          </div>

          {filteredProperties.length > 0 ? (
            <div className="mp-grid" role="list">
              {filteredProperties.map((property) => (
                <div
                  className="mp-grid-item"
                  role="listitem"
                  key={property.propertyId || property.id}
                >
                  <PropertyCard
                    property={property}
                    onPropertyUpdated={handlePropertyUpdated}
                    onPropertyDeleted={handlePropertyDeleted}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="mp-state mp-empty-filter">
              <div className="mp-empty-ic" aria-hidden="true">
                🔍
              </div>
              <h3 className="mp-empty-title">
                No {activeFilter === "sale" ? "Sale" : "Rent"} Properties
              </h3>
              <p className="mp-empty-text">
                You haven't listed any properties{" "}
                {activeFilter === "sale" ? "for sale" : "for rent"} yet.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="mp-state mp-empty">
          <div className="mp-empty-ic" aria-hidden="true">
            🔭
          </div>
          <h3 className="mp-empty-title">No Properties Posted Yet</h3>
          <p className="mp-empty-text">
            Start by posting your first property to see it here.
          </p>
          <button
            onClick={onPostPropertyClick}
            className="mp-btn mp-btn-primary"
          >
            📝 Post Your Property
          </button>
        </div>
      )}
    </div>
  );
}

export default MyPropertiesPage;