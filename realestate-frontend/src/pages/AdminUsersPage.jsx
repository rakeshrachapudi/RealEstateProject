import React, { useState, useEffect } from "react";
import { BACKEND_BASE_URL } from "../config/config";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDeals, setUserDeals] = useState([]);
  const [userProperties, setUserProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details"); // details, deals, properties
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, item: null });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserDeals(selectedUser.id);
      fetchUserProperties(selectedUser.id);
    }
  }, [selectedUser]);

  // ==================== FETCH FUNCTIONS ====================

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const usersList = data.success ? data.data : [];
        setUsers(usersList);
        if (usersList.length > 0 && !selectedUser) {
          setSelectedUser(usersList[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDeals = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      const userRole = user.role; // "USER", "AGENT", or "ADMIN"

      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/user/${userId}/role/${userRole}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserDeals(data.success ? data.data : []);
      }
    } catch (err) {
      console.error("Error fetching user deals:", err);
      setUserDeals([]);
    }
  };

  const fetchUserProperties = async (userId) => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const properties = await response.json();
        setUserProperties(Array.isArray(properties) ? properties : []);
      }
    } catch (err) {
      console.error("Error fetching user properties:", err);
      setUserProperties([]);
    }
  };

  // ==================== DELETE FUNCTIONS ====================

  const handleDeleteDeal = async (dealId) => {
    try {
      // Note: You may need to add a DELETE endpoint for individual deals
      // For now, we'll use a workaround or the cascade delete

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
        fetchUserDeals(selectedUser.id);
      } else {
        showErrorMessage("Failed to delete deal");
      }
    } catch (err) {
      console.error("Error deleting deal:", err);
      showErrorMessage("Error deleting deal");
    }

    closeDeleteModal();
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/${propertyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        showSuccessMessage("Property deleted successfully");
        fetchUserProperties(selectedUser.id);
        fetchUserDeals(selectedUser.id); // Refresh deals as well
      } else {
        showErrorMessage("Failed to delete property");
      }
    } catch (err) {
      console.error("Error deleting property:", err);
      showErrorMessage("Error deleting property");
    }

    closeDeleteModal();
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        showSuccessMessage("User deleted successfully (cascade delete applied)");
        setSelectedUser(null);
        fetchUsers();
      } else {
        showErrorMessage("Failed to delete user");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      showErrorMessage("Error deleting user");
    }

    closeDeleteModal();
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

    if (type === "deal") {
      handleDeleteDeal(item.dealId);
    } else if (type === "property") {
      handleDeleteProperty(item.propertyId);
    } else if (type === "user") {
      handleDeleteUser(item.id);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================

  const showSuccessMessage = (message) => {
    // You can integrate a toast library here
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

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobileNumber?.includes(searchQuery);

    return matchesRole && matchesSearch;
  });

  // ==================== STYLES ====================

  const styles = {
    container: {
      maxWidth: "1800px",
      margin: "0 auto",
      padding: "24px",
      backgroundColor: "#f9fafb",
      minHeight: "100vh",
    },
    header: {
      marginBottom: "24px",
      paddingBottom: "16px",
      borderBottom: "2px solid #e5e7eb",
    },
    title: {
      fontSize: "32px",
      fontWeight: "800",
      color: "#1e293b",
      margin: "0 0 8px 0",
    },
    subtitle: {
      color: "#64748b",
      fontSize: "16px",
      margin: 0,
    },
    searchBar: {
      marginBottom: "20px",
      display: "flex",
      gap: "12px",
      flexWrap: "wrap",
    },
    searchInput: {
      flex: 1,
      minWidth: "250px",
      padding: "10px 14px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "14px",
    },
    filterButtons: {
      display: "flex",
      gap: "8px",
    },
    filterBtn: (active) => ({
      padding: "10px 16px",
      backgroundColor: active ? "#3b82f6" : "white",
      color: active ? "white" : "#64748b",
      border: `1px solid ${active ? "#3b82f6" : "#e2e8f0"}`,
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      transition: "all 0.2s",
    }),
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "350px 1fr",
      gap: "24px",
      alignItems: "start",
    },
    userList: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
      maxHeight: "calc(100vh - 200px)",
      overflowY: "auto",
    },
    userListHeader: {
      padding: "16px",
      backgroundColor: "#f8fafc",
      borderBottom: "1px solid #e5e7eb",
      fontWeight: "700",
      position: "sticky",
      top: 0,
      zIndex: 1,
    },
    userItem: (isSelected) => ({
      padding: "14px 16px",
      borderBottom: "1px solid #e5e7eb",
      cursor: "pointer",
      backgroundColor: isSelected ? "#f0f9ff" : "white",
      borderLeft: isSelected ? "4px solid #3b82f6" : "4px solid transparent",
      transition: "all 0.2s",
    }),
    roleBadge: (role) => {
      const colors = {
        ADMIN: { bg: "#fef3c7", text: "#92400e", border: "#fbbf24" },
        AGENT: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
        USER: { bg: "#e0e7ff", text: "#3730a3", border: "#6366f1" },
      };
      const color = colors[role] || colors.USER;
      return {
        display: "inline-block",
        padding: "2px 8px",
        backgroundColor: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        borderRadius: "4px",
        fontSize: "11px",
        fontWeight: "600",
        marginLeft: "8px",
      };
    },
    detailsPanel: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
    },
    tabBar: {
      display: "flex",
      borderBottom: "2px solid #e5e7eb",
      backgroundColor: "#f8fafc",
    },
    tab: (active) => ({
      flex: 1,
      padding: "14px 20px",
      backgroundColor: active ? "white" : "transparent",
      color: active ? "#3b82f6" : "#64748b",
      border: "none",
      borderBottom: active ? "2px solid #3b82f6" : "2px solid transparent",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
      transition: "all 0.2s",
      marginBottom: "-2px",
    }),
    tabContent: {
      padding: "24px",
      maxHeight: "calc(100vh - 300px)",
      overflowY: "auto",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    },
    infoCard: {
      padding: "16px",
      backgroundColor: "#f8fafc",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
    },
    infoLabel: {
      fontSize: "12px",
      color: "#64748b",
      fontWeight: "600",
      marginBottom: "4px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    infoValue: {
      fontSize: "15px",
      color: "#1e293b",
      fontWeight: "500",
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
      transition: "all 0.2s",
    },
    propertiesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "16px",
    },
    propertyCard: {
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      transition: "all 0.2s",
    },
    propertyImage: {
      width: "100%",
      height: "180px",
      objectFit: "cover",
      backgroundColor: "#e2e8f0",
    },
    propertyContent: {
      padding: "16px",
    },
    propertyTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1e293b",
      margin: "0 0 8px 0",
    },
    propertyPrice: {
      fontSize: "18px",
      fontWeight: "700",
      color: "#10b981",
      marginBottom: "12px",
    },
    propertyDetails: {
      fontSize: "13px",
      color: "#64748b",
      marginBottom: "4px",
    },
    dealsGrid: {
      display: "grid",
      gap: "12px",
    },
    dealCard: {
      padding: "16px",
      backgroundColor: "#f8fafc",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "start",
    },
    dealContent: {
      flex: 1,
    },
    dealTitle: {
      fontSize: "15px",
      fontWeight: "600",
      color: "#1e293b",
      margin: "0 0 8px 0",
    },
    dealInfo: {
      fontSize: "13px",
      color: "#64748b",
      margin: "4px 0",
    },
    stageBadge: (stage) => ({
      display: "inline-block",
      padding: "4px 10px",
      backgroundColor: getStageColor(stage),
      color: "white",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: "600",
    }),
    actionButtons: {
      display: "flex",
      gap: "8px",
      marginTop: "12px",
    },
    iconBtn: (color) => ({
      padding: "6px 12px",
      backgroundColor: color === "red" ? "#fee2e2" : "#dbeafe",
      color: color === "red" ? "#dc2626" : "#2563eb",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: "600",
      transition: "all 0.2s",
    }),
    modal: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      maxWidth: "500px",
      width: "90%",
      boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
    },
    modalTitle: {
      fontSize: "20px",
      fontWeight: "700",
      color: "#1e293b",
      margin: "0 0 12px 0",
    },
    modalText: {
      fontSize: "15px",
      color: "#64748b",
      marginBottom: "24px",
    },
    modalButtons: {
      display: "flex",
      gap: "12px",
      justifyContent: "flex-end",
    },
    modalBtn: (variant) => ({
      padding: "10px 20px",
      backgroundColor: variant === "danger" ? "#ef4444" : "#e5e7eb",
      color: variant === "danger" ? "white" : "#1e293b",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "600",
    }),
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#94a3b8",
    },
    emptyIcon: {
      fontSize: "48px",
      marginBottom: "16px",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "60px" }}>
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>👥 User Management</h1>
        <p style={styles.subtitle}>
          Manage users, view their properties and deals
        </p>
      </div>

      {/* Search and Filters */}
      <div style={styles.searchBar}>
        <input
          type="text"
          placeholder="🔍 Search by name, email, or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.filterButtons}>
          <button
            onClick={() => setFilterRole("all")}
            style={styles.filterBtn(filterRole === "all")}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setFilterRole("USER")}
            style={styles.filterBtn(filterRole === "USER")}
          >
            👤 Users ({users.filter(u => u.role === "USER").length})
          </button>
          <button
            onClick={() => setFilterRole("AGENT")}
            style={styles.filterBtn(filterRole === "AGENT")}
          >
            📊 Agents ({users.filter(u => u.role === "AGENT").length})
          </button>
          <button
            onClick={() => setFilterRole("ADMIN")}
            style={styles.filterBtn(filterRole === "ADMIN")}
          >
            ⚙️ Admins ({users.filter(u => u.role === "ADMIN").length})
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        {/* User List */}
        <div style={styles.userList}>
          <div style={styles.userListHeader}>
            Users ({filteredUsers.length})
          </div>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              style={styles.userItem(selectedUser?.id === user.id)}
              onClick={() => setSelectedUser(user)}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "600" }}>
                    {user.firstName} {user.lastName}
                  </h3>
                  <p style={{ margin: "2px 0", fontSize: "13px", color: "#64748b" }}>
                    {user.email}
                  </p>
                  <p style={{ margin: "2px 0", fontSize: "12px", color: "#94a3b8" }}>
                    📱 {user.mobileNumber}
                  </p>
                </div>
                <span style={styles.roleBadge(user.role)}>
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Details Panel */}
        <div style={styles.detailsPanel}>
          {selectedUser ? (
            <>
              {/* Tab Bar */}
              <div style={styles.tabBar}>
                <button
                  onClick={() => setActiveTab("details")}
                  style={styles.tab(activeTab === "details")}
                >
                  📋 User Details
                </button>
                <button
                  onClick={() => setActiveTab("properties")}
                  style={styles.tab(activeTab === "properties")}
                >
                  🏠 Properties ({userProperties.length})
                </button>
                <button
                  onClick={() => setActiveTab("deals")}
                  style={styles.tab(activeTab === "deals")}
                >
                  💼 Deals ({userDeals.length})
                </button>
              </div>

              {/* Tab Content */}
              <div style={styles.tabContent}>
                {/* USER DETAILS TAB */}
                {activeTab === "details" && (
                  <>
                    <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
                      {selectedUser.firstName} {selectedUser.lastName}
                      <span style={styles.roleBadge(selectedUser.role)}>
                        {selectedUser.role}
                      </span>
                    </h2>

                    <div style={styles.infoGrid}>
                      <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Email</div>
                        <div style={styles.infoValue}>{selectedUser.email}</div>
                      </div>
                      <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Phone</div>
                        <div style={styles.infoValue}>{selectedUser.mobileNumber}</div>
                      </div>
                      <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Username</div>
                        <div style={styles.infoValue}>{selectedUser.username}</div>
                      </div>
                      <div style={styles.infoCard}>
                        <div style={styles.infoLabel}>Status</div>
                        <div style={styles.infoValue}>
                          {selectedUser.isActive ? "✅ Active" : "❌ Inactive"}
                        </div>
                      </div>
                      {selectedUser.address && (
                        <div style={{ ...styles.infoCard, gridColumn: "1 / -1" }}>
                          <div style={styles.infoLabel}>Address</div>
                          <div style={styles.infoValue}>{selectedUser.address}</div>
                        </div>
                      )}
                    </div>

                    <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
                      <button
                        onClick={() => openDeleteModal("user", selectedUser)}
                        style={styles.deleteBtn}
                        onMouseEnter={(e) => e.target.style.backgroundColor = "#dc2626"}
                        onMouseLeave={(e) => e.target.style.backgroundColor = "#ef4444"}
                      >
                        🗑️ Delete User (Cascade Delete)
                      </button>
                      <p style={{ fontSize: "13px", color: "#94a3b8", marginTop: "8px" }}>
                        ⚠️ This will delete the user and all associated properties and deals
                      </p>
                    </div>
                  </>
                )}

                {/* PROPERTIES TAB */}
                {activeTab === "properties" && (
                  <>
                    <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
                      Properties Owned by {selectedUser.firstName}
                    </h2>

                    {userProperties.length === 0 ? (
                      <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🏚️</div>
                        <p>No properties found</p>
                      </div>
                    ) : (
                      <div style={styles.propertiesGrid}>
                        {userProperties.map((property) => (
                          <div
                            key={property.propertyId}
                            style={styles.propertyCard}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-4px)";
                              e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            {property.imageUrl && (
                              <img
                                src={property.imageUrl}
                                alt={property.title}
                                style={styles.propertyImage}
                              />
                            )}
                            <div style={styles.propertyContent}>
                              <h3 style={styles.propertyTitle}>{property.title}</h3>
                              <div style={styles.propertyPrice}>
                                {formatPrice(property.price)}
                              </div>
                              <div style={styles.propertyDetails}>
                                📍 {property.cityName || property.areaName}
                              </div>
                              <div style={styles.propertyDetails}>
                                🛏️ {property.bedrooms} BHK | 🛁 {property.bathrooms} Bath
                              </div>
                              <div style={styles.propertyDetails}>
                                📐 {property.areaSqft} sqft
                              </div>
                              <div style={styles.propertyDetails}>
                                📊 {property.status || "Available"}
                              </div>

                              <div style={styles.actionButtons}>
                                <button
                                  onClick={() => openDeleteModal("property", property)}
                                  style={styles.iconBtn("red")}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = "#fecaca"}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = "#fee2e2"}
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* DEALS TAB */}
                {activeTab === "deals" && (
                  <>
                    <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>
                      Deals Associated with {selectedUser.firstName}
                    </h2>

                    {userDeals.length === 0 ? (
                      <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📭</div>
                        <p>No deals found</p>
                      </div>
                    ) : (
                      <div style={styles.dealsGrid}>
                        {userDeals.map((deal) => (
                          <div key={deal.dealId} style={styles.dealCard}>
                            <div style={styles.dealContent}>
                              <h3 style={styles.dealTitle}>
                                {deal.propertyTitle}
                              </h3>

                              <div style={styles.dealInfo}>
                                <strong>Stage:</strong>{" "}
                                <span style={styles.stageBadge(deal.stage)}>
                                  {deal.stage}
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

                              {deal.agentName && (
                                <div style={styles.dealInfo}>
                                  <strong>Agent:</strong> {deal.agentName}
                                </div>
                              )}

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
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👆</div>
              <p>Select a user to view details</p>
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
              {deleteModal.type === "user" && (
                <>
                  Are you sure you want to delete user <strong>{deleteModal.item.firstName} {deleteModal.item.lastName}</strong>?
                  <br /><br />
                  This will also delete:
                  <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
                    <li>All properties owned by this user</li>
                    <li>All deals associated with this user</li>
                  </ul>
                </>
              )}
              {deleteModal.type === "property" && (
                <>
                  Are you sure you want to delete the property <strong>{deleteModal.item.title}</strong>?
                  <br /><br />
                  This will also delete all deals associated with this property.
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
    </div>
  );
};

export default AdminUsersPage;