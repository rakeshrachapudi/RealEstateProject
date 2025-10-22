import React, { useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { BACKEND_BASE_URL } from "./config/config";

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.4)",
  backdropFilter: "blur(10px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const contentStyle = {
  background: "rgba(100, 60, 200, 0.25)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  borderRadius: "20px",
  width: "400px",
  padding: "40px 35px",
  color: "#f5f0ff",
  boxShadow: "0 8px 30px rgba(80, 40, 120, 0.4)",
  position: "relative",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
};

const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  marginBottom: "18px",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "10px",
  background: "rgba(255, 255, 255, 0.1)",
  color: "#fff",
  fontSize: "15px",
  outline: "none",
  transition: "border 0.3s, background 0.3s",
};

const buttonStyle = (color) => ({
  width: "100%",
  padding: "12px",
  background: "linear-gradient(135deg, #9b5de5 0%, #845ec2 50%, #5c4b99 100%)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "16px",
  fontWeight: "600",
  transition: "all 0.3s ease",
  boxShadow: "0 4px 12px rgba(155, 93, 229, 0.4)",
});

// Password Strength Logic
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

const SignupModal = ({ onClose, onSignupSuccess }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    mobileNumber: "",
  });

  const strength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password]
  );

  const isFormValid =
    formData.firstName &&
    formData.lastName &&
    formData.username &&
    formData.email &&
    formData.password.length >= 6 &&
    formData.mobileNumber.length >= 10;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (strength.strength === "Too Short" || strength.strength === "Weak") {
      setError("Please choose a stronger password.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.data && data.data.token) {
        // Login automatically after registration
        login(data.data.user, data.data.token);
        alert("✅ Registration successful!");
        onClose();
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#6b7280",
          }}
        >
          ×
        </button>

        <h2
          style={{
            fontSize: "26px",
            marginBottom: "25px",
            background: "linear-gradient(90deg, #b57aff, #845ec2, #9b5de5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textAlign: "center",
            letterSpacing: "1px",
            fontWeight: "700",
          }}
        >
          ✨ CREATE ACCOUNT
        </h2>

        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "15px",
              fontSize: "14px",
              border: "1px solid #f5c6cb",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          <input
            type="tel"
            name="mobileNumber"
            placeholder="Mobile Number (10 digits)"
            value={formData.mobileNumber}
            onChange={handleChange}
            style={inputStyle}
            required
            maxLength="10"
            pattern="[0-9]{10}"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle}
            required
          />

          {formData.password && (
            <div style={{ marginBottom: "15px", fontSize: "14px" }}>
              Password Strength:{" "}
              <span style={{ color: strength.color, fontWeight: "bold" }}>
                {strength.strength}
              </span>
            </div>
          )}

          <button
            type="submit"
            style={buttonStyle(isFormValid ? "#3498db" : "#ccc")}
            disabled={!isFormValid || loading}
          >
            {loading ? "⏳ Registering..." : "✅ Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;
