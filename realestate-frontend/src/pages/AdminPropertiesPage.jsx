// realestate-frontend/src/pages/AdminPropertiesPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import { BACKEND_BASE_URL } from "../config/config";
import AdminPropertyEditModal from "./AdminPropertyEditModal.jsx";
import "./AdminPropertiesPage.css";

export default function AdminPropertiesPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userProperties, setUserProperties] = useState([]);
  const [agentProperties, setAgentProperties] = useState([]);
  const [brokerProperties, setBrokerProperties] = useState([]);

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("NEWEST");

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!user?.id || user?.role !== "ADMIN") {
      setError("Only admins can access this page.");
      setLoading(false);
      return;
    }
    loadAllProperties();
  }, [user?.id, user?.role]);

  const loadAllProperties = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }

      const data = await response.json();
      const properties = Array.isArray(data) ? data : data?.data || [];

      const users = [];
      const agents = [];
      const brokers = [];

      properties.forEach((prop) => {
        const ownerRole = prop.user?.role || prop.ownerRole || "USER";
        if (ownerRole === "AGENT") agents.push(prop);
        else if (ownerRole === "BROKER") brokers.push(prop);
        else users.push(prop);
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

      if (!response.ok) throw new Error("Failed to delete property");

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

  const getFilteredProperties = () => {
    let allProps = [];

    if (activeTab === "ALL")
      allProps = [...userProperties, ...agentProperties, ...brokerProperties];
    else if (activeTab === "USER") allProps = [...userProperties];
    else if (activeTab === "AGENT") allProps = [...agentProperties];
    else if (activeTab === "BROKER") allProps = [...brokerProperties];

    if (statusFilter !== "ALL") {
      allProps = allProps.filter((p) => p.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const needle = searchQuery.trim().toLowerCase();
      allProps = allProps.filter((p) => {
        const text = [
          p.title || "",
          p.cityName || "",
          p.areaName || "",
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

    if (sortBy === "NEWEST")
      allProps.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      );
    else if (sortBy === "OLDEST")
      allProps.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
    else if (sortBy === "PRICE_HIGH")
      allProps.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === "PRICE_LOW")
      allProps.sort((a, b) => (a.price || 0) - (b.price || 0));

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
      case "available":
      case "ACTIVE":
        return "app-status-active";
      case "pending":
      case "PENDING":
        return "app-status-pending";
      case "sold":
      case "SOLD":
        return "app-status-sold";
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

  const getImage = (property) => {
    if (property.imageUrl && property.imageUrl.trim() !== "") {
      return property.imageUrl;
    }
    return null;
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="app-header-content">
          <h1 className="app-title">🏘️ Property Management</h1>
          <p className="app-subtitle">
            Manage all properties across the platform
          </p>
          {error && <div className="app-alert">⚠️ {error}</div>}
        </div>
        <button
          className="app-refresh-btn"
          onClick={loadAllProperties}
          disabled={loading}
        >
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
              <div className="app-stat-value">
                {userProperties.length +
                  agentProperties.length +
                  brokerProperties.length}
              </div>
              <div className="app-stat-label">Total</div>
            </div>
            <div className="app-stat">
              <div className="app-stat-value">{userProperties.length}</div>
              <div className="app-stat-label">User</div>
            </div>
            <div className="app-stat">
              <div className="app-stat-value">{agentProperties.length}</div>
              <div className="app-stat-label">Agent</div>
            </div>
            <div className="app-stat">
              <div className="app-stat-value">{brokerProperties.length}</div>
              <div className="app-stat-label">Broker</div>
            </div>
          </section>

          {/* Tabs */}
          <section className="app-tabs">
            <button
              className={`app-tab ${activeTab === "ALL" ? "active" : ""}`}
              onClick={() => setActiveTab("ALL")}
            >
              All
            </button>
            <button
              className={`app-tab ${activeTab === "USER" ? "active" : ""}`}
              onClick={() => setActiveTab("USER")}
            >
              Users
            </button>
            <button
              className={`app-tab ${activeTab === "AGENT" ? "active" : ""}`}
              onClick={() => setActiveTab("AGENT")}
            >
              Agents
            </button>
            <button
              className={`app-tab ${activeTab === "BROKER" ? "active" : ""}`}
              onClick={() => setActiveTab("BROKER")}
            >
              Brokers
            </button>
          </section>

          {/* Controls */}
          <section className="app-controls">
            <input
              className="app-input"
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className="app-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
            </select>

            <select
              className="app-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="NEWEST">Newest</option>
              <option value="OLDEST">Oldest</option>
              <option value="PRICE_HIGH">Price High</option>
              <option value="PRICE_LOW">Price Low</option>
            </select>
          </section>

          {/* Properties */}
          <section className="app-properties">
            <div className="app-property-grid">
              {filteredProperties.map((property) => {
                const img = getImage(property);
                const ownerRole = property.user?.role;

                return (
                  <div key={property.propertyId} className="app-property-card">
                    {/* Badge */}
                    <div
                      className={`app-status-badge ${getStatusBadgeClass(
                        property.status
                      )}`}
                    >
                      {property.status}
                    </div>

                    {/* Image */}
                    <div className="app-property-image">
                      {img ? (
                        <img src={img} alt={property.title} />
                      ) : (
                        <div className="app-no-image">🏠</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="app-property-content">
                      <h3 className="app-property-title">
                        {property.title || "Untitled"}
                      </h3>

                      <div className="app-property-price">
                        {formatPrice(property.price)}
                      </div>

                      <div className="app-owner-section">
                        <span className="app-owner-name">
                          {property.user?.firstName} {property.user?.lastName}
                        </span>
                        <span
                          className={`app-role-badge ${getRoleBadgeClass(
                            ownerRole
                          )}`}
                        >
                          {ownerRole}
                        </span>
                      </div>

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

      {/* Delete Modal */}
      {deleteConfirm && (
        <div className="app-modal">
          <div className="app-modal-content">
            <h2>Confirm Delete</h2>
            <p>{deleteConfirm.title}</p>

            <button onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button
              onClick={() =>
                handleDeleteProperty(deleteConfirm.propertyId)
              }
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
