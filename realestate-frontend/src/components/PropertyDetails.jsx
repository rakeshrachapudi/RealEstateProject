// PropertyDetails.jsx (COMPACT PROFESSIONAL - Enhanced Animations with WhatsApp Integration)
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

  // ⭐ AGENT STATES FOR WHATSAPP ⭐
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);

  // ⭐ IMAGE STATES ⭐
  const [propertyImages, setPropertyImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingImages, setLoadingImages] = useState(true);

  // Create Deal States
  const [creatingDeal, setCreatingDeal] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [buyerPhone, setBuyerPhone] = useState("");

  useEffect(() => {
    fetchPropertyDetails();
    fetchAgents(); // ⭐ Fetch agents on component mount ⭐
  }, [propertyIdParam]);

  // ⭐ FETCH AGENTS FUNCTION ⭐
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
        if (result?.success && Array.isArray(result.data)) {
          const activeAgents = result.data.filter(
            (agent) => agent.isActive && agent.mobileNumber
          );
          setAgents(activeAgents);
          console.log("✅ Fetched agents:", activeAgents);
        } else if (Array.isArray(result)) {
          const activeAgents = result.filter(
            (agent) => agent.isActive && agent.mobileNumber
          );
          setAgents(activeAgents);
        }
      } else {
        console.error("Failed to fetch agents:", response.status);
        setAgents([]);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  // ⭐ HANDLE CONTACT AGENT WHATSAPP FUNCTION ⭐
  const handleContactAgent = () => {
    if (agents.length === 0) {
      alert("No agents available at the moment. Please try again later.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * agents.length);
    const selectedAgent = agents[randomIndex];

    let mobileNumber = selectedAgent.mobileNumber.replace(/\D/g, "");
    if (mobileNumber.length === 10) {
      mobileNumber = "91" + mobileNumber;
    }

    const propertyTitle = property?.title || "Property";
    const propertyPrice = formatPrice(property?.price);
    const propertyLocation = property?.areaName || property?.city || "Location";

    const message =
      `Hi! I'm interested in this property:\n\n` +
      `🏠 *${propertyTitle}*\n` +
      `💰 Price: ${propertyPrice}\n` +
      `📍 Location: ${propertyLocation}\n\n` +
      `Could you please provide more details?`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${mobileNumber}?text=${encodedMessage}`;

    console.log("Selected Agent:", selectedAgent);
    console.log("WhatsApp URL:", whatsappUrl);

    window.open(whatsappUrl, "_blank");
  };

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
          const sortedImages = images
            .filter((img) => img.imageUrl)
            .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

          setPropertyImages(sortedImages);
        } else {
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

  const getCurrentImageUrl = () => {
    if (propertyImages.length > 0) {
      return propertyImages[currentImageIndex]?.imageUrl;
    }
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

      const currentPagePropertyId = property.id;
      const dealForThisProperty = userDeals.find((deal) => {
        const dealPropertyId = deal?.property?.id ?? deal?.propertyId;
        return dealPropertyId == currentPagePropertyId;
      });

      if (dealForThisProperty) {
        setExistingDeal(dealForThisProperty);
      } else {
        setExistingDeal(null);
      }
    } catch (err) {
      console.error(`Error in checkForExistingDeal:`, err);
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
        <div style={styles.modernSpinner}></div>
        <p style={styles.loadingText}>Loading property details...</p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={styles.error}>
        <div style={styles.errorIcon}>🏠</div>
        <h2 style={styles.errorTitle}>Oops! Something went wrong</h2>
        <p style={styles.errorMessage}>{error || "Property not found."}</p>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{keyframesStyles}</style>
      <div style={styles.pageContainer}>
        <div style={styles.container}>
          {/* Compact Back Button */}
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <span style={styles.backIcon}>←</span>
            <span>Back</span>
          </button>

          {/* Compact Image Gallery Section */}
          <div style={styles.imageSection}>
            {loadingImages ? (
              <div style={styles.imageLoading}>
                <div style={styles.modernSpinner}></div>
                <p>Loading...</p>
              </div>
            ) : (
              <>
                <div style={styles.mainImageContainer}>
                  <img
                    src={getCurrentImageUrl()}
                    alt={property.title}
                    style={styles.mainImage}
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop";
                    }}
                  />

                  {propertyImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePreviousImage}
                        style={{ ...styles.navButton, ...styles.navButtonLeft }}
                      >
                        ‹
                      </button>
                      <button
                        onClick={handleNextImage}
                        style={{
                          ...styles.navButton,
                          ...styles.navButtonRight,
                        }}
                      >
                        ›
                      </button>

                      <div style={styles.imageCounter}>
                        {currentImageIndex + 1}/{propertyImages.length}
                      </div>
                    </>
                  )}
                </div>

                {propertyImages.length > 1 && (
                  <div style={styles.thumbnailContainer}>
                    {propertyImages.slice(0, 5).map((image, index) => (
                      <img
                        key={image.id || index}
                        src={image.imageUrl}
                        alt={`View ${index + 1}`}
                        style={{
                          ...styles.thumbnail,
                          ...(index === currentImageIndex
                            ? styles.thumbnailActive
                            : {}),
                        }}
                        onClick={() => handleThumbnailClick(index)}
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&h=150&fit=crop";
                        }}
                      />
                    ))}
                    {propertyImages.length > 5 && (
                      <div style={styles.moreImages}>
                        +{propertyImages.length - 5}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Compact Main Content - Two Columns */}
          <div style={styles.mainContent}>
            {/* Left Column - Property Info */}
            <div style={styles.leftColumn}>
              {/* Compact Property Header */}
              <div style={styles.propertyHeader}>
                <div style={styles.headerTop}>
                  {property.isFeatured && (
                    <span style={styles.featuredBadge}>⭐ Featured</span>
                  )}
                  <span style={styles.listingTypeTag}>
                    {property.listingType?.toLowerCase() === "sale"
                      ? "SALE"
                      : "RENT"}
                  </span>
                </div>

                <h1 style={styles.propertyTitle}>
                  {property.title || "Property"}
                </h1>

                <div style={styles.locationRow}>
                  <span style={styles.locationIcon}>📍</span>
                  <span style={styles.locationText}>
                    {property.areaName || property.city || "Location"}
                  </span>
                </div>

                <div style={styles.priceContainer}>
                  <span style={styles.priceAmount}>
                    {formatPrice(property.price)}
                  </span>
                  {property.listingType?.toLowerCase() === "rent" && (
                    <span style={styles.pricePeriod}>/month</span>
                  )}
                </div>
              </div>

              {/* Compact Key Details */}
              <div style={styles.keyDetailsGrid}>
                {property.areaSqft && (
                  <div style={styles.detailCard}>
                    <span style={styles.detailIcon}>📐</span>
                    <div>
                      <div style={styles.detailLabel}>Area</div>
                      <div style={styles.detailValue}>
                        {property.areaSqft} sq ft
                      </div>
                    </div>
                  </div>
                )}
                {property.bedrooms > 0 && (
                  <div style={styles.detailCard}>
                    <span style={styles.detailIcon}>🛏️</span>
                    <div>
                      <div style={styles.detailLabel}>Beds</div>
                      <div style={styles.detailValue}>{property.bedrooms}</div>
                    </div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div style={styles.detailCard}>
                    <span style={styles.detailIcon}>🚿</span>
                    <div>
                      <div style={styles.detailLabel}>Baths</div>
                      <div style={styles.detailValue}>{property.bathrooms}</div>
                    </div>
                  </div>
                )}
                {property.propertyType && (
                  <div style={styles.detailCard}>
                    <span style={styles.detailIcon}>🏠</span>
                    <div>
                      <div style={styles.detailLabel}>Type</div>
                      <div style={styles.detailValue}>
                        {property.propertyType.typeName || property.type}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compact Description */}
              {property.description && (
                <div style={styles.descriptionContainer}>
                  <h3 style={styles.subSectionTitle}>Description</h3>
                  <p style={styles.description}>{property.description}</p>
                </div>
              )}

              {/* Compact Amenities */}
              {property.amenities && (
                <div style={styles.amenitiesContainer}>
                  <h3 style={styles.subSectionTitle}>Amenities</h3>
                  <div style={styles.amenitiesGrid}>
                    {property.amenities
                      .split(",")
                      .map((a) => a.trim())
                      .filter((a) => a)
                      .slice(0, 8)
                      .map((amenity, idx) => (
                        <div key={idx} style={styles.amenityChip}>
                          {amenity}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Contact & Deals */}
            <div style={styles.rightColumn}>
              {/* Compact Contact Section */}
              <div style={styles.contactSection}>
                <h3 style={styles.contactTitle}>Contact Agent</h3>

                {property.user && (
                  <div style={styles.ownerInfo}>
                    <div style={styles.ownerAvatar}>
                      {(property.user.firstName?.[0] || "A").toUpperCase()}
                    </div>
                    <div>
                      <div style={styles.ownerLabel}>Listed by</div>
                      <div style={styles.ownerName}>
                        {property.user.firstName || ""}{" "}
                        {property.user.lastName || "Agent"}
                      </div>
                    </div>
                  </div>
                )}

                <div style={styles.contactButtons}>
                  <button
                    style={styles.whatsappButton}
                    onClick={handleContactAgent}
                    disabled={loadingAgents || agents.length === 0}
                  >
                    <span>{loadingAgents ? "⏳" : "💬"}</span>
                    WhatsApp
                  </button>

                  <button style={styles.phoneButton}>
                    <span>📞</span>
                    Call
                  </button>
                </div>

                {/* Compact Agent Status */}
                <div style={styles.agentStatus}>
                  {loadingAgents && (
                    <span style={styles.statusLoading}>Finding agents...</span>
                  )}
                  {!loadingAgents && agents.length === 0 && (
                    <span style={styles.statusUnavailable}>
                      No agents available
                    </span>
                  )}
                  {!loadingAgents && agents.length > 0 && (
                    <span style={styles.statusAvailable}>
                      {agents.length} agent{agents.length > 1 ? "s" : ""}{" "}
                      available
                    </span>
                  )}
                </div>
              </div>

              {/* Compact Deal Section */}
              <div style={styles.dealSection}>
                <h4 style={styles.dealSectionTitle}>Deal Status</h4>

                {checkingDeal && (
                  <div style={styles.dealStatusLoading}>
                    <div style={styles.modernSpinnerSmall}></div>
                    <span>Checking...</span>
                  </div>
                )}

                {!checkingDeal && existingDeal && (
                  <div style={styles.dealExists}>
                    <div style={styles.dealBadge}>✅ Active Deal</div>
                    <div style={styles.dealInfo}>
                      <strong>Stage:</strong>{" "}
                      {existingDeal.stage ||
                        existingDeal.currentStage ||
                        "INQUIRY"}
                    </div>
                    <button
                      onClick={() => setShowDealDetails(true)}
                      style={styles.viewDealButton}
                    >
                      View Details
                    </button>
                  </div>
                )}

                {!checkingDeal && !existingDeal && (
                  <div style={styles.noDeal}>
                    <div style={styles.noDealBadge}>ℹ️ No active deals</div>
                    {user &&
                      (user.role === "AGENT" || user.role === "ADMIN") && (
                        <div style={styles.createDeal}>
                          <input
                            type="tel"
                            value={buyerPhone}
                            onChange={(e) => setBuyerPhone(e.target.value)}
                            placeholder="Buyer phone"
                            style={styles.dealInput}
                            maxLength={10}
                          />
                          <button
                            onClick={handleCreateDeal}
                            style={styles.createDealButton}
                            disabled={creatingDeal}
                          >
                            {creatingDeal ? "⏳" : "➕"} Create
                          </button>
                          {createError && (
                            <div style={styles.errorAlert}>{createError}</div>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* Compact Property Details */}
              <div style={styles.detailsSection}>
                <h4 style={styles.detailsSectionTitle}>Details</h4>
                <div style={styles.detailsList}>
                  <div style={styles.detailItem}>
                    <span>Price:</span>
                    <span>{formatPrice(property.price)}</span>
                  </div>
                  {property.address && (
                    <div style={styles.detailItem}>
                      <span>Address:</span>
                      <span>{property.address}</span>
                    </div>
                  )}
                  {property.pincode && (
                    <div style={styles.detailItem}>
                      <span>Pincode:</span>
                      <span>{property.pincode}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

        {/* Compact Floating Action Button */}
        <button
          style={styles.floatingActionButton}
          onClick={handleContactAgent}
          disabled={loadingAgents || agents.length === 0}
        >
          💬
        </button>
      </div>
    </>
  );
};

// Compact Keyframes
const keyframesStyles = `
  @keyframes modernSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
`;

// Compact Professional Styles
const styles = {
  pageContainer: {
    background: "linear-gradient(135deg, #c9cacbff 0%, #e3dbecff 100%)",
    minHeight: "100vh",
    padding: "1rem 0",
    animation: "fadeInUp 0.5s ease-out",
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 16px",
  },

  // Compact Loading
  loading: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "50vh",
  },

  modernSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid #f3f4f6",
    borderTop: "3px solid #3b82f6",
    borderRadius: "50%",
    animation: "modernSpin 1s linear infinite",
    marginBottom: "1rem",
  },

  modernSpinnerSmall: {
    width: "16px",
    height: "16px",
    border: "2px solid #f3f4f6",
    borderTop: "2px solid #3b82f6",
    borderRadius: "50%",
    animation: "modernSpin 1s linear infinite",
  },

  loadingText: {
    fontSize: "16px",
    color: "#6b7280",
    fontWeight: "500",
  },

  // Compact Error
  error: {
    textAlign: "center",
    padding: "40px 20px",
    maxWidth: "500px",
    margin: "0 auto",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
  },

  errorIcon: {
    fontSize: "60px",
    marginBottom: "1rem",
  },

  errorTitle: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "0.5rem",
  },

  errorMessage: {
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.5",
  },

  // Compact Back Button
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 20px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    border: "none",
    borderRadius: "25px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "1rem",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s ease",
  },

  backIcon: {
    fontSize: "16px",
  },

  // Compact Image Section
  imageSection: {
    backgroundColor: "white",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    marginBottom: "1.5rem",
  },

  imageLoading: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "300px",
    color: "#6b7280",
  },

  mainImageContainer: {
    position: "relative",
    width: "100%",
    height: "350px",
    overflow: "hidden",
    backgroundColor: "#f8fafc",
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
    width: "40px",
    height: "40px",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    color: "#1f2937",
    border: "none",
    borderRadius: "50%",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },

  navButtonLeft: {
    left: "15px",
  },

  navButtonRight: {
    right: "15px",
  },

  imageCounter: {
    position: "absolute",
    bottom: "15px",
    right: "15px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "white",
    padding: "6px 12px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "600",
    zIndex: 10,
  },

  thumbnailContainer: {
    display: "flex",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    alignItems: "center",
  },

  thumbnail: {
    width: "80px",
    height: "60px",
    objectFit: "cover",
    borderRadius: "8px",
    cursor: "pointer",
    border: "2px solid transparent",
    transition: "all 0.3s ease",
  },

  thumbnailActive: {
    border: "2px solid #3b82f6",
    transform: "scale(1.05)",
  },

  moreImages: {
    width: "80px",
    height: "60px",
    backgroundColor: "#e5e7eb",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "600",
    color: "#6b7280",
  },

  // Main Content Layout
  mainContent: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "1.5rem",
  },

  leftColumn: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },

  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  // Compact Property Header
  propertyHeader: {
    marginBottom: "1.5rem",
  },

  headerTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
    flexWrap: "wrap",
    gap: "8px",
  },

  featuredBadge: {
    backgroundColor: "#f59e0b",
    color: "white",
    padding: "6px 12px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "600",
  },

  listingTypeTag: {
    padding: "6px 12px",
    backgroundColor: "#dbeafe",
    color: "#1e40af",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "700",
  },

  propertyTitle: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#1f2937",
    margin: "0 0 0.75rem 0",
    lineHeight: "1.2",
  },

  locationRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "1rem",
  },

  locationIcon: {
    fontSize: "16px",
    color: "#ef4444",
  },

  locationText: {
    fontSize: "14px",
    color: "#6b7280",
    fontWeight: "500",
  },

  priceContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: "8px",
  },

  priceAmount: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#059669",
  },

  pricePeriod: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#64748b",
  },

  // Compact Key Details
  keyDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginBottom: "1.5rem",
  },

  detailCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #f1f5f9",
  },

  detailIcon: {
    fontSize: "20px",
    color: "#3b82f6",
  },

  detailLabel: {
    fontSize: "11px",
    color: "#6b7280",
    marginBottom: "2px",
    textTransform: "uppercase",
    fontWeight: "600",
  },

  detailValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1f2937",
  },

  // Compact Description
  descriptionContainer: {
    marginBottom: "1.5rem",
  },

  subSectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "0.75rem",
    color: "#1f2937",
  },

  description: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#4b5563",
    margin: 0,
  },

  // Compact Amenities
  amenitiesContainer: {
    marginBottom: "1rem",
  },

  amenitiesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
  },

  amenityChip: {
    padding: "8px 12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
    color: "#374151",
    border: "1px solid #f1f5f9",
  },

  // Compact Contact Section
  contactSection: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },

  contactTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#1f2937",
  },

  ownerInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
  },

  ownerAvatar: {
    width: "40px",
    height: "40px",
    backgroundColor: "#3b82f6",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
  },

  ownerLabel: {
    fontSize: "12px",
    color: "#6b7280",
    marginBottom: "2px",
  },

  ownerName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1f2937",
  },

  contactButtons: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
  },

  whatsappButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "12px",
    backgroundColor: "#25d366",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  phoneButton: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "12px",
    backgroundColor: "white",
    color: "#3b82f6",
    border: "2px solid #3b82f6",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  agentStatus: {
    textAlign: "center",
    fontSize: "12px",
    fontWeight: "500",
  },

  statusLoading: {
    color: "#f59e0b",
  },

  statusUnavailable: {
    color: "#dc2626",
  },

  statusAvailable: {
    color: "#16a34a",
  },

  // Compact Deal Section
  dealSection: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },

  dealSectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "12px",
  },

  dealStatusLoading: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#f0f9ff",
    borderRadius: "8px",
    color: "#1e3a8a",
    fontSize: "12px",
  },

  dealExists: {
    textAlign: "center",
  },

  dealBadge: {
    padding: "8px 12px",
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "8px",
  },

  dealInfo: {
    fontSize: "12px",
    color: "#4b5563",
    marginBottom: "12px",
  },

  viewDealButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  noDeal: {
    textAlign: "center",
  },

  noDealBadge: {
    padding: "8px 12px",
    backgroundColor: "#fef3c7",
    color: "#92400e",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "12px",
  },

  createDeal: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  dealInput: {
    padding: "10px 12px",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  },

  createDealButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "10px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  errorAlert: {
    padding: "8px 12px",
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
  },

  // Compact Details Section
  detailsSection: {
    backgroundColor: "white",
    padding: "16px",
    borderRadius: "16px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },

  detailsSectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "12px",
  },

  detailsList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  detailItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid #f3f4f6",
  },

  // Compact Floating Button
  floatingActionButton: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "50px",
    height: "50px",
    backgroundColor: "#25d366",
    color: "white",
    border: "none",
    borderRadius: "50%",
    fontSize: "20px",
    cursor: "pointer",
    zIndex: 1000,
    boxShadow: "0 4px 15px rgba(37, 211, 102, 0.3)",
    transition: "all 0.3s ease",
    animation: "float 3s ease-in-out infinite",
  },
};

export default PropertyDetails;
