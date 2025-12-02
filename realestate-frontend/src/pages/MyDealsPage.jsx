// src/pages/MyDealsPage.jsx - FIXED VERSION WITH COMPREHENSIVE ENRICHMENT
import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { BACKEND_BASE_URL } from "../config/config";
import DealStatusCard from "../DealStatusCard";
import DealDetailModal from "../DealDetailModal";
import { enrichDealsArray } from "../utils/dealDataEnricher.js"; // ✅ NEW IMPORT
import "./MyDealsPage.css";

const MyDealsPage = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    if (user?.id) {
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

      // Get user role with fallback
      let userRole = user?.role;

      if (!userRole) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            userRole = parsedUser.role;
          } catch (e) {
            console.warn("Could not parse stored user data");
          }
        }
      }

      if (!userRole) {
        console.warn("⚠️ User role not found, defaulting to USER");
        userRole = "USER";
      }

      const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${user.id}/role/${userRole.toUpperCase()}`;

      console.log("📡 Fetching deals from:", endpoint);
      console.log("🔑 User Role:", userRole);

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
      console.log("📦 Raw deals response:", responseData);

      let dealsArray = [];
      if (responseData?.success && Array.isArray(responseData.data)) {
        dealsArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        dealsArray = responseData;
      }

      console.log(`📋 Deals array length: ${dealsArray.length}`);

      // ✅ STEP 1: Enrich deals with complete property data if needed
      const dealsWithPropertyData = await Promise.all(
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
                    `✅ Fetched complete property data for ${propertyId}`
                  );
                }
              } catch (err) {
                console.warn(`⚠️ Failed to fetch property ${propertyId}:`, err);
              }
            }
          }

          // Return deal with updated property data
          return {
            ...deal,
            property: propertyData
          };
        })
      );

      // ✅ STEP 2: Use comprehensive enrichment utility
      const enrichedDeals = enrichDealsArray(dealsWithPropertyData);

      console.log(`✅ Enriched ${enrichedDeals.length} deals`);

      // Log first deal to verify enrichment
      if (enrichedDeals.length > 0) {
        console.log("Sample enriched deal:", {
          dealId: enrichedDeals[0].dealId,
          buyerName: enrichedDeals[0].buyerName,
          buyerEmail: enrichedDeals[0].buyerEmail,
          buyerMobile: enrichedDeals[0].buyerMobile,
          sellerName: enrichedDeals[0].sellerName,
          sellerEmail: enrichedDeals[0].sellerEmail,
          sellerMobile: enrichedDeals[0].sellerMobile,
          agentName: enrichedDeals[0].agentName,
          agentEmail: enrichedDeals[0].agentEmail,
          agentMobile: enrichedDeals[0].agentMobile,
          propertyTitle: enrichedDeals[0].propertyTitle,
          propertyLocation: enrichedDeals[0].propertyLocation,
        });
      }

      setDeals(enrichedDeals);
    } catch (err) {
      console.error("❌ Error fetching deals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDealDetails = (deal) => {
    console.log("📝 Viewing deal details:", deal);
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
        {deals.length > 0 && (
          <div className="deals-count">
            Total Deals: <strong>{deals.length}</strong>
          </div>
        )}
      </div>

      {deals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔭</div>
          <h2>No Deals Yet</h2>
          <p>You don't have any active deals at the moment.</p>
          <p style={{ marginTop: '16px', fontSize: '14px', color: '#64748b' }}>
            Start by browsing properties and making an offer!
          </p>
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