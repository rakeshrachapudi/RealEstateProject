import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DocumentUploadModal from "./DocumentUploadModal";
import DealProgressBar from "./DealProgressBar";
import { BACKEND_BASE_URL } from "./config/config";

const DealDetailModal = ({
  deal: initialDeal,
  onClose,
  onUpdate,
  userRole,
  showOnlyOverview = false,
}) => {
  const [deal, setDeal] = useState(initialDeal || {});
  const [activeTab, setActiveTab] = useState("overview");
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [newStage, setNewStage] = useState(
    () => initialDeal?.currentStage || initialDeal?.stage || "INQUIRY"
  );

  const timelineEndRef = useRef(null);
  const navigate = useNavigate();

  const dealId = deal.id || deal.dealId;
  const currentDealStage = deal.currentStage || deal.stage || "INQUIRY";

  // Role-based tab visibility
  const isAgentOrAdmin = userRole === "AGENT" || userRole === "ADMIN";
  const displayTabs = isAgentOrAdmin
    ? ["overview", "timeline", "actions"]
    : ["overview"];

  useEffect(() => {
    if (initialDeal && initialDeal.dealId) {
      // Fetch full deal data using my-deals endpoint which returns DealDetailDTO with stage dates
      const fetchFullDeal = async () => {
        try {
          const response = await fetch(
            `${BACKEND_BASE_URL}/api/deals/my-deals?userRole=${userRole}&userId=${
              initialDeal.agentId || initialDeal.buyerId || initialDeal.sellerId
            }`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
          const data = await response.json();
          if (response.ok && data.data) {
            // Find the deal with matching dealId
            const foundDeal = data.data.find(
              (d) => d.dealId === initialDeal.dealId
            );
            if (foundDeal) {
              setDeal(foundDeal);
              console.log(
                "✅ Fetched full deal with timeline dates:",
                foundDeal
              );
              console.log("Stage dates:", {
                inquiryDate: foundDeal.inquiryDate,
                shortlistDate: foundDeal.shortlistDate,
                agreementDate: foundDeal.agreementDate,
              });
            } else {
              setDeal(initialDeal || {});
            }
          } else {
            setDeal(initialDeal || {});
          }
        } catch (err) {
          console.warn("Error fetching full deal:", err);
          setDeal(initialDeal || {});
        }
      };

      fetchFullDeal();
    } else {
      setDeal(initialDeal || {});
    }

    setNewStage(initialDeal?.currentStage || initialDeal?.stage || "INQUIRY");
    setNotes("");
    setVisitDate(new Date().toISOString().substring(0, 10));
  }, [initialDeal, userRole]);

  // ========== BUILD TIMELINE FROM STAGE DATE FIELDS ==========
  const getTimelineData = (dealData = {}) => {
    const stages = [
      { key: "inquiryDate", stage: "INQUIRY", label: "🔍 INQUIRY" },
      { key: "shortlistDate", stage: "SHORTLIST", label: "⭐ SHORTLIST" },
      { key: "negotiationDate", stage: "NEGOTIATION", label: "💬 NEGOTIATION" },
      { key: "agreementDate", stage: "AGREEMENT", label: "✅ AGREEMENT" },
      {
        key: "registrationDate",
        stage: "REGISTRATION",
        label: "📋 REGISTRATION",
      },
      { key: "paymentDate", stage: "PAYMENT", label: "💰 PAYMENT" },
      { key: "completedDate", stage: "COMPLETED", label: "🎉 COMPLETED" },
    ];

    let timeline = [];

    stages.forEach((stageItem) => {
      const date = dealData[stageItem.key];
      if (date) {
        timeline.push({
          stage: stageItem.stage,
          label: stageItem.label,
          date: date,
          formattedDate: new Date(date).toLocaleString(),
        });
      }
    });

    // Sort by date (oldest first)
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    // DEBUG LOGGING
    console.log("=== TIMELINE DEBUG ===");
    console.log("Deal object:", dealData);
    console.log("Timeline data:", timeline);
    console.log("Timeline length:", timeline.length);

    return timeline;
  };

  const timelineData = getTimelineData(deal);

  const scrollToTimelineEnd = (smooth = true) => {
    setTimeout(() => {
      if (timelineEndRef.current) {
        timelineEndRef.current.scrollIntoView({
          behavior: smooth ? "smooth" : "auto",
        });
      }
    }, 150);
  };

  const updateLocalAndParent = (updatedDeal) => {
    setDeal(updatedDeal);
    z;
    if (typeof onUpdate === "function") onUpdate(updatedDeal);
  };

  // ========== API HANDLERS ==========
  const handleUpdateStage = async () => {
    if (!visitDate || !notes.trim()) {
      alert(
        "❌ Please provide both the Date of Visit/Update and a Matter of Visit/Note."
      );
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/${dealId}/stage`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            stage: newStage,
            notes,
            date: visitDate,
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.data) {
        updateLocalAndParent(data.data);
        setNotes("");
        setVisitDate(new Date().toISOString().substring(0, 10));
        setActiveTab("timeline");
        scrollToTimelineEnd();
      } else {
        alert("❌ Error: " + (data.message || "Failed to update deal"));
      }
    } catch (err) {
      alert("Error updating deal: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSellerConfirm = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/${dealId}/seller-confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            notes: "Seller confirmed - Documents received",
          }),
        }
      );

      const data = await response.json();
      if (response.ok && data.data) {
        updateLocalAndParent(data.data);
        setActiveTab("timeline");
        scrollToTimelineEnd();
      } else {
        alert("❌ Error: " + (data.message || "Failed to confirm deal"));
      }
    } catch (err) {
      alert("Error confirming deal: " + err.message);
    }
  };

  const handleCompletePayment = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/${dealId}/complete-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      const data = await response.json();
      if (response.ok && data.data) {
        updateLocalAndParent(data.data);
        setActiveTab("timeline");
        scrollToTimelineEnd();
      } else {
        alert("❌ Error: " + (data.message || "Failed to complete payment"));
      }
    } catch (err) {
      alert("Error completing payment: " + err.message);
    }
  };

  const getStageOptions = (current) => {
    const stages = [
      "INQUIRY",
      "SHORTLIST",
      "NEGOTIATION",
      "AGREEMENT",
      "REGISTRATION",
      "PAYMENT",
      "COMPLETED",
    ];
    const currentIndex = Math.max(0, stages.indexOf(current));
    return stages.slice(currentIndex);
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
    if (!price) return "TBD";
    if (typeof price === "number") return price.toLocaleString("en-IN");
    return String(price);
  };

  const handleViewProperty = () => {
    navigate(`/property/${deal.propertyId || deal.property?.id}`);
    onClose();
  };

  if (!deal) return null;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button style={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>
            {deal.propertyTitle || deal.property?.title || "Deal Details"}
          </h2>
          <div
            style={{
              ...styles.stageBadge,
              backgroundColor: getStageColor(currentDealStage),
            }}
          >
            {currentDealStage}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          {displayTabs.includes("overview") && (
            <button
              onClick={() => setActiveTab("overview")}
              style={{
                ...styles.tab,
                ...(activeTab === "overview" ? styles.activeTab : {}),
              }}
            >
              📋 Overview
            </button>
          )}
          {displayTabs.includes("timeline") && (
            <button
              onClick={() => {
                setActiveTab("timeline");
                scrollToTimelineEnd();
              }}
              style={{
                ...styles.tab,
                ...(activeTab === "timeline" ? styles.activeTab : {}),
              }}
            >
              📅 Timeline
            </button>
          )}
          {displayTabs.includes("actions") && (
            <button
              onClick={() => setActiveTab("actions")}
              style={{
                ...styles.tab,
                ...(activeTab === "actions" ? styles.activeTab : {}),
              }}
            >
              ⚙️ Actions
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div style={styles.content}>
          {/* ========== OVERVIEW TAB ========== */}
          {activeTab === "overview" && (
            <div>
              <DealProgressBar
                deal={deal}
                isEditable={isAgentOrAdmin}
                onStageChange={onUpdate}
              />

              <div style={styles.gridContainer}>
                {/* Property Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>🏠 Property</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Title</span>
                      <span style={styles.value}>
                        {deal.propertyTitle ||
                          deal.property?.title ||
                          "Property"}
                      </span>
                    </div>
                    {deal.propertyPrice && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Listing Price</span>
                        <span style={styles.value}>
                          ₹{formatPrice(deal.propertyPrice)}
                        </span>
                      </div>
                    )}
                    {deal.agreedPrice && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Agreed Price</span>
                        <span style={styles.value}>
                          ₹{formatPrice(deal.agreedPrice)}
                        </span>
                      </div>
                    )}
                    {deal.propertyCity && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Location</span>
                        <span style={styles.value}>{deal.propertyCity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buyer Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>👤 Buyer</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Name</span>
                      <span style={styles.value}>
                        {deal.buyerName || "N/A"}
                      </span>
                    </div>
                    {deal.buyerEmail && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Email</span>
                        <span style={styles.value}>{deal.buyerEmail}</span>
                      </div>
                    )}
                    {deal.buyerMobile && isAgentOrAdmin && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Phone</span>
                        <span style={styles.value}>{deal.buyerMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seller Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>🏢 Seller</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Name</span>
                      <span style={styles.value}>
                        {deal.sellerName || "N/A"}
                      </span>
                    </div>
                    {deal.sellerEmail && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Email</span>
                        <span style={styles.value}>{deal.sellerEmail}</span>
                      </div>
                    )}
                    {deal.sellerMobile && isAgentOrAdmin && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Phone</span>
                        <span style={styles.value}>{deal.sellerMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>📊 Agent</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Name</span>
                      <span style={styles.value}>
                        {deal.agentName || "Not Assigned"}
                      </span>
                    </div>
                    {deal.agentEmail && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Email</span>
                        <span style={styles.value}>{deal.agentEmail}</span>
                      </div>
                    )}
                    {deal.agentMobile && isAgentOrAdmin && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Phone</span>
                        <span style={styles.value}>{deal.agentMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                {deal.notes && (
                  <div style={{ ...styles.section, gridColumn: "1 / -1" }}>
                    <h3 style={styles.sectionTitle}>📝 Notes</h3>
                    <div style={styles.notesBox}>{deal.notes}</div>
                  </div>
                )}

                {/* Dates Section */}
                <div style={{ ...styles.section, gridColumn: "1 / -1" }}>
                  <h3 style={styles.sectionTitle}>📅 Important Dates</h3>
                  <div style={styles.datesGrid}>
                    <div style={styles.dateItem}>
                      <span style={styles.label}>Created</span>
                      <span style={styles.value}>
                        {deal.createdAt
                          ? new Date(deal.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div style={styles.dateItem}>
                      <span style={styles.label}>Last Updated</span>
                      <span style={styles.value}>
                        {deal.updatedAt
                          ? new Date(deal.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== TIMELINE TAB ========== */}
          {activeTab === "timeline" && displayTabs.includes("timeline") && (
            <div>
              {timelineData.length > 0 ? (
                <div style={styles.timelineContainer}>
                  {timelineData.map((entry, index) => (
                    <div key={entry.stage} style={styles.timelineEntry}>
                      <div style={styles.timelinePin}></div>
                      <div style={styles.timelineStage}>{entry.label}</div>
                      <div style={styles.timelineDate}>
                        {entry.formattedDate}
                      </div>
                    </div>
                  ))}
                  <div ref={timelineEndRef}></div>
                </div>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    color: "#64748b",
                  }}
                >
                  📅 No timeline events yet. Update the deal stage to start
                  tracking.
                </div>
              )}
            </div>
          )}

          {/* ========== ACTIONS TAB ========== */}
          {activeTab === "actions" && displayTabs.includes("actions") && (
            <div>
              {/* Status Messages */}
              {currentDealStage === "REGISTRATION" && !deal.sellerConfirmed && (
                <div style={styles.successAlert}>
                  🎉 Registration Completed! Please confirm with seller.
                </div>
              )}
              {(currentDealStage === "COMPLETED" ||
                (currentDealStage === "PAYMENT" && deal.paymentCompleted)) && (
                <div style={styles.warningAlert}>
                  🎉 Deal Completed Successfully! Congratulations!
                </div>
              )}

              {/* Update Stage Form */}
              {userRole === "AGENT" && currentDealStage !== "COMPLETED" && (
                <div style={styles.actionCard}>
                  <h3 style={styles.actionTitle}>📋 Update Deal Stage</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Next Stage:</label>
                    <select
                      value={newStage}
                      onChange={(e) => setNewStage(e.target.value)}
                      style={styles.input}
                    >
                      {getStageOptions(currentDealStage).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date of Visit/Update:</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Matter/Notes:</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      style={{
                        ...styles.input,
                        minHeight: "100px",
                        resize: "vertical",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleUpdateStage}
                    disabled={updating}
                    style={styles.primaryBtn}
                  >
                    {updating ? "⏳ Updating..." : "✓ Update Stage"}
                  </button>
                </div>
              )}

              {/* Seller Confirm Button */}
              {currentDealStage === "REGISTRATION" &&
                !deal.sellerConfirmed &&
                userRole === "SELLER" && (
                  <button
                    onClick={handleSellerConfirm}
                    style={styles.successBtn}
                  >
                    ✓ Confirm Registration
                  </button>
                )}

              {/* Complete Payment Button */}
              {currentDealStage === "PAYMENT" &&
                !deal.paymentCompleted &&
                userRole === "AGENT" && (
                  <button
                    onClick={handleCompletePayment}
                    style={styles.warningBtn}
                  >
                    💰 Complete Payment
                  </button>
                )}

              {/* Document Upload */}
              <div style={styles.actionCard}>
                <button
                  onClick={() => setShowDocUpload(true)}
                  style={styles.secondaryBtn}
                >
                  📄 Upload/View Documents
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            onClick={handleViewProperty}
            style={styles.viewPropertyBtn}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#059669")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#10b981")}
          >
            🏠 View Property
          </button>
          <button
            onClick={onClose}
            style={styles.closeBottomBtn}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#4b5563")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#6b7280")}
          >
            Close
          </button>
        </div>
      </div>

      {/* Document Upload Modal */}
      {showDocUpload && (
        <DocumentUploadModal
          deal={deal}
          onClose={() => setShowDocUpload(false)}
        />
      )}
    </div>
  );
};

const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10001,
    overflowY: "auto",
    padding: "20px",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "1000px",
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
    boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
    padding: "32px",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    fontSize: "32px",
    cursor: "pointer",
    color: "#6b7280",
    padding: 0,
    width: "40px",
    height: "40px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #e5e7eb",
  },
  title: { fontSize: "28px", fontWeight: "800", color: "#1e293b", margin: 0 },
  stageBadge: {
    padding: "8px 16px",
    borderRadius: "20px",
    color: "white",
    fontWeight: "600",
    fontSize: "14px",
  },
  tabContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    borderBottom: "2px solid #e5e7eb",
    paddingBottom: "12px",
  },
  tab: {
    padding: "10px 20px",
    background: "#f8fafc",
    color: "#64748b",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  activeTab: { backgroundColor: "#3b82f6", color: "white" },
  content: { marginBottom: "24px" },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },
  section: {
    padding: "20px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 16px 0",
  },
  infoBox: { display: "flex", flexDirection: "column", gap: "12px" },
  infoRow: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#64748b" },
  value: { fontSize: "14px", fontWeight: "600", color: "#1e293b" },
  notesBox: {
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
  },
  datesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
  },
  dateItem: {
    padding: "12px",
    backgroundColor: "white",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },

  // Timeline Styles
  timelineContainer: {
    borderLeft: "3px solid #e2e8f0",
    paddingLeft: "20px",
    marginTop: "16px",
    marginBottom: "16px",
    maxHeight: "400px",
    overflowY: "auto",
  },
  timelineEntry: {
    marginBottom: "15px",
    position: "relative",
    paddingBottom: "5px",
    padding: "8px",
    borderRadius: "8px",
  },
  timelinePin: {
    position: "absolute",
    left: "-28px",
    top: "12px",
    height: "12px",
    width: "12px",
    backgroundColor: "#3b82f6",
    borderRadius: "50%",
    border: "2px solid white",
  },
  timelineStage: { fontWeight: "700", color: "#1f2937", fontSize: "15px" },
  timelineDate: { fontSize: "12px", color: "#64748b", marginTop: "4px" },

  // Action Cards
  actionCard: {
    padding: "20px",
    backgroundColor: "#f1f5f9",
    borderRadius: "8px",
    marginBottom: "16px",
  },
  actionTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 16px 0",
  },
  formGroup: { marginBottom: "12px" },
  input: {
    width: "100%",
    padding: "8px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    fontSize: "14px",
    marginTop: "4px",
    boxSizing: "border-box",
  },

  // Alerts
  successAlert: {
    padding: "20px",
    backgroundColor: "#ecfdf5",
    borderRadius: "8px",
    border: "1px solid #bbf7d0",
    textAlign: "center",
    fontWeight: "600",
    color: "#059669",
    marginBottom: "16px",
  },
  warningAlert: {
    padding: "20px",
    backgroundColor: "#fef3c7",
    borderRadius: "8px",
    border: "1px solid #fde68a",
    textAlign: "center",
    fontWeight: "600",
    color: "#b45309",
    marginBottom: "16px",
  },

  // Buttons
  primaryBtn: {
    padding: "10px 18px",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
  },
  successBtn: {
    padding: "10px 18px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "16px",
  },
  warningBtn: {
    padding: "10px 18px",
    backgroundColor: "#f59e0b",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "16px",
  },
  secondaryBtn: {
    width: "100%",
    padding: "10px 18px",
    backgroundColor: "#8b5cf6",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer",
  },

  footer: {
    display: "flex",
    gap: "12px",
    borderTop: "1px solid #e2e8f0",
    paddingTop: "20px",
  },
  viewPropertyBtn: {
    flex: 1,
    padding: "12px 20px",
    backgroundColor: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.2s",
  },
  closeBottomBtn: {
    flex: 1,
    padding: "12px 20px",
    backgroundColor: "#6b7280",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "14px",
    transition: "background 0.2s",
  },
};

export default DealDetailModal;
