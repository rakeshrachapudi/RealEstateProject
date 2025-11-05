// realestate-frontend/src/DealDetailModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DocumentUploadModal from "./DocumentUploadModal";
import DealProgressBar from "./DealProgressBar";
import { BACKEND_BASE_URL } from "./config/config";
import { useAuth } from "./AuthContext";
import "./DealDetailModal.css";

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
  const [docType, setDocType] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const [newStage, setNewStage] = useState(
    () => initialDeal?.currentStage || initialDeal?.stage || "INQUIRY"
  );

  const timelineEndRef = useRef(null);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const dealId = deal.id || deal.dealId;
  const currentDealStage = deal.currentStage || deal.stage || "INQUIRY";
  const effectiveRole = currentUser?.role || userRole;
  const isAgentOrAdmin = effectiveRole === "AGENT" || effectiveRole === "ADMIN";
  const displayTabs = showOnlyOverview
    ? ["overview"]
    : isAgentOrAdmin
    ? ["overview", "timeline", "actions"]
    : ["overview", "timeline"];

  useEffect(() => {
    if (initialDeal && initialDeal.dealId) {
      const fetchFullDeal = async () => {
        try {
          const response = await fetch(
            `${BACKEND_BASE_URL}/api/deals/my-deals?userRole=${effectiveRole}&userId=${
              initialDeal.agentId || initialDeal.buyerId || initialDeal.sellerId
            }`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
          const data = await response.json();
          if (response.ok && data?.data) {
            const found = data.data.find(
              (d) => d.dealId === initialDeal.dealId
            );
            setDeal(found || initialDeal || {});
          } else {
            setDeal(initialDeal || {});
          }
        } catch {
          setDeal(initialDeal || {});
        }
      };
      fetchFullDeal();
    } else {
      setDeal(initialDeal || {});
    }

    setNewStage(initialDeal?.currentStage || initialDeal?.stage || "INQUIRY");
    setError(null);
    setNotes("");
  }, [initialDeal, effectiveRole]);

  useEffect(() => {
    if (activeTab === "timeline" && timelineEndRef.current) {
      timelineEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab]);

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
    const n = Number(price);
    return Number.isFinite(n) ? n.toLocaleString("en-IN") : String(price);
  };

  const formatDateTime = (iso) => {
    if (!iso) return "Not set";
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getTimelineData = (d = {}) => {
    const map = [
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
    const tl = map
      .map((s) =>
        d[s.key]
          ? {
              ...s,
              date: d[s.key],
              formattedDate: new Date(d[s.key]).toLocaleString(),
            }
          : null
      )
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    return tl;
  };

  const timelineData = getTimelineData(deal);

  const refreshDealData = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/my-deals?userRole=${effectiveRole}&userId=${
          deal.agentId || deal.buyerId || deal.sellerId
        }`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok && data?.data) {
        const found = data.data.find((d) => d.dealId === dealId);
        if (found) {
          setDeal(found);
          onUpdate && onUpdate(found);
        }
      }
    } catch {
      // noop
    }
  };

  const handleUpdateStage = async () => {
    if (!newStage) {
      setError("Please select a new stage to update.");
      return;
    }
    if (newStage === currentDealStage) {
      setError("Please select a new stage different from current.");
      return;
    }

    setUpdating(true);
    setError(null);
    try {
      const payload = { stage: newStage, notes: notes || "" };
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/${dealId}/stage`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        setError(text || `Unexpected server response (${response.status})`);
        setUpdating(false);
        return;
      }

      if (response.ok && data?.data) {
        const updated = data.data;
        setDeal(updated);
        onUpdate && onUpdate(updated);
        setNotes("");
        setActiveTab("timeline");
        setTimeout(
          () => timelineEndRef.current?.scrollIntoView({ behavior: "smooth" }),
          150
        );
      } else {
        setError(
          data?.message || `Failed to update stage (Status: ${response.status})`
        );
      }
    } catch {
      setError("Network error. Please try again later.");
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
      if (response.ok && data?.data) {
        setDeal(data.data);
        onUpdate && onUpdate(data.data);
        setActiveTab("timeline");
      } else {
        alert("Error: " + (data?.message || "Failed"));
      }
    } catch (err) {
      alert("Error: " + err.message);
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
      if (response.ok && data?.data) {
        setDeal(data.data);
        onUpdate && onUpdate(data.data);
        setActiveTab("timeline");
      } else {
        alert("Error: " + (data?.message || "Failed"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const openDocumentUpload = (type = null) => {
    setDocType(type);
    setShowDocUpload(true);
  };

  const handleViewProperty = () => {
    navigate(`/property/${deal.propertyId || deal.property?.id}`);
    onClose && onClose();
  };

  if (!deal) return null;

  return (
    <div
      className="ddm-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ddm-title"
    >
      <div
        className="ddm-modal"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <button className="ddm-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="ddm-header">
          <h2 id="ddm-title" className="ddm-title">
            {deal.propertyTitle || deal.property?.title || "Deal Details"}
          </h2>
          <div
            className="ddm-stage"
            style={{ backgroundColor: getStageColor(currentDealStage) }}
          >
            {currentDealStage}
          </div>
        </div>

        <div className="ddm-tabs" role="tablist">
          {displayTabs.includes("overview") && (
            <button
              className={`ddm-tab ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
              role="tab"
              aria-selected={activeTab === "overview"}
            >
              📋 Overview
            </button>
          )}
          {displayTabs.includes("timeline") && (
            <button
              className={`ddm-tab ${activeTab === "timeline" ? "active" : ""}`}
              onClick={() => setActiveTab("timeline")}
              role="tab"
              aria-selected={activeTab === "timeline"}
            >
              📅 Timeline
            </button>
          )}
          {displayTabs.includes("actions") && isAgentOrAdmin && (
            <button
              className={`ddm-tab ${activeTab === "actions" ? "active" : ""}`}
              onClick={() => setActiveTab("actions")}
              role="tab"
              aria-selected={activeTab === "actions"}
            >
              ⚙️ Actions
            </button>
          )}
        </div>

        <div className="ddm-content">
          {activeTab === "overview" && (
            <div className="ddm-section">
              <h3 className="ddm-section-title">Deal Overview</h3>
              <DealProgressBar
                deal={deal}
                isEditable={isAgentOrAdmin}
                onStageChange={onUpdate}
              />

              {isAgentOrAdmin && (
                <div className="ddm-docs">
                  <h3 className="ddm-subtitle">📄 Required Documents</h3>
                  <div className="ddm-doc-grid">
                    <div className="ddm-doc-card">
                      <div className="ddm-doc-head">
                        <span className="ddm-doc-label">
                          📝 Agreement Document
                        </span>
                        <span
                          className={`ddm-badge ${
                            deal.agreementUploaded ? "ok" : "pending"
                          }`}
                        >
                          {deal.agreementUploaded
                            ? "✅ Uploaded"
                            : "⏳ Pending"}
                        </span>
                      </div>
                      <div className="ddm-doc-info">
                        Required to move to Registration stage
                      </div>
                      {!deal.agreementUploaded && (
                        <button
                          className="ddm-btn ddm-btn-primary"
                          onClick={() => openDocumentUpload("AGREEMENT")}
                        >
                          📤 Upload Agreement
                        </button>
                      )}
                    </div>

                    <div className="ddm-doc-card">
                      <div className="ddm-doc-head">
                        <span className="ddm-doc-label">
                          📋 Registration Document
                        </span>
                        <span
                          className={`ddm-badge ${
                            deal.registrationUploaded ? "ok" : "pending"
                          }`}
                        >
                          {deal.registrationUploaded
                            ? "✅ Uploaded"
                            : "⏳ Pending"}
                        </span>
                      </div>
                      <div className="ddm-doc-info">
                        Required to move to Payment stage
                      </div>
                      {!deal.registrationUploaded && (
                        <button
                          className="ddm-btn ddm-btn-primary"
                          onClick={() => openDocumentUpload("REGISTRATION")}
                          disabled={currentDealStage !== "REGISTRATION"}
                        >
                          📤 Upload Registration
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="ddm-grid">
                <div className="ddm-card">
                  <h3 className="ddm-subtitle">🏠 Property</h3>
                  <div className="ddm-info">
                    <div className="ddm-row">
                      <span className="ddm-label">Title</span>
                      <span className="ddm-value">
                        {deal.propertyTitle ||
                          deal.property?.title ||
                          "Property"}
                      </span>
                    </div>
                    {deal.propertyPrice && (
                      <div className="ddm-row">
                        <span className="ddm-label">Listing Price</span>
                        <span className="ddm-value">
                          ₹{formatPrice(deal.propertyPrice)}
                        </span>
                      </div>
                    )}
                    {deal.agreedPrice && (
                      <div className="ddm-row">
                        <span className="ddm-label">Agreed Price</span>
                        <span className="ddm-value">
                          ₹{formatPrice(deal.agreedPrice)}
                        </span>
                      </div>
                    )}
                    {deal.propertyCity && (
                      <div className="ddm-row">
                        <span className="ddm-label">Location</span>
                        <span className="ddm-value">{deal.propertyCity}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ddm-card">
                  <h3 className="ddm-subtitle">👤 Buyer</h3>
                  <div className="ddm-info">
                    <div className="ddm-row">
                      <span className="ddm-label">Name</span>
                      <span className="ddm-value">
                        {deal.buyerName || "N/A"}
                      </span>
                    </div>
                    {deal.buyerEmail && (
                      <div className="ddm-row">
                        <span className="ddm-label">Email</span>
                        <span className="ddm-value">{deal.buyerEmail}</span>
                      </div>
                    )}
                    {deal.buyerMobile && isAgentOrAdmin && (
                      <div className="ddm-row">
                        <span className="ddm-label">Phone</span>
                        <span className="ddm-value">{deal.buyerMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ddm-card">
                  <h3 className="ddm-subtitle">🏢 Seller</h3>
                  <div className="ddm-info">
                    <div className="ddm-row">
                      <span className="ddm-label">Name</span>
                      <span className="ddm-value">
                        {deal.sellerName || "N/A"}
                      </span>
                    </div>
                    {deal.sellerEmail && (
                      <div className="ddm-row">
                        <span className="ddm-label">Email</span>
                        <span className="ddm-value">{deal.sellerEmail}</span>
                      </div>
                    )}
                    {deal.sellerMobile && isAgentOrAdmin && (
                      <div className="ddm-row">
                        <span className="ddm-label">Phone</span>
                        <span className="ddm-value">{deal.sellerMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ddm-card">
                  <h3 className="ddm-subtitle">📊 Agent</h3>
                  <div className="ddm-info">
                    <div className="ddm-row">
                      <span className="ddm-label">Name</span>
                      <span className="ddm-value">
                        {deal.agentName || "Not Assigned"}
                      </span>
                    </div>
                    {deal.agentEmail && (
                      <div className="ddm-row">
                        <span className="ddm-label">Email</span>
                        <span className="ddm-value">{deal.agentEmail}</span>
                      </div>
                    )}
                    {deal.agentMobile && isAgentOrAdmin && (
                      <div className="ddm-row">
                        <span className="ddm-label">Phone</span>
                        <span className="ddm-value">{deal.agentMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                {deal.notes && (
                  <div className="ddm-card ddm-col-span-all">
                    <h3 className="ddm-subtitle">📝 Notes</h3>
                    <div className="ddm-notes">{deal.notes}</div>
                  </div>
                )}

                <div className="ddm-card ddm-col-span-all">
                  <h3 className="ddm-subtitle">📅 Important Dates</h3>
                  <div className="ddm-dates">
                    <div className="ddm-date-item">
                      <span className="ddm-label">Created</span>
                      <span className="ddm-value">
                        {deal.createdAt
                          ? new Date(deal.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className="ddm-date-item">
                      <span className="ddm-label">Last Updated</span>
                      <span className="ddm-value">
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

          {activeTab === "timeline" && (
            <div className="ddm-section">
              <h3 className="ddm-section-title">Deal Timeline</h3>
              {timelineData.length > 0 ? (
                <div className="ddm-timeline">
                  {timelineData.map((entry) => (
                    <div key={entry.stage} className="ddm-tl-entry">
                      <div className="ddm-tl-pin" />
                      <div className="ddm-tl-stage">{entry.label}</div>
                      <div className="ddm-tl-date">{entry.formattedDate}</div>
                    </div>
                  ))}
                  <div ref={timelineEndRef} />
                </div>
              ) : (
                <div className="ddm-empty-tl">
                  📅 No timeline events yet. Update the deal stage to start
                  tracking.
                </div>
              )}
            </div>
          )}

          {activeTab === "actions" && isAgentOrAdmin && (
            <div className="ddm-section ddm-actions">
              {currentDealStage === "REGISTRATION" && !deal.sellerConfirmed && (
                <div className="ddm-alert ddm-alert-success">
                  🎉 Registration completed! Please confirm with seller.
                </div>
              )}
              {(currentDealStage === "COMPLETED" ||
                (currentDealStage === "PAYMENT" && deal.paymentCompleted)) && (
                <div className="ddm-alert ddm-alert-warn">
                  🎉 Deal completed successfully! Congratulations!
                </div>
              )}

              <div className="ddm-form-card">
                <h3 className="ddm-subtitle">📋 Update Deal Stage</h3>
                <div className="ddm-field">
                  <label className="ddm-label">Next Stage</label>
                  <select
                    value={newStage}
                    onChange={(e) => {
                      setNewStage(e.target.value);
                      setError(null);
                    }}
                    className="ddm-input"
                  >
                    {getStageOptions(currentDealStage).map((s) => (
                      <option
                        key={s}
                        value={s}
                        disabled={s === currentDealStage}
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ddm-field">
                  <label className="ddm-label">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="ddm-input ddm-textarea"
                    placeholder="Add notes if needed..."
                  />
                </div>

                {error && <div className="ddm-error">{error}</div>}

                <button
                  onClick={handleUpdateStage}
                  disabled={updating || newStage === currentDealStage}
                  className="ddm-btn ddm-btn-primary"
                >
                  {updating ? "⏳ Updating..." : "✓ Update Stage"}
                </button>
              </div>

              {currentDealStage === "REGISTRATION" &&
                !deal.sellerConfirmed &&
                effectiveRole === "SELLER" && (
                  <button
                    className="ddm-btn ddm-btn-success"
                    onClick={handleSellerConfirm}
                  >
                    ✓ Confirm Registration
                  </button>
                )}

              {currentDealStage === "PAYMENT" &&
                !deal.paymentCompleted &&
                effectiveRole === "AGENT" && (
                  <button
                    className="ddm-btn ddm-btn-warn"
                    onClick={handleCompletePayment}
                  >
                    💰 Complete Payment
                  </button>
                )}

              <div className="ddm-form-card">
                <h3 className="ddm-subtitle">📄 Document Management</h3>
                <button
                  className="ddm-btn ddm-btn-secondary"
                  onClick={() => openDocumentUpload(null)}
                >
                  📄 Upload General Document
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="ddm-footer">
          <button
            className="ddm-btn ddm-btn-success"
            onClick={handleViewProperty}
          >
            🏠 View Property
          </button>
          <button className="ddm-btn ddm-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {showDocUpload && (
        <DocumentUploadModal
          dealId={dealId}
          propertyId={deal.propertyId || deal.property?.id}
          docType={docType}
          onClose={() => {
            setShowDocUpload(false);
            setDocType(null);
          }}
          onSuccess={async () => {
            await refreshDealData();
          }}
        />
      )}
    </div>
  );
};

export default DealDetailModal;
