// realestate-frontend/src/components/PropertyCard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import PropertyEditModal from "../PropertyEditModal";
import { BACKEND_BASE_URL } from "../config/config";

const PropertyCard = ({ property, onPropertyUpdated, onPropertyDeleted }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ⭐ DEBUG: Log to console
  console.log("🔍 PropertyCard Debug:", {
    propertyId: property.id || property.propertyId,
    propertyUser: property.user,
    currentUser: user,
    hasUser: !!user,
    hasPropertyUser: !!property.user,
    userMatch: user && property.user ? user.id === property.user.id : false,
  });

  // Check if current user owns this property
  const isOwner = user && property.user && user.id === property.user.id;

  console.log("👤 Is Owner:", isOwner);

  const formatPrice = (price) => {
    if (!price) return property.priceDisplay || "Price on request";
    const numPrice = typeof price === "number" ? price : parseFloat(price);
    if (numPrice >= 10000000) return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    else if (numPrice >= 100000)
      return `₹${(numPrice / 100000).toFixed(2)} Lac`;
    else if (numPrice >= 1000) return `₹${(numPrice / 1000).toFixed(0)} K`;
    return `₹${numPrice.toLocaleString("en-IN")}`;
  };

  const getDefaultImage = () => {
    return "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";
  };

  const handleClick = (e) => {
    if (e.target.closest("button")) return;
    const propertyId = property.id || property.propertyId;
    navigate(`/property/${propertyId}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    console.log("✏️ Edit clicked for property:", property.id);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("⚠️ Are you sure you want to delete this property?"))
      return;

    setIsDeleting(true);
    try {
      const propertyId = property.id || property.propertyId;
      console.log("🗑️ Deleting property:", propertyId);

      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/${propertyId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("✅ Property deleted successfully!");
        if (onPropertyDeleted) onPropertyDeleted();
      } else {
        alert("❌ Failed to delete property");
      }
    } catch (error) {
      console.error("❌ Error deleting property:", error);
      alert("❌ Error deleting property");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePropertyUpdated = () => {
    console.log("✅ Property updated successfully");
    setIsEditModalOpen(false);
    if (onPropertyUpdated) onPropertyUpdated();
  };

  return (
    <>
      <div style={styles.card} onClick={handleClick} className="property-card">
        {/* Badges Container */}
        <div style={styles.badgeContainer}>
          {property.isFeatured && <span style={styles.badge}>⭐ Featured</span>}
          {property.isVerified && (
            <span style={styles.verifiedBadge}>✅ Verified</span>
          )}
          {property.isReadyToMove && (
            <span style={styles.readyBadge}>🏠 Ready to Move</span>
          )}
        </div>

        {/* Image */}
        <div style={styles.imageContainer}>
          <img
            src={property.imageUrl || getDefaultImage()}
            alt={property.title}
            style={styles.image}
            onError={(e) => {
              e.target.src = getDefaultImage();
            }}
          />
          <div style={styles.imageOverlay}></div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          <div style={styles.typeTag}>
            {property.listingType === "sale" || property.listingType === "SALE"
              ? "FOR SALE"
              : "FOR RENT"}
          </div>

          <h3 style={styles.title}>{property.title}</h3>

          <div style={styles.location}>
            📍 {property.areaName || property.city || "Location"},
            {property.cityName || "Hyderabad"}
            {property.pincode && ` - ${property.pincode}`}
          </div>

          <div style={styles.price}>
            {formatPrice(property.price)}
            {(property.listingType === "rent" ||
              property.listingType === "RENT") && (
              <span style={styles.perMonth}>/month</span>
            )}
          </div>

          <div style={styles.propertyType}>
            <strong>{property.propertyType || property.type}</strong>
            {property.ownerType && (
              <span style={styles.ownerTypeBadge}>
                {property.ownerType === "owner" ? "👤 Owner" : "🏢 Broker"}
              </span>
            )}
          </div>

          <div style={styles.details}>
            {property.areaSqft && (
              <div style={styles.detail}>
                <span style={styles.detailIcon}>📐</span>
                <span>{property.areaSqft} sqft</span>
              </div>
            )}
            {property.bedrooms > 0 && (
              <div style={styles.detail}>
                <span style={styles.detailIcon}>🛏️</span>
                <span>{property.bedrooms} Beds</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div style={styles.detail}>
                <span style={styles.detailIcon}>🚿</span>
                <span>{property.bathrooms} Baths</span>
              </div>
            )}
          </div>

          {property.amenities && (
            <div style={styles.amenities}>
              <strong>✨ Amenities:</strong>{" "}
              {property.amenities.split(",").slice(0, 3).join(", ")}
              {property.amenities.split(",").length > 3 && "..."}
            </div>
          )}

          {property.user && (
            <div style={styles.postedBy}>
              👤 Posted by: {property.user.firstName} {property.user.lastName}
            </div>
          )}

          {/* ⭐ EDIT/DELETE BUTTONS - ALWAYS VISIBLE FOR DEBUGGING */}
          {isOwner && (
            <div style={styles.actionButtons}>
              <button onClick={handleEdit} style={styles.editBtn}>
                ✏️ Edit
              </button>
              <button
                onClick={handleDelete}
                style={styles.deleteBtn}
                disabled={isDeleting}
              >
                {isDeleting ? "⏳" : "🗑️"} Delete
              </button>
            </div>
          )}

          {/* ⭐ DEBUG INFO - REMOVE AFTER TESTING */}
          {user && (
            <div style={styles.debugInfo}>
              <small>
                Debug: User ID={user.id} | Property User={property.user?.id} |
                IsOwner={isOwner ? "✅" : "❌"}
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <PropertyEditModal
          property={property}
          onClose={() => setIsEditModalOpen(false)}
          onPropertyUpdated={handlePropertyUpdated}
        />
      )}
    </>
  );
};

const styles = {
  card: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  badgeContainer: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    zIndex: 2,
  },
  badge: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "2rem",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
  },
  verifiedBadge: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "2rem",
    fontSize: "0.75rem",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
  readyBadge: {
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "2rem",
    fontSize: "0.75rem",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "220px",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)",
  },
  content: {
    padding: "24px",
  },
  typeTag: {
    display: "inline-block",
    padding: "0.4rem 1rem",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    borderRadius: "1rem",
    fontSize: "0.75rem",
    fontWeight: "700",
    marginBottom: "1rem",
    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)",
  },
  title: {
    fontSize: "20px",
    marginBottom: "12px",
    fontWeight: "700",
    color: "#1e293b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  location: {
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "1rem",
    fontWeight: "500",
  },
  price: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#059669",
    marginBottom: "1rem",
  },
  perMonth: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#64748b",
  },
  propertyType: {
    background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    marginBottom: "1rem",
    fontSize: "14px",
    color: "#475569",
    fontWeight: "600",
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ownerTypeBadge: {
    fontSize: "12px",
    padding: "4px 8px",
    background: "#dbeafe",
    color: "#1e40af",
    borderRadius: "6px",
    fontWeight: "600",
  },
  details: {
    display: "flex",
    gap: "1.5rem",
    paddingTop: "1rem",
    borderTop: "2px solid #f1f5f9",
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "1rem",
  },
  detail: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "500",
  },
  detailIcon: {
    fontSize: "16px",
  },
  amenities: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "2px solid #f1f5f9",
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.5",
  },
  postedBy: {
    fontSize: "13px",
    color: "#475569",
    marginTop: "12px",
    fontWeight: "600",
    padding: "8px 12px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "2px solid #f1f5f9",
  },
  editBtn: {
    flex: 1,
    padding: "12px 16px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    transition: "transform 0.2s",
  },
  deleteBtn: {
    flex: 1,
    padding: "12px 16px",
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
    transition: "transform 0.2s",
  },
  debugInfo: {
    marginTop: "12px",
    padding: "8px",
    background: "#fef3c7",
    borderRadius: "6px",
    fontSize: "11px",
    color: "#92400e",
    fontFamily: "monospace",
  },
};

export default PropertyCard;
