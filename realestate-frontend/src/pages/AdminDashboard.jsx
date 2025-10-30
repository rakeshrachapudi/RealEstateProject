import React, { useState, useEffect } from "react";
import { BACKEND_BASE_URL } from "../config/config";

// ==================== ADMIN DASHBOARD ====================
const AdminDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDeals, setAgentDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      fetchAgentDeals(selectedAgent);
    }
  }, [selectedAgent]);

  // ✅ ADDED: Search filter effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDeals(agentDeals);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = agentDeals.filter((deal) => {
        const dealId = (deal.dealId || deal.id || '').toString();
        const propertyTitle = (deal.propertyTitle || '').toLowerCase();
        const buyerName = (deal.buyerName || '').toLowerCase();
        const stage = (deal.stage || '').toLowerCase();

        return (
          dealId.includes(term) ||
          propertyTitle.includes(term) ||
          buyerName.includes(term) ||
          stage.includes(term)
        );
      });
      setFilteredDeals(filtered);
    }
  }, [searchTerm, agentDeals]);

  const fetchAgents = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/admin/agents-performance`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const agentsList = data.success ? data.data : [];
        setAgents(agentsList);

        // Calculate stats
        const totalDeals = agentsList.reduce(
          (sum, a) => sum + (a.totalDeals || 0),
          0
        );
        const completedDeals = agentsList.reduce(
          (sum, a) => sum + (a.completedDeals || 0),
          0
        );
        setStats({ totalDeals, completedDeals });
      }
    } catch (err) {
      console.error("Error fetching agents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentDeals = async (agentId) => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/admin/agent/${agentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const deals = data.success ? data.data : [];
        setAgentDeals(deals);
        setFilteredDeals(deals);
      }
    } catch (err) {
      console.error("Error fetching agent deals:", err);
    }
  };

  // ✅ ADDED: Delete deal function
  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm(`Are you sure you want to permanently delete Deal ID: ${dealId}?\n\nThis will:\n• Remove the deal from the database\n• Delete all associated documents from storage\n• This action cannot be undone!`)) {
      return;
    }

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/${dealId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        alert("✅ Deal deleted successfully!");
        // Refresh the deals list
        if (selectedAgent) {
          fetchAgentDeals(selectedAgent);
        }
        fetchAgents(); // Refresh stats
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(`❌ Failed to delete deal: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
      alert("❌ Error deleting deal. Please try again.");
    }
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
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "32px",
  };

  const statCardStyle = {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    textAlign: "center",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    gap: "24px",
  };

  const agentListStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    overflow: "hidden",
  };

  const agentItemStyle = (isSelected) => ({
    padding: "16px",
    borderBottom: "1px solid #e5e7eb",
    cursor: "pointer",
    backgroundColor: isSelected ? "#f0f9ff" : "white",
    borderLeft: isSelected ? "4px solid #3b82f6" : "4px solid transparent",
    transition: "all 0.2s",
  });

  const dealsContainerStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    border: "1px solid #e5e7eb",
    padding: "24px",
  };

  // ✅ ADDED: Search box style
  const searchBoxStyle = {
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  };

  const searchInputStyle = {
    width: "100%",
    padding: "10px 16px",
    fontSize: "14px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
  };

  if (loading) {
    return (
      <div
        style={{ ...containerStyle, textAlign: "center", paddingTop: "80px" }}
      >
        Loading agents...
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Admin Dashboard</h1>
        <p style={{ color: "#64748b", margin: "0", fontSize: "16px" }}>
          Manage agents and monitor all deals
        </p>
      </div>

      {/* Stats */}
      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>📊</div>
          <div
            style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}
          >
            Total Deals
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b" }}
          >
            {stats.totalDeals || 0}
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
          <div
            style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}
          >
            Completed
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: "700", color: "#10b981" }}
          >
            {stats.completedDeals || 0}
          </div>
        </div>
        <div style={statCardStyle}>
          <div style={{ fontSize: "32px", marginBottom: "8px" }}>👥</div>
          <div
            style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}
          >
            Active Agents
          </div>
          <div
            style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b" }}
          >
            {agents.length}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={gridStyle}>
        {/* Agent List */}
        <div style={agentListStyle}>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e5e7eb",
              fontWeight: "700",
            }}
          >
            Agents ({agents.length})
          </div>
          {agents.map((agent) => (
            <div
              key={agent.agentId}
              style={agentItemStyle(selectedAgent === agent.agentId)}
              onClick={() => setSelectedAgent(agent.agentId)}
            >
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  color: "#1e293b",
                }}
              >
                {agent.agentName}
              </h3>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                <p style={{ margin: "2px 0" }}>Deals: {agent.totalDeals}</p>
                <p style={{ margin: "2px 0" }}>
                  Completed: {agent.completedDeals}
                </p>
                <p style={{ margin: "2px 0" }}>Rate: {agent.conversionRate}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Agent Deals */}
        <div style={dealsContainerStyle}>
          {selectedAgent ? (
            <>
              <h2
                style={{
                  margin: "0 0 16px 0",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                Deals by{" "}
                {agents.find((a) => a.agentId === selectedAgent)?.agentName}
              </h2>

              {/* ✅ ADDED: Search Box */}
              {agentDeals.length > 0 && (
                <div style={searchBoxStyle}>
                  <input
                    type="text"
                    placeholder="🔍 Search by Deal ID, Property, Buyer, or Stage..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={searchInputStyle}
                  />
                  {searchTerm && (
                    <div style={{
                      marginTop: "8px",
                      fontSize: "12px",
                      color: "#64748b"
                    }}>
                      Showing {filteredDeals.length} of {agentDeals.length} deals
                    </div>
                  )}
                </div>
              )}

              {filteredDeals.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {filteredDeals.map((deal) => (
                    <div
                      key={deal.dealId}
                      style={{
                        padding: "12px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        position: "relative",
                      }}
                    >
                      {/* ✅ ADDED: Deal ID Badge */}
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          backgroundColor: "#1e293b",
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "10px",
                          fontWeight: "700",
                        }}
                      >
                        ID: {deal.dealId}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                      >
                        <div style={{ flex: 1, marginRight: "60px" }}>
                          <h4
                            style={{
                              margin: "0 0 4px 0",
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#1e293b",
                            }}
                          >
                            {deal.propertyTitle}
                          </h4>
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              fontSize: "12px",
                              color: "#64748b",
                            }}
                          >
                            Buyer: {deal.buyerName}
                          </p>
                          <p
                            style={{
                              margin: "0",
                              fontSize: "12px",
                              color: "#64748b",
                            }}
                          >
                            Price: ₹
                            {deal.agreedPrice?.toLocaleString("en-IN") || "N/A"}
                          </p>
                        </div>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 8px",
                            backgroundColor: getStageColor(deal.stage),
                            color: "white",
                            fontSize: "11px",
                            fontWeight: "600",
                            borderRadius: "4px",
                          }}
                        >
                          {deal.stage}
                        </span>
                      </div>

                      {/* ✅ ADDED: Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDeal(deal.dealId);
                        }}
                        style={{
                          marginTop: "12px",
                          padding: "8px 16px",
                          backgroundColor: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontWeight: "600",
                          fontSize: "12px",
                          width: "100%",
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                      >
                        🗑️ Delete Deal
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#64748b",
                  }}
                >
                  {searchTerm ? "No deals match your search" : "No deals found"}
                </div>
              )}
            </>
          ) : (
            <div
              style={{ textAlign: "center", padding: "40px", color: "#64748b" }}
            >
              Select an agent to view deals
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;