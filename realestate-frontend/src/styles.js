// src/styles.js

export const styles = {
  // Responsive breakpoints
  breakpoints: {
    xs: "320px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  pageSubtitle: {
    fontSize: "clamp(14px, 2.5vw, 18px)",
    color: "#64748b",
    fontWeight: 500,
    lineHeight: 1.6,
  },

  viewMoreContainer: {
    textAlign: "center",
    marginTop: "clamp(20px, 4vw, 32px)",
    padding: "0 16px",
  },

  viewMoreBtn: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "clamp(10px, 2vw, 14px) clamp(20px, 3vw, 28px)",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(14px, 2vw, 16px)",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: "translateY(0)",
  },

  profileDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    right: 0,
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
    zIndex: 1010,
    width: "max(200px, 15vw)",
    minWidth: "180px",
    maxWidth: "250px",
    overflow: "hidden",
    paddingTop: "10px",
    animation: "slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transformOrigin: "top right",
  },

  profileDropdownItem: {
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: "clamp(13px, 1.5vw, 14px)",
    color: "#475569",
    fontWeight: 500,
    transition: "all 0.2s ease",
    position: "relative",
    overflow: "hidden",
  },

  noPropertiesContainer: {
    textAlign: "center",
    padding: "clamp(40px, 6vw, 60px) clamp(16px, 3vw, 20px)",
    backgroundColor: "#f8f9fa",
    borderRadius: "16px",
    border: "2px dashed #e2e8f0",
    margin: "0 auto",
    maxWidth: "600px",
    animation: "fadeInScale 0.5s ease-out",
  },

  noPropertiesText: {
    fontSize: "clamp(16px, 2.5vw, 18px)",
    color: "#64748b",
    marginBottom: "clamp(16px, 3vw, 24px)",
    lineHeight: 1.6,
  },

  app: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    overflow: "hidden",
    position: "relative",
  },

  header: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 1000,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    // borderRadius: "25px",
    boxShadow: "0 4px 20px rgba(0,0,0,1)",
  },

  headerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "clamp(12px, 2vw, 16px) clamp(16px, 3vw, 32px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: "clamp(8px, 1.5vw, 12px)",
    fontSize: "clamp(20px, 3vw, 28px)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    transition: "transform 0.3s ease",
    animation: "logoFloat 3s ease-in-out infinite",
  },

  logoIcon: {
    fontSize: "clamp(24px, 4vw, 32px)",
  },

  nav: {
    display: "flex",
    gap: "clamp(16px, 2.5vw, 28px)",
    alignItems: "center",
    flexWrap: "wrap",
  },

  navItem: {
    position: "relative",
    cursor: "pointer",
    padding: "12px 0",
    transition: "transform 0.2s ease",
  },

  navText: {
    fontSize: "clamp(14px, 1.8vw, 16px)",
    fontWeight: 600,
    color: "white",
    transition: "all 0.3s ease",
    position: "relative",
  },

  dropdowns: {
    display: "flex",
    gap: "clamp(16px, 2vw, 32px)",
  },

  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "white",
    boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
    borderRadius: "16px",
    padding: "clamp(16px, 2vw, 24px)",
    marginTop: "2px",
    minWidth: "min(650px, 90vw)",
    display: "flex",
    gap: "clamp(16px, 2vw, 32px)",
    zIndex: 1000,
    animation: "dropdownSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    flexWrap: "wrap",
  },

  dropdownSection: {
    flex: "1 1 200px",
    minWidth: "150px",
  },

  dropdownTitle: {
    fontSize: "clamp(12px, 1.5vw, 14px)",
    fontWeight: 700,
    color: "#4f46e5",
    marginBottom: "clamp(12px, 2vw, 16px)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  dropdownItem: {
    padding: "10px 16px",
    cursor: "pointer",
    borderRadius: "8px",
    fontSize: "clamp(13px, 1.6vw, 14px)",
    color: "#475569",
    fontWeight: 500,
    marginBottom: "4px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
  },

  authSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "end",
    gap: "clamp(8px, 1.5vw, 16px)",
    flexWrap: "wrap",
  },

  loginSignup: {
    display: "flex",
    alignItems: "right",
    gap: "10px",
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.1)",
    padding: "clamp(6px, 1vw, 8px) clamp(12px, 2vw, 16px)",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
    animation: "slideInRight 0.5s ease-out",
  },

  userIcon: {
    fontSize: "clamp(16px, 2vw, 18px)",
    animation: "bounce 2s ease-in-out infinite",
  },

  userName: {
    fontWeight: 600,
    fontSize: "clamp(12px, 1.6vw, 14px)",
    color: "white",
  },

  authButtons: {
    display: "flex",
    gap: "clamp(8px, 1.5vw, 12px)",
    flexWrap: "wrap",
  },

  btnIcon: {
    marginRight: "8px",
    fontSize: "clamp(14px, 1.8vw, 16px)",
  },

  postBtn: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    padding: "clamp(10px, 1.5vw, 12px) clamp(16px, 2.5vw, 24px)",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(14px, 1.8vw, 16px)",
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    whiteSpace: "nowrap",
  },

  loginBtn: {
    backgroundColor: "transparent",
    color: "white",
    padding: "clamp(10px, 1.5vw, 12px) clamp(16px, 2vw, 20px)",
    borderRadius: "12px",
    border: "2px solid rgba(255,255,255,0.3)",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(12px, 1.6vw, 14px)",
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(10px)",
    whiteSpace: "nowrap",
  },

  signupBtn: {
    background: "white",
    color: "#667eea",
    padding: "clamp(10px, 1.5vw, 12px) clamp(16px, 2vw, 20px)",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(12px, 1.6vw, 14px)",
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 2px 8px rgba(255,255,255,0.2)",
    whiteSpace: "nowrap",
  },

  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "clamp(16px, 3vw, 24px) clamp(16px, 3vw, 32px)",
    minHeight: "80vh",
    animation: "fadeIn 0.6s ease-out",
    marginTop: "140px",
  },

  heroSection: {
    backgroundColor: "#e0f2fe",
    padding: "clamp(30px, 5vw, 60px) clamp(20px, 4vw, 40px)",
    borderRadius: "clamp(16px, 2vw, 24px)",
    marginBottom: "clamp(24px, 4vw, 40px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    flexWrap: "wrap",
    gap: "24px",
    animation: "slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
    background: "linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)",
  },

  heroContent: {
    flex: "1 1 400px",
    maxWidth: "100%",
    zIndex: 2,
    animation: "slideInLeft 0.8s ease-out",
  },

  mainTitle: {
    fontSize: "clamp(28px, 5vw, 48px)",
    fontWeight: 800,
    color: "#1e293b",
    marginBottom: "16px",
    lineHeight: 1.2,
    animation: "titleReveal 1s ease-out",
  },

  titleGradient: {
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    animation: "gradientShift 3s ease-in-out infinite",
  },

  heroSubtitle: {
    fontSize: "clamp(16px, 2.5vw, 20px)",
    color: "#475569",
    lineHeight: 1.6,
    animation: "fadeInUp 0.8s ease-out 0.2s both",
  },

  heroGraphics: {
    position: "relative",
    flex: "1 1 300px",
    minHeight: "200px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  floatingElement1: {
    position: "absolute",
    fontSize: "clamp(30px, 5vw, 50px)",
    top: "10%",
    left: "10%",
    animation: "float 6s ease-in-out infinite",
  },

  floatingElement2: {
    position: "absolute",
    fontSize: "clamp(50px, 8vw, 80px)",
    top: "40%",
    right: "10%",
    animation: "float 7s ease-in-out infinite 1s",
  },

  floatingElement3: {
    position: "absolute",
    fontSize: "clamp(25px, 4vw, 40px)",
    bottom: "15%",
    left: "30%",
    animation: "float 5s ease-in-out infinite 2s",
  },

  searchSection: {
    marginTop: "clamp(-50px, -8vw, -100px)",
    marginBottom: "clamp(30px, 5vw, 60px)",
    zIndex: 10,
    position: "relative",
    padding: "0 clamp(8px, 2vw, 16px)",
    animation: "searchSlideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both",
  },

  section: {
    marginBottom: "clamp(30px, 5vw, 60px)",
    animation: "fadeIn 0.8s ease-out",
  },

  sectionTitle: {
    fontSize: "clamp(20px, 3.5vw, 28px)",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "clamp(16px, 3vw, 24px)",
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    animation: "slideInLeft 0.6s ease-out",
  },

  sectionIcon: {
    marginRight: "clamp(8px, 1.5vw, 12px)",
    fontSize: "clamp(20px, 3.5vw, 28px)",
    animation: "iconBounce 1s ease-out",
  },

  areasGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "clamp(12px, 2vw, 16px)",
    animation: "gridFadeIn 0.8s ease-out",
  },

  areaButton: {
    backgroundColor: "white",
    color: "#334155",
    padding: "clamp(10px, 1.5vw, 12px) clamp(16px, 2.5vw, 24px)",
    borderRadius: "12px",
    border: "2px solid #e2e8f0",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "clamp(14px, 1.8vw, 16px)",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    animation: "buttonFadeIn 0.6s ease-out",
    flex: "0 1 auto",
  },

  areaEmoji: {
    fontSize: "clamp(16px, 2vw, 18px)",
    transition: "transform 0.3s ease",
  },

  propertiesSection: {
    marginBottom: "clamp(30px, 5vw, 60px)",
    paddingTop: "clamp(16px, 2vw, 20px)",
    animation: "sectionReveal 0.8s ease-out",
  },

  tabContainer: {
    display: "flex",
    marginBottom: "clamp(16px, 2vw, 20px)",
    borderBottom: "2px solid #e2e8f0",
    overflowX: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    WebkitScrollbar: {
      display: "none",
    },
    gap: "clamp(8px, 1vw, 12px)",
    paddingBottom: "2px",
  },

  tab: {
    padding: "clamp(10px, 1.5vw, 12px) clamp(16px, 2vw, 24px)",
    fontSize: "clamp(14px, 1.8vw, 16px)",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    color: "#64748b",
    borderBottom: "3px solid transparent",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    whiteSpace: "nowrap",
    flex: "0 0 auto",
    position: "relative",
  },

  activeTab: {
    color: "#667eea",
    borderBottom: "3px solid #667eea",
    animation: "tabActivate 0.4s ease-out",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "clamp(16px, 3vw, 24px)",
    flexWrap: "wrap",
    gap: "16px",
  },

  clearSearchBtn: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    padding: "clamp(8px, 1vw, 10px) clamp(12px, 2vw, 16px)",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 500,
    fontSize: "clamp(12px, 1.6vw, 14px)",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap",
  },

  emptyState: {
    textAlign: "center",
    padding: "clamp(40px, 6vw, 60px) clamp(16px, 3vw, 20px)",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    border: "2px dashed #cbd5e1",
    marginTop: "clamp(20px, 3vw, 32px)",
    animation: "emptyStateReveal 0.5s ease-out",
    maxWidth: "600px",
    margin: "32px auto",
  },

  emptyIcon: {
    fontSize: "clamp(36px, 6vw, 48px)",
    marginBottom: "16px",
    animation: "iconFloat 2s ease-in-out infinite",
  },

  emptyTitle: {
    fontSize: "clamp(18px, 3vw, 24px)",
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: "8px",
  },

  emptyText: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#64748b",
    marginBottom: "clamp(16px, 3vw, 24px)",
    lineHeight: 1.6,
  },

  statsSection: {
    padding: "clamp(24px, 4vw, 40px) 0",
    backgroundColor: "#f1f5f9",
    borderRadius: "clamp(16px, 2vw, 24px)",
    marginBottom: "clamp(24px, 4vw, 40px)",
    position: "relative",
    overflow: "hidden",
    animation: "statsReveal 0.8s ease-out",
  },

  statsGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 clamp(16px, 3vw, 24px)",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(200px, 100%), 1fr))",
    gap: "clamp(16px, 3vw, 32px)",
  },

  statCard: {
    textAlign: "center",
    padding: "clamp(16px, 2.5vw, 20px)",
    backgroundColor: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: "statCardReveal 0.6s ease-out",
    animationFillMode: "both",
    position: "relative",
    overflow: "hidden",
  },

  statIcon: {
    fontSize: "clamp(28px, 4vw, 36px)",
    marginBottom: "12px",
    animation: "statIconPop 0.8s ease-out",
  },

  statNumber: {
    fontSize: "clamp(24px, 4vw, 32px)",
    fontWeight: 800,
    color: "#667eea",
    marginBottom: "4px",
    animation: "numberCount 1.5s ease-out",
  },

  statLabel: {
    fontSize: "clamp(14px, 2vw, 16px)",
    color: "#64748b",
  },

  // Utility responsive styles
  backButton: {
    backgroundColor: "transparent",
    border: "none",
    color: "#4f46e5",
    cursor: "pointer",
    fontSize: "clamp(14px, 2vw, 16px)",
    fontWeight: 600,
    marginBottom: "clamp(16px, 2vw, 20px)",
    display: "flex",
    alignItems: "center",
    transition: "all 0.3s ease",
    padding: "8px 4px",
  },

  backIcon: {
    marginRight: "8px",
    transition: "transform 0.3s ease",
  },

  pageHeader: {
    marginBottom: "clamp(20px, 4vw, 32px)",
    borderBottom: "2px solid #e2e8f0",
    paddingBottom: "clamp(12px, 2vw, 16px)",
    animation: "headerSlide 0.5s ease-out",
  },

  pageTitle: {
    fontSize: "clamp(24px, 4.5vw, 36px)",
    fontWeight: 800,
    color: "#1e293b",
    marginBottom: "8px",
    lineHeight: 1.2,
    animation: "titleFade 0.6s ease-out",
  },

  loadingContainer: {
    textAlign: "center",
    padding: "clamp(60px, 8vw, 80px) clamp(16px, 3vw, 20px)",
    backgroundColor: "#f8f9fa",
    borderRadius: "16px",
    marginTop: "clamp(20px, 3vw, 32px)",
    animation: "pulse 1.5s ease-in-out infinite",
  },

  spinner: {
    fontSize: "clamp(36px, 6vw, 48px)",
    marginBottom: "16px",
    animation: "spin 1s linear infinite",
    display: "inline-block",
  },

  errorContainer: {
    textAlign: "center",
    padding: "clamp(40px, 6vw, 60px) clamp(16px, 3vw, 20px)",
    backgroundColor: "#fee2e2",
    borderRadius: "16px",
    border: "2px solid #f87171",
    color: "#dc2626",
    marginTop: "clamp(20px, 3vw, 32px)",
    animation: "shakeError 0.5s ease-out",
    maxWidth: "600px",
    margin: "32px auto",
  },

  retryBtn: {
    marginTop: "clamp(16px, 2vw, 20px)",
    backgroundColor: "#dc2626",
    color: "white",
    padding: "clamp(8px, 1.5vw, 10px) clamp(16px, 2.5vw, 20px)",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.3s ease",
    fontSize: "clamp(14px, 2vw, 16px)",
  },

  statsBar: {
    display: "flex",
    gap: "clamp(16px, 3vw, 24px)",
    marginBottom: "clamp(20px, 4vw, 32px)",
    padding: "clamp(16px, 3vw, 24px)",
    backgroundColor: "#f8fafc",
    borderRadius: "16px",
    border: "2px solid #e2e8f0",
    flexWrap: "wrap",
    animation: "slideDown 0.5s ease-out",
  },

  statItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: "1 1 150px",
    minWidth: "120px",
  },

  statValue: {
    fontSize: "clamp(18px, 3vw, 24px)",
    fontWeight: 700,
    color: "#1e293b",
    animation: "countUp 1s ease-out",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(min(350px, 100%), 1fr))",
    gap: "clamp(16px, 3vw, 32px)",
    marginTop: "clamp(16px, 2vw, 24px)",
    animation: "gridReveal 0.8s ease-out",
  },

  // Mobile menu styles
  mobileMenuBtn: {
    display: "none",
    backgroundColor: "transparent",
    border: "none",
    color: "white",
    fontSize: "24px",
    cursor: "pointer",
    padding: "8px",
    transition: "transform 0.3s ease",
  },

  mobileMenu: {
    position: "fixed",
    top: 0,
    left: "-100%",
    width: "80%",
    maxWidth: "320px",
    height: "100vh",
    backgroundColor: "white",
    boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
    transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    zIndex: 2000,
    overflowY: "auto",
    padding: "20px",
  },

  mobileMenuOpen: {
    left: 0,
  },

  mobileOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1999,
    opacity: 0,
    visibility: "hidden",
    transition: "all 0.3s ease",
  },

  mobileOverlayVisible: {
    opacity: 1,
    visibility: "visible",
  },

  // Responsive media queries
  "@media (max-width: 768px)": {
    headerContent: {
      padding: "12px 16px",
    },
    nav: {
      display: "none",
    },
    mobileMenuBtn: {
      display: "block",
    },
    dropdown: {
      position: "fixed",
      top: "auto",
      bottom: 0,
      left: 0,
      right: 0,
      transform: "none",
      borderRadius: "16px 16px 0 0",
      maxHeight: "70vh",
      overflowY: "auto",
    },
    heroSection: {
      padding: "30px 20px",
    },
    statsGrid: {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },

  "@media (max-width: 480px)": {
    grid: {
      gridTemplateColumns: "1fr",
    },
    statsGrid: {
      gridTemplateColumns: "1fr",
    },
    areasGrid: {
      flexDirection: "column",
    },
    areaButton: {
      width: "100%",
    },
  },
};
