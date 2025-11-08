// realestate-frontend/src/pages/AdminPropertiesPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { BACKEND_BASE_URL } from "../config/config";
import AdminPropertyEditModal from "../AdminPropertyEditModal.jsx";
import "./AdminPropertiesPage.css";

export default function AdminPropertiesPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // All properties grouped by owner type
  const [userProperties, setUserProperties] = useState([]);
  const [agentProperties, setAgentProperties] = useState([]);
  const [brokerProperties, setBrokerProperties] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, USER, AGENT, BROKER
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST"); // NEWEST, OLDEST, PRICE_HIGH, PRICE_LOW

  // Selected property for editing
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!user?.id || user?.role !== "ADMIN") {
      setError("Only admins can access this page.");
      setLoading(false);
      return;
    }
    loadAllProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role]);

  const loadAllProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all properties
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      const properties = Array.isArray(data) ? data : data?.data || [];

      // Categorize properties by owner role
      const users = [];
      const agents = [];
      const brokers = [];

      properties.forEach((prop) => {
        const ownerRole = prop.user?.role || prop.ownerRole || "USER";
        if (ownerRole === "AGENT") {
          agents.push(prop);
        } else if (ownerRole === "BROKER") {
          brokers.push(prop);
        } else {
          users.push(prop);
        }
      });

      setUserProperties(users);
      setAgentProperties(agents);
      setBrokerProperties(brokers);
    } catch (err) {
      console.error("Error loading properties:", err);
      setError(err.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/${propertyId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete property");
      }

      // Reload properties
      await loadAllProperties();
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Failed to delete property: " + err.message);
    }
  };

  const handleEditProperty = (property) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  const handleUpdateComplete = () => {
    setShowEditModal(false);
    setSelectedProperty(null);
    loadAllProperties();
  };

  // Get filtered and sorted properties
  const getFilteredProperties = () => {
    let allProps = [];

    if (activeTab === "ALL") {
      allProps = [...userProperties, ...agentProperties, ...brokerProperties];
    } else if (activeTab === "USER") {
      allProps = [...userProperties];
    } else if (activeTab === "AGENT") {
      allProps = [...agentProperties];
    } else if (activeTab === "BROKER") {
      allProps = [...brokerProperties];
    }

    // Apply status filter
    if (statusFilter !== "ALL") {
      allProps = allProps.filter((p) => p.status === statusFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const needle = searchQuery.trim().toLowerCase();
      allProps = allProps.filter((p) => {
        const text = [
          p.title || "",
          p.city || "",
          p.locality || "",
          p.propertyType || "",
          p.user?.firstName || "",
          p.user?.lastName || "",
          p.user?.email || "",
        ]
          .join(" ")
          .toLowerCase();
        return text.includes(needle);
      });
    }

    // Apply sorting
    if (sortBy === "NEWEST") {
      allProps.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === "OLDEST") {
      allProps.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === "PRICE_HIGH") {
      allProps.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "PRICE_LOW") {
      allProps.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    return allProps;
  };

  const filteredProperties = getFilteredProperties();

  const formatPrice = (price) => {
    const num = Number(price || 0);
    if (num >= 1_00_00_000) return `₹${(num / 1_00_00_000).toFixed(2)} Cr`;
    if (num >= 1_00_000) return `₹${(num / 1_00_000).toFixed(2)} L`;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "ACTIVE":
        return "app-status-active";
      case "PENDING":
        return "app-status-pending";
      case "SOLD":
        return "app-status-sold";
      case "INACTIVE":
        return "app-status-inactive";
      default:
        return "app-status-default";
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "USER":
        return "app-role-user";
      case "AGENT":
        return "app-role-agent";
      case "BROKER":
        return "app-role-broker";
      default:
        return "app-role-default";
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">🏘️ Property Management</h1>
          <p className="app-subtitle">
            Manage all properties across the platform - edit, delete, and monitor listings
          </p>
          {error && <div className="app-alert">⚠️ {error}</div>}
        </div>
        <button className="app-refresh-btn" onClick={loadAllProperties} disabled={loading}>
          🔄 Refresh
        </button>
      </header>

      {loading ? (
        <div className="app-loading">⏳ Loading properties...</div>
      ) : (
        <>
          {/* Stats */}
          <section className="app-stats">
            <div className="app-stat">
              <div className="app-stat-value">{userProperties.length + agentProperties.length + brokerProperties.length}</div>
              <div className="app-stat-label">Total Properties</div>
            </div>
            <div className="app-stat">
              <div className="app-stat-value">{userProperties.length}</div>
              <div className="app-stat-label">User Properties</div>
            </div>
            <div className="app-stat">
              <div className="app-stat-value">{agentProperties.length}</div>
              <div className="app-stat-label">Agent Properties</div>
            </div>
            <div className="app-stat">
              <div className="app-stat-value">{brokerProperties.length}</div>
              <div className="app-stat-label">Broker Properties</div>
            </div>
          </section>

          {/* Tabs */}
          <section className="app-tabs">
            <button
              className={`app-tab ${activeTab === "ALL" ? "active" : ""}`}
              onClick={() => setActiveTab("ALL")}
            >
              All Properties ({userProperties.length + agentProperties.length + brokerProperties.length})
            </button>
            <button
              className={`app-tab ${activeTab === "USER" ? "active" : ""}`}
              onClick={() => setActiveTab("USER")}
            >
              👤 Users ({userProperties.length})
            </button>
            <button
              className={`app-tab ${activeTab === "AGENT" ? "active" : ""}`}
              onClick={() => setActiveTab("AGENT")}
            >
              👔 Agents ({agentProperties.length})
            </button>
            <button
              className={`app-tab ${activeTab === "BROKER" ? "active" : ""}`}
              onClick={() => setActiveTab("BROKER")}
            >
              🏢 Brokers ({brokerProperties.length})
            </button>
          </section>

          {/* Controls */}
          <section className="app-controls">
            <div className="app-search-wrapper">
              <input
                type="text"
                className="app-input"
                placeholder="🔍 Search by title, city, owner name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="app-filters">
              <div className="app-filter-group">
                <label className="app-label">Status</label>
                <select
                  className="app-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="SOLD">Sold</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="app-filter-group">
                <label className="app-label">Sort By</label>
                <select
                  className="app-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="PRICE_HIGH">Price: High to Low</option>
                  <option value="PRICE_LOW">Price: Low to High</option>
                </select>
              </div>
            </div>
          </section>

          {/* Properties Grid */}
          <section className="app-properties">
            <div className="app-properties-header">
              <h2 className="app-properties-title">
                {activeTab === "ALL" ? "All Properties" :
                 activeTab === "USER" ? "User Properties" :
                 activeTab === "AGENT" ? "Agent Properties" :
                 "Broker Properties"} ({filteredProperties.length})
              </h2>
            </div>

            {filteredProperties.length === 0 ? (
              <div className="app-empty-state">
                <div className="app-empty-icon">🏠</div>
                <div className="app-empty-title">No properties found</div>
                <div className="app-empty-text">
                  Try adjusting your filters or search query
                </div>
              </div>
            ) : (
              <div className="app-property-grid">
                {filteredProperties.map((property) => {
                  const ownerRole = property.user?.role || property.ownerRole || "USER";
                  const ownerName = property.user
                    ? `${property.user.firstName || ""} ${property.user.lastName || ""}`.trim()
                    : "Unknown";
                  const ownerEmail = property.user?.email || "N/A";

                  return (
                    <div key={property.id} className="app-property-card">
                      {/* Status Badge */}
                      <div className={`app-status-badge ${getStatusBadgeClass(property.status)}`}>
                        {property.status || "ACTIVE"}
                      </div>

                      {/* Property Image */}
                      <div className="app-property-image">
                        {property.images && property.images.length > 0 ? (
                          <img src={property.images[0]} alt={property.title} />
                        ) : (
                          <div className="app-no-image">🏠</div>
                        )}
                      </div>

                      {/* Property Details */}
                      <div className="app-property-content">
                        <h3 className="app-property-title">{property.title || "Untitled Property"}</h3>

                        <div className="app-property-price">{formatPrice(property.price)}</div>

                        <div className="app-property-info">
                          <div className="app-info-row">
                            <span className="app-info-icon">📍</span>
                            <span className="app-info-text">
                              {property.locality || ""}, {property.city || ""}
                            </span>
                          </div>
                          <div className="app-info-row">
                            <span className="app-info-icon">🏗️</span>
                            <span className="app-info-text">{property.propertyType || "N/A"}</span>
                          </div>
                          <div className="app-info-row">
                            <span className="app-info-icon">📏</span>
                            <span className="app-info-text">{property.builtUpArea || "N/A"} sq.ft</span>
                          </div>
                        </div>

                        {/* Owner Info */}
                        <div className="app-owner-section">
                          <div className="app-owner-header">
                            <span className="app-owner-label">Owner:</span>
                            <span className={`app-role-badge ${getRoleBadgeClass(ownerRole)}`}>
                              {ownerRole}
                            </span>
                          </div>
                          <div className="app-owner-name">{ownerName}</div>
                          <div className="app-owner-email">{ownerEmail}</div>
                        </div>

                        {/* Property Meta */}
                        <div className="app-property-meta">
                          <div className="app-meta-item">
                            <span className="app-meta-label">Posted:</span>
                            <span className="app-meta-value">
                              {new Date(property.createdAt || Date.now()).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="app-meta-item">
                            <span className="app-meta-label">ID:</span>
                            <span className="app-meta-value">{property.id}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="app-property-actions">
                          <button
                            className="app-action-btn app-action-edit"
                            onClick={() => handleEditProperty(property)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="app-action-btn app-action-delete"
                            onClick={() => setDeleteConfirm(property)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProperty && (
        <AdminPropertyEditModal
          property={selectedProperty}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProperty(null);
          }}
          onUpdate={handleUpdateComplete}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="app-modal">
          <div className="app-modal-content">
            <h2 className="app-modal-title">⚠️ Confirm Delete</h2>
            <p className="app-modal-text">
              Are you sure you want to delete this property?
            </p>
            <div className="app-modal-details">
              <p className="app-modal-text">
                <strong>Title:</strong> {deleteConfirm.title || "Untitled"}
              </p>
              <p className="app-modal-text">
                <strong>Owner:</strong>{" "}
                {deleteConfirm.user
                  ? `${deleteConfirm.user.firstName || ""} ${deleteConfirm.user.lastName || ""}`.trim()
                  : "Unknown"}
              </p>
              <p className="app-modal-text">
                <strong>Price:</strong> {formatPrice(deleteConfirm.price)}
              </p>
            </div>
            <p className="app-modal-warning">
              This action cannot be undone. All associated data will be permanently deleted.
            </p>
            <div className="app-modal-buttons">
              <button
                className="app-modal-btn app-modal-btn-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="app-modal-btn app-modal-btn-danger"
                onClick={() => handleDeleteProperty(deleteConfirm.id)}
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}