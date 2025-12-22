// src/pages/HomePage.jsx
// ✅ REDESIGNED - Modern, Conversion-Focused Homepage
import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

// SEO Components
import SEOHead from "../components/SEO/SEOHead";
import {
  generateOrganizationSchema,
  generateSearchActionSchema,
} from "../components/SEO/StructuredData";

// Components
import PropertyList from "../components/PropertyList";
import DealStatusCard from "../DealStatusCard.jsx";
import BrowsePropertiesForDeal from "../pages/BrowsePropertiesForDeal";
import DealDetailModal from "../DealDetailModal.jsx";

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

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
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
  const [propertyTypes, setPropertyTypes] = useState(["All"]);
  const [selectedType, setSelectedType] = useState("All");
  const [properties, setProperties] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Debounce refs
  const searchDebounceRef = useRef(null);
  const searchAbortRef = useRef(null);

  // Popular Areas with property counts (you can make these dynamic later)
  const popularAreas = [
    { name: "Gachibowli", icon: "🏢", properties: 45, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { name: "HITEC City", icon: "🌆", properties: 62, gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { name: "Madhapur", icon: "🏙️", properties: 38, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { name: "Kondapur", icon: "🏢", properties: 51, gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { name: "Kukatpally", icon: "🏘️", properties: 33, gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { name: "Miyapur", icon: "🌇", properties: 28, gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
    { name: "Jubilee Hills", icon: "🏙️", properties: 19, gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
    { name: "Banjara Hills", icon: "🏛️", properties: 15, gradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)" },
  ];

  // Property Types with icons
  const propertyTypeConfig = [
    { type: "Apartment", icon: "🏢", description: "Flats & Apartments" },
    { type: "Villa", icon: "🏡", description: "Luxury Villas" },
    { type: "House", icon: "🏠", description: "Independent Houses" },
    { type: "Plot", icon: "📏", description: "Residential Plots" },
    { type: "Commercial", icon: "🏪", description: "Office & Shops" },
    { type: "PG", icon: "🏨", description: "Paying Guest" },
  ];

  // SEO Configuration
  const seoConfig = {
    title: "PropertyDealz - Zero Brokerage Property Listings in Hyderabad | Buy, Sell, Rent",
    description: "Find verified property listings with zero brokerage in Hyderabad. Direct owner properties for sale and rent in Gachibowli, HITEC City, Madhapur, and more areas.",
    keywords: "property dealz, zero brokerage properties, Hyderabad real estate, buy property Hyderabad, rent property Hyderabad, verified properties, direct owner properties",
    canonical: "https://propertydealz.in/",
    ogImage: "https://propertydealz.in/og-image.jpg",
  };

  // Helper functions
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

    const bedrooms = Number.isFinite(p.bedrooms) ? p.bedrooms : Number(p.bedrooms) || 0;
    const bathrooms = Number.isFinite(p.bathrooms) ? p.bathrooms : Number(p.bathrooms) || 0;
    const postedByRole = p.postedByRole ?? p.role ?? userObj.primaryRole ?? null;

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
      isFeatured: p.isFeatured === true || p.isFeatured === 1 || p.isFeatured === "true",
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
        .filter((p) => p.isActive !== false);

      // Show featured first, then regular
     const featured = normalized.filter(
       p => p.isFeatured === true || p.featured === true
     );
const regular = normalized.filter(p => p.isFeatured !== true);

      setFeaturedPropsList([...featured, ...regular].slice(0, 12));
      setShowSearchResults(false);
      setFetchError(null);
    } catch (error) {
      console.error("Error loading properties:", error);
      setFetchError("Could not load properties.");
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

        const normalized = Array.isArray(props) ? props.map(normalizeProperty) : [];
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

  // Fetch user properties
  const fetchMyProperties = async () => {
    if (!user?.id) return;
    setLoadingMyProperties(true);
    setMyProperties([]);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
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
      if (!response.ok) throw new Error(`API Error ${response.status}`);
      const data = await safeJsonParse(response);
      const propertiesArray = (Array.isArray(data) ? data : data?.success ? data.data : []) || [];
      const normalized = propertiesArray.map((p) => normalizeProperty(p));
      setMyProperties(normalized.filter((p) => p.isActive !== false));
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
    if (!token) return;

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
      if (!response.ok) throw new Error(`API Error ${response.status}`);
      const data = await safeJsonParse(response);
      setMyDeals((Array.isArray(data) ? data : data?.success ? data.data : []) || []);
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

  // Search handler
  const performSearch = async (query) => {
    if (!query || query.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);

    if (searchAbortRef.current) {
      searchAbortRef.current.abort();
    }

    const controller = new AbortController();
    searchAbortRef.current = controller;

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/search/quick?q=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      let propertiesArray = [];
      if (data.success && Array.isArray(data.data)) {
        propertiesArray = data.data;
      } else if (Array.isArray(data.data)) {
        propertiesArray = data.data;
      } else if (Array.isArray(data)) {
        propertiesArray = data;
      }

      const normalized = propertiesArray.map((p) => normalizeProperty(p));
      setSearchResults(normalized);
      setShowSearchResults(true);
      setSelectedArea(null);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!searchQuery || searchQuery.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      performSearch(searchQuery.trim());
    }, 500);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  // Area click handler
  const handleAreaClick = async (areaName) => {
    setSelectedArea(areaName);
    setShowSearchResults(false);
    setSearchLoading(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/byArea/${areaName}`);
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

      const normalized = propertiesArray.map((p) => normalizeProperty(p));
      setSearchResults(normalized);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error fetching area properties:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }

    // Scroll to properties section
    setTimeout(() => {
      const section = document.querySelector(".hp-properties-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Type click handler
  const handleTypeClick = (typeName) => {
    setSelectedType(typeName);
    setActiveTab("browse-by-type");
    setShowSearchResults(false);
    setSelectedArea(null);

    setTimeout(() => {
      const section = document.querySelector(".hp-properties-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Reset search
  const handleResetSearch = () => {
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchLoading(false);
    setSearchQuery("");
    setSelectedArea(null);
    setActiveTab("featured");
    fetchFeaturedProperties();
  };

  // Property/Deal handlers
  const handlePropertyUpdated = () => {
    if (activeTab === "my-properties") fetchMyProperties();
    else if (activeTab === "featured") fetchFeaturedProperties();
  };

  const handlePropertyDeleted = (deletedPropertyId) => {
    const filterById = (prev) =>
      prev.filter(
        (p) =>
          String(p.id) !== String(deletedPropertyId) &&
          String(p.propertyId) !== String(deletedPropertyId)
      );

    setFeaturedPropsList(filterById);
    setSearchResults(filterById);
    setProperties(filterById);
    setMyProperties(filterById);
  };

  const handleViewDealDetails = (deal) => setSelectedDealForModal(deal);
  const handleCloseDealModal = () => setSelectedDealForModal(null);
  const handleDealUpdatedInModal = () => fetchMyDeals();
  const handleCreateDealClick = () => setShowBrowseDeals(true);

  // Computed values
  const isLoading = useMemo(() => {
    if (searchLoading) return true;
    if (activeTab === "my-properties") return loadingMyProperties;
    if (activeTab === "my-deals") return loadingMyDeals;
    if (activeTab === "browse-by-type") return loadingAllProps;
    return false;
  }, [searchLoading, activeTab, loadingMyProperties, loadingMyDeals, loadingAllProps]);

  const isDisplayingDeals = activeTab === "my-deals";
  const canCreateDeal = isAuthenticated && activeTab === "my-deals";

  const displayProperties = useMemo(() => {
    if (showSearchResults) return searchResults;
    if (activeTab === "my-properties") return myProperties;
    if (activeTab === "browse-by-type") return properties;
    return featuredPropsList;
  }, [showSearchResults, searchResults, activeTab, myProperties, properties, featuredPropsList]);

  const sectionTitle = useMemo(() => {
    if (selectedArea) return `Properties in ${selectedArea}`;
    if (showSearchResults) return `Search Results (${searchResults.length})`;
    if (activeTab === "my-properties") return "My Properties";
    if (activeTab === "my-deals") return "My Deals";
    if (activeTab === "browse-by-type") return selectedType === "All" ? "All Properties" : `${selectedType} Properties`;
    return "Featured Properties";
  }, [selectedArea, showSearchResults, searchResults.length, activeTab, selectedType]);

  // WhatsApp click handler
  const handleWhatsAppClick = () => {
    window.open(
      `https://wa.me/917730051329?text=${encodeURIComponent("Hi! I'm looking for properties in Hyderabad")}`,
      "_blank"
    );
  };

  // Call click handler
  const handleCallClick = () => {
    window.location.href = "tel:+917730051329";
  };

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonicalUrl={seoConfig.canonical}
        ogUrl={seoConfig.canonical}
        structuredData={[generateOrganizationSchema(), generateSearchActionSchema()]}
      />

      <div className="hp-page">
        {/* ========== HERO SECTION ========== */}
        <section className="hp-hero">
          <div className="hp-hero-bg"></div>
          <div className="hp-hero-content">
            <h1 className="hp-hero-title">
              Find Your Dream Property in Hyderabad
            </h1>
            <p className="hp-hero-subtitle">
              Zero Brokerage • Verified Listings • Direct Owner Contact
            </p>

            {/* Hero Search */}
            <div className="hp-hero-search">
              <div className="hp-search-box">
                <span className="hp-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by location, property type... (e.g., '2BHK Gachibowli')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="hp-search-input"
                />
                {searchQuery && (
                  <button className="hp-search-clear" onClick={() => setSearchQuery("")}>
                    ✕
                  </button>
                )}
              </div>
              {searchLoading && (
                <div className="hp-search-loading">Searching...</div>
              )}
            </div>

            {/* Hero Stats */}
            <div className="hp-hero-stats">
              <div className="hp-hero-stat">
                <span className="hp-hero-stat-value">500+</span>
                <span className="hp-hero-stat-label">Verified Properties</span>
              </div>
              <div className="hp-hero-stat">
                <span className="hp-hero-stat-value">₹0</span>
                <span className="hp-hero-stat-label">Brokerage</span>
              </div>
              <div className="hp-hero-stat">
                <span className="hp-hero-stat-value">50+</span>
                <span className="hp-hero-stat-label">Localities</span>
              </div>
              <div className="hp-hero-stat">
                <span className="hp-hero-stat-value">1000+</span>
                <span className="hp-hero-stat-label">Happy Customers</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========== TRUST SIGNALS ========== */}
        <section className="hp-trust">
          <div className="hp-trust-grid">
            <div className="hp-trust-item">
              <div className="hp-trust-icon">💰</div>
              <div className="hp-trust-content">
                <h3>Zero Brokerage</h3>
                <p>Save lakhs on brokerage fees</p>
              </div>
            </div>
            <div className="hp-trust-item">
              <div className="hp-trust-icon">✅</div>
              <div className="hp-trust-content">
                <h3>Verified Listings</h3>
                <p>Every property is verified</p>
              </div>
            </div>
            <div className="hp-trust-item">
              <div className="hp-trust-icon">📞</div>
              <div className="hp-trust-content">
                <h3>Direct Contact</h3>
                <p>Talk directly with owners</p>
              </div>
            </div>
            <div className="hp-trust-item">
              <div className="hp-trust-icon">🔒</div>
              <div className="hp-trust-content">
                <h3>Secure Deals</h3>
                <p>End-to-end support</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========== POPULAR AREAS ========== */}
        <section className="hp-areas-section">
          <div className="hp-section-header">
            <h2 className="hp-section-title">
              <span className="hp-section-icon">📍</span>
              Popular Areas in Hyderabad
            </h2>
            <p className="hp-section-subtitle">
              Explore properties in the most sought-after locations
            </p>
          </div>

          <div className="hp-areas-grid">
            {popularAreas.map((area) => (
              <button
                key={area.name}
                className={`hp-area-card ${selectedArea === area.name ? "active" : ""}`}
                onClick={() => handleAreaClick(area.name)}
                style={{ "--card-gradient": area.gradient }}
              >
                <div className="hp-area-card-bg"></div>
                <div className="hp-area-card-content">
                  <span className="hp-area-icon">{area.icon}</span>
                  <h3 className="hp-area-name">{area.name}</h3>
                  <span className="hp-area-count">{area.properties}+ Properties</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ========== PROPERTY TYPES ========== */}
        <section className="hp-types-section">
          <div className="hp-section-header">
            <h2 className="hp-section-title">
              <span className="hp-section-icon">🏘️</span>
              Browse by Property Type
            </h2>
            <p className="hp-section-subtitle">
              Find your perfect property from our diverse range
            </p>
          </div>

          <div className="hp-types-grid">
            {propertyTypeConfig.map((item) => (
              <button
                key={item.type}
                className={`hp-type-card ${selectedType === item.type ? "active" : ""}`}
                onClick={() => handleTypeClick(item.type)}
              >
                <span className="hp-type-icon">{item.icon}</span>
                <h3 className="hp-type-name">{item.type}</h3>
                <p className="hp-type-desc">{item.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ========== SEO MONEY PAGES LINKS ========== */}
        <section className="hp-seo-links">
          <div className="hp-section-header">
            <h2 className="hp-section-title">
              <span className="hp-section-icon">🔥</span>
              Popular Searches
            </h2>
          </div>
          <div className="hp-seo-grid">
            <Link to="/buy-flat-in-hyderabad/" className="hp-seo-link">
              Buy Flat in Hyderabad
            </Link>
            <Link to="/flats-for-sale-in-hyderabad/" className="hp-seo-link">
              Flats for Sale Hyderabad
            </Link>
            <Link to="/plots-for-sale-in-hyderabad/" className="hp-seo-link">
              Plots for Sale Hyderabad
            </Link>
            <Link to="/independent-houses-for-sale-hyderabad/" className="hp-seo-link">
              Independent Houses
            </Link>
            <Link to="/hyderabad/" className="hp-seo-link">
              All Hyderabad Properties
            </Link>
          </div>
        </section>

        {/* ========== PROPERTIES SECTION ========== */}
        <section className="hp-properties-section">
          {/* Tabs - Only show when not searching */}
          {!showSearchResults && !selectedArea && (
            <div className="hp-tabs">
              <button
                onClick={() => setActiveTab("featured")}
                className={`hp-tab ${activeTab === "featured" ? "active" : ""}`}
              >
                ⭐ Featured
              </button>
              <button
                onClick={() => setActiveTab("browse-by-type")}
                className={`hp-tab ${activeTab === "browse-by-type" ? "active" : ""}`}
              >
                🏘️ All Properties
              </button>
              {isAuthenticated && myProperties.length > 0 && (
                <button
                  onClick={() => setActiveTab("my-properties")}
                  className={`hp-tab ${activeTab === "my-properties" ? "active" : ""}`}
                >
                  📄 My Properties ({myProperties.length})
                </button>
              )}
              {isAuthenticated && myDeals.length > 0 && (
                <button
                  onClick={() => setActiveTab("my-deals")}
                  className={`hp-tab ${activeTab === "my-deals" ? "active" : ""}`}
                >
                  📊 My Deals ({myDeals.length})
                </button>
              )}
            </div>
          )}

          {/* Type Filter Pills */}
          {activeTab === "browse-by-type" && !showSearchResults && !selectedArea && (
            <div className="hp-type-pills">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  className={`hp-type-pill ${selectedType === type ? "active" : ""}`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {/* Section Header */}
          <div className="hp-properties-header">
            <h2 className="hp-properties-title">{sectionTitle}</h2>
            {(showSearchResults || selectedArea) && (
              <button onClick={handleResetSearch} className="hp-clear-btn">
                ✕ Clear Filter
              </button>
            )}
            {canCreateDeal && (
              <button onClick={handleCreateDealClick} className="hp-create-deal-btn">
                ➕ Create New Deal
              </button>
            )}
          </div>

          {/* Properties or Deals Grid */}
          {isDisplayingDeals ? (
            isLoading ? (
              <div className="hp-loading">Loading your deals...</div>
            ) : myDeals.length === 0 ? (
              <div className="hp-empty">
                <span className="hp-empty-icon">🔭</span>
                <h3>No Deals Yet</h3>
                <p>You are not currently involved in any deals.</p>
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
             properties={displayProperties}
             loading={isLoading}
             isHomePage={true}   // ✅ ADD THIS
             onPropertyUpdated={handlePropertyUpdated}
             onPropertyDeleted={handlePropertyDeleted}
             onViewDealDetails={handleViewDealDetails}
           />

          )}

          {/* View All Link */}
      {activeTab === "featured" && !showSearchResults && !selectedArea && (
        <div className="hp-view-all">
          <Link to="/search?city=Hyderabad" className="hp-view-all-btn">
            View All Properties →
          </Link>
        </div>
      )}
        </section>

        {/* ========== HOW IT WORKS ========== */}
        <section className="hp-how-it-works">
          <div className="hp-section-header">
            <h2 className="hp-section-title">
              <span className="hp-section-icon">✨</span>
              How PropertyDealz Works
            </h2>
            <p className="hp-section-subtitle">
              Simple, transparent, and hassle-free property deals
            </p>
          </div>

          <div className="hp-steps-grid">
            <div className="hp-step">
              <div className="hp-step-number">1</div>
              <div className="hp-step-icon">🔍</div>
              <h3>Search Properties</h3>
              <p>Browse verified listings with detailed information and photos</p>
            </div>
            <div className="hp-step-arrow">→</div>
            <div className="hp-step">
              <div className="hp-step-number">2</div>
              <div className="hp-step-icon">📞</div>
              <h3>Connect Directly</h3>
              <p>Contact property owners directly through our platform</p>
            </div>
            <div className="hp-step-arrow">→</div>
            <div className="hp-step">
              <div className="hp-step-number">3</div>
              <div className="hp-step-icon">🎉</div>
              <h3>Close the Deal</h3>
              <p>Complete your transaction with our support team</p>
            </div>
          </div>

          <div className="hp-how-cta">
            <button onClick={() => navigate("/my-properties")} className="hp-cta-primary">
              📝 Post Your Property Free
            </button>
            <button onClick={handleWhatsAppClick} className="hp-cta-whatsapp">
              💬 Chat with Us
            </button>
          </div>
        </section>

        {/* ========== EMI CALCULATOR ========== */}
        <section className="hp-emi-section">
          <div className="hp-emi-content">
            <span className="hp-emi-icon">🧮</span>
            <div>
              <h3>Plan Your Home Loan</h3>
              <p>Calculate your EMI and plan your budget</p>
            </div>
            <button onClick={() => navigate("/emi-calculator")} className="hp-emi-btn">
              Open EMI Calculator →
            </button>
          </div>
        </section>
      </div>

      {/* ========== STICKY MOBILE CTA ========== */}
      <div className="hp-mobile-cta">
        <button onClick={handleWhatsAppClick} className="hp-mobile-cta-whatsapp">
          <span>💬</span> WhatsApp
        </button>
        <button onClick={handleCallClick} className="hp-mobile-cta-call">
          <span>📞</span> Call Now
        </button>
      </div>

      {/* ========== MODALS ========== */}
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