import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { BACKEND_BASE_URL } from "../config/config";

const AdminUsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDeals, setUserDeals] = useState([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    if (user?.role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchAllUsers();
  }, [user, navigate]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const usersList = data.success
          ? data.data || []
          : Array.isArray(data)
          ? data
          : [];
        setUsers(usersList);
        filterUsers(usersList, searchTerm, filterRole);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDeals = async (selectedUserData) => {
    setDealsLoading(true);
    try {
      let allDeals = [];

      // If user is an AGENT, fetch deals they created
      if (selectedUserData.role === "AGENT") {
        console.log("Fetching agent deals for agent ID:", selectedUserData.id);
        const agentResponse = await fetch(
          `${BACKEND_BASE_URL}/api/deals/admin/agent/${selectedUserData.id}?userId=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        console.log("Agent deals response status:", agentResponse.status);

        if (agentResponse.ok) {
          const data = await agentResponse.json();
          console.log("Agent deals response:", data);
          const deals = data.success
            ? data.data || []
            : Array.isArray(data)
            ? data
            : [];
          allDeals = [...allDeals, ...deals];
        } else {
          console.warn("Agent deals response not ok:", agentResponse.status);
        }
      }
      // If user is a regular USER, fetch deals where they're a buyer
      else if (selectedUserData.role === "USER") {
        console.log("Fetching buyer deals for user ID:", selectedUserData.id);
        const buyerResponse = await fetch(
          `${BACKEND_BASE_URL}/api/deals/user/${selectedUserData.id}/role/BUYER`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        console.log("Buyer deals response status:", buyerResponse.status);

        if (buyerResponse.ok) {
          const data = await buyerResponse.json();
          console.log("Buyer deals response:", data);
          const deals = data.success
            ? data.data || []
            : Array.isArray(data)
            ? data
            : [];
          allDeals = [...allDeals, ...deals];
        } else {
          console.warn("Buyer deals response not ok:", buyerResponse.status);
        }
      }

      console.log("Total deals loaded for user:", allDeals.length);
      setUserDeals(allDeals);
    } catch (error) {
      console.error("Error fetching user deals:", error);
      setUserDeals([]);
    } finally {
      setDealsLoading(false);
    }
  };

  const filterUsers = (userList, search, role) => {
    let filtered = userList;

    if (role !== "all") {
      filtered = filtered.filter((u) => u.role === role);
    }

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()) ||
          u.mobileNumber?.includes(search)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    filterUsers(users, value, filterRole);
  };

  const handleRoleFilter = (role) => {
    setFilterRole(role);
    filterUsers(users, searchTerm, role);
  };

  const handleSelectUser = (userToSelect) => {
    setSelectedUser(userToSelect);
    fetchUserDeals(userToSelect);
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser({ ...userToEdit });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify(editingUser),
        }
      );

      if (response.ok) {
        const updated = await response.json();
        const updatedUser = updated.data || editingUser;
        setUsers(users.map((u) => (u.id === editingUser.id ? updatedUser : u)));
        filterUsers(
          users.map((u) => (u.id === editingUser.id ? updatedUser : u)),
          searchTerm,
          filterRole
        );
        setSelectedUser(updatedUser);
        setShowEditModal(false);
        setEditingUser(null);
        alert("User updated successfully!");
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
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
          setUsers(users.filter((u) => u.id !== userId));
          filterUsers(
            users.filter((u) => u.id !== userId),
            searchTerm,
            filterRole
          );
          setSelectedUser(null);
          setUserDeals([]);
          alert("User deleted successfully!");
        } else {
          alert("Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
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
        <div style={styles.loading}>⏳ Loading users...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👨‍💼 User Management</h1>
        <p style={styles.subtitle}>
          Manage all users - view, edit, and modify user details
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

        <div style={styles.filterButtons}>
          <button
            onClick={() => handleRoleFilter("all")}
            style={{
              ...styles.filterBtn,
              ...(filterRole === "all" ? styles.activeFilter : {}),
            }}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => handleRoleFilter("USER")}
            style={{
              ...styles.filterBtn,
              ...(filterRole === "USER" ? styles.activeFilter : {}),
            }}
          >
            Buyers/Sellers ({users.filter((u) => u.role === "USER").length})
          </button>
          <button
            onClick={() => handleRoleFilter("AGENT")}
            style={{
              ...styles.filterBtn,
              ...(filterRole === "AGENT" ? styles.activeFilter : {}),
            }}
          >
            Agents ({users.filter((u) => u.role === "AGENT").length})
          </button>
          <button
            onClick={() => handleRoleFilter("ADMIN")}
            style={{
              ...styles.filterBtn,
              ...(filterRole === "ADMIN" ? styles.activeFilter : {}),
            }}
          >
            Admins ({users.filter((u) => u.role === "ADMIN").length})
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.usersList}>
          <div style={styles.usersHeader}>
            <h3>Users ({filteredUsers.length})</h3>
          </div>

          {filteredUsers.length === 0 ? (
            <div style={styles.emptyState}>
              <p>🔍 No users found</p>
            </div>
          ) : (
            <div style={styles.usersGrid}>
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  style={{
                    ...styles.userCard,
                    backgroundColor:
                      selectedUser?.id === u.id ? "#dbeafe" : "white",
                    borderColor:
                      selectedUser?.id === u.id ? "#3b82f6" : "#e2e8f0",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSelectUser(u)}
                >
                  <div style={styles.userCardHeader}>
                    <div>
                      <h4 style={styles.userName}>
                        {u.firstName} {u.lastName}
                      </h4>
                      <p style={styles.userEmail}>{u.email}</p>
                    </div>
                    <span
                      style={{
                        ...styles.roleBadge,
                        backgroundColor: getRoleColor(u.role),
                      }}
                    >
                      {u.role}
                    </span>
                  </div>
                  <div style={styles.userInfo}>
                    <p>📱 {u.mobileNumber || "N/A"}</p>
                    <p>📅 {new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.userDetails}>
          {selectedUser ? (
            <>
              <div style={styles.detailsCard}>
                <h2 style={styles.detailsTitle}>User Details</h2>
                <div style={styles.detailsGrid}>
                  <div>
                    <p style={styles.label}>First Name</p>
                    <p style={styles.value}>{selectedUser.firstName}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Last Name</p>
                    <p style={styles.value}>{selectedUser.lastName}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Email</p>
                    <p style={styles.value}>{selectedUser.email}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Phone</p>
                    <p style={styles.value}>
                      {selectedUser.mobileNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p style={styles.label}>Role</p>
                    <span
                      style={{
                        ...styles.roleBadge,
                        backgroundColor: getRoleColor(selectedUser.role),
                      }}
                    >
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <p style={styles.label}>Member Since</p>
                    <p style={styles.value}>
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedUser.address && (
                  <div style={styles.addressSection}>
                    <p style={styles.label}>Address</p>
                    <p style={styles.value}>{selectedUser.address}</p>
                  </div>
                )}

                <div style={styles.actionButtons}>
                  <button
                    onClick={() => handleEditUser(selectedUser)}
                    style={styles.editBtn}
                  >
                    ✏️ Edit User
                  </button>
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    style={styles.deleteBtn}
                  >
                    🗑️ Delete User
                  </button>
                </div>
              </div>

              <div style={styles.dealsSection}>
                <h3 style={styles.dealsTitle}>Deals ({userDeals.length})</h3>

                {dealsLoading ? (
                  <div style={styles.loading}>⏳ Loading deals...</div>
                ) : userDeals.length === 0 ? (
                  <div style={styles.emptyDeals}>
                    <p>No deals for this user</p>
                  </div>
                ) : (
                  <div style={styles.dealsGrid}>
                    {userDeals.map((deal) => (
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

                        {deal.seller && (
                          <p style={styles.dealMeta}>
                            🏠 Seller: {deal.seller.firstName}{" "}
                            {deal.seller.lastName}
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

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeal(deal);
                          }}
                          style={styles.viewDealDetailsBtn}
                        >
                          View Deal Details
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={styles.emptyDetails}>
              <p>👈 Select a user to view details and deals</p>
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

            {selectedDeal.seller && (
              <div style={styles.sectionDivider}>
                <h4 style={styles.sectionTitle}>Seller Information</h4>
                <div style={styles.dealDetailsGrid}>
                  <div>
                    <p style={styles.label}>Name</p>
                    <p style={styles.value}>
                      {selectedDeal.seller.firstName}{" "}
                      {selectedDeal.seller.lastName}
                    </p>
                  </div>
                  <div>
                    <p style={styles.label}>Email</p>
                    <p style={styles.value}>{selectedDeal.seller.email}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Phone</p>
                    <p style={styles.value}>
                      {selectedDeal.seller.mobileNumber}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedDeal.agent && (
              <div style={styles.sectionDivider}>
                <h4 style={styles.sectionTitle}>Agent Information</h4>
                <div style={styles.dealDetailsGrid}>
                  <div>
                    <p style={styles.label}>Name</p>
                    <p style={styles.value}>
                      {selectedDeal.agent.firstName}{" "}
                      {selectedDeal.agent.lastName}
                    </p>
                  </div>
                  <div>
                    <p style={styles.label}>Email</p>
                    <p style={styles.value}>{selectedDeal.agent.email}</p>
                  </div>
                  <div>
                    <p style={styles.label}>Phone</p>
                    <p style={styles.value}>
                      {selectedDeal.agent.mobileNumber}
                    </p>
                  </div>
                </div>
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

      {showEditModal && editingUser && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Edit User</h3>
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
                value={editingUser.firstName || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, firstName: e.target.value })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Last Name</label>
              <input
                type="text"
                value={editingUser.lastName || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, lastName: e.target.value })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={editingUser.email || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, email: e.target.value })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                value={editingUser.mobileNumber || ""}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    mobileNumber: e.target.value,
                  })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label>Role</label>
              <select
                value={editingUser.role || "USER"}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, role: e.target.value })
                }
                style={styles.input}
              >
                <option value="USER">User</option>
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label>Address</label>
              <textarea
                value={editingUser.address || ""}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, address: e.target.value })
                }
                style={styles.textarea}
              />
            </div>

            <div style={styles.modalButtons}>
              <button onClick={handleSaveUser} style={styles.saveBtn}>
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

const getRoleColor = (role) => {
  const colors = {
    USER: "#3b82f6",
    AGENT: "#10b981",
    ADMIN: "#f59e0b",
  };
  return colors[role] || "#6b7280";
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
  filterButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  filterBtn: {
    padding: "10px 16px",
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  activeFilter: {
    backgroundColor: "#3b82f6",
    color: "white",
    borderColor: "#3b82f6",
  },
  mainContent: {
    display: "grid",
    gridTemplateColumns: "350px 1fr",
    gap: "24px",
  },
  usersList: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    height: "fit-content",
  },
  usersHeader: {
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "2px solid #e2e8f0",
  },
  usersGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  userCard: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid",
    transition: "all 0.2s",
  },
  userCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "8px",
  },
  userName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  userEmail: {
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
  },
  userInfo: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
  },
  userDetails: {
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
    transition: "all 0.3s ease",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
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
  viewDealDetailsBtn: {
    width: "100%",
    marginTop: "8px",
    padding: "6px 10px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "11px",
    transition: "background 0.2s",
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
    maxWidth: "600px",
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

export default AdminUsersPage;
