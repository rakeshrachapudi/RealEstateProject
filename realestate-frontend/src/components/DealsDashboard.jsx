import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { BACKEND_BASE_URL } from "../config/config";

const DealsDashboard = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [filter, setFilter] = useState("all"); // all, active, completed

  useEffect(() => {
    fetchDeals();
  }, [user]);

  const fetchDeals = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      let allDeals = [];

      // Fetch as buyer
      const buyerResponse = await fetch(
        `${BACKEND_BASE_URL}/api/deals/buyer/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (buyerResponse.ok) {
        const buyerData = await buyerResponse.json();
        const buyerDeals = Array.isArray(buyerData)
          ? buyerData
          : buyerData.data || [];
        allDeals = [...allDeals, ...buyerDeals];
      }

      // Fetch as agent (if applicable)
      if (user.role === "AGENT" || user.role === "ADMIN") {
        const agentResponse = await fetch(
          `${BACKEND_BASE_URL}/api/deals/agent/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );

        if (agentResponse.ok) {
          const agentData = await agentResponse.json();
          const agentDeals = Array.isArray(agentData)
            ? agentData
            : agentData.data || [];
          allDeals = [...allDeals, ...agentDeals];
        }
      }

      setDeals(allDeals);
    } catch (err) {
      console.error("Error fetching deals:", err);
    } finally {
      setLoading(false);
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

  const getStageLabel = (stage) => {
    const labels = {
      INQUIRY: "🔍 Inquiry",
      SHORTLIST: "⭐ Shortlist",
      NEGOTIATION: "💬 Negotiation",
      AGREEMENT: "✅ Agreement",
      REGISTRATION: "📋 Registration",
      PAYMENT: "💰 Payment",
      COMPLETED: "🎉 Completed",
    };
    return labels[stage] || stage;
  };

  const filteredDeals = deals.filter((deal) => {
    if (filter === "all") return true;
    if (filter === "active") return deal.stage !== "COMPLETED";
    if (filter === "completed") return deal.stage === "COMPLETED";
    return true;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>⏳ Loading your deals...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        <button
          style={{
            ...styles.filterTab,
            ...(filter === "all" ? styles.activeTab : {}),
          }}
          onClick={() => setFilter("all")}
        >
          All Deals ({deals.length})
        </button>
        <button
          style={{
            ...styles.filterTab,
            ...(filter === "active" ? styles.activeTab : {}),
          }}
          onClick={() => setFilter("active")}
        >
          Active ({deals.filter((d) => d.stage !== "COMPLETED").length})
        </button>
        <button
          style={{
            ...styles.filterTab,
            ...(filter === "completed" ? styles.activeTab : {}),
          }}
          onClick={() => setFilter("completed")}
        >
          Completed ({deals.filter((d) => d.stage === "COMPLETED").length})
        </button>
      </div>

      {filteredDeals.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <p style={styles.emptyText}>No deals found</p>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              style={{
                padding: "8px 16px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "12px",
                fontSize: "14px",
              }}
            >
              View All Deals
            </button>
          )}
        </div>
      ) : (
        <div style={styles.dealsGrid}>
          {filteredDeals.map((deal) => (
            <div
              key={deal.id}
              style={styles.dealCard}
              onClick={() => setSelectedDeal(deal)}
            >
              {/* Stage Badge */}
              <div
                style={{
                  ...styles.stageBadge,
                  backgroundColor: getStageColor(deal.stage),
                }}
              >
                {getStageLabel(deal.stage)}
              </div>

              {/* Property Title */}
              <h3 style={styles.dealTitle}>{deal.property?.title}</h3>

              {/* Price */}
              <div style={styles.price}>
                ₹{(deal.property?.price || 0).toLocaleString("en-IN")}
              </div>

              {/* Buyer/Agent Info */}
              <div style={styles.dealInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Buyer:</span>
                  <span>
                    {deal.buyer?.firstName} {deal.buyer?.lastName}
                  </span>
                </div>
                {deal.agent && (
                  <div style={styles.infoRow}>
                    <span style={styles.label}>Agent:</span>
                    <span>{deal.agent?.firstName || "Unassigned"}</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${
                      ((Object.values([
                        "INQUIRY",
                        "SHORTLIST",
                        "NEGOTIATION",
                        "AGREEMENT",
                        "REGISTRATION",
                        "PAYMENT",
                        "COMPLETED",
                      ]).indexOf(deal.stage) +
                        1) /
                        7) *
                      100
                    }%`,
                    backgroundColor: getStageColor(deal.stage),
                  }}
                ></div>
              </div>

              {/* Date */}
              <div style={styles.date}>
                {new Date(deal.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <div style={styles.modal} onClick={() => setSelectedDeal(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              style={styles.closeBtn}
              onClick={() => setSelectedDeal(null)}
            >
              ×
            </button>

            <h2 style={styles.modalTitle}>📋 Deal Details</h2>

            <div style={styles.modalBody}>
              {/* Current Stage */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Current Stage</h3>
                <div
                  style={{
                    ...styles.stageBadgeLarge,
                    backgroundColor: getStageColor(selectedDeal.stage),
                  }}
                >
                  {getStageLabel(selectedDeal.stage)}
                </div>
              </div>

              {/* Property */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Property</h3>
                <div style={styles.infoBox}>
                  <div>
                    <strong>{selectedDeal.property?.title}</strong>
                  </div>
                  <div>
                    💰 ₹
                    {(selectedDeal.property?.price || 0).toLocaleString(
                      "en-IN"
                    )}
                  </div>
                  <div>🛏️ {selectedDeal.property?.bedrooms} BHK</div>
                  <div>📐 {selectedDeal.property?.areaSqft} sqft</div>
                </div>
              </div>

              {/* Parties */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Parties Involved</h3>
                <div style={styles.infoBox}>
                  <div>
                    <strong>Buyer:</strong> {selectedDeal.buyer?.firstName}{" "}
                    {selectedDeal.buyer?.lastName}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedDeal.buyer?.email}
                  </div>
                  <div>
                    <strong>Phone:</strong> {selectedDeal.buyer?.mobileNumber}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Timeline</h3>
                <div style={styles.infoBox}>
                  <div>
                    <strong>Created:</strong>{" "}
                    {new Date(selectedDeal.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <strong>Last Updated:</strong>{" "}
                    {new Date(selectedDeal.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedDeal.notes && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Notes</h3>
                  <div style={styles.notesBox}>{selectedDeal.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginTop: "20px",
  },
  filterTabs: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    borderBottom: "2px solid #e2e8f0",
  },
  filterTab: {
    padding: "12px 20px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    color: "#64748b",
    borderBottom: "3px solid transparent",
  },
  activeTab: {
    color: "#3b82f6",
    borderBottomColor: "#3b82f6",
  },
  loadingState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#64748b",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "2px dashed #e2e8f0",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },
  emptyText: {
    color: "#64748b",
    fontSize: "16px",
  },
  dealsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  dealCard: {
    padding: "16px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    transition: "all 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  stageBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "6px",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
    marginBottom: "12px",
  },
  dealTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  price: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#10b981",
    marginBottom: "12px",
  },
  dealInfo: {
    fontSize: "13px",
    color: "#64748b",
    marginBottom: "12px",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  label: {
    fontWeight: "600",
    color: "#475569",
  },
  progressBar: {
    width: "100%",
    height: "6px",
    backgroundColor: "#e2e8f0",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "12px",
  },
  progressFill: {
    height: "100%",
    transition: "width 0.3s",
  },
  date: {
    fontSize: "12px",
    color: "#94a3b8",
  },
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
    width: "90%",
    maxWidth: "600px",
    maxHeight: "90vh",
    overflow: "auto",
    position: "relative",
    padding: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
  },
  closeBtn: {
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#6b7280",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "20px",
  },
  modalBody: {
    marginTop: "20px",
  },
  section: {
    marginBottom: "20px",
    paddingBottom: "20px",
    borderBottom: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "12px",
    textTransform: "uppercase",
  },
  stageBadgeLarge: {
    display: "inline-block",
    padding: "12px 20px",
    borderRadius: "8px",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
  },
  infoBox: {
    padding: "12px",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: "1.8",
  },
  notesBox: {
    padding: "12px",
    backgroundColor: "#fffbeb",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#78350f",
    borderLeft: "4px solid #f59e0b",
  },
};

export default DealsDashboard;
