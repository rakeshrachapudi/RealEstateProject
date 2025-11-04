import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import "./MobileNav.css";

const MobileNav = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activeSubmenu, setActiveSubmenu] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleNavClick = (path) => {
    navigate(path);
    onClose();
    setActiveSubmenu(null);
  };

  const handleSubmenuToggle = (menu) => {
    setActiveSubmenu(activeSubmenu === menu ? null : menu);
  };

  const handleSearchNavigation = (params) => {
    const searchParams = new URLSearchParams(params);
    navigate(`/search?${searchParams.toString()}`);
    onClose();
    setActiveSubmenu(null);
  };

  const buyOptions = [
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
      label: "Apartments",
      params: { listingType: "sale", propertyType: "Apartment" },
    },
    { label: "Villas", params: { listingType: "sale", propertyType: "Villa" } },
    { label: "Houses", params: { listingType: "sale", propertyType: "House" } },
    { label: "Plots", params: { listingType: "sale", propertyType: "Plot" } },
  ];

  const rentOptions = [
    {
      label: "Owner Properties",
      params: { listingType: "rent", ownerType: "owner" },
    },
    {
      label: "Furnished Homes",
      params: { listingType: "rent", isFurnished: true },
    },
    {
      label: "Bachelor Friendly",
      params: { listingType: "rent", isBachelorFriendly: true },
    },
    {
      label: "Apartments",
      params: { listingType: "rent", propertyType: "Apartment" },
    },
    { label: "Houses", params: { listingType: "rent", propertyType: "House" } },
    { label: "Villas", params: { listingType: "rent", propertyType: "Villa" } },
    { label: "PG", params: { listingType: "rent", propertyType: "PG" } },
  ];

  const sellOptions = [
    { label: "Post Free Property Ad", path: "/post-property" },
    { label: "Owner Plans", path: "/owner-plans" },
    { label: "Rental Agreement", path: "/rental-agreement" },
    { label: "Home Interior/Renovation", path: "/home-renovation" },
  ];

  if (!isOpen) return null;

  return (
    <div className="mobile-nav-overlay">
      <div className="mobile-nav-container">
        <div className="mobile-nav-header">
          <div className="mobile-nav-logo">
            <span>PropertyDealz</span>
          </div>
          <button className="mobile-nav-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="mobile-nav-content">
          {/* Home */}
          <div className="mobile-nav-item">
            <button
              className="mobile-nav-link"
              onClick={() => handleNavClick("/")}
            >
              🏠 Home
            </button>
          </div>

          {/* Buy */}
          <div className="mobile-nav-item">
            <button
              className={`mobile-nav-link mobile-nav-toggle ${
                activeSubmenu === "buy" ? "active" : ""
              }`}
              onClick={() => handleSubmenuToggle("buy")}
            >
              🏢 Buy{" "}
              <span className="toggle-icon">
                {activeSubmenu === "buy" ? "−" : "+"}
              </span>
            </button>
            {activeSubmenu === "buy" && (
              <div className="mobile-submenu">
                {buyOptions.map((option, index) => (
                  <button
                    key={index}
                    className="mobile-submenu-item"
                    onClick={() => handleSearchNavigation(option.params)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rent */}
          <div className="mobile-nav-item">
            <button
              className={`mobile-nav-link mobile-nav-toggle ${
                activeSubmenu === "rent" ? "active" : ""
              }`}
              onClick={() => handleSubmenuToggle("rent")}
            >
              🏠 Rent{" "}
              <span className="toggle-icon">
                {activeSubmenu === "rent" ? "−" : "+"}
              </span>
            </button>
            {activeSubmenu === "rent" && (
              <div className="mobile-submenu">
                {rentOptions.map((option, index) => (
                  <button
                    key={index}
                    className="mobile-submenu-item"
                    onClick={() => handleSearchNavigation(option.params)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sell */}
          <div className="mobile-nav-item">
            <button
              className={`mobile-nav-link mobile-nav-toggle ${
                activeSubmenu === "sell" ? "active" : ""
              }`}
              onClick={() => handleSubmenuToggle("sell")}
            >
              💰 Sell{" "}
              <span className="toggle-icon">
                {activeSubmenu === "sell" ? "−" : "+"}
              </span>
            </button>
            {activeSubmenu === "sell" && (
              <div className="mobile-submenu">
                {sellOptions.map((option, index) => (
                  <button
                    key={index}
                    className="mobile-submenu-item"
                    onClick={
                      option.path
                        ? () => handleNavClick(option.path)
                        : () => handleSearchNavigation(option.params)
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Authenticated User Options */}
          {isAuthenticated && (
            <>
              <div className="mobile-nav-divider"></div>
              <div className="mobile-nav-item">
                <button
                  className="mobile-nav-link"
                  onClick={() => handleNavClick("/my-properties")}
                >
                  📋 My Properties
                </button>
              </div>

              {user?.role === "USER" && (
                <div className="mobile-nav-item">
                  <button
                    className="mobile-nav-link"
                    onClick={() => handleNavClick("/my-deals")}
                  >
                    🤝 My Deals
                  </button>
                </div>
              )}

              {user?.role === "AGENT" && (
                <div className="mobile-nav-item">
                  <button
                    className="mobile-nav-link"
                    onClick={() => handleNavClick("/agent-dashboard")}
                  >
                    📊 Agent Dashboard
                  </button>
                </div>
              )}

              {user?.role === "ADMIN" && (
                <>
                  <div className="mobile-nav-item">
                    <button
                      className="mobile-nav-link"
                      onClick={() => handleNavClick("/admin-deals")}
                    >
                      📋 Admin Deals
                    </button>
                  </div>
                  <div className="mobile-nav-item">
                    <button
                      className="mobile-nav-link"
                      onClick={() => handleNavClick("/admin-agents")}
                    >
                      👥 View Agents
                    </button>
                  </div>
                </>
              )}

              <div className="mobile-nav-item">
                <button
                  className="mobile-nav-link"
                  onClick={() => handleNavClick("/my-agreements")}
                >
                  📄 My Agreements
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
