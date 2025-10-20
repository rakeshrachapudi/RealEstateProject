import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getPropertyDetails } from "../services/api";
import DealDetailsPopup from "../components/DealDetailsPopup";
import { BACKEND_BASE_URL } from "../config/config";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [existingDeal, setExistingDeal] = useState(null);
  const [showDealDetails, setShowDealDetails] = useState(false);
  const [checkingDeal, setCheckingDeal] = useState(false);

  // Create Deal States
  const [creatingDeal, setCreatingDeal] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [buyerPhone, setBuyerPhone] = useState("");

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    if (property?.id || property?.propertyId) {
      checkForExistingDeal();
    }
  }, [property?.id, property?.propertyId, user?.id]);

  const fetchPropertyDetails = async () => {
    try {
      const data = await getPropertyDetails(id);
      setProperty(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching property details:", err);
      setError("Failed to load property details.");
      setLoading(false);
    }
  };

  const checkForExistingDeal = async () => {
    if (!user?.id) {
      console.log("❌ No user ID for checking deals");
      return;
    }

    setCheckingDeal(true);
    try {
      const propertyId = property?.id || property?.propertyId;
      console.log("🔍 Checking for deals with propertyId:", propertyId);
      console.log("👤 User ID:", user.id);

      // First, try to fetch deals by property ID
      try {
        const response = await fetch(
          `${BACKEND_BASE_URL}/api/deals/property/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        console.log(
          "📊 Property deals endpoint response status:",
          response.status
        );

        if (response.ok) {
          const data = await response.json();
          console.log("📥 Property deals response:", data);

          let deals = [];
          if (Array.isArray(data)) {
            deals = data;
          } else if (data.success && Array.isArray(data.data)) {
            deals = data.data;
          } else if (data.data && Array.isArray(data.data)) {
            deals = data.data;
          }

          if (deals.length > 0) {
            console.log("✅ Deal found via property endpoint:", deals[0]);
            setExistingDeal(deals[0]);
            setCheckingDeal(false);
            return;
          }
        }
      } catch (err) {
        console.log("⚠️ Property deals endpoint error:", err.message);
      }

      // Fallback: Fetch agent's all deals and filter by property
      console.log("📄 Trying fallback - fetching agent deals...");
      try {
        const response = await fetch(
          `${BACKEND_BASE_URL}/api/deals/agent/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        console.log(
          "📊 Agent deals endpoint response status:",
          response.status
        );

        if (response.ok) {
          const data = await response.json();
          console.log("📥 Agent deals response:", data);

          let deals = [];
          if (Array.isArray(data)) {
            deals = data;
          } else if (data.success && Array.isArray(data.data)) {
            deals = data.data;
          } else if (data.data && Array.isArray(data.data)) {
            deals = data.data;
          }

          console.log(`📋 Total agent deals found: ${deals.length}`);

          // Find deal for this specific property
          const propertyDeal = deals.find((d) => {
            const dealPropId = d.property?.id || d.propertyId;
            const matches =
              dealPropId === propertyId || dealPropId == propertyId;
            console.log(
              `Comparing deal property ${dealPropId} with current property ${propertyId}: ${matches}`
            );
            return matches;
          });

          if (propertyDeal) {
            console.log(
              "✅ Deal found via agent deals endpoint:",
              propertyDeal
            );
            setExistingDeal(propertyDeal);
          } else {
            console.log("❌ No deal found for this property in agent deals");
            setExistingDeal(null);
          }
        } else {
          console.log(
            "❌ Agent deals endpoint failed with status:",
            response.status
          );
          setExistingDeal(null);
        }
      } catch (err) {
        console.error("❌ Error fetching agent deals:", err);
        setExistingDeal(null);
      }
    } catch (err) {
      console.error("❌ Error in checkForExistingDeal:", err);
      setExistingDeal(null);
    } finally {
      setCheckingDeal(false);
    }
  };

  const handleCreateDeal = async () => {
    setCreateError(null);

    // Check if buyer phone is provided
    if (!buyerPhone || buyerPhone.length !== 10) {
      setCreateError("Please enter a valid 10-digit buyer phone number");
      return;
    }

    setCreatingDeal(true);

    try {
      console.log("🔍 Searching for buyer with phone:", buyerPhone);

      // Search for buyer by phone
      const searchResponse = await fetch(
        `${BACKEND_BASE_URL}/api/users/search?phone=${buyerPhone}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!searchResponse.ok) {
        setCreateError("Error searching for buyer");
        setCreatingDeal(false);
        return;
      }

      const searchData = await searchResponse.json();
      const buyer = searchData.success ? searchData.data : searchData;

      console.log("👤 Buyer search result:", buyer);

      if (!buyer || !buyer.id) {
        setCreateError("Buyer not found. Please check the phone number.");
        setCreatingDeal(false);
        return;
      }

      console.log("✅ Buyer found:", buyer.id);

      // Create deal with buyerId and agentId from logged-in user
      const createResponse = await fetch(
        `${BACKEND_BASE_URL}/api/deals/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            propertyId: property.id || property.propertyId,
            buyerId: buyer.id,
            agentId: user.id,
          }),
        }
      );

      const createData = await createResponse.json();
      console.log("📤 Deal creation response:", createData);

      if (createData.success || createResponse.ok) {
        console.log("✅ Deal created successfully");
        alert("✅ Deal created successfully!");
        setBuyerPhone("");
        setCreateError(null);

        // Wait a moment then refresh
        setTimeout(() => {
          checkForExistingDeal();
        }, 500);
      } else {
        console.log("❌ Deal creation failed:", createData);
        setCreateError(createData.message || "Failed to create deal");
      }
    } catch (err) {
      console.error("❌ Error creating deal:", err);
      setCreateError("Error: " + err.message);
    } finally {
      setCreatingDeal(false);
    }
  };

  const handleRefreshDeal = () => {
    setShowDealDetails(false);
    checkForExistingDeal();
  };

  const formatPrice = (price) => {
    if (!price) return "Price on request";
    const numPrice = typeof price === "number" ? price : parseFloat(price);
    if (numPrice >= 10000000) {
      return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    } else if (numPrice >= 100000) {
      return `₹${(numPrice / 100000).toFixed(2)} Lac`;
    }
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
          Go back to home
        </button>
      </div>
    );
  }

  const images = property.imageUrl ? [property.imageUrl] : [];
  const amenitiesList = property.amenities
    ? property.amenities.split(",").map((a) => a.trim())
    : [];
  const propertyType =
    property.propertyType?.typeName || property.type || "N/A";
  const ownerName = property.user
    ? `${property.user.firstName} ${property.user.lastName}`
    : "N/A";
  const isAgent = user && (user.role === "AGENT" || user.role === "ADMIN");

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>

      <div style={styles.detailsContainer}>
        {/* Image Gallery */}
        <div style={styles.imageSection}>
          <div style={styles.mainImage}>
            <img
              src={
                images[0] ||
                "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800"
              }
              alt={property.title}
              style={styles.largeImage}
            />
          </div>
        </div>

        {/* Property Info */}
        <div style={styles.infoSection}>
          {/* Price and Title */}
          <div style={styles.priceSection}>
            <div style={styles.price}>
              {formatPrice(property.price || property.expectedPrice)}
              {property.listingType === "rent" && (
                <span style={styles.perMonth}>/month</span>
              )}
            </div>
            {property.isFeatured && (
              <span style={styles.featuredBadge}>⭐ Featured</span>
            )}
          </div>

          <h1 style={styles.title}>{property.title}</h1>

          <div style={styles.typeTag}>
            {property.listingType?.toLowerCase() === "sale"
              ? "FOR SALE"
              : "FOR RENT"}
          </div>

          <div style={styles.location}>
            📍 {property.areaName || property.city || "Hyderabad"}
            {property.pincode && ` - ${property.pincode}`}
          </div>

          {/* Key Details */}
          <div style={styles.keyDetails}>
            <div style={styles.detailCard}>
              <span style={styles.detailIcon}>🛏️</span>
              <div>
                <div style={styles.detailLabel}>Bedrooms</div>
                <div style={styles.detailValue}>
                  {property.bedrooms || "N/A"}
                </div>
              </div>
            </div>

            <div style={styles.detailCard}>
              <span style={styles.detailIcon}>🚿</span>
              <div>
                <div style={styles.detailLabel}>Bathrooms</div>
                <div style={styles.detailValue}>
                  {property.bathrooms || "N/A"}
                </div>
              </div>
            </div>

            {property.areaSqft && (
              <div style={styles.detailCard}>
                <span style={styles.detailIcon}>📐</span>
                <div>
                  <div style={styles.detailLabel}>Area</div>
                  <div style={styles.detailValue}>{property.areaSqft} sqft</div>
                </div>
              </div>
            )}

            <div style={styles.detailCard}>
              <span style={styles.detailIcon}>🏠</span>
              <div>
                <div style={styles.detailLabel}>Type</div>
                <div style={styles.detailValue}>{propertyType}</div>
              </div>
            </div>
          </div>

          {/* Contact Agent Section */}
          <div style={styles.contactSection}>
            {property.user && (
              <div style={styles.ownerInfo}>
                Dear <div style={styles.ownerName}>{ownerName}</div>
              </div>
            )}
            <h3 style={styles.contactTitle}>Contact Agent</h3>

            <div style={styles.contactButtons}>
              <button style={styles.contactOwnerBtn}>Contact Agent</button>
              <button style={styles.getPhoneBtn}>Get Phone No.</button>
            </div>

            {/* Deal Management Section - Only for Agents */}
            {isAgent && (
              <div style={styles.dealSection}>
                <div style={styles.dealSectionTitle}>📋 Deal Management</div>

                {checkingDeal ? (
                  <div style={styles.loadingDeal}>⏳ Checking for deals...</div>
                ) : existingDeal ? (
                  <>
                    <div style={styles.dealExistsBadge}>
                      <strong>✅ Deal Already Created</strong>
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
                ) : (
                  <>
                    <div style={styles.noDealInfo}>
                      No deals created yet for this property
                    </div>
                    <div style={styles.buyerInputContainer}>
                      <input
                        type="tel"
                        placeholder="Enter buyer phone (10 digits)"
                        value={buyerPhone}
                        onChange={(e) => {
                          const cleaned = e.target.value.replace(/\D/g, "");
                          setBuyerPhone(cleaned.slice(0, 10));
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
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* More Details Section */}
      <div style={styles.moreDetails}>
        <h2 style={styles.sectionTitle}>More Details</h2>

        <div style={styles.detailsGrid}>
          <div style={styles.detailRow}>
            <span style={styles.detailRowLabel}>Price Breakup:</span>
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

        {/* Description */}
        {property.description && (
          <div style={styles.descriptionSection}>
            <h3 style={styles.subSectionTitle}>Description</h3>
            <p style={styles.description}>{property.description}</p>
          </div>
        )}

        {/* Amenities */}
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

      {/* View Deal Modal */}
      {showDealDetails && existingDeal && (
        <DealDetailsPopup deal={existingDeal} onClose={handleRefreshDeal} />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: 24,
    backgroundColor: "#fff",
  },
  loading: {
    textAlign: "center",
    padding: "4rem 2rem",
  },
  spinner: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  error: {
    textAlign: "center",
    padding: "4rem 2rem",
  },
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
  },
  detailsContainer: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: 30,
    marginBottom: 40,
  },
  imageSection: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  mainImage: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  largeImage: {
    width: "100%",
    height: 450,
    objectFit: "cover",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  priceSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 32,
    fontWeight: 700,
    color: "#3b82f6",
  },
  perMonth: {
    fontSize: 16,
    fontWeight: 500,
    color: "#6b7280",
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
  location: {
    fontSize: 16,
    color: "#6b7280",
  },
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
  detailIcon: {
    fontSize: 28,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 600,
    color: "#111827",
  },
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
    marginBottom: 12,
    marginTop: 0,
  },
  ownerInfo: {
    marginBottom: 16,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
  },
  contactButtons: {
    display: "flex",
    gap: 12,
    marginBottom: 12,
  },
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
  },
  dealSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTop: "2px solid #e5e7eb",
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 8,
    border: "1px solid #fcd34d",
  },
  dealSectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#92400e",
    marginBottom: 12,
    marginTop: 0,
  },
  dealExistsBadge: {
    padding: "12px",
    backgroundColor: "#d1fae5",
    color: "#065f46",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 12,
    border: "1px solid #6ee7b7",
    textAlign: "center",
  },
  dealStageInfo: {
    marginBottom: 12,
    padding: "12px",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
  },
  dealStageBadge: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e40af",
    marginBottom: 8,
  },
  dealCreatedDate: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
  },
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
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    textAlign: "center",
  },
  errorMessage: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
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
  },
  buyerInput: {
    flex: 1,
    padding: "10px 12px",
    border: "2px solid #e2e8f0",
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  createDealBtn: {
    padding: "10px 12px",
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
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 20,
  },
  detailsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottom: "1px solid #e5e7eb",
  },
  detailRowLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
  },
  detailRowValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: 600,
  },
  descriptionSection: {
    marginTop: 30,
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 1.8,
    color: "#374151",
  },
  amenitiesSection: {
    marginTop: 30,
  },
  amenitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 12,
  },
  amenityItem: {
    padding: "10px 12px",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    fontSize: 14,
    color: "#374151",
  },
};

export default PropertyDetails;
