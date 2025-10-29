// realestate-frontend/src/pages/MyPropertiesPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import PropertyCard from "../components/PropertyCard";
import { styles } from "../styles.js";
import { BACKEND_BASE_URL } from "../config/config";

function MyPropertiesPage({ onPostPropertyClick }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Used for critical fetch errors (e.g., network down)
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) {
      console.log("❌ No user ID, redirecting to home");
      navigate("/");
      return;
    }
    fetchMyProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchMyProperties = async () => {
    if (!user?.id) {
      console.log("❌ Cannot fetch: No user ID");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log("📥 Fetching properties for user ID:", user.id);

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      console.log("Response status:", response.status);

      if (response.status === 404 || response.status === 204) {
        // Handle common "No content" or "Not found" response for empty list gracefully
        setProperties([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Received data:", data);

      const propertiesArray = Array.isArray(data) ? data : data.data || [];

      console.log(`✅ Found ${propertiesArray.length} properties for user`);
      setProperties(propertiesArray);

    } catch (err) {
      // Only set error for non-recoverable issues like network problems
      console.error("❌ Error fetching properties:", err);
      setError("Failed to load properties. Please check your connection.");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyUpdated = () => {
    console.log("🔄 Property updated, refreshing list...");
    fetchMyProperties();
  };

  const handlePropertyDeleted = () => {
    console.log("🔄 Property deleted, refreshing list...");
    fetchMyProperties();
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}>⏳</div>
          <h3>Loading your properties...</h3>
        </div>
      </div>
    );
  }

  // Display a critical error screen only for network/server failures
  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2>❌ Loading Failed</h2>
          <p>{error}</p>
          <button onClick={fetchMyProperties} style={styles.retryBtn}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- Main Render Logic ---
  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>📁 My Posted Properties</h1>
        <p style={styles.pageSubtitle}>
          Manage and track the properties you've listed
        </p>
      </div>

      {properties.length > 0 ? (
        <>
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Properties:</span>
              <span style={styles.statValue}>{properties.length}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>For Sale:</span>
              <span style={styles.statValue}>
                {properties.filter((p) => p.listingType === "sale").length}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>For Rent:</span>
              <span style={styles.statValue}>
                {properties.filter((p) => p.listingType === "rent").length}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Verified:</span>
              <span style={styles.statValue}>
                {properties.filter((p) => p.isVerified).length}
              </span>
            </div>
          </div>

          <div style={styles.grid}>
            {properties.map((property) => (
              <PropertyCard
                key={property.propertyId || property.id}
                property={property}
                onPropertyUpdated={handlePropertyUpdated}
                onPropertyDeleted={handlePropertyDeleted}
              />
            ))}
          </div>
        </>
      ) : (
        // Simplified Empty State
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No Properties Posted Yet</h3>
          <p style={styles.emptyText}>
            Start by posting your first property to see it here
          </p>
          <button onClick={onPostPropertyClick} style={styles.postBtn}>
            <span style={styles.btnIcon}>📝</span> Post Your Property
          </button>
        </div>
      )}
    </div>
  );
}

export default MyPropertiesPage;