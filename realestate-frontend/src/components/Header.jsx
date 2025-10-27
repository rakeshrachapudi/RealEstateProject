// Header.jsx (Unchanged - Navigation Fixed)
import React, { useState, useEffect } from "react";
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

  // Close dropdown on navigation
  useEffect(() => {
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleMyAgreementsClick = () => { navigate("/my-agreements"); };
  const handleMyPropertiesClick = () => { navigate("/my-properties"); };
  const handleDashboardClick = () => {
    if (user?.role === "ADMIN") navigate("/admin-deals"); // Admin dashboard route
    else if (user?.role === "AGENT") navigate("/agent-dashboard"); // Agent dashboard route
  };
  // ⭐ CORRECTED: Navigate USER to /my-deals
  const handleMyDealsClick = () => { navigate("/my-deals"); }; // User deals route

  const isAdmin = user?.role === "ADMIN";
  const isAgent = user?.role === "AGENT";
  const isUser = user?.role === "USER"; // Explicit check for USER role

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div onClick={() => navigate("/")} style={styles.logo}>
          <span style={styles.logoIcon}> <img style={styles.logoIconImg} src={logo} alt="Logo" /> </span>
          PropertyDeals
        </div>
        <nav style={styles.nav}>
          {/* Add basic nav links here if needed */}

          {isAuthenticated ? (
            <div style={styles.authSection}>
              {/* Post Property Button */}
              {onPostPropertyClick && (
                 <button onClick={onPostPropertyClick} style={styles.postBtn}> <span style={styles.btnIcon}>📝</span> Post Property </button>
              )}

              {/* Profile Dropdown */}
              <div style={{ position: "relative" }} onMouseEnter={() => setProfileDropdownOpen(true)} onMouseLeave={() => setProfileDropdownOpen(false)}>
                <div style={styles.userSection}>
                  <span style={styles.userIcon}>👤</span>
                  <span style={styles.userName}>{user?.firstName || "User"} ▾</span>
                  {(isAgent || isAdmin) && (<span style={styles.roleBadge}> {isAdmin ? "⚙️ Admin" : "📊 Agent"} </span>)}
                </div>

                {isProfileDropdownOpen && (
                  <div style={styles.profileDropdown}>
                    {onProfileClick && (<div style={styles.profileDropdownItem} onClick={onProfileClick}> View Profile </div>)}
                    <div style={styles.profileDropdownItem} onClick={handleMyPropertiesClick}> My Properties </div>

                    {/* ⭐ CORRECTED: Only show "My Deals" for USER role and use correct handler */}
                    {isUser && (
                      <div style={styles.profileDropdownItem} onClick={handleMyDealsClick}> My Deals </div>
                    )}

                    {/* Dashboard for AGENT/ADMIN */}
                    {(isAgent || isAdmin) && (
                      <div style={styles.profileDropdownItem} onClick={handleDashboardClick}> {isAdmin ? "⚙️ Admin Dashboard" : "📊 Agent Dashboard"} </div>
                    )}

                    <div style={styles.profileDropdownItem} onClick={handleMyAgreementsClick}> My Agreements </div>
                    <hr style={styles.dropdownSeparator} />
                    <div style={{ ...styles.profileDropdownItem, ...styles.logoutItem }} onClick={logout}> Logout </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Logged Out State
            <div style={styles.authButtons}>
               {onLoginClick && <button onClick={onLoginClick} style={styles.loginBtn}> <span style={styles.btnIcon}>🔐</span> Login </button> }
               {onSignupClick && <button onClick={onSignupClick} style={styles.signupBtn}> <span style={styles.btnIcon}>✨</span> Sign Up </button> }
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

// --- Styles (Ensure all styles used above are defined) ---
// Make sure these are defined in your styles.js or defined here inline
styles.header = styles.header || { /* existing styles */ };
styles.headerContent = styles.headerContent || { /* existing styles */ };
styles.logo = styles.logo || { /* existing styles */ };
styles.logoIcon = styles.logoIcon || { /* existing styles */ };
styles.logoIconImg = styles.logoIconImg || { /* existing styles */ };
styles.nav = styles.nav || { /* existing styles */ };
styles.authSection = styles.authSection || { /* existing styles */ };
styles.postBtn = styles.postBtn || { /* existing styles */ };
styles.userSection = styles.userSection || { /* existing styles */ };
styles.userIcon = styles.userIcon || { /* existing styles */ };
styles.userName = styles.userName || { /* existing styles */ };
styles.roleBadge = styles.roleBadge || { /* existing styles */ };
styles.profileDropdown = styles.profileDropdown || { /* existing styles */ };
styles.profileDropdownItem = styles.profileDropdownItem || { /* existing styles */ };
styles.dropdownSeparator = styles.dropdownSeparator || { /* existing styles */ };
styles.logoutItem = styles.logoutItem || { /* existing styles */ };
styles.authButtons = styles.authButtons || { /* existing styles */ };
styles.loginBtn = styles.loginBtn || { /* existing styles */ };
styles.signupBtn = styles.signupBtn || { /* existing styles */ };
styles.btnIcon = styles.btnIcon || { /* existing styles */ };

export default Header;