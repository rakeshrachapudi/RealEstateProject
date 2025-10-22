import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import PropertySearch from "../components/PropertySearch";
import PropertyList from "../components/PropertyList";
import { getFeaturedProperties } from "../services/api";
import { styles } from "../styles.js";
import BrowsePropertiesForDeal from "../pages/BrowsePropertiesForDeal";
import DealDetailModal from "../DealDetailModal.jsx";
import { BACKEND_BASE_URL } from "../config/config";

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [propsList, setPropsList] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [myDealsProperties, setMyDealsProperties] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("featured");
  const [selectedArea, setSelectedArea] = useState(null);
  const [showBrowseDeals, setShowBrowseDeals] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const navigate = useNavigate();

  const popularAreas = [
    { name: "Gachibowli", emoji: "🏢" },
    { name: "HITEC City", emoji: "🏢" },
    { name: "Madhapur", emoji: "🌆" },
    { name: "Kondapur", emoji: "🏙️" },
    { name: "Kukatpally", emoji: "🏘️" },
    { name: "Miyapur", emoji: "🌇" },
    { name: "Jubilee Hills", emoji: "🛒" },
  ];

  const extractDealsFromResponse = (response) => {
    if (!response) return [];
    if (response.success) {
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === "object") return [data];
    }
    if (Array.isArray(response)) return response;
    return [];
  };

  const fetchProperties = async () => {
    try {
      const response = await getFeaturedProperties();
      if (response && response.success) {
        let properties = response.data;
        if (isAuthenticated && user?.id) {
          properties = properties.sort((a, b) => {
            const aIsUser = a.user?.id === user.id;
            const bIsUser = b.user?.id === user.id;
            if (aIsUser && !bIsUser) return -1;
            if (!aIsUser && bIsUser) return 1;
            return 0;
          });
        }
        setPropsList(properties);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error("Error loading properties:", error);
    }
  };

  const fetchMyProperties = async () => {
    if (!isAuthenticated || !user?.id) {
      setMyProperties([]);
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const propertiesArray = Array.isArray(data) ? data : data.data || [];
        const verifiedProperties = propertiesArray.filter(
          (prop) => prop.user?.id === user.id
        );
        setMyProperties(verifiedProperties);
      } else {
        setMyProperties([]);
      }
    } catch (error) {
      console.error("Error loading my properties:", error);
      setMyProperties([]);
    }
  };

  const fetchMyDeals = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log("Not authenticated, clearing deals");
      setMyDeals([]);
      return;
    }

    try {
      console.log(
        "Starting fetchMyDeals for user:",
        user.id,
        "Role:",
        user.role
      );
      const allDeals = [];
      const seenDealIds = new Set();
      const token = localStorage.getItem("authToken");

      const addDeals = (deals, source) => {
        if (!Array.isArray(deals)) {
          console.log(`No deals from ${source} (not an array)`);
          return;
        }
        console.log(`Adding ${deals.length} deals from ${source}`);
        deals.forEach((deal) => {
          const dealId = deal.dealId || deal.id;
          if (dealId && !seenDealIds.has(dealId)) {
            allDeals.push(deal);
            seenDealIds.add(dealId);
          }
        });
      };

      try {
        console.log(
          `Fetching deals for role: ${user.role}, userId: ${user.id}`
        );
        const roleResponse = await fetch(
          `${BACKEND_BASE_URL}/api/deals/my-deals?userRole=${user.role}&userId=${user.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          console.log(`Role response for ${user.role}:`, roleData);
          const roleDeals = extractDealsFromResponse(roleData);
          addDeals(roleDeals, `role ${user.role}`);
        } else {
          console.error(
            `Failed to fetch ${user.role} deals:`,
            roleResponse.status
          );
        }
      } catch (err) {
        console.error("Error fetching role-based deals:", err);
      }

      if (user.role !== "AGENT" && user.role !== "ADMIN") {
        try {
          console.log("Fetching deals as BUYER");
          const buyerResponse = await fetch(
            `${BACKEND_BASE_URL}/api/deals/my-deals?userRole=BUYER&userId=${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (buyerResponse.ok) {
            const buyerData = await buyerResponse.json();
            console.log("Buyer response:", buyerData);
            const buyerDeals = extractDealsFromResponse(buyerData);
            addDeals(buyerDeals, "BUYER");
          } else {
            console.error("Failed to fetch BUYER deals:", buyerResponse.status);
          }
        } catch (err) {
          console.error("Error fetching buyer deals:", err);
        }

        try {
          console.log("Fetching deals as SELLER");
          const sellerResponse = await fetch(
            `${BACKEND_BASE_URL}/api/deals/my-deals?userRole=SELLER&userId=${user.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (sellerResponse.ok) {
            const sellerData = await sellerResponse.json();
            console.log("Seller response:", sellerData);
            const sellerDeals = extractDealsFromResponse(sellerData);
            addDeals(sellerDeals, "SELLER");
          } else {
            console.error(
              "Failed to fetch SELLER deals:",
              sellerResponse.status
            );
          }
        } catch (err) {
          console.error("Error fetching seller deals:", err);
        }
      }

      console.log(`Total deals after all fetches: ${allDeals.length}`);
      setMyDeals(allDeals);
    } catch (error) {
      console.error("Error loading deals:", error);
      setMyDeals([]);
    }
  };

  const fetchMyDealsProperties = async () => {
    if (!isAuthenticated || !user?.id) {
      setMyDealsProperties([]);
      return;
    }

    try {
      const userPropsResponse = await fetch(
        `${BACKEND_BASE_URL}/api/properties/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!userPropsResponse.ok) {
        setMyDealsProperties([]);
        return;
      }

      const userPropsData = await userPropsResponse.json();
      const userProperties = Array.isArray(userPropsData)
        ? userPropsData
        : userPropsData.data || [];

      const userPropertyIds = new Set(
        userProperties
          .filter((prop) => prop.user?.id === user.id)
          .map((prop) => prop.id || prop.propertyId)
      );

      if (userPropertyIds.size === 0) {
        setMyDealsProperties([]);
        return;
      }

      let allDeals = [];

      if (user.role === "AGENT" || user.role === "ADMIN") {
        try {
          const agentResponse = await fetch(
            `${BACKEND_BASE_URL}/api/deals/agent/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
          if (agentResponse.ok) {
            const agentData = await agentResponse.json();
            const deals = Array.isArray(agentData)
              ? agentData
              : agentData.data || [];
            allDeals = [...allDeals, ...deals];
          }
        } catch (err) {
          console.warn("Error fetching agent deals:", err);
        }
      }

      const propertiesFromDeals = [];
      const seenPropertyIds = new Set();

      allDeals.forEach((deal) => {
        const propertyId = deal.property?.id || deal.propertyId;
        if (
          propertyId &&
          userPropertyIds.has(propertyId) &&
          !seenPropertyIds.has(propertyId) &&
          deal.property
        ) {
          seenPropertyIds.add(propertyId);
          propertiesFromDeals.push({
            ...deal.property,
            dealStage: deal.stage,
            dealId: deal.id,
            dealCreatedAt: deal.createdAt,
            buyerName: deal.buyer
              ? `${deal.buyer.firstName} ${deal.buyer.lastName}`
              : "N/A",
            buyerPhone: deal.buyer?.mobileNumber || "N/A",
          });
        }
      });

      setMyDealsProperties(propertiesFromDeals);
    } catch (error) {
      console.error("Error loading deals properties:", error);
      setMyDealsProperties([]);
    }
  };

  useEffect(() => {
    fetchProperties();
    if (isAuthenticated && user?.id) {
      fetchMyProperties();
      fetchMyDeals();
      fetchMyDealsProperties();
    } else {
      setMyProperties([]);
      setMyDeals([]);
      setMyDealsProperties([]);
      setActiveTab("featured");
    }
  }, [isAuthenticated, user?.id, user?.role]);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setShowSearchResults(true);
    setSearchLoading(false);
    setActiveTab("featured");
    setSelectedArea(null);
  };

  const handleSearchStart = () => {
    setSearchLoading(true);
  };

  const handleResetSearch = () => {
    setShowSearchResults(false);
    setSearchResults([]);
    setActiveTab("featured");
    setSelectedArea(null);
    fetchProperties();
  };

  const handleAreaClick = (area) => {
    setSelectedArea(area.name);
    setShowSearchResults(false);
    setActiveTab("featured");
  };

  const getFilteredPropertiesByArea = () => {
    if (!selectedArea) return propsList;
    return propsList.filter((property) => {
      const propertyArea = (
        property.areaName ||
        property.area?.areaName ||
        ""
      ).toLowerCase();
      const searchArea = selectedArea.toLowerCase();
      return propertyArea.includes(searchArea);
    });
  };

  const handlePropertyUpdated = () => {
    fetchProperties();
    if (isAuthenticated && user?.id) {
      fetchMyProperties();
      fetchMyDeals();
      fetchMyDealsProperties();
    }
  };

  const handlePropertyDeleted = () => {
    fetchProperties();
    if (isAuthenticated && user?.id) {
      fetchMyProperties();
      fetchMyDeals();
      fetchMyDealsProperties();
    }
  };

  const handleCreateDealClick = () => {
    setShowBrowseDeals(true);
  };

  const buttonShouldBeVisible =
    activeTab === "my-deals" &&
    isAuthenticated &&
    user &&
    (user.role === "AGENT" || user.role === "ADMIN");

  const displayedProperties = showSearchResults
    ? searchResults
    : selectedArea
    ? getFilteredPropertiesByArea()
    : activeTab === "my-properties"
    ? myProperties
    : activeTab === "my-deals"
    ? myDeals
    : activeTab === "property-deals"
    ? myDealsProperties
    : propsList;

  const dealsPropertyCount = myDealsProperties.length;
  const dealsCount = myDeals.length;

  const getStageColor = (stage) => {
    const colors = {
      INQUIRY: "#3b82f6",
      SHORTLIST: "#8b5cf6",
      NEGOTIATION: "#f59e0b",
      AGREEMENT: "#10b981",
      REGISTRATION: "#06b6d4",
      PAYMENT: "#ec4899",
      COMPLETED: "#22c55e",
    };
    return colors[stage] || "#6b7280";
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    if (typeof price === "number") return price.toLocaleString("en-IN");
    return String(price);
  };

  const bannerStyles = {
    banner: {
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "60px 40px",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "80px",
      boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
      borderRadius: 20,
      marginBottom: "20px",
      maxWidth: "1400px",
    },
    bannerContent: {
      flex: 1,
    },
    bannerTitle: {
      fontSize: "48px",
      fontWeight: "900",
      margin: "0 0 16px 0",
      lineHeight: "1.2",
      color: "white",
      fontFamily: "'Poppins', sans-serif",
    },
    bannerSubtitle: {
      fontSize: "16px",
      opacity: 0.95,
      margin: "0 0 24px 0",
      color: "rgba(255, 255, 255, 0.95)",
      fontFamily: "'Inter', sans-serif",
      lineHeight: "1.6",
    },
    bannerFeatures: {
      display: "flex",
      flexDirection: "column",
      gap: "14px",
    },
    bannerFeature: {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      fontSize: "15px",
      fontFamily: "'Inter', sans-serif",
      color: "rgba(255, 255, 255, 0.9)",
      fontWeight: "500",
    },
    checkmark: {
      fontSize: "20px",
      fontWeight: "bold",
      marginTop: "2px",
      flexShrink: 0,
    },
    bannerIllustration: {
      flex: 1,
      fontSize: "120px",
      textAlign: "center",
      opacity: 0.85,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  return (
    <>
      {/* BANNER SECTION - NEW */}

      {/* EXISTING CONTENT - ALL PRESERVED */}
      <div style={styles.container}>
        <section style={bannerStyles.banner}>
          <div style={bannerStyles.bannerContent}>
            <h2 style={bannerStyles.bannerTitle}>How PropertyDeals Works</h2>
            <p style={bannerStyles.bannerSubtitle}>
              Simple, transparent, and hassle-free property deals
            </p>
            <div style={bannerStyles.bannerFeatures}>
              <div style={bannerStyles.bannerFeature}>
                <span style={bannerStyles.checkmark}>✓</span>
                <span>
                  <strong>No Subscription Required</strong> - Connect for free,
                  no hidden charges
                </span>
              </div>
              <div style={bannerStyles.bannerFeature}>
                <span style={bannerStyles.checkmark}>✓</span>
                <span>
                  <strong>Buyer Connects to Agent</strong> - Direct connection,
                  transparent communication
                </span>
              </div>
              <div style={bannerStyles.bannerFeature}>
                <span style={bannerStyles.checkmark}>✓</span>
                <span>
                  <strong>End-to-End Documentation</strong> - Agent handles all
                  legal paperwork & registration
                </span>
              </div>
              <div style={bannerStyles.bannerFeature}>
                <span style={bannerStyles.checkmark}>✓</span>
                <span>
                  <strong>Only 0.5% Fee</strong> - Charged equally from both
                  buyer and seller, that's it!
                </span>
              </div>
            </div>
          </div>
          <div style={bannerStyles.bannerIllustration}>🤝</div>
        </section>
        <section style={styles.heroSection}>
          <div style={styles.heroContent}>
            <h1 style={styles.mainTitle}>
              Find Your <span style={styles.titleGradient}> Dream Home </span>{" "}
              🏡
            </h1>
            <p style={styles.heroSubtitle}>
              Discover the perfect property that matches your lifestyle and
              budget.
            </p>
          </div>
          <div style={styles.heroGraphics}>
            <div style={styles.floatingElement1}>✨</div>
            <div style={styles.floatingElement2}>🏠</div>
            <div style={styles.floatingElement3}>🌆</div>
          </div>
        </section>

        <section style={styles.searchSection}>
          <PropertySearch
            onSearchResults={handleSearchResults}
            onSearchStart={handleSearchStart}
            onReset={handleResetSearch}
          />
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>📍</span> Popular Areas in
            Hyderabad
          </h2>
          <div style={styles.areasGrid}>
            {popularAreas.map((area) => (
              <button
                key={area.name}
                onClick={() => handleAreaClick(area)}
                style={{
                  ...styles.areaButton,
                  backgroundColor:
                    selectedArea === area.name ? "#667eea" : "white",
                  color: selectedArea === area.name ? "white" : "#334155",
                  borderColor:
                    selectedArea === area.name ? "#667eea" : "#e2e8f0",
                  boxShadow:
                    selectedArea === area.name
                      ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                      : "none",
                }}
              >
                <span style={styles.areaEmoji}>{area.emoji}</span>
                {area.name}
              </button>
            ))}
          </div>
        </section>

        <section style={styles.propertiesSection}>
          {isAuthenticated && !showSearchResults && !selectedArea && (
            <div style={styles.tabContainer}>
              <button
                onClick={() => setActiveTab("featured")}
                style={{
                  ...styles.tab,
                  ...(activeTab === "featured" ? styles.activeTab : {}),
                }}
              >
                ⭐ Featured Properties ({propsList.length})
              </button>

              {myProperties.length > 0 && (
                <button
                  onClick={() => setActiveTab("my-properties")}
                  style={{
                    ...styles.tab,
                    ...(activeTab === "my-properties" ? styles.activeTab : {}),
                  }}
                >
                  📄 My Uploaded Properties ({myProperties.length})
                </button>
              )}

              {dealsCount > 0 && (
                <button
                  onClick={() => setActiveTab("my-deals")}
                  style={{
                    ...styles.tab,
                    ...(activeTab === "my-deals" ? styles.activeTab : {}),
                  }}
                >
                  📊 My Deals ({dealsCount})
                </button>
              )}

              {dealsPropertyCount > 0 && (
                <button
                  onClick={() => setActiveTab("property-deals")}
                  style={{
                    ...styles.tab,
                    ...(activeTab === "property-deals" ? styles.activeTab : {}),
                  }}
                >
                  🏠 Deals on My Properties ({dealsPropertyCount})
                </button>
              )}
            </div>
          )}

          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>
                {showSearchResults
                  ? "🔍"
                  : selectedArea
                  ? "📍"
                  : activeTab === "my-properties"
                  ? "📄"
                  : activeTab === "my-deals"
                  ? "📊"
                  : activeTab === "property-deals"
                  ? "🏠"
                  : "⭐"}
              </span>
              {showSearchResults
                ? `Search Results (${searchResults.length} found)`
                : selectedArea
                ? `Properties in ${selectedArea} (${
                    getFilteredPropertiesByArea().length
                  } found)`
                : activeTab === "my-properties"
                ? `My Uploaded Properties (${myProperties.length} found)`
                : activeTab === "my-deals"
                ? `My Deals (${myDeals.length} found)`
                : activeTab === "property-deals"
                ? `Deals on My Properties (${myDealsProperties.length} found)`
                : `Featured Properties (${propsList.length} found)`}
            </h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {(showSearchResults || selectedArea) && (
                <button
                  onClick={handleResetSearch}
                  style={styles.clearSearchBtn}
                >
                  ✕ Clear Filter
                </button>
              )}
              {buttonShouldBeVisible && (
                <button
                  onClick={handleCreateDealClick}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "700",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    transition: "background 0.2s, transform 0.2s",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  ➕ Create New Deal
                </button>
              )}
            </div>
          </div>

          {activeTab === "my-deals" && myDeals.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔭</div>
              <h3 style={styles.emptyTitle}>No Deals Yet</h3>
              <p style={styles.emptyText}>You don't have any deals yet.</p>
            </div>
          ) : activeTab === "my-deals" ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {myDeals.map((deal) => {
                return (
                  <div
                    key={deal.dealId || deal.id}
                    style={{
                      padding: "16px",
                      backgroundColor: "#f8fafc",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onClick={() =>
                      navigate(
                        `/property/${deal.propertyId || deal.property?.id}`
                      )
                    }
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 8px 16px rgba(0,0,0,0.15)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "600",
                        marginBottom: "12px",
                        backgroundColor: getStageColor(
                          deal.stage || deal.currentStage
                        ),
                      }}
                    >
                      {deal.stage || deal.currentStage}
                    </div>
                    <h4
                      style={{
                        fontSize: "16px",
                        fontWeight: "700",
                        color: "#1e293b",
                        margin: "0 0 12px 0",
                      }}
                    >
                      {deal.propertyTitle || "Property"}
                    </h4>
                    {deal.propertyCity && (
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          margin: "4px 0",
                        }}
                      >
                        📍 {deal.propertyCity}
                      </p>
                    )}
                    {deal.propertyPrice && (
                      <p
                        style={{
                          color: "#667eea",
                          fontWeight: "700",
                          margin: "8px 0",
                        }}
                      >
                        💵 ₹{formatPrice(deal.propertyPrice)}
                      </p>
                    )}
                    {deal.agreedPrice && (
                      <p
                        style={{
                          color: "#10b981",
                          fontWeight: "700",
                          margin: "4px 0",
                        }}
                      >
                        ✅ Agreed: ₹{formatPrice(deal.agreedPrice)}
                      </p>
                    )}
                    <div
                      style={{
                        borderTop: "1px solid #e2e8f0",
                        margin: "12px 0",
                        paddingTop: "12px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          margin: "4px 0",
                        }}
                      >
                        👤 Buyer: {deal.buyerName || "N/A"}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          margin: "4px 0",
                        }}
                      >
                        🏠 Seller: {deal.sellerName || "N/A"}
                      </p>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          margin: "4px 0",
                        }}
                      >
                        📊 Agent: {deal.agentName || "N/A"}
                      </p>
                    </div>
                    <p
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        margin: "12px 0 0 0",
                      }}
                    >
                      {new Date(deal.createdAt).toLocaleDateString()}
                    </p>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeal(deal);
                      }}
                      style={{
                        width: "100%",
                        marginTop: "12px",
                        padding: "10px 16px",
                        backgroundColor: "#10b981",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#059669")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "#10b981")
                      }
                    >
                      📋 View Deal Details
                    </button>
                  </div>
                );
              })}
            </div>
          ) : activeTab === "property-deals" &&
            myDealsProperties.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔭</div>
              <h3 style={styles.emptyTitle}>No Deals on Your Properties</h3>
              <p style={styles.emptyText}>
                No one has shown interest in your properties yet.
              </p>
            </div>
          ) : (
            <PropertyList
              properties={displayedProperties}
              loading={searchLoading}
              onPropertyUpdated={handlePropertyUpdated}
              onPropertyDeleted={handlePropertyDeleted}
            />
          )}
        </section>

        <section style={styles.statsSection}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🏠</div>
              <div style={styles.statNumber}>10,000+</div>
              <div style={styles.statLabel}>Properties Listed</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>👥</div>
              <div style={styles.statNumber}>50,000+</div>
              <div style={styles.statLabel}>Happy Customers</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>🏙️</div>
              <div style={styles.statNumber}>25+</div>
              <div style={styles.statLabel}>Areas Covered</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statIcon}>⭐</div>
              <div style={styles.statNumber}>4.8/5</div>
              <div style={styles.statLabel}>Customer Rating</div>
            </div>
          </div>
        </section>
      </div>

      {showBrowseDeals && (
        <BrowsePropertiesForDeal
          onClose={() => setShowBrowseDeals(false)}
          onDealCreated={() => {
            setShowBrowseDeals(false);
            fetchProperties();
            fetchMyDeals();
            fetchMyDealsProperties();
            setActiveTab("my-deals");
          }}
        />
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {
            setSelectedDeal(null);
            fetchMyDeals();
          }}
          userRole={user?.role}
          showOnlyOverview={user?.role === "BUYER" || user?.role === "SELLER"}
        />
      )}
    </>
  );
}

export default HomePage;
