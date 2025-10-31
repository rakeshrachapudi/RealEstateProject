// HomePage.jsx - Professional & Interesting Animations with WhatsApp Floating Button
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import PropertySearch from "../components/PropertySearch";
import PropertyList from "../components/PropertyList";
import DealStatusCard from "../DealStatusCard.jsx";
import { getFeaturedProperties } from "../services/api";
import BrowsePropertiesForDeal from "../pages/BrowsePropertiesForDeal";
import DealDetailModal from "../DealDetailModal.jsx";
import { BACKEND_BASE_URL } from "../config/config";

// Professional Animation Styles with Keyframes
const professionalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

  @keyframes fadeInUp {
    0% { 
      opacity: 0; 
      transform: translateY(40px); 
    }
    100% { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }

  @keyframes slideInFromLeft {
    0% { 
      opacity: 0; 
      transform: translateX(-50px); 
    }
    100% { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }

  @keyframes slideInFromRight {
    0% { 
      opacity: 0; 
      transform: translateX(50px); 
    }
    100% { 
      opacity: 1; 
      transform: translateX(0); 
    }
  }

  @keyframes scaleIn {
    0% { 
      opacity: 0; 
      transform: scale(0.9); 
    }
    100% { 
      opacity: 1; 
      transform: scale(1); 
    }
  }

  @keyframes gentleFloat {
    0%, 100% { 
      transform: translateY(0px); 
    }
    50% { 
      transform: translateY(-8px); 
    }
  }

  @keyframes subtleGlow {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.15), 
                  0 8px 32px rgba(102, 126, 234, 0.1);
    }
    50% { 
      box-shadow: 0 0 30px rgba(102, 126, 234, 0.25), 
                  0 12px 48px rgba(102, 126, 234, 0.15);
    }
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes countUp {
    0% { 
      opacity: 0;
      transform: translateY(20px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes progressBar {
    0% { width: 0%; }
    100% { width: 100%; }
  }

  @keyframes ripple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }

  @keyframes cardLift {
    0% { 
      transform: translateY(0) rotateX(0deg);
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    100% { 
      transform: translateY(-8px) rotateX(2deg);
      box-shadow: 0 20px 40px rgba(0,0,0,0.12);
    }
  }

  @keyframes iconBounce {
    0%, 20%, 50%, 80%, 100% { 
      transform: translateY(0); 
    }
    40% { 
      transform: translateY(-8px); 
    }
    60% { 
      transform: translateY(-4px); 
    }
  }

  @keyframes textReveal {
    0% { 
      opacity: 0;
      transform: translateY(20px);
      clip-path: inset(100% 0 0 0);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
      clip-path: inset(0% 0 0 0);
    }
  }

  @keyframes borderDraw {
    0% {
      stroke-dasharray: 0 1000;
    }
    100% {
      stroke-dasharray: 1000 0;
    }
  }

  @keyframes whatsappFloat {
    0%, 100% { 
      transform: translateY(0px) scale(1); 
    }
    50% { 
      transform: translateY(-10px) scale(1.05); 
    }
  }

  @keyframes whatsappGlow {
    0%, 100% { 
      box-shadow: 0 8px 25px rgba(37, 211, 102, 0.3);
    }
    50% { 
      box-shadow: 0 12px 35px rgba(37, 211, 102, 0.5), 0 0 0 0 rgba(37, 211, 102, 0.7);
    }
  }

  .stagger-animation > * {
    animation-fill-mode: both;
  }

  .stagger-animation > :nth-child(1) { animation-delay: 0.1s; }
  .stagger-animation > :nth-child(2) { animation-delay: 0.2s; }
  .stagger-animation > :nth-child(3) { animation-delay: 0.3s; }
  .stagger-animation > :nth-child(4) { animation-delay: 0.4s; }
  .stagger-animation > :nth-child(5) { animation-delay: 0.5s; }
  .stagger-animation > :nth-child(6) { animation-delay: 0.6s; }
  .stagger-animation > :nth-child(7) { animation-delay: 0.7s; }

  .ripple-effect {
    position: relative;
    overflow: hidden;
  }

  .ripple-effect::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  .ripple-effect:hover::before {
    width: 300px;
    height: 300px;
  }

  .magnetic-hover {
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  .magnetic-hover:hover {
    transform: translateY(-4px);
  }

  .glass-morphism {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .gradient-border {
    position: relative;
    background: linear-gradient(45deg, #667eea, #764ba2, #f093fb);
    background-size: 300% 300%;
    animation: gradientShift 6s ease infinite;
    padding: 2px;
    border-radius: 16px;
  }

  .gradient-border > * {
    background: white;
    border-radius: 14px;
  }
`;

// Inject professional styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = professionalStyles;
  document.head.appendChild(styleSheet);
}

// Professional Styles Object
const proStyles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "1700px",
    margin: "0 auto",
    padding: "clamp(16px, 3vw, 24px) clamp(16px, 3vw, 32px)",
    minHeight: "80vh",
    position: "relative",
    background: "transparent",
    animation: "fadeInUp 0.8s ease-out",
  },

  // Enhanced Banner
  banner: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    padding: "clamp(40px, 6vw, 80px) clamp(30px, 4vw, 60px)",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "clamp(20px, 4vw, 60px)",
    borderRadius: "24px",
    marginBottom: "clamp(30px, 5vw, 60px)",
    position: "relative",
    overflow: "hidden",
    boxShadow:
      "0 20px 60px rgba(102, 126, 234, 0.2), 0 8px 32px rgba(102, 126, 234, 0.1)",
    animation: "slideInFromLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    transition: "all 0.4s ease",
    flexWrap: "wrap",
  },

  bannerContent: {
    flex: "1 1 400px",
    maxWidth: "600px",
    zIndex: 2,
    animation: "textReveal 1s ease-out 0.3s both",
  },

  bannerTitle: {
    fontSize: "clamp(28px, 5vw, 48px)",
    fontWeight: "800",
    margin: "0 0 16px 0",
    lineHeight: "1.2",
    letterSpacing: "-0.02em",
  },

  bannerSubtitle: {
    fontSize: "clamp(16px, 2.5vw, 20px)",
    opacity: 0.95,
    margin: "0 0 32px 0",
    lineHeight: "1.6",
    fontWeight: "400",
  },

  bannerFeatures: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  bannerFeature: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "clamp(14px, 2vw, 16px)",
    fontWeight: "500",
    padding: "12px 0",
    transition: "all 0.3s ease",
    cursor: "pointer",
    borderRadius: "8px",
    paddingLeft: "8px",
  },

  checkmark: {
    fontSize: "20px",
    color: "#10b981",
    flexShrink: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "iconBounce 2s ease-in-out infinite",
  },

  bannerIllustration: {
    fontSize: "clamp(80px, 12vw, 140px)",
    textAlign: "center",
    opacity: 0.9,
    userSelect: "none",
    animation: "gentleFloat 4s ease-in-out infinite",
    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.1))",
    flex: "0 0 auto",
  },

  // Enhanced Hero Section
  heroSection: {
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)",
    backdropFilter: "blur(20px)",
    padding: "clamp(40px, 6vw, 80px) clamp(30px, 4vw, 60px)",
    borderRadius: "24px",
    marginBottom: "clamp(30px, 5vw, 60px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    flexWrap: "wrap",
    gap: "40px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow:
      "0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    animation: "scaleIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s both",
  },

  heroContent: {
    flex: "1 1 400px",
    maxWidth: "100%",
    zIndex: 2,
  },

  mainTitle: {
    fontSize: "clamp(32px, 6vw, 56px)",
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: "20px",
    lineHeight: "1.1",
    letterSpacing: "-0.02em",
    animation: "textReveal 1s ease-out 0.5s both",
  },

  titleGradient: {
    background:
      "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    backgroundSize: "200% 200%",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "gradientShift 4s ease infinite",
  },

  heroSubtitle: {
    fontSize: "clamp(16px, 2.5vw, 20px)",
    color: "#64748b",
    lineHeight: "1.6",
    fontWeight: "400",
    animation: "fadeInUp 0.8s ease-out 0.7s both",
  },

  // Enhanced Search Section
  searchSection: {
    marginTop: "clamp(-40px, -6vw, -80px)",
    marginBottom: "clamp(40px, 6vw, 80px)",
    zIndex: 10,
    position: "relative",
    padding: "0 clamp(8px, 2vw, 16px)",
    animation:
      "slideInFromRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.4s both",
  },

  // Enhanced Section Styles
  section: {
    marginBottom: "clamp(40px, 6vw, 80px)",
    position: "relative",
    animation: "fadeInUp 0.6s ease-out",
  },

  sectionTitle: {
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "clamp(20px, 4vw, 32px)",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    letterSpacing: "-0.01em",
    position: "relative",
  },

  sectionIcon: {
    marginRight: "clamp(12px, 2vw, 16px)",
    fontSize: "clamp(24px, 4vw, 32px)",
    animation: "iconBounce 2s ease-in-out infinite",
  },

  // Enhanced Areas Grid
  areasGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "clamp(12px, 2vw, 20px)",
    animation: "fadeInUp 0.6s ease-out 0.2s both",
  },

  areaButton: {
    backgroundColor: "white",
    color: "#475569",
    padding: "clamp(12px, 2vw, 16px) clamp(20px, 3vw, 28px)",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "clamp(14px, 2vw, 16px)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    position: "relative",
    overflow: "hidden",
    flex: "0 1 auto",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
    backdropFilter: "blur(10px)",
  },

  areaButtonActive: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    transform: "translateY(-2px)",
    boxShadow:
      "0 8px 25px rgba(102, 126, 234, 0.25), 0 3px 10px rgba(102, 126, 234, 0.15)",
  },

  areaEmoji: {
    fontSize: "clamp(16px, 2.5vw, 20px)",
    transition: "transform 0.3s ease",
  },

  // Enhanced Properties Section
  propertiesSection: {
    marginBottom: "clamp(40px, 6vw, 80px)",
    paddingTop: "clamp(20px, 3vw, 30px)",
    position: "relative",
    animation: "fadeInUp 0.8s ease-out 0.3s both",
  },

  tabContainer: {
    display: "flex",
    marginBottom: "clamp(20px, 3vw, 32px)",
    background: "white",
    borderRadius: "16px",
    padding: "6px",
    border: "1px solid #e2e8f0",
    boxShadow:
      "0 4px 20px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    overflowX: "auto",
    gap: "4px",
  },

  tab: {
    padding: "clamp(10px, 1.5vw, 14px) clamp(16px, 2.5vw, 24px)",
    fontSize: "clamp(14px, 2vw, 16px)",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    color: "#64748b",
    borderRadius: "12px",
    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    whiteSpace: "nowrap",
    flex: "0 0 auto",
    position: "relative",
  },

  activeTab: {
    color: "#667eea",
    backgroundColor: "#f1f5f9",
    transform: "scale(1.02)",
    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.1)",
  },

  // Enhanced Section Header
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "clamp(20px, 4vw, 32px)",
    flexWrap: "wrap",
    gap: "16px",
    background: "white",
    padding: "clamp(16px, 2.5vw, 24px) clamp(20px, 3vw, 32px)",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
    animation: "slideInFromLeft 0.6s ease-out 0.2s both",
  },

  // Enhanced Buttons
  createDealButton: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    padding: "clamp(12px, 2vw, 16px) clamp(20px, 3vw, 32px)",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "clamp(14px, 2vw, 16px)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    boxShadow:
      "0 4px 12px rgba(16, 185, 129, 0.25), 0 2px 4px rgba(16, 185, 129, 0.1)",
    position: "relative",
    overflow: "hidden",
  },

  clearSearchBtn: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    padding: "clamp(8px, 1.5vw, 12px) clamp(16px, 2.5vw, 20px)",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    fontWeight: "500",
    fontSize: "clamp(13px, 1.8vw, 14px)",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
  },

  // Enhanced States
  loadingState: {
    textAlign: "center",
    padding: "clamp(40px, 6vw, 80px) clamp(20px, 3vw, 40px)",
    color: "#64748b",
    fontSize: "clamp(16px, 2.5vw, 18px)",
    fontWeight: "500",
    background: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
    animation: "subtleGlow 2s ease-in-out infinite",
  },

  emptyState: {
    textAlign: "center",
    padding: "clamp(60px, 8vw, 100px) clamp(30px, 4vw, 60px)",
    background: "linear-gradient(135deg, #fefefe 0%, #f8fafc 100%)",
    borderRadius: "20px",
    border: "2px dashed #cbd5e1",
    marginTop: "32px",
    maxWidth: "600px",
    margin: "32px auto",
    position: "relative",
    animation: "scaleIn 0.6s ease-out",
  },

  emptyIcon: {
    fontSize: "clamp(48px, 8vw, 64px)",
    marginBottom: "20px",
    animation: "gentleFloat 3s ease-in-out infinite",
    opacity: 0.8,
  },

  emptyTitle: {
    fontSize: "clamp(20px, 3.5vw, 24px)",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "12px",
    letterSpacing: "-0.01em",
  },

  emptyText: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#64748b",
    marginBottom: "20px",
    lineHeight: "1.6",
    fontWeight: "400",
  },

  // Enhanced Deals Grid
  dealsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "clamp(20px, 3vw, 32px)",
    marginTop: "24px",
  },

  // Enhanced Stats Section
  statsSection: {
    padding: "clamp(40px, 6vw, 80px) 0",
    background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: "24px",
    marginBottom: "clamp(40px, 6vw, 80px)",
    position: "relative",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.06)",
    animation: "fadeInUp 0.8s ease-out 0.4s both",
  },

  statsGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 clamp(20px, 4vw, 40px)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "clamp(24px, 4vw, 40px)",
  },

  statCard: {
    textAlign: "center",
    padding: "clamp(24px, 4vw, 40px) clamp(20px, 3vw, 32px)",
    background: "white",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
    transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    position: "relative",
    overflow: "hidden",
    cursor: "pointer",
    animation: "fadeInUp 0.6s ease-out both",
  },

  statIcon: {
    fontSize: "clamp(32px, 5vw, 40px)",
    marginBottom: "16px",
    animation: "gentleFloat 4s ease-in-out infinite",
    opacity: 0.9,
  },

  statNumber: {
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: "800",
    color: "#667eea",
    marginBottom: "8px",
    letterSpacing: "-0.02em",
    animation: "countUp 1s ease-out",
  },

  statLabel: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#64748b",
    fontWeight: "500",
  },

  // Error Display
  fetchError: {
    padding: "16px 24px",
    background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
    color: "#dc2626",
    borderRadius: "12px",
    border: "1px solid #fecaca",
    marginBottom: "24px",
    textAlign: "center",
    fontWeight: "500",
    fontSize: "14px",
    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.1)",
    animation: "slideInFromLeft 0.4s ease-out",
  },

  // ⭐ NEW FLOATING WHATSAPP BUTTON STYLES ⭐
  floatingWhatsAppButton: {
    position: "fixed",
    bottom: "25px",
    right: "25px",
    width: "60px",
    height: "60px",
    backgroundColor: "#25d366",
    color: "white",
    border: "none",
    borderRadius: "50%",
    fontSize: "28px",
    cursor: "pointer",
    zIndex: 1000,
    boxShadow: "0 8px 25px rgba(37, 211, 102, 0.4)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: "whatsappFloat 6s ease-in-out infinite",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  whatsappIcon: {
    fontSize: "32px",
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
  },

  // Agent Status Tooltip
  agentStatusTooltip: {
    position: "absolute",
    bottom: "75px",
    right: "0px",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "500",
    whiteSpace: "nowrap",
    opacity: 0,
    transform: "translateY(10px)",
    transition: "all 0.3s ease",
    pointerEvents: "none",
    backdropFilter: "blur(10px)",
  },

  tooltipVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },
};

// Utility for Safe JSON Parsing
const safeJsonParse = async (response) => {
  try {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    const text = await response.text();
    return null;
  } catch (err) {
    console.error("Failed to parse response as JSON:", err);
    return null;
  }
};

// Professional Animation Observer Hook
const useIntersectionObserver = (callback, options = {}) => {
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          callback(entry);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, callback]);

  return setRef;
};

function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [featuredPropsList, setFeaturedPropsList] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [myDeals, setMyDeals] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("featured");
  const [selectedArea, setSelectedArea] = useState(null);
  const [showBrowseDeals, setShowBrowseDeals] = useState(false);
  const [selectedDealForModal, setSelectedDealForModal] = useState(null);
  const [loadingMyProperties, setLoadingMyProperties] = useState(false);
  const [loadingMyDeals, setLoadingMyDeals] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // ⭐ NEW STATES FOR WHATSAPP FLOATING BUTTON ⭐
  const [agents, setAgents] = useState([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const navigate = useNavigate();

  const popularAreas = [
    { name: "Gachibowli", emoji: "🏢" },
    { name: "HITEC City", emoji: "🏢" },
    { name: "Madhapur", emoji: "🌆" },
    { name: "Kondapur", emoji: "🏙️" },
    { name: "Kukatpally", emoji: "🏘️" },
    { name: "Miyapur", emoji: "🌇" },
    { name: "Jubilee Hills", emoji: "🛒" },
  ];

  // Fetch featured properties and agents on initial load
  useEffect(() => {
    fetchFeaturedProperties();
    fetchAgents(); // ⭐ Fetch agents on component mount ⭐
  }, []);

  // ⭐ NEW FUNCTION: Fetch all agents from database ⭐
  const fetchAgents = async () => {
    setLoadingAgents(true);
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/users/agents`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const result = await safeJsonParse(response);
        if (result?.success && Array.isArray(result.data)) {
          const activeAgents = result.data.filter(
            (agent) => agent.isActive && agent.mobileNumber
          );
          setAgents(activeAgents);
          console.log("✅ Fetched agents on homepage:", activeAgents);
        } else if (Array.isArray(result)) {
          const activeAgents = result.filter(
            (agent) => agent.isActive && agent.mobileNumber
          );
          setAgents(activeAgents);
        }
      } else {
        console.error("Failed to fetch agents:", response.status);
        setAgents([]);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      setAgents([]);
    } finally {
      setLoadingAgents(false);
    }
  };

  // ⭐ NEW FUNCTION: Handle floating WhatsApp button click ⭐
  const handleFloatingWhatsAppClick = () => {
    if (agents.length === 0) {
      alert("No agents available at the moment. Please try again later.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * agents.length);
    const selectedAgent = agents[randomIndex];

    let mobileNumber = selectedAgent.mobileNumber.replace(/\D/g, "");
    if (mobileNumber.length === 10) {
      mobileNumber = "91" + mobileNumber;
    }

    const message = `Hi! I'm interested in exploring real estate opportunities. Could you please help me find properties that match my requirements?`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${mobileNumber}?text=${encodedMessage}`;

    console.log("Selected Agent from Homepage:", selectedAgent);
    console.log("WhatsApp URL:", whatsappUrl);

    window.open(whatsappUrl, "_blank");
  };

  // Fetch user-specific data when auth state changes
  useEffect(() => {
    if (isAuthenticated && user?.id && user?.role) {
      setFetchError(null);
      fetchMyProperties();
      fetchMyDeals();
    } else {
      setMyProperties([]);
      setMyDeals([]);
      if (["my-properties", "my-deals"].includes(activeTab)) {
        setActiveTab("featured");
      }
    }
  }, [isAuthenticated, user?.id, user?.role, activeTab]);

  const fetchFeaturedProperties = async () => {
    try {
      const response = await getFeaturedProperties();
      const properties = response?.success ? response.data || [] : [];
      setFeaturedPropsList(Array.isArray(properties) ? properties : []);
      setShowSearchResults(false);
    } catch (error) {
      console.error("Error loading featured properties:", error);
      setFetchError("Could not load featured properties.");
      setFeaturedPropsList([]);
    }
  };

  const fetchMyProperties = async () => {
    if (!user?.id) return;

    setLoadingMyProperties(true);
    setMyProperties([]);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(
        `${BACKEND_BASE_URL}/api/properties/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }

      const data = await safeJsonParse(response);
      const propertiesArray = Array.isArray(data)
        ? data
        : (data?.success ? data.data : []) || [];

      const ownedProperties = propertiesArray.filter(
        (prop) => prop.user?.id === user.id
      );
      setMyProperties(ownedProperties);
    } catch (error) {
      console.error("Error loading my properties:", error);
      setFetchError("Could not load your properties.");
      setMyProperties([]);
    } finally {
      setLoadingMyProperties(false);
    }
  };

  const fetchMyDeals = async () => {
    if (!user?.id || !user?.role) return;

    setLoadingMyDeals(true);
    setMyDeals([]);

    console.log(
      `Starting fetchMyDeals for user: ${user.id}, Role: ${user.role}`
    );

    const actualUserRole = user.role.toUpperCase();
    const userId = user.id;
    const endpoint = `${BACKEND_BASE_URL}/api/deals/user/${userId}/role/${actualUserRole}`;
    const token = localStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found");
      setFetchError("Authentication required");
      setLoadingMyDeals(false);
      return;
    }

    try {
      console.log(`Fetching deals using endpoint: ${endpoint}`);
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error(
          `Failed to fetch deals for role ${actualUserRole}: Status ${response.status}`
        );
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await safeJsonParse(response);
      console.log(
        `Raw deals response for role ${actualUserRole}:`,
        responseData
      );

      let dealsArray = [];
      if (responseData?.success && Array.isArray(responseData.data)) {
        dealsArray = responseData.data;
      } else if (Array.isArray(responseData)) {
        dealsArray = responseData;
      } else {
        console.warn(
          `Unexpected data format for deals (Role: ${actualUserRole}):`,
          responseData
        );
      }

      console.log(
        `Successfully fetched ${dealsArray.length} deals for user ${userId} (Role: ${actualUserRole})`
      );
      setMyDeals(dealsArray);
    } catch (error) {
      console.error(
        `Error loading deals for user ${userId} (${actualUserRole}):`,
        error
      );
      setFetchError(`Could not load your deals. ${error.message}`);
      setMyDeals([]);
    } finally {
      setLoadingMyDeals(false);
    }
  };

  // Search and Filter Handlers
  const handleSearchResults = (results) => {
    setSearchResults(results);
    setShowSearchResults(true);
    setSearchLoading(false);
    setActiveTab("featured");
    setSelectedArea(null);
  };

  const handleSearchStart = () => {
    setSearchLoading(true);
  };

  const handleResetSearch = () => {
    setShowSearchResults(false);
    setSearchResults([]);
    setSelectedArea(null);
    setActiveTab("featured");
  };

  const handleAreaClick = (area) => {
    setSelectedArea(area.name);
    setShowSearchResults(false);
    setActiveTab("featured");
  };

  // Property Update/Delete Callbacks
  const handlePropertyUpdated = () => {
    fetchFeaturedProperties();
    if (isAuthenticated && user?.id) {
      fetchMyProperties();
      fetchMyDeals();
    }
  };

  const handlePropertyDeleted = (deletedPropertyId) => {
    setFeaturedPropsList((prev) =>
      prev.filter((p) => (p.id || p.propertyId) !== deletedPropertyId)
    );
    setMyProperties((prev) =>
      prev.filter((p) => (p.id || p.propertyId) !== deletedPropertyId)
    );
    if (isAuthenticated && user?.id) {
      fetchMyDeals();
    }
  };

  // Modal Handlers
  const handleCreateDealClick = () => {
    setShowBrowseDeals(true);
  };

  const handleViewDealDetails = (deal) => {
    setSelectedDealForModal(deal);
  };

  const handleCloseDealModal = () => {
    setSelectedDealForModal(null);
  };

  const handleDealUpdatedInModal = () => {
    setSelectedDealForModal(null);
    fetchMyDeals();
  };

  // Determine properties to display
  const propertiesForList = useMemo(() => {
    if (showSearchResults) return searchResults;
    if (selectedArea) {
      return featuredPropsList.filter((property) => {
        const propertyArea = (
          property?.areaName ||
          property?.area?.areaName ||
          ""
        ).toLowerCase();
        return propertyArea.includes(selectedArea.toLowerCase());
      });
    }
    if (activeTab === "my-properties") return myProperties;
    if (activeTab === "my-deals") return [];
    return featuredPropsList;
  }, [
    showSearchResults,
    searchResults,
    selectedArea,
    activeTab,
    myProperties,
    featuredPropsList,
  ]);

  // Determine section title and loading state
  let sectionTitle = "";
  let isLoading = searchLoading;
  let isDisplayingDeals =
    activeTab === "my-deals" && !showSearchResults && !selectedArea;

  if (showSearchResults) {
    sectionTitle = `🔍 Search Results (${propertiesForList.length} found)`;
  } else if (selectedArea) {
    sectionTitle = `📍 Properties in ${selectedArea} (${propertiesForList.length} found)`;
    isLoading = false;
  } else if (activeTab === "my-properties") {
    sectionTitle = `📄 My Properties (${propertiesForList.length} found)`;
    isLoading = loadingMyProperties;
  } else if (isDisplayingDeals) {
    sectionTitle = `📊 My Deals (${myDeals.length} found)`;
    isLoading = loadingMyDeals;
  } else {
    sectionTitle = `⭐ Featured Properties (${propertiesForList.length} found)`;
    isLoading = false;
  }

  // Add dealInfo to properties
  const propertiesWithDeals = useMemo(() => {
    if (isDisplayingDeals || loadingMyDeals || myDeals.length === 0) {
      return propertiesForList;
    }

    console.log(
      `HomePage Memo: Mapping ${propertiesForList.length} properties against ${myDeals.length} deals.`
    );

    return propertiesForList.map((prop) => {
      const propId = prop.id || prop.propertyId;
      if (!propId) return prop;

      const dealForProp = myDeals.find(
        (deal) => (deal?.property?.id ?? deal?.propertyId) == propId
      );

      if (propId == 5) {
        console.log(
          `HomePage Memo: Mapping prop ID 5. Found Deal:`,
          dealForProp
            ? {
                id: dealForProp.dealId || dealForProp.id,
                stage: dealForProp.stage,
              }
            : null
        );
      }

      return { ...prop, dealInfo: dealForProp || null };
    });
  }, [propertiesForList, myDeals, isDisplayingDeals, loadingMyDeals]);

  const canCreateDeal =
    isAuthenticated && user && (user.role === "AGENT" || user.role === "ADMIN");

  return (
    <>
      <div style={proStyles.container}>
        {/* Professional Banner Section */}
        <section
          style={proStyles.banner}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-4px)";
            e.target.style.boxShadow =
              "0 25px 80px rgba(102, 126, 234, 0.25), 0 12px 40px rgba(102, 126, 234, 0.15)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow =
              "0 20px 60px rgba(102, 126, 234, 0.2), 0 8px 32px rgba(102, 126, 234, 0.1)";
          }}
        >
          <div style={proStyles.bannerContent}>
            <h2 style={proStyles.bannerTitle}>How PropertyDealz Works</h2>
            <p style={proStyles.bannerSubtitle}>
              Simple, transparent, and hassle-free property deals
            </p>
            <div style={proStyles.bannerFeatures}>
              {[
                "No Subscription Required - Connect for free",
                "Buyer Connects to Agent - Direct communication",
                "End-to-End Documentation - Agent handles paperwork",
                "Only 0.5% Fee - Charged equally from buyer & seller",
              ].map((feature, index) => (
                <div
                  key={index}
                  style={proStyles.bannerFeature}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateX(8px)";
                    e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateX(0)";
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  <span style={proStyles.checkmark}>✓</span>
                  <span>
                    <strong>{feature.split(" - ")[0]}</strong> -{" "}
                    {feature.split(" - ")[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div style={proStyles.bannerIllustration}>🤝</div>
        </section>

        {/* Professional Hero Section */}
        <section style={proStyles.heroSection}>
          <div style={proStyles.heroContent}>
            <h1 style={proStyles.mainTitle}>
              Find Your <span style={proStyles.titleGradient}>Dream Home</span>{" "}
              🏡
            </h1>
            <p style={proStyles.heroSubtitle}>
              Discover the perfect property that matches your lifestyle and
              budget.
            </p>
          </div>
        </section>

        {/* Professional Search Section */}
        <section style={proStyles.searchSection}>
          <div className="magnetic-hover">
            <PropertySearch
              onSearchResults={handleSearchResults}
              onSearchStart={handleSearchStart}
              onReset={handleResetSearch}
            />
          </div>
        </section>

        {/* Error Display */}
        {fetchError && <div style={proStyles.fetchError}>⚠️ {fetchError}</div>}

        {/* Professional Popular Areas Section */}
        <section style={proStyles.section}>
          <h2 style={proStyles.sectionTitle}>
            <span style={proStyles.sectionIcon}>📍</span> Popular Areas
          </h2>
          <div style={proStyles.areasGrid} className="stagger-animation">
            {popularAreas.map((area, index) => (
              <button
                key={area.name}
                onClick={() => handleAreaClick(area)}
                style={{
                  ...proStyles.areaButton,
                  ...(selectedArea === area.name
                    ? proStyles.areaButtonActive
                    : {}),
                  animationDelay: `${index * 0.1}s`,
                }}
                className="magnetic-hover ripple-effect"
                onMouseEnter={(e) => {
                  if (selectedArea !== area.name) {
                    e.target.style.transform = "translateY(-4px) scale(1.02)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(102, 126, 234, 0.15), 0 3px 10px rgba(102, 126, 234, 0.1)";
                    e.target.style.borderColor = "#667eea";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedArea !== area.name) {
                    e.target.style.transform = "translateY(0) scale(1)";
                    e.target.style.boxShadow =
                      "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)";
                    e.target.style.borderColor = "#e2e8f0";
                  }
                }}
              >
                <span style={proStyles.areaEmoji}>{area.emoji}</span>
                {area.name}
              </button>
            ))}
          </div>
        </section>

        {/* Professional Properties/Deals Section */}
        <section style={proStyles.propertiesSection}>
          {/* Professional Tabs */}
          {isAuthenticated && !showSearchResults && !selectedArea && (
            <div style={proStyles.tabContainer}>
              <button
                onClick={() => setActiveTab("featured")}
                style={{
                  ...proStyles.tab,
                  ...(activeTab === "featured" ? proStyles.activeTab : {}),
                }}
                className="magnetic-hover"
              >
                ⭐ Featured ({featuredPropsList.length})
              </button>

              {(loadingMyProperties || myProperties.length > 0) && (
                <button
                  onClick={() => setActiveTab("my-properties")}
                  style={{
                    ...proStyles.tab,
                    ...(activeTab === "my-properties"
                      ? proStyles.activeTab
                      : {}),
                  }}
                  className="magnetic-hover"
                >
                  📄 My Properties ({myProperties.length})
                </button>
              )}

              {isAuthenticated && (loadingMyDeals || myDeals.length > 0) && (
                <button
                  onClick={() => setActiveTab("my-deals")}
                  style={{
                    ...proStyles.tab,
                    ...(activeTab === "my-deals" ? proStyles.activeTab : {}),
                  }}
                  className="magnetic-hover"
                >
                  📊 My Deals ({myDeals.length})
                </button>
              )}
            </div>
          )}

          {/* Professional Section Header */}
          <div style={proStyles.sectionHeader}>
            <h2 style={proStyles.sectionTitle}>{sectionTitle}</h2>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {(showSearchResults || selectedArea) && (
                <button
                  onClick={handleResetSearch}
                  style={proStyles.clearSearchBtn}
                  className="magnetic-hover"
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#e2e8f0";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f1f5f9";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  ✕ Clear Filter
                </button>
              )}
              {canCreateDeal && (
                <button
                  onClick={handleCreateDealClick}
                  style={proStyles.createDealButton}
                  className="magnetic-hover ripple-effect"
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-3px) scale(1.02)";
                    e.target.style.boxShadow =
                      "0 8px 25px rgba(16, 185, 129, 0.35), 0 4px 12px rgba(16, 185, 129, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0) scale(1)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(16, 185, 129, 0.25), 0 2px 4px rgba(16, 185, 129, 0.1)";
                  }}
                >
                  ➕ Create New Deal
                </button>
              )}
            </div>
          </div>

          {/* Conditional Rendering: Deals Grid or Property List */}
          {isDisplayingDeals ? (
            // Professional Render DealStatusCards
            isLoading ? (
              <div style={proStyles.loadingState} className="glass-morphism">
                ⏳ Loading your deals...
              </div>
            ) : myDeals.length === 0 ? (
              <div style={proStyles.emptyState}>
                <div style={proStyles.emptyIcon}>🔭</div>
                <h3 style={proStyles.emptyTitle}>No Deals Yet</h3>
                <p style={proStyles.emptyText}>
                  You are not currently involved in any deals.
                </p>
              </div>
            ) : (
              <div style={proStyles.dealsGrid} className="stagger-animation">
                {myDeals.map((deal, index) => (
                  <div
                    key={deal.dealId || deal.id}
                    className="magnetic-hover"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <DealStatusCard
                      deal={deal}
                      onViewDetails={handleViewDealDetails}
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            // Professional Render PropertyList
            <div className="stagger-animation">
              <PropertyList
                properties={propertiesWithDeals}
                loading={isLoading}
                onPropertyUpdated={handlePropertyUpdated}
                onPropertyDeleted={handlePropertyDeleted}
                onViewDealDetails={handleViewDealDetails}
              />
            </div>
          )}
        </section>

        {/* Professional Stats Section */}
        <section style={proStyles.statsSection}>
          <div style={proStyles.statsGrid} className="stagger-animation">
            {[
              { icon: "🏠", number: "10,000+", label: "Properties Listed" },
              { icon: "👥", number: "50,000+", label: "Happy Customers" },
              { icon: "🏙️", number: "25+", label: "Areas Covered" },
              { icon: "⭐", number: "4.8/5", label: "Customer Rating" },
            ].map((stat, index) => (
              <div
                key={index}
                style={{
                  ...proStyles.statCard,
                  animationDelay: `${index * 0.1}s`,
                }}
                className="magnetic-hover"
                onMouseEnter={(e) => {
                  e.target.style.transform = "translateY(-8px) scale(1.03)";
                  e.target.style.boxShadow =
                    "0 12px 40px rgba(0, 0, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.06)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "translateY(0) scale(1)";
                  e.target.style.boxShadow =
                    "0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)";
                }}
              >
                <div style={proStyles.statIcon}>{stat.icon}</div>
                <div style={proStyles.statNumber}>{stat.number}</div>
                <div style={proStyles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ⭐ FLOATING WHATSAPP BUTTON WITH TOOLTIP ⭐ */}
      <div style={{ position: "relative" }}>
        <button
          style={proStyles.floatingWhatsAppButton}
          onClick={handleFloatingWhatsAppClick}
          disabled={loadingAgents || agents.length === 0}
          onMouseEnter={(e) => {
            if (!e.target.disabled) {
              e.target.style.transform = "translateY(-6px) scale(1.1)";
              e.target.style.boxShadow = "0 12px 35px rgba(37, 211, 102, 0.5)";
              e.target.style.animation = "whatsappGlow 2s ease-in-out infinite";
              setShowTooltip(true);
            }
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0) scale(1)";
            e.target.style.boxShadow = "0 8px 25px rgba(37, 211, 102, 0.4)";
            e.target.style.animation = "whatsappFloat 6s ease-in-out infinite";
            setShowTooltip(false);
          }}
        >
          <span style={proStyles.whatsappIcon}>
            {loadingAgents ? "⏳" : "💬"}
          </span>
        </button>

        {/* Tooltip */}
        <div
          style={{
            ...proStyles.agentStatusTooltip,
            ...(showTooltip ? proStyles.tooltipVisible : {}),
          }}
        >
          {loadingAgents && "Finding agents..."}
          {!loadingAgents && agents.length === 0 && "No agents available"}
          {!loadingAgents &&
            agents.length > 0 &&
            `${agents.length} agent${agents.length > 1 ? "s" : ""} available`}
        </div>
      </div>

      {/* Modals */}
      {showBrowseDeals && (
        <BrowsePropertiesForDeal
          onClose={() => setShowBrowseDeals(false)}
          onDealCreated={() => {
            setShowBrowseDeals(false);
            fetchMyDeals();
            setActiveTab("my-deals");
          }}
        />
      )}

      {selectedDealForModal && (
        <DealDetailModal
          deal={selectedDealForModal}
          onClose={handleCloseDealModal}
          onUpdate={handleDealUpdatedInModal}
          userRole={user?.role}
        />
      )}
    </>
  );
}

export default HomePage;
