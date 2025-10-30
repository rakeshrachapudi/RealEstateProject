// PropertyDetails.jsx — Professional visuals + subtle animations, logic intact
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getPropertyDetails } from "../services/api";
import DealDetailsPopup from "../components/DealDetailsPopup";
import { BACKEND_BASE_URL } from "../config/config";

// Inject keyframes once
const keyframes = `
@keyframes fadeInUp { 0% { opacity: 0; transform: translateY(24px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { 0% { opacity: 0 } 100% { opacity: 1 } }
@keyframes gentleFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes subtleGlow {
  0%,100% { box-shadow: 0 0 16px rgba(102,126,234,.10), 0 8px 28px rgba(102,126,234,.08); }
  50% { box-shadow: 0 0 24px rgba(102,126,234,.18), 0 12px 40px rgba(102,126,234,.12); }
}
@keyframes pulseBg {
  0%,100% { background-color: rgba(255,255,255,0.8); }
  50% { background-color: rgba(255,255,255,0.9); }
}
@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
`;

// --- Utility for Safe JSON Parsing ---
const safeJsonParse = async (response) => {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    await response.text();
    return null;
  } catch (err) {
    console.error("⚠️ Failed to parse response as JSON:", err);
    return null;
  }
};
// ------------------------------------

const PropertyDetails = () => {
  // Inject animations
  useEffect(() => {
    const id = "property-details-keyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = keyframes;
      document.head.appendChild(style);
    }
  }, []);

  const { id: propertyIdParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Contains { id, role, ... }
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingDeal, setExistingDeal] = useState(null);
  const [showDealDetails, setShowDealDetails] = useState(false);
  const [checkingDeal, setCheckingDeal] = useState(false);

  // Create Deal States
  const [creatingDeal, setCreatingDeal] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [buyerPhone, setBuyerPhone] = useState("");

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyIdParam]);

  useEffect(() => {
    if (property?.id && user?.id && user?.role) {
      checkForExistingDeal();
    } else {
      setExistingDeal(null);
    }
  }, [property?.id, user?.id, user?.role]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    setError(null);
    setProperty(null);
    try {
      const data = await getPropertyDetails(propertyIdParam);
      setProperty(data);
    } catch (err) {
      console.error("Error fetching property details:", err);
      setError("Failed to load property details.");
    } finally {
      setLoading(false);
    }
  };

  const checkForExistingDeal = async () => {
    if (!user || !user.id || !user.role || !property?.id) {
      setExistingDeal(null);
      return;
    }

    setCheckingDeal(true);
    setExistingDeal(null);
    const actualUserRole = user.role.toUpperCase();
    const userId = user.id;
    const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${userId}/role/${actualUserRole}`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!response.ok) throw new Error(`API Error ${response.status}`);

      const responseData = await safeJsonParse(response);

      let userDeals = [];
      if (responseData?.success && Array.isArray(responseData.data)) {
        userDeals = responseData.data;
      } else if (Array.isArray(responseData)) {
        userDeals = responseData;
      }

      const dealForThisProperty = userDeals.find((deal) => {
        const dealPropertyId = deal?.property?.id ?? deal?.propertyId;
        return dealPropertyId == property.id;
      });

      setExistingDeal(dealForThisProperty || null);
    } catch (err) {
      console.error(`[PropertyDetails] Error in checkForExistingDeal:`, err);
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
    if (!buyerPhone || buyerPhone.length !== 10) {
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
      if (!searchRes.ok) {
        const txt = await searchRes.text().catch(() => "");
        throw new Error(
          `Buyer search failed: ${searchRes.status} ${txt.slice(0, 100)}`
        );
      }
      const searchData = await safeJsonParse(searchRes);
      if (!searchData?.success || !searchData.data?.id) {
        throw new Error("Buyer not found or invalid search response.");
      }
      const buyer = searchData.data;
      if (buyer.role.toUpperCase() !== "USER") {
        throw new Error(
          `The user with this phone number is a ${buyer.role}. Only a 'USER' (Buyer) can be the buyer in a deal.`
        );
      }

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
          createData?.message ||
            `Failed to create deal (Status: ${createRes.status})`
        );
      }

      alert("✅ Deal created!");
      setBuyerPhone("");
      setCreateError(null);
      setTimeout(checkForExistingDeal, 500);
    } catch (err) {
      console.error("❌ Error creating deal:", err);
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
    const numPrice = Number(price);
    if (isNaN(numPrice)) return "Invalid Price";
    if (numPrice >= 10000000) return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    if (numPrice >= 100000) return `₹${(numPrice / 100000).toFixed(2)} Lac`;
    return `₹${numPrice.toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>⏳</div>
        <p>Loading property details...</p>
      </div>
    );
  }
  if (error || !property) {
    return (
      <div style={styles.error}>
        <h2>{error || "Property not found"}</h2>
        <button onClick={() => navigate("/")} style={styles.backButton}>
          Go back home
        </button>
      </div>
    );
  }

  // --- Prepare Render Data ---
  const images = property.imageUrl ? [property.imageUrl] : [];
  const amenitiesList = property.amenities
    ? property.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a)
    : [];
  const propertyType =
    property.propertyType?.typeName || property.type || "N/A";
  const ownerName = property.user
    ? `${property.user.firstName || ""} ${property.user.lastName || ""}`.trim()
    : "N/A";

  const isAgentOrAdmin =
    user && (user.role === "AGENT" || user.role === "ADMIN");
  const isUserRole = user && user.role === "USER";
  const canSeeDealSection =
    user && (isAgentOrAdmin || (existingDeal && isUserRole));
  const canCreateDeal = isAgentOrAdmin;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>

      <div style={styles.detailsContainer}>
        {/* Image Section */}
        <div style={styles.imageSection}>
          <div style={styles.galleryCard} className="pd-card-anim">
            <div style={styles.mainImage}>
              <img
                src={
                  images[0] ||
                  "https://via.placeholder.com/1200x800?text=Property"
                }
                alt={property.title || "Property"}
                style={styles.largeImage}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/1200x800?text=Image+Error";
                }}
              />
              <div style={styles.photoBadge}>📷 Photo</div>
            </div>
            <div style={styles.imageShadow} />
          </div>
        </div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          {/* Price, Featured, Type */}
          <div style={styles.priceRow}>
            <div style={styles.pricePill}>
              <span style={styles.priceValue}>
                {formatPrice(property.price || property.expectedPrice)}
                {property.listingType === "rent" && (
                  <span style={styles.perMonth}>/month</span>
                )}
              </span>
            </div>
            {property.isFeatured && (
              <span style={styles.featuredBadge}>⭐ Featured</span>
            )}
          </div>

          <h1 style={styles.title}>{property.title || "Property Title"}</h1>

          <div style={styles.metaRow}>
            <div style={styles.typeTag}>
              {property.listingType?.toLowerCase() === "sale"
                ? "FOR SALE"
                : "FOR RENT"}
            </div>
            <div style={styles.location}>
              📍 {property.areaName || property.city || "Location"}
              {property.pincode && ` - ${property.pincode}`}
            </div>
          </div>

          {/* Key Details */}
          <div style={styles.keyDetails}>
            <div style={styles.detailCard} className="pd-card-anim">
              <span style={styles.detailIcon}>🛏️</span>
              <div>
                <div style={styles.detailLabel}>Bedrooms</div>
                <div style={styles.detailValue}>
                  {property.bedrooms || "N/A"}
                </div>
              </div>
            </div>
            <div style={styles.detailCard} className="pd-card-anim">
              <span style={styles.detailIcon}>🚿</span>
              <div>
                <div style={styles.detailLabel}>Bathrooms</div>
                <div style={styles.detailValue}>
                  {property.bathrooms || "N/A"}
                </div>
              </div>
            </div>
            {property.areaSqft && (
              <div style={styles.detailCard} className="pd-card-anim">
                <span style={styles.detailIcon}>📐</span>
                <div>
                  <div style={styles.detailLabel}>Area</div>
                  <div style={styles.detailValue}>{property.areaSqft} sqft</div>
                </div>
              </div>
            )}
            <div style={styles.detailCard} className="pd-card-anim">
              <span style={styles.detailIcon}>🏠</span>
              <div>
                <div style={styles.detailLabel}>Type</div>
                <div style={styles.detailValue}>{propertyType}</div>
              </div>
            </div>
          </div>

          {/* Contact & Deal Section */}
          <div style={styles.contactSection} className="pd-card-anim">
            {property.user && (
              <div style={styles.ownerInfo}>
                <span style={styles.ownerPrefix}>Owner</span>
                <div style={styles.ownerName}>{ownerName}</div>
              </div>
            )}

            <h3 style={styles.contactTitle}>Contact Agent</h3>
            <div style={styles.contactButtons}>
              <button
                style={styles.contactOwnerBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 28px rgba(239,68,68,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Contact Agent
              </button>
              <button
                style={styles.getPhoneBtn}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Get Phone No.
              </button>
            </div>

            {user && (
              <div style={styles.dealSection}>
                <div style={styles.dealSectionTitle}>
                  {isAgentOrAdmin ? "📋 Deal Management" : "📋 Deal Status"}
                </div>

                {checkingDeal ? (
                  <div style={styles.loadingDeal}>
                    ⏳ Checking deal status...
                  </div>
                ) : existingDeal ? (
                  <>
                    <div style={styles.dealExistsBadge}>
                      <strong>✅ You are involved in this Deal</strong>
                    </div>
                    <div style={styles.dealStageInfo}>
                      <div style={styles.dealStageBadge}>
                        Stage:{" "}
                        <strong>
                          {existingDeal.stage ||
                            existingDeal.currentStage ||
                            "INQUIRY"}
                        </strong>
                      </div>
                      <div style={styles.dealCreatedDate}>
                        Created:{" "}
                        {new Date(existingDeal.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => setShowDealDetails(true)}
                      style={styles.viewDealBtn}
                    >
                      👁️ View & Manage Deal
                    </button>
                  </>
                ) : isAgentOrAdmin ? (
                  <>
                    <div style={styles.noDealInfo}>No deals created yet</div>
                    <div style={styles.buyerInputContainer}>
                      <input
                        type="tel"
                        placeholder="Buyer phone (10 digits)"
                        value={buyerPhone}
                        onChange={(e) => {
                          const c = e.target.value.replace(/\D/g, "");
                          setBuyerPhone(c.slice(0, 10));
                          setCreateError(null);
                        }}
                        maxLength="10"
                        style={styles.buyerInput}
                        disabled={creatingDeal}
                      />
                      <button
                        onClick={handleCreateDeal}
                        disabled={creatingDeal || buyerPhone.length !== 10}
                        style={{
                          ...styles.createDealBtn,
                          opacity:
                            creatingDeal || buyerPhone.length !== 10 ? 0.6 : 1,
                          cursor:
                            creatingDeal || buyerPhone.length !== 10
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {creatingDeal ? "⏳ Creating..." : "➕ Create Deal"}
                      </button>
                    </div>
                    {createError && (
                      <div style={styles.errorMessage}>{createError}</div>
                    )}
                  </>
                ) : (
                  <div style={styles.noDealInfo}>
                    You are not currently in a deal for this property.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* More Details Section */}
      <div style={styles.moreDetails} className="pd-card-anim">
        <h2 style={styles.sectionTitle}>More Details</h2>
        <div style={styles.detailsGrid}>
          <div style={styles.detailRow}>
            <span style={styles.detailRowLabel}>Price:</span>
            <span style={styles.detailRowValue}>
              {formatPrice(property.price || property.expectedPrice)}
            </span>
          </div>
          {property.address && (
            <div style={styles.detailRow}>
              <span style={styles.detailRowLabel}>Address:</span>
              <span style={styles.detailRowValue}>{property.address}</span>
            </div>
          )}
        </div>

        {property.description && (
          <div style={styles.descriptionSection}>
            <h3 style={styles.subSectionTitle}>Description</h3>
            <p style={styles.description}>{property.description}</p>
          </div>
        )}

        {amenitiesList.length > 0 && (
          <div style={styles.amenitiesSection}>
            <h3 style={styles.subSectionTitle}>Amenities</h3>
            <div style={styles.amenitiesGrid}>
              {amenitiesList.map((amenity, idx) => (
                <div key={idx} style={styles.amenityItem}>
                  ✓ {amenity}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Deal Details Modal */}
      {showDealDetails && existingDeal && (
        <DealDetailsPopup
          deal={existingDeal}
          onClose={handleRefreshDeal}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

// --- Styles (Professional + animated, responsive) ---
const styles = {
  container: {
    maxWidth: "min(1200px, 92vw)",
    margin: "0 auto",
    padding: "clamp(16px, 3vw, 28px)",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    animation: "fadeIn 300ms ease-out",
  },

  loading: {
    textAlign: "center",
    padding: "4rem 2rem",
    fontSize: "1.1rem",
    color: "#6b7280",
  },
  spinner: {
    fontSize: "3rem",
    marginBottom: "1rem",
    display: "inline-block",
    animation: "spin 1s linear infinite",
  },
  error: {
    textAlign: "center",
    padding: "4rem 2rem",
    color: "#ef4444",
  },
  backButton: {
    padding: "10px 16px",
    borderRadius: 12,
    background: "linear-gradient(135deg, #64748b, #475569)",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 700,
    transition: "transform .2s ease, box-shadow .2s ease",
    boxShadow: "0 8px 20px rgba(71,85,105,.18)",
  },

  detailsContainer: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "clamp(16px, 3vw, 30px)",
    marginBottom: "clamp(24px, 4vw, 40px)",
  },
  imageSection: { display: "flex", flexDirection: "column", gap: 12 },

  galleryCard: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    background: "linear-gradient(135deg, #eef2ff, #f1f5f9)",
    border: "1px solid #e2e8f0",
    animation: "subtleGlow 4s ease-in-out infinite",
  },
  imageShadow: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
      "linear-gradient(180deg, rgba(2,6,23,0) 60%, rgba(2,6,23,0.08) 100%)",
  },
  mainImage: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
  },
  largeImage: {
    display: "block",
    width: "100%",
    height: "clamp(280px, 42vw, 460px)",
    objectFit: "cover",
    transform: "scale(1.0001)",
  },
  photoBadge: {
    position: "absolute",
    bottom: 12,
    right: 12,
    background: "rgba(0,0,0,0.6)",
    color: "white",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: ".02em",
    backdropFilter: "blur(6px)",
  },

  infoSection: { display: "flex", flexDirection: "column", gap: 16 },

  priceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pricePill: {
    background: "linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%)",
    border: "1px solid #c7d2fe",
    padding: "10px 14px",
    borderRadius: 12,
    display: "inline-flex",
    alignItems: "center",
    animation: "fadeInUp 260ms ease-out",
  },
  priceValue: {
    fontSize: "clamp(18px, 3.2vw, 28px)",
    fontWeight: 900,
    color: "#1d4ed8",
  },
  perMonth: {
    fontSize: "clamp(12px, 1.6vw, 14px)",
    fontWeight: 700,
    color: "#475569",
    marginLeft: 6,
  },
  featuredBadge: {
    background: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    color: "white",
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.4)",
    boxShadow: "0 8px 20px rgba(245, 158, 11, .25)",
  },
  title: {
    fontSize: "clamp(18px, 3.4vw, 28px)",
    fontWeight: 800,
    color: "#0f172a",
    margin: "4px 0 0",
    lineHeight: 1.25,
    letterSpacing: "-0.02em",
  },

  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  typeTag: {
    display: "inline-flex",
    padding: "8px 14px",
    backgroundColor: "#eef2ff",
    color: "#3730a3",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: ".06em",
    border: "1px solid #e0e7ff",
  },
  location: {
    fontSize: 14,
    color: "#475569",
    background: "linear-gradient(90deg,#f8fafc,#ffffff)",
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
  },

  keyDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginTop: 6,
  },
  detailCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 16,
    background: "white",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    boxShadow: "0 8px 18px rgba(2,6,23,0.04)",
    transition: "transform .2s ease, box-shadow .2s ease",
  },
  detailIcon: { fontSize: 24, color: "#3b82f6" },
  detailLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    fontWeight: 700,
  },
  detailValue: { fontSize: 16, fontWeight: 800, color: "#0f172a" },

  contactSection: {
    background: "linear-gradient(180deg, #ffffff, #f8fafc)",
    padding: 20,
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    marginTop: 6,
    boxShadow: "0 10px 24px rgba(2,6,23,0.04)",
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 800,
    marginBottom: 12,
    marginTop: 0,
    color: "#0f172a",
  },
  ownerInfo: {
    marginBottom: 12,
    fontSize: 13,
    color: "#475569",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  ownerPrefix: {
    background: "#eef2ff",
    color: "#3730a3",
    border: "1px solid #e0e7ff",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: ".06em",
    textTransform: "uppercase",
  },
  ownerName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
  },
  contactButtons: {
    display: "flex",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  contactOwnerBtn: {
    flex: 1,
    padding: "12px",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14,
    transition: "transform .2s ease, box-shadow .2s ease",
    minWidth: 160,
  },
  getPhoneBtn: {
    flex: 1,
    padding: "12px",
    background: "white",
    color: "#ef4444",
    border: "2px solid #ef4444",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14,
    transition: "transform .2s ease",
    minWidth: 160,
  },

  dealSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTop: "2px solid #e5e7eb",
    background: "linear-gradient(180deg, #fffbeb 0%, #fff7ed 100%)",
    padding: 16,
    borderRadius: 12,
    border: "1px solid #fef3c7",
    minHeight: "84px",
  },
  dealSectionTitle: {
    fontSize: 12,
    fontWeight: 900,
    color: "#92400e",
    marginBottom: 10,
    marginTop: 0,
    textTransform: "uppercase",
    letterSpacing: ".06em",
  },
  dealExistsBadge: {
    padding: "12px",
    background: "#dcfce7",
    color: "#166534",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 10,
    border: "1px solid #bbf7d0",
    textAlign: "center",
  },
  dealStageInfo: {
    marginBottom: 10,
    padding: "12px",
    background: "white",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
  },
  dealStageBadge: {
    fontSize: 14,
    fontWeight: 800,
    color: "#1e3a8a",
    marginBottom: 6,
  },
  dealCreatedDate: { fontSize: 12, color: "#64748b", fontStyle: "italic" },
  noDealInfo: {
    padding: "12px",
    background: "#fef3c7",
    color: "#92400e",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
    marginBottom: 10,
    border: "1px solid #fcd34d",
    textAlign: "center",
  },
  loadingDeal: {
    padding: "12px",
    background: "#e0e7ff",
    color: "#3730a3",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
    textAlign: "center",
  },
  errorMessage: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
    marginTop: 10,
    border: "1px solid #fecaca",
    textAlign: "center",
  },
  buyerInputContainer: {
    display: "flex",
    gap: 8,
    marginBottom: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  buyerInput: {
    flex: 1,
    minWidth: 180,
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  createDealBtn: {
    padding: "10px 16px",
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 13,
    transition: "transform .2s ease, box-shadow .2s ease",
    whiteSpace: "nowrap",
  },
  viewDealBtn: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #10b981, #059669)",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontWeight: 800,
    cursor: "pointer",
    fontSize: 14,
    transition: "transform .2s ease, box-shadow .2s ease",
  },

  moreDetails: {
    background: "white",
    padding: "clamp(18px, 3vw, 30px)",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    marginTop: "clamp(24px, 4vw, 40px)",
    boxShadow: "0 8px 22px rgba(2,6,23,0.04)",
  },
  sectionTitle: {
    fontSize: "clamp(18px, 3vw, 24px)",
    fontWeight: 900,
    marginBottom: 16,
    color: "#0f172a",
    letterSpacing: "-.01em",
  },
  detailsGrid: { display: "flex", flexDirection: "column", gap: 12 },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #f1f5f9",
    flexWrap: "wrap",
  },
  detailRowLabel: { fontSize: 14, color: "#64748b", fontWeight: 700 },
  detailRowValue: {
    fontSize: 14,
    color: "#0f172a",
    fontWeight: 800,
    textAlign: "right",
  },
  descriptionSection: { marginTop: 16 },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 900,
    marginBottom: 8,
    color: "#0f172a",
    letterSpacing: "-.01em",
  },
  description: { fontSize: 14, lineHeight: 1.7, color: "#334155" },
  amenitiesSection: { marginTop: 18 },
  amenitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 10,
  },
  amenityItem: {
    padding: "10px 12px",
    background: "linear-gradient(180deg, #ffffff, #f8fafc)",
    borderRadius: 12,
    fontSize: 13,
    color: "#0f172a",
    border: "1px solid #eef2f7",
    boxShadow: "0 4px 12px rgba(2,6,23,0.04)",
  },

  // Responsive
  "@media (max-width: 900px)": {
    detailsContainer: { gridTemplateColumns: "1fr" },
  },
};

export default PropertyDetails;
