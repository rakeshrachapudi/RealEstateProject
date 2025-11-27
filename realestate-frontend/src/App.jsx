// src/App.jsx
import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import { HelmetProvider } from "react-helmet-async";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import { injectAnimations } from "./animations.js";

// Analytics
import GoogleAnalytics from "./components/Analytics/GoogleAnalytics";
import MetaPixel from "./components/Analytics/MetaPixel";

// Modals
import LoginModal from "./LoginModal.jsx";
import PostPropertyModal from "./PostPropertyModal.jsx";
import SignupModal from "./SignupModal.jsx";
import UserProfileModal from "./UserProfileModal.jsx";

// Layout Components
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

// Pages & Components
import HomePage from "./pages/HomePage.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";
import PropertyDetails from "./components/PropertyDetails.jsx";
import PropertyTypePage from "./components/PropertyTypePage.jsx";
import MyPropertiesPage from "./pages/MyPropertiesPage.jsx";
import MyDealsPage from "./pages/MyDealsPage.jsx";
import SellerDealsPage from "./pages/SellerDealsPage.jsx";
import BuyerDeals from "./BuyerDeals.jsx";
import MyAgreementsPage from "./pages/MyAgreementsPage.jsx";
import RentalAgreementPage from "./pages/RentalAgreementPage.jsx";
import CreateSaleAgreementPage from "./pages/CreateSaleAgreementPage.jsx";
import AgentDashboard from "./pages/AgentDashboard.jsx";
import AdminDealPanel from "./AdminDealPanel.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminUsersPage from "./pages/AdminUsersPage.jsx";
import AdminPropertiesPage from "./pages/AdminPropertiesPage.jsx";
import AdminAgentsPage from "./pages/AdminAgentsPage.jsx";
import EmiCalculatorPage from "./pages/EmiCalculatorPage.jsx";
import LegalPage from "./pages/LegalPage.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";

import "./App.css";

// Legal content (you can move these to separate files if needed)
const PRIVACY_POLICY_CONTENT = [];
const TERMS_AND_CONDITIONS_CONTENT = [];

// -------------------------------------
// App Content Wrapper
// -------------------------------------
function AppContent() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

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

      {/* Main Content */}
      <main className="main-content">
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
              <MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />
            }
          />

          {/* Dashboard → redirects to My Properties */}
          <Route
            path="/dashboard"
            element={
              <MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />
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
          <Route path="/sale-agreement" element={<CreateSaleAgreementPage />} />

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
          <Route path="/about" element={<PlaceholderPage title="About Us" />} />
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
            element={<PlaceholderPage title="Trusted Electrical Contractor" />}
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
      </main>

      {/* Global Footer - shown on all pages */}
      <Footer />

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