import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { BACKEND_BASE_URL } from "./config/config";

function LoginPage() {
  const [step, setStep] = useState(1);
  const [isNewUser, setIsNewUser] = useState(false);

  // Consolidate all form data into a single state object
  const [formData, setFormData] = useState({
    mobileNumber: "",
    otp: "",
    firstName: "",
    lastName: "",
    email: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth(); // Get the login function from our context

  const handleChange = (input) => (e) => {
    setFormData({ ...formData, [input]: e.target.value });
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    try {
      const fullMobileNumber = `+91${formData.mobileNumber}`;
      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: fullMobileNumber }),
      });
      const data = await response.json();
      if (response.ok) {
        // Check the response from the backend to see if it's a new user
        setIsNewUser(data.isNewUser);
        setStep(2); // Move to OTP verification step
      } else {
        alert("Failed to send OTP. Please check the number and try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again later.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const fullMobileNumber = `+91${formData.mobileNumber}`;
      const response = await fetch(`${BACKEND_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send the entire form data, including new user details
        body: JSON.stringify({ ...formData, mobileNumber: fullMobileNumber }),
      });
      const data = await response.json();
      if (response.ok && data.token) {
        // Use the login function from AuthContext to update the global state
        login(data.user, data.token);
        navigate("/"); // Redirect to home page
      } else {
        alert(data.message || "Invalid or expired OTP.");
      }
    } catch (error) {
      alert("An error occurred during verification.");
    }
  };

  // --- Styles for the form elements ---
  const inputStyle = {
    width: "100%",
    padding: "8px",
    boxSizing: "border-box",
    marginBottom: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };
  const buttonStyle = {
    width: "100%",
    padding: "10px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    cursor: "pointer",
    borderRadius: "4px",
    fontSize: "1rem",
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "5rem auto",
        padding: "2rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        fontFamily: "system-ui",
      }}
    >
      {step === 1 ? (
        <form onSubmit={handleRequestOtp}>
          <h2>Login / Register</h2>
          <p>Enter your mobile number to continue</p>
          <div style={{ display: "flex", marginBottom: "1rem" }}>
            <span
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                background: "#f8f9fa",
                borderRadius: "4px 0 0 4px",
              }}
            >
              +91
            </span>
            <input
              type="tel"
              value={formData.mobileNumber}
              onChange={handleChange("mobileNumber")}
              placeholder="10-digit mobile number"
              required
              maxLength="10"
              style={{
                flex: 1,
                padding: "8px",
                border: "1px solid #ccc",
                borderLeft: "none",
                borderRadius: "0 4px 4px 0",
              }}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <h2>Verify Your Number</h2>
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            Enter OTP sent to +91 {formData.mobileNumber}
          </p>
          <input
            type="text"
            value={formData.otp}
            onChange={handleChange("otp")}
            placeholder="Enter OTP"
            required
            maxLength="6"
            style={inputStyle}
          />

          {/* --- Conditionally render these fields for new users --- */}
          {isNewUser && (
            <>
              <p
                style={{ fontSize: "0.9rem", color: "#555", fontWeight: "600" }}
              >
                Welcome! Please complete your registration.
              </p>
              <input
                type="text"
                value={formData.firstName}
                onChange={handleChange("firstName")}
                placeholder="First Name"
                required
                style={inputStyle}
              />
              <input
                type="text"
                value={formData.lastName}
                onChange={handleChange("lastName")}
                placeholder="Last Name"
                required
                style={inputStyle}
              />
              <input
                type="email"
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="Email"
                required
                style={inputStyle}
              />
            </>
          )}

          <button type="submit" style={buttonStyle}>
            Verify & Continue
          </button>
        </form>
      )}
    </div>
  );
}

export default LoginPage;
