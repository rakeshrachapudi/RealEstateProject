import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import BrowsePropertiesForDeal from "../pages/BrowsePropertiesForDeal.jsx";
import DealDetailModal from "../DealDetailModal.jsx";
import { BACKEND_BASE_URL } from "../config/config";

const AgentDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [deals, setDeals] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [filterTab, setFilterTab] = useState("active"); // 'active', 'completed', 'properties', 'total'

  useEffect(() => {
    if (
      !isAuthenticated ||
      !user ||
      (user.role !== "AGENT" && user.role !== "ADMIN")
    ) {
      console.log("❌ Access Denied: Not an agent or admin");
      navigate("/");
      return;
    }
    console.log("✅ Agent Dashboard: User authenticated and authorized");
    console.log("User Role:", user.role);
    fetchAgentData();
  }, [user, isAuthenticated, navigate]);

  const fetchAgentData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("authToken");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      console.log("📥 Fetching agent data for user:", user.id);

      // Fetch deals
      const dealsRes = await fetch(
        `${BACKEND_BASE_URL}/api/deals/agent/${user.id}`,
        { headers }
      );

      if (dealsRes.ok) {
        const responseData = await dealsRes.json();
        console.log("✅ Full deals response:", responseData);

        let dealsList = [];
        if (Array.isArray(responseData)) {
          dealsList = responseData;
        } else if (responseData.success && Array.isArray(responseData.data)) {
          dealsList = responseData.data;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          dealsList = responseData.data;
        }

        console.log("✅ Deals loaded:", dealsList.length);
        setDeals(dealsList);
      } else {
        console.error("❌ Deals response not ok:", dealsRes.status);
        setError("Failed to load deals");
        setDeals([]);
      }

      // Fetch properties
      const propsRes = await fetch(
        `${BACKEND_BASE_URL}/api/agents/${user.id}/all-properties`,
        { headers }
      ).catch(() => ({ ok: false }));

      if (propsRes.ok) {
        const data = await propsRes.json();
        console.log("✅ Properties loaded:", data);
        setProperties(
          data.success ? data.data : Array.isArray(data) ? data : []
        );
      } else {
        console.log("⚠️ Properties endpoint failed");
        setProperties([]);
      }

      // Fetch stats
      const statsRes = await fetch(
        `${BACKEND_BASE_URL}/api/agents/${user.id}/stats`,
        { headers }
      ).catch(() => ({ ok: false }));

      if (statsRes.ok) {
        const data = await statsRes.json();
        console.log("✅ Stats loaded:", data);
        setStats(data.success ? data.data : {});
      } else {
        console.log("⚠️ Stats endpoint failed");
        setStats({});
      }
    } catch (err) {
      console.error("❌ Error fetching agent data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDealClick = () => {
    console.log("➕ Opening create deal modal");
    setShowCreateDeal(true);
  };

  // Calculate counts
  const activeDealCount = deals.filter((d) => d.stage !== "COMPLETED").length;
  const completedDealCount = deals.filter(
    (d) => d.stage === "COMPLETED"
  ).length;

  // Filter deals based on active tab
  const displayedDeals =
    filterTab === "active"
      ? deals.filter((d) => d.stage !== "COMPLETED")
      : filterTab === "completed"
      ? deals.filter((d) => d.stage === "COMPLETED")
      : filterTab === "total"
      ? deals
      : [];

  // Get section title
  const getSectionTitle = () => {
    switch (filterTab) {
      case "active":
        return `📈 Active Deals (${activeDealCount})`;
      case "completed":
        return `✅ Completed Deals (${completedDealCount})`;
      case "properties":
        return `🏠 Properties Managed (${properties.length})`;
      case "total":
        return `📊 Total Deals (${deals.length})`;
      default:
        return "Deals";
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <h2>Please log in</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <h3>Loading dashboard...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Agent Dashboard</h1>
        <p style={styles.subtitle}>Manage your deals and properties</p>
      </div>

      {error && <div style={styles.error}>❌ {error}</div>}

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard} onClick={() => setFilterTab("active")}>
          <div style={styles.statIcon}>📈</div>
          <div style={styles.statLabel}>Active Deals</div>
          <div style={styles.statValue}>{activeDealCount}</div>
        </div>
        <div style={styles.statCard} onClick={() => setFilterTab("completed")}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statLabel}>Completed Deals</div>
          <div style={styles.statValue}>{completedDealCount}</div>
        </div>
        <div style={styles.statCard} onClick={() => setFilterTab("properties")}>
          <div style={styles.statIcon}>🏠</div>
          <div style={styles.statLabel}>Properties Managed</div>
          <div style={styles.statValue}>{properties.length}</div>
        </div>
        <div style={styles.statCard} onClick={() => setFilterTab("total")}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statLabel}>Total Deals</div>
          <div style={styles.statValue}>{deals.length}</div>
        </div>
      </div>

      {/* Create Deal Section */}
      <div style={styles.createDealSection}>
        <div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1e40af",
              marginBottom: "4px",
            }}
          >
            ➕ Create New Deal
          </div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>
            Create a deal for a buyer interested in a property
          </div>
        </div>
        <button onClick={handleCreateDealClick} style={styles.newDealBtn}>
          + New Deal
        </button>
      </div>

      {/* Deals Section with Tabs */}
      <div style={styles.section}>
        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          <button
            onClick={() => setFilterTab("active")}
            style={{
              ...styles.tab,
              ...(filterTab === "active" ? styles.activeTab : {}),
            }}
          >
            📈 Active Deals ({activeDealCount})
          </button>
          <button
            onClick={() => setFilterTab("completed")}
            style={{
              ...styles.tab,
              ...(filterTab === "completed" ? styles.activeTab : {}),
            }}
          >
            ✅ Completed Deals ({completedDealCount})
          </button>
          <button
            onClick={() => setFilterTab("properties")}
            style={{
              ...styles.tab,
              ...(filterTab === "properties" ? styles.activeTab : {}),
            }}
          >
            🏠 Managed Properties ({properties.length})
          </button>
          <button
            onClick={() => setFilterTab("total")}
            style={{
              ...styles.tab,
              ...(filterTab === "total" ? styles.activeTab : {}),
            }}
          >
            📊 Total Deals ({deals.length})
          </button>
        </div>

        <h2 style={styles.sectionTitle}>{getSectionTitle()}</h2>

        {/* Active, Completed, or Total Deals View */}
        {filterTab !== "properties" ? (
          displayedDeals.length > 0 ? (
            <div style={styles.dealsGrid}>
              {displayedDeals.map((deal) => (
                <div key={deal.id || deal.dealId} style={styles.dealCard}>
                  {/* Stage Badge */}
                  <div
                    style={{
                      ...styles.stageBadge,
                      backgroundColor: getStageColor(deal.stage),
                    }}
                  >
                    {deal.stage}
                  </div>

                  {/* Deal Info */}
                  <h3 style={styles.dealTitle}>
                    {deal.property?.title || "Property"}
                  </h3>

                  <div style={styles.dealMeta}>
                    <p style={styles.metaItem}>
                      📍 {deal.property?.city || "Location"}
                    </p>
                    <p style={styles.metaItem}>
                      👤 Buyer: {deal.buyer?.firstName || "N/A"}{" "}
                      {deal.buyer?.lastName || ""}
                    </p>
                    {deal.agreedPrice && (
                      <p style={styles.metaItem}>
                        💰 ₹{deal.agreedPrice.toLocaleString("en-IN")}
                      </p>
                    )}
                    <p style={styles.metaItem}>
                      📅 {new Date(deal.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${getProgressPercentage(deal.stage)}%`,
                        backgroundColor: getStageColor(deal.stage),
                      }}
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedDeal(deal)}
                    style={styles.viewDealBtn}
                  >
                    📋 View & Manage Deal
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p>
                {filterTab === "active"
                  ? "📭 No active deals yet. Create one to get started!"
                  : filterTab === "completed"
                  ? "📭 No completed deals yet."
                  : "📭 No deals found."}
              </p>
            </div>
          )
        ) : /* Properties View */
        properties.length > 0 ? (
          <div style={styles.dealsGrid}>
            {properties.map((prop) => (
              <div key={prop.id || prop.propertyId} style={styles.propertyCard}>
                <img
                  src={
                    prop.imageUrl ||
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop"
                  }
                  alt={prop.title}
                  style={{ ...styles.propertyImage, cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/property/${prop.id || prop.propertyId}`)
                  }
                />
                <h3
                  style={{
                    ...styles.dealTitle,
                    padding: "12px 16px 0 16px",
                    marginBottom: "12px",
                  }}
                >
                  {prop.title}
                </h3>
                <div style={{ ...styles.dealMeta, padding: "0 16px" }}>
                  <p style={styles.metaItem}>
                    💰 ₹{(prop.price || 0).toLocaleString("en-IN")}
                  </p>
                  <p style={styles.metaItem}>
                    🛏️ {prop.bedrooms} Bed | 🚿 {prop.bathrooms} Bath
                  </p>
                  <p style={styles.metaItem}>
                    📐 {prop.areaSqft || "N/A"} sqft
                  </p>
                  <p style={styles.metaItem}>📍 {prop.areaName || prop.city}</p>
                </div>
                {prop.isFeatured && (
                  <div
                    style={{
                      ...styles.stageBadge,
                      backgroundColor: "#f59e0b",
                      marginTop: "12px",
                      marginLeft: "16px",
                    }}
                  >
                    ⭐ Featured
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p>📭 No properties managed yet.</p>
          </div>
        )}
      </div>

      {/* Create Deal Modal */}
      {showCreateDeal && (
        <BrowsePropertiesForDeal
          onClose={() => {
            console.log("Closing modal");
            setShowCreateDeal(false);
          }}
          onDealCreated={() => {
            console.log("Deal created");
            setShowCreateDeal(false);
            fetchAgentData();
          }}
        />
      )}

      {/* View Deal Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {
            setSelectedDeal(null);
            fetchAgentData();
          }}
          userRole={user.role}
        />
      )}
    </div>
  );
};

// Helper functions
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

const getProgressPercentage = (stage) => {
  const stages = [
    "INQUIRY",
    "SHORTLIST",
    "NEGOTIATION",
    "AGREEMENT",
    "REGISTRATION",
    "PAYMENT",
    "COMPLETED",
  ];
  const index = stages.indexOf(stage);
  return ((index + 1) / stages.length) * 100;
};

const styles = {
  container: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "24px 32px",
    minHeight: "80vh",
    backgroundColor: "#f9fafb",
  },
  header: {
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "2px solid #e5e7eb",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0,
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    fontWeight: "500",
    margin: 0,
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "24px",
    border: "1px solid #fca5a5",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  },
  statCard: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    textAlign: "center",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  statIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  statLabel: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "8px",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
  },
  createDealSection: {
    padding: "16px",
    backgroundColor: "#f0f9ff",
    borderRadius: "12px",
    border: "1px solid #bfdbfe",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newDealBtn: {
    padding: "10px 20px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
    marginLeft: "12px",
    transition: "background 0.2s, transform 0.2s",
    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
  },
  section: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    marginBottom: "32px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  tabContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    paddingBottom: "12px",
    borderBottom: "2px solid #e5e7eb",
  },
  tab: {
    padding: "12px 20px",
    background: "#f8fafc",
    color: "#64748b",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  activeTab: {
    backgroundColor: "#3b82f6",
    color: "white",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 16px 0",
    paddingBottom: "12px",
    borderBottom: "2px solid #e5e7eb",
  },
  dealsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px",
  },
  dealCard: {
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    transition: "all 0.2s",
  },
  stageBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "12px",
  },
  dealTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 12px 0",
  },
  dealMeta: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "12px",
  },
  metaItem: {
    margin: "4px 0",
    lineHeight: "1.4",
  },
  progressBar: {
    width: "100%",
    height: "6px",
    backgroundColor: "#e2e8f0",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "12px",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s",
  },
  viewDealBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "background 0.2s",
  },
  loading: {
    textAlign: "center",
    padding: "80px 20px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#64748b",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    border: "1px dashed #e2e8f0",
  },
  propertyCard: {
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    transition: "all 0.2s",
    padding: "0 0 16px 0",
  },
  propertyImage: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
};

export default AgentDashboard;
