// realestate-frontend/src/LoginModal.jsx
import React, { useState, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { BACKEND_BASE_URL } from "./config/config";
import "./LoginModal.css";

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

function LoginModal({ onClose }) {
  const [formData, setFormData] = useState({ username: "", password: "" });
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
    setFormData((s) => ({ ...s, [name]: value }));
    setError(null);
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((s) => ({ ...s, [name]: value }));
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
      if (response.ok && data?.data?.token) {
        login(data.data.user, data.data.token);
        onClose && onClose();
      } else {
        setError(data?.message || "Login failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if ((registerData.password || "").length < 6) {
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
      if (response.ok && data?.data?.token) {
        login(data.data.user, data.data.token);
        onClose && onClose();
      } else {
        setError(data?.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("lm-backdrop")) {
      onClose && onClose();
    }
  };

  return (
    <div
      className="lm-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lm-title"
    >
      <div className="lm-modal">
        <button className="lm-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        {error && <div className="lm-alert">❌ {error}</div>}

        {!isSigningUp ? (
          <form onSubmit={handleLogin} className="lm-form">
            <h2 id="lm-title" className="lm-title">
              🔑 Login
            </h2>

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleLoginChange}
              className="lm-input"
              required
              autoFocus
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleLoginChange}
              className="lm-input"
              required
            />

            <button
              type="submit"
              className="lm-btn lm-btn-primary"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "⏳ Logging in..." : "✅ Login"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSigningUp(true);
                setError(null);
              }}
              className="lm-btn lm-btn-secondary"
            >
              📝 Create New Account
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="lm-form">
            <h2 className="lm-title gradient">✨ Create Account</h2>

            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={registerData.firstName}
              onChange={handleRegisterChange}
              className="lm-input"
              required
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={registerData.lastName}
              onChange={handleRegisterChange}
              className="lm-input"
              required
            />

            <input
              type="text"
              name="username"
              placeholder="Username"
              value={registerData.username}
              onChange={handleRegisterChange}
              className="lm-input"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              className="lm-input"
              required
            />

            <input
              type="tel"
              name="mobileNumber"
              placeholder="Mobile Number"
              value={registerData.mobileNumber}
              onChange={handleRegisterChange}
              className="lm-input"
              inputMode="tel"
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min 6 chars)"
              value={registerData.password}
              onChange={handleRegisterChange}
              className="lm-input"
              required
            />

            {registerData.password && (
              <div className="lm-strength">
                Password Strength:{" "}
                <span style={{ color: strength.color, fontWeight: 800 }}>
                  {strength.strength}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="lm-btn lm-btn-primary"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? "⏳ Registering..." : "✅ Register"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSigningUp(false);
                setError(null);
              }}
              className="lm-btn lm-btn-secondary"
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
