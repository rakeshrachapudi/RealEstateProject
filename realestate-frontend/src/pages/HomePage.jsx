// src/pages/HomePage.jsx
// ✅ COMPLETE PRODUCTION VERSION - All sections included
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

// SEO Components
import SEOHead from "../components/SEO/SEOHead";
import {
  generateOrganizationSchema,
  generateSearchActionSchema,
} from "../components/SEO/StructuredData";

// Components
import PropertySearch from "../components/PropertySearch";
import PropertyList from "../components/PropertyList";
import FurniturePartner from "../components/FurniturePartner.jsx";
import DealStatusCard from "../DealStatusCard.jsx";
import BrowsePropertiesForDeal from "../pages/BrowsePropertiesForDeal";
import DealDetailModal from "../DealDetailModal.jsx";
import BannerCarousel from "../components/BannerCorousel.jsx";

// API and Config
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

  const [loadingTypes, setLoadingTypes] = useState(false);

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

  // Property Type Icons Mapping
  const propertyTypeIcons = {
    Apartment: "🏢",
    Villa: "🏡",
    House: "🏠",
    Plot: "📏",
    Commercial: "🏪",
    Penthouse: "🏰",
    Studio: "🛋️",
    Duplex: "🏘️",
    PG: "🏨",
  };

  // SEO Configuration
  const seoConfig = {
    title:
      "PropertyDealz - Zero Brokerage Property Listings in Hyderabad | Buy, Sell, Rent",
    description:
      "Find verified property listings with zero brokerage in Hyderabad. Direct owner properties for sale and rent in Gachibowli, HITEC City, Madhapur, and more areas.",
    keywords:
      "property dealz, zero brokerage properties, Hyderabad real estate, buy property Hyderabad, rent property Hyderabad, verified properties, direct owner properties",
    canonical: "https://propertydealz.in/",
    ogImage: "https://propertydealz.in/og-image.jpg",
  };

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
            primaryRole: p.user.role ?? p.user.userRole ?? null,
          }
        : {
            id: null,
            firstName: "",
            lastName: "",
            mobile: "",
            primaryRole: null,
          };

    const bedrooms = Number.isFinite(p.bedrooms)
      ? p.bedrooms
      : Number(p.bedrooms) || 0;
    const bathrooms = Number.isFinite(p.bathrooms)
      ? p.bathrooms
      : Number(p.bathrooms) || 0;
    const postedByRole =
      p.postedByRole ?? p.role ?? userObj.primaryRole ?? null;
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
      postedByRole,
      bedrooms,
      bathrooms,
      priceDisplay: p.priceDisplay ?? null,
      isFeatured:
        p.isFeatured === true || p.isFeatured === 1 || p.isFeatured === "true",
      isActive: p.isActive === undefined ? true : !!p.isActive,
    };
  };

  // Load property types
  useEffect(() => {
    setLoadingTypes(true);
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
      })
      .finally(() => {
        setLoadingTypes(false);
      });
  }, []);

  // Fetch featured properties
  const fetchFeaturedProperties = async () => {
    try {
      const allList = await getAllProperties();
      const normalized = (Array.isArray(allList) ? allList : [])
        .map((p) => normalizeProperty(p))
        .filter((p) => p.isActive !== false && p.isFeatured === true);

      console.log("📋 Featured properties loaded:", normalized.length);
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

  // Browse by type effect
  useEffect(() => {
    if (activeTab !== "browse-by-type") return;

    const load = async () => {
      setLoadingAllProps(true);
      try {
        let props;
        if (selectedType === "All") {
          props = await getAllProperties();
        } else {
          props = await getPropertiesByType(selectedType);
        }

        const normalized = Array.isArray(props)
          ? props.map(normalizeProperty)
          : [];
        setProperties(normalized.filter((p) => p.isActive !== false));
      } catch (err) {
        console.error("Error loading properties for type:", err);
        setProperties([]);
      } finally {
        setLoadingAllProps(false);
      }
    };
    load();
  }, [selectedType, activeTab]);

  const handleBrowseTypeClick = (typeName) => {
    setSelectedType(typeName);
    setActiveTab("browse-by-type");
    setShowSearchResults(false);
    setShowQuickSearchResults(false);
    setSelectedArea(null);

    setTimeout(() => {
      const propertiesSection = document.querySelector(".hp-properties");
      if (propertiesSection) {
        propertiesSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // Fetch user properties
  const fetchMyProperties = async () => {
    if (!user?.id) return;
    setLoadingMyProperties(true);
    setMyProperties([]);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.warn(
          "Authentication token missing. Cannot fetch user properties."
        );
        setLoadingMyProperties(false);
        return;
      }

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

      const normalized = propertiesArray.map((p) => normalizeProperty(p));
      const activeProperties = normalized.filter((p) => p.isActive !== false);

      console.log(
        `📋 Loaded ${activeProperties.length} active properties for user ${user.id}`
      );
      setMyProperties(activeProperties);
    } catch (error) {
      console.error("Error fetching user properties:", error);
      setMyProperties([]);
    } finally {
      setLoadingMyProperties(false);
    }
  };

  // Fetch user deals
  const fetchMyDeals = async () => {
    if (!user?.id) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      console.warn("Authentication token missing. Cannot fetch user deals.");
      setLoadingMyDeals(false);
      return;
    }

    setLoadingMyDeals(true);
    setMyDeals([]);
    try {
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

    let propertiesArray = [];
    if (Array.isArray(results)) {
      propertiesArray = results;
    } else if (results && results.data && Array.isArray(results.data)) {
      propertiesArray = results.data;
    }

    console.log(
      "Processing",
      propertiesArray.length,
      "properties from advanced search"
    );
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

  // Quick Search
  const performQuickSearch = async (query) => {
    if (!query || query.trim() === "") {
      setQuickSearchResults([]);
      setShowQuickSearchResults(false);
      return;
    }

    setQuickSearchLoading(true);

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    const controller = new AbortController();
    searchAbortRef.current = controller;

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/search/quick?q=${encodeURIComponent(
          query
        )}`,
        { signal: controller.signal }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Quick search response:", data);

      let propertiesArray = [];
      if (data.success && Array.isArray(data.data)) {
        propertiesArray = data.data;
      } else if (Array.isArray(data.data)) {
        propertiesArray = data.data;
      } else if (Array.isArray(data)) {
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

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!quickSearchInput || quickSearchInput.trim() === "") {
      setQuickSearchResults([]);
      setShowQuickSearchResults(false);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      performQuickSearch(quickSearchInput.trim());
    }, 500);

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

  // Property/Deal handlers
  const handlePropertyUpdated = () => {
    if (activeTab === "my-properties") fetchMyProperties();
    else if (activeTab === "featured") fetchFeaturedProperties();
    else if (activeTab === "browse-by-type") {
      if (selectedType === "All") getAllProperties();
      else getPropertiesByType(selectedType);
    }
  };

  const handlePropertyDeleted = (deletedPropertyId) => {
    console.log("🗑️ Property deleted:", deletedPropertyId);

    setFeaturedPropsList((prev) =>
      prev.filter(
        (p) =>
          String(p.id) !== String(deletedPropertyId) &&
          String(p.propertyId) !== String(deletedPropertyId)
      )
    );

    if (showSearchResults) {
      setSearchResults((prev) =>
        prev.filter(
          (p) =>
            String(p.id) !== String(deletedPropertyId) &&
            String(p.propertyId) !== String(deletedPropertyId)
        )
      );
    }

    if (showQuickSearchResults) {
      setQuickSearchResults((prev) =>
        prev.filter(
          (p) =>
            String(p.id) !== String(deletedPropertyId) &&
            String(p.propertyId) !== String(deletedPropertyId)
        )
      );
    }

    setProperties((prev) =>
      prev.filter(
        (p) =>
          String(p.id) !== String(deletedPropertyId) &&
          String(p.propertyId) !== String(deletedPropertyId)
      )
    );

    setMyProperties((prev) =>
      prev.filter(
        (p) =>
          String(p.id) !== String(deletedPropertyId) &&
          String(p.propertyId) !== String(deletedPropertyId)
      )
    );

    console.log("✅ Property removed from UI (soft delete)");
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

  // Computed values
  const isLoading = useMemo(() => {
    if (searchLoading || quickSearchLoading) return true;
    if (activeTab === "my-properties") return loadingMyProperties;
    if (activeTab === "my-deals") return loadingMyDeals;
    if (activeTab === "browse-by-type") return loadingAllProps;
    return false;
  }, [
    searchLoading,
    quickSearchLoading,
    activeTab,
    loadingMyProperties,
    loadingMyDeals,
    loadingAllProps,
  ]);

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
    if (activeTab === "featured")
      return `⭐ Featured Properties (${featuredPropsList.length})`;
    if (activeTab === "browse-by-type") {
      return `🏘️ ${selectedType === "All" ? "All" : selectedType} Properties (${
        properties.length
      })`;
    }
    if (activeTab === "my-properties")
      return `📄 My Properties (${myProperties.length})`;
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

  const roleValue = user?.role;
  const roleLower = roleValue ? String(roleValue).toLowerCase() : "";
  const isAuthorizedToCreateDeal =
    roleLower === "admin" || roleLower === "agent";

  const canCreateDeal =
    isAuthenticated && !isDisplayingDeals && isAuthorizedToCreateDeal;

  return (
    <>
      {/* SEO Head */}
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonical={seoConfig.canonical}
        ogImage={seoConfig.ogImage}
        structuredData={[
          generateOrganizationSchema(),
          generateSearchActionSchema(),
        ]}
      />

      <div className="hp-wrapper">
        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Advanced Search */}
        <PropertySearch
          onSearchResults={handleSearchResults}
          onSearchStart={handleSearchStart}
          onReset={handleResetSearch}
        />

        {/* Quick Search */}
        <section className="hp-quick-search">
          <h2 className="hp-section-title">
            <span className="hp-section-ic">🔍</span> Quick Property Search
          </h2>
          <p className="hp-section-subtitle">
            Search by area, property type, or keywords
          </p>
          <div className="hp-quick-search-container">
            <div className="hp-quick-search-form">
              <div className="hp-quick-search-field">
                <input
                  type="text"
                  value={quickSearchInput}
                  onChange={(e) => setQuickSearchInput(e.target.value)}
                  placeholder="Try 'Gachibowli apartment' or '3BHK Madhapur'..."
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

        {/* Popular Areas */}
        <section className="hp-popular-areas">
          <div className="popul-brow-section">
            <h2 className="hp-section-title">
              <span className="hp-section-ic">📍</span> Popular Areas in
              Hyderabad
            </h2>
            <p className="hp-section-subtitle">
              Explore properties in the most sought-after locations
            </p>
          </div>

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

        {/* Browse by Property Type */}
        <section className="hp-browse-types">
          <div className="popul-brow-section">
            <h2 className="hp-section-title">
              <span className="hp-section-ic">🏘️</span> Browse by Property Type
            </h2>
            <p className="hp-section-subtitle">
              Find your perfect property from our diverse range of options
            </p>
          </div>

          {loadingTypes ? (
            <div className="hp-types-loading">
              <span className="hp-loading-spinner">⏳</span> Loading property
              types...
            </div>
          ) : propertyTypes.length === 0 ? (
            <div className="hp-types-empty">
              <span className="hp-empty-ic">📭</span>
              <p>No property types available at the moment.</p>
            </div>
          ) : (
            <div className="hp-types-grid">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  className="hp-type-card"
                  onClick={() => handleBrowseTypeClick(type)}
                  aria-label={`Browse ${type} properties`}
                >
                  <div className="hp-type-icon">
                    {propertyTypeIcons[type] || "🏠"}
                  </div>
                  <div className="hp-type-name">{type}</div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Properties / Deals Section */}
        <section className="hp-properties">
          {/* Tabs */}
          {!showSearchResults && !showQuickSearchResults && !selectedArea && (
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
              {(showSearchResults ||
                showQuickSearchResults ||
                selectedArea) && (
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
