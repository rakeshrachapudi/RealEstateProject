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
  const [sortOrder, setSortOrder] = useState("newest");
  const [openAgents, setOpenAgents] = useState({});

  // ✅ NEW: State for dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalDeals: 0,
    inquiryCount: 0,
    shortlistCount: 0,
    negotiationCount: 0,
    agreementCount: 0,
    registrationCount: 0,
    paymentCount: 0,
    completedCount: 0
  });

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

      // ✅ FIXED: Fetch dashboard stats separately
      console.log("📊 Fetching dashboard stats...");
      const dashboardRes = await fetch(
        `${BACKEND_BASE_URL}/api/deals/admin/dashboard`,
        { headers }
      );

      if (dashboardRes.ok) {
        const dashboardData = await dashboardRes.json();
        console.log("✅ Dashboard stats response:", dashboardData);

        if (dashboardData.success && dashboardData.data) {
          setDashboardStats(dashboardData.data);
        }
      }

      // ✅ FIXED: Fetch agents performance separately
      console.log("📊 Fetching agents performance data...");
      const agentsRes = await fetch(
        `${BACKEND_BASE_URL}/api/deals/admin/agents-performance`,
        { headers }
      );

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        console.log("✅ Agents performance response:", agentsData);

        // ✅ Handle the response - it might be wrapped in ApiResponse
        let agentPerformance = [];
        if (Array.isArray(agentsData)) {
          agentPerformance = agentsData;
        } else if (agentsData.success && Array.isArray(agentsData.data)) {
          agentPerformance = agentsData.data;
        } else if (agentsData.data && Array.isArray(agentsData.data)) {
          agentPerformance = agentsData.data;
        }

        console.log(`Found ${agentPerformance.length} agents`);

        // Fetch deals for each agent
        const initialOpenAgents = {};

        for (const agentPerf of agentPerformance) {
          console.log(
            `📥 Fetching deals for agent: ${agentPerf.agentName} (ID: ${agentPerf.agentId})`
          );

          const agentDealsRes = await fetch(
            `${BACKEND_BASE_URL}/api/deals/admin/agent/${agentPerf.agentId}`,
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
        setOpenAgents(initialOpenAgents);
      } else {
        console.error("❌ Failed to fetch agents performance:", agentsRes.status);
        setError(`Failed to load agents performance (${agentsRes.status})`);
      }

      console.log(`✅ Total deals loaded: ${allDealsFlat.length}`);
      setAllDeals(allDealsFlat);
      setDealsByAgent(agentDealsMap);
    } catch (error) {
      console.error("❌ Error fetching deals:", error);
      setError(`Error loading deals: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgentDeals = (agentKey) => {
    setOpenAgents((prev) => ({
      ...prev,
      [agentKey]: !prev[agentKey],
    }));
  };

  const formatAmount = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'N/A';
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const calculateFinancials = (deals) => {
    let totalValue = 0;
    let completedValue = 0;

    deals.forEach(deal => {
      const price = deal.agreedPrice || deal.propertyPrice || 0;
      totalValue += price;

      if (deal.stage === 'COMPLETED') {
        completedValue += price;
      }
    });

    return {
      totalValue,
      completedValue,
      remainingValue: totalValue - completedValue,
    };
  };

  const calculateSuccessRate = (totalDeals, completedDeals) => {
    if (totalDeals === 0) return 0;
    return ((completedDeals / totalDeals) * 100).toFixed(1);
  };

  const getDaysSinceCreation = (dateString) => {
      const start = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getFilteredDealsByAgent = () => {
    const filtered = {};
    Object.keys(dealsByAgent).forEach((agentKey) => {
      const agentData = dealsByAgent[agentKey];
      let deals = agentData.deals;

      if (activeTab !== "all") {
        deals = deals.filter((d) => d.stage === activeTab);
      }

      deals.sort((a, b) => {
        const daysA = getDaysSinceCreation(a.createdAt);
        const daysB = getDaysSinceCreation(b.createdAt);

        if (sortOrder === "oldest") {
          return daysB - daysA;
        } else {
          return daysA - daysB;
        }
      });

      if (deals.length > 0) {
        filtered[agentKey] = {
          ...agentData,
          deals: deals,
        };
      }
    });

    return filtered;
  };

  const getTabCount = (stage) => {
    if (stage === "all") return allDeals.length;
    return allDeals.filter((d) => d.stage === stage).length;
  };

  // Styles
  const containerStyle = {
    maxWidth: "1700px",
    margin: "0 auto",
    padding: "24px 32px",
    backgroundColor: "#f9fafb",
    minHeight: "100vh",
  };

  const headerStyle = {
    marginBottom: "32px",
    paddingBottom: "24px",
    borderBottom: "2px solid #e5e7eb",
  };

  const titleStyle = {
    fontSize: "36px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const subtitleStyle = {
    fontSize: "14px",
    color: "#64748b",
    margin: "8px 0 0 0",
  };

  const tabContainerStyle = {
    display: "flex",
    gap: "8px",
    marginBottom: "24px",
    flexWrap: "wrap",
    alignItems: "center",
  };

  const tabStyle = (isActive) => ({
    padding: "10px 18px",
    backgroundColor: isActive ? "#3b82f6" : "white",
    color: isActive ? "white" : "#64748b",
    border: isActive ? "2px solid #3b82f6" : "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
  });

  const sortButtonStyle = (isActive) => ({
    padding: "10px 18px",
    backgroundColor: isActive ? "#10b981" : "white",
    color: isActive ? "white" : "#64748b",
    border: isActive ? "2px solid #10b981" : "2px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s",
    marginLeft: "auto",
  });

  const agentSectionStyle = {
    marginBottom: "32px",
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  };

  const agentHeaderStyle = {
    padding: "20px 24px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
  };

  const agentNameStyle = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 8px 0",
  };

  const agentInfoStyle = {
    fontSize: "13px",
    color: "#64748b",
    margin: "0",
  };

  const financialStatsContainerStyle = {
    padding: "20px 24px",
    backgroundColor: "white",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    alignItems: "center",
  };

  const financialStatBoxStyle = (isPositive = false, isNeutral = false) => ({
    padding: "16px",
    backgroundColor: isPositive ? "#dcfce7" : isNeutral ? "#f1f5f9" : "#fee2e2",
    borderRadius: "8px",
    border: isPositive ? "1px solid #10b981" : isNeutral ? "1px solid #cbd5e1" : "1px solid #f87171",
    textAlign: "center",
  });

  const statLabelStyle = {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const financialStatValueStyle = (isPositive = false, isNeutral = false) => ({
    fontSize: "24px",
    fontWeight: "800",
    color: isPositive ? "#065f46" : isNeutral ? "#475569" : "#991b1b",
  });

  const toggleButtonStyle = (isOpen) => ({
    padding: "16px",
    backgroundColor: isOpen ? "#dbeafe" : "#f0f9ff",
    border: isOpen ? "1px solid #3b82f6" : "1px solid #93c5fd",
    borderRadius: "8px",
    cursor: "pointer",
    textAlign: "center",
    transition: "all 0.2s",
    color: isOpen ? "#1e3a8a" : "#3b82f6",
    fontWeight: "600",
  });

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "20px",
    padding: "24px",
  };

  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "all 0.2s",
    position: "relative",
  };

  const stageBadgeStyle = (stage) => {
    const colors = {
      INQUIRY: { bg: "#dbeafe", text: "#1e40af" },
      SHORTLIST: { bg: "#e0e7ff", text: "#4338ca" },
      NEGOTIATION: { bg: "#fef3c7", text: "#92400e" },
      AGREEMENT: { bg: "#dcfce7", text: "#065f46" },
      REGISTRATION: { bg: "#dbeafe", text: "#075985" },
      PAYMENT: { bg: "#fce7f3", text: "#9f1239" },
      COMPLETED: { bg: "#d1fae5", text: "#065f46" },
    };

    const color = colors[stage] || { bg: "#f3f4f6", text: "#6b7280" };

    return {
      position: "absolute",
      top: "12px",
      right: "12px",
      padding: "6px 12px",
      backgroundColor: color.bg,
      color: color.text,
      fontSize: "11px",
      fontWeight: "700",
      borderRadius: "6px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    };
  };

  const titleSmallStyle = {
    margin: "0 0 12px 0",
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    paddingRight: "100px",
  };

  const buttonStyle = (isCompleted) => ({
    width: "100%",
    padding: "10px",
    backgroundColor: isCompleted ? "#10b981" : "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  });

  if (loading) {
    return (
      <div style={{ ...containerStyle, textAlign: "center", paddingTop: "80px" }}>
        <div style={{ fontSize: "18px", color: "#64748b" }}>
          Loading deals...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...containerStyle, textAlign: "center", paddingTop: "80px" }}>
        <div style={{ fontSize: "18px", color: "#ef4444", marginBottom: "16px" }}>
          {error}
        </div>
        <button
          onClick={fetchDeals}
          style={{
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const filteredDealsByAgent = getFilteredDealsByAgent();
  const agentCount = Object.keys(dealsByAgent).length;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          🏢 Admin Dashboard - Deal Management
        </h1>
        <p style={subtitleStyle}>
          {agentCount} Agents • {dashboardStats.totalDeals} Total Deals
        </p>
      </div>

      {/* Stage Filter Tabs */}
      <div style={tabContainerStyle}>
        <button
          style={tabStyle(activeTab === "all")}
          onClick={() => setActiveTab("all")}
        >
          All Deals ({getTabCount("all")})
        </button>
        <button
          style={tabStyle(activeTab === "INQUIRY")}
          onClick={() => setActiveTab("INQUIRY")}
        >
          INQUIRY ({getTabCount("INQUIRY")})
        </button>
        <button
          style={tabStyle(activeTab === "SHORTLIST")}
          onClick={() => setActiveTab("SHORTLIST")}
        >
          SHORTLIST ({getTabCount("SHORTLIST")})
        </button>
        <button
          style={tabStyle(activeTab === "NEGOTIATION")}
          onClick={() => setActiveTab("NEGOTIATION")}
        >
          NEGOTIATION ({getTabCount("NEGOTIATION")})
        </button>
        <button
          style={tabStyle(activeTab === "AGREEMENT")}
          onClick={() => setActiveTab("AGREEMENT")}
        >
          AGREEMENT ({getTabCount("AGREEMENT")})
        </button>
        <button
          style={tabStyle(activeTab === "REGISTRATION")}
          onClick={() => setActiveTab("REGISTRATION")}
        >
          REGISTRATION ({getTabCount("REGISTRATION")})
        </button>
        <button
          style={tabStyle(activeTab === "PAYMENT")}
          onClick={() => setActiveTab("PAYMENT")}
        >
          PAYMENT ({getTabCount("PAYMENT")})
        </button>
        <button
          style={tabStyle(activeTab === "COMPLETED")}
          onClick={() => setActiveTab("COMPLETED")}
        >
          COMPLETED ({getTabCount("COMPLETED")})
        </button>

        {/* Sort Button */}
        <button
          style={sortButtonStyle(sortOrder === "oldest")}
          onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
        >
          📊 Sort: {sortOrder === "newest" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Deals by Agent */}
      {Object.keys(filteredDealsByAgent).length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
          <div style={{ fontSize: "18px", fontWeight: "600" }}>No deals found</div>
          <div style={{ fontSize: "14px", marginTop: "8px" }}>
            {activeTab === "all"
              ? "No deals have been created yet"
              : `No deals in ${activeTab} stage`}
          </div>
        </div>
      ) : (
        <div>
          {Object.keys(filteredDealsByAgent).map((agentKey) => {
            const agentData = filteredDealsByAgent[agentKey];
            const dealsToRender = agentData.deals;
            const financials = calculateFinancials(dealsToRender);
            const isAgentDealsOpen = openAgents[agentKey] || false;

            return (
              <div key={agentKey} style={agentSectionStyle}>
                {/* Agent Header */}
                <div style={agentHeaderStyle}>
                  <h2 style={agentNameStyle}>
                    👤 {agentData.agentName}
                  </h2>
                  <p style={agentInfoStyle}>
                    📧 {agentData.agentEmail || "N/A"}
                    {agentData.agentMobile && ` • 📞 ${agentData.agentMobile}`}
                  </p>
                </div>

                {/* Financial Stats Row */}
                <div>
                  <div style={financialStatsContainerStyle}>
                    {/* 1. Total Pipeline Value */}
                    <div style={financialStatBoxStyle(false, true)}>
                      <div style={statLabelStyle}>Total Pipeline</div>
                      <div style={financialStatValueStyle(false, true)}>
                        {formatAmount(financials.totalValue)}
                      </div>
                      <div style={{...statLabelStyle, marginTop: '8px', color: '#3b82f6'}}>
                        {dealsToRender.length} Deals
                      </div>
                    </div>

                    {/* 2. Completed Value */}
                    <div style={financialStatBoxStyle(true)}>
                      <div style={statLabelStyle}>Completed</div>
                      <div style={financialStatValueStyle(true)}>
                        {formatAmount(financials.completedValue)}
                      </div>
                      <div style={{...statLabelStyle, marginTop: '8px', color: '#10b981'}}>
                        {dealsToRender.filter(d => d.stage === 'COMPLETED').length} Deals
                      </div>
                    </div>

                    {/* 3. Success Rate */}
                    <div style={financialStatBoxStyle(true)}>
                      <div style={statLabelStyle}>Success Rate</div>
                      <div style={financialStatValueStyle(true)}>
                        {calculateSuccessRate(agentData.totalDeals, agentData.completedDeals)}%
                      </div>
                      <div style={{...statLabelStyle, marginTop: '8px', color: '#10b981'}}>
                        {agentData.completedDeals}/{agentData.totalDeals}
                      </div>
                    </div>

                    {/* 4. Remaining Pipeline Value */}
                    <div style={financialStatBoxStyle(false, true)}>
                      <div style={statLabelStyle}>Remaining Value</div>
                      <div style={financialStatValueStyle(false, true)}>
                        {formatAmount(financials.remainingValue)}
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                        style={toggleButtonStyle(isAgentDealsOpen)}
                        onClick={() => toggleAgentDeals(agentKey)}
                        title={isAgentDealsOpen ? "Collapse Deals" : "Expand Deals"}
                    >
                        <div style={{...statLabelStyle, color: 'inherit'}}>
                            {isAgentDealsOpen ? "Collapse Deals" : "Expand Deals"}
                        </div>
                        <div style={{ fontSize: '18px', lineHeight: '1', color: 'inherit' }}>
                            {isAgentDealsOpen ? `▲` : `▼`}
                        </div>
                    </button>
                  </div>
                </div>

                {/* Agent's Deals Grid */}
                {isAgentDealsOpen && (
                    <div style={gridStyle}>
                      {dealsToRender.map((deal) => {
                        const buyer = deal.buyer;
                        const seller = deal.property?.user;
                        const key = deal.dealId;
                        const isCompleted = deal.stage === "COMPLETED";

                        return (
                          <div
                            key={key}
                            style={cardStyle}
                            onClick={() => setSelectedDeal(deal)}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
                              e.currentTarget.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)";
                              e.currentTarget.style.transform = "translateY(0)";
                            }}
                          >
                            {/* Stage Badge */}
                            <div style={stageBadgeStyle(deal.stage)}>
                                {deal.stage}
                            </div>

                            {/* Property Title */}
                            <h4 style={titleSmallStyle}>
                              🏠 {deal.propertyTitle || deal.property?.title}
                            </h4>

                            {/* Deal Price */}
                            {(deal.agreedPrice || deal.propertyPrice) && (
                              <div
                                style={{
                                  padding: "10px",
                                  backgroundColor: deal.agreedPrice ? "#dcfce7" : "#e0f2fe",
                                  borderRadius: "8px",
                                  marginBottom: "12px",
                                  border: deal.agreedPrice ? '1px solid #10b981' : '1px solid #93c5fd'
                                }}
                              >
                                <div style={{
                                    fontSize: "15px",
                                    fontWeight: "700",
                                    color: deal.agreedPrice ? "#065f46" : "#1e3a8a"
                                }}>
                                  💰 Deal Price: ₹{
                                    (deal.agreedPrice || deal.propertyPrice)?.toLocaleString("en-IN", { maximumFractionDigits: 0 })
                                  }
                                </div>
                                <div style={{ fontSize: "11px", fontWeight: "500", color: "#64748b", marginTop: '4px' }}>
                                  {deal.agreedPrice ? 'Agreed Price' : 'Listing Price (Agreed Price Pending)'}
                                </div>
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
                                <div style={{ fontWeight: "600", color: "#1e293b", marginBottom: "2px" }}>
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
                                <div style={{ fontWeight: "600", color: "#1e293b", marginBottom: "2px" }}>
                                  🏢 Seller: {seller.firstName} {seller.lastName}
                                </div>
                                {seller.mobileNumber && (
                                  <div style={{ color: "#64748b", fontSize: "11px" }}>
                                    📞 {seller.mobileNumber}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Date and Age */}
                            <p style={{ margin: "8px 0 12px 0", fontSize: "11px", color: "#64748b" }}>
                              📅 {new Date(deal.createdAt).toLocaleDateString()}
                              <span style={{marginLeft: '8px', color: '#f59e0b', fontWeight: '600'}}>
                                ({getDaysSinceCreation(deal.createdAt)} days old)
                              </span>
                            </p>

                            {/* View Button */}
                            <button
                              style={buttonStyle(isCompleted)}
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
                )}
              </div>
            );
          })}
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