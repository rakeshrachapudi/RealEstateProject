// src/components/PropertyCard.jsx
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

  if (!property) return null;

  const isOwner = user && property?.user && user.id === property.user.id;

  const formatPrice = (price) => {
    if (price == null) return property?.priceDisplay || "Price on request";
    const numPrice = Number(price);
    if (isNaN(numPrice)) return "Invalid Price";
    if (numPrice >= 10000000) return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    if (numPrice >= 100000) return `₹${(numPrice / 100000).toFixed(2)} Lac`;
    if (numPrice >= 1000) return `₹${(numPrice / 1000).toFixed(0)} K`;
    return `₹${numPrice.toLocaleString("en-IN")}`;
  };

  const getDefaultImage = () =>
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";

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
    if (!window.confirm("⚠️ Are you sure?")) return;
    setIsDeleting(true);
    try {
      const propertyId = property.id || property.propertyId;
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/${propertyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (!response.ok)
        throw new Error(`Failed to delete (Status: ${response.status})`);
      alert("✅ Property deleted!");
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

  const getStageColorClass = (stage) => {
    const key = (stage || "").toUpperCase();
    switch (key) {
      case "INQUIRY":
        return "stage-inquiry";
      case "SHORTLIST":
        return "stage-shortlist";
      case "NEGOTIATION":
        return "stage-negotiation";
      case "AGREEMENT":
        return "stage-agreement";
      case "REGISTRATION":
        return "stage-registration";
      case "PAYMENT":
        return "stage-payment";
      case "COMPLETED":
        return "stage-completed";
      default:
        return "stage-default";
    }
  };

  return (
    <>
      <div className="pc-card" onClick={handleCardClick}>
        {/* Badges (Top Right) */}
        <div className="pc-badges">
          {property.isFeatured && (
            <span className="pc-badge featured">⭐ Featured</span>
          )}
          {property.isVerified && (
            <span className="pc-badge verified">✅ Verified</span>
          )}
          {property.isReadyToMove && (
            <span className="pc-badge ready">🏠 Ready to Move</span>
          )}
        </div>

        {/* Image */}
        <div className="pc-image-wrap">
          <img
            className="pc-image"
            src={property.imageUrl || getDefaultImage()}
            alt={property.title || "Property"}
            onError={(e) => {
              e.currentTarget.src = getDefaultImage();
            }}
            loading="lazy"
          />
          <div className="pc-image-overlay" />

          {/* Deal Stage badge on image */}
          {dealInfo && (
            <span
              className={`pc-stage-badge ${getStageColorClass(
                dealInfo.stage || dealInfo.currentStage
              )}`}
            >
              Stage: {dealInfo.stage || dealInfo.currentStage || "INQUIRY"}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="pc-content">
          <div className="pc-type-tag">
            {property.listingType?.toLowerCase() === "sale"
              ? "FOR SALE"
              : "FOR RENT"}
          </div>

          <h3 className="pc-title">{property.title || "Property Title"}</h3>

          <div className="pc-location">
            📍 {property.areaName || property.city || "Location"}
            {property.pincode ? ` - ${property.pincode}` : ""}
          </div>

          <div className="pc-price">
            {formatPrice(property.price)}
            {property.listingType?.toLowerCase() === "rent" && (
              <span className="pc-per-month">/month</span>
            )}
          </div>

          <div className="pc-type">
            <strong>
              {property.propertyType ||
                property.propertyType?.typeName ||
                property.type ||
                "N/A"}
            </strong>
          </div>

          <div className="pc-details">
            {property.areaSqft && (
              <div className="pc-detail">
                <span className="pc-detail-icon">📐</span>
                <span>{property.areaSqft} sqft</span>
              </div>
            )}
            {property.bedrooms > 0 && (
              <div className="pc-detail">
                <span className="pc-detail-icon">🛏️</span>
                <span>{property.bedrooms} Beds</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="pc-detail">
                <span className="pc-detail-icon">🚿</span>
                <span>{property.bathrooms} Baths</span>
              </div>
            )}
          </div>

          {property.amenities && (
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

          {property.user && (
            <div className="pc-posted-by">
              👤 Posted by: {property.user.firstName || ""}{" "}
              {property.user.lastName || ""}
            </div>
          )}

          <div className="pc-ids">
            {(property.id || property.propertyId) && (
              <span className="pc-id-tag">
                Property ID: {property.id || property.propertyId}
              </span>
            )}
            {dealInfo?.dealId && (
              <span className="pc-deal-tag">Deal ID: {dealInfo.dealId}</span>
            )}
          </div>

          {/* Deal button */}
          {dealInfo && (
            <div className="pc-deal-actions">
              <button
                onClick={handleViewDealClick}
                className="pc-btn pc-btn-view"
              >
                👁️ View Deal
              </button>
            </div>
          )}

          {/* Owner Actions */}
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
