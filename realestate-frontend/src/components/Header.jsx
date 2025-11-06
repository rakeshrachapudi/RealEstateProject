// src/components/Header.jsx - SMART RESPONSIVE LAYOUT
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { styles } from "../styles.js";
import logo from "../assets/logo-black.png";
import MobileNav from "./MobileNav.jsx";

// ✅ SMART: Single line when > 500px, two lines when < 500px
const mobileHeaderStyles = {
  headerMobile: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "12px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    width: "100%",
  },

  // ✅ SINGLE LINE LAYOUT (> 500px)
  singleLine: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  // ✅ TWO LINE LAYOUT (< 500px)
  topLine: {
    display: "flex",
    alignItems: "center",
    position: "relative",
    justifyContent: "center",
  },

  bottomLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },

  burgerBtn: {
    background: "rgba(255, 255, 255, 0.15)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    padding: "6px",
    borderRadius: "6px",
    transition: "all 0.2s ease",
  },

  burgerBtnAbsolute: {
    position: "absolute",
    left: 0,
    background: "rgba(255, 255, 255, 0.15)",
    border: "none",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    padding: "6px",
    borderRadius: "6px",
  },

  burgerLine: {
    width: "20px",
    height: "2px",
    backgroundColor: "white",
    marginBottom: "3px",
    borderRadius: "1px",
  },

  mobileLogo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
  },

  mobileLogoImg: {
    height: "35px",
    width: "auto",
  },

  mobileLogoText: {
    fontSize: "16px",
    letterSpacing: "-0.3px",
  },

  mobileProfileBtn: {
    background: "rgba(255, 255, 255, 0.15)",
    border: "none",
    color: "white",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  mobileProfileBtnAbsolute: {
    position: "absolute",
    right: 0,
    background: "rgba(255, 255, 255, 0.15)",
    border: "none",
    color: "white",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  mobileAuthBtn: {
    background: "rgba(255, 255, 255, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    color: "white",
    padding: "6px 14px",
    borderRadius: "16px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },

  mobileLoginBtn: {
    background: "rgba(255, 255, 255, 0.9)",
    color: "#667eea",
  },

  mobileSignupBtn: {
    background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
    border: "none",
  },
};

function Header({
  onLoginClick,
  onSignupClick,
  onPostPropertyClick,
  onProfileClick,
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isVerySmall, setIsVerySmall] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const leaveTimeout = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsVerySmall(width <= 500); // ✅ Check if very small screen
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // ✅ MOBILE HEADER WITH SMART LAYOUT
  if (isMobile) {
    return (
      <>
        <header style={mobileHeaderStyles.headerMobile}>
          {/* ✅ SINGLE LINE when > 500px */}
          {!isVerySmall ? (
            <div style={mobileHeaderStyles.singleLine}>
              <div style={mobileHeaderStyles.leftSection}>
                <button
                  style={mobileHeaderStyles.burgerBtn}
                  onClick={() => setIsMobileNavOpen(true)}
                >
                  <div style={mobileHeaderStyles.burgerLine}></div>
                  <div style={mobileHeaderStyles.burgerLine}></div>
                  <div style={mobileHeaderStyles.burgerLine}></div>
                </button>

                <div
                  onClick={() => navigate("/")}
                  style={mobileHeaderStyles.mobileLogo}
                >
                  <img
                    style={mobileHeaderStyles.mobileLogoImg}
                    src={logo}
                    alt="Logo"
                  />
                  <span style={mobileHeaderStyles.mobileLogoText}>
                    PropertyDealz
                  </span>
                </div>
              </div>

              <div style={mobileHeaderStyles.rightSection}>
                {!isAuthenticated ? (
                  <>
                    <button
                      onClick={onLoginClick}
                      style={{
                        ...mobileHeaderStyles.mobileAuthBtn,
                        ...mobileHeaderStyles.mobileLoginBtn,
                      }}
                    >
                      🔐 Login
                    </button>
                    <button
                      onClick={onSignupClick}
                      style={{
                        ...mobileHeaderStyles.mobileAuthBtn,
                        ...mobileHeaderStyles.mobileSignupBtn,
                      }}
                    >
                      ✨ Signup
                    </button>
                  </>
                ) : (
                  <button
                    style={mobileHeaderStyles.mobileProfileBtn}
                    onClick={onProfileClick}
                  >
                    👤
                  </button>
                )}
              </div>
            </div>
          ) : (
            // ✅ TWO LINES when < 500px
            <>
              <div style={mobileHeaderStyles.topLine}>
                <button
                  style={mobileHeaderStyles.burgerBtnAbsolute}
                  onClick={() => setIsMobileNavOpen(true)}
                >
                  <div style={mobileHeaderStyles.burgerLine}></div>
                  <div style={mobileHeaderStyles.burgerLine}></div>
                  <div style={mobileHeaderStyles.burgerLine}></div>
                </button>

                <div
                  onClick={() => navigate("/")}
                  style={mobileHeaderStyles.mobileLogo}
                >
                  <img
                    style={mobileHeaderStyles.mobileLogoImg}
                    src={logo}
                    alt="Logo"
                  />
                  <span style={mobileHeaderStyles.mobileLogoText}>
                    PropertyDealz
                  </span>
                </div>

                {isAuthenticated && (
                  <button
                    style={mobileHeaderStyles.mobileProfileBtnAbsolute}
                    onClick={onProfileClick}
                  >
                    👤
                  </button>
                )}
              </div>

              {!isAuthenticated && (
                <div style={mobileHeaderStyles.bottomLine}>
                  <button
                    onClick={onLoginClick}
                    style={{
                      ...mobileHeaderStyles.mobileAuthBtn,
                      ...mobileHeaderStyles.mobileLoginBtn,
                      flex: "1",
                      maxWidth: "120px",
                    }}
                  >
                    🔐 Login
                  </button>
                  <button
                    onClick={onSignupClick}
                    style={{
                      ...mobileHeaderStyles.mobileAuthBtn,
                      ...mobileHeaderStyles.mobileSignupBtn,
                      flex: "1",
                      maxWidth: "120px",
                    }}
                  >
                    ✨ Signup
                  </button>
                </div>
              )}
            </>
          )}
        </header>

        <MobileNav
          isOpen={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
          user={user}
          isAuthenticated={isAuthenticated}
          onLoginClick={onLoginClick}
          onSignupClick={onSignupClick}
          onPostPropertyClick={onPostPropertyClick}
          onProfileClick={onProfileClick}
          onLogout={logout}
          onMyPropertiesClick={handleMyPropertiesClick}
          onMyDealsClick={handleMyDealsClick}
          onMyAgreementsClick={handleMyAgreementsClick}
          onDashboardClick={handleDashboardClick}
          navigate={navigate}
        />
      </>
    );
  }

  // ✅ DESKTOP HEADER (Original)
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
        user={user}
        isAuthenticated={isAuthenticated}
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        onPostPropertyClick={onPostPropertyClick}
        onProfileClick={onProfileClick}
        onLogout={logout}
        onMyPropertiesClick={handleMyPropertiesClick}
        onMyDealsClick={handleMyDealsClick}
        onMyAgreementsClick={handleMyAgreementsClick}
        onDashboardClick={handleDashboardClick}
        navigate={navigate}
      />
    </>
  );
}

export default Header;
