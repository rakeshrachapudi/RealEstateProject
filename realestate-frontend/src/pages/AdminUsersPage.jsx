import React, { useState, useEffect } from "react";
import { BACKEND_BASE_URL } from "../config/config";
import AdminPropertyEditModal from "./AdminPropertyEditModal";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDeals, setUserDeals] = useState([]);
  const [userProperties, setUserProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [propertySearchQuery, setPropertySearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, item: null });
  const [editPropertyModal, setEditPropertyModal] = useState({ show: false, property: null });

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

      const userRole = user.role;

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
        fetchUserDeals(selectedUser.id);
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

  // ==================== PROPERTY EDIT FUNCTIONS ====================

  const openEditPropertyModal = (property) => {
    setEditPropertyModal({ show: true, property });
  };

  const closeEditPropertyModal = () => {
    setEditPropertyModal({ show: false, property: null });
  };

  const handlePropertyUpdated = () => {
    fetchUserProperties(selectedUser.id);
    fetchUserDeals(selectedUser.id);
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

  const getRoleBadgeStyle = (role) => {
    const roleColors = {
      ADMIN: { bg: "#dc2626", text: "white" },
      AGENT: { bg: "#10b981", text: "white" },
      USER: { bg: "#3b82f6", text: "white" },
    };
    return roleColors[role] || roleColors.USER;
  };

  // ==================== FILTER FUNCTIONS ====================

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSearch =
      user.id?.toString().includes(searchQuery) ||
      user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.mobileNumber?.includes(searchQuery);
    return matchesRole && matchesSearch;
  });

  const filteredProperties = userProperties.filter(property => {
    return (
      property.propertyId?.toString().includes(propertySearchQuery) ||
      property.title?.toLowerCase().includes(propertySearchQuery.toLowerCase()) ||
      property.cityName?.toLowerCase().includes(propertySearchQuery.toLowerCase()) ||
      property.areaName?.toLowerCase().includes(propertySearchQuery.toLowerCase())
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
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    searchInput: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "14px",
      fontFamily: "inherit",
    },
    roleFilters: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },
    roleFilterBtn: (isActive) => ({
      padding: "8px 16px",
      backgroundColor: isActive ? "#3b82f6" : "white",
      color: isActive ? "white" : "#64748b",
      border: `1px solid ${isActive ? "#3b82f6" : "#e2e8f0"}`,
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
      maxHeight: "calc(100vh - 240px)",
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
    userItemName: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#1e293b",
      marginBottom: "4px",
    },
    userItemEmail: {
      fontSize: "12px",
      color: "#64748b",
      marginBottom: "8px",
    },
    userItemMeta: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "11px",
      color: "#94a3b8",
    },
    roleBadge: (role) => {
      const colors = getRoleBadgeStyle(role);
      return {
        display: "inline-block",
        padding: "2px 6px",
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: "4px",
        fontSize: "10px",
        fontWeight: "700",
      };
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
        green: { bg: "#d1fae5", hover: "#a7f3d0", text: "#047857" },
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
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "#64748b",
    },
    emptyIcon: {
      fontSize: "64px",
      marginBottom: "16px",
    },
    propertiesGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "16px",
    },
    propertyCard: {
      backgroundColor: "#f8fafc",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      transition: "all 0.3s",
    },
    propertyImage: {
      width: "100%",
      height: "180px",
      objectFit: "cover",
    },
    propertyContent: {
      padding: "16px",
    },
    propertyTitle: {
      fontSize: "16px",
      fontWeight: "700",
      color: "#1e293b",
      marginBottom: "8px",
    },
    propertyPrice: {
      fontSize: "18px",
      fontWeight: "800",
      color: "#10b981",
      marginBottom: "12px",
    },
    propertyDetails: {
      fontSize: "13px",
      color: "#64748b",
      marginBottom: "6px",
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
    propertySearchInput: {
      width: "100%",
      padding: "10px 14px",
      border: "1px solid #e2e8f0",
      borderRadius: "8px",
      fontSize: "14px",
      marginBottom: "16px",
      fontFamily: "inherit",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
          <h3>Loading users...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>👥 User Management</h1>
        <p style={styles.subtitle}>Manage all users - view, edit, and monitor user activities</p>
      </div>

      {/* Search & Filters */}
      <div style={styles.controls}>
        <input
          type="text"
          placeholder="🔍 Search by ID, name, email, or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <div style={styles.roleFilters}>
          {["all", "ADMIN", "AGENT", "USER"].map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              style={styles.roleFilterBtn(filterRole === role)}
            >
              {role === "all" ? "All Users" : role}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.mainGrid}>
        {/* User List */}
        <div style={styles.userList}>
          <div style={styles.userListHeader}>Users ({filteredUsers.length})</div>
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              style={styles.userItem(selectedUser?.id === user.id)}
            >
              <div style={styles.userItemName}>
                {user.firstName} {user.lastName}
              </div>
              <div style={styles.userItemEmail}>{user.email}</div>
              <div style={styles.userItemMeta}>
                <span style={styles.roleBadge(user.role)}>{user.role}</span>
                <span>ID: {user.id}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right Panel */}
        <div style={styles.rightPanel}>
          {selectedUser ? (
            <>
              {/* Tabs */}
              <div style={styles.tabs}>
                <button
                  onClick={() => setActiveTab("details")}
                  style={styles.tab(activeTab === "details")}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab("deals")}
                  style={styles.tab(activeTab === "deals")}
                >
                  Deals ({userDeals.length})
                </button>
                <button
                  onClick={() => setActiveTab("properties")}
                  style={styles.tab(activeTab === "properties")}
                >
                  Properties ({userProperties.length})
                </button>
              </div>

              {/* Details Tab */}
              {activeTab === "details" && (
                <>
                  <div style={styles.detailsGrid}>
                    <div style={styles.detailCard}>
                      <div style={styles.detailLabel}>User ID</div>
                      <div style={styles.detailValue}>{selectedUser.id}</div>
                    </div>
                    <div style={styles.detailCard}>
                      <div style={styles.detailLabel}>Full Name</div>
                      <div style={styles.detailValue}>
                        {selectedUser.firstName} {selectedUser.lastName}
                      </div>
                    </div>
                    <div style={styles.detailCard}>
                      <div style={styles.detailLabel}>Email</div>
                      <div style={styles.detailValue}>{selectedUser.email}</div>
                    </div>
                    <div style={styles.detailCard}>
                      <div style={styles.detailLabel}>Mobile</div>
                      <div style={styles.detailValue}>{selectedUser.mobileNumber || "N/A"}</div>
                    </div>
                    <div style={styles.detailCard}>
                      <div style={styles.detailLabel}>Role</div>
                      <div style={styles.detailValue}>{selectedUser.role}</div>
                    </div>
                    <div style={styles.detailCard}>
                      <div style={styles.detailLabel}>Joined</div>
                      <div style={styles.detailValue}>
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div style={styles.actionButtons}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => openDeleteModal("user", selectedUser)}
                    >
                      🗑️ Delete User
                    </button>
                  </div>

                  <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#fef3c7", borderRadius: "8px", fontSize: "13px", color: "#92400e" }}>
                    ⚠️ This will delete the user and all associated properties and deals
                  </div>
                </>
              )}

              {/* Deals Tab */}
              {activeTab === "deals" && (
                <>
                  {userDeals.length > 0 ? (
                    <div style={styles.dealsGrid}>
                      {userDeals.map((deal) => (
                        <div key={deal.dealId} style={styles.dealCard}>
                          <div style={styles.dealContent}>
                            <div style={styles.dealTitle}>
                              Deal #{deal.dealId}
                            </div>
                            <div style={styles.dealInfo}>
                              <strong>Property:</strong> {deal.property?.title || "N/A"}
                            </div>
                            <div style={styles.dealInfo}>
                              <strong>Amount:</strong> {formatPrice(deal.dealAmount)}
                            </div>
                            <div style={styles.dealInfo}>
                              <strong>Stage:</strong>{" "}
                              <span style={styles.stageBadge(deal.stage)}>{deal.stage}</span>
                            </div>
                            <div style={{ marginTop: "12px" }}>
                              <button
                                style={styles.iconBtn("red")}
                                onClick={() => openDeleteModal("deal", deal)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>📋</div>
                      <h3>No deals found</h3>
                    </div>
                  )}
                </>
              )}

              {/* Properties Tab */}
              {activeTab === "properties" && (
                <>
                  <input
                    type="text"
                    placeholder="🔍 Search properties..."
                    value={propertySearchQuery}
                    onChange={(e) => setPropertySearchQuery(e.target.value)}
                    style={styles.propertySearchInput}
                  />
                  {filteredProperties.length > 0 ? (
                    <div style={styles.propertiesGrid}>
                      {filteredProperties.map((property) => (
                        <div key={property.propertyId} style={styles.propertyCard}>
                          <img
                            src={property.imageUrl || "https://via.placeholder.com/300x200"}
                            alt={property.title}
                            style={styles.propertyImage}
                          />
                          <div style={styles.propertyContent}>
                            <div style={styles.propertyTitle}>{property.title}</div>
                            <div style={styles.propertyPrice}>
                              {property.priceDisplay || formatPrice(property.price)}
                            </div>
                            <div style={styles.propertyDetails}>
                              🆔 ID: {property.propertyId}
                            </div>
                            <div style={styles.propertyDetails}>
                              📍 {property.areaName || property.cityName}
                            </div>
                            <div style={styles.propertyDetails}>
                              🏠 {property.propertyType} • {property.listingType}
                            </div>
                            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                              <button
                                style={styles.iconBtn("blue")}
                                onClick={() => openEditPropertyModal(property)}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                style={styles.iconBtn("red")}
                                onClick={() => openDeleteModal("property", property)}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={styles.emptyState}>
                      <div style={styles.emptyIcon}>🏠</div>
                      <h3>No properties found</h3>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>👤</div>
              <h3>Select a user to view details</h3>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div style={styles.modal} onClick={closeDeleteModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>⚠️ Confirm Deletion</h3>

            {deleteModal.type === "user" && (
              <>
                <p style={styles.modalText}>
                  Are you sure you want to delete user{" "}
                  <strong>{deleteModal.item.firstName} {deleteModal.item.lastName}</strong>?
                </p>
                <p style={styles.modalText}>
                  This will also delete:
                </p>
                <ul style={{ paddingLeft: "20px", marginTop: "8px" }}>
                  <li style={styles.modalText}>All properties owned by this user</li>
                  <li style={styles.modalText}>All deals associated with this user</li>
                </ul>
              </>
            )}

            {deleteModal.type === "property" && (
              <p style={styles.modalText}>
                Are you sure you want to delete property{" "}
                <strong>{deleteModal.item.title}</strong>?
              </p>
            )}

            {deleteModal.type === "deal" && (
              <p style={styles.modalText}>
                Are you sure you want to delete deal{" "}
                <strong>#{deleteModal.item.dealId}</strong>?
              </p>
            )}

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
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Edit Modal */}
      {editPropertyModal.show && (
        <AdminPropertyEditModal
          property={editPropertyModal.property}
          onClose={closeEditPropertyModal}
          onPropertyUpdated={handlePropertyUpdated}
        />
      )}
    </div>
  );
};

export default AdminUsersPage;