import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import DealDetailModal from "./DealDetailModal";
import { BACKEND_BASE_URL } from "./config/config";
import "./AdminDealPanel.css";

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

  const [dashboardStats, setDashboardStats] = useState({
    totalDeals: 0,
    inquiryCount: 0,
    shortlistCount: 0,
    negotiationCount: 0,
    agreementCount: 0,
    registrationCount: 0,
    paymentCount: 0,
    completedCount: 0,
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

      console.log("📊 Fetching agents performance data...");
      const agentsRes = await fetch(
        `${BACKEND_BASE_URL}/api/deals/admin/agents-performance`,
        { headers }
      );

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json();
        console.log("✅ Agents performance response:", agentsData);

        let agentPerformance = [];
        if (Array.isArray(agentsData)) {
          agentPerformance = agentsData;
        } else if (agentsData.success && Array.isArray(agentsData.data)) {
          agentPerformance = agentsData.data;
        } else if (agentsData.data && Array.isArray(agentsData.data)) {
          agentPerformance = agentsData.data;
        }

        console.log(`Found ${agentPerformance.length} agents`);

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
            console.log(`Response for ${agentPerf.agentName}:`, agentDealsData);

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
        console.error(
          "❌ Failed to fetch agents performance:",
          agentsRes.status
        );
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
    if (typeof amount !== "number" || isNaN(amount)) return "N/A";
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const calculateFinancials = (deals) => {
    let totalValue = 0;
    let completedValue = 0;

    deals.forEach((deal) => {
      const price = deal.agreedPrice || deal.propertyPrice || 0;
      totalValue += price;

      if (deal.stage === "COMPLETED") {
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

  if (loading) {
    return (
      <div className="adp-container">
        <div className="adp-loading">Loading deals...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adp-container">
        <div className="adp-error">{error}</div>
        <button onClick={fetchDeals} className="adp-retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const filteredDealsByAgent = getFilteredDealsByAgent();
  const agentCount = Object.keys(dealsByAgent).length;

  return (
    <div className="adp-container">
      {/* Header */}
      <div className="adp-header">
        <h1 className="adp-title">🏢 Admin Dashboard - Deal Management</h1>
        <p className="adp-subtitle">
          {agentCount} Agents • {dashboardStats.totalDeals} Total Deals
        </p>
      </div>

      {/* Stage Filter Tabs - Desktop */}
      <div className="adp-tabs adp-tabs-desktop">
        <button
          className={`adp-tab ${activeTab === "all" ? "active" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          All Deals ({getTabCount("all")})
        </button>
        <button
          className={`adp-tab ${activeTab === "INQUIRY" ? "active" : ""}`}
          onClick={() => setActiveTab("INQUIRY")}
        >
          INQUIRY ({getTabCount("INQUIRY")})
        </button>
        <button
          className={`adp-tab ${activeTab === "SHORTLIST" ? "active" : ""}`}
          onClick={() => setActiveTab("SHORTLIST")}
        >
          SHORTLIST ({getTabCount("SHORTLIST")})
        </button>
        <button
          className={`adp-tab ${activeTab === "NEGOTIATION" ? "active" : ""}`}
          onClick={() => setActiveTab("NEGOTIATION")}
        >
          NEGOTIATION ({getTabCount("NEGOTIATION")})
        </button>
        <button
          className={`adp-tab ${activeTab === "AGREEMENT" ? "active" : ""}`}
          onClick={() => setActiveTab("AGREEMENT")}
        >
          AGREEMENT ({getTabCount("AGREEMENT")})
        </button>
        <button
          className={`adp-tab ${activeTab === "REGISTRATION" ? "active" : ""}`}
          onClick={() => setActiveTab("REGISTRATION")}
        >
          REGISTRATION ({getTabCount("REGISTRATION")})
        </button>
        <button
          className={`adp-tab ${activeTab === "PAYMENT" ? "active" : ""}`}
          onClick={() => setActiveTab("PAYMENT")}
        >
          PAYMENT ({getTabCount("PAYMENT")})
        </button>
        <button
          className={`adp-tab ${activeTab === "COMPLETED" ? "active" : ""}`}
          onClick={() => setActiveTab("COMPLETED")}
        >
          COMPLETED ({getTabCount("COMPLETED")})
        </button>

        <button
          className={`adp-sort-btn ${sortOrder === "oldest" ? "active" : ""}`}
          onClick={() =>
            setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
          }
        >
          📊 Sort: {sortOrder === "newest" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Stage Filter Dropdown - Mobile */}
      <div className="adp-tabs adp-tabs-mobile">
        <select
          className="adp-mobile-select"
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
        >
          <option value="all">All Deals ({getTabCount("all")})</option>
          <option value="INQUIRY">INQUIRY ({getTabCount("INQUIRY")})</option>
          <option value="SHORTLIST">
            SHORTLIST ({getTabCount("SHORTLIST")})
          </option>
          <option value="NEGOTIATION">
            NEGOTIATION ({getTabCount("NEGOTIATION")})
          </option>
          <option value="AGREEMENT">
            AGREEMENT ({getTabCount("AGREEMENT")})
          </option>
          <option value="REGISTRATION">
            REGISTRATION ({getTabCount("REGISTRATION")})
          </option>
          <option value="PAYMENT">PAYMENT ({getTabCount("PAYMENT")})</option>
          <option value="COMPLETED">
            COMPLETED ({getTabCount("COMPLETED")})
          </option>
        </select>

        <button
          className={`adp-sort-btn ${sortOrder === "oldest" ? "active" : ""}`}
          onClick={() =>
            setSortOrder(sortOrder === "newest" ? "oldest" : "newest")
          }
        >
          📊 {sortOrder === "newest" ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* Deals by Agent */}
      {Object.keys(filteredDealsByAgent).length === 0 ? (
        <div className="adp-no-deals">
          <div className="adp-no-deals-icon">🔍</div>
          <div className="adp-no-deals-title">No deals found</div>
          <div className="adp-no-deals-text">
            {activeTab === "all"
              ? "No deals have been created yet"
              : `No deals in ${activeTab} stage`}
          </div>
        </div>
      ) : (
        <div className="adp-agents">
          {Object.keys(filteredDealsByAgent).map((agentKey) => {
            const agentData = filteredDealsByAgent[agentKey];
            const dealsToRender = agentData.deals;
            const financials = calculateFinancials(dealsToRender);
            const isAgentDealsOpen = openAgents[agentKey] || false;

            return (
              <div key={agentKey} className="adp-agent-section">
                {/* Agent Header - Mobile Optimized */}
                <div className="adp-agent-header">
                  <div className="adp-agent-info-wrapper">
                    <div className="adp-agent-details">
                      <h2 className="adp-agent-name">
                        👤 {agentData.agentName}
                      </h2>
                      <p className="adp-agent-info">
                        📧 {agentData.agentEmail || "N/A"}
                        {agentData.agentMobile &&
                          ` • 📞 ${agentData.agentMobile}`}
                      </p>
                    </div>
                    <button
                      className={`adp-toggle-btn-mobile ${
                        isAgentDealsOpen ? "open" : ""
                      }`}
                      onClick={() => toggleAgentDeals(agentKey)}
                      title={
                        isAgentDealsOpen ? "Collapse Deals" : "Expand Deals"
                      }
                    >
                      <span className="adp-toggle-text">
                        {isAgentDealsOpen ? "Hide" : "Show"} (
                        {dealsToRender.length})
                      </span>
                      <span className="adp-toggle-icon">
                        {isAgentDealsOpen ? `▲` : `▼`}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Financial Stats - Hidden on Mobile */}
                <div className="adp-financial-stats adp-desktop-only">
                  <div className="adp-stat adp-stat-neutral">
                    <div className="adp-stat-label">Total Pipeline</div>
                    <div className="adp-stat-value">
                      {formatAmount(financials.totalValue)}
                    </div>
                    <div className="adp-stat-sub">
                      {dealsToRender.length} Deals
                    </div>
                  </div>

                  <div className="adp-stat adp-stat-positive">
                    <div className="adp-stat-label">Completed</div>
                    <div className="adp-stat-value">
                      {formatAmount(financials.completedValue)}
                    </div>
                    <div className="adp-stat-sub">
                      {
                        dealsToRender.filter((d) => d.stage === "COMPLETED")
                          .length
                      }{" "}
                      Deals
                    </div>
                  </div>

                  <div className="adp-stat adp-stat-positive">
                    <div className="adp-stat-label">Success Rate</div>
                    <div className="adp-stat-value">
                      {calculateSuccessRate(
                        agentData.totalDeals,
                        agentData.completedDeals
                      )}
                      %
                    </div>
                    <div className="adp-stat-sub">
                      {agentData.completedDeals}/{agentData.totalDeals}
                    </div>
                  </div>

                  <div className="adp-stat adp-stat-neutral">
                    <div className="adp-stat-label">Remaining Value</div>
                    <div className="adp-stat-value">
                      {formatAmount(financials.remainingValue)}
                    </div>
                  </div>

                  <button
                    className={`adp-toggle-btn ${
                      isAgentDealsOpen ? "open" : ""
                    }`}
                    onClick={() => toggleAgentDeals(agentKey)}
                    title={isAgentDealsOpen ? "Collapse Deals" : "Expand Deals"}
                  >
                    <div className="adp-toggle-label">
                      {isAgentDealsOpen ? "Collapse Deals" : "Expand Deals"}
                    </div>
                    <div className="adp-toggle-icon">
                      {isAgentDealsOpen ? `▲` : `▼`}
                    </div>
                  </button>
                </div>

                {/* Agent's Deals Grid */}
                {isAgentDealsOpen && (
                  <div className="adp-deals-grid">
                    {dealsToRender.map((deal) => {
                      const buyer = deal.buyer;
                      const seller = deal.property?.user;
                      const key = deal.dealId;
                      const isCompleted = deal.stage === "COMPLETED";

                      return (
                        <div
                          key={key}
                          className="adp-deal-card"
                          onClick={() => setSelectedDeal(deal)}
                        >
                          <div
                            className={`adp-stage-badge adp-stage-${deal.stage.toLowerCase()}`}
                          >
                            {deal.stage}
                          </div>

                          <h4 className="adp-deal-title">
                            🏠 {deal.propertyTitle || deal.property?.title}
                          </h4>

                          {(deal.agreedPrice || deal.propertyPrice) && (
                            <div
                              className={`adp-price ${
                                deal.agreedPrice ? "agreed" : "listing"
                              }`}
                            >
                              <div className="adp-price-value">
                                💰 Deal Price: ₹
                                {(
                                  deal.agreedPrice || deal.propertyPrice
                                )?.toLocaleString("en-IN", {
                                  maximumFractionDigits: 0,
                                })}
                              </div>
                              <div className="adp-price-type">
                                {deal.agreedPrice
                                  ? "Agreed Price"
                                  : "Listing Price (Agreed Price Pending)"}
                              </div>
                            </div>
                          )}

                          {buyer && (
                            <div className="adp-person">
                              <div className="adp-person-name">
                                👤 Buyer: {buyer?.firstName} {buyer?.lastName}
                              </div>
                              {buyer?.mobileNumber && (
                                <div className="adp-person-contact">
                                  📞 {buyer.mobileNumber}
                                </div>
                              )}
                            </div>
                          )}

                          {seller && (
                            <div className="adp-person">
                              <div className="adp-person-name">
                                🏢 Seller: {seller.firstName} {seller.lastName}
                              </div>
                              {seller.mobileNumber && (
                                <div className="adp-person-contact">
                                  📞 {seller.mobileNumber}
                                </div>
                              )}
                            </div>
                          )}

                          <p className="adp-deal-date">
                            📅 {new Date(deal.createdAt).toLocaleDateString()}
                            <span className="adp-deal-age">
                              ({getDaysSinceCreation(deal.createdAt)} days old)
                            </span>
                          </p>

                          <button
                            className={`adp-view-btn ${
                              isCompleted ? "completed" : ""
                            }`}
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
