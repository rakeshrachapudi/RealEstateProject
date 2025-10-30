import React, { useEffect } from "react";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "linear-gradient(180deg, rgba(2,6,23,0.55), rgba(2,6,23,0.35))",
  backdropFilter: "blur(6px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
  padding: "16px",
  animation: "overlayFade 180ms ease-out",
};

const cardWrapper = {
  position: "relative",
  width: "min(520px, 92vw)",
  borderRadius: 16,
  padding: 0,
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  border: "1px solid #e2e8f0",
  boxShadow: "0 20px 50px rgba(2,6,23,0.18), 0 6px 18px rgba(2,6,23,0.08)",
  overflow: "hidden",
  transformOrigin: "center",
  animation: "cardPop 200ms cubic-bezier(.2,.8,.2,1)",
};

const headerBar = {
  background: "linear-gradient(135deg, #5b7cfa 0%, #7a52c9 50%, #a66df1 100%)",
  color: "white",
  padding: "18px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const titleStyle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
  letterSpacing: "-0.02em",
};

const closeBtn = {
  background: "rgba(255,255,255,0.15)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.35)",
  borderRadius: 10,
  width: 36,
  height: 36,
  display: "grid",
  placeItems: "center",
  cursor: "pointer",
  fontSize: 18,
  lineHeight: 1,
  transition: "transform .16s ease, background .16s ease",
};

const contentStyle = {
  padding: "20px",
  display: "grid",
  gap: 16,
};

const rowStyle = {
  display: "grid",
  gap: 6,
};

const labelStyle = {
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: ".02em",
  textTransform: "uppercase",
  color: "#475569",
};

const valueStyle = {
  padding: "12px",
  borderRadius: 12,
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  gap: 8,
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
};

const footerStyle = {
  padding: "16px 20px 20px",
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const logoutBtn = {
  flex: 1,
  padding: "12px 16px",
  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  color: "white",
  border: "none",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 800,
  fontSize: 14,
  letterSpacing: ".02em",
  boxShadow: "0 10px 24px rgba(239,68,68,0.25)",
  transition: "transform .16s ease, box-shadow .16s ease, filter .16s ease",
};

const subtleBtn = {
  padding: "12px 14px",
  background: "#f1f5f9",
  color: "#0f172a",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 13,
  transition: "transform .16s ease, background .16s ease",
};

const keyframes = `
@keyframes overlayFade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes cardPop {
  0%   { opacity: 0; transform: translateY(8px) scale(.98); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
`;

const UserProfileModal = ({ user, onClose, logout }) => {
  if (!user) return null;

  // Inject keyframes once
  useEffect(() => {
    const id = "userProfileModalKeyframes";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = keyframes;
      document.head.appendChild(style);
    }
  }, []);

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  return (
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={cardWrapper}>
        <div style={headerBar}>
          <h2 id="profile-modal-title" style={titleStyle}>
            My Profile
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={closeBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
            }}
          >
            ×
          </button>
        </div>

        <div style={contentStyle}>
          <div style={rowStyle}>
            <span style={labelStyle}>Full Name</span>
            <div style={valueStyle}>
              <span role="img" aria-hidden>
                🧑
              </span>
              <span>{fullName || "N/A"}</span>
            </div>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Username</span>
            <div style={valueStyle}>
              <span role="img" aria-hidden>
                👤
              </span>
              <span>{user.username || "N/A"}</span>
            </div>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Email</span>
            <div style={valueStyle}>
              <span role="img" aria-hidden>
                ✉️
              </span>
              <span>{user.email || "N/A"}</span>
            </div>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Phone (Login ID)</span>
            <div style={valueStyle}>
              <span role="img" aria-hidden>
                📱
              </span>
              <span>{user.mobileNumber || user.phone || "N/A"}</span>
            </div>
          </div>
        </div>

        <div style={footerStyle}>
          <button
            onClick={onClose}
            style={subtleBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.background = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.background = "#f1f5f9";
            }}
          >
            Close
          </button>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            style={logoutBtn}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
              e.currentTarget.style.boxShadow =
                "0 16px 36px rgba(239,68,68,0.35)";
              e.currentTarget.style.filter = "brightness(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow =
                "0 10px 24px rgba(239,68,68,0.25)";
              e.currentTarget.style.filter = "none";
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
