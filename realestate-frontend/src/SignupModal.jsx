// realestate-frontend/src/SignupModal.jsx
import React, { useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { BACKEND_BASE_URL } from "./config/config";
import "./SignupModal.css";

const getPasswordStrength = (password) => {
  if (!password || password.length < 6)
    return { strength: "Too Short", color: "#dc2626" };
  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (score < 2) return { strength: "Weak", color: "#f59e0b" };
  if (score < 4) return { strength: "Medium", color: "#2563eb" };
  return { strength: "Strong", color: "#16a34a" };
};

const SignupModal = ({ onClose, onSignupSuccess }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBroker, setIsBroker] = useState(false); // ✅ NEW: Broker checkbox state

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    mobileNumber: "",
    role: "USER", // ✅ NEW: Default role
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
    (formData.password || "").length >= 6 &&
    (formData.mobileNumber || "").replace(/\D/g, "").length >= 10;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
    setError(null);
  };

  // ✅ NEW: Handle broker checkbox
  const handleBrokerChange = (e) => {
    const checked = e.target.checked;
    setIsBroker(checked);
    setFormData((s) => ({ ...s, role: checked ? "BROKER" : "USER" }));
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
        body: JSON.stringify(formData), // ✅ Now includes role
      });
      const data = await response.json();

      if (response.ok && data?.data?.token) {
        login(data.data.user, data.data.token);
        onSignupSuccess && onSignupSuccess(data.data.user);
        onClose && onClose();
      } else {
        setError(data?.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("sm-backdrop")) {
      onClose && onClose();
    }
  };

  return (
    <div
      className="sm-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sm-title"
    >
      <div className="sm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="sm-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <h2 id="sm-title" className="sm-title gradient">
          ✨ Create Account
        </h2>

        {error && <div className="sm-alert">{error}</div>}

        <form onSubmit={handleRegister} className="sm-form">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="sm-input"
            required
            autoFocus
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="sm-input"
            required
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="sm-input"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="sm-input"
            required
          />

          <input
            type="tel"
            name="mobileNumber"
            placeholder="Mobile Number (10 digits)"
            value={formData.mobileNumber}
            onChange={handleChange}
            className="sm-input"
            maxLength={10}
            inputMode="numeric"
            pattern="[0-9]{10}"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password (min 6 chars)"
            value={formData.password}
            onChange={handleChange}
            className="sm-input"
            required
          />

          {formData.password && (
            <div className="sm-strength">
              Password Strength:{" "}
              <span style={{ color: strength.color, fontWeight: 800 }}>
                {strength.strength}
              </span>
            </div>
          )}

          {/* ✅ NEW: Broker/Agent Checkbox */}
          <label className="sm-checkbox" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={isBroker}
              onChange={handleBrokerChange}
              style={{ cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px' }}>
              🏢 I am an Agent/Broker
            </span>
          </label>

          <button
            type="submit"
            className="sm-btn sm-btn-primary"
            disabled={!isFormValid || loading}
            aria-busy={loading}
          >
            {loading ? "⏳ Registering..." : "✅ Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;