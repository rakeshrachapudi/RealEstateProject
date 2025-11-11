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
import BannerCarousel from "../components/BannerCorousel.jsx";
import {
  getPropertyTypes,
  getPropertiesByType,
  getFeaturedProperties,
  getAllProperties,
} from "../services/api";
import "./HomePage.css";

function HomePage() {
  const { isAuthenticated, user } = useAuth();

  // Featured + All props
  const [featuredPropsList, setFeaturedPropsList] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loadingAllProps, setLoadingAllProps] = useState(false);

  // My stuff
  const [myProperties, setMyProperties] = useState([]);
  const [myDeals, setMyDeals] = useState([]);

  // Search
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState("featured");
  const [selectedArea, setSelectedArea] = useState(null);
  const [showBrowseDeals, setShowBrowseDeals] = useState(false);
  const [selectedDealForModal, setSelectedDealForModal] = useState(null);
  const [loadingMyProperties, setLoadingMyProperties] = useState(false);
  const [loadingMyDeals, setLoadingMyDeals] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Type filters
  const navigate = useNavigate();
  const [propertyTypes, setPropertyTypes] = useState(["All"]);
  const [selectedType, setSelectedType] = useState("All");
  const [properties, setProperties] = useState([]);

  // --- Static content ---
  const popularAreas = [
    { name: "Gachibowli", emoji: "🏢" },
    { name: "HITEC City", emoji: "🌆" },
    { name: "Madhapur", emoji: "🏙️" },
    { name: "Kondapur", emoji: "🏢" },
    { name: "Kukatpally", emoji: "🏘️" },
    { name: "Miyapur", emoji: "🌇" },
    { name: "Jubilee Hills", emoji: "🏙️" },
  ];

  const ownerFeatures = [
    "No Subscription Required — Post your property for free",
    "Buyer connects to our Agent — Direct communication",
    "Dedicated Agent Support — From enquiry to site visit",
    "End-to-End Documentation — Agent handles paperwork till registration",
    "Only 0.5% Service Fee — Split equally between buyer & seller",
  ];

  const brokerFeatures = [
    "Subscription-Based Access",
    "Get Direct Buyer Contact Numbers",
    "Unlimited Listings",
    "Instant Lead Access — No middle agent involved",
    "Use coupon codes BROKER3FREE or WELCOME2024 to enjoy exclusive subscription discounts.",
  ];

  // --- Effects ---

  // Load property types
  useEffect(() => {
    getPropertyTypes()
      .then((types) => {
        // Normalize to strings (some APIs may return objects)
        let names = [];
        if (Array.isArray(types)) {
          names = types
            .map((t) => {
              if (!t) return "";
              if (typeof t === "string") return t;
              return t.typeName || t.name || t.type || "";
            })
            .filter(Boolean);
        }
        setPropertyTypes(["All", ...Array.from(new Set(names))]);
      })
      .catch((err) => {
        console.error("Error loading property types:", err);
        setPropertyTypes(["All"]);
      });
  }, []);

  // Browse-by-type tab loads data
  useEffect(() => {
    if (activeTab !== "browse-by-type") return;

    const load = async () => {
      try {
        if (selectedType === "All") {
          const props = await getAllProperties();
          setProperties(Array.isArray(props) ? props : []);
        } else {
          const props = await getPropertiesByType(selectedType);
          setProperties(Array.isArray(props) ? props : []);
        }
      } catch (err) {
        console.error("Error loading properties for type:", err);
        setProperties([]);
      }
    };
    load();
  }, [selectedType, activeTab]);

  // Initial featured fetch
  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  // If switching to browse-by-type, pre-load All
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

  // Load my properties + deals if logged in
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

  // --- Helpers ---

  const safeJsonParse = async (response) => {
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return await response.json();
      }
      await response.text(); // drain
      return null;
    } catch (err) {
      console.error("Failed to parse response as JSON:", err);
      return null;
    }
  };

  // Normalize featured properties so UI never breaks on missing fields
  const fetchFeaturedProperties = async () => {
    try {
      const list = await getFeaturedProperties();

      const normalized = (Array.isArray(list) ? list : []).map((p) => {
        const id = p.propertyId ?? p.id ?? null;
        const rawImage = p.imageUrl;
        const imageUrl =
          rawImage && rawImage !== "null" && String(rawImage).trim() !== ""
            ? rawImage
            : null;

        return {
          ...p,
          id,
          propertyId: id,
          // normalize image — PropertyCard has its own fallback too
          imageUrl,
          // user object
          user: p.user || {
            id: null,
            firstName: "",
            lastName: "",
          },
          // propertyType
          propertyType: p.propertyType || p.type || null,
          // area name normalization
          areaName: p.areaName || p.cityName || p.location || p.city || "",
          // amenities always string
          amenities: typeof p.amenities === "string" ? p.amenities : "",
          // priceDisplay optional
          priceDisplay: p.priceDisplay || null,
          // safety defaults
          bedrooms: Number.isFinite(p.bedrooms) ? p.bedrooms : p.bedrooms || 0,
          bathrooms: Number.isFinite(p.bathrooms)
            ? p.bathrooms
            : p.bathrooms || 0,
          listingType:
            p.listingType ||
            (p.type && String(p.type).toLowerCase().includes("rent")
              ? "rent"
              : "sale"),
          isFeatured:
            p.isFeatured === true ||
            p.isFeatured === 1 ||
            p.isFeatured === "true",
        };
      });

      setFeaturedPropsList(normalized);
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

    const actualUserRole =
      user.role === "BROKER" || user.role === "AGENT" ? user.role : "USER";
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

  // --- Search handlers ---
  const handleSearchResults = (results) => {
    setSearchResults(Array.isArray(results) ? results : []);
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
    setSearchLoading(false);
  };

  const handleAreaClick = (area) => {
    setSelectedArea(area.name);
    setShowSearchResults(false);
    setSearchResults([]);
    setActiveTab("featured");
  };

  // Deals modal handlers
  const handleCreateDealClick = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setShowBrowseDeals(true);
  };

  const handleViewDealDetails = (deal) => {
    setSelectedDealForModal(deal);
  };

  const handleCloseDealModal = () => {
    setSelectedDealForModal(null);
  };

  const handleDealUpdatedInModal = () => {
    fetchMyDeals();
  };

  // Property mutation hooks
  const handlePropertyUpdated = (updatedProperty) => {
    setMyProperties((prev) =>
      prev.map((p) => (p.id === updatedProperty.id ? updatedProperty : p))
    );
  };

  const handlePropertyDeleted = (deletedId) => {
    setMyProperties((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handleOpenEmiCalculatorPage = () => navigate("/emi-calculator");

  // --- Derivations ---

  // Merge properties with related deals for current user
  const propertiesWithDeals = useMemo(() => {
    let baseProperties = [];
    if (showSearchResults) {
      baseProperties = searchResults;
    } else if (selectedArea) {
      const areaLower = selectedArea.toLowerCase();
      baseProperties = featuredPropsList.filter((prop) => {
        const locLower = (
          prop.areaName ||
          prop.cityName ||
          prop.location ||
          prop.city ||
          ""
        ).toLowerCase();
        return locLower.includes(areaLower);
      });
    } else {
      if (activeTab === "featured") baseProperties = featuredPropsList;
      else if (activeTab === "my-properties") baseProperties = myProperties;
      else if (activeTab === "browse-by-type") baseProperties = properties;
      else baseProperties = [];
    }

    return baseProperties.map((property) => {
      const pid = property.id || property.propertyId;
      const relatedDeals = myDeals.filter(
        (deal) =>
          deal.property?.id === pid ||
          deal.propertyId === pid ||
          deal.property?.propertyId === pid
      );
      return { ...property, relatedDeals };
    });
  }, [
    showSearchResults,
    searchResults,
    selectedArea,
    featuredPropsList,
    myProperties,
    properties,
    activeTab,
    myDeals,
  ]);

  const sectionTitle = showSearchResults
    ? `🔍 Search Results (${propertiesWithDeals.length})`
    : selectedArea
    ? `📍 Properties in ${selectedArea} (${propertiesWithDeals.length})`
    : activeTab === "featured"
    ? `⭐ Featured Properties (${propertiesWithDeals.length})`
    : activeTab === "browse-by-type"
    ? `🏘️ ${selectedType} Properties (${propertiesWithDeals.length})`
    : activeTab === "my-properties"
    ? `📄 My Properties (${propertiesWithDeals.length})`
    : activeTab === "my-deals"
    ? `📊 My Deals (${propertiesWithDeals.length})`
    : "Properties";

  const isDisplayingDeals = activeTab === "my-deals";
  const isLoading =
    (activeTab === "my-properties" && loadingMyProperties) ||
    (activeTab === "my-deals" && loadingMyDeals) ||
    searchLoading;

  const canCreateDeal =
    isAuthenticated && (user?.role === "USER" || user?.role === "BROKER");

  // --- Render ---

  return (
    <>
      <div className="hp-container">
        {/* Enhanced Banner */}
        <BannerCarousel />

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
          <PropertySearch
            onSearchResults={handleSearchResults}
            onSearchStart={handleSearchStart}
            onReset={handleResetSearch}
          />
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
