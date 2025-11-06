// realestate-frontend/src/pages/BuyerDeals.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import DealStatusCard from "./DealStatusCard";
import DealDetailModal from "./DealDetailModal.jsx";
import { BACKEND_BASE_URL } from "./config/config";
import "./BuyerDeals.css";

// Safe JSON parse
const safeJsonParse = async (response) => {
  try {
    const ct = response.headers.get("content-type");
    if (ct && ct.includes("application/json")) return await response.json();
    await response.text();
    return null;
  } catch {
    return null;
  }
};

function BuyerDeals() {
  const { isAuthenticated, user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchBuyerDeals();
    } else if (!isAuthenticated) {
      setLoading(false);
      setDeals([]);
      setFetchError("Please log in to view your buyer deals.");
    } else {
      setLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  const fetchBuyerDeals = async () => {
    setLoading(true);
    setFetchError(null);
    setDeals([]);

    const token = localStorage.getItem("authToken");
    if (!user?.id) {
      setLoading(false);
      setFetchError("User information not available.");
      return;
    }

    // Endpoint: fetch deals for user with explicit role USER (buyer)
    const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${user.id}/role/USER`;

    try {
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const txt = await response
          .text()
          .catch(() => `Status ${response.status}`);
        throw new Error(`Failed to fetch buyer deals: ${txt.slice(0, 150)}`);
      }

      const data = await safeJsonParse(response);
      const list =
        data?.success && Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];

      // Filter defensively for deals where current user is the buyer, if backend returns mixed roles
      const filtered = list.filter((d) => {
        const buyerId = d?.buyer?.id ?? d?.buyerId;
        return String(buyerId) === String(user.id);
      });

      setDeals(filtered);
    } catch (err) {
      setFetchError(`Could not load your buyer deals. ${err.message}`);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const openDetails = (deal) => setSelectedDeal(deal);
  const closeDetails = () => setSelectedDeal(null);
  const onDealUpdated = () => {
    setSelectedDeal(null);
    fetchBuyerDeals();
  };

  return (
    <div className="bd-container">
      <header className="bd-header">
        <h1 className="bd-title">My Buyer Deals</h1>
        <p className="bd-subtitle">
          Track properties where you are the buyer and follow progress with the
          agent.
        </p>
      </header>

      {fetchError && <div className="bd-alert">⚠️ {fetchError}</div>}

      {loading ? (
        <div className="bd-state bd-loading" role="status" aria-live="polite">
          ⏳ Loading your deals...
        </div>
      ) : deals.length === 0 && !fetchError ? (
        <div className="bd-state bd-empty">
          <div className="bd-empty-ic" aria-hidden="true">
            🧭
          </div>
          <h3 className="bd-empty-title">No Buyer Deals Yet</h3>
          <p className="bd-empty-text">
            You currently have no deals as a buyer. Start by contacting an agent
            from a property page.
          </p>
        </div>
      ) : (
        <div className="bd-grid" role="list">
          {deals.map((deal) => (
            <div
              className="bd-grid-item"
              role="listitem"
              key={deal.dealId || deal.id}
            >
              <DealStatusCard deal={deal} onViewDetails={openDetails} />
            </div>
          ))}
        </div>
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={closeDetails}
          onUpdate={onDealUpdated}
          userRole={user?.role}
        />
      )}
    </div>
  );
}

export default BuyerDeals;
