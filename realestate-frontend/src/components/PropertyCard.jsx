// src/components/PropertyCard.jsx - ENHANCED VERSION
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import PropertyEditModal from "../PropertyEditModal";
import { BACKEND_BASE_URL } from "../config/config";
import "./PropertyCard.css";

const PropertyCard = ({
  property,
  dealInfo,
  onPropertyUpdated,
  onPropertyDeleted,
  onViewDealDetails,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!property) return null;

  const isOwner = user && property?.user && user.id === property.user.id;

  // ========== Helper Functions ==========

  const formatPrice = (price) => {
    if (price == null) return property?.priceDisplay || "Price on request";
    const numPrice = Number(price);
    if (isNaN(numPrice)) return "Invalid Price";
    if (numPrice >= 10000000) return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    if (numPrice >= 100000) return `₹${(numPrice / 100000).toFixed(2)} Lac`;
    if (numPrice >= 1000) return `₹${(numPrice / 1000).toFixed(0)} K`;
    return `₹${numPrice.toLocaleString("en-IN")}`;
  };

  const formatDecimal = (value) => {
    if (!value) return null;
    const num = Number(value);
    return num % 1 === 0 ? num.toString() : num.toFixed(1);
  };

  const getDefaultImage = () =>
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";

  const getImageUrl = () => {
    if (imageError) return getDefaultImage();
    if (property.imageUrl && property.imageUrl !== "null" && String(property.imageUrl).trim() !== "") {
      return property.imageUrl;
    }
    return getDefaultImage();
  };

  const getPropertyType = () => {
    if (property.propertyType && typeof property.propertyType === "object") {
      return property.propertyType.typeName || property.type || "N/A";
    }
    return property.type || property.propertyType || "N/A";
  };

  const getConstructionStatusDisplay = () => {
    const status = property.constructionStatus;
    if (!status) return null;

    const statusLower = status.toLowerCase().replace(/[_\s]/g, "");

    if (statusLower === "readytomove" || statusLower === "ready") {
      return "🏠 Ready to Move";
    } else if (statusLower === "underconstruction" || statusLower === "construction") {
      const year = property.possessionYear;
      const month = property.possessionMonth;

      if (year && month) {
        return `🚧 Under Construction (Possession: ${month} ${year})`;
      } else if (year) {
        return `🚧 Under Construction (Possession: ${year})`;
      }
      return "🚧 Under Construction";
    }

    // Fallback for any other status value
    return `📋 ${status}`;
  };

  const getStageColorClass = (stage) => {
    const key = (stage || "").toUpperCase();
    switch (key) {
      case "INQUIRY": return "stage-inquiry";
      case "SHORTLIST": return "stage-shortlist";
      case "NEGOTIATION": return "stage-negotiation";
      case "AGREEMENT": return "stage-agreement";
      case "REGISTRATION": return "stage-registration";
      case "PAYMENT": return "stage-payment";
      case "COMPLETED": return "stage-completed";
      default: return "stage-default";
    }
  };

  // ========== Event Handlers ==========

  const handleCardClick = (e) => {
    if (e.target.closest("button")) return;
    const propertyId = property?.id || property?.propertyId;
    if (propertyId) navigate(`/property/${propertyId}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("⚠️ Are you sure you want to delete this property?")) return;

    setIsDeleting(true);
    try {
      const propertyId = property.id || property.propertyId;
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/${propertyId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete (Status: ${response.status})`);
      }

      alert("✅ Property deleted successfully!");
      onPropertyDeleted && onPropertyDeleted(propertyId);
    } catch (error) {
      console.error("❌ Error deleting property:", error);
      alert(`❌ Error deleting property: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePropertyUpdatedInModal = () => {
    setIsEditModalOpen(false);
    onPropertyUpdated && onPropertyUpdated();
  };

  const handleViewDealClick = (e) => {
    e.stopPropagation();
    if (dealInfo && onViewDealDetails) {
      onViewDealDetails(dealInfo);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // ========== Render ==========

  return (
    <>
      <div className="pc-card" onClick={handleCardClick}>
        {/* Top Right Badges */}
        <div className="pc-badges">
          {property.isFeatured && (
            <span className="pc-badge featured">⭐ Featured</span>
          )}
          {property.isVerified && (
            <span className="pc-badge verified">✅ Verified</span>
          )}
          {property.isReadyToMove && (
            <span className="pc-badge ready">🏠 Ready</span>
          )}
        </div>

        {/* Image Section */}
        <div className="pc-image-wrap">
          <img
            className="pc-image"
            src={getImageUrl()}
            alt={property.title || "Property"}
            onError={handleImageError}
            loading="lazy"
          />
          <div className="pc-image-overlay" />

          {/* Deal Stage Badge on Image */}
          {dealInfo && (
            <span className={`pc-stage-badge ${getStageColorClass(dealInfo.stage || dealInfo.currentStage)}`}>
              Stage: {dealInfo.stage || dealInfo.currentStage || "INQUIRY"}
            </span>
          )}
        </div>

        {/* Content Section */}
        <div className="pc-content">
          {/* Listing Type Tag */}
          <div className="pc-type-tag">
            {property.listingType?.toLowerCase() === "sale" ? "FOR SALE" : "FOR RENT"}
          </div>

          {/* Title */}
          <h3 className="pc-title">{property.title || "Property Title"}</h3>

          {/* Location */}
          <div className="pc-location">
            📍 {property.areaName || property.city || "Location"}
            {property.pincode ? ` - ${property.pincode}` : ""}
          </div>

          {/* Price */}
          <div className="pc-price">
            {formatPrice(property.price)}
            {property.listingType?.toLowerCase() === "rent" && (
              <span className="pc-per-month">/month</span>
            )}
          </div>

          {/* Price Per Sqft (if available) */}
          {property.pricePerSqft && Number(property.pricePerSqft) > 0 && (
            <div className="pc-price-per-sqft">
              💵 ₹{Number(property.pricePerSqft).toLocaleString("en-IN")}/sqft
            </div>
          )}

          {/* Property Type */}
          <div className="pc-type">
            <strong>{getPropertyType()}</strong>
          </div>

          {/* Construction Status */}
          {getConstructionStatusDisplay() && (
            <div className="pc-construction-status">
              {getConstructionStatusDisplay()}
            </div>
          )}

          {/* Property Details (Area, Beds, Baths, Balconies) */}
          <div className="pc-details">
            {property.areaSqft && Number(property.areaSqft) > 0 && (
              <div className="pc-detail">
                <span className="pc-detail-icon">📐</span>
                <span>{Number(property.areaSqft).toLocaleString("en-IN")} sqft</span>
              </div>
            )}
            {property.bedrooms > 0 && (
              <div className="pc-detail">
                <span className="pc-detail-icon">🛏️</span>
                <span>{formatDecimal(property.bedrooms)} Beds</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="pc-detail">
                <span className="pc-detail-icon">🚿</span>
                <span>{formatDecimal(property.bathrooms)} Baths</span>
              </div>
            )}
            {property.balconies > 0 && (
              <div className="pc-detail">
                <span className="pc-detail-icon">🏡</span>
                <span>{formatDecimal(property.balconies)} Balconies</span>
              </div>
            )}
          </div>

          {/* Amenities */}
          {property.amenities && property.amenities.trim() && (
            <div className="pc-amenities">
              <strong>✨ Amenities:</strong>{" "}
              {property.amenities
                .split(",")
                .map((a) => a.trim())
                .filter((a) => a)
                .slice(0, 3)
                .join(", ")}
              {property.amenities.split(",").length > 3 && "..."}
            </div>
          )}

          {/* ⭐ POSTED BY ROLE FIX (Ensures capitalization for Agent/Broker/Owner) ⭐ */}
          {(property.postedByRole || property.ownerType) && (
            <div className="pc-owner-type">
              👤 Posted by:{" "}
              <strong>
                {(property.postedByRole || property.ownerType)
                  .replace(/^(owner|agent|broker|developer|builder)$/i, (match) =>
                      match.charAt(0).toUpperCase() + match.slice(1)
                  ) || "N/A"}
              </strong>
            </div>
          )}
          {/* ⭐ END FIX ⭐ */}

          {/* Posted By Information */}
          {property.user && (
            <div className="pc-posted-by">
              📞 {property.user.firstName || ""} {property.user.lastName || ""}
              {/* Note: property.user.mobile is the correct field from HomePage.jsx normalizeProperty */}
              {property.user.mobile && ` • ${property.user.mobile}`}
            </div>
          )}

          {/* IDs Section - RERA, HMDA, Property ID, Deal ID */}
          <div className="pc-ids">
            {/* ⭐ RERA ID - Highlighted if present */}
            {property.reraId && property.reraId.trim() && (
              <span className="pc-id-tag pc-statutory-tag pc-highlight">
                ✅ RERA: {property.reraId.trim()}
              </span>
            )}

            {/* ⭐ HMDA ID - Highlighted if present */}
            {property.hmdaId && property.hmdaId.trim() && (
              <span className="pc-id-tag pc-statutory-tag pc-highlight">
                ✅ HMDA: {property.hmdaId.trim()}
              </span>
            )}

            {/* Property ID */}
            {(property.id || property.propertyId) && (
              <span className="pc-id-tag">
                Property ID: {property.id || property.propertyId}
              </span>
            )}

            {/* Deal ID (if applicable) */}
            {dealInfo?.dealId && (
              <span className="pc-id-tag pc-deal-tag">
                Deal ID: {dealInfo.dealId}
              </span>
            )}
          </div>

          {/* Deal Actions (if deal exists) */}
          {dealInfo && (
            <div className="pc-deal-actions">
              <button onClick={handleViewDealClick} className="pc-btn pc-btn-view">
                👁️ View Deal
              </button>
            </div>
          )}

          {/* Owner Actions (Edit/Delete) */}
          {isOwner && (
            <div className="pc-actions">
              <button onClick={handleEdit} className="pc-btn pc-btn-edit">
                ✏️ Edit
              </button>
              <button
                onClick={handleDelete}
                className="pc-btn pc-btn-delete"
                disabled={isDeleting}
              >
                {isDeleting ? "⏳" : "🗑️"} Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <PropertyEditModal
          property={property}
          onClose={() => setIsEditModalOpen(false)}
          onPropertyUpdated={handlePropertyUpdatedInModal}
        />
      )}
    </>
  );
};

export default PropertyCard;