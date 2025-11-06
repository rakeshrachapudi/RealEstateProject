import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./DealsDashboard.css";

const DealsDashboard = () => {
  const [deals, setDeals] = useState([]);
  const [filteredDeals, setFilteredDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const navigate = useNavigate();

  // Mock deals data
  const mockDeals = [
    {
      id: "DEAL001",
      propertyTitle: "3BHK Luxury Apartment in Gachibowli",
      propertyType: "Apartment",
      dealType: "Sale",
      status: "Active",
      clientName: "Rajesh Kumar",
      clientPhone: "+91 9876543210",
      clientEmail: "rajesh@email.com",
      dealValue: 8500000,
      commission: 170000,
      commissionRate: 2,
      createdDate: "2024-11-01",
      expectedClosing: "2024-11-25",
      lastActivity: "2024-11-05",
      priority: "High",
      location: "Gachibowli, Hyderabad",
      area: "1450 sq ft",
      notes: "Client is very interested. Follow up scheduled for tomorrow.",
      stage: "Negotiation",
    },
    {
      id: "DEAL002",
      propertyTitle: "2BHK Independent House in Jubilee Hills",
      propertyType: "House",
      dealType: "Rent",
      status: "Pending",
      clientName: "Priya Sharma",
      clientPhone: "+91 8765432109",
      clientEmail: "priya@email.com",
      dealValue: 45000,
      commission: 45000,
      commissionRate: 100,
      createdDate: "2024-10-28",
      expectedClosing: "2024-11-15",
      lastActivity: "2024-11-04",
      priority: "Medium",
      location: "Jubilee Hills, Hyderabad",
      area: "1200 sq ft",
      notes: "Waiting for client document verification.",
      stage: "Documentation",
    },
    {
      id: "DEAL003",
      propertyTitle: "Commercial Office Space in HITEC City",
      propertyType: "Commercial",
      dealType: "Rent",
      status: "Closed",
      clientName: "Tech Solutions Pvt Ltd",
      clientPhone: "+91 7654321098",
      clientEmail: "contact@techsolutions.com",
      dealValue: 120000,
      commission: 240000,
      commissionRate: 200,
      createdDate: "2024-10-15",
      expectedClosing: "2024-10-30",
      lastActivity: "2024-10-30",
      priority: "High",
      location: "HITEC City, Hyderabad",
      area: "2500 sq ft",
      notes: "Deal successfully closed. Commission received.",
      stage: "Completed",
    },
    {
      id: "DEAL004",
      propertyTitle: "4BHK Villa in Kompally",
      propertyType: "Villa",
      dealType: "Sale",
      status: "Lost",
      clientName: "Anil Reddy",
      clientPhone: "+91 6543210987",
      clientEmail: "anil@email.com",
      dealValue: 12000000,
      commission: 240000,
      commissionRate: 2,
      createdDate: "2024-10-10",
      expectedClosing: "2024-11-10",
      lastActivity: "2024-11-02",
      priority: "Low",
      location: "Kompally, Hyderabad",
      area: "2800 sq ft",
      notes: "Client decided to go with another property.",
      stage: "Lost",
    },
    {
      id: "DEAL005",
      propertyTitle: "1BHK Studio in Kondapur",
      propertyType: "Apartment",
      dealType: "Rent",
      status: "Active",
      clientName: "Sarah Johnson",
      clientPhone: "+91 5432109876",
      clientEmail: "sarah@email.com",
      dealValue: 22000,
      commission: 22000,
      commissionRate: 100,
      createdDate: "2024-11-03",
      expectedClosing: "2024-11-20",
      lastActivity: "2024-11-06",
      priority: "Medium",
      location: "Kondapur, Hyderabad",
      area: "650 sq ft",
      notes: "Viewing scheduled for this weekend.",
      stage: "Viewing",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDeals(mockDeals);
      setFilteredDeals(mockDeals);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    filterAndSortDeals();
  }, [deals, selectedFilter, searchQuery, sortBy, sortOrder]);

  const filterAndSortDeals = () => {
    let filtered = [...deals];

    // Apply filter
    if (selectedFilter !== "all") {
      filtered = filtered.filter(
        (deal) => deal.status.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (deal) =>
          deal.propertyTitle
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          deal.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          deal.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.createdDate);
          bValue = new Date(b.createdDate);
          break;
        case "value":
          aValue = a.dealValue;
          bValue = b.dealValue;
          break;
        case "commission":
          aValue = a.commission;
          bValue = b.commission;
          break;
        case "closing":
          aValue = new Date(a.expectedClosing);
          bValue = new Date(b.expectedClosing);
          break;
        default:
          aValue = a.createdDate;
          bValue = b.createdDate;
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredDeals(filtered);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "#10b981";
      case "pending":
        return "#f59e0b";
      case "closed":
        return "#3b82f6";
      case "lost":
        return "#ef4444";
      default:
        return "#64748b";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#64748b";
    }
  };

  const handleViewDetails = (deal) => {
    setSelectedDeal(deal);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDeal(null);
  };

  const handleCallClient = (phone) => {
    window.open(`tel:${phone}`, "_self");
  };

  const handleEmailClient = (email) => {
    window.open(`mailto:${email}`, "_blank");
  };

  const handleCreateNewDeal = () => {
    navigate("/create-deal");
  };

  // Calculate dashboard stats
  const stats = {
    total: deals.length,
    active: deals.filter((d) => d.status === "Active").length,
    closed: deals.filter((d) => d.status === "Closed").length,
    totalValue: deals.reduce((sum, deal) => sum + deal.dealValue, 0),
    totalCommission: deals
      .filter((d) => d.status === "Closed")
      .reduce((sum, deal) => sum + deal.commission, 0),
  };

  if (loading) {
    return (
      <div className="dd-container">
        <div className="dd-loading">
          <div className="dd-loading-spinner"></div>
          <p>Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dd-container">
      {/* Header */}
      <header className="dd-header">
        <div className="dd-header-content">
          <h1 className="dd-title">Deals Dashboard</h1>
          <p className="dd-subtitle">
            Manage your property deals and track performance
          </p>
        </div>
        <button className="dd-create-btn" onClick={handleCreateNewDeal}>
          + New Deal
        </button>
      </header>

      {/* Stats Cards */}
      <section className="dd-stats">
        <div className="dd-stat-card">
          <div className="dd-stat-icon">📊</div>
          <div className="dd-stat-content">
            <div className="dd-stat-value">{stats.total}</div>
            <div className="dd-stat-label">Total Deals</div>
          </div>
        </div>

        <div className="dd-stat-card">
          <div className="dd-stat-icon">🔥</div>
          <div className="dd-stat-content">
            <div className="dd-stat-value">{stats.active}</div>
            <div className="dd-stat-label">Active Deals</div>
          </div>
        </div>

        <div className="dd-stat-card">
          <div className="dd-stat-icon">✅</div>
          <div className="dd-stat-content">
            <div className="dd-stat-value">{stats.closed}</div>
            <div className="dd-stat-label">Closed Deals</div>
          </div>
        </div>

        <div className="dd-stat-card">
          <div className="dd-stat-icon">💰</div>
          <div className="dd-stat-content">
            <div className="dd-stat-value">
              {formatCurrency(stats.totalCommission)}
            </div>
            <div className="dd-stat-label">Total Commission</div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="dd-controls">
        <div className="dd-search">
          <input
            type="text"
            className="dd-search-input"
            placeholder="Search deals, clients, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="dd-search-icon">🔍</span>
        </div>

        <div className="dd-filters">
          <select
            className="dd-filter-select"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
          </select>

          <select
            className="dd-sort-select"
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split("-");
              setSortBy(sort);
              setSortOrder(order);
            }}
          >
            <option value="date-desc">Latest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="value-desc">Highest Value</option>
            <option value="value-asc">Lowest Value</option>
            <option value="commission-desc">Highest Commission</option>
            <option value="closing-asc">Closing Soon</option>
          </select>
        </div>
      </section>

      {/* Deals List */}
      <section className="dd-deals">
        {filteredDeals.length === 0 ? (
          <div className="dd-empty">
            <div className="dd-empty-icon">📋</div>
            <h3>No deals found</h3>
            <p>Try adjusting your search or filter criteria</p>
            <button className="dd-create-btn" onClick={handleCreateNewDeal}>
              Create Your First Deal
            </button>
          </div>
        ) : (
          <div className="dd-deals-grid">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="dd-deal-card">
                <div className="dd-deal-header">
                  <div className="dd-deal-id">#{deal.id}</div>
                  <div className="dd-deal-badges">
                    <span
                      className="dd-status-badge"
                      style={{ backgroundColor: getStatusColor(deal.status) }}
                    >
                      {deal.status}
                    </span>
                    <span
                      className="dd-priority-badge"
                      style={{ color: getPriorityColor(deal.priority) }}
                    >
                      {deal.priority}
                    </span>
                  </div>
                </div>

                <div className="dd-deal-content">
                  <h3 className="dd-deal-title">{deal.propertyTitle}</h3>
                  <div className="dd-deal-meta">
                    <span className="dd-deal-type">
                      {deal.propertyType} • {deal.dealType}
                    </span>
                    <span className="dd-deal-location">📍 {deal.location}</span>
                  </div>

                  <div className="dd-client-info">
                    <strong>{deal.clientName}</strong>
                    <span>{deal.clientPhone}</span>
                  </div>

                  <div className="dd-deal-financials">
                    <div className="dd-financial-item">
                      <span className="dd-financial-label">Deal Value:</span>
                      <span className="dd-financial-value">
                        {formatCurrency(deal.dealValue)}
                      </span>
                    </div>
                    <div className="dd-financial-item">
                      <span className="dd-financial-label">Commission:</span>
                      <span className="dd-financial-value">
                        {formatCurrency(deal.commission)}
                      </span>
                    </div>
                  </div>

                  <div className="dd-deal-dates">
                    <div className="dd-date-item">
                      <span>Created: {formatDate(deal.createdDate)}</span>
                    </div>
                    <div className="dd-date-item">
                      <span>
                        Expected Closing: {formatDate(deal.expectedClosing)}
                      </span>
                    </div>
                  </div>

                  {deal.notes && (
                    <div className="dd-deal-notes">
                      <strong>Notes:</strong> {deal.notes}
                    </div>
                  )}
                </div>

                <div className="dd-deal-actions">
                  <button
                    className="dd-action-btn dd-view-btn"
                    onClick={() => handleViewDetails(deal)}
                  >
                    View Details
                  </button>
                  <button
                    className="dd-action-btn dd-call-btn"
                    onClick={() => handleCallClient(deal.clientPhone)}
                  >
                    📞 Call
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Detail Modal */}
      {showModal && selectedDeal && (
        <div className="dd-modal" onClick={handleCloseModal}>
          <div
            className="dd-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dd-modal-header">
              <h3>Deal Details - #{selectedDeal.id}</h3>
              <button className="dd-modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <div className="dd-modal-body">
              <div className="dd-modal-section">
                <h4>Property Information</h4>
                <div className="dd-modal-grid">
                  <div>
                    <strong>Title:</strong> {selectedDeal.propertyTitle}
                  </div>
                  <div>
                    <strong>Type:</strong> {selectedDeal.propertyType}
                  </div>
                  <div>
                    <strong>Area:</strong> {selectedDeal.area}
                  </div>
                  <div>
                    <strong>Location:</strong> {selectedDeal.location}
                  </div>
                </div>
              </div>

              <div className="dd-modal-section">
                <h4>Deal Information</h4>
                <div className="dd-modal-grid">
                  <div>
                    <strong>Deal Type:</strong> {selectedDeal.dealType}
                  </div>
                  <div>
                    <strong>Status:</strong> {selectedDeal.status}
                  </div>
                  <div>
                    <strong>Priority:</strong> {selectedDeal.priority}
                  </div>
                  <div>
                    <strong>Stage:</strong> {selectedDeal.stage}
                  </div>
                </div>
              </div>

              <div className="dd-modal-section">
                <h4>Client Information</h4>
                <div className="dd-modal-grid">
                  <div>
                    <strong>Name:</strong> {selectedDeal.clientName}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedDeal.clientPhone}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedDeal.clientEmail}
                  </div>
                </div>
              </div>

              <div className="dd-modal-section">
                <h4>Financial Details</h4>
                <div className="dd-modal-grid">
                  <div>
                    <strong>Deal Value:</strong>{" "}
                    {formatCurrency(selectedDeal.dealValue)}
                  </div>
                  <div>
                    <strong>Commission:</strong>{" "}
                    {formatCurrency(selectedDeal.commission)}
                  </div>
                  <div>
                    <strong>Commission Rate:</strong>{" "}
                    {selectedDeal.commissionRate}%
                  </div>
                </div>
              </div>

              <div className="dd-modal-section">
                <h4>Timeline</h4>
                <div className="dd-modal-grid">
                  <div>
                    <strong>Created:</strong>{" "}
                    {formatDate(selectedDeal.createdDate)}
                  </div>
                  <div>
                    <strong>Last Activity:</strong>{" "}
                    {formatDate(selectedDeal.lastActivity)}
                  </div>
                  <div>
                    <strong>Expected Closing:</strong>{" "}
                    {formatDate(selectedDeal.expectedClosing)}
                  </div>
                </div>
              </div>

              {selectedDeal.notes && (
                <div className="dd-modal-section">
                  <h4>Notes</h4>
                  <p>{selectedDeal.notes}</p>
                </div>
              )}
            </div>

            <div className="dd-modal-actions">
              <button
                className="dd-modal-btn dd-call-btn"
                onClick={() => handleCallClient(selectedDeal.clientPhone)}
              >
                📞 Call Client
              </button>
              <button
                className="dd-modal-btn dd-email-btn"
                onClick={() => handleEmailClient(selectedDeal.clientEmail)}
              >
                ✉️ Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealsDashboard;
