import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import "./SubHeader.css";

function SubHeader() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const dropdownTimerRef = useRef(null);
  const subHeaderRef = useRef(null);

  // Check screen size and update responsive states
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle scroll behavior for hiding/showing subheader
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY;

      if (diff > 5 && currentScrollY > 100) {
        setIsHidden(true);
        setActiveDropdown(null);
        setShowMobileMenu(false);
      } else if (diff < -10) {
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        subHeaderRef.current &&
        !subHeaderRef.current.contains(event.target)
      ) {
        setActiveDropdown(null);
        setShowMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Don't render if not authenticated
  if (!isAuthenticated) return null;

  const handleMouseEnter = (dropdown) => {
    if (isMobile) return; // Disable hover on mobile
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    if (isMobile) return; // Disable hover on mobile
    dropdownTimerRef.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  const handleDropdownEnter = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
  };

  const handleMobileDropdownToggle = (dropdown) => {
    if (!isMobile) return;
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handlePropertyTypeClick = (type, listingType) => {
    const params = new URLSearchParams({ propertyType: type, listingType });
    navigate(`/search?${params.toString()}`);
    setActiveDropdown(null);
    setShowMobileMenu(false);
  };

  const handleBudgetClick = (budget, listingType) => {
    const params = new URLSearchParams({
      minPrice: budget.min,
      maxPrice: budget.max,
      listingType,
    });
    navigate(`/search?${params.toString()}`);
    setActiveDropdown(null);
    setShowMobileMenu(false);
  };

  const handleChoiceClick = (choice) => {
    const params = new URLSearchParams(choice.params || {});
    navigate(`/search?${params.toString()}`);
    setActiveDropdown(null);
    setShowMobileMenu(false);
  };

  const handleSellClick = (path) => {
    navigate(path);
    setActiveDropdown(null);
    setShowMobileMenu(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setActiveDropdown(null);
    setShowMobileMenu(false);
  };

  const handleMyPropertiesClick = () => {
    navigate("/my-properties");
    setActiveDropdown(null);
    setShowMobileMenu(false);
  };

  const dropdownData = {
    buy: {
      popularChoices: [
        {
          label: "Owner Properties",
          params: { listingType: "sale", ownerType: "owner" },
          icon: "🏠",
        },
        {
          label: "Verified Properties",
          params: { listingType: "sale", isVerified: true },
          icon: "✅",
        },
        {
          label: "Ready to Move",
          params: { listingType: "sale", isReadyToMove: true },
          icon: "🔑",
        },
        {
          label: "Broker Properties",
          params: { listingType: "sale", ownerType: "broker" },
          icon: "🏢",
        },
      ],
      propertyTypes: [
        { label: "Apartments", value: "Apartment", icon: "🏢" },
        { label: "Villas", value: "Villa", icon: "🏖" },
        { label: "Houses", value: "House", icon: "🏠" },
        { label: "Plots", value: "Plot", icon: "📐" },
        { label: "Commercial", value: "Commercial", icon: "🏢" },
      ],
      budget: [
        { label: "Under ₹50 Lac", min: 0, max: 5000000, icon: "💰" },
        { label: "₹50 Lac - ₹1 Cr", min: 5000000, max: 10000000, icon: "💰" },
        { label: "₹1 Cr - ₹2 Cr", min: 10000000, max: 20000000, icon: "💰" },
        { label: "Above ₹2 Cr", min: 20000000, max: 999999999, icon: "💰" },
      ],
    },
    rent: {
      popularChoices: [
        {
          label: "Owner Properties",
          params: { listingType: "rent" },
          icon: "🏠",
        },
        {
          label: "Verified Properties",
          params: { listingType: "rent" },
          icon: "✅",
        },
        {
          label: "Furnished Homes",
          params: { listingType: "rent" },
          icon: "🛋",
        },
        {
          label: "Bachelor Friendly",
          params: { listingType: "rent" },
          icon: "👤",
        },
      ],
      propertyTypes: [
        { label: "Apartments", value: "Apartment", icon: "🏢" },
        { label: "Houses", value: "House", icon: "🏠" },
        { label: "Villas", value: "Villa", icon: "🏖" },
        { label: "PG", value: "PG", icon: "🛏" },
      ],
      budget: [
        { label: "Under ₹10,000", min: 0, max: 10000, icon: "💰" },
        { label: "₹10,000 - ₹20,000", min: 10000, max: 20000, icon: "💰" },
        { label: "₹20,000 - ₹40,000", min: 20000, max: 40000, icon: "💰" },
        { label: "Above ₹40,000", min: 40000, max: 999999, icon: "💰" },
      ],
    },
    sell: {
      options: [
        { label: "Post Free Property Ad", path: "/post-property", icon: "✍️" },
        { label: "Owner Plans", path: "/owner-plans", icon: "📋" },
        { label: "Rental Agreement", path: "/rental-agreement", icon: "📄" },
        {
          label: "Home Interior/Renovation",
          path: "/home-renovation",
          icon: "🔨",
        },
      ],
    },
  };

  return (
    <div
      className={`subheader-wrapper ${isHidden ? "hidden" : ""} ${
        isMobile ? "mobile" : ""
      } ${isTablet ? "tablet" : ""}`}
      ref={subHeaderRef}
    >
      <div className="subheader-inner">
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle navigation menu"
          >
            <span className={`hamburger ${showMobileMenu ? "active" : ""}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span className="menu-text">Menu</span>
          </button>
        )}

        {/* Navigation Dropdowns */}
        <div
          className={`dropdowns-tab ${
            isMobile && showMobileMenu ? "mobile-open" : ""
          }`}
        >
          {/* HOME */}
          <div className="subheader-item">
            <button
              onClick={() => handleNavigation("/")}
              className="subheader-dropdown-btn home-btn"
            >
              🏠 <span className="btn-text">Home</span>
            </button>
          </div>

          {/* BUY */}
          <div
            className="subheader-item"
            onMouseEnter={() => handleMouseEnter("buy")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="subheader-dropdown-btn"
              onClick={() => handleMobileDropdownToggle("buy")}
            >
              🛒 <span className="btn-text">Buy</span>
              <span className="dropdown-arrow">▾</span>
            </button>
            {activeDropdown === "buy" && (
              <div
                className={`subheader-dropdown wide ${
                  isMobile ? "mobile" : ""
                }`}
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="dropdown-section">
                  <h4>Popular Choices</h4>
                  {dropdownData.buy.popularChoices.map((item) => (
                    <div
                      key={item.label}
                      className="dropdown-item"
                      onClick={() => handleChoiceClick(item)}
                    >
                      <span className="item-icon">{item.icon}</span>
                      <span className="item-label">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="dropdown-section">
                  <h4>Property Types</h4>
                  {dropdownData.buy.propertyTypes.map((item) => (
                    <div
                      key={item.value}
                      className="dropdown-item"
                      onClick={() =>
                        handlePropertyTypeClick(item.value, "sale")
                      }
                    >
                      <span className="item-icon">{item.icon}</span>
                      <span className="item-label">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="dropdown-section">
                  <h4>Budget</h4>
                  {dropdownData.buy.budget.map((item) => (
                    <div
                      key={item.label}
                      className="dropdown-item"
                      onClick={() => handleBudgetClick(item, "sale")}
                    >
                      <span className="item-icon">{item.icon}</span>
                      <span className="item-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RENT */}
          <div
            className="subheader-item"
            onMouseEnter={() => handleMouseEnter("rent")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="subheader-dropdown-btn"
              onClick={() => handleMobileDropdownToggle("rent")}
            >
              🏠 <span className="btn-text">Rent</span>
              <span className="dropdown-arrow">▾</span>
            </button>
            {activeDropdown === "rent" && (
              <div
                className={`subheader-dropdown wide ${
                  isMobile ? "mobile" : ""
                }`}
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="dropdown-section">
                  <h4>Popular Choices</h4>
                  {dropdownData.rent.popularChoices.map((item) => (
                    <div
                      key={item.label}
                      className="dropdown-item"
                      onClick={() => handleChoiceClick(item)}
                    >
                      <span className="item-icon">{item.icon}</span>
                      <span className="item-label">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="dropdown-section">
                  <h4>Property Types</h4>
                  {dropdownData.rent.propertyTypes.map((item) => (
                    <div
                      key={item.value}
                      className="dropdown-item"
                      onClick={() =>
                        handlePropertyTypeClick(item.value, "rent")
                      }
                    >
                      <span className="item-icon">{item.icon}</span>
                      <span className="item-label">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="dropdown-section">
                  <h4>Budget</h4>
                  {dropdownData.rent.budget.map((item) => (
                    <div
                      key={item.label}
                      className="dropdown-item"
                      onClick={() => handleBudgetClick(item, "rent")}
                    >
                      <span className="item-icon">{item.icon}</span>
                      <span className="item-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SELL */}
          <div
            className="subheader-item"
            onMouseEnter={() => handleMouseEnter("sell")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="subheader-dropdown-btn"
              onClick={() => handleMobileDropdownToggle("sell")}
            >
              💰 <span className="btn-text">Sell</span>
              <span className="dropdown-arrow">▾</span>
            </button>
            {activeDropdown === "sell" && (
              <div
                className={`subheader-dropdown ${isMobile ? "mobile" : ""}`}
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleMouseLeave}
              >
                {dropdownData.sell.options.map((item) => (
                  <div
                    key={item.label}
                    className="dropdown-item"
                    onClick={() => handleSellClick(item.path)}
                  >
                    <span className="item-icon">{item.icon}</span>
                    <span className="item-label">{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={`subheader-btns-tab ${
            isMobile && showMobileMenu ? "mobile-open" : ""
          }`}
        >
          <button
            onClick={handleMyPropertiesClick}
            className="subheader-btn my-properties-btn"
          >
            <span className="btn-icon">🏠</span>
            <span className="btn-text">My Properties</span>
          </button>

          {/* ADMIN BUTTONS */}
          {user?.role === "ADMIN" && (
            <>
              <button
                onClick={() => handleNavigation("/admin-deals")}
                className="subheader-btn green"
              >
                <span className="btn-icon">📋</span>
                <span className="btn-text">Deals</span>
              </button>
              <button
                onClick={() => handleNavigation("/admin-agents")}
                className="subheader-btn blue"
              >
                <span className="btn-icon">👥</span>
                <span className="btn-text">Agents</span>
              </button>
              <button
                onClick={() => handleNavigation("/admin-users")}
                className="subheader-btn purple"
              >
                <span className="btn-icon">👨‍💼</span>
                <span className="btn-text">Users</span>
              </button>
            </>
          )}

          {/* AGENT BUTTON */}
          {user?.role === "AGENT" && (
            <button
              onClick={() => handleNavigation("/agent-dashboard")}
              className="subheader-btn green"
            >
              <span className="btn-icon">📊</span>
              <span className="btn-text">Dashboard</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobile && showMobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </div>
  );
}

export default SubHeader;
