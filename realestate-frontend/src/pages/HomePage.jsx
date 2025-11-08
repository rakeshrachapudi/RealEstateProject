// src/pages/HomePage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import PropertySearch from "../components/PropertySearch";
import PropertyList from "../components/PropertyList";
import FurniturePartner from "../components/FurniturePartner.jsx";
import DealStatusCard from "../DealStatusCard.jsx";
import BrowsePropertiesForDeal from "../pages/BrowsePropertiesForDeal";
import DealDetailModal from "../DealDetailModal.jsx";
import { BACKEND_BASE_URL } from "../config/config";
import {
  getPropertyTypes,
  getPropertiesByType,
  getFeaturedProperties,
  getAllProperties,
} from "../services/api";
import "./HomePage.css";

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [featuredPropsList, setFeaturedPropsList] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loadingAllProps, setLoadingAllProps] = useState(false);

  const [myProperties, setMyProperties] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
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
  const [propertyTypes, setPropertyTypes] = useState(["All"]);
  const [selectedType, setSelectedType] = useState("All");
  const [properties, setProperties] = useState([]);

  const popularAreas = [
    { name: "Gachibowli", emoji: "🏢" },
    { name: "HITEC City", emoji: "🌆" },
    { name: "Madhapur", emoji: "🏙️" },
    { name: "Kondapur", emoji: "🏢" },
    { name: "Kukatpally", emoji: "🏘️" },
    { name: "Miyapur", emoji: "🌇" },
    { name: "Jubilee Hills", emoji: "🏙️" },
  ];

  useEffect(() => {
    getPropertyTypes()
      .then((types) => {
        const typesArray = Array.isArray(types) ? types : [];
        setPropertyTypes(["All", ...typesArray]);
      })
      .catch((err) => {
        console.error("Error loading property types:", err);
        setPropertyTypes(["All"]);
      });
  }, []);

  useEffect(() => {
    if (activeTab !== "browse-by-type") return;

    if (selectedType === "All") {
      getAllProperties()
        .then((props) => setProperties(Array.isArray(props) ? props : []))
        .catch((err) => {
          console.error("Error loading all properties:", err);
          setProperties([]);
        });
    } else {
      getPropertiesByType(selectedType)
        .then((props) => setProperties(Array.isArray(props) ? props : []))
        .catch((err) => {
          console.error("Error loading properties by type:", err);
          setProperties([]);
        });
    }
  }, [selectedType, activeTab]);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  useEffect(() => {
    if (activeTab === "browse-by-type" && selectedType === "All") {
      getAllProperties()
        .then((props) => setProperties(Array.isArray(props) ? props : []))
        .catch((err) => {
          console.error("Error loading all properties:", err);
          setProperties([]);
        });
    }
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated && user?.id && user?.role) {
      setFetchError(null);
      fetchMyProperties();
      fetchMyDeals();
    } else {
      setMyProperties([]);
      setMyDeals([]);
      if (["my-properties", "my-deals"].includes(activeTab)) {
        setActiveTab("featured");
      }
    }
  }, [isAuthenticated, user?.id, user?.role]);

  const safeJsonParse = async (response) => {
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }
      await response.text();
      return null;
    } catch (err) {
      console.error("Failed to parse response as JSON:", err);
      return null;
    }
  };

  const fetchFeaturedProperties = async () => {
    try {
      const properties = await getFeaturedProperties();
      setFeaturedPropsList(Array.isArray(properties) ? properties : []);
      setShowSearchResults(false);
    } catch (error) {
      console.error("Error loading featured properties:", error);
      setFetchError("Could not load featured properties.");
      setFeaturedPropsList([]);
    }
  };

  const fetchMyProperties = async () => {
    if (!user?.id) return;

    setLoadingMyProperties(true);
    setMyProperties([]);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok)
        throw new Error(`API Error ${response.status}: ${response.statusText}`);

      const data = await safeJsonParse(response);
      const propertiesArray =
        (Array.isArray(data) ? data : data?.success ? data.data : []) || [];

      const ownedProperties = propertiesArray.filter(
        (prop) => prop.user?.id === user.id
      );
      setMyProperties(ownedProperties);
    } catch (error) {
      console.error("Error loading my properties:", error);
      setFetchError("Could not load your properties.");
      setMyProperties([]);
    } finally {
      setLoadingMyProperties(false);
    }
  };

  const fetchMyDeals = async () => {
    if (!user?.id || !user?.role) return;

    setLoadingMyDeals(true);
    setMyDeals([]);

   const actualUserRole = user.role === "BROKER" || user.role === "AGENT"
     ? user.role
     : "USER";
    const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${user.id}/role/${actualUserRole}`;
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      setFetchError("Authentication required");
      setLoadingMyDeals(false);
      return;
    }

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok)
        throw new Error(`API Error ${response.status}: ${response.statusText}`);

      const responseData = await safeJsonParse(response);

      let dealsArray = [];
      if (responseData?.success && Array.isArray(responseData.data)) {
        dealsArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        dealsArray = responseData;
      }

      setMyDeals(dealsArray);
    } catch (error) {
      console.error(`Error loading deals:`, error);
      setFetchError(`Could not load your deals. ${error.message}`);
      setMyDeals([]);
    } finally {
      setLoadingMyDeals(false);
    }
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setShowSearchResults(true);
    setSearchLoading(false);
    setActiveTab("featured");
    setSelectedArea(null);
  };

  const handleSearchStart = () => setSearchLoading(true);

  const handleResetSearch = () => {
    setShowSearchResults(false);
    setSearchResults([]);
    setSelectedArea(null);
    setActiveTab("featured");
  };

  const handleAreaClick = async (area) => {
    setSelectedArea(area.name);
    setShowSearchResults(false);
    setActiveTab("featured");
    setSearchLoading(true);
    setFetchError(null);

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/byArea/${encodeURIComponent(
          area.name
        )}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!response.ok) throw new Error(`Failed to fetch for ${area.name}`);
      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
      setShowSearchResults(true);
    } catch (error) {
      console.error(`Error fetching properties for area ${area.name}:`, error);
      setFetchError(`Could not load properties for ${area.name}`);
      setSearchResults([]);
      setShowSearchResults(true);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePropertyUpdated = () => {
    fetchFeaturedProperties();
    if (isAuthenticated && user?.id) {
      fetchMyProperties();
      fetchMyDeals();
    }
  };

  const handlePropertyDeleted = (deletedPropertyId) => {
    setFeaturedPropsList((prev) =>
      prev.filter((p) => (p.id || p.propertyId) !== deletedPropertyId)
    );
    setMyProperties((prev) =>
      prev.filter((p) => (p.id || p.propertyId) !== deletedPropertyId)
    );
    if (isAuthenticated && user?.id) fetchMyDeals();
  };

  const handleCreateDealClick = () => setShowBrowseDeals(true);
  const handleViewDealDetails = (deal) => setSelectedDealForModal(deal);
  const handleCloseDealModal = () => setSelectedDealForModal(null);
  const handleDealUpdatedInModal = () => {
    setSelectedDealForModal(null);
    fetchMyDeals();
  };

  const handleOpenEmiCalculatorPage = () => navigate("/emi-calculator");

  const propertiesForList = useMemo(() => {
    if (showSearchResults) return searchResults;
    if (selectedArea) {
      return featuredPropsList.filter((property) => {
        const propertyArea = (
          property?.areaName ||
          property?.area?.areaName ||
          property?.area?.name ||
          property?.locality ||
          property?.location?.area ||
          ""
        )
          .toLowerCase()
          .trim();
        return propertyArea.includes(selectedArea.toLowerCase());
      });
    }
    if (activeTab === "browse-by-type") return properties;
    if (activeTab === "my-properties") return myProperties;
    if (activeTab === "my-deals") return [];
    return featuredPropsList;
  }, [
    showSearchResults,
    searchResults,
    selectedArea,
    activeTab,
    myProperties,
    featuredPropsList,
    properties,
  ]);

  let sectionTitle = "";
  let isLoading = searchLoading;
  const isDisplayingDeals =
    activeTab === "my-deals" && !showSearchResults && !selectedArea;

  if (showSearchResults) {
    sectionTitle =
      activeTab === "all-properties"
        ? `🏠 All Properties (${allProperties.length} found)`
        : `🔎 Search Results (${propertiesForList.length} found)`;
  } else if (selectedArea) {
    sectionTitle = `📍 Properties in ${selectedArea} (${propertiesForList.length} found)`;
    isLoading = false;
  } else if (activeTab === "browse-by-type") {
    sectionTitle = `🏘️ ${selectedType} Properties (${propertiesForList.length} found)`;
    isLoading = false;
  } else if (activeTab === "my-properties") {
    sectionTitle = `📄 My Properties (${propertiesForList.length} found)`;
    isLoading = loadingMyProperties;
  } else if (isDisplayingDeals) {
    sectionTitle = `📊 My Deals (${myDeals.length} found)`;
    isLoading = loadingMyDeals;
  } else {
    sectionTitle = `⭐ Featured Properties (${propertiesForList.length} found)`;
    isLoading = false;
  }

  const propertiesWithDeals = useMemo(() => {
    if (isDisplayingDeals || loadingMyDeals || myDeals.length === 0) {
      return propertiesForList;
    }
    return propertiesForList.map((prop) => {
      const propId = prop.id || prop.propertyId;
      if (!propId) return prop;
      const dealForProp = myDeals.find(
        (deal) => (deal?.property?.id ?? deal?.propertyId) == propId
      );
      return { ...prop, dealInfo: dealForProp || null };
    });
  }, [propertiesForList, myDeals, isDisplayingDeals, loadingMyDeals]);

  const canCreateDeal =
    isAuthenticated && user && (user.role === "AGENT" || user.role === "ADMIN");

  return (
    <>
      <div className="hp-container">
        {/* Banner */}
        <section className="hp-banner card-hover">
          <div className="hp-banner-content">
            <h2 className="hp-banner-title">How PropertyDealz works</h2>
            <p className="hp-banner-subtitle">
              Simple, transparent, and hassle-free property deals
            </p>
            <div className="hp-banner-features">
              {[
                "No Subscription Required - Connect for free",
                "Buyer Connects to Agent - Direct communication",
                "End-to-End Documentation - Agent handles paperwork",
                "Only 0.5% Fee - Charged equally from buyer & seller",
              ].map((feature) => {
                const [head, tail] = feature.split(" - ");
                return (
                  <div key={feature} className="hp-banner-feature">
                    <span className="hp-checkmark">✓</span>
                    <span>
                      <strong>{head}</strong> - {tail}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="hp-banner-illustration" aria-hidden="true">
            🤝
          </div>
        </section>

        {/* Hero */}
        <section className="hp-hero">
          <div className="hp-hero-content">
            <h1 className="hp-hero-title">
              Find Your <span className="hp-title-gradient">Dream Home</span> 🏡
            </h1>
            <p className="hp-hero-subtitle">
              Discover the perfect property that matches your lifestyle and
              budget.
            </p>
          </div>
        </section>

        {/* Search */}
        <section className="hp-search">
          <div className="hp-search-wrap">
            <PropertySearch
              onSearchResults={handleSearchResults}
              onSearchStart={handleSearchStart}
              onReset={handleResetSearch}
            />
          </div>
        </section>

        {/* Error */}
        {fetchError && <div className="hp-error">⚠️ {fetchError}</div>}

        {/* Popular Areas */}
        <section className="hp-section">
          <h2 className="hp-section-title">
            <span className="hp-section-ic">📍</span> Popular Areas
          </h2>
          <div className="hp-areas">
            {popularAreas.map((area) => (
              <button
                key={area.name}
                className={`hp-area-btn ${
                  selectedArea === area.name ? "active" : ""
                }`}
                onClick={() => handleAreaClick(area)}
              >
                <span className="hp-area-emoji">{area.emoji}</span>
                {area.name}
              </button>
            ))}
          </div>
        </section>

        {/* Properties / Deals */}
        <section className="hp-properties">
          {!showSearchResults && !selectedArea && (
            <div className="hp-tabs">
              <button
                onClick={() => setActiveTab("featured")}
                className={`hp-tab ${activeTab === "featured" ? "active" : ""}`}
              >
                ⭐ Featured ({featuredPropsList.length})
              </button>

              <button
                onClick={() => setActiveTab("browse-by-type")}
                className={`hp-tab ${
                  activeTab === "browse-by-type" ? "active" : ""
                }`}
              >
                🏘️ Browse by Type
              </button>

              {isAuthenticated &&
                (loadingMyProperties || myProperties.length > 0) && (
                  <button
                    onClick={() => setActiveTab("my-properties")}
                    className={`hp-tab ${
                      activeTab === "my-properties" ? "active" : ""
                    }`}
                  >
                    📄 My Properties ({myProperties.length})
                  </button>
                )}

              {isAuthenticated && (loadingMyDeals || myDeals.length > 0) && (
                <button
                  onClick={() => setActiveTab("my-deals")}
                  className={`hp-tab ${
                    activeTab === "my-deals" ? "active" : ""
                  }`}
                >
                  📊 My Deals ({myDeals.length})
                </button>
              )}
            </div>
          )}

          {activeTab === "browse-by-type" &&
            !showSearchResults &&
            !selectedArea && (
              <div className="hp-type-filter">
                {propertyTypes.map((type) => (
                  <button
                    key={type}
                    className={`hp-type-chip ${
                      selectedType === type ? "selected" : ""
                    }`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

          <div className="hp-section-header">
            <h2 className="hp-section-title">{sectionTitle}</h2>
            <div className="hp-section-actions">
              {(showSearchResults || selectedArea) && (
                <button
                  onClick={handleResetSearch}
                  className="hp-btn hp-btn-clear"
                >
                  ✕ Clear Filter
                </button>
              )}
              {canCreateDeal && (
                <button
                  onClick={handleCreateDealClick}
                  className="hp-btn hp-btn-primary"
                >
                  ➕ Create New Deal
                </button>
              )}
            </div>
          </div>

          {isDisplayingDeals ? (
            isLoading ? (
              <div className="hp-loading">⏳ Loading your deals...</div>
            ) : myDeals.length === 0 ? (
              <div className="hp-empty">
                <div className="hp-empty-ic">🔭</div>
                <h3 className="hp-empty-title">No Deals Yet</h3>
                <p className="hp-empty-text">
                  You are not currently involved in any deals.
                </p>
              </div>
            ) : (
              <div className="hp-deals-grid">
                {myDeals.map((deal) => (
                  <DealStatusCard
                    key={deal.dealId || deal.id}
                    deal={deal}
                    onViewDetails={handleViewDealDetails}
                  />
                ))}
              </div>
            )
          ) : (
            <PropertyList
              properties={propertiesWithDeals}
              loading={isLoading}
              onPropertyUpdated={handlePropertyUpdated}
              onPropertyDeleted={handlePropertyDeleted}
              onViewDealDetails={handleViewDealDetails}
            />
          )}
        </section>

        {/* Furniture Partner */}
        <FurniturePartner />

        {/* EMI Button */}
        <div className="hp-emi">
          <button onClick={handleOpenEmiCalculatorPage} className="hp-emi-btn">
            🧮 Open EMI Calculator
          </button>
        </div>
      </div>

      {/* Modals */}
      {showBrowseDeals && (
        <BrowsePropertiesForDeal
          onClose={() => setShowBrowseDeals(false)}
          onDealCreated={() => {
            setShowBrowseDeals(false);
            fetchMyDeals();
            setActiveTab("my-deals");
          }}
        />
      )}

      {selectedDealForModal && (
        <DealDetailModal
          deal={selectedDealForModal}
          onClose={handleCloseDealModal}
          onUpdate={handleDealUpdatedInModal}
          userRole={user?.role}
        />
      )}
    </>
  );
}

export default HomePage;
