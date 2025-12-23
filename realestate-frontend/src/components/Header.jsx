import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import logo from "../assets/logo-black.png";
import "./Header.css";

function Header({
  onLoginClick,
  onSignupClick,
  onPostPropertyClick,
  onProfileClick,
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);
  const dropdownTimerRef = useRef(null);

  // Scroll detection for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleMouseEnter = (dropdown) => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 250);
  };

  const handleDropdownEnter = () => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
  };

  const handleDropdownClick = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeAllDropdowns = () => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeAllDropdowns();
  };

  const handlePropertyTypeClick = (type, listingType) => {
    const params = new URLSearchParams({ propertyType: type, listingType });
    navigate(`/search?${params.toString()}`);
    closeAllDropdowns();
  };

  const handleBudgetClick = (min, max, listingType) => {
    const params = new URLSearchParams({
      minPrice: min,
      maxPrice: max,
      listingType,
    });
    navigate(`/search?${params.toString()}`);
    closeAllDropdowns();
  };

  const handleSearchClick = (params) => {
    const searchParams = new URLSearchParams(params);
    navigate(`/search?${searchParams.toString()}`);
    closeAllDropdowns();
  };

 const handleLogout = () => {
   logout();
   closeAllDropdowns();
   navigate("/"); // or "/login"
 };


  const capitalizeFirst = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");

  const isAdmin = user?.role === "ADMIN";
  const isAgent = user?.role === "AGENT";
  const isBroker = user?.role === "BROKER";

  // Chevron icon component
  const ChevronDown = () => (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      className="nav-chevron"
    >
      <path
        d="M3 4.5L6 7.5L9 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <header
      className={`unified-header ${isScrolled ? "header-scrolled" : ""}`}
      ref={headerRef}
    >
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => handleNavigation("/")}>
          <img src={logo} alt="PropertyDealz Logo" className="logo-image" />
          <div className="logo-text-wrap">
            <span className="logo-text">PropertyDealz</span>
           </div>
        </div>

        {/* Center Navigation */}
        <nav className="header-nav-center">
          <button
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => handleNavigation("/")}
          >
            Home
          </button>

          {/* Buy Dropdown */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => handleMouseEnter("buy")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`nav-link nav-link-dropdown ${
                activeDropdown === "buy" ? "active" : ""
              }`}
              onClick={() => handleDropdownClick("buy")}
            >
              Buy <ChevronDown />
            </button>
            {activeDropdown === "buy" && (
              <div
                className="dropdown-menu mega-menu"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="dropdown-column">
                  <h4>Popular Choices</h4>
                  <a
                    onClick={() =>
                      handleSearchClick({
                        listingType: "sale",
                        ownerType: "owner",
                      })
                    }
                  >
                    <span className="dropdown-icon">🏠</span>
                    Owner Properties
                  </a>
                  <a
                    onClick={() =>
                      handleSearchClick({
                        listingType: "sale",
                        isVerified: "true",
                      })
                    }
                  >
                    <span className="dropdown-icon">✓</span>
                    Verified Properties
                  </a>
                  <a
                    onClick={() =>
                      handleSearchClick({
                        listingType: "sale",
                        isReadyToMove: "true",
                      })
                    }
                  >
                    <span className="dropdown-icon">🔑</span>
                    Ready to Move
                  </a>
                  <a onClick={() => handleNavigation("/buy-flat-in-hyderabad")}>
                    <span className="dropdown-icon">🆕</span>
                    New Launches
                  </a>
                </div>
                <div className="dropdown-column">
                  <h4>Property Types</h4>
                  <a
                    onClick={() => handlePropertyTypeClick("Apartment", "sale")}
                  >
                    <span className="dropdown-icon">🏢</span>
                    Apartments
                  </a>
                  <a onClick={() => handlePropertyTypeClick("Villa", "sale")}>
                    <span className="dropdown-icon">🏡</span>
                    Villas
                  </a>
                  <a onClick={() => handlePropertyTypeClick("House", "sale")}>
                    <span className="dropdown-icon">🏘️</span>
                    Independent Houses
                  </a>
                  <a onClick={() => handlePropertyTypeClick("Plot", "sale")}>
                    <span className="dropdown-icon">📐</span>
                    Plots/Land
                  </a>
                  <a
                    onClick={() =>
                      handlePropertyTypeClick("Commercial", "sale")
                    }
                  >
                    <span className="dropdown-icon">🏬</span>
                    Commercial
                  </a>
                </div>
                <div className="dropdown-column">
                  <h4>Budget</h4>
                  <a onClick={() => handleBudgetClick(0, 5000000, "sale")}>
                    Under ₹50 Lac
                  </a>
                  <a
                    onClick={() => handleBudgetClick(5000000, 10000000, "sale")}
                  >
                    ₹50 Lac - ₹1 Cr
                  </a>
                  <a
                    onClick={() =>
                      handleBudgetClick(10000000, 20000000, "sale")
                    }
                  >
                    ₹1 Cr - ₹2 Cr
                  </a>
                  <a
                    onClick={() =>
                      handleBudgetClick(20000000, 999999999, "sale")
                    }
                  >
                    Above ₹2 Cr
                  </a>
                </div>
                <div className="dropdown-column dropdown-highlight">
                  <h4>Quick Links</h4>
                  <a
                    onClick={() =>
                      handleNavigation("/flats-for-sale-in-hyderabad")
                    }
                    className="highlight-link"
                  >
                    Flats in Hyderabad
                  </a>
                  <a
                    onClick={() =>
                      handleNavigation("/independent-houses-for-sale-hyderabad")
                    }
                    className="highlight-link"
                  >
                    Houses in Hyderabad
                  </a>
                  <a
                    onClick={() =>
                      handleNavigation("/plots-for-sale-in-hyderabad")
                    }
                    className="highlight-link"
                  >
                    Plots in Hyderabad
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Rent Dropdown */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => handleMouseEnter("rent")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`nav-link nav-link-dropdown ${
                activeDropdown === "rent" ? "active" : ""
              }`}
              onClick={() => handleDropdownClick("rent")}
            >
              Rent <ChevronDown />
            </button>
            {activeDropdown === "rent" && (
              <div
                className="dropdown-menu mega-menu"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="dropdown-column">
                  <h4>Popular Choices</h4>
                  <a
                    onClick={() =>
                      handleSearchClick({
                        listingType: "rent",
                        ownerType: "owner",
                      })
                    }
                  >
                    <span className="dropdown-icon">🏠</span>
                    Owner Properties
                  </a>
                  <a
                    onClick={() =>
                      handleSearchClick({
                        listingType: "rent",
                        isVerified: "true",
                      })
                    }
                  >
                    <span className="dropdown-icon">✓</span>
                    Verified Rentals
                  </a>
                  <a
                    onClick={() =>
                      handleSearchClick({
                        listingType: "rent",
                        furnishing: "Fully Furnished",
                      })
                    }
                  >
                    <span className="dropdown-icon">🛋️</span>
                    Furnished Rentals
                  </a>
                  <a
                    onClick={() =>
                      handleSearchClick({
                        listingType: "rent",
                        isReadyToMove: "true",
                      })
                    }
                  >
                    <span className="dropdown-icon">🔑</span>
                    Immediate Move-in
                  </a>
                </div>
                <div className="dropdown-column">
                  <h4>Property Types</h4>
                  <a
                    onClick={() => handlePropertyTypeClick("Apartment", "rent")}
                  >
                    <span className="dropdown-icon">🏢</span>
                    Apartments
                  </a>
                  <a onClick={() => handlePropertyTypeClick("Villa", "rent")}>
                    <span className="dropdown-icon">🏡</span>
                    Villas
                  </a>
                  <a onClick={() => handlePropertyTypeClick("House", "rent")}>
                    <span className="dropdown-icon">🏘️</span>
                    Independent Houses
                  </a>
                  <a onClick={() => handlePropertyTypeClick("PG", "rent")}>
                    <span className="dropdown-icon">🛏️</span>
                    PG/Hostel
                  </a>
                  <a
                    onClick={() =>
                      handlePropertyTypeClick("Commercial", "rent")
                    }
                  >
                    <span className="dropdown-icon">🏬</span>
                    Commercial
                  </a>
                </div>
                <div className="dropdown-column">
                  <h4>Monthly Rent</h4>
                  <a onClick={() => handleBudgetClick(0, 15000, "rent")}>
                    Under ₹15,000
                  </a>
                  <a onClick={() => handleBudgetClick(15000, 30000, "rent")}>
                    ₹15,000 - ₹30,000
                  </a>
                  <a onClick={() => handleBudgetClick(30000, 50000, "rent")}>
                    ₹30,000 - ₹50,000
                  </a>
                  <a onClick={() => handleBudgetClick(50000, 999999999, "rent")}>
                    Above ₹50,000
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Services Dropdown */}
          <div
            className="nav-item-dropdown"
            onMouseEnter={() => handleMouseEnter("services")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`nav-link nav-link-dropdown ${
                activeDropdown === "services" ? "active" : ""
              }`}
              onClick={() => handleDropdownClick("services")}
            >
              Services <ChevronDown />
            </button>
            {activeDropdown === "services" && (
              <div
                className="dropdown-menu"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleMouseLeave}
              >
                <a onClick={() => handleNavigation("/rental-agreement")}>
                  <span className="dropdown-icon">📄</span>
                  Rental Agreement
                </a>
                <a onClick={() => handleNavigation("/sale-agreement")}>
                  <span className="dropdown-icon">📋</span>
                  Sale Agreement
                </a>
                <a onClick={() => handleNavigation("/owner-plans")}>
                  <span className="dropdown-icon">⭐</span>
                  Owner Plans
                </a>
                <a onClick={() => handleNavigation("/home-renovation")}>
                  <span className="dropdown-icon">🛠️</span>
                  Home Interior
                </a>
                <a onClick={() => handleNavigation("/emi-calculator")}>
                  <span className="dropdown-icon">🧮</span>
                  EMI Calculator
                </a>
              </div>
            )}
          </div>

          {/* Hyderabad Link */}
          <button
            className="nav-link"
            onClick={() => handleNavigation("/hyderabad")}
          >
            Hyderabad
          </button>
        </nav>

        {/* Right Actions */}
        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <button
                className="btn-post-property"
                onClick={() => {
                  onPostPropertyClick();
                  closeAllDropdowns();
                }}
              >
                <span className="btn-icon">+</span>
                Post Property
                <span className="btn-badge">FREE</span>
              </button>
              <div
                className="user-menu"
                onMouseEnter={() => handleMouseEnter("profile")}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleDropdownClick("profile")}
              >
                <span className="user-avatar">
                  {user?.firstName?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="user-name">
                  {capitalizeFirst(user?.firstName)}
                </span>
                <ChevronDown />
                {activeDropdown === "profile" && (
                  <div
                    className="dropdown-menu-col user-dropdown"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="user-dropdown-header">
                      <span className="dropdown-avatar">
                        {user?.firstName?.[0]?.toUpperCase() || "U"}
                      </span>
                      <div className="dropdown-user-info">
                        <span className="dropdown-user-name">
                          {capitalizeFirst(user?.firstName)}{" "}
                          {capitalizeFirst(user?.lastName)}
                        </span>
                        <span className="dropdown-user-role">
                          {user?.role || "User"}
                        </span>
                      </div>
                    </div>
                    <hr />
                    <a
                      onClick={() => {
                        onProfileClick();
                        closeAllDropdowns();
                      }}
                    >
                      <span className="dropdown-icon">👤</span>
                      My Profile
                    </a>
                    <a onClick={() => handleNavigation("/my-properties")}>
                      <span className="dropdown-icon">🏠</span>
                      My Properties
                    </a>
                    <a onClick={() => handleNavigation("/my-deals")}>
                      <span className="dropdown-icon">🤝</span>
                      My Deals
                    </a>
                    <a onClick={() => handleNavigation("/my-agreements")}>
                      <span className="dropdown-icon">📄</span>
                      My Agreements
                    </a>

                    {isAdmin && (
                      <>
                        <hr />
                        <div className="dropdown-section-title">Admin</div>
                        <a onClick={() => handleNavigation("/admin-dashboard")}>
                          <span className="dropdown-icon">📊</span>
                          Dashboard
                        </a>
                        <a onClick={() => handleNavigation("/admin-deals")}>
                          <span className="dropdown-icon">🤝</span>
                          Manage Deals
                        </a>
                        <a onClick={() => handleNavigation("/admin/properties")}>
                          <span className="dropdown-icon">🏢</span>
                          Manage Properties
                        </a>
                        <a onClick={() => handleNavigation("/admin-users")}>
                          <span className="dropdown-icon">👥</span>
                          Manage Users
                        </a>
                        <a onClick={() => handleNavigation("/admin-agents")}>
                          <span className="dropdown-icon">🧑‍💼</span>
                          Manage Agents
                        </a>
                      </>
                    )}

                    {isAgent && (
                      <>
                        <hr />
                        <div className="dropdown-section-title">Agent</div>
                        <a onClick={() => handleNavigation("/agent-dashboard")}>
                          <span className="dropdown-icon">📊</span>
                          Agent Dashboard
                        </a>
                      </>
                    )}

                    {isBroker && (
                      <>
                        <hr />
                        <div className="dropdown-section-title">Broker</div>
                        <a onClick={() => handleNavigation("/broker-dashboard")}>
                          <span className="dropdown-icon">📊</span>
                          Broker Dashboard
                        </a>
                      </>
                    )}

                    <hr />
                    <a onClick={handleLogout} className="logout-link">
                      <span className="dropdown-icon">🚪</span>
                      Logout
                    </a>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <button className="btn-text" onClick={onLoginClick}>
                Login
              </button>
              <button className="btn-primary" onClick={onSignupClick}>
                Sign Up
              </button>
            </>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className={isMobileMenuOpen ? "open" : ""}></span>
            <span className={isMobileMenuOpen ? "open" : ""}></span>
            <span className={isMobileMenuOpen ? "open" : ""}></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="mobile-menu-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <div className="mobile-header-content">
                <img src={logo} alt="Logo" className="mobile-header-logo" />
                <div className="mobile-header-text">
                  <span className="mobile-header-title">PropertyDealz</span>
                  <span className="mobile-header-tagline">Zero Brokerage</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-menu-close"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div className="mobile-menu-content">
              {isAuthenticated ? (
                <>
                  <div className="mobile-user-info">
                    <span className="mobile-avatar">
                      {user?.firstName?.[0]?.toUpperCase() || "U"}
                    </span>
                    <div className="mobile-user-details">
                      <span className="mobile-user-name">
                        {capitalizeFirst(user?.firstName)}{" "}
                        {capitalizeFirst(user?.lastName)}
                      </span>
                      <span className="mobile-user-role">
                        {user?.role || "User"}
                      </span>
                    </div>
                  </div>

                  <a
                    onClick={() => {
                      onPostPropertyClick();
                      closeAllDropdowns();
                    }}
                    className="highlight-link"
                  >
                    <span className="link-icon">+</span>
                    Post Property
                    <span className="free-badge">FREE</span>
                  </a>
                </>
              ) : (
                <div className="login-signup">
                  <button
                    className="btn-primary"
                    onClick={() => {
                      onLoginClick();
                      closeAllDropdowns();
                    }}
                  >
                    Login
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      onSignupClick();
                      closeAllDropdowns();
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              <hr />
              <div className="mobile-section-title">Browse Properties</div>

              <a onClick={() => handleNavigation("/")}>
                <span className="link-icon">🏠</span>
                Home
              </a>
              <a onClick={() => handleNavigation("/search?listingType=sale")}>
                <span className="link-icon">🛒</span>
                Buy Property
              </a>
              <a onClick={() => handleNavigation("/search?listingType=rent")}>
                <span className="link-icon">🔑</span>
                Rent Property
              </a>
              <a onClick={() => handleNavigation("/hyderabad")}>
                <span className="link-icon">📍</span>
                Hyderabad Properties
              </a>

              <hr />
              <div className="mobile-section-title">Services</div>

              <a onClick={() => handleNavigation("/rental-agreement")}>
                <span className="link-icon">📄</span>
                Rental Agreement
              </a>
              <a onClick={() => handleNavigation("/sale-agreement")}>
                <span className="link-icon">📋</span>
                Sale Agreement
              </a>
              <a onClick={() => handleNavigation("/owner-plans")}>
                <span className="link-icon">⭐</span>
                Owner Plans
              </a>
              <a onClick={() => handleNavigation("/home-renovation")}>
                <span className="link-icon">🛠️</span>
                Home Interior
              </a>
              <a onClick={() => handleNavigation("/emi-calculator")}>
                <span className="link-icon">🧮</span>
                EMI Calculator
              </a>

              {isAuthenticated && (
                <>
                  <hr />
                  <div className="mobile-section-title">My Account</div>

                  <a
                    onClick={() => {
                      onProfileClick();
                      closeAllDropdowns();
                    }}
                  >
                    <span className="link-icon">👤</span>
                    My Profile
                  </a>
                  <a onClick={() => handleNavigation("/my-properties")}>
                    <span className="link-icon">🏘️</span>
                    My Properties
                  </a>
                  <a onClick={() => handleNavigation("/my-deals")}>
                    <span className="link-icon">🤝</span>
                    My Deals
                  </a>
                  <a onClick={() => handleNavigation("/my-agreements")}>
                    <span className="link-icon">📄</span>
                    My Agreements
                  </a>
                </>
              )}

              {isAdmin && (
                <>
                  <hr />
                  <div className="mobile-section-title">Admin Panel</div>
                  <a onClick={() => handleNavigation("/admin-dashboard")}>
                    <span className="link-icon">📊</span>
                    Dashboard
                  </a>
                  <a onClick={() => handleNavigation("/admin-deals")}>
                    <span className="link-icon">🤝</span>
                    Deals
                  </a>
                  <a onClick={() => handleNavigation("/admin/properties")}>
                    <span className="link-icon">🏢</span>
                    Properties
                  </a>
                  <a onClick={() => handleNavigation("/admin-agents")}>
                    <span className="link-icon">🧑‍💼</span>
                    Agents
                  </a>
                  <a onClick={() => handleNavigation("/admin-users")}>
                    <span className="link-icon">👥</span>
                    Users
                  </a>
                </>
              )}

              {isAgent && (
                <>
                  <hr />
                  <div className="mobile-section-title">Agent Panel</div>
                  <a onClick={() => handleNavigation("/agent-dashboard")}>
                    <span className="link-icon">📊</span>
                    Dashboard
                  </a>
                </>
              )}

              {isBroker && (
                <>
                  <hr />
                  <div className="mobile-section-title">Broker Panel</div>
                  <a onClick={() => handleNavigation("/broker-dashboard")}>
                    <span className="link-icon">📊</span>
                    Dashboard
                  </a>
                </>
              )}

              {isAuthenticated && (
                <>
                  <hr />
                  <a onClick={handleLogout} className="logout-link">
                    <span className="link-icon">🚪</span>
                    Logout
                  </a>
                </>
              )}

              {/* Trust Badge */}
              <div className="mobile-trust-badge">
                <span className="trust-icon">🛡️</span>
                <span className="trust-text">
                  100% Zero Brokerage • Direct Owner Contact
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Header;