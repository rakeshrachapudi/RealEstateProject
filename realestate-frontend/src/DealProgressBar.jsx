import React, { useState } from "react";
import { BACKEND_BASE_URL } from "./config/config";

const DealProgressBar = ({ deal, onStageChange, isEditable = false }) => {
  const stages = [
    { stage: "INQUIRY", label: "🔍 Inquiry", order: 1 },
    { stage: "SHORTLIST", label: "⭐ Shortlist", order: 2 },
    { stage: "NEGOTIATION", label: "💬 Negotiation", order: 3 },
    { stage: "AGREEMENT", label: "✅ Agreement", order: 4 },
    { stage: "REGISTRATION", label: "📋 Registration", order: 5 },
    { stage: "PAYMENT", label: "💰 Payment", order: 6 },
    { stage: "COMPLETED", label: "🎉 Completed", order: 7 },
  ];

  const [showStageMenu, setShowStageMenu] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  const getCurrentStageIndex = () => {
    return stages.findIndex(
      (s) => s.stage === deal.stage || s.stage === deal.currentStage
    );
  };

  const getProgressPercentage = () => {
    const index = getCurrentStageIndex();
    return ((index + 1) / stages.length) * 100;
  };

  const currentIndex = getCurrentStageIndex();
  const currentStage = deal.stage || deal.currentStage;

  // ✅ NEW: Validation function to check if stage change is allowed
  const canMoveToStage = (targetStage) => {
    // Moving to REGISTRATION requires AGREEMENT document
    if (targetStage === "REGISTRATION") {
      if (!deal.isAgreementUploaded && !deal.agreementUploaded) {
        return {
          allowed: false,
          message: "⚠️ Please upload Agreement document before moving to Registration stage"
        };
      }
    }

    // Moving to PAYMENT requires REGISTRATION document
    if (targetStage === "PAYMENT") {
      if (!deal.isRegistrationUploaded && !deal.registrationUploaded) {
        return {
          allowed: false,
          message: "⚠️ Please upload Registration document before moving to Payment stage"
        };
      }
    }

    return { allowed: true };
  };

  const handleStageClick = async (newStage) => {
    if (!isEditable) return;

    // ✅ NEW: Validate before allowing stage change
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
          body: JSON.stringify({
            stage: newStage,
            notes: selectedNotes,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (onStageChange) onStageChange(newStage, data);
        setShowStageMenu(false);
        setSelectedNotes("");
        alert("✅ Deal stage updated");
      } else {
        const errorData = await response.json();
        alert("❌ Failed to update stage: " + (errorData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      alert("❌ Error updating deal");
    } finally {
      setUpdating(false);
    }
  };

  // ✅ NEW: Function to check if a stage button should be disabled
  const isStageDisabled = (targetStage) => {
    const validation = canMoveToStage(targetStage);
    return !validation.allowed;
  };

  // ✅ NEW: Function to get tooltip for disabled stages
  const getStageTooltip = (targetStage) => {
    const validation = canMoveToStage(targetStage);
    if (!validation.allowed) {
      return validation.message;
    }
    return isEditable ? "Click to move to this stage" : "";
  };

  const containerStyle = {
    padding: "24px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    marginBottom: "24px",
    border: "1px solid #e2e8f0",
  };

  const progressBarStyle = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "24px",
    position: "relative",
  };

  const progressLineStyle = {
    position: "absolute",
    top: "20px",
    left: "0",
    right: "0",
    height: "3px",
    backgroundColor: "#e2e8f0",
    zIndex: 0,
  };

  const progressLineFilledStyle = {
    position: "absolute",
    top: "20px",
    left: "0",
    height: "3px",
    backgroundColor: "#10b981",
    transition: "width 0.3s ease",
    width: `${getProgressPercentage()}%`,
    zIndex: 0,
  };

  const stageItemStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    zIndex: 1,
    position: "relative",
  };

  const stageBadgeStyle = (index) => ({
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "8px",
    fontWeight: "700",
    fontSize: "16px",
    backgroundColor: index <= currentIndex ? "#10b981" : "#e2e8f0",
    color: index <= currentIndex ? "white" : "#64748b",
    transition: "all 0.3s ease",
    border: index === currentIndex ? "3px solid #059669" : "none",
    boxShadow:
      index === currentIndex ? "0 0 12px rgba(16, 185, 129, 0.4)" : "none",
    cursor: isEditable ? "pointer" : "default",
  });

  const stageLabelStyle = {
    fontSize: "11px",
    fontWeight: "600",
    color: "#475569",
    textAlign: "center",
    maxWidth: "70px",
  };

  return (
    <div style={containerStyle}>
      <h3
        style={{
          marginTop: 0,
          marginBottom: "16px",
          color: "#1e293b",
          fontSize: "16px",
        }}
      >
        📊 Deal Progress: {stages[currentIndex]?.label}
      </h3>

      {/* ✅ NEW: Document Status Indicators */}
      <div style={{
        display: "flex",
        gap: "12px",
        marginBottom: "16px",
        padding: "12px",
        backgroundColor: "#f1f5f9",
        borderRadius: "8px",
        fontSize: "13px",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: deal.isAgreementUploaded || deal.agreementUploaded ? "#10b981" : "#6b7280"
        }}>
          {deal.isAgreementUploaded || deal.agreementUploaded ? "✅" : "⏳"}
          <span style={{ fontWeight: "600" }}>Agreement Doc</span>
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: deal.isRegistrationUploaded || deal.registrationUploaded ? "#10b981" : "#6b7280"
        }}>
          {deal.isRegistrationUploaded || deal.registrationUploaded ? "✅" : "⏳"}
          <span style={{ fontWeight: "600" }}>Registration Doc</span>
        </div>
      </div>

      <div style={progressBarStyle}>
        <div style={progressLineStyle}></div>
        <div style={progressLineFilledStyle}></div>

        {stages.map((stageObj, index) => (
          <div
            key={stageObj.stage}
            style={stageItemStyle}
            onClick={() => isEditable && handleStageClick(stageObj.stage)}
            title={getStageTooltip(stageObj.stage)}
          >
            <div style={stageBadgeStyle(index)}>{index + 1}</div>
            <div style={stageLabelStyle}>{stageObj.label}</div>
          </div>
        ))}
      </div>

      {isEditable && (
        <div
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <button
            onClick={() => setShowStageMenu(!showStageMenu)}
            style={{
              padding: "10px 16px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
            disabled={updating}
          >
            {showStageMenu ? "✕ Close" : "✏️ Change Stage"}
          </button>

          {showStageMenu && (
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <textarea
                value={selectedNotes}
                onChange={(e) => setSelectedNotes(e.target.value)}
                placeholder="Add notes about this stage change..."
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  minHeight: "60px",
                  boxSizing: "border-box",
                }}
              />
              {stages.map((stage) => {
                const disabled = isStageDisabled(stage.stage);
                const validation = canMoveToStage(stage.stage);

                return (
                  <div key={stage.stage}>
                    <button
                      onClick={() => !disabled && handleStageClick(stage.stage)}
                      disabled={updating || disabled}
                      title={!validation.allowed ? validation.message : ""}
                      style={{
                        width: "100%",
                        padding: "10px 16px",
                        backgroundColor:
                          stage.stage === currentStage ? "#e0f2fe" :
                          disabled ? "#f3f4f6" : "white",
                        color:
                          disabled ? "#9ca3af" :
                          stage.stage === currentStage ? "#0369a1" : "#475569",
                        border: disabled ? "1px solid #e5e7eb" : "1px solid #e2e8f0",
                        borderRadius: "6px",
                        cursor: disabled ? "not-allowed" : "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                        opacity: disabled ? 0.6 : 1,
                      }}
                    >
                      {stage.label} {stage.stage === currentStage && "✓"}
                      {disabled && " 🔒"}
                    </button>
                    {/* ✅ NEW: Show warning message under disabled buttons */}
                    {disabled && !validation.allowed && (
                      <div style={{
                        fontSize: "11px",
                        color: "#dc2626",
                        marginTop: "4px",
                        marginLeft: "8px",
                      }}>
                        {validation.message}
                      </div>
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