import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { BACKEND_BASE_URL } from "../config/config";

const AdminAgentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDeals, setAgentDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [editingAgent, setEditingAgent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchAllAgents();
  }, [user, navigate]);

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
        filterAgents(agentsList, searchTerm);
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
    setDealsLoading(true);
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
      } else {
        console.error("Failed to fetch deals:", response.status);
        setAgentDeals([]);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      setAgentDeals([]);
    } finally {
      setDealsLoading(false);
    }
  };

  const filterAgents = (agentList, search) => {
    let filtered = agentList;

    if (search) {
      filtered = filtered.filter(
        (a) =>
          a.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          a.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          a.email?.toLowerCase().includes(search.toLowerCase()) ||
          a.mobileNumber?.includes(search)
      );
    }

    setFilteredAgents(filtered);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterAgents(agents, value);
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    fetchAgentDeals(agent.id);
  };

  const handleEditAgent = (agentToEdit) => {
    setEditingAgent({ ...agentToEdit });
    setShowEditModal(true);
  };

  const handleSaveAgent = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/users/${editingAgent.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(editingAgent),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        const updatedAgent = updated.data || editingAgent;
        setAgents(
          agents.map((a) => (a.id === editingAgent.id ? updatedAgent : a))
        );
        filterAgents(
          agents.map((a) => (a.id === editingAgent.id ? updatedAgent : a)),
          searchTerm
        );
        setSelectedAgent(updatedAgent);
        setShowEditModal(false);
        setEditingAgent(null);
        alert("Agent updated successfully!");
      } else {
        alert("Failed to update agent");
      }
    } catch (error) {
      console.error("Error updating agent:", error);
      alert("Error updating agent");
    }
  };

  const handleDeleteAgent = async (agentId) => {
    if (window.confirm("Are you sure you want to delete this agent?")) {
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
          setAgents(agents.filter((a) => a.id !== agentId));
          filterAgents(
            agents.filter((a) => a.id !== agentId),
            searchTerm
          );
          setSelectedAgent(null);
          setAgentDeals([]);
          alert("Agent deleted successfully!");
        } else {
          alert("Failed to delete agent");
        }
      } catch (error) {
        console.error("Error deleting agent:", error);
        alert("Error deleting agent");
      }
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Loading agents...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👥 Agent Management</h1>
        <p style={styles.subtitle}>
          Manage all agents - view, edit, and modify agent details and their
          deals
        </p>
      </div>

      <div style={styles.controlsSection}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.agentsList}>
          <div style={styles.agentsHeader}>
            <h3>Agents ({filteredAgents.length})</h3>
          </div>

          {filteredAgents.length === 0 ? (
            <div style={styles.emptyState}>
              <p>🔍 No agents found</p>
            </div>
          ) : (
            <div style={styles.agentsGrid}>
              {filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  style={{
                    ...styles.agentCard,
                    backgroundColor:
                      selectedAgent?.id === agent.id ? "#dbeafe" : "white",
                    borderColor:
                      selectedAgent?.id === agent.id ? "#3b82f6" : "#e2e8f0",
                  }}
                  onClick={() => handleSelectAgent(agent)}
                >
                  <div style={styles.agentCardHeader}>
                    <div>
                      <h4 style={styles.agentName}>
                        {agent.firstName} {agent.lastName}
                      </h4>
                      <p style={styles.agentEmail}>{agent.email}</p>
                    </div>
                    <span style={styles.roleBadge}>AGENT</span>
                  </div>
                  <div style={styles.agentInfo}>
                    <p>📱 {agent.mobileNumber || "N/A"}</p>
                    <p>📅 {new Date(agent.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.rightPanel}>
          {selectedAgent ? (
            <>
              <div style={styles.detailsCard}>
                <h2 style={styles.detailsTitle}>Agent Details</h2>
                <div style={styles.detailsGrid}>
                  <div>
                    <p style={styles.label}>First Name</p>
                    <p style={styles.value}>{selectedAgent.firstName}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Last Name</p>
                    <p style={styles.value}>{selectedAgent.lastName}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Email</p>
                    <p style={styles.value}>{selectedAgent.email}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Phone</p>
                    <p style={styles.value}>
                      {selectedAgent.mobileNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p style={styles.label}>Username</p>
                    <p style={styles.value}>
                      {selectedAgent.username || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p style={styles.label}>Member Since</p>
                    <p style={styles.value}>
                      {new Date(selectedAgent.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedAgent.address && (
                  <div style={styles.addressSection}>
                    <p style={styles.label}>Address</p>
                    <p style={styles.value}>{selectedAgent.address}</p>
                  </div>
                )}

                <div style={styles.statusSection}>
                  <p style={styles.label}>Status</p>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor: selectedAgent.isActive
                        ? "#10b981"
                        : "#ef4444",
                    }}
                  >
                    {selectedAgent.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div style={styles.actionButtons}>
                  <button
                    onClick={() => handleEditAgent(selectedAgent)}
                    style={styles.editBtn}
                  >
                    ✏️ Edit Agent
                  </button>
                  <button
                    onClick={() => handleDeleteAgent(selectedAgent.id)}
                    style={styles.deleteBtn}
                  >
                    🗑️ Delete Agent
                  </button>
                </div>
              </div>

              <div style={styles.dealsSection}>
                <h3 style={styles.dealsTitle}>
                  Deals by {selectedAgent.firstName} ({agentDeals.length})
                </h3>

                {dealsLoading ? (
                  <div style={styles.loading}>⏳ Loading deals...</div>
                ) : agentDeals.length === 0 ? (
                  <div style={styles.emptyDeals}>
                    <p>No deals created by this agent</p>
                  </div>
                ) : (
                  <div style={styles.dealsGrid}>
                    {agentDeals.map((deal) => (
                      <div
                        key={deal.id || deal.dealId}
                        style={styles.dealCard}
                        onClick={() => setSelectedDeal(deal)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 8px 16px rgba(0,0,0,0.15)";
                          e.currentTarget.style.transform = "translateY(-4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 1px 3px rgba(0,0,0,0.05)";
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        <div
                          style={{
                            ...styles.dealStageBadge,
                            backgroundColor: getStageColor(
                              deal.stage || deal.currentStage
                            ),
                          }}
                        >
                          {deal.stage || deal.currentStage}
                        </div>

                        <h4 style={styles.dealTitle}>
                          {deal.property?.title || deal.propertyTitle}
                        </h4>

                        {deal.property?.city && (
                          <p style={styles.dealMeta}>📍 {deal.property.city}</p>
                        )}

                        {deal.buyer && (
                          <p style={styles.dealMeta}>
                            👤 Buyer: {deal.buyer.firstName}{" "}
                            {deal.buyer.lastName}
                          </p>
                        )}

                        {deal.property?.user && (
                          <p style={styles.dealMeta}>
                            🏠 Seller: {deal.property.user.firstName}{" "}
                            {deal.property.user.lastName}
                          </p>
                        )}

                        {deal.agreedPrice && (
                          <p style={styles.dealPrice}>
                            💰 ₹{deal.agreedPrice.toLocaleString("en-IN")}
                          </p>
                        )}

                        <p style={styles.dealDate}>
                          📅 {new Date(deal.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={styles.emptyDetails}>
              <p>👈 Select an agent to view details and deals</p>
            </div>
          )}
        </div>
      </div>

      {selectedDeal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Deal Details</h3>
              <button
                onClick={() => setSelectedDeal(null)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.dealDetailsGrid}>
              <div>
                <p style={styles.label}>Deal Stage</p>
                <div
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    backgroundColor: getStageColor(
                      selectedDeal.stage || selectedDeal.currentStage
                    ),
                    color: "white",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  {selectedDeal.stage || selectedDeal.currentStage}
                </div>
              </div>
              <div>
                <p style={styles.label}>Created Date</p>
                <p style={styles.value}>
                  {new Date(selectedDeal.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div style={styles.sectionDivider}>
              <h4 style={styles.sectionTitle}>Property Details</h4>
              <div style={styles.dealDetailsGrid}>
                <div>
                  <p style={styles.label}>Property Title</p>
                  <p style={styles.value}>
                    {selectedDeal.property?.title || selectedDeal.propertyTitle}
                  </p>
                </div>
                {selectedDeal.property?.city && (
                  <div>
                    <p style={styles.label}>Location</p>
                    <p style={styles.value}>{selectedDeal.property.city}</p>
                  </div>
                )}
                {selectedDeal.property?.price && (
                  <div>
                    <p style={styles.label}>Property Price</p>
                    <p style={styles.value}>
                      ₹{selectedDeal.property.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {selectedDeal.agreedPrice && (
              <div style={styles.sectionDivider}>
                <h4 style={styles.sectionTitle}>Agreed Price</h4>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#10b981",
                  }}
                >
                  ₹{selectedDeal.agreedPrice.toLocaleString("en-IN")}
                </p>
              </div>
            )}

            {selectedDeal.buyer && (
              <div style={styles.sectionDivider}>
                <h4 style={styles.sectionTitle}>Buyer Information</h4>
                <div style={styles.dealDetailsGrid}>
                  <div>
                    <p style={styles.label}>Name</p>
                    <p style={styles.value}>
                      {selectedDeal.buyer.firstName}{" "}
                      {selectedDeal.buyer.lastName}
                    </p>
                  </div>
                  <div>
                    <p style={styles.label}>Email</p>
                    <p style={styles.value}>{selectedDeal.buyer.email}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Phone</p>
                    <p style={styles.value}>
                      {selectedDeal.buyer.mobileNumber}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedDeal.property?.user && (
              <div style={styles.sectionDivider}>
                <h4 style={styles.sectionTitle}>Seller Information</h4>
                <div style={styles.dealDetailsGrid}>
                  <div>
                    <p style={styles.label}>Name</p>
                    <p style={styles.value}>
                      {selectedDeal.property.user.firstName}{" "}
                      {selectedDeal.property.user.lastName}
                    </p>
                  </div>
                  <div>
                    <p style={styles.label}>Email</p>
                    <p style={styles.value}>
                      {selectedDeal.property.user.email}
                    </p>
                  </div>
                  <div>
                    <p style={styles.label}>Phone</p>
                    <p style={styles.value}>
                      {selectedDeal.property.user.mobileNumber}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedDeal.notes && (
              <div style={styles.sectionDivider}>
                <h4 style={styles.sectionTitle}>Notes</h4>
                <p style={styles.value}>{selectedDeal.notes}</p>
              </div>
            )}

            <div style={styles.modalButtons}>
              <button
                onClick={() => setSelectedDeal(null)}
                style={styles.cancelBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingAgent && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Edit Agent</h3>
              <button
                onClick={() => setShowEditModal(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.formGroup}>
              <label>First Name</label>
              <input
                type="text"
                value={editingAgent.firstName || ""}
                onChange={(e) =>
                  setEditingAgent({
                    ...editingAgent,
                    firstName: e.target.value,
                  })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Last Name</label>
              <input
                type="text"
                value={editingAgent.lastName || ""}
                onChange={(e) =>
                  setEditingAgent({ ...editingAgent, lastName: e.target.value })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={editingAgent.email || ""}
                onChange={(e) =>
                  setEditingAgent({ ...editingAgent, email: e.target.value })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                value={editingAgent.mobileNumber || ""}
                onChange={(e) =>
                  setEditingAgent({
                    ...editingAgent,
                    mobileNumber: e.target.value,
                  })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Address</label>
              <textarea
                value={editingAgent.address || ""}
                onChange={(e) =>
                  setEditingAgent({ ...editingAgent, address: e.target.value })
                }
                style={styles.textarea}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Active Status</label>
              <select
                value={editingAgent.isActive ? "true" : "false"}
                onChange={(e) =>
                  setEditingAgent({
                    ...editingAgent,
                    isActive: e.target.value === "true",
                  })
                }
                style={styles.input}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div style={styles.modalButtons}>
              <button onClick={handleSaveAgent} style={styles.saveBtn}>
                💾 Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 1800,
    margin: "0 auto",
    padding: "24px 32px",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
  },
  header: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#64748b",
    margin: 0,
  },
  loading: {
    textAlign: "center",
    padding: "80px 20px",
    fontSize: "18px",
    color: "#64748b",
  },
  controlsSection: {
    marginBottom: "24px",
  },
  searchBox: {
    marginBottom: "16px",
  },
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: "24px",
  },
  agentsList: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    height: "fit-content",
  },
  agentsHeader: {
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "2px solid #e2e8f0",
  },
  agentsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  agentCard: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  agentCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  agentName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  agentEmail: {
    fontSize: "12px",
    color: "#64748b",
    margin: "4px 0 0 0",
  },
  roleBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    color: "white",
    fontSize: "10px",
    fontWeight: "600",
    backgroundColor: "#10b981",
  },
  agentInfo: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
  },
  viewDealsBtn: {
    width: "100%",
    marginTop: "12px",
    padding: "10px 16px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
    transition: "background 0.2s",
  },
  rightPanel: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    overflowY: "auto",
    maxHeight: "calc(100vh - 200px)",
  },
  detailsCard: {
    marginBottom: "24px",
    paddingBottom: "24px",
    borderBottom: "2px solid #e2e8f0",
  },
  detailsTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 16px 0",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginBottom: "16px",
  },
  label: {
    fontSize: "12px",
    color: "#64748b",
    margin: "0 0 4px 0",
    fontWeight: "600",
  },
  value: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  addressSection: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
  },
  statusSection: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "6px",
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
  },
  editBtn: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  deleteBtn: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  dealsSection: {
    marginTop: "24px",
  },
  dealsTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "16px",
    margin: "0 0 16px 0",
  },
  dealsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "12px",
  },
  dealCard: {
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.3s",
    ":hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      transform: "translateY(-2px)",
    },
  },
  dealStageBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    color: "white",
    fontSize: "10px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  dealTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  dealMeta: {
    fontSize: "11px",
    color: "#64748b",
    margin: "4px 0",
  },
  dealPrice: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#10b981",
    margin: "8px 0 4px 0",
  },
  dealDate: {
    fontSize: "10px",
    color: "#94a3b8",
    margin: "4px 0",
  },
  dealDetailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "16px",
    marginBottom: "12px",
  },
  sectionDivider: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 12px 0",
  },
  emptyDeals: {
    textAlign: "center",
    padding: "20px",
    color: "#64748b",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px dashed #e2e8f0",
    fontSize: "13px",
  },
  emptyDetails: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#64748b",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#64748b",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px dashed #e2e8f0",
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
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e2e8f0",
  },
  closeBtn: {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#64748b",
  },
  formGroup: {
    marginBottom: "16px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    boxSizing: "border-box",
    minHeight: "100px",
    fontFamily: "inherit",
  },
  modalButtons: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },
  saveBtn: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px 16px",
    backgroundColor: "#e2e8f0",
    color: "#1e293b",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
};

export default AdminAgentsPage;
