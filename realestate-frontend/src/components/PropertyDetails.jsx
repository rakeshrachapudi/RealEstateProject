// PropertyDetails.jsx (Complete File with Debug Log & Simplified Render Logic)
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getPropertyDetails } from "../services/api";
import DealDetailsPopup from "../components/DealDetailsPopup";
import { BACKEND_BASE_URL } from "../config/config";

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
  const { id: propertyIdParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // Contains { id, role, ... }
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingDeal, setExistingDeal] = useState(null); // The deal involving this user for this property
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
    // Check for deals only after property and user are loaded
    if (property?.id && user?.id && user?.role) {
      checkForExistingDeal();
    } else {
      setExistingDeal(null); // Clear deal if user/property changes
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

  /**
   * Fetches deals relevant to the logged-in user using their ACTUAL role
   * and filters locally for the current property.
   */
  const checkForExistingDeal = async () => {
    if (!user || !user.id || !user.role || !property?.id) {
      console.log(
        "[PropertyDetails] Skipping deal check: Missing user/role or property details."
      );
      setExistingDeal(null);
      return;
    }

    setCheckingDeal(true);
    setExistingDeal(null);
    const actualUserRole = user.role.toUpperCase();
    const userId = user.id;
    const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${userId}/role/${actualUserRole}`;

    console.log(
      `[PropertyDetails] 🔍 Checking deals for user ${userId} (Role: ${actualUserRole}) via: ${endpoint}`
    );
    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      console.log(
        `[PropertyDetails] 📊 API response status: ${response.status}`
      );
      if (!response.ok) throw new Error(`API Error ${response.status}`);

      const responseData = await safeJsonParse(response);
      console.log(`[PropertyDetails] 📥 Raw API response data:`, responseData);

      let userDeals = [];
      if (responseData?.success && Array.isArray(responseData.data)) {
        userDeals = responseData.data;
      } else if (Array.isArray(responseData)) {
        userDeals = responseData;
      } else {
        console.warn("[PropertyDetails] Unexpected data format:", responseData);
      }

      console.log(
        `[PropertyDetails] 📋 Found ${userDeals.length} total deals for user ${userId}. Starting filter...`
      );

      const currentPagePropertyId = property.id;
      // DEBUG: Log the ID we are looking for
      console.log(
        `[PropertyDetails Debug] Filtering deals for Property ID on THIS PAGE: ${currentPagePropertyId} (Type: ${typeof currentPagePropertyId})`
      );
      // console.log(`[PropertyDetails Debug] Full list of deals received from API:`, JSON.stringify(userDeals, null, 2)); // Keep this if needed

      const dealForThisProperty = userDeals.find((deal, index) => {
        // DEBUG: Log details for EACH deal being checked
        const dealPropertyId = deal?.property?.id ?? deal?.propertyId;
        const dealId = deal?.dealId ?? deal?.id;
        const dealStage = deal?.stage ?? deal?.currentStage;

        // console.log(`[PropertyDetails Debug] --- Checking Deal #${index} (ID: ${dealId}, Stage: ${dealStage}) ---`);
        // console.log(`   - Extracted Property ID from Deal: ${dealPropertyId} (Type: ${typeof dealPropertyId})`);
        // console.log(`   - Comparing with Page Property ID: ${currentPagePropertyId} (Type: ${typeof currentPagePropertyId})`);

        const isMatch = dealPropertyId == currentPagePropertyId; // Use loose equality (==)
        // console.log(`   - Is Match? ${isMatch}`);

        return isMatch;
      });

      // DEBUG: Log the final result of the filter
      if (dealForThisProperty) {
        console.log(
          "[PropertyDetails Debug] ✅✅✅ Match found!",
          dealForThisProperty
        );
        setExistingDeal(dealForThisProperty); // <--- STATE IS SET HERE
      } else {
        console.log(
          "[PropertyDetails Debug] ❌❌❌ No matching deal found in the list."
        );
        setExistingDeal(null);
      }
    } catch (err) {
      console.error(`[PropertyDetails] ❌ Error in checkForExistingDeal:`, err);
      setExistingDeal(null);
    } finally {
      setCheckingDeal(false);
    }
  };

  // --- Create Deal Handler ---
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
      console.log("🔍 Searching buyer:", buyerPhone);
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
      console.log("✅ Buyer found:", buyer.id);

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
      console.log("📤 Deal creation response:", createData);
      if (!createRes.ok || !createData?.success) {
        throw new Error(
          createData?.message ||
            `Failed to create deal (Status: ${createRes.status})`
        );
      }

      console.log("✅ Deal created via /create");
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

  // --- Other Handlers ---
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

  // --- Loading & Error States ---
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>⏳</div> <p>Loading property details...</p>
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

  // --- Corrected Render Logic Variables ---
  const isAgentOrAdmin =
    user && (user.role === "AGENT" || user.role === "ADMIN");
  const isUserRole = user && user.role === "USER";
  // This depends on the *current* value of existingDeal state
  const canSeeDealSection =
    user && (isAgentOrAdmin || (existingDeal && isUserRole));
  const canCreateDeal = isAgentOrAdmin;

  // ⭐===== CRUCIAL DEBUG LOG =====⭐
  console.log("[PropertyDetails Render] Checking render conditions:", {
    userId: user?.id,
    userRole: user?.role,
    isUserRole: isUserRole,
    propertyId: property?.id,
    // Log simple info about the deal object in state or null
    existingDealInState: existingDeal
      ? {
          id: existingDeal.dealId || existingDeal.id,
          stage: existingDeal.stage || existingDeal.currentStage,
        }
      : null,
    // Log the calculated visibility flag
    canSeeDealSectionCalculated: canSeeDealSection,
  });
  // ⭐===== END CRUCIAL DEBUG LOG =====⭐
  console.log("[PropertyDetails Render] Checking render conditions:", {
    userId: user?.id,
    userRole: user?.role,
    isUserRole: isUserRole, // Calculated boolean
    propertyId: property?.id,
    // Log simple info about the deal object in state or null
    existingDealInState: existingDeal
      ? {
          id: existingDeal.dealId || existingDeal.id,
          stage: existingDeal.stage || existingDeal.currentStage,
        }
      : null,
    // Log the calculated visibility flag (if using) or just the state check
    renderCheck_existingDeal_truthy: Boolean(existingDeal),
  });
  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>

      <div style={styles.detailsContainer}>
        {/* Image Section */}
        <div style={styles.imageSection}>
          <div style={styles.mainImage}>
            {" "}
            <img
              src={
                images[0] || "https://via.placeholder.com/800x600?text=Property"
              }
              alt={property.title || "Property"}
              style={styles.largeImage}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800x600?text=Image+Error";
              }}
            />{" "}
          </div>
        </div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          {/* Price, Title, Type, Location, Key Details */}
          <div style={styles.priceSection}>
            {" "}
            <div style={styles.price}>
              {formatPrice(property.price || property.expectedPrice)}
              {property.listingType === "rent" && (
                <span style={styles.perMonth}>/month</span>
              )}
            </div>{" "}
            {property.isFeatured && (
              <span style={styles.featuredBadge}>⭐ Featured</span>
            )}{" "}
          </div>
          <h1 style={styles.title}>{property.title || "Property Title"}</h1>
          <div style={styles.typeTag}>
            {property.listingType?.toLowerCase() === "sale"
              ? "FOR SALE"
              : "FOR RENT"}
          </div>
          <div style={styles.location}>
            📍 {property.areaName || property.city || "Location"}{" "}
            {property.pincode && ` - ${property.pincode}`}
          </div>
          <div style={styles.keyDetails}>
            {" "}
            <div style={styles.detailCard}>
              <span style={styles.detailIcon}>🛏️</span>
              <div>
                <div style={styles.detailLabel}>Bedrooms</div>
                <div style={styles.detailValue}>
                  {property.bedrooms || "N/A"}
                </div>
              </div>
            </div>{" "}
            <div style={styles.detailCard}>
              <span style={styles.detailIcon}>🚿</span>
              <div>
                <div style={styles.detailLabel}>Bathrooms</div>
                <div style={styles.detailValue}>
                  {property.bathrooms || "N/A"}
                </div>
              </div>
            </div>{" "}
            {property.areaSqft && (
              <div style={styles.detailCard}>
                <span style={styles.detailIcon}>📐</span>
                <div>
                  <div style={styles.detailLabel}>Area</div>
                  <div style={styles.detailValue}>{property.areaSqft} sqft</div>
                </div>
              </div>
            )}{" "}
            <div style={styles.detailCard}>
              <span style={styles.detailIcon}>🏠</span>
              <div>
                <div style={styles.detailLabel}>Type</div>
                <div style={styles.detailValue}>{propertyType}</div>
              </div>
            </div>{" "}
          </div>

          {/* Contact & Deal Section */}
          <div style={styles.contactSection}>
            {property.user && (
              <div style={styles.ownerInfo}>
                Dear <div style={styles.ownerName}>{ownerName}</div>
              </div>
            )}
            <h3 style={styles.contactTitle}>Contact Agent</h3>
            <div style={styles.contactButtons}>
              {" "}
              <button style={styles.contactOwnerBtn}>Contact Agent</button>{" "}
              <button style={styles.getPhoneBtn}>Get Phone No.</button>{" "}
            </div>

            {/* --- ⭐ DEAL SECTION (Simplified Render Condition) --- */}
            {user && ( // Only show if logged in
              <div style={styles.dealSection}>
                <div style={styles.dealSectionTitle}>
                  {isAgentOrAdmin ? "📋 Deal Management" : "📋 Deal Status"}
                </div>

                {checkingDeal ? (
                  <div style={styles.loadingDeal}>
                    ⏳ Checking deal status...
                  </div>
                ) : existingDeal ? ( // <<<--- DIRECTLY CHECK existingDeal state here
                  // --- VIEW EXISTING DEAL ---
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
                ) : isAgentOrAdmin ? ( // If no deal AND user is Agent/Admin
                  // --- CREATE NEW DEAL ---
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
                        {" "}
                        {creatingDeal
                          ? "⏳ Creating..."
                          : "➕ Create Deal"}{" "}
                      </button>
                    </div>
                    {createError && (
                      <div style={styles.errorMessage}>{createError}</div>
                    )}
                  </>
                ) : (
                  // If no deal AND user is USER
                  // --- NO DEAL (User Role) ---
                  <div style={styles.noDealInfo}>
                    You are not currently in a deal for this property.
                  </div>
                )}
              </div>
            )}
            {/* --- END DEAL SECTION --- */}
          </div>
        </div>
      </div>

      {/* More Details Section */}
      <div style={styles.moreDetails}>
        <h2 style={styles.sectionTitle}>More Details</h2>
        <div style={styles.detailsGrid}>
          {" "}
          <div style={styles.detailRow}>
            <span style={styles.detailRowLabel}>Price:</span>
            <span style={styles.detailRowValue}>
              {formatPrice(property.price || property.expectedPrice)}
            </span>
          </div>{" "}
          {property.address && (
            <div style={styles.detailRow}>
              <span style={styles.detailRowLabel}>Address:</span>
              <span style={styles.detailRowValue}>{property.address}</span>
            </div>
          )}{" "}
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
              {" "}
              {amenitiesList.map((amenity, idx) => (
                <div key={idx} style={styles.amenityItem}>
                  ✓ {amenity}
                </div>
              ))}{" "}
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

// --- Styles ---
const styles = {
  /* ... keep existing styles ... */
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 24,
    backgroundColor: "#fff",
  },
  loading: {
    textAlign: "center",
    padding: "4rem 2rem",
    fontSize: "1.2rem",
    color: "#6b7280",
  },
  spinner: {
    fontSize: "3rem",
    marginBottom: "1rem",
    display: "inline-block",
    animation: "spin 1s linear infinite",
  },
  error: { textAlign: "center", padding: "4rem 2rem", color: "#ef4444" },
  backButton: {
    padding: "10px 20px",
    borderRadius: 8,
    background: "#6b7280",
    color: "white",
    border: "none",
    cursor: "pointer",
    marginBottom: 20,
    fontSize: 14,
    fontWeight: 500,
    transition: "background 0.2s",
  },
  detailsContainer: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: 30,
    marginBottom: 40,
    "@media (maxWidth: 900px)": { gridTemplateColumns: "1fr" },
  },
  imageSection: { display: "flex", flexDirection: "column", gap: 12 },
  mainImage: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  largeImage: {
    display: "block",
    width: "100%",
    height: 450,
    objectFit: "cover",
  },
  infoSection: { display: "flex", flexDirection: "column", gap: 20 },
  priceSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: { fontSize: 32, fontWeight: 700, color: "#3b82f6" },
  perMonth: {
    fontSize: 16,
    fontWeight: 500,
    color: "#6b7280",
    marginLeft: "4px",
  },
  featuredBadge: {
    backgroundColor: "#f59e0b",
    color: "white",
    padding: "8px 16px",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
    lineHeight: 1.3,
  },
  typeTag: {
    display: "inline-block",
    padding: "8px 16px",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    width: "fit-content",
  },
  location: { fontSize: 16, color: "#6b7280" },
  keyDetails: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
    marginTop: 10,
  },
  detailCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
  },
  detailIcon: { fontSize: 28, color: "#3b82f6" },
  detailLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  detailValue: { fontSize: 16, fontWeight: 600, color: "#111827" },
  contactSection: {
    backgroundColor: "#f9fafb",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    marginTop: 10,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 16,
    marginTop: 0,
    color: "#111827",
  },
  ownerInfo: { marginBottom: 16, fontSize: "14px", color: "#4b5563" },
  ownerName: {
    fontSize: 16,
    fontWeight: 600,
    color: "#111827",
    display: "block",
    marginTop: "4px",
  },
  contactButtons: { display: "flex", gap: 12, marginBottom: 20 },
  contactOwnerBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    transition: "background 0.2s",
  },
  getPhoneBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "white",
    color: "#ef4444",
    border: "2px solid #ef4444",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    transition: "background 0.2s, color 0.2s",
  },
  dealSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: "2px solid #e5e7eb",
    backgroundColor: "#fffbeb",
    padding: 16,
    borderRadius: 8,
    border: "1px solid #fef3c7",
    minHeight: "100px",
  },
  dealSectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#92400e",
    marginBottom: 12,
    marginTop: 0,
    textTransform: "uppercase",
  },
  dealExistsBadge: {
    padding: "12px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 12,
    border: "1px solid #bbf7d0",
    textAlign: "center",
  },
  dealStageInfo: {
    marginBottom: 12,
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
  },
  dealStageBadge: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e3a8a",
    marginBottom: 8,
  },
  dealCreatedDate: { fontSize: 12, color: "#64748b", fontStyle: "italic" },
  noDealInfo: {
    padding: "12px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 12,
    border: "1px solid #fcd34d",
    textAlign: "center",
  },
  loadingDeal: {
    padding: "12px",
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    textAlign: "center",
  },
  errorMessage: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    marginTop: 12,
    border: "1px solid #fecaca",
    textAlign: "center",
  },
  buyerInputContainer: {
    display: "flex",
    gap: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  buyerInput: {
    flex: 1,
    padding: "10px 12px",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  createDealBtn: {
    padding: "10px 16px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 13,
    transition: "background 0.2s",
    whiteSpace: "nowrap",
  },
  viewDealBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: 8,
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    transition: "background 0.2s",
  },
  moreDetails: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
    color: "#111827",
  },
  detailsGrid: { display: "flex", flexDirection: "column", gap: 16 },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottom: "1px solid #f3f4f6",
  },
  detailRowLabel: { fontSize: 14, color: "#6b7280", fontWeight: 500 },
  detailRowValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: 600,
    textAlign: "right",
  },
  descriptionSection: { marginTop: 30 },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
    color: "#111827",
  },
  description: { fontSize: 14, lineHeight: 1.7, color: "#4b5563" },
  amenitiesSection: { marginTop: 30 },
  amenitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 12,
  },
  amenityItem: {
    padding: "10px 14px",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    fontSize: 14,
    color: "#374151",
    border: "1px solid #f3f4f6",
  },
};

// Keyframes needs global injection or CSS-in-JS
const keyframesStyle = ` @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } `;

export default PropertyDetails;
