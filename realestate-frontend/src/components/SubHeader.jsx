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
  const dropdownTimerRef = useRef(null);

  // ⭐ ADDED: State to resolve the ReferenceError (Fix 2) ⭐
  // Although the profile dropdown UI isn't visible, the setter must be defined.
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleMyPropertiesClick = () => {
    navigate("/my-properties");
    setActiveDropdown(null);
    // ⭐ FIXED: setProfileDropdownOpen is now in scope ⭐
    setProfileDropdownOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY;

      if (diff > 5 && currentScrollY > 100) {
        setIsHidden(true);
      } else if (diff < -10) {
        setIsHidden(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  if (!isAuthenticated) return null;

  const handleMouseEnter = (dropdown) => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    setActiveDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    dropdownTimerRef.current = setTimeout(() => setActiveDropdown(null), 200);
  };

  const handleDropdownEnter = () => {
    if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
  };

  const handlePropertyTypeClick = (type, listingType) => {
    const params = new URLSearchParams({ propertyType: type, listingType });
    navigate(`/search?${params.toString()}`);
    setActiveDropdown(null);
  };

  const handleBudgetClick = (budget, listingType) => {
    const params = new URLSearchParams({
      minPrice: budget.min,
      maxPrice: budget.max,
      listingType,
    });
    navigate(`/search?${params.toString()}`);
    setActiveDropdown(null);
  };

  const handleChoiceClick = (choice) => {
    const params = new URLSearchParams(choice.params || {});
    navigate(`/search?${params.toString()}`);
    setActiveDropdown(null);
  };

  const handleSellClick = (path) => {
    navigate(path);
    setActiveDropdown(null);
  };

  const dropdownData = {
    buy: {
      popularChoices: [
        {
          label: "Owner Properties",
          params: { listingType: "sale", ownerType: "owner" },
        },
        {
          label: "Verified Properties",
          params: { listingType: "sale", isVerified: true },
        },
        {
          label: "Ready to Move",
          params: { listingType: "sale", isReadyToMove: true },
        },
        {
          label: "Broker Properties",
          params: { listingType: "sale", ownerType: "broker" },
        },
      ],
      propertyTypes: [
        { label: "Apartments", value: "Apartment" },
        { label: "Villas", value: "Villa" },
        { label: "Houses", value: "House" },
        { label: "Plots", value: "Plot" },
        { label: "Commercial", value: "Commercial" },
      ],
      budget: [
        { label: "Under ₹50 Lac", min: 0, max: 5000000 },
        { label: "₹50 Lac - ₹1 Cr", min: 5000000, max: 10000000 },
        { label: "₹1 Cr - ₹2 Cr", min: 10000000, max: 20000000 },
        { label: "Above ₹2 Cr", min: 20000000, max: 999999999 },
      ],
    },
    rent: {
      popularChoices: [
        { label: "Owner Properties", params: { listingType: "rent" } },
        { label: "Verified Properties", params: { listingType: "rent" } },
        { label: "Furnished Homes", params: { listingType: "rent" } },
        { label: "Bachelor Friendly", params: { listingType: "rent" } },
      ],
      propertyTypes: [
        { label: "Apartments", value: "Apartment" },
        { label: "Houses", value: "House" },
        { label: "Villas", value: "Villa" },
        { label: "PG", value: "PG" },
      ],
      budget: [
        { label: "Under ₹10,000", min: 0, max: 10000 },
        { label: "₹10,000 - ₹20,000", min: 10000, max: 20000 },
        { label: "₹20,000 - ₹40,000", min: 20000, max: 40000 },
        { label: "Above ₹40,000", min: 40000, max: 999999 },
      ],
    },
    sell: {
      options: [
        { label: "Post Free Property Ad", path: "/post-property" },
        { label: "Owner Plans", path: "/owner-plans" },
        { label: "Rental Agreement", path: "/rental-agreement" },
        { label: "Home Interior/Renovation", path: "/home-renovation" },
      ],
    },
  };

  return (
    <div className={`subheader-wrapper ${isHidden ? "hidden" : ""}`}>
      <div className="subheader-inner">
        <div className="dropdowns-tab">
          {/* HOME */}
          <div
            className="subheader-item"
            onMouseEnter={() => handleMouseEnter("home")}
            onMouseLeave={handleMouseLeave}
          >
            <button
              onClick={() => navigate("/")}
              className="subheader-dropdown-btn"
            >
              Home
            </button>
          </div>

          {/* BUY */}
          <div
            className="subheader-item"
            onMouseEnter={() => handleMouseEnter("buy")}
            onMouseLeave={handleMouseLeave}
          >
            <button className="subheader-dropdown-btn">Buy ▾</button>
            {activeDropdown === "buy" && (
              <div
                className="subheader-dropdown wide"
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
                      {item.label}
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
                      {item.label}
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
                      {item.label}
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
            <button className="subheader-dropdown-btn">Rent ▾</button>
            {activeDropdown === "rent" && (
              <div
                className="subheader-dropdown wide"
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
                      {item.label}
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
                      {item.label}
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
                      {item.label}
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
            <button className="subheader-dropdown-btn">Sell ▾</button>
            {activeDropdown === "sell" && (
              <div
                className="subheader-dropdown"
                onMouseEnter={handleDropdownEnter}
                onMouseLeave={handleMouseLeave}
              >
                {dropdownData.sell.options.map((item) => (
                  <div
                    key={item.label}
                    className="dropdown-item"
                    onClick={() => handleSellClick(item.path)}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="subheader-btns-tab">
          <button
            onClick={handleMyPropertiesClick}
            style={{
              color: "white",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: "12px 20px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "14px",
            }}
          >
            My Properties
          </button>
          {/* ADMIN / AGENT BUTTONS */}
          {user?.role === "ADMIN" && (
            <>
              <button
                onClick={() => navigate("/admin-deals")}
                className="subheader-btn green"
              >
                📋 View Deals
              </button>
              <button
                onClick={() => navigate("/admin-agents")}
                className="subheader-btn blue"
              >
                👥 View Agents
              </button>
              <button
                onClick={() => navigate("/admin-users")}
                className="subheader-btn purple"
              >
                👨‍💼 View Users
              </button>
            </>
          )}

          {user?.role === "AGENT" && (
            <button
              onClick={() => navigate("/agent-dashboard")}
              className="subheader-btn green"
            >
              📊 Agent Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SubHeader;