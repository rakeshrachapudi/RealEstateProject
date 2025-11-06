import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { BACKEND_BASE_URL } from "../config/config";
import "./AdminAgentsPage.css";

const AdminAgentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDeals, setAgentDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("details");
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    type: null,
    item: null,
  });
  const [editAgentModal, setEditAgentModal] = useState({
    show: false,
    agent: null,
  });
  const [editAgentFormData, setEditAgentFormData] = useState({});
  const [agentStats, setAgentStats] = useState({
    totalDeals: 0,
    completedDeals: 0,
    successRate: 0,
  });

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
      const response = await fetch(`${BACKEND_BASE_URL}/api/users/${agentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        showSuccessMessage(
          "Agent deleted successfully (cascade delete applied)"
        );
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
      const response = await fetch(`${BACKEND_BASE_URL}/api/deals/${dealId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

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
    setEditAgentFormData((prev) => ({ ...prev, [field]: value }));
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

  const filteredAgents = agents.filter((agent) => {
    return (
      agent.id?.toString().includes(searchQuery) ||
      agent.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.mobileNumber?.includes(searchQuery)
    );
  });

  if (loading) {
    return (
      <div className="aap-container">
        <div className="aap-loading">⏳ Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="aap-container">
      {/* HEADER */}
      <div className="aap-header">
        <h1 className="aap-title">👥 Agent Management</h1>
        <p className="aap-subtitle">
          Manage all agents - view, edit, and monitor agent performance
        </p>
      </div>

      {/* CONTROLS */}
      <div className="aap-controls">
        <input
          type="text"
          className="aap-search-input"
          placeholder="🔍 Search by ID, name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* MAIN GRID */}
      <div className="aap-main-grid">
        {/* AGENT LIST */}
        <div className="aap-agent-list">
          <div className="aap-agent-list-header">
            Agents ({filteredAgents.length})
          </div>
          {filteredAgents.length === 0 ? (
            <div className="aap-empty-state">
              <p>🔍 No agents found</p>
            </div>
          ) : (
            filteredAgents.map((agent) => (
              <div
                key={agent.id}
                className={`aap-agent-item ${
                  selectedAgent?.id === agent.id ? "selected" : ""
                }`}
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="aap-agent-item-name">
                  {agent.firstName} {agent.lastName}
                </div>
                <div className="aap-agent-item-email">{agent.email}</div>
                <div className="aap-agent-item-meta">
                  <span className="aap-role-badge">AGENT</span>
                  <span>ID: {agent.id}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT PANEL */}
        <div className="aap-right-panel">
          {selectedAgent ? (
            <>
              {/* TABS */}
              <div className="aap-tabs">
                <button
                  className={`aap-tab ${
                    activeTab === "details" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("details")}
                >
                  📋 Details
                </button>
                <button
                  className={`aap-tab ${activeTab === "deals" ? "active" : ""}`}
                  onClick={() => setActiveTab("deals")}
                >
                  💼 Deals ({agentDeals.length})
                </button>
                <button
                  className={`aap-tab ${
                    activeTab === "performance" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("performance")}
                >
                  📊 Performance
                </button>
              </div>

              {/* CONTENT */}
              <div className="aap-tab-content">
                {/* DETAILS TAB */}
                {activeTab === "details" && (
                  <>
                    <h2 className="aap-section-title">Agent Details</h2>

                    <div className="aap-details-grid">
                      <div className="aap-detail-card">
                        <div className="aap-detail-label">Agent ID</div>
                        <div className="aap-detail-value">
                          {selectedAgent.id}
                        </div>
                      </div>
                      <div className="aap-detail-card">
                        <div className="aap-detail-label">Full Name</div>
                        <div className="aap-detail-value">
                          {selectedAgent.firstName} {selectedAgent.lastName}
                        </div>
                      </div>
                      <div className="aap-detail-card">
                        <div className="aap-detail-label">Email</div>
                        <div className="aap-detail-value">
                          {selectedAgent.email}
                        </div>
                      </div>
                      <div className="aap-detail-card">
                        <div className="aap-detail-label">Mobile</div>
                        <div className="aap-detail-value">
                          {selectedAgent.mobileNumber || "N/A"}
                        </div>
                      </div>
                      <div className="aap-detail-card">
                        <div className="aap-detail-label">Role</div>
                        <div className="aap-detail-value">
                          <span className="aap-role-badge">AGENT</span>
                        </div>
                      </div>
                      <div className="aap-detail-card">
                        <div className="aap-detail-label">Joined Date</div>
                        <div className="aap-detail-value">
                          {new Date(
                            selectedAgent.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {selectedAgent.addressLine1 && (
                      <div className="aap-address-card">
                        <div className="aap-detail-label">Address</div>
                        <div className="aap-address-text">
                          {selectedAgent.addressLine1}
                          {selectedAgent.addressLine2 && (
                            <>
                              <br />
                              {selectedAgent.addressLine2}
                            </>
                          )}
                          <br />
                          {selectedAgent.city}, {selectedAgent.state} -{" "}
                          {selectedAgent.pincode}
                        </div>
                      </div>
                    )}

                    <div className="aap-action-buttons">
                      <button
                        onClick={() => openEditAgentModal(selectedAgent)}
                        className="aap-edit-btn"
                      >
                        ✏️ Edit Agent
                      </button>
                      <button
                        onClick={() => openDeleteModal("agent", selectedAgent)}
                        className="aap-delete-btn"
                      >
                        🗑️ Delete Agent
                      </button>
                    </div>
                    <p className="aap-warning-text">
                      ⚠️ Deleting an agent will affect all their associated
                      deals
                    </p>
                  </>
                )}

                {/* DEALS TAB */}
                {activeTab === "deals" && (
                  <>
                    <h2 className="aap-section-title">
                      Deals Handled by {selectedAgent.firstName}
                    </h2>

                    {agentDeals.length === 0 ? (
                      <div className="aap-empty-state">
                        <div className="aap-empty-icon">📭</div>
                        <p>No deals found</p>
                      </div>
                    ) : (
                      <div className="aap-deals-grid">
                        {agentDeals.map((deal) => (
                          <div key={deal.dealId} className="aap-deal-card">
                            <h3 className="aap-deal-title">
                              {deal.propertyTitle}
                            </h3>

                            <div className="aap-deal-info">
                              <strong>Stage:</strong>{" "}
                              <span
                                className="aap-stage-badge"
                                style={{
                                  backgroundColor: getStageColor(
                                    deal.stage || deal.currentStage
                                  ),
                                }}
                              >
                                {deal.stage || deal.currentStage}
                              </span>
                            </div>

                            {deal.agreedPrice && (
                              <div className="aap-deal-info">
                                <strong>Agreed Price:</strong>{" "}
                                {formatPrice(deal.agreedPrice)}
                              </div>
                            )}

                            <div className="aap-deal-info">
                              <strong>Buyer:</strong> {deal.buyerName}
                            </div>

                            <div className="aap-deal-info">
                              <strong>Created:</strong>{" "}
                              {new Date(deal.createdAt).toLocaleDateString()}
                            </div>

                            <div className="aap-deal-actions">
                              <button
                                onClick={() => openDeleteModal("deal", deal)}
                                className="aap-icon-btn aap-icon-btn-red"
                              >
                                🗑️ Delete Deal
                              </button>
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
                    <h2 className="aap-section-title">
                      Performance Metrics for {selectedAgent.firstName}
                    </h2>

                    <div className="aap-stats-grid">
                      <div className="aap-stat-card">
                        <div className="aap-stat-icon">📊</div>
                        <div className="aap-stat-value">
                          {agentStats.totalDeals}
                        </div>
                        <div className="aap-stat-label">Total Deals</div>
                      </div>
                      <div className="aap-stat-card">
                        <div className="aap-stat-icon">✅</div>
                        <div className="aap-stat-value aap-stat-success">
                          {agentStats.completedDeals}
                        </div>
                        <div className="aap-stat-label">Completed</div>
                      </div>
                      <div className="aap-stat-card">
                        <div className="aap-stat-icon">🎯</div>
                        <div className="aap-stat-value aap-stat-primary">
                          {agentStats.successRate}%
                        </div>
                        <div className="aap-stat-label">Success Rate</div>
                      </div>
                    </div>

                    <div className="aap-performance-summary">
                      <h3 className="aap-summary-title">
                        📈 Performance Summary
                      </h3>
                      <p className="aap-summary-text">
                        <strong>{selectedAgent.firstName}</strong> has handled a
                        total of <strong>{agentStats.totalDeals}</strong> deals,
                        with <strong>{agentStats.completedDeals}</strong>{" "}
                        successfully completed. This represents a success rate
                        of <strong>{agentStats.successRate}%</strong>.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="aap-empty-state">
              <div className="aap-empty-icon">👆</div>
              <p>Select an agent to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="aap-modal" onClick={closeDeleteModal}>
          <div
            className="aap-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="aap-modal-title">⚠️ Confirm Delete</h2>
            <p className="aap-modal-text">
              {deleteModal.type === "agent" && (
                <>
                  Are you sure you want to delete agent{" "}
                  <strong>
                    {deleteModal.item.firstName} {deleteModal.item.lastName}
                  </strong>
                  ?
                  <br />
                  <br />
                  This action will remove the agent from the system and may
                  affect their associated deals.
                </>
              )}
              {deleteModal.type === "deal" && (
                <>
                  Are you sure you want to delete this deal for{" "}
                  <strong>{deleteModal.item.propertyTitle}</strong>?
                </>
              )}
            </p>
            <div className="aap-modal-buttons">
              <button
                onClick={closeDeleteModal}
                className="aap-modal-btn aap-modal-btn-cancel"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="aap-modal-btn aap-modal-btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editAgentModal.show && (
        <div className="aap-modal" onClick={closeEditAgentModal}>
          <div
            className="aap-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="aap-modal-title">✏️ Edit Agent</h3>

            <div className="aap-form-group">
              <label className="aap-form-label">First Name</label>
              <input
                type="text"
                className="aap-form-input"
                value={editAgentFormData.firstName || ""}
                onChange={(e) =>
                  handleEditAgentFormChange("firstName", e.target.value)
                }
              />
            </div>

            <div className="aap-form-group">
              <label className="aap-form-label">Last Name</label>
              <input
                type="text"
                className="aap-form-input"
                value={editAgentFormData.lastName || ""}
                onChange={(e) =>
                  handleEditAgentFormChange("lastName", e.target.value)
                }
              />
            </div>

            <div className="aap-form-group">
              <label className="aap-form-label">Email</label>
              <input
                type="email"
                className="aap-form-input"
                value={editAgentFormData.email || ""}
                onChange={(e) =>
                  handleEditAgentFormChange("email", e.target.value)
                }
              />
            </div>

            <div className="aap-form-group">
              <label className="aap-form-label">Mobile Number</label>
              <input
                type="tel"
                className="aap-form-input"
                value={editAgentFormData.mobileNumber || ""}
                onChange={(e) =>
                  handleEditAgentFormChange("mobileNumber", e.target.value)
                }
              />
            </div>

            <div className="aap-form-group">
              <label className="aap-form-label">Address Line 1</label>
              <input
                type="text"
                className="aap-form-input"
                value={editAgentFormData.addressLine1 || ""}
                onChange={(e) =>
                  handleEditAgentFormChange("addressLine1", e.target.value)
                }
              />
            </div>

            <div className="aap-form-group">
              <label className="aap-form-label">Address Line 2</label>
              <input
                type="text"
                className="aap-form-input"
                value={editAgentFormData.addressLine2 || ""}
                onChange={(e) =>
                  handleEditAgentFormChange("addressLine2", e.target.value)
                }
              />
            </div>

            <div className="aap-form-group">
              <label className="aap-form-label">City</label>
              <input
                type="text"
                className="aap-form-input"
                value={editAgentFormData.city || ""}
                onChange={(e) =>
                  handleEditAgentFormChange("city", e.target.value)
                }
              />
            </div>

            <div className="aap-form-group">
              <label className="aap-form-label">State</label>
              <input
                type="text"
                className="aap-form-input"
                value={editAgentFormData.state || ""}
                onChange={(e) =>
                  handleEditAgentFormChange("state", e.target.value)
                }
              />
            </div>

            <div className="aap-form-group">
              <label className="aap-form-label">Pin Code</label>
              <input
                type="text"
                className="aap-form-input"
                value={editAgentFormData.pincode || ""}
                onChange={(e) =>
                  handleEditAgentFormChange("pincode", e.target.value)
                }
              />
            </div>

            <div className="aap-modal-buttons">
              <button
                className="aap-modal-btn aap-modal-btn-cancel"
                onClick={closeEditAgentModal}
              >
                Cancel
              </button>
              <button
                className="aap-modal-btn aap-modal-btn-primary"
                onClick={handleEditAgent}
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
