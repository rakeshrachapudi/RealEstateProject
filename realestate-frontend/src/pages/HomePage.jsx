// src/pages/HomePage.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
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
  const navigate = useNavigate();

  // Featured + All props
  const [featuredPropsList, setFeaturedPropsList] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loadingAllProps, setLoadingAllProps] = useState(false);

  // My stuff
  const [myProperties, setMyProperties] = useState([]);
  const [myDeals, setMyDeals] = useState([]);

  // Advanced Search
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Quick Search
  const [quickSearchInput, setQuickSearchInput] = useState("");
  const [quickSearchResults, setQuickSearchResults] = useState([]);
  const [showQuickSearchResults, setShowQuickSearchResults] = useState(false);
  const [quickSearchLoading, setQuickSearchLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState("featured");
  const [selectedArea, setSelectedArea] = useState(null);
  const [showBrowseDeals, setShowBrowseDeals] = useState(false);
  const [selectedDealForModal, setSelectedDealForModal] = useState(null);
  const [loadingMyProperties, setLoadingMyProperties] = useState(false);
  const [loadingMyDeals, setLoadingMyDeals] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Type filters
  const [propertyTypes, setPropertyTypes] = useState(["All"]);
  const [selectedType, setSelectedType] = useState("All");
  const [properties, setProperties] = useState([]);

  // debounce + abort refs
  const searchDebounceRef = useRef(null);
  const searchAbortRef = useRef(null);

  // Popular Areas
  const popularAreas = [
    { name: "Gachibowli", emoji: "🏢" },
    { name: "HITEC City", emoji: "🌆" },
    { name: "Madhapur", emoji: "🏙️" },
    { name: "Kondapur", emoji: "🏢" },
    { name: "Kukatpally", emoji: "🏘️" },
    { name: "Miyapur", emoji: "🌇" },
    { name: "Jubilee Hills", emoji: "🏙️" },
  ];

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

  const normalizeProperty = (p) => {
    if (!p) return null;
    const id = p.propertyId ?? p.id ?? null;

    const propertyTypeRaw = p.propertyType ?? p.type ?? null;
    let typeName = null;
    if (typeof propertyTypeRaw === "string") typeName = propertyTypeRaw;
    else if (propertyTypeRaw && typeof propertyTypeRaw === "object") {
      typeName = propertyTypeRaw.typeName || propertyTypeRaw.name || null;
    }

    const imageUrl =
      p.imageUrl && p.imageUrl !== "null" && String(p.imageUrl).trim() !== ""
        ? p.imageUrl
        : null;

    const amenities =
      typeof p.amenities === "string"
        ? p.amenities
        : Array.isArray(p.amenities)
        ? p.amenities.join(", ")
        : "";

    const areaName =
      p.areaName ||
      p.cityName ||
      (p.area && (p.area.areaName || p.area.name)) ||
      p.location ||
      p.city ||
      "";

    const userObj =
      p.user && typeof p.user === "object"
        ? {
            id: p.user.id ?? null,
            firstName: p.user.firstName ?? p.user.first_name ?? "",
            lastName: p.user.lastName ?? p.user.last_name ?? "",
            mobile: p.user.mobile ?? p.user.phone ?? "",
          }
        : { id: null, firstName: "", lastName: "", mobile: "" };

    const bedrooms = Number.isFinite(p.bedrooms) ? p.bedrooms : Number(p.bedrooms) || 0;
    const bathrooms = Number.isFinite(p.bathrooms) ? p.bathrooms : Number(p.bathrooms) || 0;

    return {
      ...p,
      id,
      propertyId: id,
      imageUrl,
      propertyType: typeName ? { typeName } : null,
      type: typeName,
      areaName,
      amenities,
      user: userObj,
      bedrooms,
      bathrooms,
      priceDisplay: p.priceDisplay ?? null,
      isFeatured:
        p.isFeatured === true || p.isFeatured === 1 || p.isFeatured === "true",
      isActive: p.isActive === undefined ? true : !!p.isActive,
    };
  };

  // --- Data loaders / effects ---

  // Load property types once
  useEffect(() => {
    getPropertyTypes()
      .then((types) => {
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

  // fetch featured properties and normalize
  const fetchFeaturedProperties = async () => {
    try {
      const list = await getFeaturedProperties();
      const normalized = (Array.isArray(list) ? list : []).map((p) =>
        normalizeProperty(p)
      );
      setFeaturedPropsList(normalized);
      setShowSearchResults(false);
      setShowQuickSearchResults(false);
      setFetchError(null);
    } catch (error) {
      console.error("Error loading featured properties:", error);
      setFetchError("Could not load featured properties.");
      setFeaturedPropsList([]);
    }
  };

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  // Browse by type loading
  useEffect(() => {
    if (activeTab !== "browse-by-type") return;

    const load = async () => {
      try {
        if (selectedType === "All") {
          const props = await getAllProperties();
          setProperties(Array.isArray(props) ? props.map(normalizeProperty) : []);
        } else {
          const props = await getPropertiesByType(selectedType);
          setProperties(Array.isArray(props) ? props.map(normalizeProperty) : []);
        }
      } catch (err) {
        console.error("Error loading properties for type:", err);
        setProperties([]);
      }
    };
    load();
  }, [selectedType, activeTab]);

  // fetch my properties by user
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
      setMyProperties(propertiesArray.map((p) => normalizeProperty(p)));
    } catch (error) {
      console.error("Error fetching user properties:", error);
      setMyProperties([]);
    } finally {
      setLoadingMyProperties(false);
    }
  };

  // fetch my deals by user
  const fetchMyDeals = async () => {
    if (!user?.id) return;
    setLoadingMyDeals(true);
    setMyDeals([]);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found");
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/user/${user.id}`,
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
      const dealsArray =
        (Array.isArray(data) ? data : data?.success ? data.data : []) || [];
      setMyDeals(dealsArray);
    } catch (error) {
      console.error("Error fetching user deals:", error);
      setMyDeals([]);
    } finally {
      setLoadingMyDeals(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchMyProperties();
      fetchMyDeals();
    }
  }, [isAuthenticated, user?.id]);

  // Advanced Search handlers
  const handleSearchResults = (results) => {
    console.log("Advanced search results:", results);

    // Handle multiple response formats
    let propertiesArray = [];
    if (Array.isArray(results)) {
      propertiesArray = results;
    } else if (results && results.data && Array.isArray(results.data)) {
      propertiesArray = results.data;
    }

    console.log("Processing", propertiesArray.length, "properties from advanced search");
    const normalized = propertiesArray.map((p) => normalizeProperty(p));
    setSearchResults(normalized);
    setShowSearchResults(true);
    setShowQuickSearchResults(false);
    setSelectedArea(null);
    setSearchLoading(false);
  };

  const handleSearchStart = () => {
    setSearchLoading(true);
    setShowQuickSearchResults(false);
  };

  const handleResetSearch = () => {
    setSearchResults([]);
    setQuickSearchResults([]);
    setShowSearchResults(false);
    setShowQuickSearchResults(false);
    setSearchLoading(false);
    setQuickSearchInput("");
    setSelectedArea(null);
    fetchFeaturedProperties();
  };

  // Area click handler
  const handleAreaClick = async (area) => {
    setSelectedArea(area.name);
    setShowSearchResults(false);
    setShowQuickSearchResults(false);
    setSearchLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/byArea/${area.name}`
      );
      if (!response.ok) throw new Error("Failed to fetch area properties");
      const data = await response.json();

      // Handle multiple response formats
      let propertiesArray = [];
      if (data.success && Array.isArray(data.data)) {
        propertiesArray = data.data;
      } else if (Array.isArray(data.data)) {
        propertiesArray = data.data;
      } else if (Array.isArray(data)) {
        propertiesArray = data;
      }

      console.log("Area properties found:", propertiesArray.length);
      const normalized = propertiesArray.map((p) => normalizeProperty(p));
      setSearchResults(normalized);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error fetching area properties:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Quick Search handlers with debounce
  const performQuickSearch = async (query) => {
    if (!query || query.trim() === "") {
      setQuickSearchResults([]);
      setShowQuickSearchResults(false);
      return;
    }

    setQuickSearchLoading(true);

    // Abort previous request if exists
    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    // Create new AbortController
    const controller = new AbortController();
    searchAbortRef.current = controller;

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/search/quick?q=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Quick search response:", data);

      // Handle multiple response formats
      let propertiesArray = [];

      if (data.success && Array.isArray(data.data)) {
        // Format: {success: true, data: [...]}
        propertiesArray = data.data;
      } else if (Array.isArray(data.data)) {
        // Format: {data: [...]}
        propertiesArray = data.data;
      } else if (Array.isArray(data)) {
        // Format: [...]
        propertiesArray = data;
      }

      console.log("Properties found:", propertiesArray.length);

      if (propertiesArray.length > 0) {
        const normalized = propertiesArray.map((p) => normalizeProperty(p));
        console.log("Normalized properties:", normalized);
        setQuickSearchResults(normalized);
        setShowQuickSearchResults(true);
        setShowSearchResults(false);
        setSelectedArea(null);
      } else {
        setQuickSearchResults([]);
        setShowQuickSearchResults(true);
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Quick search error:", error);
        setQuickSearchResults([]);
      }
    } finally {
      setQuickSearchLoading(false);
    }
  };

  // Debounced quick search effect
  useEffect(() => {
    // Clear previous timeout
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    // If input is empty, clear results immediately
    if (!quickSearchInput || quickSearchInput.trim() === "") {
      setQuickSearchResults([]);
      setShowQuickSearchResults(false);
      return;
    }

    // Set new timeout for debounce
    searchDebounceRef.current = setTimeout(() => {
      performQuickSearch(quickSearchInput.trim());
    }, 500); // 500ms debounce

    // Cleanup
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [quickSearchInput]);

  const handleClearQuickSearch = () => {
    setQuickSearchInput("");
    setQuickSearchResults([]);
    setShowQuickSearchResults(false);
  };

  // Property/Deal update handlers
  const handlePropertyUpdated = () => {
    if (activeTab === "my-properties") fetchMyProperties();
    else if (activeTab === "featured") fetchFeaturedProperties();
    else if (activeTab === "browse-by-type") {
      if (selectedType === "All") getAllProperties();
      else getPropertiesByType(selectedType);
    }
  };

  const handlePropertyDeleted = () => {
    handlePropertyUpdated();
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

  const handleCreateDealClick = () => {
    setShowBrowseDeals(true);
  };

  const handleOpenEmiCalculatorPage = () => {
    navigate("/emi-calculator");
  };

  // Compute isLoading
  const isLoading = useMemo(() => {
    if (searchLoading || quickSearchLoading) return true;
    if (activeTab === "my-properties") return loadingMyProperties;
    if (activeTab === "my-deals") return loadingMyDeals;
    return false;
  }, [searchLoading, quickSearchLoading, activeTab, loadingMyProperties, loadingMyDeals]);

  // Determine which properties to show
  const propertiesWithDeals = useMemo(() => {
    if (showQuickSearchResults) return quickSearchResults;
    if (showSearchResults) return searchResults;
    if (selectedArea) return searchResults;
    if (activeTab === "featured") return featuredPropsList;
    if (activeTab === "browse-by-type") return properties;
    if (activeTab === "my-properties") return myProperties;
    return featuredPropsList;
  }, [
    showQuickSearchResults,
    quickSearchResults,
    showSearchResults,
    searchResults,
    selectedArea,
    activeTab,
    featuredPropsList,
    properties,
    myProperties,
  ]);

  // Section title
  const sectionTitle = useMemo(() => {
    if (showQuickSearchResults) {
      return `🔍 Quick Search Results (${quickSearchResults.length})`;
    }
    if (showSearchResults && !selectedArea) {
      return `🔎 Advanced Search Results (${searchResults.length})`;
    }
    if (selectedArea) {
      return `📍 Properties in ${selectedArea} (${searchResults.length})`;
    }
    if (activeTab === "featured") return `⭐ Featured Properties (${featuredPropsList.length})`;
    if (activeTab === "browse-by-type") {
      return `🏘️ ${selectedType === "All" ? "All" : selectedType} Properties (${properties.length})`;
    }
    if (activeTab === "my-properties") return `📄 My Properties (${myProperties.length})`;
    if (activeTab === "my-deals") return `📊 My Deals (${myDeals.length})`;
    return "Properties";
  }, [
    showQuickSearchResults,
    quickSearchResults,
    showSearchResults,
    searchResults,
    selectedArea,
    activeTab,
    featuredPropsList,
    properties,
    myProperties,
    myDeals,
    selectedType,
  ]);

  const isDisplayingDeals = activeTab === "my-deals";
  const canCreateDeal = isAuthenticated && !isDisplayingDeals;

  return (
    <>
      <div className="hp-wrapper">
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Advanced Search */}
        <PropertySearch
          onSearchResults={handleSearchResults}
          onSearchStart={handleSearchStart}
          onReset={handleResetSearch}
        />

        {/* Popular Areas */}
        <section className="hp-popular-areas">
          <h2 className="hp-section-title">
            <span className="hp-section-ic">📍</span> Popular Areas in Hyderabad
          </h2>
          <div className="hp-area-grid">
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

        {/* Quick Search */}
        <section className="hp-quick-search">
          <h2 className="hp-section-title">
            <span className="hp-section-ic">🔍</span> Quick Search
          </h2>
          <div className="hp-quick-search-container">
            <div className="hp-quick-search-form">
              <div className="hp-quick-search-field">
                <label className="hp-quick-search-label">
                  Search by Property ID, Name, or Area
                </label>
                <input
                  type="text"
                  value={quickSearchInput}
                  onChange={(e) => setQuickSearchInput(e.target.value)}
                  placeholder="e.g., 20132, Palm Residency, Gachibowli"
                  className="hp-quick-search-input"
                />
              </div>

              <div className="hp-quick-search-actions">
                {quickSearchInput && (
                  <button
                    type="button"
                    onClick={handleClearQuickSearch}
                    className="hp-quick-search-btn hp-quick-search-btn-clear"
                  >
                    <span className="hp-quick-search-icon">✕</span> Clear
                  </button>
                )}
              </div>
            </div>

            {quickSearchLoading && (
              <div className="hp-quick-search-status">
                <span className="hp-quick-search-spinner">⏳</span> Searching...
              </div>
            )}
          </div>
        </section>

        {/* Properties / Deals Section */}
        <section className="hp-properties">
          {/* Tabs */}
          {!showSearchResults && !showQuickSearchResults && !selectedArea && (
            <div className="hp-tabs">
              <button
                onClick={() => setActiveTab("featured")}
                className={`hp-tab ${
                  activeTab === "featured" ? "active" : ""
                }`}
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

          {/* Type Filter */}
          {activeTab === "browse-by-type" &&
            !showSearchResults &&
            !showQuickSearchResults &&
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

          {/* Section Header */}
          <div className="hp-section-header">
            <h2 className="hp-section-title">{sectionTitle}</h2>
            <div className="hp-section-actions">
              {(showSearchResults || showQuickSearchResults || selectedArea) && (
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

          {/* Deals or Properties */}
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
          <button
            onClick={handleOpenEmiCalculatorPage}
            className="hp-emi-btn"
          >
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