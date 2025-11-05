// realestate-frontend/src/pages/AdminUsersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { BACKEND_BASE_URL } from "../config/config";
import "./AdminUsersPage.css";

const AdminUsersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modals
  const [deleteModal, setDeleteModal] = useState({ show: false, user: null });
  const [editModal, setEditModal] = useState({ show: false, user: null });
  const [createModal, setCreateModal] = useState({ show: false });

  // Form data
  const [editFormData, setEditFormData] = useState({});
  const [createFormData, setCreateFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    role: "USER",
    password: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }
    fetchAllUsers();
  }, [user, navigate]);

  const fetchAllUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch all users from admin endpoint
      const response = await fetch(`${BACKEND_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const usersList = data.success
          ? data.data || []
          : Array.isArray(data)
          ? data
          : [];
        setUsers(usersList);
        console.log(`✅ Loaded ${usersList.length} users`);
      } else {
        throw new Error(`Failed to fetch users: HTTP ${response.status}`);
      }
    } catch (err) {
      console.error("❌ Error loading users:", err);
      setError(`Failed to load users: ${err.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert("✅ User deleted successfully");
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (selectedUser?.id === userId) {
          setSelectedUser(null);
        }
      } else {
        alert("❌ Failed to delete user");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Error deleting user");
    }
    closeDeleteModal();
  };

  const handleEditUser = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/users/${editFormData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editFormData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const updatedUser = data.data || editFormData;

        setUsers((prev) =>
          prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
        );
        if (selectedUser?.id === updatedUser.id) {
          setSelectedUser(updatedUser);
        }

        alert("✅ User updated successfully");
        closeEditModal();
      } else {
        alert("❌ Failed to update user");
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Error updating user");
    }
  };

  const handleCreateUser = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createFormData),
      });

      if (response.ok) {
        const data = await response.json();
        const newUser = data.data || data.user;

        if (newUser) {
          setUsers((prev) => [newUser, ...prev]);
        }

        alert("✅ User created successfully");
        closeCreateModal();
        fetchAllUsers(); // Refresh to get complete data
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(
          `❌ Failed to create user: ${errorData.message || "Unknown error"}`
        );
      }
    } catch (err) {
      console.error("Create error:", err);
      alert("❌ Error creating user");
    }
  };

  // Modal handlers
  const openDeleteModal = (user) => setDeleteModal({ show: true, user });
  const closeDeleteModal = () => setDeleteModal({ show: false, user: null });

  const openEditModal = (user) => {
    setEditFormData({ ...user });
    setEditModal({ show: true, user });
  };
  const closeEditModal = () => {
    setEditModal({ show: false, user: null });
    setEditFormData({});
  };

  const openCreateModal = () => setCreateModal({ show: true });
  const closeCreateModal = () => {
    setCreateModal({ show: false });
    setCreateFormData({
      firstName: "",
      lastName: "",
      email: "",
      mobileNumber: "",
      role: "USER",
      password: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  const updateEditForm = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateCreateForm = (field, value) => {
    setCreateFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Filtering and sorting
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Search filter
    if (searchQuery.trim()) {
      const needle = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(
        (user) =>
          (user.firstName || "").toLowerCase().includes(needle) ||
          (user.lastName || "").toLowerCase().includes(needle) ||
          (user.email || "").toLowerCase().includes(needle) ||
          (user.mobileNumber || "").includes(needle) ||
          user.id?.toString().includes(needle)
      );
    }

    // Role filter
    if (roleFilter !== "ALL") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter (you can extend this based on your user model)
    if (statusFilter !== "ALL") {
      // Assuming users have an active/inactive status
      if (statusFilter === "ACTIVE") {
        filtered = filtered.filter(
          (user) => !user.isDeleted && user.isActive !== false
        );
      } else if (statusFilter === "INACTIVE") {
        filtered = filtered.filter(
          (user) => user.isDeleted || user.isActive === false
        );
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "name":
          aVal = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
          bVal = `${b.firstName || ""} ${b.lastName || ""}`.toLowerCase();
          break;
        case "email":
          aVal = (a.email || "").toLowerCase();
          bVal = (b.email || "").toLowerCase();
          break;
        case "role":
          aVal = a.role || "";
          bVal = b.role || "";
          break;
        case "createdAt":
        default:
          aVal = new Date(a.createdAt || 0).getTime();
          bVal = new Date(b.createdAt || 0).getTime();
          break;
      }

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [users, searchQuery, roleFilter, statusFilter, sortBy, sortOrder]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = users.length;
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      users: byRole.USER || 0,
      agents: byRole.AGENT || 0,
      admins: byRole.ADMIN || 0,
      others:
        total - (byRole.USER || 0) - (byRole.AGENT || 0) - (byRole.ADMIN || 0),
    };
  }, [users]);

  const getRoleBadgeClass = (role) => {
    const classes = {
      USER: "aup-badge-user",
      AGENT: "aup-badge-agent",
      ADMIN: "aup-badge-admin",
    };
    return `aup-role-badge ${classes[role] || "aup-badge-other"}`;
  };

  if (loading) {
    return (
      <div className="aup-container">
        <div className="aup-loading">⏳ Loading users...</div>
      </div>
    );
  }

  return (
    <div className="aup-container">
      {/* Header */}
      <header className="aup-header">
        <div className="aup-header-content">
          <h1 className="aup-title">User Management</h1>
          <p className="aup-subtitle">Manage all users across the platform</p>
          {error && <div className="aup-alert">⚠️ {error}</div>}
        </div>
        <button className="aup-create-btn" onClick={openCreateModal}>
          ➕ Create User
        </button>
      </header>

      {/* Stats */}
      <section className="aup-stats">
        <div className="aup-stat">
          <div className="aup-stat-value">{stats.total}</div>
          <div className="aup-stat-label">Total Users</div>
        </div>
        <div className="aup-stat">
          <div className="aup-stat-value">{stats.users}</div>
          <div className="aup-stat-label">Regular Users</div>
        </div>
        <div className="aup-stat">
          <div className="aup-stat-value">{stats.agents}</div>
          <div className="aup-stat-label">Agents</div>
        </div>
        <div className="aup-stat">
          <div className="aup-stat-value">{stats.admins}</div>
          <div className="aup-stat-label">Admins</div>
        </div>
      </section>

      {/* Controls */}
      <section className="aup-controls">
        <div className="aup-search">
          <input
            type="text"
            className="aup-input"
            placeholder="Search by name, email, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="aup-filters">
          <div className="aup-filter-group">
            <label className="aup-label">Role</label>
            <select
              className="aup-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="USER">Users</option>
              <option value="AGENT">Agents</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          <div className="aup-filter-group">
            <label className="aup-label">Sort By</label>
            <select
              className="aup-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="createdAt">Join Date</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>
          </div>

          <div className="aup-filter-group">
            <label className="aup-label">Order</label>
            <select
              className="aup-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        <button
          className="aup-refresh-btn"
          onClick={fetchAllUsers}
          disabled={loading}
        >
          {loading ? "⏳" : "↻"} Refresh
        </button>
      </section>

      {/* User Grid */}
      <section className="aup-users">
        <div className="aup-users-header">
          <h2 className="aup-users-title">
            {filteredAndSortedUsers.length} User
            {filteredAndSortedUsers.length !== 1 ? "s" : ""}
          </h2>
        </div>

        {filteredAndSortedUsers.length === 0 ? (
          <div className="aup-empty-state">
            {searchQuery.trim() || roleFilter !== "ALL"
              ? "No users match your current filters."
              : "No users found in the system."}
          </div>
        ) : (
          <div className="aup-user-grid">
            {filteredAndSortedUsers.map((userItem) => (
              <div
                key={userItem.id}
                className={`aup-user-card ${
                  selectedUser?.id === userItem.id ? "selected" : ""
                }`}
                onClick={() =>
                  setSelectedUser(
                    selectedUser?.id === userItem.id ? null : userItem
                  )
                }
              >
                <div className="aup-user-header">
                  <div className="aup-user-avatar">
                    {(userItem.firstName ||
                      userItem.email ||
                      "?")[0].toUpperCase()}
                  </div>
                  <div className="aup-user-info">
                    <h3 className="aup-user-name">
                      {userItem.firstName || "Unknown"}{" "}
                      {userItem.lastName || ""}
                    </h3>
                    <div className={getRoleBadgeClass(userItem.role)}>
                      {userItem.role || "USER"}
                    </div>
                  </div>
                </div>

                <div className="aup-user-details">
                  <div className="aup-detail-row">
                    <span className="aup-detail-icon">📧</span>
                    <span className="aup-detail-text">
                      {userItem.email || "No email"}
                    </span>
                  </div>
                  {userItem.mobileNumber && (
                    <div className="aup-detail-row">
                      <span className="aup-detail-icon">📞</span>
                      <span className="aup-detail-text">
                        {userItem.mobileNumber}
                      </span>
                    </div>
                  )}
                  <div className="aup-detail-row">
                    <span className="aup-detail-icon">📅</span>
                    <span className="aup-detail-text">
                      Joined{" "}
                      {userItem.createdAt
                        ? new Date(userItem.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="aup-detail-row">
                    <span className="aup-detail-icon">🆔</span>
                    <span className="aup-detail-text">ID: {userItem.id}</span>
                  </div>
                </div>

                {selectedUser?.id === userItem.id && (
                  <div className="aup-user-actions">
                    <button
                      className="aup-action-btn aup-action-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(userItem);
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="aup-action-btn aup-action-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(userItem);
                      }}
                      disabled={userItem.id === user?.id} // Prevent self-deletion
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="aup-modal" onClick={closeDeleteModal}>
          <div
            className="aup-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="aup-modal-title">⚠️ Confirm Delete</h3>
            <p className="aup-modal-text">
              Are you sure you want to delete user{" "}
              <strong>
                {deleteModal.user.firstName} {deleteModal.user.lastName}
              </strong>
              ?
              <br />
              <br />
              This action cannot be undone and will remove all user data.
            </p>
            <div className="aup-modal-buttons">
              <button
                className="aup-modal-btn aup-modal-btn-cancel"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                className="aup-modal-btn aup-modal-btn-danger"
                onClick={() => handleDeleteUser(deleteModal.user.id)}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.show && (
        <div className="aup-modal" onClick={closeEditModal}>
          <div
            className="aup-modal-content aup-modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="aup-modal-title">✏️ Edit User</h3>

            <div className="aup-form-grid">
              <div className="aup-form-group">
                <label className="aup-form-label">First Name</label>
                <input
                  className="aup-form-input"
                  value={editFormData.firstName || ""}
                  onChange={(e) => updateEditForm("firstName", e.target.value)}
                />
              </div>

              <div className="aup-form-group">
                <label className="aup-form-label">Last Name</label>
                <input
                  className="aup-form-input"
                  value={editFormData.lastName || ""}
                  onChange={(e) => updateEditForm("lastName", e.target.value)}
                />
              </div>

              <div className="aup-form-group">
                <label className="aup-form-label">Email</label>
                <input
                  type="email"
                  className="aup-form-input"
                  value={editFormData.email || ""}
                  onChange={(e) => updateEditForm("email", e.target.value)}
                />
              </div>

              <div className="aup-form-group">
                <label className="aup-form-label">Mobile Number</label>
                <input
                  className="aup-form-input"
                  value={editFormData.mobileNumber || ""}
                  onChange={(e) =>
                    updateEditForm("mobileNumber", e.target.value)
                  }
                />
              </div>

              <div className="aup-form-group">
                <label className="aup-form-label">Role</label>
                <select
                  className="aup-form-input"
                  value={editFormData.role || "USER"}
                  onChange={(e) => updateEditForm("role", e.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="aup-form-group">
                <label className="aup-form-label">City</label>
                <input
                  className="aup-form-input"
                  value={editFormData.city || ""}
                  onChange={(e) => updateEditForm("city", e.target.value)}
                />
              </div>
            </div>

            <div className="aup-modal-buttons">
              <button
                className="aup-modal-btn aup-modal-btn-cancel"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                className="aup-modal-btn aup-modal-btn-primary"
                onClick={handleEditUser}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModal.show && (
        <div className="aup-modal" onClick={closeCreateModal}>
          <div
            className="aup-modal-content aup-modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="aup-modal-title">➕ Create New User</h3>

            <div className="aup-form-grid">
              <div className="aup-form-group">
                <label className="aup-form-label">First Name *</label>
                <input
                  className="aup-form-input"
                  value={createFormData.firstName}
                  onChange={(e) =>
                    updateCreateForm("firstName", e.target.value)
                  }
                  required
                />
              </div>

              <div className="aup-form-group">
                <label className="aup-form-label">Last Name *</label>
                <input
                  className="aup-form-input"
                  value={createFormData.lastName}
                  onChange={(e) => updateCreateForm("lastName", e.target.value)}
                  required
                />
              </div>

              <div className="aup-form-group">
                <label className="aup-form-label">Email *</label>
                <input
                  type="email"
                  className="aup-form-input"
                  value={createFormData.email}
                  onChange={(e) => updateCreateForm("email", e.target.value)}
                  required
                />
              </div>

              <div className="aup-form-group">
                <label className="aup-form-label">Password *</label>
                <input
                  type="password"
                  className="aup-form-input"
                  value={createFormData.password}
                  onChange={(e) => updateCreateForm("password", e.target.value)}
                  required
                />
              </div>

              <div className="aup-form-group">
                <label className="aup-form-label">Mobile Number</label>
                <input
                  className="aup-form-input"
                  value={createFormData.mobileNumber}
                  onChange={(e) =>
                    updateCreateForm("mobileNumber", e.target.value)
                  }
                />
              </div>

              <div className="aup-form-group">
                <label className="aup-form-label">Role</label>
                <select
                  className="aup-form-input"
                  value={createFormData.role}
                  onChange={(e) => updateCreateForm("role", e.target.value)}
                >
                  <option value="USER">User</option>
                  <option value="AGENT">Agent</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="aup-modal-buttons">
              <button
                className="aup-modal-btn aup-modal-btn-cancel"
                onClick={closeCreateModal}
              >
                Cancel
              </button>
              <button
                className="aup-modal-btn aup-modal-btn-primary"
                onClick={handleCreateUser}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
