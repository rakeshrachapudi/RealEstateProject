// PropertyDetails.jsx (FIXED - With Image Gallery)
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
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [existingDeal, setExistingDeal] = useState(null);
  const [showDealDetails, setShowDealDetails] = useState(false);
  const [checkingDeal, setCheckingDeal] = useState(false);

  // ⭐ NEW STATE FOR IMAGES ⭐
  const [propertyImages, setPropertyImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(true);

  // Create Deal States
  const [creatingDeal, setCreatingDeal] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [buyerPhone, setBuyerPhone] = useState("");

  useEffect(() => {
    fetchPropertyDetails();
  }, [propertyIdParam]);

  // ⭐ NEW EFFECT: Fetch images when property is loaded ⭐
  useEffect(() => {
    if (property?.id) {
      fetchPropertyImages(property.id);
    }
  }, [property?.id]);

  useEffect(() => {
    if (property?.id && user?.id && user?.role) {
      checkForExistingDeal();
    } else {
      setExistingDeal(null);
    }
  }, [property?.id, user?.id, user?.role]);

  // ⭐ NEW FUNCTION: Fetch all images for the property ⭐
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
        console.log("✅ Fetched property images:", images);

        if (images && images.length > 0) {
          // Sort by displayOrder and filter out invalid URLs
          const sortedImages = images
            .filter(img => img.imageUrl)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

          setPropertyImages(sortedImages);
        } else {
          // No images found - use fallback
          setPropertyImages([]);
        }
      } else {
        console.error("Failed to fetch property images:", response.status);
        setPropertyImages([]);
      }
    } catch (error) {
      console.error("Error fetching property images:", error);
      setPropertyImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  // ⭐ IMAGE NAVIGATION FUNCTIONS ⭐
  const handlePreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? propertyImages.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === propertyImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  // Get the current image to display
  const getCurrentImageUrl = () => {
    if (propertyImages.length > 0) {
      return propertyImages[currentImageIndex]?.imageUrl;
    }
    // Fallback to property.imageUrl or default
    return property?.imageUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";
  };

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
      console.log("[PropertyDetails] Skipping deal check: Missing user/role or property details.");
      setExistingDeal(null);
      return;
    }

    setCheckingDeal(true);
    setExistingDeal(null);
    const actualUserRole = user.role.toUpperCase();
    const userId = user.id;
    const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${userId}/role/${actualUserRole}`;

    console.log(`[PropertyDetails] 🔍 Checking deals for user ${userId} (Role: ${actualUserRole}) via: ${endpoint}`);
    try {
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      console.log(`[PropertyDetails] 📊 API response status: ${response.status}`);
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

      console.log(`[PropertyDetails] 📋 Found ${userDeals.length} total deals for user ${userId}. Starting filter...`);

      const currentPagePropertyId = property.id;
      console.log(`[PropertyDetails Debug] Filtering deals for Property ID on THIS PAGE: ${currentPagePropertyId} (Type: ${typeof currentPagePropertyId})`);

      const dealForThisProperty = userDeals.find((deal) => {
        const dealPropertyId = deal?.property?.id ?? deal?.propertyId;
        const isMatch = dealPropertyId == currentPagePropertyId;
        return isMatch;
      });

      if (dealForThisProperty) {
        console.log("[PropertyDetails Debug] ✅✅✅ Match found!", dealForThisProperty);
        setExistingDeal(dealForThisProperty);
      } else {
        console.log("[PropertyDetails Debug] ❌❌❌ No matching deal found in the list.");
        setExistingDeal(null);
      }
    } catch (err) {
      console.error(`[PropertyDetails] ❌ Error in checkForExistingDeal:`, err);
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
      console.log("🔍 Searching buyer:", buyerPhone);

      const searchRes = await fetch(`${BACKEND_BASE_URL}/api/users/search?phone=${buyerPhone}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (!searchRes.ok) {
        const txt = await searchRes.text().catch(() => "");
        throw new Error(`Buyer search failed: ${searchRes.status} ${txt.slice(0, 100)}`);
      }
      const searchData = await safeJsonParse(searchRes);
      if (!searchData?.success || !searchData.data?.id) {
        throw new Error("Buyer not found or invalid search response.");
      }

      const buyer = searchData.data;

      if (buyer.role.toUpperCase() !== "USER") {
        console.warn(`Attempted to create deal with non-buyer role: ${buyer.role}`);
        throw new Error(`The user with this phone number is a ${buyer.role}. Only a 'USER' (Buyer) can be the buyer in a deal.`);
      }

      console.log("✅ Buyer found and validated (Role: USER):", buyer.id);

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
        throw new Error(createData?.message || `Failed to create deal (Status: ${createRes.status})`);
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
        <div style={styles.errorIcon}>⚠️</div>
        <h2 style={styles.errorTitle}>Error</h2>
        <p>{error || "Property not found."}</p>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        {/* Back Button */}
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ← Back
        </button>

        {/* ⭐⭐⭐ UPDATED IMAGE GALLERY SECTION ⭐⭐⭐ */}
        <div style={styles.imageSection}>
          {loadingImages ? (
            <div style={styles.imageLoading}>
              <div style={styles.spinner}>⏳</div>
              <p>Loading images...</p>
            </div>
          ) : (
            <>
              {/* Main Image Display */}
              <div style={styles.mainImageContainer}>
                <img
                  src={getCurrentImageUrl()}
                  alt={property.title}
                  style={styles.mainImage}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";
                  }}
                />

                {/* Navigation Arrows (only show if multiple images) */}
                {propertyImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      style={{ ...styles.navButton, ...styles.navButtonLeft }}
                      aria-label="Previous image"
                    >
                      ‹
                    </button>
                    <button
                      onClick={handleNextImage}
                      style={{ ...styles.navButton, ...styles.navButtonRight }}
                      aria-label="Next image"
                    >
                      ›
                    </button>

                    {/* Image Counter */}
                    <div style={styles.imageCounter}>
                      {currentImageIndex + 1} / {propertyImages.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery (only show if multiple images) */}
              {propertyImages.length > 1 && (
                <div style={styles.thumbnailContainer}>
                  {propertyImages.map((image, index) => (
                    <img
                      key={image.id || index}
                      src={image.imageUrl}
                      alt={`Property thumbnail ${index + 1}`}
                      style={{
                        ...styles.thumbnail,
                        ...(index === currentImageIndex ? styles.thumbnailActive : {}),
                      }}
                      onClick={() => handleThumbnailClick(index)}
                      onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=150&fit=crop";
                      }}
                    />
                  ))}
                </div>
              )}

              {/* No Images Message */}
              {propertyImages.length === 0 && (
                <div style={styles.noImagesMessage}>
                  📷 No images available for this property
                </div>
              )}
            </>
          )}
        </div>
        {/* ⭐⭐⭐ END IMAGE GALLERY SECTION ⭐⭐⭐ */}

        {/* Property Info Section */}
        <div style={styles.infoSection}>
          <div style={styles.header}>
            {property.isFeatured && <span style={styles.featuredBadge}>⭐ Featured</span>}
            <h1 style={styles.title}>{property.title || "Property Title"}</h1>
            <span style={styles.typeTag}>
              {property.listingType?.toLowerCase() === "sale" ? "FOR SALE" : "FOR RENT"}
            </span>
          </div>

          <div style={styles.location}>📍 {property.areaName || property.city || "Location"}</div>
          <div style={styles.priceSection}>
            <span style={styles.price}>{formatPrice(property.price)}</span>
            {property.listingType?.toLowerCase() === "rent" && <span style={styles.perMonth}>/month</span>}
          </div>

          {/* Key Details Grid */}
          <div style={styles.keyDetails}>
            {property.areaSqft && (
              <div style={styles.detailCard}>
                <span style={styles.detailIcon}>📐</span>
                <div>
                  <div style={styles.detailLabel}>Area</div>
                  <div style={styles.detailValue}>{property.areaSqft} sqft</div>
                </div>
              </div>
            )}
            {property.bedrooms > 0 && (
              <div style={styles.detailCard}>
                <span style={styles.detailIcon}>🛏️</span>
                <div>
                  <div style={styles.detailLabel}>Bedrooms</div>
                  <div style={styles.detailValue}>{property.bedrooms}</div>
                </div>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div style={styles.detailCard}>
                <span style={styles.detailIcon}>🚿</span>
                <div>
                  <div style={styles.detailLabel}>Bathrooms</div>
                  <div style={styles.detailValue}>{property.bathrooms}</div>
                </div>
              </div>
            )}
            {property.propertyType && (
              <div style={styles.detailCard}>
                <span style={styles.detailIcon}>🏠</span>
                <div>
                  <div style={styles.detailLabel}>Type</div>
                  <div style={styles.detailValue}>{property.propertyType.typeName || property.type}</div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Section */}
          <div style={styles.contactSection}>
            <h3 style={styles.contactTitle}>Contact Information</h3>
            {property.user && (
              <div style={styles.ownerInfo}>
                <strong>Posted by:</strong>
                <span style={styles.ownerName}>
                  {property.user.firstName || ""} {property.user.lastName || ""}
                </span>
              </div>
            )}
            <div style={styles.contactButtons}>
              <button style={styles.contactOwnerBtn}>📧 Contact Agent</button>
              <button style={styles.getPhoneBtn}>📞 Get Phone No.</button>
            </div>

            {/* Deal Management Section */}
            <div style={styles.dealSection}>
              <h4 style={styles.dealSectionTitle}>📋 Deal Management</h4>

              {checkingDeal && <div style={styles.loadingDeal}>⏳ Checking for existing deals...</div>}

              {!checkingDeal && existingDeal && (
                <>
                  <div style={styles.dealExistsBadge}>✅ Deal exists for this property</div>
                  <div style={styles.dealStageInfo}>
                    <div style={styles.dealStageBadge}>
                      Current Stage: {existingDeal.stage || existingDeal.currentStage || "INQUIRY"}
                    </div>
                    {existingDeal.createdAt && (
                      <div style={styles.dealCreatedDate}>
                        Created: {new Date(existingDeal.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <button onClick={() => setShowDealDetails(true)} style={styles.viewDealBtn}>
                    👁️ View Deal Details
                  </button>
                </>
              )}

              {!checkingDeal && !existingDeal && (
                <>
                  <div style={styles.noDealInfo}>ℹ️ No deals created yet</div>
                  {user && (user.role === "AGENT" || user.role === "ADMIN") && (
                    <>
                      <div style={styles.buyerInputContainer}>
                        <input
                          type="tel"
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                          placeholder="Buyer phone (10 digits)"
                          style={styles.buyerInput}
                          maxLength={10}
                        />
                        <button
                          onClick={handleCreateDeal}
                          style={styles.createDealBtn}
                          disabled={creatingDeal}
                        >
                          {creatingDeal ? "⏳" : "➕"} Create Deal
                        </button>
                      </div>
                      {createError && <div style={styles.errorMessage}>{createError}</div>}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* More Details Section */}
        <div style={styles.moreDetails}>
          <h2 style={styles.sectionTitle}>More Details</h2>
          <div style={styles.detailsGrid}>
            <div style={styles.detailRow}>
              <span style={styles.detailRowLabel}>Price</span>
              <span style={styles.detailRowValue}>{formatPrice(property.price)}</span>
            </div>
            {property.address && (
              <div style={styles.detailRow}>
                <span style={styles.detailRowLabel}>Address</span>
                <span style={styles.detailRowValue}>{property.address}</span>
              </div>
            )}
            {property.pincode && (
              <div style={styles.detailRow}>
                <span style={styles.detailRowLabel}>Pincode</span>
                <span style={styles.detailRowValue}>{property.pincode}</span>
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
          {property.amenities && (
            <div style={styles.amenitiesSection}>
              <h3 style={styles.subSectionTitle}>✨ Amenities</h3>
              <div style={styles.amenitiesGrid}>
                {property.amenities
                  .split(",")
                  .map((a) => a.trim())
                  .filter((a) => a)
                  .map((amenity, idx) => (
                    <div key={idx} style={styles.amenityItem}>
                      {amenity}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deal Details Popup */}
      {showDealDetails && existingDeal && (
        <DealDetailsPopup
          deal={existingDeal}
          onClose={() => setShowDealDetails(false)}
          onDealUpdated={handleRefreshDeal}
        />
      )}
    </div>
  );
};

// --- Styles ---
const styles = {
  pageContainer: {
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
    paddingTop: "2rem",
    paddingBottom: "4rem",
  },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "0 24px" },
  loading: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "70vh",
    fontSize: "18px",
    color: "#6b7280",
  },
  spinner: {
    fontSize: "48px",
    animation: "spin 2s linear infinite",
    marginBottom: "1rem",
  },
  error: {
    textAlign: "center",
    padding: "60px 20px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  errorIcon: { fontSize: "64px", marginBottom: "1rem" },
  errorTitle: { fontSize: "28px", fontWeight: 700, color: "#ef4444", marginBottom: "1rem" },
  backButton: {
    padding: "12px 24px",
    backgroundColor: "#ffffff",
    border: "2px solid #e5e7eb",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    color: "#1f2937",
    marginBottom: "2rem",
    transition: "all 0.2s",
  },

  // ⭐⭐⭐ NEW IMAGE GALLERY STYLES ⭐⭐⭐
  imageSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    marginBottom: "2rem",
  },
  imageLoading: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "400px",
    color: "#6b7280",
  },
  mainImageContainer: {
    position: "relative",
    width: "100%",
    height: "500px",
    backgroundColor: "#f3f4f6",
    overflow: "hidden",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  navButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    fontSize: "32px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    transition: "all 0.3s",
    lineHeight: 1,
  },
  navButtonLeft: {
    left: "20px",
  },
  navButtonRight: {
    right: "20px",
  },
  imageCounter: {
    position: "absolute",
    bottom: "20px",
    right: "20px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    padding: "8px 16px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: 600,
    zIndex: 10,
  },
  thumbnailContainer: {
    display: "flex",
    gap: "12px",
    padding: "20px",
    overflowX: "auto",
    backgroundColor: "#f9fafb",
  },
  thumbnail: {
    width: "120px",
    height: "90px",
    objectFit: "cover",
    borderRadius: "8px",
    cursor: "pointer",
    border: "3px solid transparent",
    transition: "all 0.3s",
    flexShrink: 0,
  },
  thumbnailActive: {
    border: "3px solid #3b82f6",
    transform: "scale(1.05)",
  },
  noImagesMessage: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
    fontSize: "16px",
    backgroundColor: "#f9fafb",
  },
  // ⭐⭐⭐ END NEW IMAGE GALLERY STYLES ⭐⭐⭐

  infoSection: {
    backgroundColor: "#ffffff",
    padding: 30,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    marginBottom: "2rem",
  },
  header: { marginBottom: "1.5rem" },
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
  priceSection: { marginTop: "1rem", marginBottom: "1.5rem" },
  price: { fontSize: 32, fontWeight: 800, color: "#059669" },
  perMonth: { fontSize: 16, fontWeight: 500, color: "#64748b", marginLeft: "8px" },
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

const keyframesStyle = ` @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } `;

export default PropertyDetails;