// Header.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { styles } from "../styles.js";
import logo from "../assets/logo-black.png";
import MobileNav from "./MobileNav.jsx";

function Header({
  onLoginClick,
  onSignupClick,
  onPostPropertyClick,
  onProfileClick,
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const leaveTimeout = useRef(null);

  useEffect(() => {
    setProfileDropdownOpen(false);
    setIsMobileNavOpen(false);
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
                {onPostPropertyClick && (
                  <button
                    onClick={onPostPropertyClick}
                    style={styles.postBtn}
                    className="desktop-only"
                  >
                    <span style={styles.btnIcon}>📝</span> Post Property
                  </button>
                )}

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

                <button
                  style={styles.mobileProfileBtn}
                  className="mobile-only"
                  onClick={onProfileClick}
                >
                  👤
                </button>
              </div>
            ) : (
              <div style={styles.authButtons}>
                {onLoginClick && (
                  <button onClick={onLoginClick} style={styles.loginBtn}>
                    <span style={styles.btnIcon}>🔐</span>Login
                  </button>
                )}
                {onSignupClick && (
                  <button onClick={onSignupClick} style={styles.signupBtn}>
                    <span style={styles.btnIcon}>✨</span>Signup
                  </button>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </>
  );
}

export default Header;
