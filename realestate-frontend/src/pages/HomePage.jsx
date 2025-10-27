// HomePage.jsx (Complete File - Corrected Import Path & Deal Mapping)
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import PropertySearch from "../components/PropertySearch";
import PropertyList from "../components/PropertyList";
// ⭐ CORRECTED IMPORT PATH ⭐
import DealStatusCard from "../DealStatusCard"; // Assuming DealStatusCard.jsx is in src/
import { getFeaturedProperties } from "../services/api";
import { styles } from "../styles.js"; // Assuming your styles are here
import BrowsePropertiesForDeal from "../pages/BrowsePropertiesForDeal";
import DealDetailModal from "../DealDetailModal.jsx";
import { BACKEND_BASE_URL } from "../config/config";

// --- Utility for Safe JSON Parsing ---
const safeJsonParse = async (response) => {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    await response.text(); return null; // Return null if not JSON
  } catch (err) {
    console.error("⚠️ Failed to parse response as JSON:", err); return null;
  }
};
// ------------------------------------

function HomePage() {
  const { isAuthenticated, user } = useAuth(); // user contains { id, role, ... }
  const [featuredPropsList, setFeaturedPropsList] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [myDeals, setMyDeals] = useState([]); // Single state for all relevant deals
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("featured");
  const [selectedArea, setSelectedArea] = useState(null);
  const [showBrowseDeals, setShowBrowseDeals] = useState(false);
  const [selectedDealForModal, setSelectedDealForModal] = useState(null);
  const [loadingMyProperties, setLoadingMyProperties] = useState(false);
  const [loadingMyDeals, setLoadingMyDeals] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const navigate = useNavigate();

  const popularAreas = [
    { name: "Gachibowli", emoji: "🏢" }, { name: "HITEC City", emoji: "🏢" },
    { name: "Madhapur", emoji: "🌆" }, { name: "Kondapur", emoji: "🏙️" },
    { name: "Kukatpally", emoji: "🏘️" }, { name: "Miyapur", emoji: "🌇" },
    { name: "Jubilee Hills", emoji: "🛒" },
  ];

  // Fetch featured properties on initial load
  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  // Fetch user-specific data when auth state changes
  useEffect(() => {
    if (isAuthenticated && user?.id && user?.role) {
      setFetchError(null);
      fetchMyProperties();
      fetchMyDeals(); // Corrected fetch
    } else {
      setMyProperties([]);
      setMyDeals([]);
      // Reset tab only if user logs out while on a protected tab
      if (['my-properties', 'my-deals'].includes(activeTab)) {
        setActiveTab("featured");
      }
    }
  }, [isAuthenticated, user?.id, user?.role]);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await getFeaturedProperties();
      const properties = response?.success ? (response.data || []) : [];
      setFeaturedPropsList(Array.isArray(properties) ? properties : []);
      setShowSearchResults(false); // Clear search when featured are re-fetched
    } catch (error) {
      console.error("Error loading featured properties:", error);
      setFetchError("Could not load featured properties.");
      setFeaturedPropsList([]);
    }
  };

  const fetchMyProperties = async () => {
    setLoadingMyProperties(true);
    setMyProperties([]);
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/user/${user.id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } }
      );
      if (!response.ok) throw new Error(`API Error ${response.status}`);
      const data = await safeJsonParse(response);
      const propertiesArray = Array.isArray(data) ? data : (data?.success ? data.data : []) || [];
      // Ensure we only keep properties truly owned by the user (API should already do this)
      const ownedProperties = propertiesArray.filter(prop => prop.user?.id === user.id);
      setMyProperties(ownedProperties);
    } catch (error) {
      console.error("Error loading my properties:", error);
      setFetchError("Could not load your properties.");
      setMyProperties([]);
    } finally {
      setLoadingMyProperties(false);
    }
  };

  /**
   * Fetches all deals relevant to the logged-in user using their ACTUAL system role.
   */
  const fetchMyDeals = async () => {
    setLoadingMyDeals(true);
    setMyDeals([]);
    if (!user || !user.id || !user.role) { setLoadingMyDeals(false); return; } // Guard
    console.log(`Starting fetchMyDeals for user: ${user.id}, Role: ${user.role}`);

    const actualUserRole = user.role.toUpperCase();
    const userId = user.id;
    const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${userId}/role/${actualUserRole}`;
    const token = localStorage.getItem("authToken");

    try {
      console.log(`Fetching deals using endpoint: ${endpoint}`);
      const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });

      if (!response.ok) {
        console.error(`Failed to fetch deals for role ${actualUserRole}: Status ${response.status}`);
        throw new Error(`API Error ${response.status}`);
      }

      const responseData = await safeJsonParse(response);
      console.log(`Raw deals response for role ${actualUserRole}:`, responseData);

      let dealsArray = [];
      if (responseData?.success && Array.isArray(responseData.data)) {
        dealsArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        dealsArray = responseData;
      } else {
         console.warn(`Unexpected data format for deals (Role: ${actualUserRole}):`, responseData);
      }

      console.log(`Successfully fetched ${dealsArray.length} deals for user ${userId} (Role: ${actualUserRole})`);
      setMyDeals(dealsArray);

    } catch (error) {
      console.error(`Error loading deals for user ${userId} (${actualUserRole}):`, error);
      setFetchError(`Could not load your deals. ${error.message}`);
      setMyDeals([]);
    } finally {
      setLoadingMyDeals(false);
    }
  };

  // --- Search and Filter Handlers ---
  const handleSearchResults = (results) => { setSearchResults(results); setShowSearchResults(true); setSearchLoading(false); setActiveTab("featured"); setSelectedArea(null); };
  const handleSearchStart = () => { setSearchLoading(true); };
  const handleResetSearch = () => { setShowSearchResults(false); setSearchResults([]); setSelectedArea(null); setActiveTab("featured"); };
  const handleAreaClick = (area) => { setSelectedArea(area.name); setShowSearchResults(false); setActiveTab("featured"); };

  // --- Property Update/Delete Callbacks ---
  const handlePropertyUpdated = () => { fetchFeaturedProperties(); if (isAuthenticated && user?.id) { fetchMyProperties(); fetchMyDeals(); } };
  const handlePropertyDeleted = (deletedPropertyId) => { setFeaturedPropsList(prev => prev.filter(p => (p.id || p.propertyId) !== deletedPropertyId)); setMyProperties(prev => prev.filter(p => (p.id || p.propertyId) !== deletedPropertyId)); if (isAuthenticated && user?.id) { fetchMyDeals(); } }; // Re-fetch deals

  // --- Modal Handlers ---
  const handleCreateDealClick = () => { setShowBrowseDeals(true); };
  const handleViewDealDetails = (deal) => { setSelectedDealForModal(deal); };
  const handleCloseDealModal = () => { setSelectedDealForModal(null); };
  const handleDealUpdatedInModal = () => { setSelectedDealForModal(null); fetchMyDeals(); }; // Refresh deals list

  // --- Determine properties to display ---
  const propertiesForList = useMemo(() => {
    if (showSearchResults) return searchResults;
    if (selectedArea) {
      return featuredPropsList.filter((property) => {
         const propertyArea = (property?.areaName || property?.area?.areaName || "").toLowerCase();
         return propertyArea.includes(selectedArea.toLowerCase());
      });
    }
    if (activeTab === "my-properties") return myProperties;
    if (activeTab === 'my-deals') return []; // Deals tab handled separately
    return featuredPropsList; // Default featured
  }, [showSearchResults, searchResults, selectedArea, activeTab, myProperties, featuredPropsList]);

  // --- Determine section title and loading state ---
  let sectionTitle = "";
  let isLoading = searchLoading;
  let isDisplayingDeals = activeTab === 'my-deals' && !showSearchResults && !selectedArea;

  if (showSearchResults) { sectionTitle = `🔍 Search Results (${propertiesForList.length} found)`; }
  else if (selectedArea) { sectionTitle = `📍 Properties in ${selectedArea} (${propertiesForList.length} found)`; isLoading = false; }
  else if (activeTab === "my-properties") { sectionTitle = `📄 My Properties (${propertiesForList.length} found)`; isLoading = loadingMyProperties; }
  else if (isDisplayingDeals) { sectionTitle = `📊 My Deals (${myDeals.length} found)`; isLoading = loadingMyDeals; }
  else { sectionTitle = `⭐ Featured Properties (${propertiesForList.length} found)`; isLoading = false; }


  // --- Add dealInfo to properties using useMemo ---
  const propertiesWithDeals = useMemo(() => {
    if (isDisplayingDeals || loadingMyDeals || myDeals.length === 0) {
        return propertiesForList; // Return original list if displaying deals, loading, or no deals exist
    }
    console.log(`HomePage Memo: Mapping ${propertiesForList.length} properties against ${myDeals.length} deals.`);
    return propertiesForList.map(prop => {
      const propId = prop.id || prop.propertyId;
      if (!propId) return prop; // Skip if property has no ID
      const dealForProp = myDeals.find(deal => (deal?.property?.id ?? deal?.propertyId) == propId);
      // Log specifically for property 5 if found
      if (propId == 5) {
          console.log(`HomePage Memo: Mapping prop ID 5. Found Deal:`, dealForProp ? {id: dealForProp.dealId || dealForProp.id, stage: dealForProp.stage} : null);
      }
      return { ...prop, dealInfo: dealForProp || null }; // Add dealInfo
    });
   }, [propertiesForList, myDeals, isDisplayingDeals, loadingMyDeals]); // Dependencies

  const canCreateDeal = isAuthenticated && user && (user.role === "AGENT" || user.role === "ADMIN");

  return (
    <>
      <div style={styles.container}>
        {/* Banner, Hero, Search, Areas Sections */}
        <section style={bannerStyles.banner}>
           <div style={bannerStyles.bannerContent}>
             <h2 style={bannerStyles.bannerTitle}>How PropertyDeals Works</h2>
             <p style={bannerStyles.bannerSubtitle}>Simple, transparent, and hassle-free property deals</p>
             <div style={bannerStyles.bannerFeatures}>
                <div style={bannerStyles.bannerFeature}><span style={bannerStyles.checkmark}>✓</span><span><strong>No Subscription Required</strong> - Connect for free</span></div>
                <div style={bannerStyles.bannerFeature}><span style={bannerStyles.checkmark}>✓</span><span><strong>Buyer Connects to Agent</strong> - Direct communication</span></div>
                <div style={bannerStyles.bannerFeature}><span style={bannerStyles.checkmark}>✓</span><span><strong>End-to-End Documentation</strong> - Agent handles paperwork</span></div>
                <div style={bannerStyles.bannerFeature}><span style={bannerStyles.checkmark}>✓</span><span><strong>Only 0.5% Fee</strong> - Charged equally from buyer & seller</span></div>
            </div>
           </div>
           <div style={bannerStyles.bannerIllustration}>🤝</div>
        </section>
        <section style={styles.heroSection}>
          <div style={styles.heroContent}>
            <h1 style={styles.mainTitle}>Find Your <span style={styles.titleGradient}> Dream Home </span> 🏡</h1>
            <p style={styles.heroSubtitle}>Discover the perfect property that matches your lifestyle and budget.</p>
          </div>
        </section>
        <section style={styles.searchSection}>
          <PropertySearch onSearchResults={handleSearchResults} onSearchStart={handleSearchStart} onReset={handleResetSearch} />
        </section>
        {fetchError && ( <div style={styles.fetchError}>⚠️ {fetchError}</div> )}
        <section style={styles.section}>
           <h2 style={styles.sectionTitle}><span style={styles.sectionIcon}>📍</span> Popular Areas</h2>
           <div style={styles.areasGrid}> {popularAreas.map((area) => ( <button key={area.name} onClick={() => handleAreaClick(area)} style={{ ...styles.areaButton, backgroundColor: selectedArea === area.name ? "#667eea" : "white", color: selectedArea === area.name ? "white" : "#334155", borderColor: selectedArea === area.name ? "#667eea" : "#e2e8f0", boxShadow: selectedArea === area.name ? "0 4px 12px rgba(102, 126, 234, 0.3)" : "none", }}> <span style={styles.areaEmoji}>{area.emoji}</span> {area.name} </button> ))} </div>
        </section>

        {/* Properties/Deals Section */}
        <section style={styles.propertiesSection}>
          {/* Tabs */}
          {isAuthenticated && !showSearchResults && !selectedArea && (
             <div style={styles.tabContainer}>
                <button onClick={() => setActiveTab("featured")} style={{ ...styles.tab, ...(activeTab === "featured" ? styles.activeTab : {}) }}> ⭐ Featured ({featuredPropsList.length}) </button>
                {(loadingMyProperties || myProperties.length > 0) && ( <button onClick={() => setActiveTab("my-properties")} style={{ ...styles.tab, ...(activeTab === "my-properties" ? styles.activeTab : {}) }}> 📄 My Properties ({myProperties.length}) </button> )}
                {/* Ensure My Deals tab shows correctly */}
                {(isAuthenticated && (loadingMyDeals || myDeals.length > 0)) && (
                    <button onClick={() => setActiveTab("my-deals")} style={{ ...styles.tab, ...(activeTab === "my-deals" ? styles.activeTab : {}) }}>
                        📊 My Deals ({myDeals.length})
                    </button>
                 )}
            </div>
          )}

          {/* Section Header */}
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>{sectionTitle}</h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {(showSearchResults || selectedArea) && ( <button onClick={handleResetSearch} style={styles.clearSearchBtn}>✕ Clear Filter</button> )}
              {canCreateDeal && ( <button onClick={handleCreateDealClick} style={styles.createDealButton}>➕ Create New Deal</button> )}
            </div>
          </div>

          {/* Conditional Rendering: Deals Grid or Property List */}
          {isDisplayingDeals ? (
              // --- Render DealStatusCards ---
              isLoading ? ( <div style={styles.loadingState}>⏳ Loading your deals...</div> )
              : myDeals.length === 0 ? ( <div style={styles.emptyState}><div style={styles.emptyIcon}>🔭</div><h3 style={styles.emptyTitle}>No Deals Yet</h3><p style={styles.emptyText}>You are not currently involved in any deals.</p></div> )
              : ( <div style={styles.dealsGrid}> {myDeals.map((deal) => ( <DealStatusCard key={deal.dealId || deal.id} deal={deal} onViewDetails={handleViewDealDetails} /> ))} </div> )
          ) : (
              // --- Render PropertyList ---
              <PropertyList
                properties={propertiesWithDeals} // ⭐ Pass properties WITH dealInfo
                loading={isLoading}
                onPropertyUpdated={handlePropertyUpdated}
                onPropertyDeleted={handlePropertyDeleted}
                onViewDealDetails={handleViewDealDetails} // Pass handler down
              />
          )}
        </section>

        {/* Stats Section */}
        <section style={styles.statsSection}>
           <div style={styles.statsGrid}>
             <div style={styles.statCard}><div style={styles.statIcon}>🏠</div><div style={styles.statNumber}>10,000+</div><div style={styles.statLabel}>Properties Listed</div></div>
             <div style={styles.statCard}><div style={styles.statIcon}>👥</div><div style={styles.statNumber}>50,000+</div><div style={styles.statLabel}>Happy Customers</div></div>
             <div style={styles.statCard}><div style={styles.statIcon}>🏙️</div><div style={styles.statNumber}>25+</div><div style={styles.statLabel}>Areas Covered</div></div>
             <div style={styles.statCard}><div style={styles.statIcon}>⭐</div><div style={styles.statNumber}>4.8/5</div><div style={styles.statLabel}>Customer Rating</div></div>
           </div>
        </section>
      </div>

      {/* Modals */}
      {showBrowseDeals && ( <BrowsePropertiesForDeal onClose={() => setShowBrowseDeals(false)} onDealCreated={() => { setShowBrowseDeals(false); fetchMyDeals(); setActiveTab("my-deals"); }} /> )}
      {selectedDealForModal && ( <DealDetailModal deal={selectedDealForModal} onClose={handleCloseDealModal} onUpdate={handleDealUpdatedInModal} userRole={user?.role} /> )}
    </>
  );
}

// --- Styles ---
// Define bannerStyles and ensure all other styles used (like styles.container, styles.heroSection, etc.)
// are defined either inline or imported correctly from styles.js
const bannerStyles = {
    banner: { background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "60px 40px", color: "white", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "40px", boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)", borderRadius: 20, marginBottom: "40px", },
    bannerContent: { flex: 1, maxWidth: '600px' },
    bannerTitle: { fontSize: "40px", fontWeight: "800", margin: "0 0 16px 0", lineHeight: "1.2", },
    bannerSubtitle: { fontSize: "16px", opacity: 0.9, margin: "0 0 24px 0", lineHeight: "1.6", },
    bannerFeatures: { display: "flex", flexDirection: "column", gap: "14px", },
    bannerFeature: { display: "flex", alignItems: "flex-start", gap: "12px", fontSize: "15px", fontWeight: "500", },
    checkmark: { fontSize: "20px", color: '#a7f3d0', marginTop: "2px", flexShrink: 0, },
    bannerIllustration: { fontSize: "150px", textAlign: "center", opacity: 0.85, animation: "float 3s ease-in-out infinite", userSelect: 'none' },
};

// Add other required styles from your styles.js or define them inline/below
styles.dealsGrid = styles.dealsGrid || { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', };
styles.createDealButton = styles.createDealButton || { padding: "12px 24px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", transition: "background 0.2s, transform 0.2s", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)", };
styles.fetchError = styles.fetchError || { padding: '15px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', border: '1px solid #fecaca', marginBottom: '20px', textAlign: 'center', fontWeight: '500' };
styles.loadingState = styles.loadingState || { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '1.1rem' };
// Ensure all other styles (container, heroSection, searchSection, section, propertiesSection, tabContainer, tab, activeTab, sectionHeader, sectionTitle, clearSearchBtn, emptyState, statsSection, etc.) are defined correctly in styles.js or here.

// Keyframes for animation need to be handled globally (e.g., in index.css)
/*
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
*/

export default HomePage;