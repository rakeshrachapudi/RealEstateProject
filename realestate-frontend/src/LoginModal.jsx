import React, { useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { BACKEND_BASE_URL } from "./config/config";

const getPasswordStrength = (password) => {
  if (password.length < 6) return { strength: "Too Short", color: "#dc3545" };
  let score = 0;
  if (password.match(/[a-z]/)) score++;
  if (password.match(/[A-Z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^a-zA-Z0-9]/)) score++;

  if (score < 2) return { strength: "Weak", color: "#ffc107" };
  if (score < 4) return { strength: "Medium", color: "#007bff" };
  return { strength: "Strong", color: "#28a745" };
};

function LoginModal({ onClose }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    mobileNumber: "",
  });
  const strength = useMemo(
    () => getPasswordStrength(registerData.password),
    [registerData.password]
  );

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData({ ...registerData, [name]: value });
    setError(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.data && data.data.token) {
        login(data.data.user, data.data.token);
        onClose();
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (response.ok && data.data && data.data.token) {
        login(data.data.user, data.data.token);
        onClose();
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Register error:", error);
    } finally {
      setLoading(false);
    }
  };

  const modalBackdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };

  const modalContentStyle = {
    background: "rgba(120, 70, 200, 0.2)",
    backdropFilter: "blur(16px)",
    borderRadius: "18px",
    width: "420px",
    padding: "35px 30px",
    color: "#f3e8ff",
    fontFamily: "Inter, system-ui, sans-serif",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 10px 40px rgba(70, 30, 120, 0.4)",
    position: "relative",
    transition: "all 0.3s ease-in-out",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 15px",
    boxSizing: "border-box",
    marginBottom: "1rem",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(255, 255, 255, 0.1)",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    transition: "border 0.3s, background 0.3s",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    background:
      "linear-gradient(135deg, #9b5de5 0%, #845ec2 50%, #5c4b99 100%)",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "10px",
    fontSize: "16px",
    fontWeight: "600",
    marginBottom: "1rem",
    boxShadow: "0 4px 12px rgba(155, 93, 229, 0.4)",
    transition: "transform 0.2s ease, box-shadow 0.3s ease",
  };

  const toggleButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
    boxShadow: "none",
    fontWeight: "500",
    fontSize: "15px",
  };

  const errorStyle = {
    background: "rgba(255, 0, 70, 0.15)",
    color: "#ffb3b3",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontSize: "14px",
    border: "1px solid rgba(255, 0, 70, 0.3)",
  };

  const headingStyle = {
    marginTop: 0,
    marginBottom: "1.8rem",
    fontSize: "24px",
    fontWeight: "700",
    textAlign: "center",
    background: "linear-gradient(90deg, #b57aff, #845ec2, #9b5de5)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "0.5px",
  };

  return (
    <div style={modalBackdropStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "15px",
            border: "none",
            background: "transparent",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ×
        </button>

        {error && <div style={errorStyle}>❌ {error}</div>}

        {!isSigningUp ? (
          // LOGIN FORM
          <form onSubmit={handleLogin}>
            <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>🔑 Login</h2>

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleLoginChange}
              style={inputStyle}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleLoginChange}
              style={inputStyle}
              required
            />

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "⏳ Logging in..." : "✅ Login"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSigningUp(true);
                setError(null);
              }}
              style={toggleButtonStyle}
            >
              📝 Create New Account
            </button>
          </form>
        ) : (
          // REGISTRATION FORM
          <form onSubmit={handleRegister}>
            <h2 style={headingStyle}>
              {isSigningUp ? "✨ CREATE ACCOUNT" : "🔑 LOGIN"}
            </h2>

            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={registerData.firstName}
              onChange={handleRegisterChange}
              style={inputStyle}
              required
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={registerData.lastName}
              onChange={handleRegisterChange}
              style={inputStyle}
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={registerData.username}
              onChange={handleRegisterChange}
              style={inputStyle}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              style={inputStyle}
              required
            />
            <input
              type="tel"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={registerData.mobileNumber}
              onChange={handleRegisterChange}
              style={inputStyle}
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min 6 chars)"
              value={registerData.password}
              onChange={handleRegisterChange}
              style={inputStyle}
              required
            />

            {registerData.password && (
              <div style={{ marginBottom: "15px", fontSize: "14px" }}>
                Password Strength:{" "}
                <span style={{ color: strength.color, fontWeight: "bold" }}>
                  {strength.strength}
                </span>
              </div>
            )}

            <button type="submit" style={buttonStyle} disabled={loading}>
              {loading ? "⏳ Registering..." : "✅ Register"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSigningUp(false);
                setError(null);
              }}
              style={toggleButtonStyle}
            >
              🔑 Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginModal;
