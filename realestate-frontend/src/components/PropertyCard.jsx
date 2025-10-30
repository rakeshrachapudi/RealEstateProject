// PropertyCard.jsx (Enhanced with Agent/Admin Delete)
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import PropertyEditModal from "../PropertyEditModal";
import { deleteProperty } from "../services/api";

const PropertyCard = ({ property, dealInfo, onPropertyUpdated, onPropertyDeleted, onViewDealDetails }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isOwner = user && property?.user && user.id === property.user.id;
  // ⭐ NEW: Check if user is agent or admin
  const canDelete = isOwner || (user && (user.role === 'AGENT' || user.role === 'ADMIN'));

  const formatPrice = (price) => {
     if (price == null) return property?.priceDisplay || "Price on request";
     const numPrice = Number(price);
     if (isNaN(numPrice)) return "Invalid Price";
     if (numPrice >= 10000000) return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
     if (numPrice >= 100000) return `₹${(numPrice / 100000).toFixed(2)} Lac`;
     if (numPrice >= 1000) return `₹${(numPrice / 1000).toFixed(0)} K`;
     return `₹${numPrice.toLocaleString("en-IN")}`;
  };

  const getDefaultImage = () => "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";

  const handleClick = (e) => {
    if (e.target.closest("button")) return;
    const propertyId = property?.id || property?.propertyId;
    if (propertyId) navigate(`/property/${propertyId}`);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditModalOpen(true);
  };

  // ⭐ ENHANCED: Delete with confirmation modal
  const handleDelete = async (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      const propertyId = property.id || property.propertyId;
      const token = localStorage.getItem("authToken");

      console.log(`🗑️ Deleting property ${propertyId}...`);
      await deleteProperty(propertyId, token);

      alert("✅ Property deleted successfully!");
      setShowDeleteConfirm(false);

      if (onPropertyDeleted) onPropertyDeleted(propertyId);
    } catch (error) {
      console.error("❌ Error deleting property:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePropertyUpdatedInModal = () => {
    setIsEditModalOpen(false);
    if (onPropertyUpdated) onPropertyUpdated();
  };

  const handleViewDealClick = (e) => {
      e.stopPropagation();
      if (dealInfo && onViewDealDetails) {
          onViewDealDetails(dealInfo);
      }
  };

   const getStageColor = (stage) => {
       const colors = {
           'INQUIRY': '#3b82f6',
           'SHORTLIST': '#8b5cf6',
           'NEGOTIATION': '#f97316',
           'AGREEMENT': '#10b981',
           'REGISTRATION': '#06b6d4',
           'PAYMENT': '#ec4899',
           'COMPLETED': '#22c55e',
           default: '#6b7280'
       };
       return colors[stage] || colors.default;
   };

  if (!property) return null;

  return (
    <>
      <div style={styles.card} onClick={handleClick} className="property-card">
        {/* Badges */}
        <div style={styles.badgeContainer}>
            {property.isFeatured && <span style={styles.badge}>⭐ Featured</span>}
            {property.isVerified && <span style={styles.verifiedBadge}>✅ Verified</span>}
            {property.isReadyToMove && <span style={styles.readyBadge}>🏠 Ready to Move</span>}
        </div>

        {/* Image */}
        <div style={styles.imageContainer}>
           <img
             src={property.imageUrl || getDefaultImage()}
             alt={property.title || 'Property'}
             style={styles.image}
             onError={(e) => { e.target.src = getDefaultImage(); }}
           />
           <div style={styles.imageOverlay}></div>

           {/* Deal Stage Badge on image */}
           {dealInfo && (
             <span style={{
               ...styles.dealStageBadge,
               backgroundColor: getStageColor(dealInfo.stage || dealInfo.currentStage)
             }}>
               Stage: {dealInfo.stage || dealInfo.currentStage || "INQUIRY"}
             </span>
           )}
        </div>

        {/* Content */}
        <div style={styles.content}>
           <div style={styles.typeTag}>
             {property.listingType?.toLowerCase() === "sale" ? "FOR SALE" : "FOR RENT"}
           </div>

           <h3 style={styles.title}>{property.title || 'Property Title'}</h3>

           <div style={styles.location}>
             📍 {property.areaName || property.city || "Location"}
             {property.pincode && ` - ${property.pincode}`}
           </div>

           <div style={styles.price}>
             {formatPrice(property.price)}
             {property.listingType?.toLowerCase() === "rent" && (
               <span style={styles.perMonth}>/month</span>
             )}
           </div>

           <div style={styles.propertyType}>
             <strong>{property.propertyType?.typeName || property.type || 'N/A'}</strong>
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
               <strong>✨ Amenities:</strong> {
                 property.amenities.split(",")
                   .map(a => a.trim())
                   .filter(a => a)
                   .slice(0, 3)
                   .join(", ")
               }{property.amenities.split(",").length > 3 && "..."}
             </div>
           )}

           {property.user && (
             <div style={styles.postedBy}>
               👤 Posted by: {property.user.firstName || ''} {property.user.lastName || ''}
             </div>
           )}

          {/* Deal Button */}
          {dealInfo && (
            <div style={styles.dealInfoContainer}>
              <button
                onClick={handleViewDealClick}
                style={styles.viewDealBtn}
                className="view-deal-button"
              >
                👁️ View Deal
              </button>
            </div>
          )}

          {/* ⭐ ENHANCED: Edit/Delete Buttons (Now available to agents/admins too) */}
          {canDelete && (
            <div style={styles.actionButtons}>
              {isOwner && (
                <button onClick={handleEdit} style={styles.editBtn}>
                  ✏️ Edit
                </button>
              )}
              <button
                onClick={handleDelete}
                style={styles.deleteBtn}
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

      {/* ⭐ NEW: Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay} onClick={(e) => {
          if (e.target === e.currentTarget) setShowDeleteConfirm(false);
        }}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>⚠️ Confirm Deletion</h3>
            <p style={styles.modalText}>
              Are you sure you want to delete this property?
              <br /><br />
              <strong>{property.title}</strong>
              <br />
              <strong>ID: {property.id || property.propertyId}</strong>
              <br /><br />
              This action cannot be undone. All associated images, documents, and deals will be deleted.
            </p>
            <div style={styles.modalActions}>
              <button
                onClick={confirmDelete}
                style={styles.confirmDeleteBtn}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={styles.cancelBtn}
                disabled={isDeleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Styles ---
const styles = {
  card: {
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    position: "relative",
    border: "1px solid #e2e8f0",
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
    display: 'block',
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
    background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)",
  },
  dealStageBadge: {
    position: 'absolute',
    bottom: '1rem',
    left: '1rem',
    padding: '0.5rem 1rem',
    borderRadius: '2rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'white',
    zIndex: 2,
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    textTransform: 'uppercase',
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
    marginLeft: '4px'
  },
  propertyType: {
    background: "#f1f5f9",
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
  details: {
    display: "flex",
    gap: "1.5rem",
    paddingTop: "1rem",
    borderTop: "1px solid #f1f5f9",
    color: "#475569",
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
    color: '#667eea'
  },
  amenities: {
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid #f1f5f9",
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
    borderTop: "1px solid #f1f5f9",
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
    transition: "transform 0.2s, background 0.2s"
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
    transition: "transform 0.2s, background 0.2s"
  },
  dealInfoContainer: {
    display: "flex",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #f1f5f9",
  },
  viewDealBtn: {
    flexGrow: 1,
    padding: "10px 14px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
    transition: "transform 0.2s, background 0.2s",
    textAlign: 'center',
  },

  // ⭐ NEW: Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '500px',
    width: '90%',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    margin: '0 0 16px 0',
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
  },
  modalText: {
    fontSize: '15px',
    color: '#64748b',
    lineHeight: '1.6',
    marginBottom: '24px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },
  confirmDeleteBtn: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  },
  cancelBtn: {
    padding: '12px 24px',
    backgroundColor: '#e2e8f0',
    color: '#64748b',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '14px',
  },
};

export default PropertyCard;