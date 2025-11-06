// src/DealStatusCard.jsx - 100% FIXED VERSION
import React from "react";
import "./DealStatusCard.css";

const DealStatusCard = ({ deal, onViewDetails }) => {
  console.log("DealStatusCard received deal:", deal);

  // ✅ FIXED: Handle undefined agentId but existing agentName
  const getAgentInfo = () => {
    // Check if agentName exists (even if agentId is undefined)
    if (deal?.agentName && deal.agentName.trim() !== "") {
      return {
        id: deal.agentId || "N/A",
        name: deal.agentName.trim(),
        email: deal.agentEmail || "",
        mobile: deal.agentMobile || "",
        status: "assigned",
      };
    }

    // Check if agentId exists
    if (deal?.agentId) {
      return {
        id: deal.agentId,
        name: deal.agentName || `Agent ${deal.agentId}`,
        email: deal.agentEmail || "",
        mobile: deal.agentMobile || "",
        status: "assigned",
      };
    }

    // Fallback to nested agent object
    if (deal?.agent?.id) {
      return {
        id: deal.agent.id,
        name:
          deal.agent.name ||
          `${deal.agent.firstName || ""} ${deal.agent.lastName || ""}`.trim() ||
          `Agent ${deal.agent.id}`,
        email: deal.agent.email || "",
        mobile: deal.agent.mobile || deal.agent.mobileNumber || "",
        status: "assigned",
      };
    }

    return {
      id: "TBA",
      name: "Agent assignment in progress",
      email: "",
      mobile: "",
      status: "pending",
    };
  };

  const getLocation = () => {
    if (deal?.propertyLocation && deal.propertyLocation.trim()) {
      return deal.propertyLocation;
    }

    if (deal?.propertyCity && deal.propertyCity.trim()) {
      return deal.propertyCity;
    }

    if (deal?.property?.areaName && deal.property.areaName.trim()) {
      return deal.property.areaName.includes("Hyderabad")
        ? deal.property.areaName
        : `${deal.property.areaName}, Hyderabad`;
    }

    if (deal?.property?.city && deal.property.city.trim()) {
      return deal.property.city;
    }

    return "Hyderabad, Telangana";
  };

  const getPropertyTitle = () => {
    if (deal?.propertyTitle && deal.propertyTitle.trim()) {
      return deal.propertyTitle;
    }

    if (deal?.property?.title && deal.property.title.trim()) {
      return deal.property.title;
    }

    const location = getLocation().split(",")[0] || "Hyderabad";
    return `Property in ${location}`;
  };

  const getBuyerName = () => {
    if (deal?.buyerName && deal.buyerName.trim()) {
      return deal.buyerName;
    }

    if (deal?.buyer?.firstName && deal?.buyer?.lastName) {
      return `${deal.buyer.firstName} ${deal.buyer.lastName}`;
    }

    return "Buyer information updating";
  };

  const formatPrice = (price) => {
    const priceValue =
      price ||
      deal?.agreedPrice ||
      deal?.propertyPrice ||
      deal?.listingPrice ||
      deal?.property?.price;

    if (!priceValue || isNaN(priceValue) || priceValue === 0) {
      return "Price being finalized";
    }

    const numPrice = Number(priceValue);
    if (numPrice >= 10000000) return `₹${(numPrice / 10000000).toFixed(1)} Cr`;
    if (numPrice >= 100000) return `₹${(numPrice / 100000).toFixed(1)} Lakh`;
    return `₹${numPrice.toLocaleString("en-IN")}`;
  };

  const getStageDisplay = () => {
    const stage = (deal?.currentStage || deal?.stage || "INQUIRY")
      .toString()
      .toUpperCase();

    const stageMap = {
      INQUIRY: "Inquiry",
      SHORTLIST: "Shortlisted",
      NEGOTIATION: "Negotiation",
      AGREEMENT: "Agreement",
      REGISTRATION: "Registration",
      PAYMENT: "Payment",
      COMPLETED: "Completed",
    };

    return stageMap[stage] || stage.charAt(0) + stage.slice(1).toLowerCase();
  };

  const getStageColor = () => {
    const stage = (deal?.currentStage || deal?.stage || "INQUIRY")
      .toString()
      .toUpperCase();

    const colorMap = {
      INQUIRY: "#3b82f6",
      SHORTLIST: "#8b5cf6",
      NEGOTIATION: "#f59e0b",
      AGREEMENT: "#10b981",
      REGISTRATION: "#06b6d4",
      PAYMENT: "#ec4899",
      COMPLETED: "#22c55e",
    };

    return colorMap[stage] || "#6b7280";
  };

  const agentInfo = getAgentInfo();
  const location = getLocation();
  const propertyTitle = getPropertyTitle();
  const buyerName = getBuyerName();

  return (
    <div className="deal-status-card">
      <div className="deal-header">
        <div
          className="deal-stage-badge"
          style={{ backgroundColor: getStageColor() }}
        >
          {getStageDisplay()}
        </div>
        <div className="deal-id">Deal #{deal?.dealId || deal?.id || "TBD"}</div>
      </div>

      <div className="deal-property">
        <h3 className="property-title" title={propertyTitle}>
          {propertyTitle}
        </h3>
        <div className="property-details">
          <div className="detail-item">
            <span className="detail-label">📍 Location:</span>
            <span className="detail-value" title={location}>
              {location}
            </span>
          </div>

          <div className="detail-item">
            <span className="detail-label">💰 Price:</span>
            <span className="detail-value">{formatPrice()}</span>
          </div>
        </div>
      </div>

      <div className="deal-parties">
        <div className="party-item">
          <span className="party-icon">👤</span>
          <div className="party-info">
            <span className="party-label">BUYER</span>
            <span className="party-name" title={buyerName}>
              {buyerName}
            </span>
          </div>
        </div>

        <div className="party-item">
          <span className="party-icon">
            {agentInfo.status === "assigned" ? "🏢" : "⏳"}
          </span>
          <div className="party-info">
            <span className="party-label">
              {agentInfo.status === "assigned" ? "AGENT" : "AGENT PENDING"}
            </span>
            <span
              className="party-name"
              title={`${agentInfo.name}${
                agentInfo.id !== "N/A" ? ` (ID: ${agentInfo.id})` : ""
              }`}
            >
              {agentInfo.name}
            </span>
          </div>
        </div>
      </div>

      <button
        className="view-deal-btn"
        onClick={() => onViewDetails && onViewDetails(deal)}
      >
        👁️ View & Manage Deal
      </button>
    </div>
  );
};

export default DealStatusCard;
