// src/pages/MyDealsPage.jsx (Corrected - Uses User Endpoint)
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext.jsx";
import DealStatusCard from "../DealStatusCard"; // Assuming DealStatusCard is in src/
import DealDetailModal from "../DealDetailModal.jsx";
import { BACKEND_BASE_URL } from "../config/config";
import { styles } from "../styles.js"; // Import shared styles if needed

// --- Utility for Safe JSON Parsing ---
const safeJsonParse = async (response) => {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    await response.text(); return null;
  } catch (err) {
    console.error("⚠️ Failed to parse response as JSON:", err); return null;
  }
};
// ------------------------------------

function MyDealsPage() {
  const { isAuthenticated, user } = useAuth();
  const [myDeals, setMyDeals] = useState([]);
  const [loadingMyDeals, setLoadingMyDeals] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedDealForModal, setSelectedDealForModal] = useState(null);

  useEffect(() => {
    // Only fetch if authenticated and user info is available
    if (isAuthenticated && user?.id && user?.role) {
      fetchMyDeals();
    } else if (!isAuthenticated) {
      // Handle not logged in - show message or redirect
      setLoadingMyDeals(false);
      setMyDeals([]);
      setFetchError("Please log in to view your deals.");
      // Optional: navigate('/login');
    } else {
        // Still loading user info perhaps?
        setLoadingMyDeals(true);
    }
  }, [isAuthenticated, user?.id, user?.role]); // Re-run when auth changes

  const fetchMyDeals = async () => {
    setLoadingMyDeals(true); setFetchError(null); setMyDeals([]);
    // Double check user info exists before making the call
    if (!user || !user.id || !user.role) {
        setLoadingMyDeals(false);
        setFetchError("User information not available.");
        return;
    }

    const actualUserRole = user.role.toUpperCase(); // USER, AGENT, or ADMIN
    const userId = user.id;
    // ⭐ Use the CORRECT endpoint for the user's role
    const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${userId}/role/${actualUserRole}`;
    const token = localStorage.getItem("authToken");

    try {
      console.log(`MyDealsPage: Fetching deals from ${endpoint}`);
      const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });

      console.log(`MyDealsPage: API response status: ${response.status}`);
      if (!response.ok) {
        // Provide more context in error
        const errorText = await response.text().catch(() => `Status ${response.status}`);
        throw new Error(`Failed to fetch deals: ${errorText.slice(0, 150)}`);
      }

      const responseData = await safeJsonParse(response);
      console.log(`MyDealsPage: Raw deals response:`, responseData);

      let dealsArray = [];
      if (responseData?.success && Array.isArray(responseData.data)) {
        dealsArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        dealsArray = responseData;
      } else {
         console.warn(`MyDealsPage: Unexpected data format received:`, responseData);
      }

      console.log(`MyDealsPage: Successfully fetched ${dealsArray.length} deals`);
      setMyDeals(dealsArray);
    } catch (error) {
      console.error(`Error loading My Deals page:`, error);
      setFetchError(`Could not load your deals. ${error.message}`);
      setMyDeals([]);
    } finally {
      setLoadingMyDeals(false);
    }
  };

  const handleViewDealDetails = (deal) => { setSelectedDealForModal(deal); };
  const handleCloseDealModal = () => { setSelectedDealForModal(null); };
  const handleDealUpdatedInModal = () => { setSelectedDealForModal(null); fetchMyDeals(); }; // Refresh deals on update

  return (
    <div style={styles.container}> {/* Use a standard container style */}
      <h1 style={styles.pageTitle}>My Deals</h1> {/* Add a page title style */}

      {fetchError && ( <div style={styles.fetchError}>⚠️ {fetchError}</div> )}

      {loadingMyDeals ? (
        <div style={styles.loadingState}>⏳ Loading your deals...</div>
      ) : myDeals.length === 0 && !fetchError ? ( // Only show "No Deals" if no error occurred
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔭</div>
          <h3 style={styles.emptyTitle}>No Deals Yet</h3>
          <p style={styles.emptyText}>You are not currently involved in any deals.</p>
        </div>
      ) : ( // Render deals if not loading and deals array is not empty (even if fetchError exists, show deals fetched before error)
        <div style={styles.dealsGrid}> {/* Reuse the grid style */}
          {myDeals.map((deal) => (
            <DealStatusCard
              key={deal.dealId || deal.id}
              deal={deal}
              onViewDetails={handleViewDealDetails}
            />
          ))}
        </div>
      )}

      {/* Deal Detail Modal */}
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

// Add necessary styles to styles.js or define inline
// Example styles (adapt from HomePage or create new ones)
styles.pageTitle = styles.pageTitle || { fontSize: '2rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' };
styles.fetchError = styles.fetchError || { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '20px', textAlign: 'center', fontWeight: '500' };
styles.loadingState = styles.loadingState || { textAlign: 'center', padding: '60px 20px', color: '#6b7280', fontSize: '1.2rem' };
styles.emptyState = styles.emptyState || { textAlign: 'center', padding: '60px 20px', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' };
styles.emptyIcon = styles.emptyIcon || { fontSize: '48px', marginBottom: '16px', display: 'block' };
styles.emptyTitle = styles.emptyTitle || { margin: '0 0 8px 0', fontSize: '1.25rem', fontWeight: '600', color: '#334155' };
styles.emptyText = styles.emptyText || { margin: 0, fontSize: '1rem' };
styles.dealsGrid = styles.dealsGrid || { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' };
styles.container = styles.container || { maxWidth: '1400px', margin: '2rem auto', padding: '0 24px' };

export default MyDealsPage;