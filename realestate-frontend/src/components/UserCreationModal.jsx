import React, { useState } from "react";
import { BACKEND_BASE_URL } from "../config/config"; // ⭐ FIXED: From components folder, go up to src, then into config folder

/**
 * ⭐ USER CREATION MODAL
 * Allows admins/agents to create users for property posting
 */
const UserCreationModal = ({ onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    address: "",
    role: "USER", // Default to USER role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdUser, setCreatedUser] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!formData.email || !formData.firstName || !formData.mobileNumber) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Mobile number validation (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCreatedUser(data.data);
        alert(
          `✅ User created successfully!\n\nEmail: ${data.data.email}\nTemporary Password: ${data.data.temporaryPassword}\n\nPlease share these credentials with the user.`
        );
        if (onUserCreated) onUserCreated(data.data);
      } else {
        setError(data.message || "Failed to create user");
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("An error occurred while creating the user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          ×
        </button>

        <h2 style={styles.title}>👤 Create New User</h2>
        <p style={styles.subtitle}>
          Create a user account for property posting
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        {createdUser ? (
          <div style={styles.successBox}>
            <h3>✅ User Created Successfully!</h3>
            <div style={styles.credentialsBox}>
              <p>
                <strong>Email:</strong> {createdUser.email}
              </p>
              <p>
                <strong>Temporary Password:</strong>{" "}
                {createdUser.temporaryPassword}
              </p>
              <p>
                <strong>User ID:</strong> {createdUser.id}
              </p>
              <p style={styles.warningText}>
                ⚠️ Please share these credentials with the user securely. They
                should change their password upon first login.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ ...styles.submitBtn, marginTop: "20px" }}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  First Name <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  placeholder="Enter first name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Email <span style={styles.required}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={styles.input}
                required
                placeholder="user@example.com"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Mobile Number <span style={styles.required}>*</span>
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                style={styles.input}
                required
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
                placeholder="Enter complete address"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="USER">User (Default)</option>
                <option value="AGENT">Agent</option>
                <option value="ADMIN">Admin</option>
              </select>
              <p style={styles.helperText}>
                Default role is USER for property owners
              </p>
            </div>

            <div style={styles.buttonRow}>
              <button
                type="button"
                onClick={onClose}
                style={styles.cancelBtn}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={styles.submitBtn}
                disabled={loading}
              >
                {loading ? "Creating..." : "✨ Create User"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "16px",
    padding: "32px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "none",
    border: "none",
    fontSize: "32px",
    cursor: "pointer",
    color: "#64748b",
    lineHeight: 1,
    padding: "8px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#475569",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    padding: "12px 16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "border-color 0.2s",
    outline: "none",
  },
  helperText: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "4px",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#dc2626",
    fontSize: "14px",
    marginBottom: "20px",
  },
  successBox: {
    backgroundColor: "#f0fdf4",
    border: "2px solid #86efac",
    borderRadius: "12px",
    padding: "24px",
  },
  credentialsBox: {
    backgroundColor: "white",
    border: "1px solid #d1fae5",
    borderRadius: "8px",
    padding: "16px",
    marginTop: "16px",
    fontSize: "14px",
    lineHeight: "1.8",
  },
  warningText: {
    color: "#ea580c",
    fontWeight: "600",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #fed7aa",
  },
  buttonRow: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "24px",
  },
  cancelBtn: {
    padding: "12px 24px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "white",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  submitBtn: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    transition: "transform 0.2s",
  },
};

export default UserCreationModal;