// src/pages/HomePage.jsx
// ✅ COMPLETE REDESIGN - Matches SEO Pages Style
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

  // Popular Areas Data
  const popularAreas = [
    { name: "Gachibowli", icon: "🏢", color: "#667eea" },
    { name: "HITEC City", icon: "🌆", color: "#f093fb" },
    { name: "Madhapur", icon: "🏙️", color: "#4facfe" },
    { name: "Kondapur", icon: "🏢", color: "#43e97b" },
    { name: "Kukatpally", icon: "🏘️", color: "#fa709a" },
    { name: "Miyapur", icon: "🌇", color: "#a8edea" },
    { name: "Jubilee Hills", icon: "🏛️", color: "#ffecd2" },
    { name: "Banjara Hills", icon: "🌳", color: "#d299c2" },
  ];

  // Property Types Config
  const propertyTypeConfig = [
    { type: "Apartment", icon: "🏢", desc: "Flats & Apartments" },
    { type: "Villa", icon: "🏡", desc: "Luxury Villas" },
    { type: "House", icon: "🏠", desc: "Independent Houses" },
    { type: "Plot", icon: "📐", desc: "Residential Plots" },
    { type: "Commercial", icon: "🏪", desc: "Office & Shops" },
    { type: "PG", icon: "🏨", desc: "Paying Guest" },
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

      // Separate featured and regular
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
      console.error("Error fetching user properties:", error);
      setMyProperties([]);
    } finally {
      setLoadingMyProperties(false);
    }
  };

  const fetchMyDeals = async () => {
    if (!user?.id) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;

    setLoadingMyDeals(true);
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
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setMyDeals(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Error fetching deals:", error);
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
    if (!query?.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    if (searchAbortRef.current) searchAbortRef.current.abort();

    const controller = new AbortController();
    searchAbortRef.current = controller;

    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/search/quick?q=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );

      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();

      let results = [];
      if (data.success && Array.isArray(data.data)) results = data.data;
      else if (Array.isArray(data.data)) results = data.data;
      else if (Array.isArray(data)) results = data;

      setSearchResults(results.map(normalizeProperty));
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
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    if (!searchQuery?.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    searchDebounceRef.current = setTimeout(() => {
      performSearch(searchQuery.trim());
    }, 400);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery?.trim()) {
      performSearch(searchQuery.trim());
    }
  };

  // Area click handler
  const handleAreaClick = async (areaName) => {
    setSelectedArea(areaName);
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchLoading(true);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/properties/byArea/${areaName}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();

      let results = [];
      if (data.success && Array.isArray(data.data)) results = data.data;
      else if (Array.isArray(data.data)) results = data.data;
      else if (Array.isArray(data)) results = data;

      setSearchResults(results.map(normalizeProperty));
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error fetching area properties:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }

    // Scroll to listings
    setTimeout(() => {
      document.querySelector(".hp-listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Type click handler
  const handleTypeClick = (typeName) => {
    setSelectedType(typeName);
    setActiveTab("all");
    setShowSearchResults(false);
    setSelectedArea(null);
    setSearchQuery("");

    setTimeout(() => {
      document.querySelector(".hp-listings")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchResults([]);
    setShowSearchResults(false);
    setSearchLoading(false);
    setSearchQuery("");
    setSelectedArea(null);
    setSelectedType("All");
    setActiveTab("featured");
  };

  // Property handlers
  const handlePropertyUpdated = () => {
    if (activeTab === "my-properties") fetchMyProperties();
    else fetchProperties();
  };

  const handlePropertyDeleted = (deletedId) => {
    const filterById = (list) => list.filter((p) =>
      String(p.id) !== String(deletedId) && String(p.propertyId) !== String(deletedId)
    );
    setFeaturedPropsList(filterById);
    setAllProperties(filterById);
    setSearchResults(filterById);
    setMyProperties(filterById);
  };

  // Deal handlers
  const handleViewDealDetails = (deal) => setSelectedDealForModal(deal);
  const handleCloseDealModal = () => setSelectedDealForModal(null);
  const handleDealUpdated = () => fetchMyDeals();
  const handleCreateDeal = () => setShowBrowseDeals(true);

  // Contact handlers
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
    if (activeTab === "my-deals") return []; // Deals handled separately
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
          <div className="hp-hero-bg"></div>
          <div className="hp-hero-content">
            <h1 className="hp-hero-title">
              Find Your Dream Property in Hyderabad
            </h1>
            <p className="hp-hero-subtitle">
              Zero Brokerage • Verified Listings • Direct Owner Contact
            </p>

            {/* Search Form */}
            <form className="hp-search-form" onSubmit={handleSearchSubmit}>
              <div className="hp-search-box">
                <span className="hp-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search by location, property type (e.g., '2BHK Gachibowli')"
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
                    ✕
                  </button>
                )}
                <button type="submit" className="hp-search-btn">
                  Search
                </button>
              </div>
              {searchLoading && <div className="hp-search-status">Searching...</div>}
            </form>

            {/* Hero Stats */}
            <div className="hp-hero-stats">
              <div className="hp-stat">
                <span className="hp-stat-value">500+</span>
                <span className="hp-stat-label">Verified Properties</span>
              </div>
              <div className="hp-stat">
                <span className="hp-stat-value">₹0</span>
                <span className="hp-stat-label">Brokerage</span>
              </div>
              <div className="hp-stat">
                <span className="hp-stat-value">50+</span>
                <span className="hp-stat-label">Localities</span>
              </div>
              <div className="hp-stat">
                <span className="hp-stat-value">1000+</span>
                <span className="hp-stat-label">Happy Customers</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========== TRUST SIGNALS ========== */}
        <section className="hp-trust">
          <div className="hp-trust-container">
            <div className="hp-trust-item">
              <span className="hp-trust-icon">💰</span>
              <div className="hp-trust-text">
                <strong>Zero Brokerage</strong>
                <span>Save lakhs on fees</span>
              </div>
            </div>
            <div className="hp-trust-item">
              <span className="hp-trust-icon">✅</span>
              <div className="hp-trust-text">
                <strong>Verified Listings</strong>
                <span>Every property checked</span>
              </div>
            </div>
            <div className="hp-trust-item">
              <span className="hp-trust-icon">📞</span>
              <div className="hp-trust-text">
                <strong>Direct Contact</strong>
                <span>Talk to owners directly</span>
              </div>
            </div>
            <div className="hp-trust-item">
              <span className="hp-trust-icon">🔒</span>
              <div className="hp-trust-text">
                <strong>Secure Deals</strong>
                <span>End-to-end support</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========== POPULAR AREAS ========== */}
        <section className="hp-section hp-areas">
          <div className="hp-section-header">
            <h2>📍 Popular Areas in Hyderabad</h2>
            <p>Explore properties in the most sought-after locations</p>
          </div>
          <div className="hp-areas-grid">
            {popularAreas.map((area) => (
              <button
                key={area.name}
                className={`hp-area-card ${selectedArea === area.name ? "active" : ""}`}
                onClick={() => handleAreaClick(area.name)}
                style={{ "--area-color": area.color }}
              >
                <span className="hp-area-icon">{area.icon}</span>
                <span className="hp-area-name">{area.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ========== PROPERTY TYPES ========== */}
        <section className="hp-section hp-types">
          <div className="hp-section-header">
            <h2>🏘️ Browse by Property Type</h2>
            <p>Find your perfect property from our diverse range</p>
          </div>
          <div className="hp-types-grid">
            {propertyTypeConfig.map((item) => (
              <button
                key={item.type}
                className={`hp-type-card ${selectedType === item.type ? "active" : ""}`}
                onClick={() => handleTypeClick(item.type)}
              >
                <span className="hp-type-icon">{item.icon}</span>
                <span className="hp-type-name">{item.type}</span>
                <span className="hp-type-desc">{item.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* ========== SEO QUICK LINKS ========== */}
        <section className="hp-section hp-quick-links">
          <div className="hp-section-header">
            <h2>🔥 Popular Searches</h2>
          </div>
          <div className="hp-links-grid">
            <Link to="/buy-flat-in-hyderabad/" className="hp-quick-link">
              Buy Flat in Hyderabad
            </Link>
            <Link to="/flats-for-sale-in-hyderabad/" className="hp-quick-link">
              Flats for Sale
            </Link>
            <Link to="/plots-for-sale-in-hyderabad/" className="hp-quick-link">
              Plots for Sale
            </Link>
            <Link to="/independent-houses-for-sale-hyderabad/" className="hp-quick-link">
              Independent Houses
            </Link>
            <Link to="/hyderabad/" className="hp-quick-link">
              All Hyderabad Properties
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
                ⭐ Featured ({featuredPropsList.length})
              </button>
              <button
                className={`hp-tab ${activeTab === "all" ? "active" : ""}`}
                onClick={() => setActiveTab("all")}
              >
                🏠 All Properties
              </button>
              {isAuthenticated && myProperties.length > 0 && (
                <button
                  className={`hp-tab ${activeTab === "my-properties" ? "active" : ""}`}
                  onClick={() => setActiveTab("my-properties")}
                >
                  📄 My Properties ({myProperties.length})
                </button>
              )}
              {isAuthenticated && myDeals.length > 0 && (
                <button
                  className={`hp-tab ${activeTab === "my-deals" ? "active" : ""}`}
                  onClick={() => setActiveTab("my-deals")}
                >
                  📊 My Deals ({myDeals.length})
                </button>
              )}
            </div>
          )}

          {/* Type Filter Pills (for All Properties tab) */}
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
                  ✕ Clear Filter
                </button>
              )}
              {canCreateDeal && (
                <button onClick={handleCreateDeal} className="hp-create-deal-btn">
                  ➕ Create New Deal
                </button>
              )}
            </div>
          </div>

          {/* Content: Deals or Properties */}
          {isDealsView ? (
            isLoading ? (
              <div className="hp-loading">Loading your deals...</div>
            ) : myDeals.length === 0 ? (
              <div className="hp-empty">
                <span className="hp-empty-icon">📋</span>
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
                    View All Properties →
                  </Link>
                </div>
              )}
            </>
          )}
        </section>

        {/* ========== HOW IT WORKS ========== */}
        <section className="hp-section hp-how-works">
          <div className="hp-section-header">
            <h2>✨ How PropertyDealz Works</h2>
            <p>Simple, transparent, and hassle-free property deals</p>
          </div>
          <div className="hp-steps">
            <div className="hp-step">
              <div className="hp-step-num">1</div>
              <span className="hp-step-icon">🔍</span>
              <h3>Search Properties</h3>
              <p>Browse verified listings with photos and details</p>
            </div>
            <div className="hp-step-arrow">→</div>
            <div className="hp-step">
              <div className="hp-step-num">2</div>
              <span className="hp-step-icon">📞</span>
              <h3>Connect Directly</h3>
              <p>Contact property owners through our platform</p>
            </div>
            <div className="hp-step-arrow">→</div>
            <div className="hp-step">
              <div className="hp-step-num">3</div>
              <span className="hp-step-icon">🎉</span>
              <h3>Close the Deal</h3>
              <p>Complete your transaction with our support</p>
            </div>
          </div>
          <div className="hp-cta-group">
            <button onClick={() => navigate("/my-properties")} className="hp-cta-primary">
              📝 Post Your Property Free
            </button>
            <button onClick={handleWhatsApp} className="hp-cta-whatsapp">
              💬 Chat with Us
            </button>
          </div>
        </section>



        {/* ========== EMI CALCULATOR ========== */}
        <section className="hp-section hp-emi">
          <div className="hp-emi-box">
            <span className="hp-emi-icon">🧮</span>
            <div className="hp-emi-text">
              <h3>Plan Your Home Loan</h3>
              <p>Calculate your EMI and plan your budget</p>
            </div>
            <button onClick={() => navigate("/emi-calculator")} className="hp-emi-btn">
              Open EMI Calculator →
            </button>
          </div>
        </section>
      </div>

      {/* ========== MOBILE STICKY CTA ========== */}
      <div className="hp-mobile-cta">
        <button onClick={handleWhatsApp} className="hp-mobile-btn hp-mobile-whatsapp">
          💬 WhatsApp
        </button>
        <button onClick={handleCall} className="hp-mobile-btn hp-mobile-call">
          📞 Call Now
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