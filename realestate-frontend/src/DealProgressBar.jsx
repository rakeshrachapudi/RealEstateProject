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

  const handleStageClick = async (newStage) => {
    if (!isEditable) return;

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
        alert("❌ Failed to update stage");
      }
    } catch (error) {
      console.error("Error updating stage:", error);
      alert("❌ Error updating deal");
    } finally {
      setUpdating(false);
    }
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

      <div style={progressBarStyle}>
        <div style={progressLineStyle}></div>
        <div style={progressLineFilledStyle}></div>

        {stages.map((stageObj, index) => (
          <div
            key={stageObj.stage}
            style={stageItemStyle}
            onClick={() => isEditable && handleStageClick(stageObj.stage)}
            title={isEditable ? "Click to move to this stage" : ""}
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
              {stages.map((stage) => (
                <button
                  key={stage.stage}
                  onClick={() => handleStageClick(stage.stage)}
                  disabled={updating}
                  style={{
                    padding: "10px 16px",
                    backgroundColor:
                      stage.stage === deal.stage ? "#e0f2fe" : "white",
                    color: stage.stage === deal.stage ? "#0369a1" : "#475569",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  {stage.label} {stage.stage === deal.stage && "✓"}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DealProgressBar;
