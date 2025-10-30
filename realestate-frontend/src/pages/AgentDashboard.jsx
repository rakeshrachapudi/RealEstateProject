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
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [filterTab, setFilterTab] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");

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

  // ✅ ADDED: Filter deals based on search and tab
  useEffect(() => {
    let tabFiltered = [];

    switch (filterTab) {
      case "active":
        tabFiltered = deals.filter((d) => d.stage !== "COMPLETED");
        break;
      case "completed":
        tabFiltered = deals.filter((d) => d.stage === "COMPLETED");
        break;
      case "total":
        tabFiltered = deals;
        break;
      default:
        tabFiltered = deals;
    }

    if (!searchTerm.trim()) {
      setFilteredDeals(tabFiltered);
    } else {
      const term = searchTerm.toLowerCase();
      const searched = tabFiltered.filter((deal) => {
        const dealId = ((deal.dealId || deal.id) || '').toString();
        const propertyTitle = (deal.property?.title || '').toLowerCase();
        const buyerName = `${deal.buyer?.firstName || ''} ${deal.buyer?.lastName || ''}`.toLowerCase();
        const stage = (deal.stage || deal.currentStage || '').toLowerCase();

        return (
          dealId.includes(term) ||
          propertyTitle.includes(term) ||
          buyerName.includes(term) ||
          stage.includes(term)
        );
      });
      setFilteredDeals(searched);
    }
  }, [searchTerm, filterTab, deals]);

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

  const handleCreateAgreementClick = () => {
    console.log("📝 Navigating to create sale agreement page");
    navigate("/sale-agreement");
  };

  // Calculate counts
  const activeDealCount = deals.filter((d) => d.stage !== "COMPLETED").length;
  const completedDealCount = deals.filter(
    (d) => d.stage === "COMPLETED"
  ).length;

  // Get section title
  const getSectionTitle = () => {
    const count = filteredDeals.length;
    const totalCount = filterTab === "active" ? activeDealCount :
                       filterTab === "completed" ? completedDealCount :
                       filterTab === "properties" ? properties.length :
                       deals.length;

    const searchSuffix = searchTerm ? ` (${count} of ${totalCount})` : ` (${count})`;

    switch (filterTab) {
      case "active":
        return `📈 Active Deals${searchSuffix}`;
      case "completed":
        return `✅ Completed Deals${searchSuffix}`;
      case "properties":
        return `🏠 Properties Managed (${properties.length})`;
      case "total":
        return `📊 Total Deals${searchSuffix}`;
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

      {/* Action Section Grid */}
      <div style={styles.actionSectionGrid}>
        <div style={{...styles.actionCard, borderColor: '#bfdbfe'}}>
          <div>
            <div style={styles.actionTitlePrimary}>
              ➕ Create New Deal
            </div>
            <div style={styles.actionSubtitle}>
              Start a new sales process by linking a buyer to a property.
            </div>
          </div>
          <button onClick={handleCreateDealClick} style={styles.newDealBtn}>
            + New Deal
          </button>
        </div>

        <div style={{...styles.actionCard, borderColor: '#fbcfe8'}}>
          <div>
            <div style={styles.actionTitleSecondary}>
              📝 Create Sale Agreement
            </div>
            <div style={styles.actionSubtitle}>
              Draft the formal legal agreement for a property sale.
            </div>
          </div>
          <button onClick={handleCreateAgreementClick} style={styles.createAgreementBtn}>
            Sale Agreement
          </button>
        </div>
      </div>

      {/* Deals Section with Tabs */}
      <div style={styles.section}>
        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          <button
            onClick={() => { setFilterTab("active"); setSearchTerm(""); }}
            style={{
              ...styles.tab,
              ...(filterTab === "active" ? styles.activeTab : {}),
            }}
          >
            📈 Active Deals ({activeDealCount})
          </button>
          <button
            onClick={() => { setFilterTab("completed"); setSearchTerm(""); }}
            style={{
              ...styles.tab,
              ...(filterTab === "completed" ? styles.activeTab : {}),
            }}
          >
            ✅ Completed Deals ({completedDealCount})
          </button>
          <button
            onClick={() => { setFilterTab("properties"); setSearchTerm(""); }}
            style={{
              ...styles.tab,
              ...(filterTab === "properties" ? styles.activeTab : {}),
            }}
          >
            🏠 Managed Properties ({properties.length})
          </button>
          <button
            onClick={() => { setFilterTab("total"); setSearchTerm(""); }}
            style={{
              ...styles.tab,
              ...(filterTab === "total" ? styles.activeTab : {}),
            }}
          >
            📊 Total Deals ({deals.length})
          </button>
        </div>

        {/* ✅ ADDED: Search Box for Deals */}
        {filterTab !== "properties" && deals.length > 0 && (
          <div style={styles.searchBox}>
            <input
              type="text"
              placeholder="🔍 Search by Deal ID, Property, Buyer, or Stage..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        )}

        <h2 style={styles.sectionTitle}>{getSectionTitle()}</h2>

        {filterTab === "properties" ? (
          properties.length > 0 ? (
            <div style={styles.dealsGrid}>
              {properties.map((property) => (
                <div key={property.id} style={styles.propertyCard}>
                  {property.imageUrl && (
                    <img
                      src={property.imageUrl}
                      alt={property.title}
                      style={styles.propertyImage}
                    />
                  )}
                  <div style={{ padding: "16px" }}>
                    <h3 style={styles.dealTitle}>{property.title}</h3>
                    <div style={styles.dealMeta}>
                      <div style={styles.metaItem}>📍 {property.city}</div>
                      <div style={styles.metaItem}>
                        💰 ₹{property.price?.toLocaleString("en-IN")}
                      </div>
                      <div style={styles.metaItem}>🛏️ {property.bedrooms} BHK</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🏠</div>
              <p>No properties managed yet</p>
            </div>
          )
        ) : filteredDeals.length > 0 ? (
          <div style={styles.dealsGrid}>
            {filteredDeals.map((deal) => (
              <div key={deal.id} style={styles.dealCard}>
                {/* ✅ ADDED: Deal ID Badge */}
                <div style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  backgroundColor: "#1e293b",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "10px",
                  fontWeight: "700",
                  zIndex: 1,
                }}>
                  ID: {deal.dealId || deal.id}
                </div>

                <span
                  style={{
                    ...styles.stageBadge,
                    backgroundColor: getStageColor(deal.stage || deal.currentStage),
                  }}
                >
                  {deal.stage || deal.currentStage}
                </span>

                <h3 style={styles.dealTitle}>
                  {deal.property?.title || "Property"}
                </h3>

                <div style={styles.dealMeta}>
                  <div style={styles.metaItem}>
                    👤 {deal.buyer?.firstName} {deal.buyer?.lastName}
                  </div>
                  <div style={styles.metaItem}>
                    💰 ₹{deal.agreedPrice?.toLocaleString("en-IN") || "N/A"}
                  </div>
                  <div style={styles.metaItem}>
                    📍 {deal.property?.city || "Location"}
                  </div>
                </div>

                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${getProgressPercentage(deal.stage || deal.currentStage)}%`,
                      backgroundColor: getStageColor(deal.stage || deal.currentStage),
                    }}
                  ></div>
                </div>

                <button
                  onClick={() => setSelectedDeal(deal)}
                  style={styles.viewDealBtn}
                  onMouseEnter={(e) => e.target.style.backgroundColor = "#059669"}
                  onMouseLeave={(e) => e.target.style.backgroundColor = "#10b981"}
                >
                  👁️ View Deal Details
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
            <p>{searchTerm ? "No deals match your search" : "No deals found"}</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                style={{
                  marginTop: "12px",
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Deal Modal */}
      {showCreateDeal && (
        <BrowsePropertiesForDeal
          agentId={user.id}
          onClose={() => setShowCreateDeal(false)}
          onDealCreated={fetchAgentData}
        />
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={fetchAgentData}
          userRole={user.role}
        />
      )}
    </div>
  );
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
    maxWidth: 1700,
    margin: "0 auto",
    padding: "24px 32px",
    minHeight: "80vh",
    backgroundColor: "#f9fafb",
    marginTop: "10px",
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
  actionSectionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  actionCard: {
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "2px solid",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "all 0.2s",
  },
  actionTitlePrimary: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e40af",
    marginBottom: "4px",
  },
  actionTitleSecondary: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#be185d",
    marginBottom: "4px",
  },
  actionSubtitle: {
    fontSize: "12px",
    color: "#64748b"
  },
  createAgreementBtn: {
    padding: "10px 20px",
    backgroundColor: "#ec4899",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap",
    marginLeft: "12px",
    transition: "background 0.2s",
    boxShadow: "0 2px 8px rgba(236, 72, 153, 0.3)",
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
  // ✅ ADDED: Search box styles
  searchBox: {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  searchInput: {
    width: "100%",
    padding: "10px 16px",
    fontSize: "14px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
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
    position: "relative", // ✅ ADDED for positioning badge
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