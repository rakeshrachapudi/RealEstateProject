// realestate-frontend/src/DealProgressBar.jsx
import React, { useState, useMemo } from "react";
import { BACKEND_BASE_URL } from "./config/config";
import "./DealProgressBar.css";

const DealProgressBar = ({ deal, onStageChange, isEditable = false }) => {
  const stages = useMemo(
    () => [
      { stage: "INQUIRY", label: "🔍 Inquiry" },
      { stage: "SHORTLIST", label: "⭐ Shortlist" },
      { stage: "NEGOTIATION", label: "💬 Negotiation" },
      { stage: "AGREEMENT", label: "✅ Agreement" },
      { stage: "REGISTRATION", label: "📋 Registration" },
      { stage: "PAYMENT", label: "💰 Payment" },
      { stage: "COMPLETED", label: "🎉 Completed" },
    ],
    []
  );

  const [showStageMenu, setShowStageMenu] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const currentStage = deal?.stage || deal?.currentStage || "INQUIRY";
  const currentIndex = Math.max(
    0,
    stages.findIndex((s) => s.stage === currentStage)
  );
  const progressPct = ((currentIndex + 1) / stages.length) * 100;

  const canMoveToStage = (targetStage) => {
    if (targetStage === "REGISTRATION") {
      if (!deal?.isAgreementUploaded && !deal?.agreementUploaded) {
        return {
          allowed: false,
          message:
            "⚠️ Upload the Agreement document before moving to Registration.",
        };
      }
    }
    if (targetStage === "PAYMENT") {
      if (!deal?.isRegistrationUploaded && !deal?.registrationUploaded) {
        return {
          allowed: false,
          message:
            "⚠️ Upload the Registration document before moving to Payment.",
        };
      }
    }
    return { allowed: true };
  };

  const isStageDisabled = (targetStage) => !canMoveToStage(targetStage).allowed;
  const getStageTooltip = (targetStage) =>
    !canMoveToStage(targetStage).allowed
      ? canMoveToStage(targetStage).message
      : isEditable
      ? "Click to move to this stage"
      : "";

  const handleStageClick = async (newStage) => {
    if (!isEditable) return;

    const validation = canMoveToStage(newStage);
    if (!validation.allowed) {
      alert(validation.message);
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/${deal.id || deal.dealId}/stage`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ stage: newStage, notes: selectedNotes }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        onStageChange && onStageChange(newStage, data);
        setShowStageMenu(false);
        setSelectedNotes("");
        alert("✅ Deal stage updated");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(
          "❌ Failed to update stage: " +
            (errorData.message || `Status ${response.status}`)
        );
      }
    } catch (err) {
      console.error("Error updating stage:", err);
      alert("❌ Error updating deal");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="dpb">
      <h3 className="dpb-title">
        📊 Deal Progress: {stages[currentIndex]?.label}
      </h3>

      <div className="dpb-docs">
        <div
          className={`dpb-doc ${
            deal?.isAgreementUploaded || deal?.agreementUploaded
              ? "ok"
              : "pending"
          }`}
          title="Agreement document status"
        >
          {deal?.isAgreementUploaded || deal?.agreementUploaded ? "✅" : "⏳"}
          <span>Agreement Doc</span>
        </div>
        <div
          className={`dpb-doc ${
            deal?.isRegistrationUploaded || deal?.registrationUploaded
              ? "ok"
              : "pending"
          }`}
          title="Registration document status"
        >
          {deal?.isRegistrationUploaded || deal?.registrationUploaded
            ? "✅"
            : "⏳"}
          <span>Registration Doc</span>
        </div>
      </div>

      <div className="dpb-bar">
        <div className="dpb-line" />
        <div className="dpb-line-filled" style={{ width: `${progressPct}%` }} />
        {stages.map((s, idx) => (
          <div
            key={s.stage}
            className="dpb-stage"
            onClick={() => isEditable && handleStageClick(s.stage)}
            title={getStageTooltip(s.stage)}
          >
            <div
              className={`dpb-badge ${idx <= currentIndex ? "active" : ""} ${
                idx === currentIndex ? "current" : ""
              }`}
            >
              {idx + 1}
            </div>
            <div className="dpb-label">{s.label}</div>
          </div>
        ))}
      </div>

      {isEditable && (
        <div className="dpb-actions">
          <button
            className="dpb-btn dpb-btn-primary"
            onClick={() => setShowStageMenu((v) => !v)}
            disabled={updating}
          >
            {showStageMenu ? "✕ Close" : "✏️ Change Stage"}
          </button>

          {showStageMenu && (
            <div className="dpb-menu">
              <textarea
                className="dpb-textarea"
                value={selectedNotes}
                onChange={(e) => setSelectedNotes(e.target.value)}
                placeholder="Add notes about this stage change..."
              />
              {stages.map((s) => {
                const disabled = isStageDisabled(s.stage);
                const validation = canMoveToStage(s.stage);
                return (
                  <div key={s.stage}>
                    <button
                      className={`dpb-btn dpb-btn-stage ${
                        s.stage === currentStage ? "current" : ""
                      } ${disabled ? "disabled" : ""}`}
                      onClick={() => !disabled && handleStageClick(s.stage)}
                      disabled={updating || disabled}
                      title={!validation.allowed ? validation.message : ""}
                    >
                      {s.label} {s.stage === currentStage && "✓"}
                      {disabled && " 🔒"}
                    </button>
                    {disabled && !validation.allowed && (
                      <div className="dpb-warning">{validation.message}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DealProgressBar;
