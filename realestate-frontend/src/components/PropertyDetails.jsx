// src/components/PropertyDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getPropertyDetails } from "../services/api";
import DealDetailsPopup from "../components/DealDetailsPopup";
import { BACKEND_BASE_URL } from "../config/config";
import "./PropertyDetails.css";

// Safe JSON parse
const safeJsonParse = async (response) => {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    await response.text();
    return null;
  } catch {
    return null;
  }
};

const PropertyDetails = ({ onLoginClick, onSignupClick }) => {
  const { id: propertyIdParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [existingDeal, setExistingDeal] = useState(null);
  const [showDealDetails, setShowDealDetails] = useState(false);
  const [checkingDeal, setCheckingDeal] = useState(false);

  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  const [propertyImages, setPropertyImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(true);

  const [creatingDeal, setCreatingDeal] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [buyerPhone, setBuyerPhone] = useState("");

  useEffect(() => {
    fetchPropertyDetails();
    fetchAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyIdParam]);

  useEffect(() => {
    if (property?.id) fetchPropertyImages(property.id);
  }, [property?.id]);

  useEffect(() => {
    if (property?.id && user?.id && user?.role) {
      checkForExistingDeal();
    } else {
      setExistingDeal(null);
    }
  }, [property?.id, user?.id, user?.role]);

  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/users/agents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        const result = await safeJsonParse(response);
        const raw =
          result?.success && Array.isArray(result.data)
            ? result.data
            : Array.isArray(result)
            ? result
            : [];
        const activeAgents = raw.filter((a) => a.isActive && a.mobileNumber);
        setAgents(activeAgents);
      } else {
        setAgents([]);
      }
    } catch {
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleContactAgent = () => {
    if (!user) {
      if (typeof onLoginClick === "function") onLoginClick();
      return;
    }
    if (agents.length === 0) {
      alert("No agents available at the moment. Please try again later.");
      return;
    }
    const selectedAgent = agents[Math.floor(Math.random() * agents.length)];
    let mobileNumber = (selectedAgent.mobileNumber || "").replace(/\D/g, "");
    if (mobileNumber.length === 10) mobileNumber = "91" + mobileNumber;

    const propertyTitle = property?.title || "Property";
    const propertyPrice = formatPrice(property?.price);
    const propertyLocation = property?.areaName || property?.city || "Location";

    const message =
      `Hi! I'm interested in this property:\n\n` +
      `🏠 *${propertyTitle}*\n` +
      `💰 Price: ${propertyPrice}\n` +
      `📍 Location: ${propertyLocation}\n\n` +
      `Could you please provide more details?`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${mobileNumber}?text=${encoded}`;
    window.open(url, "_blank");
  };

  const fetchPropertyImages = async (propertyId) => {
    setLoadingImages(true);
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/property-images/property/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.ok) {
        const images = await response.json();
        const sorted = (Array.isArray(images) ? images : [])
          .filter((img) => img.imageUrl)
          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        setPropertyImages(sorted);
      } else {
        setPropertyImages([]);
      }
    } catch {
      setPropertyImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((i) => (i === 0 ? propertyImages.length - 1 : i - 1));
  };
  const handleNextImage = () => {
    setCurrentImageIndex((i) => (i === propertyImages.length - 1 ? 0 : i + 1));
  };
  const handleThumbnailClick = (index) => setCurrentImageIndex(index);

  const getCurrentImageUrl = () => {
    if (propertyImages.length > 0)
      return propertyImages[currentImageIndex]?.imageUrl;
    return (
      property?.imageUrl ||
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop"
    );
  };

  const fetchPropertyDetails = async () => {
    setLoading(true);
    setError(null);
    setProperty(null);
    try {
      const data = await getPropertyDetails(propertyIdParam);
      setProperty(data);
    } catch (err) {
      setError("Failed to load property details.");
    } finally {
      setLoading(false);
    }
  };

  const checkForExistingDeal = async () => {
    if (!user?.id || !user?.role || !property?.id) {
      setExistingDeal(null);
    }
    setCheckingDeal(true);
    try {
      const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${
        user.id
      }/role/${user.role.toUpperCase()}`;
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error(`API Error ${response.status}`);
      const responseData = await safeJsonParse(response);
      const deals =
        responseData?.success && Array.isArray(responseData.data)
          ? responseData.data
          : Array.isArray(responseData)
          ? responseData
          : [];
      const found = deals.find(
        (d) => (d?.property?.id ?? d?.propertyId) == property.id
      );
      setExistingDeal(found || null);
    } catch {
      setExistingDeal(null);
    } finally {
      setCheckingDeal(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!user || (user.role !== "AGENT" && user.role !== "ADMIN")) {
      setCreateError("Only agents/admins can create deals.");
      return;
    }
    setCreateError(null);
    if (!buyerPhone || buyerPhone.replace(/\D/g, "").length !== 10) {
      setCreateError("Valid 10-digit buyer phone needed.");
      return;
    }
    setCreatingDeal(true);
    try {
      const searchRes = await fetch(
        `${BACKEND_BASE_URL}/api/users/search?phone=${buyerPhone}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (!searchRes.ok)
        throw new Error(`Buyer search failed: ${searchRes.status}`);
      const searchData = await safeJsonParse(searchRes);
      const buyer = searchData?.success ? searchData.data : null;
      if (!buyer?.id) throw new Error("Buyer not found.");
      if ((buyer.role || "").toUpperCase() !== "USER")
        throw new Error(
          `The user is a ${buyer.role}. Only USER can be the buyer.`
        );

      const createRes = await fetch(`${BACKEND_BASE_URL}/api/deals/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          propertyId: property.id,
          buyerId: buyer.id,
          agentId: user.id,
        }),
      });
      const createData = await safeJsonParse(createRes);
      if (!createRes.ok || !createData?.success) {
        throw new Error(
          createData?.message || `Failed to create deal (${createRes.status}).`
        );
      }
      alert("✅ Deal created!");
      setBuyerPhone("");
      setCreateError(null);
      setTimeout(checkForExistingDeal, 400);
    } catch (err) {
      setCreateError(err.message || "Error occurred.");
    } finally {
      setCreatingDeal(false);
    }
  };

  const handleRefreshDeal = () => {
    setShowDealDetails(false);
    checkForExistingDeal();
  };

  const formatPrice = (price) => {
    if (price == null) return "Price on request";
    const n = Number(price);
    if (isNaN(n)) return "Invalid Price";
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} Lac`;
    return `₹${n.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="pd-state pd-loading">
        <div className="pd-spinner" />
        <p className="pd-loading-text">Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="pd-state pd-error">
        <div className="pd-error-ic" aria-hidden="true">
          🏠
        </div>
        <h2 className="pd-error-title">Oops! Something went wrong</h2>
        <p className="pd-error-msg">{error || "Property not found."}</p>
        <button onClick={() => navigate(-1)} className="pd-back">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="pd-page">
        <div className="pd-container">
          <button onClick={() => navigate(-1)} className="pd-back">
            ← Back
          </button>

          {/* Image gallery */}
          <div className="pd-images">
            {loadingImages ? (
              <div className="pd-image-loading">
                <div className="pd-spinner" />
                <p>Loading...</p>
              </div>
            ) : (
              <>
                <div className="pd-image-main">
                  <img
                    src={getCurrentImageUrl()}
                    alt={property.title || "Property"}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";
                    }}
                  />

                  {propertyImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        className="pd-img-nav pd-img-left"
                        aria-label="Previous image"
                      >
                        ‹
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="pd-img-nav pd-img-right"
                        aria-label="Next image"
                      >
                        ›
                      </button>

                      <div className="pd-img-count">
                        {currentImageIndex + 1}/{propertyImages.length}
                      </div>
                    </>
                  )}
                </div>

                {propertyImages.length > 1 && (
                  <div className="pd-thumbs">
                    {propertyImages.slice(0, 5).map((image, index) => (
                      <img
                        key={image.id || index}
                        src={image.imageUrl}
                        alt={`View ${index + 1}`}
                        className={`pd-thumb ${
                          index === currentImageIndex ? "active" : ""
                        }`}
                        onClick={() => handleThumbnailClick(index)}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=150&fit=crop";
                        }}
                      />
                    ))}
                    {propertyImages.length > 5 && (
                      <div className="pd-more">
                        +{propertyImages.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Main content */}
          <div className="pd-main">
            {/* Left */}
            <div className="pd-left card">
              <div className="pd-head">
                <div className="pd-head-top">
                  {property.isFeatured && (
                    <span className="pd-badge">⭐ Featured</span>
                  )}
                  <span className="pd-type">
                    {property.listingType?.toLowerCase() === "sale"
                      ? "SALE"
                      : "RENT"}
                  </span>
                </div>

                <h1 className="pd-title">{property.title || "Property"}</h1>

                <div className="pd-loc">
                  <span className="pd-loc-ic">📍</span>
                  <span className="pd-loc-txt">
                    {property.areaName || property.city || "Location"}
                  </span>
                </div>

                <div className="pd-price">
                  <span className="pd-price-amt">
                    {formatPrice(property.price)}
                  </span>
                  {property.listingType?.toLowerCase() === "rent" && (
                    <span className="pd-price-period">/month</span>
                  )}
                </div>
              </div>

              <div className="pd-keys">
                {property.areaSqft && (
                  <div className="pd-key">
                    <span className="pd-key-ic">📐</span>
                    <div>
                      <div className="pd-key-label">Area</div>
                      <div className="pd-key-val">
                        {property.areaSqft} sq ft
                      </div>
                    </div>
                  </div>
                )}
                {property.bedrooms > 0 && (
                  <div className="pd-key">
                    <span className="pd-key-ic">🛏️</span>
                    <div>
                      <div className="pd-key-label">Beds</div>
                      <div className="pd-key-val">{property.bedrooms}</div>
                    </div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="pd-key">
                    <span className="pd-key-ic">🚿</span>
                    <div>
                      <div className="pd-key-label">Baths</div>
                      <div className="pd-key-val">{property.bathrooms}</div>
                    </div>
                  </div>
                )}
                {property.propertyType && (
                  <div className="pd-key">
                    <span className="pd-key-ic">🏠</span>
                    <div>
                      <div className="pd-key-label">Type</div>
                      <div className="pd-key-val">
                        {property.propertyType.typeName || property.type}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {property.description && (
                <div className="pd-section">
                  <h3 className="pd-subtitle">Description</h3>
                  <p className="pd-desc">{property.description}</p>
                </div>
              )}

              {property.amenities && (
                <div className="pd-section">
                  <h3 className="pd-subtitle">Amenities</h3>
                  <div className="pd-amenities">
                    {property.amenities
                      .split(",")
                      .map((a) => a.trim())
                      .filter((a) => a)
                      .slice(0, 8)
                      .map((amenity, idx) => (
                        <div key={idx} className="pd-chip">
                          {amenity}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="pd-right">
              <div className="pd-contact card">
                <h3 className="pd-contact-title">Contact Agent</h3>

                {property.user && (
                  <div className="pd-owner">
                    <div className="pd-avatar">
                      {(property.user.firstName?.[0] || "A").toUpperCase()}
                    </div>
                    <div>
                      <div className="pd-owner-label">Listed by</div>
                      <div className="pd-owner-name">
                        {property.user.firstName || ""}{" "}
                        {property.user.lastName || "Agent"}
                      </div>
                    </div>
                  </div>
                )}

                <div className="pd-contact-actions">
                  <button
                    className="pd-btn pd-btn-wa"
                    onClick={handleContactAgent}
                    disabled={loadingAgents || agents.length === 0}
                    aria-busy={loadingAgents}
                  >
                    <span aria-hidden="true">
                      {loadingAgents ? "⏳" : "💬"}
                    </span>
                    {user ? "WhatsApp" : "Login to chat"}
                  </button>

                  <button className="pd-btn pd-btn-phone">
                    <span aria-hidden="true">📞</span>
                    Call
                  </button>
                </div>

                <div className="pd-agent-status">
                  {loadingAgents && (
                    <span className="pd-status pd-status-loading">
                      Finding agents...
                    </span>
                  )}
                  {!loadingAgents && agents.length === 0 && (
                    <span className="pd-status pd-status-unavailable">
                      No agents available
                    </span>
                  )}
                  {!loadingAgents && agents.length > 0 && (
                    <span className="pd-status pd-status-available">
                      {agents.length} agent{agents.length > 1 ? "s" : ""}{" "}
                      available
                    </span>
                  )}
                </div>
              </div>

              <div className="pd-deal card">
                <h4 className="pd-deal-title">Deal Status</h4>

                {checkingDeal && (
                  <div className="pd-deal-loading">
                    <div className="pd-spinner small" />
                    <span>Checking...</span>
                  </div>
                )}

                {!checkingDeal && existingDeal && (
                  <div className="pd-deal-exists">
                    <div className="pd-deal-badge">✅ Active Deal</div>
                    <div className="pd-deal-info">
                      <strong>Stage:</strong>{" "}
                      {existingDeal.stage ||
                        existingDeal.currentStage ||
                        "INQUIRY"}
                    </div>
                    <button
                      onClick={() => setShowDealDetails(true)}
                      className="pd-btn pd-btn-view"
                    >
                      View Details
                    </button>
                  </div>
                )}

                {!checkingDeal && !existingDeal && (
                  <div className="pd-deal-none">
                    <div className="pd-deal-none-badge">ℹ️ No active deals</div>

                    {user &&
                      (user.role === "AGENT" || user.role === "ADMIN") && (
                        <div className="pd-deal-create">
                          <input
                            type="tel"
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value)}
                            placeholder="Buyer phone"
                            className="pd-input"
                            maxLength={10}
                            inputMode="numeric"
                          />
                          <button
                            onClick={handleCreateDeal}
                            className="pd-btn pd-btn-primary"
                            disabled={creatingDeal}
                          >
                            {creatingDeal ? "⏳" : "➕"} Create
                          </button>
                          {createError && (
                            <div className="pd-alert">{createError}</div>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>

              <div className="pd-details card">
                <h4 className="pd-details-title">Details</h4>
                <div className="pd-details-list">
                  <div className="pd-detail-row">
                    <span>Price:</span>
                    <span>{formatPrice(property.price)}</span>
                  </div>
                  {property.address && (
                    <div className="pd-detail-row">
                      <span>Address:</span>
                      <span>{property.address}</span>
                    </div>
                  )}
                  {property.pincode && (
                    <div className="pd-detail-row">
                      <span>Pincode:</span>
                      <span>{property.pincode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {showDealDetails && existingDeal && (
          <DealDetailsPopup
            deal={existingDeal}
            onClose={() => setShowDealDetails(false)}
            onDealUpdated={handleRefreshDeal}
          />
        )}

        <button
          className="pd-fab"
          onClick={handleContactAgent}
          disabled={loadingAgents || agents.length === 0}
          aria-label="Contact via WhatsApp"
        >
          💬
        </button>
      </div>
    </>
  );
};

export default PropertyDetails;
