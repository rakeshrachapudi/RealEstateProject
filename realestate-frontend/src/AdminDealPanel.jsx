// AdminDealPanel.jsx (Enhanced with Delete & Edit functionality)
import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import DealDetailModal from "./DealDetailModal";
import { BACKEND_BASE_URL } from "./config/config";
import {
  deleteDeal,
  updateDealBuyer,
  updateDealSeller,
  updateDealAgent,
  getAllUsers,
  getAllAgents
} from "./services/api";

const AdminDealPanel = () => {
  const { user } = useAuth();
  const [dealsByAgent, setDealsByAgent] = useState({});
  const [allDeals, setAllDeals] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState(null);

  // ⭐ NEW: Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [editMode, setEditMode] = useState(null); // 'buyer', 'seller', 'agent'
  const [users, setUsers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // ⭐ NEW: Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingDeal, setDeletingDeal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

      const adminRes = await fetch(
        `${BACKEND_BASE_URL}/api/deals/admin/dashboard?userId=${user.id}`,
        { headers }
      );

      if (adminRes.ok) {
        const adminData = await adminRes.json();
        console.log("✅ Admin dashboard response:", adminData);

        if (adminData.success && adminData.data?.agentPerformance) {
          console.log(`Found ${adminData.data.agentPerformance.length} agents`);

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

  // ⭐ NEW: Fetch users for edit modal
  const fetchUsersForEdit = async () => {
    try {
      const token = localStorage.getItem("authToken");

      if (editMode === 'agent') {
        const response = await getAllAgents(token);
        setAgents(response.data || response);
      } else {
        const response = await getAllUsers(token);
        setUsers(response.data || response);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users");
    }
  };

  // ⭐ NEW: Open edit modal
  const openEditModal = (deal, mode) => {
    setEditingDeal(deal);
    setEditMode(mode);
    setShowEditModal(true);
    setSelectedUserId(null);
    fetchUsersForEdit();
  };

  // ⭐ NEW: Handle update
  const handleUpdate = async () => {
    if (!selectedUserId) {
      alert('Please select a user');
      return;
    }

    setEditLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const dealId = editingDeal.id;

      console.log(`🔄 Updating ${editMode} for deal ${dealId}...`);

      if (editMode === 'buyer') {
        await updateDealBuyer(dealId, selectedUserId, token);
      } else if (editMode === 'seller') {
        await updateDealSeller(dealId, selectedUserId, token);
      } else if (editMode === 'agent') {
        await updateDealAgent(dealId, selectedUserId, token);
      }

      alert(`✅ ${editMode.charAt(0).toUpperCase() + editMode.slice(1)} updated successfully!`);
      setShowEditModal(false);
      setEditingDeal(null);
      setEditMode(null);
      fetchDeals(); // Refresh deals
    } catch (error) {
      console.error(`Error updating ${editMode}:`, error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  // ⭐ NEW: Open delete confirmation
  const openDeleteConfirm = (deal) => {
    setDeletingDeal(deal);
    setShowDeleteConfirm(true);
  };

  // ⭐ NEW: Handle delete
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const dealId = deletingDeal.id;

      console.log(`🗑️ Deleting deal ${dealId}...`);
      const result = await deleteDeal(dealId, token);

      console.log("Delete result:", result);
      alert(`✅ Deal deleted successfully!\n${result.data?.s3FilesDeleted || 0} files deleted from S3`);

      setShowDeleteConfirm(false);
      setDeletingDeal(null);
      fetchDeals(); // Refresh deals
    } catch (error) {
      console.error("Error deleting deal:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setDeleteLoading(false);
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

  const stages = [
    "INQUIRY",
    "SHORTLIST",
    "NEGOTIATION",
    "AGREEMENT",
    "REGISTRATION",
    "PAYMENT",
    "COMPLETED",
  ];

  const stageCounts = stages.reduce((acc, stage) => {
    acc[stage] = allDeals.filter((d) => d.stage === stage).length;
    return acc;
  }, {});

  const containerStyle = {
    maxWidth: "1700px",
    margin: "0 auto",
    padding: "24px",
    marginTop: "10px",
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
    backgroundColor: "white",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  };

  const stageBadgeStyle = {
    display: "inline-block",
    padding: "4px 12px",
    backgroundColor: "#3b82f6",
    color: "white",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
    marginBottom: "10px",
  };

  const titleSmallStyle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "10px",
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
    fontSize: "13px",
  };

  // ⭐ NEW: Deal action buttons style
  const dealActionsStyle = {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
  };

  const editBtnStyle = {
    flex: 1,
    padding: "6px 10px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "11px",
  };

  const deleteBtnStyle = {
    flex: 1,
    padding: "6px 10px",
    backgroundColor: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "11px",
  };

  const filteredDealsByAgent = getFilteredDealsByAgent();
  const totalAgents = Object.keys(dealsByAgent).length;

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p>Loading deals...</p>
        </div>
      </div>
    );
  }

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

                      {/* Buyer Details with Edit */}
                      {buyer && (
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "rgba(255,255,255,0.6)",
                            borderRadius: "6px",
                            marginBottom: "8px",
                            fontSize: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(deal, 'buyer');
                            }}
                            style={{
                              background: "none",
                              border: "1px solid #3b82f6",
                              color: "#3b82f6",
                              borderRadius: "4px",
                              cursor: "pointer",
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: "600",
                            }}
                            title="Change Buyer"
                          >
                            ✏️
                          </button>
                        </div>
                      )}

                      {/* Seller Details with Edit */}
                      {seller && (
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "rgba(255,255,255,0.6)",
                            borderRadius: "6px",
                            marginBottom: "8px",
                            fontSize: "12px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(deal, 'seller');
                            }}
                            style={{
                              background: "none",
                              border: "1px solid #3b82f6",
                              color: "#3b82f6",
                              borderRadius: "4px",
                              cursor: "pointer",
                              padding: "4px 8px",
                              fontSize: "11px",
                              fontWeight: "600",
                            }}
                            title="Change Seller"
                          >
                            ✏️
                          </button>
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

                      {/* ⭐ NEW: Action Buttons */}
                      <div style={dealActionsStyle}>
                        <button
                          style={editBtnStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(deal, 'agent');
                          }}
                          title="Reassign Agent"
                        >
                          👥 Reassign
                        </button>
                        <button
                          style={deleteBtnStyle}
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteConfirm(deal);
                          }}
                          title="Delete Deal"
                        >
                          🗑️ Delete
                        </button>
                      </div>

                      {/* View Button */}
                      <button
                        style={{ ...buttonStyle, marginTop: "8px" }}
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

      {/* Deal Detail Modal */}
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

      {/* ⭐ NEW: Edit Modal */}
      {showEditModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
            }}>
              Update {editMode === 'buyer' ? 'Buyer' : editMode === 'seller' ? 'Seller' : 'Agent'}
            </h3>

            <select
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              <option value="">-- Select User --</option>
              {(editMode === 'agent' ? agents : users).map(u => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} - {u.email}
                  {editMode === 'agent' && ` (${u.role})`}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleUpdate}
                disabled={editLoading || !selectedUserId}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '14px',
                }}
              >
                {editLoading ? 'Updating...' : 'Update'}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingDeal(null);
                  setEditMode(null);
                }}
                disabled={editLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#e2e8f0',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '14px',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ NEW: Delete Confirmation Modal */}
      {showDeleteConfirm && deletingDeal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteConfirm(false);
          }}
        >
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: '#1e293b',
            }}>
              ⚠️ Confirm Deletion
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              lineHeight: '1.6',
              marginBottom: '24px',
            }}>
              Are you sure you want to delete this deal?
              <br /><br />
              <strong>Deal ID: {deletingDeal.id}</strong>
              <br />
              <strong>Property: {deletingDeal.propertyTitle || deletingDeal.property?.title}</strong>
              <br /><br />
              This action cannot be undone. All associated documents will be deleted from storage.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '14px',
                }}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingDeal(null);
                }}
                disabled={deleteLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#e2e8f0',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '14px',
                }}
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

export default AdminDealPanel;