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
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef(null);
  const dropdownTimerRef = useRef(null);

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

  const handleMouseEnter = (dropdown) => {
    if (dropdownTimerRef.current) {
      clearTimeout(dropdownTimerRef.current);
    }
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300);
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
  };

  const isAdmin = user?.role === "ADMIN";
  const isAgent = user?.role === "AGENT";

  return (
    <header className="unified-header" ref={headerRef}>
      <div className="header-container">
        <div className="header-logo" onClick={() => handleNavigation("/")}>
          <img src={logo} alt="Property Dealz Logo" className="logo-image" />
          <span className="logo-text">Property Dealz</span>
        </div>

        <nav className="header-nav-center">
          <button className="nav-link" onClick={() => handleNavigation("/")}>
            Home
          </button>

          <div
            className="nav-item-dropdown"
            onMouseEnter={() => handleMouseEnter("buy")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="nav-link"
              onClick={() => handleDropdownClick("buy")}
            >
              Buy
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
                    Ready to Move
                  </a>
                  <a onClick={() => handleSearchClick({ listingType: "sale" })}>
                    New Launches
                  </a>
                </div>
                <div className="dropdown-column">
                  <h4>Property Types</h4>
                  <a
                    onClick={() => handlePropertyTypeClick("Apartment", "sale")}
                  >
                    Apartments
                  </a>
                  <a onClick={() => handlePropertyTypeClick("Villa", "sale")}>
                    Villas
                  </a>
                  <a onClick={() => handlePropertyTypeClick("House", "sale")}>
                    Independent Houses
                  </a>
                  <a onClick={() => handlePropertyTypeClick("Plot", "sale")}>
                    Plots/Land
                  </a>
                  <a
                    onClick={() =>
                      handlePropertyTypeClick("Commercial", "sale")
                    }
                  >
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
              </div>
            )}
          </div>

          <div
            className="nav-item-dropdown"
            onMouseEnter={() => handleMouseEnter("rent")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="nav-link"
              onClick={() => handleDropdownClick("rent")}
            >
              Rent
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
                    Verified Properties
                  </a>
                  <a
                    onClick={() =>
                      handleSearchClick({
                        listingType: "rent",
                        furnished: "true",
                      })
                    }
                  >
                    Furnished Homes
                  </a>
                  <a onClick={() => handleSearchClick({ listingType: "rent" })}>
                    Bachelor Friendly
                  </a>
                </div>
                <div className="dropdown-column">
                  <h4>Property Types</h4>
                  <a
                    onClick={() => handlePropertyTypeClick("Apartment", "rent")}
                  >
                    Apartments
                  </a>
                  <a onClick={() => handlePropertyTypeClick("House", "rent")}>
                    Independent Houses
                  </a>
                  <a onClick={() => handlePropertyTypeClick("Villa", "rent")}>
                    Villas
                  </a>
                  <a onClick={() => handlePropertyTypeClick("PG", "rent")}>
                    PG/Hostels
                  </a>
                </div>
                <div className="dropdown-column">
                  <h4>Budget</h4>
                  <a onClick={() => handleBudgetClick(0, 10000, "rent")}>
                    Under ₹10,000
                  </a>
                  <a onClick={() => handleBudgetClick(10000, 20000, "rent")}>
                    ₹10K - ₹20K
                  </a>
                  <a onClick={() => handleBudgetClick(20000, 40000, "rent")}>
                    ₹20K - ₹40K
                  </a>
                  <a onClick={() => handleBudgetClick(40000, 999999, "rent")}>
                    Above ₹40K
                  </a>
                </div>
              </div>
            )}
          </div>

          <div
            className="nav-item-dropdown"
            onMouseEnter={() => handleMouseEnter("sell")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="nav-link"
              onClick={() => handleDropdownClick("sell")}
            >
              Sell
            </button>
            {activeDropdown === "sell" && (
              <div
                className="dropdown-menu"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleMouseLeave}
              >
                <a
                  onClick={() => {
                    if (isAuthenticated) {
                      onPostPropertyClick();
                    } else {
                      onLoginClick();
                    }
                    closeAllDropdowns();
                  }}
                >
                  Post Free Property Ad
                </a>
                <a onClick={() => handleNavigation("/owner-plans")}>
                  Owner Plans
                </a>
                <a onClick={() => handleNavigation("/rental-agreement")}>
                  Rental Agreement
                </a>
                <a onClick={() => handleNavigation("/sale-agreement")}>
                  Sale Agreement
                </a>
                <a onClick={() => handleNavigation("/home-renovation")}>
                  Home Interior/Renovation
                </a>
              </div>
            )}
          </div>

          {isAuthenticated && (
            <button
              className="nav-link"
              onClick={() => handleNavigation("/my-properties")}
            >
              My Properties
            </button>
          )}

          {isAdmin && (
            <>
              <button
                className="nav-link"
                onClick={() => handleNavigation("/admin-deals")}
              >
                Deals
              </button>
              <button
                className="nav-link"
                onClick={() => handleNavigation("/admin/properties")}
              >
                Properties
              </button>
              <button
                className="nav-link"
                onClick={() => handleNavigation("/admin-agents")}
              >
                Agents
              </button>
              <button
                className="nav-link"
                onClick={() => handleNavigation("/admin-users")}
              >
                Users
              </button>
            </>
          )}

          {isAgent && (
            <button
              className="nav-link"
              onClick={() => handleNavigation("/agent-dashboard")}
            >
              Dashboard
            </button>
          )}
        </nav>

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
                Post Property
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
                <span className="user-name">{user?.firstName}</span>
                {activeDropdown === "profile" && (
                  <div
                    className="dropdown-menu user-dropdown"
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <a
                      onClick={() => {
                        onProfileClick();
                        closeAllDropdowns();
                      }}
                    >
                      My Profile
                    </a>
                    <a onClick={() => handleNavigation("/my-properties")}>
                      My Properties
                    </a>
                    <a onClick={() => handleNavigation("/my-deals")}>
                      My Deals
                    </a>
                    <a onClick={() => handleNavigation("/my-agreements")}>
                      My Agreements
                    </a>
                    <hr />
                    <a onClick={handleLogout}>Logout</a>
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
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

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
                <span className="mobile-header-title">Property Dealz</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>✕</button>
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
                        {user?.firstName}
                      </span>
                      <span className="mobile-user-email">{user?.email}</span>
                    </div>
                  </div>
                  <a
                    onClick={() => {
                      onProfileClick();
                      closeAllDropdowns();
                    }}
                  >
                    My Profile
                  </a>
                  <a onClick={() => handleNavigation("/my-properties")}>
                    My Properties
                  </a>
                  <a onClick={() => handleNavigation("/my-deals")}>My Deals</a>
                  <a onClick={() => handleNavigation("/my-agreements")}>
                    My Agreements
                  </a>
                  <a
                    onClick={() => {
                      onPostPropertyClick();
                      closeAllDropdowns();
                    }}
                    className="highlight-link"
                  >
                    Post Property
                  </a>
                </>
              ) : (
                <>
                  <button
                    className="btn-primary full-width"
                    onClick={() => {
                      onLoginClick();
                      closeAllDropdowns();
                    }}
                  >
                    Login
                  </button>
                  <button
                    className="btn-secondary full-width"
                    onClick={() => {
                      onSignupClick();
                      closeAllDropdowns();
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}

              <hr />
              <div className="mobile-section-title">Browse</div>

              <a onClick={() => handleNavigation("/")}>Home</a>
              <a onClick={() => handleNavigation("/search?listingType=sale")}>
                Buy Property
              </a>
              <a onClick={() => handleNavigation("/search?listingType=rent")}>
                Rent Property
              </a>

              <hr />
              <div className="mobile-section-title">Services</div>
              <a onClick={() => handleNavigation("/rental-agreement")}>
                Rental Agreement
              </a>
              <a onClick={() => handleNavigation("/sale-agreement")}>
                Sale Agreement
              </a>
              <a onClick={() => handleNavigation("/owner-plans")}>
                Owner Plans
              </a>
              <a onClick={() => handleNavigation("/home-renovation")}>
                Home Interior
              </a>
              <a onClick={() => handleNavigation("/emi-calculator")}>
                EMI Calculator
              </a>

              {isAdmin && (
                <>
                  <hr />
                  <div className="mobile-section-title">Admin</div>
                  <a onClick={() => handleNavigation("/admin-deals")}>Deals</a>
                  <a onClick={() => handleNavigation("/admin/properties")}>
                    Properties
                  </a>
                  <a onClick={() => handleNavigation("/admin-agents")}>
                    Agents
                  </a>
                  <a onClick={() => handleNavigation("/admin-users")}>Users</a>
                  <a onClick={() => handleNavigation("/admin-dashboard")}>
                    Dashboard
                  </a>
                </>
              )}

              {isAgent && (
                <>
                  <hr />
                  <div className="mobile-section-title">Agent</div>
                  <a onClick={() => handleNavigation("/agent-dashboard")}>
                    Dashboard
                  </a>
                </>
              )}

              {isAuthenticated && (
                <>
                  <hr />
                  <a onClick={handleLogout} className="logout-link">
                    Logout
                  </a>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Header;
