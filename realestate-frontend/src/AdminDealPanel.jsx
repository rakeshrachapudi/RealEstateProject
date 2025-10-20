import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import DealDetailModal from "./DealDetailModal";
import { BACKEND_BASE_URL } from "./config/config";

const AdminDealPanel = () => {
  const { user } = useAuth();
  const [dealsByAgent, setDealsByAgent] = useState({});
  const [allDeals, setAllDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchDeals();
    }
  }, [user?.id]);

  const fetchDeals = async () => {
    try {
      setError(null);
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      };

      console.log("🔍 Fetching admin deals for user:", user?.id);

      const allDealsFlat = [];
      const agentDealsMap = {};

      // ✅ Fetch admin dashboard to get all agents
      console.log("📊 Fetching admin dashboard data...");
      const adminRes = await fetch(
        `${BACKEND_BASE_URL}/api/deals/admin/dashboard?userId=${user.id}`,
        { headers }
      );

      if (adminRes.ok) {
        const adminData = await adminRes.json();
        console.log("✅ Admin dashboard response:", adminData);

        if (adminData.success && adminData.data?.agentPerformance) {
          console.log(`Found ${adminData.data.agentPerformance.length} agents`);

          // Fetch deals for each agent
          for (const agentPerf of adminData.data.agentPerformance) {
            console.log(
              `📥 Fetching deals for agent: ${agentPerf.agentName} (ID: ${agentPerf.agentId})`
            );

            const agentDealsRes = await fetch(
              `${BACKEND_BASE_URL}/api/deals/admin/agent/${agentPerf.agentId}?userId=${user.id}`,
              { headers }
            );

            if (agentDealsRes.ok) {
              const agentDealsData = await agentDealsRes.json();
              console.log(
                `Response for ${agentPerf.agentName}:`,
                agentDealsData
              );

              let deals = [];
              if (Array.isArray(agentDealsData)) {
                deals = agentDealsData;
              } else if (
                agentDealsData.data &&
                Array.isArray(agentDealsData.data)
              ) {
                deals = agentDealsData.data;
              } else if (
                agentDealsData.success &&
                Array.isArray(agentDealsData.data)
              ) {
                deals = agentDealsData.data;
              }

              console.log(
                `✅ Got ${deals.length} deals for agent ${agentPerf.agentName}`
              );

              if (deals.length > 0) {
                const agentKey = `${agentPerf.agentId}-${agentPerf.agentName}`;
                agentDealsMap[agentKey] = {
                  agentId: agentPerf.agentId,
                  agentName: agentPerf.agentName,
                  agentEmail: agentPerf.agentEmail,
                  agentMobile: agentPerf.agentMobile,
                  totalDeals: agentPerf.totalDeals,
                  completedDeals: agentPerf.completedDeals,
                  deals: deals,
                };
                allDealsFlat.push(...deals);
              }
            } else {
              console.warn(
                `⚠️ Failed to fetch deals for agent ${agentPerf.agentName}`
              );
            }
          }
        }
      } else {
        console.error("❌ Failed to fetch admin dashboard:", adminRes.status);
        setError(`Failed to load admin dashboard (${adminRes.status})`);
      }

      console.log(`✅ Total deals loaded: ${allDealsFlat.length}`);
      console.log("Deals by agent:", agentDealsMap);

      setAllDeals(allDealsFlat);
      setDealsByAgent(agentDealsMap);
    } catch (error) {
      console.error("❌ Error fetching deals:", error);
      setError(`Error loading deals: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDealsByAgent = () => {
    const filtered = {};
    Object.keys(dealsByAgent).forEach((agentKey) => {
      const agentData = dealsByAgent[agentKey];
      let deals = agentData.deals;

      if (activeTab !== "all") {
        deals = deals.filter((d) => d.stage === activeTab);
      }

      if (deals.length > 0) {
        filtered[agentKey] = {
          ...agentData,
          deals: deals,
        };
      }
    });
    return filtered;
  };

  const containerStyle = {
    maxWidth: "1600px",
    margin: "0 auto",
    padding: "24px",
  };

  const titleStyle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  };

  const subtitleStyle = {
    fontSize: "16px",
    color: "#64748b",
    marginBottom: "24px",
  };

  const tabsStyle = {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "12px",
    overflowX: "auto",
  };

  const tabStyle = (isActive) => ({
    padding: "10px 20px",
    backgroundColor: isActive ? "#3b82f6" : "#f8fafc",
    color: isActive ? "white" : "#64748b",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    whiteSpace: "nowrap",
  });

  const agentSectionStyle = {
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    border: "2px solid #e2e8f0",
  };

  const agentHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "2px solid #e2e8f0",
  };

  const agentNameStyle = {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 12px 0",
  };

  const agentMetaStyle = {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    fontSize: "13px",
    color: "#64748b",
  };

  const agentStatsStyle = {
    display: "flex",
    gap: "12px",
  };

  const statBoxStyle = {
    backgroundColor: "white",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  };

  const statLabelStyle = {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600",
    marginBottom: "4px",
  };

  const statValueStyle = {
    fontSize: "18px",
    fontWeight: "700",
    color: "#3b82f6",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px",
  };

  const cardStyle = {
    padding: "16px",
    backgroundColor: "#f3f4f6",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 12px rgba(59, 130, 246, 0.1)",
    background: "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
  };

  const stageBadgeStyle = {
    display: "inline-block",
    padding: "4px 8px",
    backgroundColor: "#f59e0b",
    color: "white",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
    marginBottom: "8px",
    boxShadow: "0 2px 4px rgba(245, 158, 11, 0.3)",
  };

  const titleSmallStyle = {
    margin: "0 0 12px 0",
    color: "#1e293b",
    fontWeight: "600",
    fontSize: "14px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "8px 12px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <h2>⏳ Loading deals...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={containerStyle}>
        <h2>❌ Please log in to view deals</h2>
      </div>
    );
  }

  const stages = [
    "INQUIRY",
    "SHORTLIST",
    "NEGOTIATION",
    "AGREEMENT",
    "REGISTRATION",
    "PAYMENT",
  ];
  const stageCounts = {};
  stages.forEach((stage) => {
    stageCounts[stage] = allDeals.filter((d) => d.stage === stage).length;
  });

  const filteredDealsByAgent = getFilteredDealsByAgent();
  const totalAgents = Object.keys(dealsByAgent).length;

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>⚙️ Admin Dashboard - Deal Management</h1>
      <p style={subtitleStyle}>
        {totalAgents} Agent{totalAgents !== 1 ? "s" : ""} • {allDeals.length}{" "}
        Total Deals
      </p>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#fee2e2",
            color: "#dc2626",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "1px solid #fecaca",
          }}
        >
          ❌ {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={tabsStyle}>
        <button
          style={tabStyle(activeTab === "all")}
          onClick={() => setActiveTab("all")}
        >
          All Deals ({allDeals.length})
        </button>
        {stages.map((stage) => (
          <button
            key={stage}
            style={tabStyle(activeTab === stage)}
            onClick={() => setActiveTab(stage)}
          >
            {stage} ({stageCounts[stage]})
          </button>
        ))}
      </div>

      {/* Deals grouped by agent */}
      {Object.keys(filteredDealsByAgent).length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#64748b",
            backgroundColor: "#f8fafc",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🔍</div>
          <p style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
            No deals found
          </p>
        </div>
      ) : (
        <div>
          {Object.entries(filteredDealsByAgent).map(([agentKey, agentData]) => (
            <div key={agentKey} style={agentSectionStyle}>
              {/* Agent Header */}
              <div style={agentHeaderStyle}>
                <div>
                  <h2 style={agentNameStyle}>📊 {agentData.agentName}</h2>
                  <div style={agentMetaStyle}>
                    <span>
                      <strong>🆔 ID:</strong> {agentData.agentId}
                    </span>
                    <span>
                      <strong>📧 Email:</strong> {agentData.agentEmail || "N/A"}
                    </span>
                    <span>
                      <strong>📞 Phone:</strong>{" "}
                      {agentData.agentMobile || "N/A"}
                    </span>
                  </div>
                </div>
                <div style={agentStatsStyle}>
                  <div style={statBoxStyle}>
                    <div style={statLabelStyle}>Total Deals</div>
                    <div style={statValueStyle}>{agentData.totalDeals}</div>
                  </div>
                  <div style={statBoxStyle}>
                    <div style={statLabelStyle}>Completed</div>
                    <div style={statValueStyle}>{agentData.completedDeals}</div>
                  </div>
                  <div style={statBoxStyle}>
                    <div style={statLabelStyle}>Filtered</div>
                    <div style={statValueStyle}>{agentData.deals.length}</div>
                  </div>
                </div>
              </div>

              {/* Agent's Deals Grid */}
              <div style={gridStyle}>
                {agentData.deals.map((deal) => {
                  const buyer = deal.buyer;
                  const seller = deal.property?.user;

                  return (
                    <div
                      key={deal.id}
                      style={cardStyle}
                      onClick={() => setSelectedDeal(deal)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 8px 16px rgba(0,0,0,0.15)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.05)";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Stage Badge */}
                      <div style={stageBadgeStyle}>{deal.stage}</div>

                      {/* Property Title */}
                      <h4 style={titleSmallStyle}>
                        🏠 {deal.propertyTitle || deal.property?.title}
                      </h4>

                      {/* Agreed Price */}
                      {deal.agreedPrice && (
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "#dcfce7",
                            borderRadius: "6px",
                            marginBottom: "10px",
                            fontSize: "14px",
                            fontWeight: "700",
                            color: "#065f46",
                          }}
                        >
                          💰 ₹{deal.agreedPrice.toLocaleString("en-IN")}
                        </div>
                      )}

                      {/* Buyer Details */}
                      {buyer && (
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "rgba(255,255,255,0.6)",
                            borderRadius: "6px",
                            marginBottom: "8px",
                            fontSize: "12px",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#1e293b",
                              marginBottom: "2px",
                            }}
                          >
                            👤 Buyer: {buyer?.firstName} {buyer?.lastName}
                          </div>
                          {buyer?.mobileNumber && (
                            <div style={{ color: "#64748b", fontSize: "11px" }}>
                              📞 {buyer.mobileNumber}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Seller Details */}
                      {seller && (
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "rgba(255,255,255,0.6)",
                            borderRadius: "6px",
                            marginBottom: "8px",
                            fontSize: "12px",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: "600",
                              color: "#1e293b",
                              marginBottom: "2px",
                            }}
                          >
                            🏢 Seller: {seller.firstName} {seller.lastName}
                          </div>
                          {seller.mobileNumber && (
                            <div style={{ color: "#64748b", fontSize: "11px" }}>
                              📞 {seller.mobileNumber}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Date */}
                      <p
                        style={{
                          margin: "8px 0 12px 0",
                          fontSize: "11px",
                          color: "#64748b",
                        }}
                      >
                        📅 {new Date(deal.createdAt).toLocaleDateString()}
                      </p>

                      {/* View Button */}
                      <button
                        style={buttonStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDeal(deal);
                        }}
                      >
                        View & Manage Deal
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {
            setSelectedDeal(null);
            fetchDeals();
          }}
          userRole="ADMIN"
        />
      )}
    </div>
  );
};

export default AdminDealPanel;
