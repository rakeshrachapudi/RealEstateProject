import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { styles } from "../styles.js";
import logo from "../assets/logo.png";
function Header({
  onLoginClick,
  onSignupClick,
  onPostPropertyClick,
  onProfileClick,
}) {
  const { isAuthenticated, user, logout } = useAuth();
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleMyAgreementsClick = () => {
    navigate("/my-agreements");
    setProfileDropdownOpen(false);
  };

  const handleMyPropertiesClick = () => {
    navigate("/my-properties");
    setProfileDropdownOpen(false);
  };

  const handleAgentDashboardClick = () => {
    if (user?.role === "ADMIN") {
      navigate("/admin-deals");
    } else {
      navigate("/agent-dashboard");
    }
    setProfileDropdownOpen(false);
  };

  return (
    <header style={styles.header}>
      {" "}
      <div style={styles.headerContent}>
        <div onClick={() => navigate("/")} style={styles.logo}>
          {" "}
          <span style={styles.logoIcon}>
            <img
              style={styles.logoIconImg}
              src={logo}
              alt="PropertyDealz Logo"
            />
          </span>
          PropertyDealz{" "}
        </div>
        <nav style={styles.nav}>
          {isAuthenticated ? (
            <div style={styles.authSection}>
              <button
                onClick={onPostPropertyClick}
                style={{ ...styles.postBtn, marginLeft: "10px" }}
              >
                <span style={styles.btnIcon}>📝</span> Post Property
              </button>

              <div
                style={{ position: "relative" }}
                onMouseEnter={() => setProfileDropdownOpen(true)}
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <div style={styles.userSection}>
                  <span style={styles.userIcon}>👤</span>
                  <span style={styles.userName}>
                    {user?.firstName || "User"} ▾
                  </span>
                  {user && (user.role === "AGENT" || user.role === "ADMIN") && (
                    <span
                      style={{
                        fontSize: "12px",
                        marginLeft: "8px",
                        backgroundColor: "rgba(255,255,255,0.3)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      {user.role === "ADMIN" ? "⚙️ Admin" : "📊 Agent"}
                    </span>
                  )}
                </div>

                {isProfileDropdownOpen && (
                  <div style={styles.profileDropdown}>
                    <div
                      style={styles.profileDropdownItem}
                      onClick={() => {
                        onProfileClick();
                        setProfileDropdownOpen(false);
                      }}
                    >
                      View Profile
                    </div>

                    <div
                      style={styles.profileDropdownItem}
                      onClick={handleMyAgreementsClick}
                    >
                      My Agreements
                    </div>

                    <div
                      style={styles.profileDropdownItem}
                      onClick={handleMyPropertiesClick}
                    >
                      My Properties
                    </div>

                    {user &&
                      (user.role === "AGENT" || user.role === "ADMIN") && (
                        <div
                          style={styles.profileDropdownItem}
                          onClick={handleAgentDashboardClick}
                        >
                          {user.role === "ADMIN"
                            ? "⚙️ Admin Dashboard"
                            : "📊 Agent Dashboard"}
                        </div>
                      )}

                    {user && user.role === "USER" && (
                      <div
                        style={styles.profileDropdownItem}
                        onClick={() => {
                          navigate("/my-deals");
                          setProfileDropdownOpen(false);
                        }}
                      >
                        My Deals
                      </div>
                    )}

                    <hr
                      style={{
                        border: 0,
                        borderTop: "1px solid #eee",
                        margin: "8px 0",
                      }}
                    />
                    <div
                      style={{
                        ...styles.profileDropdownItem,
                        color: "#dc3545",
                      }}
                      onClick={logout}
                    >
                      Logout
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.authButtons}>
              <button onClick={onLoginClick} style={styles.loginBtn}>
                <span style={styles.btnIcon}>🔐</span> Login
              </button>
              <button onClick={onSignupClick} style={styles.signupBtn}>
                <span style={styles.btnIcon}>✨</span> Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
