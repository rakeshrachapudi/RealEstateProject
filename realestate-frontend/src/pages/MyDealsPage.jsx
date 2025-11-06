// src/pages/MyDealsPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import DealStatusCard from "../DealStatusCard";
import DealDetailModal from "../DealDetailModal.jsx";
import { BACKEND_BASE_URL } from "../config/config";
import "./MyDealsPage.css";

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

function MyDealsPage() {
  const { isAuthenticated, user } = useAuth();
  const [myDeals, setMyDeals] = useState([]);
  const [loadingMyDeals, setLoadingMyDeals] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedDealForModal, setSelectedDealForModal] = useState(null);

  useEffect(() => {
    if (isAuthenticated && user?.id && user?.role) {
      fetchMyDeals();
    } else if (!isAuthenticated) {
      setLoadingMyDeals(false);
      setMyDeals([]);
      setFetchError("Please log in to view your deals.");
    } else {
      setLoadingMyDeals(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id, user?.role]);

  const fetchMyDeals = async () => {
    setLoadingMyDeals(true);
    setFetchError(null);
    setMyDeals([]);

    if (!user?.id || !user?.role) {
      setLoadingMyDeals(false);
      setFetchError("User information not available.");
      return;
    }

    const role = user.role.toUpperCase();
    const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${user.id}/role/${role}`;
    const token = localStorage.getItem("authToken");

    try {
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const text = await response
          .text()
          .catch(() => `Status ${response.status}`);
        throw new Error(`Failed to fetch deals: ${text.slice(0, 150)}`);
      }

      const data = await safeJsonParse(response);
      const deals =
        data?.success && Array.isArray(data.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
      setMyDeals(deals);
    } catch (err) {
      setFetchError(`Could not load your deals. ${err.message}`);
      setMyDeals([]);
    } finally {
      setLoadingMyDeals(false);
    }
  };

  const handleViewDealDetails = (deal) => setSelectedDealForModal(deal);
  const handleCloseDealModal = () => setSelectedDealForModal(null);
  const handleDealUpdatedInModal = () => {
    setSelectedDealForModal(null);
    fetchMyDeals();
  };

  return (
    <div className="mdp-container">
      <header className="mdp-header">
        <h1 className="mdp-title">My Deals</h1>
      </header>

      {fetchError && <div className="mdp-alert">⚠️ {fetchError}</div>}

      {loadingMyDeals ? (
        <div className="mdp-state mdp-loading" role="status" aria-live="polite">
          ⏳ Loading your deals...
        </div>
      ) : myDeals.length === 0 && !fetchError ? (
        <div className="mdp-state mdp-empty">
          <div className="mdp-empty-ic" aria-hidden="true">
            🔭
          </div>
          <h3 className="mdp-empty-title">No Deals Yet</h3>
          <p className="mdp-empty-text">
            You are not currently involved in any deals.
          </p>
        </div>
      ) : (
        <div className="mdp-grid" role="list">
          {myDeals.map((deal) => (
            <div
              className="mdp-grid-item"
              role="listitem"
              key={deal.dealId || deal.id}
            >
              <DealStatusCard
                deal={deal}
                onViewDetails={handleViewDealDetails}
              />
            </div>
          ))}
        </div>
      )}

      {selectedDealForModal && (
        <DealDetailModal
          deal={selectedDealForModal}
          onClose={handleCloseDealModal}
          onUpdate={handleDealUpdatedInModal}
          userRole={user?.role}
        />
      )}
    </div>
  );
}

export default MyDealsPage;
