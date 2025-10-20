// src/pages/SellerDealsPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import DealDetailModal from "../DealDetailModal";
import { styles } from "../styles";
import { BACKEND_BASE_URL } from "../config/config";

const SellerDealsPage = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeFilter, setActiveFilter] = useState("active");

  useEffect(() => {
    if (user?.id) {
      fetchSellerDeals();
    }
  }, [user]);

  const fetchSellerDeals = async () => {
    setLoading(true);
    try {
      // Fetch all deals where property.user.id === current user
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/my-deals?userRole=SELLER`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        console.log("✅ Seller deals loaded:", data.data);
        setDeals(data.data || []);
      } else {
        console.log("❌ Failed to load seller deals");
        setDeals([]);
      }
    } catch (error) {
      console.error("Error fetching seller deals:", error);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDeals = () => {
    if (activeFilter === "active") {
      return deals.filter((d) => (d.stage || d.currentStage) !== "COMPLETED");
    } else if (activeFilter === "completed") {
      return deals.filter((d) => (d.stage || d.currentStage) === "COMPLETED");
    }
    return deals;
  };

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
    if (typeof price === "number") {
      return price.toLocaleString("en-IN");
    }
    return String(price);
  };

  const filteredDeals = getFilteredDeals();
  const activeDealCount = deals.filter(
    (d) => (d.stage || d.currentStage) !== "COMPLETED"
  ).length;
  const completedDealCount = deals.filter(
    (d) => (d.stage || d.currentStage) === "COMPLETED"
  ).length;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}>⏳</div>
          <h3>Loading deals on your properties...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>🏠 Deals on My Properties</h1>
        <p style={styles.pageSubtitle}>
          Monitor all buyer inquiries and deals for your listed properties
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={containerStyles.filterTabsStyle}>
        <button
          onClick={() => setActiveFilter("active")}
          style={{
            ...containerStyles.tabStyle,
            ...(activeFilter === "active"
              ? containerStyles.activeTabStyle
              : {}),
          }}
        >
          📈 Active ({activeDealCount})
        </button>
        <button
          onClick={() => setActiveFilter("completed")}
          style={{
            ...containerStyles.tabStyle,
            ...(activeFilter === "completed"
              ? containerStyles.activeTabStyle
              : {}),
          }}
        >
          ✅ Completed ({completedDealCount})
        </button>
        <button
          onClick={() => setActiveFilter("all")}
          style={{
            ...containerStyles.tabStyle,
            ...(activeFilter === "all" ? containerStyles.activeTabStyle : {}),
          }}
        >
          📊 All ({deals.length})
        </button>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div style={containerStyles.emptyStateStyle}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔭</div>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1e293b",
              margin: "0 0 8px 0",
            }}
          >
            No Deals Yet
          </h3>
          <p style={{ color: "#64748b", margin: 0 }}>
            {activeFilter === "active" && "No active deals on your properties"}
            {activeFilter === "completed" && "No completed deals yet"}
            {activeFilter === "all" &&
              "No deals have been created for your properties"}
          </p>
        </div>
      ) : (
        <div style={containerStyles.gridStyle}>
          {filteredDeals.map((deal) => (
            <div
              key={deal.id || deal.dealId}
              style={containerStyles.cardStyle}
              onClick={() => setSelectedDeal(deal)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
            >
              {/* Stage Badge */}
              <div
                style={{
                  ...containerStyles.stageBadgeStyle,
                  backgroundColor: getStageColor(
                    deal.stage || deal.currentStage
                  ),
                }}
              >
                {deal.stage || deal.currentStage}
              </div>

              {/* Property Title */}
              <h3 style={containerStyles.cardTitleStyle}>
                {deal.propertyTitle || deal.property?.title || "Property"}
              </h3>

              {/* Agreed Price - Prominent Display */}
              {deal.agreedPrice && (
                <div style={containerStyles.priceDisplayStyle}>
                  💰 ₹{formatPrice(deal.agreedPrice)}
                </div>
              )}

              {/* Buyer Details */}
              {deal.buyer && (
                <div style={containerStyles.personDetailStyle}>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>
                    👤 Buyer
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    {deal.buyerName ||
                      `${deal.buyer?.firstName} ${deal.buyer?.lastName}`}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    📞 {deal.buyerMobile || deal.buyer?.mobileNumber || "N/A"}
                  </div>
                </div>
              )}

              {/* Seller Details */}
              {deal.property?.user && (
                <div style={containerStyles.personDetailStyle}>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>
                    🏠 Seller (You)
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    {deal.sellerName ||
                      `${deal.property.user?.firstName} ${deal.property.user?.lastName}`}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    📞{" "}
                    {deal.sellerMobile ||
                      deal.property.user?.mobileNumber ||
                      "N/A"}
                  </div>
                </div>
              )}

              {/* Agent Details */}
              {deal.agent && (
                <div style={containerStyles.personDetailStyle}>
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>
                    📊 Agent
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#1e293b",
                    }}
                  >
                    {deal.agentName ||
                      `${deal.agent?.firstName} ${deal.agent?.lastName}`}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    📧 {deal.agentEmail || deal.agent?.email || "N/A"}
                  </div>
                </div>
              )}

              {/* Date */}
              <div style={containerStyles.dateStyle}>
                Created: {new Date(deal.createdAt).toLocaleDateString()}
              </div>

              {/* View Button */}
              <button
                style={containerStyles.viewBtnStyle}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#059669")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#10b981")
                }
              >
                📋 View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {
            setSelectedDeal(null);
            fetchSellerDeals();
          }}
          userRole="SELLER"
        />
      )}
    </div>
  );
};

const containerStyles = {
  filterTabsStyle: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "12px",
    flexWrap: "wrap",
  },
  tabStyle: {
    padding: "10px 20px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    color: "#64748b",
    transition: "all 0.2s",
  },
  activeTabStyle: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
  },
  gridStyle: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
  },
  cardStyle: {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  stageBadgeStyle: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "12px",
  },
  cardTitleStyle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 12px 0",
  },
  priceDisplayStyle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#10b981",
    backgroundColor: "#ecfdf5",
    padding: "10px 12px",
    borderRadius: "6px",
    marginBottom: "12px",
    border: "1px solid #86efac",
  },
  personDetailStyle: {
    padding: "10px 12px",
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
    marginBottom: "10px",
    fontSize: "13px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    borderLeft: "3px solid #3b82f6",
  },
  dateStyle: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "16px",
  },
  viewBtnStyle: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "background 0.2s",
  },
  emptyStateStyle: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "2px dashed #e2e8f0",
  },
};

export default SellerDealsPage;
