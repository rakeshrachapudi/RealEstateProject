// src/pages/AreaPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropertyList from "../components/PropertyList";
import SEOHead from "../components/SEO/SEOHead";
import { BACKEND_BASE_URL } from "../config/config";
import "./AreaPage.css";

const AreaPage = () => {
  const { areaName } = useParams();
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format area name for display (e.g., "kondapur" -> "Kondapur")
  const displayAreaName = areaName
    ? areaName
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    : "";

  useEffect(() => {
    const fetchAreaProperties = async () => {
      if (!areaName) return;

      setLoading(true);
      setError(null);

      try {
        // Convert URL format to API format (e.g., "jubilee-hills" -> "Jubilee Hills")
        const apiAreaName = areaName.replace(/_/g, ' ').replace(/-/g, ' ');

        const response = await fetch(
          `${BACKEND_BASE_URL}/api/properties/byArea/${apiAreaName}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch properties");
        }

        const data = await response.json();

        let results = [];
        if (data.success && Array.isArray(data.data)) {
          results = data.data;
        } else if (Array.isArray(data.data)) {
          results = data.data;
        } else if (Array.isArray(data)) {
          results = data;
        }

        setProperties(results);
      } catch (err) {
        console.error("Error fetching area properties:", err);
        setError(err.message);
        setProperties([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAreaProperties();
  }, [areaName]);

  const handlePropertyUpdated = () => {
    window.location.reload();
  };

  const handlePropertyDeleted = (deletedId) => {
    setProperties((prev) =>
      prev.filter(
        (p) =>
          String(p.id) !== String(deletedId) &&
          String(p.propertyId) !== String(deletedId)
      )
    );
  };

  const seoConfig = {
    title: `Properties in ${displayAreaName}, Hyderabad | Zero Brokerage - PropertyDealz`,
    description: `Find verified properties in ${displayAreaName}, Hyderabad with zero brokerage. Direct owner contact for flats, plots, villas. Browse ${properties.length}+ listings.`,
    keywords: `properties in ${displayAreaName}, ${displayAreaName} real estate, buy property ${displayAreaName}, rent flat ${displayAreaName}, zero brokerage ${displayAreaName}`,
    canonical: `https://www.propertydealz.in/area/${areaName}`,
  };

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonicalUrl={seoConfig.canonical}
      />

      <div className="area-page">
        {/* Breadcrumb */}
        <div className="area-breadcrumb">
          <button onClick={() => navigate("/")} className="area-breadcrumb-link">
            🏠 Home
          </button>
          <span className="area-breadcrumb-separator">›</span>
          <span className="area-breadcrumb-current">
            Properties in {displayAreaName}
          </span>
        </div>

        {/* Header */}
        <div className="area-header">
          <div className="area-header-content">
            <h1 className="area-title">
              Properties in {displayAreaName}, Hyderabad
            </h1>
            <p className="area-subtitle">
              {loading
                ? "Loading properties..."
                : properties.length === 0
                ? "No properties found in this area"
                : `${properties.length} ${
                    properties.length === 1 ? "property" : "properties"
                  } available`}
            </p>
          </div>
        </div>

        {/* Properties List */}
        <div className="area-content">
          {error ? (
            <div className="area-error">
              <span className="area-error-icon">⚠️</span>
              <h3>Error Loading Properties</h3>
              <p>{error}</p>
              <button onClick={() => navigate("/")} className="area-error-btn">
                ← Back to Home
              </button>
            </div>
          ) : (
            <PropertyList
              properties={properties}
              loading={loading}
              onPropertyUpdated={handlePropertyUpdated}
              onPropertyDeleted={handlePropertyDeleted}
            />
          )}
        </div>

        {/* Call to Action */}
        {!loading && properties.length > 0 && (
          <div className="area-cta">
            <div className="area-cta-box">
              <h3>Can't Find What You're Looking For?</h3>
              <p>
                Contact us directly or explore more properties across Hyderabad
              </p>
              <div className="area-cta-buttons">
                <button
                  onClick={() =>
                    window.open(
                      "https://wa.me/916309806984?text=Hi! I'm looking for properties in " +
                        displayAreaName,
                      "_blank"
                    )
                  }
                  className="area-cta-btn area-cta-whatsapp"
                >
                  💬 WhatsApp Us
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="area-cta-btn area-cta-explore"
                >
                  🏘️ Explore All Areas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AreaPage;