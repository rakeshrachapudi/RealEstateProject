// src/pages/HomePage.jsx
// ✅ PREMIUM REDESIGN - Modern & Attractive
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
import FurniturePartner from "../components/FurniturePartner.jsx";
import DealStatusCard from "../DealStatusCard.jsx";
import BrowsePropertiesForDeal from "../pages/BrowsePropertiesForDeal";
import DealDetailModal from "../DealDetailModal.jsx";

// API and Config
import { BACKEND_BASE_URL } from "../config/config";
import {
  getPropertyTypes,
  getPropertiesByType,
  getAllProperties,
} from "../services/api";

import "./HomePage.css";

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Properties State
  const [featuredPropsList, setFeaturedPropsList] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);

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

  // Type filters
  const [propertyTypes, setPropertyTypes] = useState(["All"]);
  const [selectedType, setSelectedType] = useState("All");
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Debounce refs
  const searchDebounceRef = useRef(null);
  const searchAbortRef = useRef(null);

  // Popular Areas Data with images
  const popularAreas = [
    { name: "Gachibowli", icon: "🏢", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { name: "HITEC City", icon: "🌆", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { name: "Madhapur", icon: "🏙️", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { name: "Kondapur", icon: "🏢", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
    { name: "Kukatpally", icon: "🏘️", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { name: "Miyapur", icon: "🌇", gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" },
    { name: "Jubilee Hills", icon: "🏛️", gradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)" },
    { name: "Banjara Hills", icon: "🌳", gradient: "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)" },
  ];

  // Property Types Config
  const propertyTypeConfig = [
    { type: "Apartment", icon: "🏢", desc: "Flats & Apartments", color: "#6366f1" },
    { type: "Villa", icon: "🏡", desc: "Luxury Villas", color: "#8b5cf6" },
    { type: "House", icon: "🏠", desc: "Independent Houses", color: "#ec4899" },
    { type: "Plot", icon: "📐", desc: "Residential Plots", color: "#f59e0b" },
    { type: "Commercial", icon: "🏪", desc: "Office & Shops", color: "#10b981" },
    { type: "PG", icon: "🏨", desc: "Paying Guest", color: "#06b6d4" },
  ];

  // SEO Configuration
  const seoConfig = {
    title: "PropertyDealz - Zero Brokerage Properties in Hyderabad | Buy, Sell, Rent",
    description: "Find verified properties with zero brokerage in Hyderabad. Direct owner contact for flats, plots, villas in Gachibowli, HITEC City, Kondapur & more.",
    keywords: "zero brokerage properties hyderabad, buy property hyderabad, rent flat hyderabad, plots for sale hyderabad",
    canonical: "https://www.propertydealz.in/",
  };

  // Helper: Normalize property data
  const normalizeProperty = (p) => {
    if (!p) return null;
    const id = p.propertyId ?? p.id ?? null;
    const propertyTypeRaw = p.propertyType ?? p.type ?? null;
    let typeName = null;
    if (typeof propertyTypeRaw === "string") typeName = propertyTypeRaw;
    else if (propertyTypeRaw && typeof propertyTypeRaw === "object") {
      typeName = propertyTypeRaw.typeName || propertyTypeRaw.name || null;
    }

    const imageUrl = p.imageUrl && p.imageUrl !== "null" && String(p.imageUrl).trim() !== ""
      ? p.imageUrl : null;

    const amenities = typeof p.amenities === "string"
      ? p.amenities
      : Array.isArray(p.amenities) ? p.amenities.join(", ") : "";

    const areaName = p.areaName || p.cityName ||
      (p.area && (p.area.areaName || p.area.name)) || p.location || p.city || "";

    const userObj = p.user && typeof p.user === "object"
      ? {
          id: p.user.id ?? null,
          firstName: p.user.firstName ?? p.user.first_name ?? "",
          lastName: p.user.lastName ?? p.user.last_name ?? "",
          mobile: p.user.mobile ?? p.user.phone ?? "",
          primaryRole: p.user.role ?? p.user.userRole ?? null,
        }
      : { id: null, firstName: "", lastName: "", mobile: "", primaryRole: null };

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
      postedByRole: p.postedByRole ?? p.role ?? userObj.primaryRole ?? null,
      bedrooms: Number(p.bedrooms) || 0,
      bathrooms: Number(p.bathrooms) || 0,
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
          names = types.map((t) => {
            if (!t) return "";
            if (typeof t === "string") return t;
            return t.typeName || t.name || t.type || "";
          }).filter(Boolean);
        }
        setPropertyTypes(["All", ...Array.from(new Set(names))]);
      })
      .catch(() => setPropertyTypes(["All"]))
      .finally(() => setLoadingTypes(false));
  }, []);

  // Fetch all properties
  const fetchProperties = async () => {
    setLoadingProps(true);
    try {
      const allList = await getAllProperties();
      const normalized = (Array.isArray(allList) ? allList : [])
        .map(normalizeProperty)
        .filter((p) => p && p.isActive !== false);

      const featured = normalized.filter((p) => p.isFeatured === true);
      const regular = normalized.filter((p) => p.isFeatured !== true);

      setFeaturedPropsList(featured);
      setAllProperties([...featured, ...regular]);
      setShowSearchResults(false);
    } catch (error) {
      console.error("Error loading properties:", error);
      setFeaturedPropsList([]);
      setAllProperties([]);
    } finally {
      setLoadingProps(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Fetch user properties & deals
  const fetchMyProperties = async () => {
    if (!user?.id) return;
    setLoadingMyProperties(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      const list = Array.isArray(data) ? data : data?.data || [];
      setMyProperties(list.map(normalizeProperty).filter((p) => p?.isActive !== false));
    } catch (error) {
      console.error("Error fetching my properties:", error);
      setMyProperties([]);
    } finally {
      setLoadingMyProperties(false);
    }
  };

  const fetchMyDeals = async () => {
    if (!user?.id) return;
    setLoadingMyDeals(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(
        `${BACKEND_BASE_URL}/api/deals/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch deals");
      const data = await response.json();
      setMyDeals(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching my deals:", error);
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

  // Smart Search Handler (FIXED – client side)
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);

    const q = query.toLowerCase();

    const results = allProperties.filter((p) => {
      return (
        p.areaName?.toLowerCase().includes(q) ||
        p.type?.toLowerCase().includes(q) ||
        String(p.bedrooms || "").includes(q) ||
        String(p.priceDisplay || "").includes(q)
      );
    });

    setSearchResults(results);
    setShowSearchResults(true);
    setSelectedArea(null);
    setSearchLoading(false);
  };


  // Debounced search
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      searchDebounceRef.current = setTimeout(() => {
        performSearch(searchQuery);
      }, 400);
    } else if (searchQuery.trim().length === 0) {
      setShowSearchResults(false);
      setSearchResults([]);
    }

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };



   const handleAreaClick = async (areaName) => {
     if (selectedArea === areaName) {
       setSelectedArea(null);
       setSearchResults([]);
       setShowSearchResults(false);
       return;
     }

     setSelectedArea(areaName);
     setSearchLoading(true);

     const results = allProperties.filter(
       (p) => p.areaName?.toLowerCase() === areaName.toLowerCase()
     );

     setSearchResults(results);
     setShowSearchResults(true);
     setSearchQuery("");
     setSearchLoading(false);
   };


  const handleTypeClick = (type) => {
    setActiveTab("all");
    setSelectedType(type);
    setShowSearchResults(false);
    setSelectedArea(null);
    setSearchQuery("");
  };

  const handleResetFilters = () => {
    setSelectedArea(null);
    setShowSearchResults(false);
    setSearchResults([]);
    setSearchQuery("");
    setSelectedType("All");
  };

  const handlePropertyUpdated = () => fetchProperties();
  const handlePropertyDeleted = () => fetchProperties();
  const handleViewDealDetails = (deal) => setSelectedDealForModal(deal);
  const handleCloseDealModal = () => setSelectedDealForModal(null);
  const handleDealUpdated = () => fetchMyDeals();
  const handleCreateDeal = () => setShowBrowseDeals(true);

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/917730051329?text=${encodeURIComponent("Hi! I'm looking for properties in Hyderabad")}`,
      "_blank"
    );
  };

  const handleCall = () => {
    window.location.href = "tel:+917730051329";
  };

  // Computed values
  const isLoading = useMemo(() => {
    if (searchLoading) return true;
    if (activeTab === "my-properties") return loadingMyProperties;
    if (activeTab === "my-deals") return loadingMyDeals;
    return loadingProps;
  }, [searchLoading, activeTab, loadingMyProperties, loadingMyDeals, loadingProps]);

  const displayProperties = useMemo(() => {
    if (showSearchResults || selectedArea) return searchResults;
    if (activeTab === "my-properties") return myProperties;
    if (activeTab === "my-deals") return [];
    if (activeTab === "all") {
      if (selectedType === "All") return allProperties;
      return allProperties.filter((p) => p.type === selectedType);
    }
    return featuredPropsList;
  }, [showSearchResults, selectedArea, searchResults, activeTab, myProperties, allProperties, featuredPropsList, selectedType]);

  const sectionTitle = useMemo(() => {
    if (selectedArea) return `Properties in ${selectedArea}`;
    if (showSearchResults) return `Search Results (${searchResults.length})`;
    if (activeTab === "my-properties") return "My Properties";
    if (activeTab === "my-deals") return "My Deals";
    if (activeTab === "all") return selectedType === "All" ? "All Properties" : `${selectedType} Properties`;
    return "Featured Properties";
  }, [selectedArea, showSearchResults, searchResults.length, activeTab, selectedType]);

  const isDealsView = activeTab === "my-deals";
  const canCreateDeal = isAuthenticated && isDealsView;

  return (
    <>
      <SEOHead
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        canonicalUrl={seoConfig.canonical}
        structuredData={[generateOrganizationSchema(), generateSearchActionSchema()]}
      />

      <div className="hp-page">
        {/* ========== HERO SECTION ========== */}
        <section className="hp-hero">
          <div className="hp-hero-bg">
            <div className="hp-hero-pattern"></div>
            <div className="hp-hero-glow"></div>
            <div className="hp-hero-glow hp-hero-glow-2"></div>
          </div>

          <div className="hp-hero-content">
            <div className="hp-hero-badge">
              <span className="hp-badge-icon">✨</span>
              <span>Hyderabad's #1 Zero Brokerage Platform</span>
            </div>

            <h1 className="hp-hero-title">
              Find Your <span className="hp-gradient-text">Dream Property</span><br />
              in Hyderabad
            </h1>

            <p className="hp-hero-subtitle">
              Save lakhs on brokerage • 500+ Verified Properties • Direct Owner Contact
            </p>

            {/* Search Form */}
            <form className="hp-search-form" onSubmit={handleSearchSubmit}>
              <div className="hp-search-box">
                <div className="hp-search-icon-wrap">
                  <svg className="hp-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search '2BHK Gachibowli' or 'Villa under 2 Cr'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="hp-search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="hp-search-clear"
                    onClick={() => setSearchQuery("")}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
                <button type="submit" className="hp-search-btn">
                  <span>Search</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
              {searchLoading && (
                <div className="hp-search-status">
                  <div className="hp-spinner"></div>
                  <span>Finding properties...</span>
                </div>
              )}
            </form>

            {/* Hero Stats */}
            <div className="hp-hero-stats">
              <div className="hp-stat">
                <div className="hp-stat-icon">🏠</div>
                <span className="hp-stat-value">500+</span>
                <span className="hp-stat-label">Verified Properties</span>
              </div>
              <div className="hp-stat-divider"></div>
              <div className="hp-stat">
                <div className="hp-stat-icon">💰</div>
                <span className="hp-stat-value">₹0</span>
                <span className="hp-stat-label">Brokerage Fee</span>
              </div>
              <div className="hp-stat-divider"></div>
              <div className="hp-stat">
                <div className="hp-stat-icon">📍</div>
                <span className="hp-stat-value">50+</span>
                <span className="hp-stat-label">Localities</span>
              </div>
              <div className="hp-stat-divider"></div>
              <div className="hp-stat">
                <div className="hp-stat-icon">😊</div>
                <span className="hp-stat-value">1000+</span>
                <span className="hp-stat-label">Happy Customers</span>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="hp-floating hp-floating-1">🏡</div>
          <div className="hp-floating hp-floating-2">🔑</div>
          <div className="hp-floating hp-floating-3">📍</div>
        </section>

        {/* ========== TRUST SIGNALS ========== */}
        <section className="hp-trust">
          <div className="hp-trust-container">
            <div className="hp-trust-item">
              <div className="hp-trust-icon-wrap" style={{"--icon-bg": "#dcfce7"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="hp-trust-text">
                <strong>Zero Brokerage</strong>
                <span>Save lakhs on fees</span>
              </div>
            </div>

            <div className="hp-trust-item">
              <div className="hp-trust-icon-wrap" style={{"--icon-bg": "#dbeafe"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                  <path d="M9 12l2 2 4-4"/>
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="hp-trust-text">
                <strong>Verified Listings</strong>
                <span>Every property checked</span>
              </div>
            </div>

            <div className="hp-trust-item">
              <div className="hp-trust-icon-wrap" style={{"--icon-bg": "#fce7f3"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#db2777" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                </svg>
              </div>
              <div className="hp-trust-text">
                <strong>Direct Contact</strong>
                <span>Talk to owners directly</span>
              </div>
            </div>

            <div className="hp-trust-item">
              <div className="hp-trust-icon-wrap" style={{"--icon-bg": "#e0e7ff"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <div className="hp-trust-text">
                <strong>Secure Deals</strong>
                <span>End-to-end support</span>
              </div>
            </div>

            <div className="hp-trust-item hp-trust-highlight">
              <div className="hp-trust-icon-wrap" style={{"--icon-bg": "#fef3c7"}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
              <div className="hp-trust-text">
                <strong>Fair Success Fee</strong>
                <span className="success-fee-note">
                               0.5% only after registration</span></div>


            </div>
          </div>
        </section>

        {/* ========== POPULAR AREAS ========== */}
        <section className="hp-section hp-areas">
          <div className="hp-section-header">
            <span className="hp-section-tag">Explore Locations</span>
            <h2>Popular Areas in Hyderabad</h2>
            <p>Discover properties in the most sought-after neighborhoods</p>
          </div>
          <div className="hp-areas-grid">
            {popularAreas.map((area, index) => (
              <button
                key={area.name}
                className={`hp-area-card ${selectedArea === area.name ? "active" : ""}`}
                onClick={() => handleAreaClick(area.name)}
                style={{
                  "--area-gradient": area.gradient,
                  "--delay": `${index * 0.05}s`
                }}
              >
                <div className="hp-area-bg"></div>
                <span className="hp-area-icon">{area.icon}</span>
                <span className="hp-area-name">{area.name}</span>
                <span className="hp-area-arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        {/* ========== PROPERTY TYPES ========== */}
        <section className="hp-section hp-types">
          <div className="hp-section-header">
            <span className="hp-section-tag">Categories</span>
            <h2>Browse by Property Type</h2>
            <p>Find your perfect property from our diverse range</p>
          </div>
          <div className="hp-types-grid">
            {propertyTypeConfig.map((item, index) => (
              <button
                key={item.type}
                className={`hp-type-card ${selectedType === item.type ? "active" : ""}`}
                onClick={() => handleTypeClick(item.type)}
                style={{ "--type-color": item.color, "--delay": `${index * 0.05}s` }}
              >
                <div className="hp-type-icon-wrap">
                  <span className="hp-type-icon">{item.icon}</span>
                </div>
                <span className="hp-type-name">{item.type}</span>
                <span className="hp-type-desc">{item.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ========== SEO QUICK LINKS ========== */}
        <section className="hp-section hp-quick-links">
          <div className="hp-section-header">
            <span className="hp-section-tag">Quick Search</span>
            <h2>Popular Searches</h2>
          </div>
          <div className="hp-links-grid">
            <Link to="/buy-flat-in-hyderabad/" className="hp-quick-link">
              <span>Buy Flat in Hyderabad</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/flats-for-sale-in-hyderabad/" className="hp-quick-link">
              <span>Flats for Sale</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/plots-for-sale-in-hyderabad/" className="hp-quick-link">
              <span>Plots for Sale</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/independent-houses-for-sale-hyderabad/" className="hp-quick-link">
              <span>Independent Houses</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <Link to="/hyderabad/" className="hp-quick-link">
              <span>All Hyderabad Properties</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        </section>

        {/* ========== PROPERTY LISTINGS ========== */}
        <section className="hp-section hp-listings">
          {/* Tabs */}
          {!showSearchResults && !selectedArea && (
            <div className="hp-tabs">
              <button
                className={`hp-tab ${activeTab === "featured" ? "active" : ""}`}
                onClick={() => { setActiveTab("featured"); setSelectedType("All"); }}
              >
                <span className="hp-tab-icon">⭐</span>
                <span>Featured</span>
                <span className="hp-tab-count">{featuredPropsList.length}</span>
              </button>
              <button
                className={`hp-tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                <span className="hp-tab-icon">🏠</span>
                <span>All Properties</span>
              </button>
              {isAuthenticated && myProperties.length > 0 && (
                <button
                  className={`hp-tab ${activeTab === "my-properties" ? "active" : ""}`}
                  onClick={() => setActiveTab("my-properties")}
                >
                  <span className="hp-tab-icon">📄</span>
                  <span>My Properties</span>
                  <span className="hp-tab-count">{myProperties.length}</span>
                </button>
              )}
              {isAuthenticated && myDeals.length > 0 && (
                <button
                  className={`hp-tab ${activeTab === "my-deals" ? "active" : ""}`}
                  onClick={() => setActiveTab("my-deals")}
                >
                  <span className="hp-tab-icon">📊</span>
                  <span>My Deals</span>
                  <span className="hp-tab-count">{myDeals.length}</span>
                </button>
              )}
            </div>
          )}

          {/* Type Filter Pills */}
          {activeTab === "all" && !showSearchResults && !selectedArea && (
            <div className="hp-type-pills">
              {propertyTypes.map((type) => (
                <button
                  key={type}
                  className={`hp-pill ${selectedType === type ? "active" : ""}`}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {/* Listings Header */}
          <div className="hp-listings-header">
            <h2>{sectionTitle}</h2>
            <div className="hp-listings-actions">
              {(showSearchResults || selectedArea) && (
                <button onClick={handleResetFilters} className="hp-clear-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                  <span>Clear Filter</span>
                </button>
              )}
              {canCreateDeal && (
                <button onClick={handleCreateDeal} className="hp-create-deal-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  <span>Create New Deal</span>
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          {isDealsView ? (
            isLoading ? (
              <div className="hp-loading">
                <div className="hp-loader"></div>
                <p>Loading your deals...</p>
              </div>
            ) : myDeals.length === 0 ? (
              <div className="hp-empty">
                <div className="hp-empty-icon">📋</div>
                <h3>No Deals Yet</h3>
                <p>You don't have any active deals.</p>
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
            <>
              <PropertyList
                properties={displayProperties}
                loading={isLoading}
                onPropertyUpdated={handlePropertyUpdated}
                onPropertyDeleted={handlePropertyDeleted}
                onViewDealDetails={handleViewDealDetails}
              />
              {displayProperties.length >= 8 && (
                <div className="hp-view-more">
                  <Link
                    to={`/search?city=Hyderabad${selectedType !== "All" ? `&propertyType=${selectedType}` : ""}`}
                    className="hp-view-more-btn"
                  >
                    <span>View All Properties</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        {/* ========== HOW IT WORKS ========== */}
        <section className="hp-section hp-how-works">
          <div className="hp-section-header">
            <span className="hp-section-tag">Simple Process</span>
            <h2>How PropertyDealz Works</h2>
            <p>Simple, transparent, and hassle-free property deals</p>
          </div>
          <div className="hp-steps">
            <div className="hp-step">
              <div className="hp-step-num">1</div>
              <div className="hp-step-icon">🔍</div>
              <h3>Search Properties</h3>
              <p>Browse verified listings with photos, videos and complete details</p>
            </div>
            <div className="hp-step-connector">
              <svg viewBox="0 0 100 20" fill="none">
                <path d="M0 10h100" stroke="url(#grad1)" strokeWidth="2" strokeDasharray="6 4"/>
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#6366f1"/>
                    <stop offset="100%" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="hp-step">
              <div className="hp-step-num">2</div>
              <div className="hp-step-icon">📞</div>
              <h3>Connect Directly</h3>
              <p>Contact property owners through our secure platform</p>
            </div>
            <div className="hp-step-connector">
              <svg viewBox="0 0 100 20" fill="none">
                <path d="M0 10h100" stroke="url(#grad2)" strokeWidth="2" strokeDasharray="6 4"/>
                <defs>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6"/>
                    <stop offset="100%" stopColor="#ec4899"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="hp-step">
              <div className="hp-step-num">3</div>
              <div className="hp-step-icon">🎉</div>
              <h3>Close the Deal</h3>
              <p>Complete your transaction with our end-to-end support</p>
            </div>
          </div>
          <div className="hp-cta-group">
            <button onClick={() => navigate("/my-properties")} className="hp-cta-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span>Post Your Property Free</span>
            </button>
            <button onClick={handleWhatsApp} className="hp-cta-whatsapp">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>Chat with Us</span>
            </button>
          </div>
        </section>

        {/* ========== EMI CALCULATOR ========== */}
        <section className="hp-section hp-emi">
          <div className="hp-emi-box">
            <div className="hp-emi-content">
              <div className="hp-emi-icon">🧮</div>
              <div className="hp-emi-text">
                <h3>Plan Your Home Loan</h3>
                <p>Calculate your EMI and plan your budget before making the big decision</p>
              </div>
            </div>
            <button onClick={() => navigate("/emi-calculator")} className="hp-emi-btn">
              <span>Open EMI Calculator</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </div>
        </section>
      </div>

      {/* ========== MOBILE STICKY CTA ========== */}
      <div className="hp-mobile-cta">
        <button onClick={handleWhatsApp} className="hp-mobile-btn hp-mobile-whatsapp">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <span>WhatsApp</span>
        </button>
        <button onClick={handleCall} className="hp-mobile-btn hp-mobile-call">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
          </svg>
          <span>Call Now</span>
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
          onUpdate={handleDealUpdated}
          userRole={user?.role}
        />
      )}
    </>
  );
}

export default HomePage;