// src/pages/SellerDealsPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import DealDetailModal from "../DealDetailModal";
import { BACKEND_BASE_URL } from "../config/config";
import "./SellerDealsPage.css";

const SellerDealsPage = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeFilter, setActiveFilter] = useState("active");
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchSellerDeals();
    } else {
      setLoading(false);
      setFetchError("Please log in to view seller deals.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchSellerDeals = async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/my-deals?userRole=SELLER`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: Failed to fetch seller deals`
        );
      }

      const data = await response.json();
      if (data.success) {
        setDeals(Array.isArray(data.data) ? data.data : []);
      } else {
        setDeals([]);
        setFetchError(data.message || "Failed to load seller deals");
      }
    } catch (error) {
      console.error("Error fetching seller deals:", error);
      setFetchError("Could not load seller deals. Please try again.");
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDeals = () => {
    if (activeFilter === "active") {
      return deals.filter((d) => (d.stage || d.currentStage) !== "COMPLETED");
    } else if (activeFilter === "completed") {
      return deals.filter((d) => (d.stage || d.currentStage) === "COMPLETED");
    }
    return deals;
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
    const num = Number(price);
    if (isNaN(num)) return String(price);
    return num.toLocaleString("en-IN");
  };

  const filteredDeals = getFilteredDeals();
  const activeDealCount = deals.filter(
    (d) => (d.stage || d.currentStage) !== "COMPLETED"
  ).length;
  const completedDealCount = deals.filter(
    (d) => (d.stage || d.currentStage) === "COMPLETED"
  ).length;

  return (
    <div className="sdp-container">
      <header className="sdp-header">
        <h1 className="sdp-title">🏠 Deals on My Properties</h1>
        <p className="sdp-subtitle">
          Monitor all buyer inquiries and deals for your listed properties
        </p>
      </header>

      {fetchError && <div className="sdp-alert">⚠️ {fetchError}</div>}

      {loading ? (
        <div className="sdp-state sdp-loading" role="status" aria-live="polite">
          ⏳ Loading deals on your properties...
        </div>
      ) : (
        <>
          {/* Filter tabs */}
          <div className="sdp-tabs" role="tablist">
            <button
              onClick={() => setActiveFilter("active")}
              className={`sdp-tab ${activeFilter === "active" ? "active" : ""}`}
              role="tab"
              aria-selected={activeFilter === "active"}
            >
              📈 Active ({activeDealCount})
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`sdp-tab ${
                activeFilter === "completed" ? "active" : ""
              }`}
              role="tab"
              aria-selected={activeFilter === "completed"}
            >
              ✅ Completed ({completedDealCount})
            </button>
            <button
              onClick={() => setActiveFilter("all")}
              className={`sdp-tab ${activeFilter === "all" ? "active" : ""}`}
              role="tab"
              aria-selected={activeFilter === "all"}
            >
              📊 All ({deals.length})
            </button>
          </div>

          {filteredDeals.length === 0 ? (
            <div className="sdp-state sdp-empty">
              <div className="sdp-empty-ic" aria-hidden="true">
                🔭
              </div>
              <h3 className="sdp-empty-title">No Deals Yet</h3>
              <p className="sdp-empty-text">
                {activeFilter === "active" &&
                  "No active deals on your properties"}
                {activeFilter === "completed" && "No completed deals yet"}
                {activeFilter === "all" &&
                  "No deals have been created for your properties"}
              </p>
            </div>
          ) : (
            <div className="sdp-grid" role="list">
              {filteredDeals.map((deal) => (
                <div
                  key={deal.id || deal.dealId}
                  className="sdp-card"
                  onClick={() => setSelectedDeal(deal)}
                  role="listitem"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedDeal(deal);
                    }
                  }}
                >
                  <div
                    className="sdp-stage"
                    style={{
                      backgroundColor: getStageColor(
                        deal.stage || deal.currentStage
                      ),
                    }}
                  >
                    {deal.stage || deal.currentStage}
                  </div>

                  <h3 className="sdp-card-title">
                    {deal.propertyTitle || deal.property?.title || "Property"}
                  </h3>

                  {deal.agreedPrice && (
                    <div className="sdp-price">
                      💰 ₹{formatPrice(deal.agreedPrice)}
                    </div>
                  )}

                  {deal.buyer && (
                    <div className="sdp-person">
                      <div className="sdp-person-role">👤 Buyer</div>
                      <div className="sdp-person-name">
                        {deal.buyerName ||
                          `${deal.buyer?.firstName || ""} ${
                            deal.buyer?.lastName || ""
                          }`.trim()}
                      </div>
                      <div className="sdp-person-contact">
                        📞{" "}
                        {deal.buyerMobile || deal.buyer?.mobileNumber || "N/A"}
                      </div>
                    </div>
                  )}

                  {deal.property?.user && (
                    <div className="sdp-person">
                      <div className="sdp-person-role">🏠 Seller (You)</div>
                      <div className="sdp-person-name">
                        {deal.sellerName ||
                          `${deal.property.user?.firstName || ""} ${
                            deal.property.user?.lastName || ""
                          }`.trim()}
                      </div>
                      <div className="sdp-person-contact">
                        📞{" "}
                        {deal.sellerMobile ||
                          deal.property.user?.mobileNumber ||
                          "N/A"}
                      </div>
                    </div>
                  )}

                  {deal.agent && (
                    <div className="sdp-person">
                      <div className="sdp-person-role">📊 Agent</div>
                      <div className="sdp-person-name">
                        {deal.agentName ||
                          `${deal.agent?.firstName || ""} ${
                            deal.agent?.lastName || ""
                          }`.trim()}
                      </div>
                      <div className="sdp-person-contact">
                        📧 {deal.agentEmail || deal.agent?.email || "N/A"}
                      </div>
                    </div>
                  )}

                  <div className="sdp-date">
                    Created: {new Date(deal.createdAt).toLocaleDateString()}
                  </div>

                  <button
                    className="sdp-view"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDeal(deal);
                    }}
                  >
                    📋 View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {
            setSelectedDeal(null);
            fetchSellerDeals();
          }}
          userRole="SELLER"
        />
      )}
    </div>
  );
};

export default SellerDealsPage;
