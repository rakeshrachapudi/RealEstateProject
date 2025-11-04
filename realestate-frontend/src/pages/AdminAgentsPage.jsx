import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { BACKEND_BASE_URL } from "../config/config";

const AdminAgentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDeals, setAgentDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, item: null });
  const [editAgentModal, setEditAgentModal] = useState({ show: false, agent: null });
  const [editAgentFormData, setEditAgentFormData] = useState({});
  const [agentStats, setAgentStats] = useState({ totalDeals: 0, completedDeals: 0, successRate: 0 });

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchAllAgents();
  }, [user, navigate]);

  useEffect(() => {
    if (selectedAgent) {
      fetchAgentDeals(selectedAgent.id);
    }
  }, [selectedAgent]);

  // ==================== FETCH FUNCTIONS ====================

  const fetchAllAgents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/users/agents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const agentsList = data.success
          ? data.data || []
          : Array.isArray(data)
          ? data
          : [];
        setAgents(agentsList);
        if (agentsList.length > 0 && !selectedAgent) {
          setSelectedAgent(agentsList[0]);
        }
      } else {
        console.error("Failed to fetch agents:", response.status);
        setAgents([]);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentDeals = async (agentId) => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/admin/agent/${agentId}?userId=${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const deals = data.success
          ? data.data || []
          : Array.isArray(data)
          ? data
          : [];
        setAgentDeals(deals);
        calculateAgentStats(deals);
      } else {
        console.error("Failed to fetch deals:", response.status);
        setAgentDeals([]);
        setAgentStats({ totalDeals: 0, completedDeals: 0, successRate: 0 });
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      setAgentDeals([]);
      setAgentStats({ totalDeals: 0, completedDeals: 0, successRate: 0 });
    }
  };

  const calculateAgentStats = (deals) => {
    if (!deals || deals.length === 0) {
      setAgentStats({ totalDeals: 0, completedDeals: 0, successRate: 0 });
      return;
    }

    const totalDeals = deals.length;
    const completedDeals = deals.filter(
      (deal) => (deal.stage || deal.currentStage) === "COMPLETED"
    ).length;
    const successRate = ((completedDeals / totalDeals) * 100).toFixed(0);

    setAgentStats({ totalDeals, completedDeals, successRate });
  };

  // ==================== DELETE FUNCTIONS ====================

  const handleDeleteAgent = async (agentId) => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/users/${agentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        showSuccessMessage("Agent deleted successfully (cascade delete applied)");
        setSelectedAgent(null);
        setAgentDeals([]);
        setAgentStats({ totalDeals: 0, completedDeals: 0, successRate: 0 });
        fetchAllAgents();
      } else {
        showErrorMessage("Failed to delete agent");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      showErrorMessage("Error deleting agent");
    }

    closeDeleteModal();
  };

  const handleDeleteDeal = async (dealId) => {
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
        showSuccessMessage("Deal deleted successfully");
        fetchAgentDeals(selectedAgent.id);
      } else {
        showErrorMessage("Failed to delete deal");
      }
    } catch (err) {
      console.error("Error deleting deal:", err);
      showErrorMessage("Error deleting deal");
    }

    closeDeleteModal();
  };

  // ==================== EDIT FUNCTIONS ====================

  const handleEditAgent = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/users/${editAgentFormData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(editAgentFormData),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        const updatedAgent = updated.data || editAgentFormData;
        const newAgents = agents.map((a) =>
          a.id === editAgentFormData.id ? updatedAgent : a
        );
        setAgents(newAgents);
        setSelectedAgent(updatedAgent);
        closeEditAgentModal();
        showSuccessMessage("Agent updated successfully!");
      } else {
        showErrorMessage("Failed to update agent");
      }
    } catch (error) {
      console.error("Error updating agent:", error);
      showErrorMessage("Error updating agent");
    }
  };

  const openEditAgentModal = (agent) => {
    setEditAgentFormData({ ...agent });
    setEditAgentModal({ show: true, agent });
  };

  const closeEditAgentModal = () => {
    setEditAgentModal({ show: false, agent: null });
    setEditAgentFormData({});
  };

  const handleEditAgentFormChange = (field, value) => {
    setEditAgentFormData(prev => ({ ...prev, [field]: value }));
  };

  // ==================== MODAL FUNCTIONS ====================

  const openDeleteModal = (type, item) => {
    setDeleteModal({ show: true, type, item });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, type: null, item: null });
  };

  const confirmDelete = () => {
    const { type, item } = deleteModal;

    if (type === "agent") {
      handleDeleteAgent(item.id);
    } else if (type === "deal") {
      handleDeleteDeal(item.dealId);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const showSuccessMessage = (message) => {
    alert(message);
  };

  const showErrorMessage = (message) => {
    alert(message);
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
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  // ==================== FILTER FUNCTIONS ====================

  const filteredAgents = agents.filter(agent => {
    return (
      agent.id?.toString().includes(searchQuery) ||
      agent.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.mobileNumber?.includes(searchQuery)
    );
  });

  // ==================== STYLES ====================

  const styles = {
    container: {
      maxWidth: "1800px",
      margin: "0 auto",
      padding: "24px 32px",
      backgroundColor: "#f9fafb",
      minHeight: "100vh",
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
      margin: "0 0 8px 0",
    },
    subtitle: {
      color: "#64748b",
      margin: "0",
      fontSize: "16px",
    },
    controls: {
      marginBottom: "24px",
    },
    searchInput: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "14px",
      fontFamily: "inherit",
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "350px 1fr",
      gap: "24px",
      alignItems: "start",
    },
    agentList: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
      maxHeight: "calc(100vh - 240px)",
      overflowY: "auto",
    },
    agentListHeader: {
      padding: "16px",
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e5e7eb",
      fontWeight: "700",
      position: "sticky",
      top: 0,
      zIndex: 1,
    },
    agentItem: (isSelected) => ({
      padding: "14px 16px",
      borderBottom: "1px solid #e5e7eb",
      cursor: "pointer",
      backgroundColor: isSelected ? "#f0f9ff" : "white",
      borderLeft: isSelected ? "4px solid #3b82f6" : "4px solid transparent",
      transition: "all 0.2s",
    }),
    agentItemName: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "4px",
    },
    agentItemEmail: {
      fontSize: "12px",
      color: "#64748b",
      marginBottom: "8px",
    },
    agentItemMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "11px",
      color: "#94a3b8",
    },
    roleBadge: {
      display: "inline-block",
      padding: "2px 6px",
      backgroundColor: "#10b981",
      color: "white",
      borderRadius: "4px",
      fontSize: "10px",
      fontWeight: "700",
    },
    rightPanel: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
      padding: "24px",
      maxHeight: "calc(100vh - 240px)",
      overflowY: "auto",
    },
    tabs: {
      display: "flex",
      gap: "8px",
      marginBottom: "24px",
      borderBottom: "2px solid #e5e7eb",
      paddingBottom: "12px",
    },
    tab: (isActive) => ({
      padding: "8px 16px",
      backgroundColor: "transparent",
      color: isActive ? "#3b82f6" : "#64748b",
      border: "none",
      borderBottom: isActive ? "2px solid #3b82f6" : "2px solid transparent",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "all 0.2s",
      marginBottom: "-14px",
    }),
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "12px",
      marginBottom: "24px",
    },
    statCard: {
      padding: "16px",
      backgroundColor: "#f8fafc",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      textAlign: "center",
    },
    statValue: {
      fontSize: "28px",
      fontWeight: "800",
      color: "#1e293b",
      marginBottom: "4px",
    },
    statLabel: {
      fontSize: "11px",
      color: "#64748b",
      fontWeight: "600",
      textTransform: "uppercase",
    },
    detailsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },
    detailCard: {
      padding: "12px",
      backgroundColor: "#f8fafc",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
    },
    detailLabel: {
      fontSize: "11px",
      color: "#64748b",
      marginBottom: "4px",
      fontWeight: "600",
      textTransform: "uppercase",
    },
    detailValue: {
      fontSize: "14px",
      color: "#1e293b",
      fontWeight: "600",
    },
    actionButtons: {
      display: "flex",
      gap: "12px",
      marginTop: "16px",
      flexWrap: "wrap",
    },
    editBtn: {
      padding: "10px 20px",
      backgroundColor: "#3b82f6",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "background 0.2s",
    },
    deleteBtn: {
      padding: "10px 20px",
      backgroundColor: "#ef4444",
      color: "white",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "background 0.2s",
    },
    iconBtn: (color) => {
      const colors = {
        red: { bg: "#fee2e2", hover: "#fecaca", text: "#dc2626" },
        blue: { bg: "#dbeafe", hover: "#bfdbfe", text: "#1e40af" },
      };
      const c = colors[color] || colors.blue;
      return {
        padding: "8px 12px",
        backgroundColor: c.bg,
        color: c.text,
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "12px",
        fontWeight: "600",
        transition: "background 0.2s",
      };
    },
    dealsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "16px",
    },
    dealCard: {
      padding: "16px",
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
    },
    dealContent: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    dealTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "8px",
    },
    dealInfo: {
      fontSize: "13px",
      color: "#64748b",
      marginBottom: "4px",
    },
    stageBadge: (stage) => ({
      display: "inline-block",
      padding: "4px 8px",
      backgroundColor: getStageColor(stage),
      color: "white",
      borderRadius: "4px",
      fontSize: "11px",
      fontWeight: "700",
    }),
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#64748b",
    },
    emptyIcon: {
      fontSize: "64px",
      marginBottom: "16px",
    },
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      maxWidth: "500px",
      width: "90%",
      maxHeight: "90vh",
      overflowY: "auto",
    },
    modalTitle: {
      fontSize: "22px",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "16px",
    },
    modalText: {
      fontSize: "14px",
      color: "#64748b",
      lineHeight: "1.6",
      marginBottom: "8px",
    },
    modalButtons: {
      display: "flex",
      gap: "12px",
      marginTop: "24px",
    },
    modalBtn: (variant) => {
      const variants = {
        cancel: { bg: "#e2e8f0", color: "#1e293b", hover: "#cbd5e1" },
        danger: { bg: "#ef4444", color: "white", hover: "#dc2626" },
        primary: { bg: "#3b82f6", color: "white", hover: "#2563eb" },
      };
      const v = variants[variant] || variants.cancel;
      return {
        flex: 1,
        padding: "10px 16px",
        backgroundColor: v.bg,
        color: v.color,
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "600",
        transition: "background 0.2s",
      };
    },
    formGroup: {
      marginBottom: "16px",
    },
    formLabel: {
      display: "block",
      fontSize: "13px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "6px",
    },
    formInput: {
      width: "100%",
      padding: "10px 12px",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      fontSize: "14px",
      fontFamily: "inherit",
      boxSizing: "border-box",
    },
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: "center", paddingTop: "80px" }}>
        ⏳ Loading agents...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Agent Management</h1>
        <p style={styles.subtitle}>
          Manage all agents - view, edit, and monitor agent performance
        </p>
      </div>

      {/* CONTROLS */}
      <div style={styles.controls}>
        <input
          type="text"
          style={styles.searchInput}
          placeholder="🔍 Search by ID, name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* MAIN GRID */}
      <div style={styles.mainGrid}>
        {/* AGENT LIST */}
        <div style={styles.agentList}>
          <div style={styles.agentListHeader}>
            Agents ({filteredAgents.length})
          </div>
          {filteredAgents.length === 0 ? (
            <div style={styles.emptyState}>
              <p>🔍 No agents found</p>
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <div
                key={agent.id}
                style={styles.agentItem(selectedAgent?.id === agent.id)}
                onClick={() => setSelectedAgent(agent)}
              >
                <div style={styles.agentItemName}>
                  {agent.firstName} {agent.lastName}
                </div>
                <div style={styles.agentItemEmail}>{agent.email}</div>
                <div style={styles.agentItemMeta}>
                  <span style={styles.roleBadge}>AGENT</span>
                  <span>ID: {agent.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT PANEL */}
        <div style={styles.rightPanel}>
          {selectedAgent ? (
            <>
              {/* TABS */}
              <div style={styles.tabs}>
                <button
                  style={styles.tab(activeTab === "details")}
                  onClick={() => setActiveTab("details")}
                >
                  📋 Details
                </button>
                <button
                  style={styles.tab(activeTab === "deals")}
                  onClick={() => setActiveTab("deals")}
                >
                  💼 Deals ({agentDeals.length})
                </button>
                <button
                  style={styles.tab(activeTab === "performance")}
                  onClick={() => setActiveTab("performance")}
                >
                  📊 Performance
                </button>
              </div>

              {/* CONTENT */}
              <div>
                {/* DETAILS TAB */}
                {activeTab === "details" && (
                  <>
                    <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "16px" }}>
                      Agent Details
                    </h2>

                    <div style={styles.detailsGrid}>
                      <div style={styles.detailCard}>
                        <div style={styles.detailLabel}>Agent ID</div>
                        <div style={styles.detailValue}>{selectedAgent.id}</div>
                      </div>
                      <div style={styles.detailCard}>
                        <div style={styles.detailLabel}>Full Name</div>
                        <div style={styles.detailValue}>
                          {selectedAgent.firstName} {selectedAgent.lastName}
                        </div>
                      </div>
                      <div style={styles.detailCard}>
                        <div style={styles.detailLabel}>Email</div>
                        <div style={styles.detailValue}>{selectedAgent.email}</div>
                      </div>
                      <div style={styles.detailCard}>
                        <div style={styles.detailLabel}>Mobile</div>
                        <div style={styles.detailValue}>
                          {selectedAgent.mobileNumber || "N/A"}
                        </div>
                      </div>
                      <div style={styles.detailCard}>
                        <div style={styles.detailLabel}>Role</div>
                        <div style={styles.detailValue}>
                          <span style={styles.roleBadge}>AGENT</span>
                        </div>
                      </div>
                      <div style={styles.detailCard}>
                        <div style={styles.detailLabel}>Joined Date</div>
                        <div style={styles.detailValue}>
                          {new Date(selectedAgent.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {selectedAgent.addressLine1 && (
                      <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                        <div style={styles.detailLabel}>Address</div>
                        <div style={{ fontSize: "14px", color: "#1e293b", marginTop: "8px" }}>
                          {selectedAgent.addressLine1}
                          {selectedAgent.addressLine2 && <><br />{selectedAgent.addressLine2}</>}
                          <br />
                          {selectedAgent.city}, {selectedAgent.state} - {selectedAgent.pincode}
                        </div>
                      </div>
                    )}

                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => openEditAgentModal(selectedAgent)}
                        style={styles.editBtn}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#2563eb"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#3b82f6"}
                      >
                        ✏️ Edit Agent
                      </button>
                      <button
                        onClick={() => openDeleteModal("agent", selectedAgent)}
                        style={styles.deleteBtn}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                      >
                        🗑️ Delete Agent
                      </button>
                    </div>
                    <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                      ⚠️ Deleting an agent will affect all their associated deals
                    </p>
                  </>
                )}

                {/* DEALS TAB */}
                {activeTab === "deals" && (
                  <>
                    <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
                      Deals Handled by {selectedAgent.firstName}
                    </h2>

                    {agentDeals.length === 0 ? (
                      <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📭</div>
                        <p>No deals found</p>
                      </div>
                    ) : (
                      <div style={styles.dealsGrid}>
                        {agentDeals.map((deal) => (
                          <div key={deal.dealId} style={styles.dealCard}>
                            <div style={styles.dealContent}>
                              <h3 style={styles.dealTitle}>
                                {deal.propertyTitle}
                              </h3>

                              <div style={styles.dealInfo}>
                                <strong>Stage:</strong>{" "}
                                <span style={styles.stageBadge(deal.stage || deal.currentStage)}>
                                  {deal.stage || deal.currentStage}
                                </span>
                              </div>

                              {deal.agreedPrice && (
                                <div style={styles.dealInfo}>
                                  <strong>Agreed Price:</strong> {formatPrice(deal.agreedPrice)}
                                </div>
                              )}

                              <div style={styles.dealInfo}>
                                <strong>Buyer:</strong> {deal.buyerName}
                              </div>

                              <div style={styles.dealInfo}>
                                <strong>Created:</strong>{" "}
                                {new Date(deal.createdAt).toLocaleDateString()}
                              </div>

                              <div style={styles.actionButtons}>
                                <button
                                  onClick={() => openDeleteModal("deal", deal)}
                                  style={styles.iconBtn("red")}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = "#fecaca"}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = "#fee2e2"}
                                >
                                  🗑️ Delete Deal
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* PERFORMANCE TAB */}
                {activeTab === "performance" && (
                  <>
                    <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
                      Performance Metrics for {selectedAgent.firstName}
                    </h2>

                    <div style={styles.statsGrid}>
                      <div style={styles.statCard}>
                        <div style={{ fontSize: "32px", marginBottom: "8px" }}>📊</div>
                        <div style={styles.statValue}>{agentStats.totalDeals}</div>
                        <div style={styles.statLabel}>Total Deals</div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
                        <div style={{ ...styles.statValue, color: "#10b981" }}>
                          {agentStats.completedDeals}
                        </div>
                        <div style={styles.statLabel}>Completed</div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={{ fontSize: "32px", marginBottom: "8px" }}>🎯</div>
                        <div style={{ ...styles.statValue, color: "#3b82f6" }}>
                          {agentStats.successRate}%
                        </div>
                        <div style={styles.statLabel}>Success Rate</div>
                      </div>
                    </div>

                    <div style={{ marginTop: "24px", padding: "20px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px" }}>
                        📈 Performance Summary
                      </h3>
                      <p style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.6" }}>
                        <strong>{selectedAgent.firstName}</strong> has handled a total of{" "}
                        <strong>{agentStats.totalDeals}</strong> deals, with{" "}
                        <strong>{agentStats.completedDeals}</strong> successfully completed.
                        This represents a success rate of{" "}
                        <strong>{agentStats.successRate}%</strong>.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👆</div>
              <p>Select an agent to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div style={styles.modal} onClick={closeDeleteModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              ⚠️ Confirm Delete
            </h2>
            <p style={styles.modalText}>
              {deleteModal.type === "agent" && (
                <>
                  Are you sure you want to delete agent <strong>{deleteModal.item.firstName} {deleteModal.item.lastName}</strong>?
                  <br /><br />
                  This action will remove the agent from the system and may affect their associated deals.
                </>
              )}
              {deleteModal.type === "deal" && (
                <>
                  Are you sure you want to delete this deal for <strong>{deleteModal.item.propertyTitle}</strong>?
                </>
              )}
            </p>
            <div style={styles.modalButtons}>
              <button
                onClick={closeDeleteModal}
                style={styles.modalBtn("cancel")}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={styles.modalBtn("danger")}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editAgentModal.show && (
        <div style={styles.modal} onClick={closeEditAgentModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>✏️ Edit Agent</h3>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>First Name</label>
              <input
                type="text"
                style={styles.formInput}
                value={editAgentFormData.firstName || ""}
                onChange={(e) => handleEditAgentFormChange("firstName", e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Last Name</label>
              <input
                type="text"
                style={styles.formInput}
                value={editAgentFormData.lastName || ""}
                onChange={(e) => handleEditAgentFormChange("lastName", e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Email</label>
              <input
                type="email"
                style={styles.formInput}
                value={editAgentFormData.email || ""}
                onChange={(e) => handleEditAgentFormChange("email", e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Mobile Number</label>
              <input
                type="tel"
                style={styles.formInput}
                value={editAgentFormData.mobileNumber || ""}
                onChange={(e) => handleEditAgentFormChange("mobileNumber", e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Address Line 1</label>
              <input
                type="text"
                style={styles.formInput}
                value={editAgentFormData.addressLine1 || ""}
                onChange={(e) => handleEditAgentFormChange("addressLine1", e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Address Line 2</label>
              <input
                type="text"
                style={styles.formInput}
                value={editAgentFormData.addressLine2 || ""}
                onChange={(e) => handleEditAgentFormChange("addressLine2", e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>City</label>
              <input
                type="text"
                style={styles.formInput}
                value={editAgentFormData.city || ""}
                onChange={(e) => handleEditAgentFormChange("city", e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>State</label>
              <input
                type="text"
                style={styles.formInput}
                value={editAgentFormData.state || ""}
                onChange={(e) => handleEditAgentFormChange("state", e.target.value)}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Pin Code</label>
              <input
                type="text"
                style={styles.formInput}
                value={editAgentFormData.pincode || ""}
                onChange={(e) => handleEditAgentFormChange("pincode", e.target.value)}
              />
            </div>

            <div style={styles.modalButtons}>
              <button
                style={styles.modalBtn("cancel")}
                onClick={closeEditAgentModal}
              >
                Cancel
              </button>
              <button
                style={styles.modalBtn("primary")}
                onClick={handleEditAgent}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#2563eb"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#3b82f6"}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAgentsPage;