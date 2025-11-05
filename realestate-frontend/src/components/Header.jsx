// Header.jsx - Updated with Mobile Burger Menu
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { styles } from "../styles.js";
import logo from "../assets/logo-black.png";
import MobileNav from "./MobileNav.jsx"; // Import the new mobile nav component

function Header({
  onLoginClick,
  onSignupClick,
  onPostPropertyClick,
  onProfileClick,
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false); // New state for mobile nav
  const navigate = useNavigate();
  const location = useLocation();

  const leaveTimeout = useRef(null);

  // Close dropdown on navigation
  useEffect(() => {
    setProfileDropdownOpen(false);
    setIsMobileNavOpen(false); // Close mobile nav on route change
  }, [location.pathname]);

  const handleMouseEnter = () => {
    clearTimeout(leaveTimeout.current);
    setProfileDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimeout.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 300);
  };

  const handleMyAgreementsClick = () => {
    navigate("/my-agreements");
  };

  const handleMyPropertiesClick = () => {
    navigate("/my-properties");
  };

  const handleDashboardClick = () => {
    if (user?.role === "ADMIN") navigate("/admin-deals");
    else if (user?.role === "AGENT") navigate("/agent-dashboard");
  };

  const handleMyDealsClick = () => {
    navigate("/my-deals");
  };

  const isAdmin = user?.role === "ADMIN";
  const isAgent = user?.role === "AGENT";
  const isUser = user?.role === "USER";

  return (
    <>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          {/* Mobile Burger Menu Button */}
          <button
            style={styles.mobileMenuBtn}
            className="mobile-only"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <div style={styles.hamburgerLine}></div>
            <div style={styles.hamburgerLine}></div>
            <div style={styles.hamburgerLine}></div>
          </button>

          <div onClick={() => navigate("/")} style={styles.logo}>
            <span style={styles.logoIcon}>
              <img style={styles.logoIconImg} src={logo} alt="Logo" />
            </span>
            <span style={styles.logoText}>PropertyDealz</span>
          </div>

          <nav style={styles.nav}>
            {isAuthenticated ? (
              <div style={styles.authSection}>
                {/* Post Property Button - Hide on mobile */}
                {onPostPropertyClick && (
                  <button
                    onClick={onPostPropertyClick}
                    style={styles.postBtn}
                    className="desktop-only"
                  >
                    <span style={styles.btnIcon}>📝</span> Post Property
                  </button>
                )}

                {/* Profile Dropdown - Hide on mobile */}
                <div
                  style={{ position: "relative" }}
                  className="desktop-only"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div style={styles.userSection}>
                    <span style={styles.userIcon}>👤</span>
                    <span style={styles.userName}>
                      {user?.firstName || "User"} ▾
                    </span>
                    {(isAgent || isAdmin) && (
                      <span style={styles.roleBadge}>
                        {isAdmin ? "⚙️ Admin" : "📊 Agent"}
                      </span>
                    )}
                  </div>

                  {isProfileDropdownOpen && (
                    <div style={styles.profileDropdown}>
                      {onProfileClick && (
                        <div
                          style={styles.profileDropdownItem}
                          onClick={onProfileClick}
                        >
                          View Profile
                        </div>
                      )}
                      <div
                        style={styles.profileDropdownItem}
                        onClick={handleMyPropertiesClick}
                      >
                        My Properties
                      </div>

                      {isUser && (
                        <div
                          style={styles.profileDropdownItem}
                          onClick={handleMyDealsClick}
                        >
                          My Deals
                        </div>
                      )}

                      {(isAgent || isAdmin) && (
                        <div
                          style={styles.profileDropdownItem}
                          onClick={handleDashboardClick}
                        >
                          {isAdmin
                            ? "⚙️ Admin Dashboard"
                            : "📊 Agent Dashboard"}
                        </div>
                      )}

                      <div
                        style={styles.profileDropdownItem}
                        onClick={handleMyAgreementsClick}
                      >
                        My Agreements
                      </div>
                      <hr style={styles.dropdownSeparator} />
                      <div
                        style={{
                          ...styles.profileDropdownItem,
                          ...styles.logoutItem,
                        }}
                        onClick={logout}
                      >
                        Logout
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Profile Button */}
                <button
                  style={styles.mobileProfileBtn}
                  className="mobile-only"
                  onClick={onProfileClick}
                >
                  👤
                </button>
              </div>
            ) : (
              // Logged Out State
              <div style={styles.authButtons}>
                {onLoginClick && (
                  <button onClick={onLoginClick} style={styles.loginBtn}>
                    <span style={styles.btnIcon}>🔐Login</span>
                    <span className="desktop-only">Login</span>
                  </button>
                )}
                {onSignupClick && (
                  <button onClick={onSignupClick} style={styles.signupBtn}>
                    <span style={styles.btnIcon}>✨Signup</span>
                    <span className="desktop-only">Sign Up</span>
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </>
  );
}

// Add mobile-specific styles to your existing styles
styles.mobileMenuBtn = {
  display: "none",
  background: "none",
  border: "none",
  cursor: "pointer",
  flexDirection: "column",
  padding: "8px",
  borderRadius: "8px",
  transition: "all 0.2s ease",
};

styles.hamburgerLine = {
  width: "24px",
  height: "3px",
  backgroundColor: "white",
  marginBottom: "4px",
  borderRadius: "2px",
  transition: "all 0.3s ease",
};

styles.logoText = {
  fontSize: "clamp(16px, 4vw, 24px)",
};

styles.mobileProfileBtn = {
  display: "none",
  background: "rgba(255, 255, 255, 0.2)",
  border: "none",
  color: "white",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  cursor: "pointer",
  fontSize: "16px",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease",
};

export default Header;
