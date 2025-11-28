// realestate-frontend/src/pages/AgentDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../AuthContext";
import { BACKEND_BASE_URL } from "../config/config";
import DealDetailModal from "../DealDetailModal";
import "./AgentDashboard.css";

export default function AgentDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [deals, setDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);

  // Filters
  const [stageFilter, setStageFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("30"); // last 30 days
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!user?.id || user?.role !== "AGENT") {
      setErr("Only agents can access this dashboard.");
      setLoading(false);
      return;
    }
    loadDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const safeParse = async (res) => {
    try {
      const ct = res.headers.get("content-type");
      if (ct && ct.includes("application/json")) return await res.json();
      await res.text();
      return null;
    } catch {
      return null;
    }
  };

  const loadDeals = async () => {
    setLoading(true);
    setErr(null);

    try {
      console.log('🎯 Fetching deals for agent:', user.id);

      // Try multiple possible endpoints
      const endpoints = [
        `${BACKEND_BASE_URL}/api/deals/agent/${user.id}`,
        `${BACKEND_BASE_URL}/api/deals/user/${user.id}/role/AGENT`,
        `${BACKEND_BASE_URL}/api/deals/my-deals`,
        `${BACKEND_BASE_URL}/api/deals`,
      ];

      let dealsData = [];
      let endpointWorked = false;

      for (const endpoint of endpoints) {
        try {
          console.log(`🔍 Trying endpoint: ${endpoint}`);

          const response = await fetch(endpoint, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.ok) {
            const data = await safeParse(response);
            console.log(`✅ Response from ${endpoint}:`, data);

            if (Array.isArray(data)) {
              // Direct array of deals - filter for agent
              dealsData = data.filter(deal =>
                deal.agentId === user.id ||
                deal.agent?.id === user.id ||
                deal.agent?.agentId === user.id
              );
            } else if (data?.success && Array.isArray(data.data)) {
              // Wrapped response - filter for agent
              dealsData = data.data.filter(deal =>
                deal.agentId === user.id ||
                deal.agent?.id === user.id ||
                deal.agent?.agentId === user.id
              );
            } else if (Array.isArray(data?.data)) {
              // Another wrapped format - filter for agent
              dealsData = data.data.filter(deal =>
                deal.agentId === user.id ||
                deal.agent?.id === user.id ||
                deal.agent?.agentId === user.id
              );
            } else if (data?.dealId || data?.id) {
              // Single deal response
              if (data.agentId === user.id || data.agent?.id === user.id) {
                dealsData = [data];
              }
            } else {
              console.log(`⚠️ Unexpected data format from ${endpoint}:`, data);
              continue;
            }

            if (dealsData.length > 0) {
              endpointWorked = true;
              console.log(`🎉 Found ${dealsData.length} deals for agent from ${endpoint}`);
              break;
            } else {
              console.log(`ℹ️ ${endpoint} returned data but no deals for this agent`);
            }
          } else {
            console.log(`❌ ${endpoint} failed with status ${response.status}`);
          }
        } catch (fetchError) {
          console.log(`❌ ${endpoint} failed with error:`, fetchError);
          continue;
        }
      }

      if (!endpointWorked) {
        // Final fallback: try to get all deals and filter client-side
        console.log("⚠️ Trying final fallback: get all deals and filter");
        try {
          const response = await fetch(`${BACKEND_BASE_URL}/api/deals`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await safeParse(response);
            const allDeals = Array.isArray(data) ? data : (data?.data || []);
            dealsData = allDeals.filter(deal =>
              deal.agentId === user.id ||
              deal.agent?.id === user.id ||
              deal.agent?.agentId === user.id
            );
            console.log(`ℹ️ Fallback: filtered ${dealsData.length} deals from all deals`);
          }
        } catch (e) {
          console.log("❌ Final fallback also failed");
        }
      }

      // Sort by creation date (newest first)
      dealsData.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );

      console.log(`📊 Final agent deals count: ${dealsData.length}`);
      setDeals(dealsData);
    } catch (e) {
      console.error("❌ Agent deals fetch error:", e);
      setErr("Unable to load deals. Please try again later.");
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };


  // Calculate metrics
  const metrics = useMemo(() => {
    const now = new Date();
    const dateFilterDays = parseInt(dateFilter) || 30;
    const cutoffDate = new Date(
      now.getTime() - dateFilterDays * 24 * 60 * 60 * 1000
    );

    // Filter deals by date if not "ALL"
    const filteredByDate =
      dateFilter === "ALL"
        ? deals
        : deals.filter((deal) => new Date(deal.createdAt || 0) >= cutoffDate);

    const totalDeals = filteredByDate.length;
    const completedDeals = filteredByDate.filter(
      (d) => (d.stage || d.currentStage) === "COMPLETED"
    ).length;
    const activeDeals = totalDeals - completedDeals;
    const successRate =
      totalDeals > 0 ? Math.round((completedDeals / totalDeals) * 100) : 0;

    // Stage distribution
    const stages = filteredByDate.reduce((acc, deal) => {
      const stage = deal.stage || deal.currentStage || "INQUIRY";
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    // Revenue calculation
    const totalRevenue = filteredByDate.reduce((sum, deal) => {
      const price = deal.agreedPrice || deal.propertyPrice || 0;
      return sum + (typeof price === "number" ? price : 0);
    }, 0);

    const completedRevenue = filteredByDate
      .filter((d) => (d.stage || d.currentStage) === "COMPLETED")
      .reduce((sum, deal) => {
        const price = deal.agreedPrice || deal.propertyPrice || 0;
        return sum + (typeof price === "number" ? price : 0);
      }, 0);

    return {
      totalDeals,
      activeDeals,
      completedDeals,
      successRate,
      totalRevenue,
      completedRevenue,
      stages,
      dateRangeText:
        dateFilter === "ALL" ? "All Time" : `Last ${dateFilter} days`,
    };
  }, [deals, dateFilter]);

  // Filter deals for display
  const displayDeals = useMemo(() => {
    let filtered = [...deals];

    // Stage filter
    if (stageFilter !== "ALL") {
      filtered = filtered.filter(
        (d) => (d.stage || d.currentStage) === stageFilter
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const needle = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((d) => {
        const searchableText = [
          d.propertyTitle || d.property?.title || "",
          d.buyerName ||
            `${d.buyer?.firstName || ""} ${d.buyer?.lastName || ""}`,
          d.sellerName ||
            `${d.property?.user?.firstName || ""} ${
              d.property?.user?.lastName || ""
            }`,
          d.propertyCity || d.property?.city || "",
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(needle);
      });
    }

    // Date filter
    if (dateFilter !== "ALL") {
      const now = new Date();
      const dateFilterDays = parseInt(dateFilter);
      const cutoffDate = new Date(
        now.getTime() - dateFilterDays * 24 * 60 * 60 * 1000
      );
      filtered = filtered.filter(
        (d) => new Date(d.createdAt || 0) >= cutoffDate
      );
    }

    return filtered;
  }, [deals, stageFilter, searchQuery, dateFilter]);

  const formatCurrency = (amount) => {
    if (typeof amount !== "number" || isNaN(amount)) return "₹0";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString("en-IN")}`;
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

  const stagePriority = {
    INQUIRY: 1,
    SHORTLIST: 2,
    NEGOTIATION: 3,
    AGREEMENT: 4,
    REGISTRATION: 5,
    PAYMENT: 6,
    COMPLETED: 7,
  };

  return (
    <div className="agd-container">
      <header className="agd-header">
        <div className="agd-header-content">
          <h1 className="agd-title">Agent Dashboard</h1>
          <p className="agd-subtitle">
            Welcome back, {user?.firstName}! Here's your performance overview.
          </p>
          {err && <div className="agd-alert">⚠️ {err}</div>}
        </div>
        <div className="agd-date-filter">
          <label className="agd-label">Period</label>
          <select
            className="agd-select"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
            <option value="ALL">All time</option>
          </select>
        </div>
      </header>

      {loading ? (
        <div className="agd-state">⏳ Loading dashboard...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <section className="agd-kpis">
            <div className="agd-kpi">
              <div className="agd-kpi-icon">📊</div>
              <div className="agd-kpi-content">
                <div className="agd-kpi-value">{metrics.totalDeals}</div>
                <div className="agd-kpi-label">Total Deals</div>
                <div className="agd-kpi-period">{metrics.dateRangeText}</div>
              </div>
            </div>

            <div className="agd-kpi">
              <div className="agd-kpi-icon">⚡</div>
              <div className="agd-kpi-content">
                <div className="agd-kpi-value">{metrics.activeDeals}</div>
                <div className="agd-kpi-label">Active Deals</div>
                <div className="agd-kpi-period">In Progress</div>
              </div>
            </div>

            <div className="agd-kpi agd-kpi-success">
              <div className="agd-kpi-icon">✅</div>
              <div className="agd-kpi-content">
                <div className="agd-kpi-value">{metrics.completedDeals}</div>
                <div className="agd-kpi-label">Completed</div>
                <div className="agd-kpi-period">
                  {metrics.successRate}% Success
                </div>
              </div>
            </div>

            <div className="agd-kpi agd-kpi-revenue">
              <div className="agd-kpi-icon">💰</div>
              <div className="agd-kpi-content">
                <div className="agd-kpi-value">
                  {formatCurrency(metrics.completedRevenue)}
                </div>
                <div className="agd-kpi-label">Revenue</div>
                <div className="agd-kpi-period">From Completed</div>
              </div>
            </div>
          </section>

          {/* Stage Overview */}
          <section className="agd-stages">
            <div className="agd-section-header">
              <h2 className="agd-section-title">Deal Pipeline</h2>
              <span className="agd-section-subtitle">
                {metrics.dateRangeText} • {metrics.totalDeals} deals
              </span>
            </div>

            <div className="agd-stage-grid">
              {Object.entries(metrics.stages)
                .sort(
                  ([a], [b]) =>
                    (stagePriority[a] || 99) - (stagePriority[b] || 99)
                )
                .map(([stage, count]) => (
                  <div key={stage} className="agd-stage-card">
                    <div className="agd-stage-header">
                      <div
                        className="agd-stage-dot"
                        style={{ backgroundColor: getStageColor(stage) }}
                      />
                      <div className="agd-stage-name">{stage}</div>
                    </div>
                    <div className="agd-stage-count">{count}</div>
                    <div className="agd-stage-percentage">
                      {metrics.totalDeals > 0
                        ? Math.round((count / metrics.totalDeals) * 100)
                        : 0}
                      %
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Recent Deals */}
          <section className="agd-recent">
            <div className="agd-section-header">
              <h2 className="agd-section-title">Recent Deals</h2>
              <div className="agd-recent-controls">
                <div className="agd-search">
                  <input
                    className="agd-input"
                    placeholder="Search deals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="agd-stage-filter">
                  <select
                    className="agd-select agd-select-compact"
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                  >
                    <option value="ALL">All Stages</option>
                    <option value="INQUIRY">Inquiry</option>
                    <option value="SHORTLIST">Shortlist</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="AGREEMENT">Agreement</option>
                    <option value="REGISTRATION">Registration</option>
                    <option value="PAYMENT">Payment</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {displayDeals.length === 0 ? (
              <div className="agd-state">
                <div className="agd-empty-icon">🔍</div>
                <div className="agd-empty-title">No deals found</div>
                <div className="agd-empty-text">
                  {searchQuery || stageFilter !== "ALL" || dateFilter !== "ALL"
                    ? "Try adjusting your filters to see more deals."
                    : "You haven't handled any deals yet. Check back soon!"}
                </div>
              </div>
            ) : (
              <div className="agd-deals-grid">
                {displayDeals.slice(0, 12).map((deal) => {
                  const dealId = deal.dealId || deal.id;
                  const stage = deal.stage || deal.currentStage || "INQUIRY";
                  const price = deal.agreedPrice || deal.propertyPrice;
                  const buyer =
                    deal.buyerName ||
                    `${deal.buyer?.firstName || ""} ${
                      deal.buyer?.lastName || ""
                    }`.trim();
                  const seller =
                    deal.sellerName ||
                    `${deal.property?.user?.firstName || ""} ${
                      deal.property?.user?.lastName || ""
                    }`.trim();

                  return (
                    <div
                      key={dealId}
                      className="agd-deal-card"
                      onClick={() => setSelectedDeal(deal)}
                    >
                      <div
                        className="agd-deal-stage"
                        style={{ backgroundColor: getStageColor(stage) }}
                      >
                        {stage}
                      </div>

                      <div className="agd-deal-content">
                        <h3 className="agd-deal-title">
                          {deal.propertyTitle ||
                            deal.property?.title ||
                            "Property"}
                        </h3>

                        {price && (
                          <div className="agd-deal-price">
                            {formatCurrency(price)}
                          </div>
                        )}

                        <div className="agd-deal-parties">
                          <div className="agd-deal-party">
                            <span className="agd-party-label">Buyer</span>
                            <span className="agd-party-name">
                              {buyer || "N/A"}
                            </span>
                          </div>
                          <div className="agd-deal-party">
                            <span className="agd-party-label">Seller</span>
                            <span className="agd-party-name">
                              {seller || "N/A"}
                            </span>
                          </div>
                        </div>

                        <div className="agd-deal-date">
                          {deal.createdAt
                            ? new Date(deal.createdAt).toLocaleDateString()
                            : "Unknown date"}
                        </div>

                        <button className="agd-deal-btn">
                          📋 View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {displayDeals.length > 12 && (
              <div className="agd-show-more">
                <p className="agd-show-more-text">
                  Showing 12 of {displayDeals.length} deals
                </p>
              </div>
            )}
          </section>
        </>
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={(updatedDeal) => {
            setSelectedDeal(updatedDeal);
            setDeals((prev) =>
              prev.map((d) => {
                const dId = d.dealId || d.id;
                const uId = updatedDeal.dealId || updatedDeal.id;
                return String(dId) === String(uId) ? updatedDeal : d;
              })
            );
          }}
          userRole="AGENT"
        />
      )}
    </div>
  );
}
