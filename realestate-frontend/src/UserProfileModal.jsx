// realestate-frontend/src/UserProfileModal.jsx
import React, { useEffect } from "react";
import "./UserProfileModal.css";

const UserProfileModal = ({ user, onClose, logout }) => {
  if (!user) return null;

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose && onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (e.target.classList.contains("upm-backdrop")) {
      onClose && onClose();
    }
  };

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <div
      className="upm-backdrop"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="upm-title"
    >
      <div
        className="upm-card"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="upm-header">
          <h2 id="upm-title" className="upm-title">
            My Profile
          </h2>
          <button className="upm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="upm-content">
          <div className="upm-row">
            <span className="upm-label">Full Name</span>
            <div className="upm-value">
              <span aria-hidden="true">🧑</span>
              <span>{fullName || "N/A"}</span>
            </div>
          </div>

          <div className="upm-row">
            <span className="upm-label">Username</span>
            <div className="upm-value">
              <span aria-hidden="true">👤</span>
              <span>{user.username || "N/A"}</span>
            </div>
          </div>

          <div className="upm-row">
            <span className="upm-label">Email</span>
            <div className="upm-value">
              <span aria-hidden="true">✉️</span>
              <span>{user.email || "N/A"}</span>
            </div>
          </div>

          <div className="upm-row">
            <span className="upm-label">Phone (Login ID)</span>
            <div className="upm-value">
              <span aria-hidden="true">📱</span>
              <span>{user.mobileNumber || user.phone || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="upm-footer">
          <button className="upm-btn upm-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="upm-btn upm-btn-danger"
            onClick={() => {
              logout && logout();
              onClose && onClose();
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
