// src/App.jsx - OPTIMIZED VERSION WITH CODE SPLITTING
import React, { useEffect, useState, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import { injectAnimations } from "./animations.js";

// Analytics
import GoogleAnalytics from "./components/Analytics/GoogleAnalytics";
import MetaPixel from "./components/Analytics/MetaPixel";

// WhatsApp Widget
import WhatsAppWidget from "./components/WhatsAppWidget";

// Modals (Keep these eager - they're small and need to be instant)
import LoginModal from "./LoginModal.jsx";
import PostPropertyModal from "./PostPropertyModal.jsx";
import SignupModal from "./SignupModal.jsx";
import UserProfileModal from "./UserProfileModal.jsx";

// Layout Components (Keep these eager - needed immediately)
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

// 🚀 CODE SPLITTING - Lazy load pages to reduce initial bundle size
const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage.jsx"));
const PropertyDetails = lazy(() => import("./components/PropertyDetails.jsx"));
const PropertyTypePage = lazy(() =>
  import("./components/PropertyTypePage.jsx")
);
const MyPropertiesPage = lazy(() => import("./pages/MyPropertiesPage.jsx"));
const MyDealsPage = lazy(() => import("./pages/MyDealsPage.jsx"));
const SellerDealsPage = lazy(() => import("./pages/SellerDealsPage.jsx"));
const BuyerDeals = lazy(() => import("./BuyerDeals.jsx"));
const MyAgreementsPage = lazy(() => import("./pages/MyAgreementsPage.jsx"));
const RentalAgreementPage = lazy(() =>
  import("./pages/RentalAgreementPage.jsx")
);
const CreateSaleAgreementPage = lazy(() =>
  import("./pages/CreateSaleAgreementPage.jsx")
);
const AgentDashboard = lazy(() => import("./pages/AgentDashboard.jsx"));
const AdminDealPanel = lazy(() => import("./AdminDealPanel.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage.jsx"));
const AdminPropertiesPage = lazy(() =>
  import("./pages/AdminPropertiesPage.jsx")
);
const AdminAgentsPage = lazy(() => import("./pages/AdminAgentsPage.jsx"));
const EmiCalculatorPage = lazy(() => import("./pages/EmiCalculatorPage.jsx"));
const LegalPage = lazy(() => import("./pages/LegalPage.jsx"));
const PlaceholderPage = lazy(() => import("./pages/PlaceholderPage.jsx"));

import "./App.css";

// Legal content (you can move these to separate files if needed)
const PRIVACY_POLICY_CONTENT = [];
const TERMS_AND_CONDITIONS_CONTENT = [];

// Loading Fallback Component
const PageLoader = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "60vh",
      fontSize: "1.2rem",
      color: "#666",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #3498db",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 20px",
        }}
      ></div>
      Loading...
    </div>
  </div>
);

// -------------------------------------
// App Content Wrapper
// -------------------------------------
function AppContent() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  // Modal states - centralized in App
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPostPropertyModalOpen, setIsPostPropertyModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  useEffect(() => {
    injectAnimations();
  }, []);

  // Modal handlers
  const handlePropertyPosted = () => {
    setIsPostPropertyModalOpen(false);
    navigate("/my-properties");
  };

  const handlePostPropertyClick = () => {
    if (isAuthenticated) {
      setIsPostPropertyModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleLoginClick = () => setIsLoginModalOpen(true);
  const handleSignupClick = () => setIsSignupModalOpen(true);
  const handleProfileClick = () => setIsUserProfileModalOpen(true);

  const closeLoginModal = () => setIsLoginModalOpen(false);
  const closeSignupModal = () => setIsSignupModalOpen(false);

  const handleSwitchToSignup = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <div className="app-content">
      {/* Global Header - shown on all pages */}
      <Header
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onPostPropertyClick={handlePostPropertyClick}
        onProfileClick={handleProfileClick}
      />

      {/* Main Content with Suspense for Code Splitting */}
      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Home - pass modal handlers to avoid duplication */}
            <Route
              path="/"
              element={
                <HomePage
                  onLoginClick={handleLoginClick}
                  onSignupClick={handleSignupClick}
                />
              }
            />

            {/* Search */}
            <Route path="/search" element={<SearchResultsPage />} />

            {/* Property Details */}
            <Route
              path="/property/:id"
              element={
                <PropertyDetails
                  onLoginClick={handleLoginClick}
                  onSignupClick={handleSignupClick}
                />
              }
            />

            {/* Browse by type (rent/sale + type) */}
            <Route
              path="/property-type/:listingType/:propertyType"
              element={<PropertyTypePage />}
            />

            {/* Area-based listing */}
            <Route path="/area/:areaName" element={<PropertyTypePage />} />

            {/* EMI Calculator */}
            <Route path="/emi-calculator" element={<EmiCalculatorPage />} />

            {/* My Properties */}
            <Route
              path="/my-properties"
              element={
                <MyPropertiesPage
                  onPostPropertyClick={handlePostPropertyClick}
                />
              }
            />

            {/* Dashboard → redirects to My Properties */}
            <Route
              path="/dashboard"
              element={
                <MyPropertiesPage
                  onPostPropertyClick={handlePostPropertyClick}
                />
              }
            />

            {/* Deals */}
            <Route path="/my-deals" element={<MyDealsPage />} />
            <Route path="/seller-deals" element={<SellerDealsPage />} />
            <Route path="/buyer-deals" element={<BuyerDeals />} />

            {/* Agent */}
            <Route path="/agent-dashboard" element={<AgentDashboard />} />

            {/* Admin */}
            <Route path="/admin-deals" element={<AdminDealPanel />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-agents" element={<AdminAgentsPage />} />
            <Route path="/admin-users" element={<AdminUsersPage />} />
            <Route path="/admin/properties" element={<AdminPropertiesPage />} />

            {/* Agreements */}
            <Route path="/my-agreements" element={<MyAgreementsPage />} />
            <Route path="/rental-agreement" element={<RentalAgreementPage />} />
            <Route
              path="/sale-agreement"
              element={<CreateSaleAgreementPage />}
            />

            {/* Legal Pages */}
            <Route
              path="/privacy"
              element={
                <LegalPage
                  title="Privacy Policy"
                  content={PRIVACY_POLICY_CONTENT}
                />
              }
            />
            <Route
              path="/terms"
              element={
                <LegalPage
                  title="Terms and Conditions"
                  content={TERMS_AND_CONDITIONS_CONTENT}
                />
              }
            />

            {/* Services / Static Pages */}
            <Route
              path="/owner-plans"
              element={<PlaceholderPage title="Owner Plans" />}
            />
            <Route
              path="/home-renovation"
              element={<PlaceholderPage title="Home Interior/Renovation" />}
            />
            <Route
              path="/contact"
              element={<PlaceholderPage title="Contact Us" />}
            />
            <Route
              path="/about"
              element={<PlaceholderPage title="About Us" />}
            />
            <Route
              path="/faq"
              element={<PlaceholderPage title="Frequently Asked Questions" />}
            />
            <Route
              path="/partner/furniture"
              element={<PlaceholderPage title="Trusted Furniture Partner" />}
            />
            <Route
              path="/partner/electrical"
              element={
                <PlaceholderPage title="Trusted Electrical Contractor" />
              }
            />
            <Route
              path="/loan"
              element={<PlaceholderPage title="Home Loan Assistance" />}
            />

            {/* 404 - Optional */}
            <Route
              path="*"
              element={<PlaceholderPage title="Page Not Found" />}
            />
          </Routes>
        </Suspense>
      </main>

      {/* Global Footer - shown on all pages */}
      <Footer />

      {/* 🚀 WhatsApp Floating Widget */}
      <WhatsAppWidget
        phoneNumber="917730051329"
        message="Hi! I'm interested in properties on PropertyDealz.in"
      />

      {/* Global Modals */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={closeLoginModal}
          onSwitchToSignup={handleSwitchToSignup}
        />
      )}

      {isPostPropertyModalOpen && (
        <PostPropertyModal
          onClose={() => setIsPostPropertyModalOpen(false)}
          onPropertyPosted={handlePropertyPosted}
        />
      )}

      {isSignupModalOpen && (
        <SignupModal
          onClose={closeSignupModal}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}

      {isUserProfileModalOpen && (
        <UserProfileModal
          user={user}
          onClose={() => setIsUserProfileModalOpen(false)}
          logout={logout}
        />
      )}
    </div>
  );
}

// -------------------------------------
// FINAL APP WRAPPER WITH GA + META PIXEL
// -------------------------------------
function App() {
  const GA_MEASUREMENT_ID = "G-5X8D8087C4";
  const META_PIXEL_IDS = ["25079012878428180", "868151089247460"];

  return (
    <Router>
      <HelmetProvider>
        <AuthProvider>
          {/* Global Analytics */}
          <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} />
          <MetaPixel pixelId={META_PIXEL_IDS} />

          <div className="app-wrapper">
            <AppContent />
          </div>
        </AuthProvider>
      </HelmetProvider>
    </Router>
  );
}

export default App;
