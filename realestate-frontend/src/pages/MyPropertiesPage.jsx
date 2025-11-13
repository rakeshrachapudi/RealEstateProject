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
  // ADDITION 1: State for active filter
  const [activeFilter, setActiveFilter] = useState("all");
  const navigate = useNavigate();

  // ✅ Fetch Primary Image for each property
  const getPrimaryImage = async (propertyId) => {
    try {
      const res = await fetch(
        `${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`
      );
      if (!res.ok) return null;

      const list = await res.json();
      if (!Array.isArray(list) || list.length === 0) return null;

      const primary = list.find((img) => img.isPrimary) || list[0];
      return primary.imageUrl || null;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    if (!user?.id) {
      navigate("/");
      return;
    }
    fetchMyProperties();
  }, [user?.id]);

  // ✅ Updated function to attach image URLs
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

      // ✅ Attach S3 Image URL to each property
      const withImages = await Promise.all(
        propertiesArray.map(async (p) => {
          const id = p.id || p.propertyId;
          const img = await getPrimaryImage(id);

          return {
            ...p,
            imageUrl: img || null,
          };
        })
      );

      setProperties(withImages);
    } catch (err) {
      console.error("Failed to load properties:", err);
      setError("Failed to load properties. Please check your connection.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyUpdated = () => {
    fetchMyProperties();
  };

  const handlePropertyDeleted = () => {
    fetchMyProperties();
  };

  // ADDITION 2: Function to handle filter change
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // ADDITION 3: Logic to filter properties based on activeFilter
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

          {/* ADDITION 4: Filter Bar */}
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
          {/* END Filter Bar */}


          {filteredProperties.length > 0 ? (
            <div className="mp-grid" role="list">
              {/* Using filteredProperties here */}
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
              <h3 className="mp-empty-title">No {activeFilter === 'sale' ? 'Sale' : 'Rent'} Properties</h3>
              <p className="mp-empty-text">
                You haven't listed any properties {activeFilter === 'sale' ? 'for sale' : 'for rent'} yet.
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="mp-state mp-empty">
          <div className="mp-empty-ic" aria-hidden="true">
            📭
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