// src/pages/MyDealsPage.jsx - ENHANCED DATA FETCHING
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { BACKEND_BASE_URL } from "../config/config";
import DealStatusCard from "../DealStatusCard";
import DealDetailModal from "../DealDetailModal";
import "./MyDealsPage.css";

const MyDealsPage = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    if (user?.id && user?.role) {
      fetchMyDeals();
    }
  }, [user]);

  const fetchMyDeals = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // ✅ STEP 1: Get deals data
      const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${
        user.id
      }/role/${user.role.toUpperCase()}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch deals: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Raw deals data:", responseData);

      let dealsArray = [];
      if (responseData?.success && Array.isArray(responseData.data)) {
        dealsArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        dealsArray = responseData;
      }

      // ✅ STEP 2: Enrich deals with complete property data
      const enrichedDeals = await Promise.all(
        dealsArray.map(async (deal) => {
          let propertyData = deal.property;

          // If property data is incomplete, fetch full property details
          if (!propertyData || !propertyData.areaName) {
            const propertyId = deal.propertyId || deal.property?.id;
            if (propertyId) {
              try {
                const propResponse = await fetch(
                  `${BACKEND_BASE_URL}/api/properties/${propertyId}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                  }
                );
                if (propResponse.ok) {
                  const fullPropertyData = await propResponse.json();
                  propertyData = fullPropertyData.data || fullPropertyData;
                  console.log(
                    `Fetched complete property data for ${propertyId}:`,
                    propertyData
                  );
                }
              } catch (err) {
                console.warn(`Failed to fetch property ${propertyId}:`, err);
              }
            }
          }

          // ✅ STEP 3: Enhanced data mapping with multiple fallbacks
          const enrichedDeal = {
            ...deal,

            // Enhanced property data
            property: propertyData,

            // Location mapping with multiple fallback strategies
            propertyLocation:
              deal.propertyLocation ||
              propertyData?.areaName ||
              propertyData?.city ||
              propertyData?.area?.areaName ||
              propertyData?.area?.name ||
              propertyData?.location?.area ||
              propertyData?.address ||
              (propertyData?.city ? `${propertyData.city}, Telangana` : null) ||
              "Hyderabad, Telangana", // Default for Hyderabad-based properties

            // Enhanced property title
            propertyTitle:
              deal.propertyTitle ||
              propertyData?.title ||
              propertyData?.propertyTitle ||
              `${propertyData?.propertyType?.typeName || "Property"} in ${
                propertyData?.areaName || propertyData?.city || "Hyderabad"
              }`,

            // Enhanced pricing
            agreedPrice: deal.agreedPrice || propertyData?.price,
            listingPrice: propertyData?.price,

            // Enhanced agent info
            agentId: deal.agentId || deal.agent?.id,
            agentName:
              deal.agentName ||
              (deal.agent?.firstName && deal.agent?.lastName
                ? `${deal.agent.firstName} ${deal.agent.lastName}`
                : null),

            // Enhanced buyer info
            buyerName:
              deal.buyerName ||
              (deal.buyer?.firstName && deal.buyer?.lastName
                ? `${deal.buyer.firstName} ${deal.buyer.lastName}`
                : null),

            // Standardize stage field
            currentStage: deal.currentStage || deal.stage || "INQUIRY",
          };

          console.log(`Enriched deal ${deal.dealId || deal.id}:`, enrichedDeal);
          return enrichedDeal;
        })
      );

      setDeals(enrichedDeals);
    } catch (err) {
      console.error("Error fetching deals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Rest of your component remains the same...
  const handleViewDealDetails = (deal) => {
    setSelectedDeal(deal);
  };

  const handleCloseDealModal = () => {
    setSelectedDeal(null);
  };

  const handleDealUpdated = () => {
    setSelectedDeal(null);
    fetchMyDeals();
  };

  if (loading) {
    return (
      <div className="my-deals-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-deals-page">
        <div className="error-state">
          <h2>⚠️ Error Loading Deals</h2>
          <p>{error}</p>
          <button onClick={fetchMyDeals} className="retry-btn">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-deals-page">
      <div className="page-header">
        <h1>📊 My Deals</h1>
        <p>Track and manage your property deals</p>
      </div>

      {deals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔭</div>
          <h2>No Deals Yet</h2>
          <p>You don't have any active deals at the moment.</p>
        </div>
      ) : (
        <div className="deals-grid">
          {deals.map((deal) => (
            <DealStatusCard
              key={deal.dealId || deal.id}
              deal={deal}
              onViewDetails={handleViewDealDetails}
            />
          ))}
        </div>
      )}

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={handleCloseDealModal}
          onUpdate={handleDealUpdated}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

export default MyDealsPage;
