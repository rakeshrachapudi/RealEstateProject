// src/BuyerDeals.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import DealDetailModal from "./DealDetailModal";
import { BACKEND_BASE_URL } from "./config/config";

const BuyerDeals = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchBuyerDeals();
    }
  }, [user]);

  const fetchBuyerDeals = async () => {
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/buyer/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setDeals(data.data || []);
      } else {
        setDeals(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching buyer deals:", error);
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

  const formatPrice = (price) => {
    if (!price) return "N/A";
    if (typeof price === "number") {
      return price.toLocaleString("en-IN");
    }
    return String(price);
  };

  if (loading) {
    return <div style={{ padding: "24px" }}>⏳ Loading your deals...</div>;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "8px" }}>
        💰 My Purchase Deals
      </h1>
      <p style={{ fontSize: "16px", color: "#64748b", marginBottom: "24px" }}>
        Track all properties you're interested in purchasing
      </p>

      {deals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔭</div>
          <p>You haven't started any deals yet</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          {deals.map((deal) => (
            <div
              key={deal.id || deal.dealId}
              onClick={() => setSelectedDeal(deal)}
              style={{
                padding: "20px",
                backgroundColor: "white",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
            >
              {/* Stage Badge */}
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  backgroundColor: getStageColor(
                    deal.stage || deal.currentStage
                  ),
                  color: "white",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "600",
                  marginBottom: "12px",
                }}
              >
                {deal.stage || deal.currentStage}
              </div>

              {/* Property Title */}
              <h3
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "#1e293b",
                }}
              >
                {deal.propertyTitle || deal.property?.title}
              </h3>

              {/* Agreed Price - Prominent Display */}
              {deal.agreedPrice && (
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#10b981",
                    backgroundColor: "#ecfdf5",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    marginBottom: "12px",
                    border: "1px solid #86efac",
                  }}
                >
                  💰 ₹{formatPrice(deal.agreedPrice)}
                </div>
              )}

              {/* Property Location */}
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "13px",
                  color: "#64748b",
                }}
              >
                📍 {deal.property?.city || deal.propertyCity || "Location"}
              </p>

              {/* Seller Details */}
              {deal.property?.user && (
                <div
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "6px",
                    marginBottom: "10px",
                    fontSize: "13px",
                    borderLeft: "3px solid #3b82f6",
                  }}
                >
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>
                    🏠 Seller
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#1e293b",
                      marginTop: "2px",
                    }}
                  >
                    {deal.sellerName ||
                      `${deal.property.user?.firstName} ${deal.property.user?.lastName}`}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    📞{" "}
                    {deal.sellerMobile ||
                      deal.property.user?.mobileNumber ||
                      "N/A"}
                  </div>
                </div>
              )}

              {/* Agent Details */}
              {deal.agent && (
                <div
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "6px",
                    marginBottom: "10px",
                    fontSize: "13px",
                    borderLeft: "3px solid #8b5cf6",
                  }}
                >
                  <div style={{ fontWeight: "600", color: "#1e293b" }}>
                    📊 Agent
                  </div>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#1e293b",
                      marginTop: "2px",
                    }}
                  >
                    {deal.agentName ||
                      `${deal.agent?.firstName} ${deal.agent?.lastName}`}
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "2px",
                    }}
                  >
                    📧 {deal.agentEmail || deal.agent?.email || "N/A"}
                  </div>
                </div>
              )}

              {/* Date */}
              <div
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginBottom: "16px",
                }}
              >
                Created: {new Date(deal.createdAt).toLocaleDateString()}
              </div>

              {/* View Button */}
              <button
                style={{
                  width: "100%",
                  padding: "10px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#2563eb")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#3b82f6")
                }
              >
                📋 View Deal
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {
            setSelectedDeal(null);
            fetchBuyerDeals();
          }}
          userRole="BUYER"
        />
      )}
    </div>
  );
};

export default BuyerDeals;
