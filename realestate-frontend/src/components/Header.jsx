// Header.jsx (Unchanged - Navigation Fixed)
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { styles } from "../styles.js"; // Assuming styles are defined/imported here
import logo from "../assets/logo.png"; // Assuming logo path

function Header({
  onLoginClick,
  onSignupClick,
  onPostPropertyClick,
  onProfileClick,
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const leaveTimeout = useRef(null);

  // Close dropdown on navigation
  useEffect(() => {
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = () => {
    clearTimeout(leaveTimeout.current);
    setProfileDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimeout.current = setTimeout(() => {
      setProfileDropdownOpen(false);
    }, 300); // You can adjust this delay (in milliseconds)
  };

  const handleMyAgreementsClick = () => {
    navigate("/my-agreements");
  };
  const handleMyPropertiesClick = () => {
    navigate("/my-properties");
  };
  const handleDashboardClick = () => {
    if (user?.role === "ADMIN")
      navigate("/admin-deals"); // Admin dashboard route
    else if (user?.role === "AGENT") navigate("/agent-dashboard"); // Agent dashboard route
  };
  // ⭐ CORRECTED: Navigate USER to /my-deals
  const handleMyDealsClick = () => {
    navigate("/my-deals");
  }; // User deals route

  const isAdmin = user?.role === "ADMIN";
  const isAgent = user?.role === "AGENT";
  const isUser = user?.role === "USER"; // Explicit check for USER role

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div onClick={() => navigate("/")} style={styles.logo}>
          <span style={styles.logoIcon}>
            {" "}
            <img style={styles.logoIconImg} src={logo} alt="Logo" />{" "}
          </span>
          PropertyDealz
        </div>
        <nav style={styles.nav}>
          {/* Add basic nav links here if needed */}

          {isAuthenticated ? (
            <div style={styles.authSection}>
              {/* Post Property Button */}
              {onPostPropertyClick && (
                <button onClick={onPostPropertyClick} style={styles.postBtn}>
                  {" "}
                  <span style={styles.btnIcon}>📝</span> Post Property{" "}
                </button>
              )}

              {/* Profile Dropdown */}
              <div
                style={{ position: "relative" }}
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
                      {" "}
                      {isAdmin ? "⚙️ Admin" : "📊 Agent"}{" "}
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
                        {" "}
                        View Profile{" "}
                      </div>
                    )}
                    <div
                      style={styles.profileDropdownItem}
                      onClick={handleMyPropertiesClick}
                    >
                      {" "}
                      My Properties{" "}
                    </div>

                    {/* ⭐ CORRECTED: Only show "My Deals" for USER role and use correct handler */}
                    {isUser && (
                      <div
                        style={styles.profileDropdownItem}
                        onClick={handleMyDealsClick}
                      >
                        {" "}
                        My Deals{" "}
                      </div>
                    )}

                    {/* Dashboard for AGENT/ADMIN */}
                    {(isAgent || isAdmin) && (
                      <div
                        style={styles.profileDropdownItem}
                        onClick={handleDashboardClick}
                      >
                        {" "}
                        {isAdmin
                          ? "⚙️ Admin Dashboard"
                          : "📊 Agent Dashboard"}{" "}
                      </div>
                    )}

                    <div
                      style={styles.profileDropdownItem}
                      onClick={handleMyAgreementsClick}
                    >
                      {" "}
                      My Agreements{" "}
                    </div>
                    <hr style={styles.dropdownSeparator} />
                    <div
                      style={{
                        ...styles.profileDropdownItem,
                        ...styles.logoutItem,
                      }}
                      onClick={logout}
                    >
                      {" "}
                      Logout{" "}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Logged Out State
            <div style={styles.authButtons}>
              {onLoginClick && (
                <button onClick={onLoginClick} style={styles.loginBtn}>
                  {" "}
                  <span style={styles.btnIcon}>🔐</span> Login{" "}
                </button>
              )}
              {onSignupClick && (
                <button onClick={onSignupClick} style={styles.signupBtn}>
                  {" "}
                  <span style={styles.btnIcon}>✨</span> Sign Up{" "}
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

// --- Styles (Ensure all styles used above are defined) ---
// Make sure these are defined in your styles.js or defined here inline
// Professional header styling (safe: styles-only)
styles.header = {
  position: "sticky",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  background: "linear-gradient(135deg, #5b7cfa 0%, #7a52c9 50%, #a66df1 100%)",
  color: "white",
  backdropFilter: "blur(18px)",
  borderBottom: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 12px 30px rgba(91, 124, 250, 0.15)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
};

styles.headerContent = {
  maxWidth: "1700px",
  margin: "0 auto",
  padding: "12px clamp(14px, 2vw, 24px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px",
};

styles.logo = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  fontSize: "clamp(18px, 3vw, 24px)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
  letterSpacing: "-0.02em",
  transition: "transform 0.25s ease",
};

styles.logoIcon = {
  display: "grid",
  placeItems: "center",
  width: 48,
  height: 48,
  borderRadius: 12,
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.08))",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 8px 20px rgba(0,0,0,0.08)",
};

styles.logoIconImg = {
  height: 34,
  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))",
};

styles.nav = {
  display: "flex",
  alignItems: "center",
  gap: "clamp(10px, 2vw, 18px)",
};

styles.authSection = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

styles.postBtn = {
  background: "linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)",
  color: "white",
  padding: "10px 16px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 8,
  transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
  boxShadow: "0 10px 24px rgba(14,165,233,0.25)",
};

styles.btnIcon = { marginRight: 6 };

styles.userSection = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.18)",
  cursor: "pointer",
  transition: "transform 0.2s ease, background 0.2s ease",
};

styles.userIcon = { fontSize: 16, opacity: 0.95 };

styles.userName = { fontWeight: 700, fontSize: 14, color: "white" };

styles.roleBadge = {
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  color: "white",
  fontSize: 12,
  fontWeight: 700,
  padding: "6px 10px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.3)",
};

styles.profileDropdown = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  width: 260,
  background: "rgba(255,255,255,0.98)",
  color: "#0f172a",
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.10), 0 4px 12px rgba(0, 0, 0, 0.06)",
  overflow: "hidden",
  transformOrigin: "top right",
  animation: "dropdownFade 160ms ease-out",
  zIndex: 1010,
};

styles.profileDropdownItem = {
  padding: "12px 14px",
  fontSize: 14,
  fontWeight: 600,
  color: "#334155",
  cursor: "pointer",
  transition: "background 0.15s ease, color 0.15s ease, padding 0.15s ease",
};

styles.dropdownSeparator = {
  height: 1,
  background: "#e2e8f0",
  margin: "6px 0",
};

styles.logoutItem = {
  color: "#b91c1c",
};

styles.authButtons = {
  display: "flex",
  gap: "8px",
};

styles.loginBtn = {
  backgroundColor: "transparent",
  color: "white",
  padding: "10px 14px",
  borderRadius: 12,
  border: "2px solid rgba(255,255,255,0.28)",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  transition: "all 0.25s ease",
  backdropFilter: "blur(8px)",
};

styles.signupBtn = {
  background: "white",
  color: "#4f46e5",
  padding: "10px 14px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 13,
  display: "flex",
  alignItems: "center",
  transition: "transform 0.2s ease, box-shadow 0.25s ease",
  boxShadow: "0 10px 22px rgba(255,255,255,0.25)",
};

export default Header;
