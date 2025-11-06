// realestate-frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { BACKEND_BASE_URL } from "../config/config";
import DealDetailModal from "../DealDetailModal.jsx";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Summary cards
  const [stats, setStats] = useState({
    totalDeals: 0,
    inquiryCount: 0,
    shortlistCount: 0,
    negotiationCount: 0,
    agreementCount: 0,
    registrationCount: 0,
    paymentCount: 0,
    completedCount: 0,
  });

  // Agent leaderboard and recent deals
  const [agents, setAgents] = useState([]); // [{ agentId, agentName, totalDeals, completedDeals, ... }]
  const [recentDeals, setRecentDeals] = useState([]); // flat list across agents, sorted by createdAt desc

  // UI state
  const [stageFilter, setStageFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!user?.id || user?.role !== "ADMIN") {
      setErr("Only admins can access this dashboard.");
      setLoading(false);
      return;
    }
    load();
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

  const load = async () => {
    setLoading(true);
    setErr(null);

    try {
      // 1) Dashboard stats
      const statsRes = await fetch(
        `${BACKEND_BASE_URL}/api/deals/admin/dashboard`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (statsRes.ok) {
        const data = await safeParse(statsRes);
        const s = data?.data || data || {};
        setStats({
          totalDeals: s.totalDeals ?? 0,
          inquiryCount: s.inquiryCount ?? 0,
          shortlistCount: s.shortlistCount ?? 0,
          negotiationCount: s.negotiationCount ?? 0,
          agreementCount: s.agreementCount ?? 0,
          registrationCount: s.registrationCount ?? 0,
          paymentCount: s.paymentCount ?? 0,
          completedCount: s.completedCount ?? 0,
        });
      }

      // 2) Agents performance (leaderboard)
      const perfRes = await fetch(
        `${BACKEND_BASE_URL}/api/deals/admin/agents-performance`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let perf = [];
      if (perfRes.ok) {
        const p = await safeParse(perfRes);
        if (Array.isArray(p)) perf = p;
        else if (Array.isArray(p?.data)) perf = p.data;
      }
      setAgents(perf);

      // 3) Recent deals: pull last N per top agents (or all agents) and flatten
      const topAgentIds = perf.slice(0, 6).map((a) => a.agentId);
      const dealLists = await Promise.allSettled(
        topAgentIds.map((id) =>
          fetch(`${BACKEND_BASE_URL}/api/deals/admin/agent/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => (Array.isArray(d) ? d : d?.data || []))
        )
      );
      const flat = dealLists
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => r.value);
      // dedupe by dealId/id and sort newest first
      const seen = new Set();
      const unique = [];
      for (const d of flat) {
        const id = d.dealId || d.id;
        if (id && !seen.has(id)) {
          seen.add(id);
          unique.push(d);
        }
      }
      unique.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
      setRecentDeals(unique.slice(0, 20));
    } catch (e) {
      console.error(e);
      setErr("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const stageMap = useMemo(
    () => ({
      ALL: stats.totalDeals,
      INQUIRY: stats.inquiryCount,
      SHORTLIST: stats.shortlistCount,
      NEGOTIATION: stats.negotiationCount,
      AGREEMENT: stats.agreementCount,
      REGISTRATION: stats.registrationCount,
      PAYMENT: stats.paymentCount,
      COMPLETED: stats.completedCount,
    }),
    [stats]
  );

  const filteredRecent = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return recentDeals.filter((d) => {
      if (
        stageFilter !== "ALL" &&
        (d.stage || d.currentStage) !== stageFilter
      ) {
        return false;
      }
      if (!needle) return true;
      const txt = [
        d.propertyTitle || d.property?.title || "",
        d.buyerName || `${d.buyer?.firstName || ""} ${d.buyer?.lastName || ""}`,
        d.sellerName ||
          `${d.property?.user?.firstName || ""} ${
            d.property?.user?.lastName || ""
          }`,
        d.agentName || `${d.agent?.firstName || ""} ${d.agent?.lastName || ""}`,
        d.propertyCity || d.property?.city || "",
      ]
        .join(" ")
        .toLowerCase();
      return txt.includes(needle);
    });
  }, [recentDeals, stageFilter, search]);

  const pct = (num, den) => {
    if (!den) return "0%";
    const p = Math.round((num / den) * 100);
    return `${p}%`;
  };

  const k = (n) => {
    const num = Number(n || 0);
    if (num >= 1_00_00_000) return `${(num / 1_00_00_000).toFixed(2)} Cr`;
    if (num >= 1_00_000) return `${(num / 1_00_000).toFixed(2)} L`;
    return num.toLocaleString("en-IN");
  };

  return (
    <div className="adm-container">
      <header className="adm-header">
        <h1 className="adm-title">Admin Dashboard</h1>
        <p className="adm-subtitle">
          Insights across deals and agent performance
        </p>
        {err && <div className="adm-alert">⚠️ {err}</div>}
      </header>

      {loading ? (
        <div className="adm-state">⏳ Loading dashboard...</div>
      ) : (
        <>
          {/* KPI cards */}
          <section className="adm-kpis">
            <div className="adm-kpi">
              <div className="adm-kpi-label">Total deals</div>
              <div className="adm-kpi-value">{stats.totalDeals}</div>
            </div>
            <div className="adm-kpi">
              <div className="adm-kpi-label">In progress</div>
              <div className="adm-kpi-value">
                {stats.totalDeals - stats.completedCount}
              </div>
            </div>
            <div className="adm-kpi">
              <div className="adm-kpi-label">Completed</div>
              <div className="adm-kpi-value">{stats.completedCount}</div>
            </div>
            <div className="adm-kpi">
              <div className="adm-kpi-label">Completion rate</div>
              <div className="adm-kpi-value">
                {pct(stats.completedCount, stats.totalDeals)}
              </div>
            </div>
          </section>

          {/* Stage distribution */}
          <section className="adm-stage">
            <div className="adm-stage-head">
              <h2 className="adm-h2">Deals by stage</h2>
              <div className="adm-stage-filter">
                <label htmlFor="stage" className="adm-label">
                  Stage
                </label>
                <select
                  id="stage"
                  className="adm-select"
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                >
                  {Object.keys(stageMap).map((s) => (
                    <option key={s} value={s}>
                      {s} ({stageMap[s]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="adm-stage-grid">
              {[
                ["INQUIRY", stats.inquiryCount],
                ["SHORTLIST", stats.shortlistCount],
                ["NEGOTIATION", stats.negotiationCount],
                ["AGREEMENT", stats.agreementCount],
                ["REGISTRATION", stats.registrationCount],
                ["PAYMENT", stats.paymentCount],
                ["COMPLETED", stats.completedCount],
              ].map(([name, val]) => (
                <div key={name} className="adm-stage-card">
                  <div className="adm-stage-name">{name}</div>
                  <div className="adm-stage-bar">
                    <div
                      className="adm-stage-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          stats.totalDeals ? (val / stats.totalDeals) * 100 : 0
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="adm-stage-val">{val}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Agent leaderboard */}
          <section className="adm-agents">
            <div className="adm-agents-head">
              <h2 className="adm-h2">Top agents</h2>
              <span className="adm-muted">{agents.length} total</span>
            </div>
            <div className="adm-agent-grid">
              {agents.map((a) => (
                <div key={a.agentId} className="adm-agent-card">
                  <div className="adm-agent-name">{a.agentName}</div>
                  <div className="adm-agent-row">
                    <span>Total</span>
                    <span>{a.totalDeals ?? 0}</span>
                  </div>
                  <div className="adm-agent-row">
                    <span>Completed</span>
                    <span>{a.completedDeals ?? 0}</span>
                  </div>
                  <div className="adm-agent-row">
                    <span>Success</span>
                    <span>{pct(a.completedDeals ?? 0, a.totalDeals ?? 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent deals list */}
          <section className="adm-recent">
            <div className="adm-recent-head">
              <h2 className="adm-h2">Recent deals</h2>
              <div className="adm-search">
                <input
                  className="adm-input"
                  placeholder="Search property, buyer, seller, agent..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {filteredRecent.length === 0 ? (
              <div className="adm-state">No deals match current filters.</div>
            ) : (
              <div className="adm-recent-grid">
                {filteredRecent.map((d) => {
                  const id = d.dealId || d.id;
                  const stage = d.stage || d.currentStage || "INQUIRY";
                  const price = d.agreedPrice || d.propertyPrice;
                  const buyer =
                    d.buyerName ||
                    `${d.buyer?.firstName || ""} ${
                      d.buyer?.lastName || ""
                    }`.trim();
                  const seller =
                    d.sellerName ||
                    `${d.property?.user?.firstName || ""} ${
                      d.property?.user?.lastName || ""
                    }`.trim();

                  return (
                    <div
                      key={id}
                      className="adm-deal-card"
                      onClick={() => setSelectedDeal(d)}
                    >
                      <div
                        className={`adm-stage-badge stage-${stage.toLowerCase()}`}
                      >
                        {stage}
                      </div>
                      <div className="adm-deal-title">
                        {d.propertyTitle || d.property?.title || "Property"}
                      </div>
                      {price && (
                        <div className="adm-deal-price">₹{k(price)}</div>
                      )}
                      <div className="adm-deal-meta">
                        <span>Buyer: {buyer || "N/A"}</span>
                        <span>Seller: {seller || "N/A"}</span>
                      </div>
                      <div className="adm-deal-date">
                        {new Date(
                          d.createdAt || Date.now()
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={(u) => {
            setSelectedDeal(null);
            load();
          }}
          userRole="ADMIN"
        />
      )}
    </div>
  );
}
