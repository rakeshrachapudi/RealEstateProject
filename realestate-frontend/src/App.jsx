// src/App.jsx - UPDATED WITH SEO PAGES
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
const AreaPage = lazy(() => import("./pages/AreaPage.jsx")); // ✅ FIXED
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

// 🔥 SEO PAGES - Lazy loaded for performance
const HyderabadPage = lazy(() =>
  import("./pages/seo/HyderabadPage.jsx")
);
const BuyFlatHyderabadPage = lazy(() =>
  import("./pages/seo/BuyFlatHyderabadPage.jsx")
);
const FlatsForSaleHyderabadPage = lazy(() =>
  import("./pages/seo/FlatsForSaleHyderabadPage.jsx")
);
const PlotsForSaleHyderabadPage = lazy(() =>
  import("./pages/seo/PlotsForSaleHyderabadPage.jsx")
);
const IndependentHousesHyderabadPage = lazy(() =>
  import("./pages/seo/IndependentHousesHyderabadPage.jsx")
);

import "./App.css";
import "./SEOPages.css"; // SEO Pages Styling

// Legal content
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
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    injectAnimations();
  }, []);

  // Modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPostPropertyModalOpen, setIsPostPropertyModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);

  // Handlers
  const handlePropertyPosted = () => {
    setIsPostPropertyModalOpen(false);
    navigate("/my-properties");
  };

  const handlePostPropertyClick = () => {
    isAuthenticated
      ? setIsPostPropertyModalOpen(true)
      : setIsLoginModalOpen(true);
  };

  const handleLoginClick = () => setIsLoginModalOpen(true);
  const handleSignupClick = () => setIsSignupModalOpen(true);
  const handleProfileClick = () => setIsUserProfileModalOpen(true);

  return (
    <div className="app-content">
      <Header
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
        onPostPropertyClick={handlePostPropertyClick}
        onProfileClick={handleProfileClick}
      />

      <main className="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Home */}
            <Route
              path="/"
              element={
                <HomePage
                  onLoginClick={handleLoginClick}
                  onSignupClick={handleSignupClick}
                />
              }
            />

            {/* SEO Pages */}
            <Route path="/hyderabad" element={<HyderabadPage />} />
            <Route path="/buy-flat-in-hyderabad" element={<BuyFlatHyderabadPage />} />
            <Route path="/flats-for-sale-in-hyderabad" element={<FlatsForSaleHyderabadPage />} />
            <Route path="/plots-for-sale-in-hyderabad" element={<PlotsForSaleHyderabadPage />} />
            <Route
              path="/independent-houses-for-sale-hyderabad"
              element={<IndependentHousesHyderabadPage />}
            />

            {/* Search */}
            <Route path="/search" element={<SearchResultsPage />} />

            {/* Property */}
            <Route
              path="/property/:id"
              element={
                <PropertyDetails
                  onLoginClick={handleLoginClick}
                  onSignupClick={handleSignupClick}
                />
              }
            />

            <Route
              path="/property-type/:listingType/:propertyType"
              element={<PropertyTypePage />}
            />

            {/* ✅ AREA PAGE FIX */}
            <Route path="/area/:areaName" element={<AreaPage />} />

            {/* Tools */}
            <Route path="/emi-calculator" element={<EmiCalculatorPage />} />

            {/* User */}
            <Route
              path="/my-properties"
              element={
                <MyPropertiesPage
                  onPostPropertyClick={handlePostPropertyClick}
                />
              }
            />

            <Route
              path="/dashboard"
              element={
                <MyPropertiesPage
                  onPostPropertyClick={handlePostPropertyClick}
                />
              }
            />

            <Route path="/my-deals" element={<MyDealsPage />} />
            <Route path="/seller-deals" element={<SellerDealsPage />} />
            <Route path="/buyer-deals" element={<BuyerDeals />} />

            {/* Agent / Admin */}
            <Route path="/agent-dashboard" element={<AgentDashboard />} />
            <Route path="/admin-deals" element={<AdminDealPanel />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-agents" element={<AdminAgentsPage />} />
            <Route path="/admin-users" element={<AdminUsersPage />} />
            <Route path="/admin/properties" element={<AdminPropertiesPage />} />

            {/* Agreements */}
            <Route path="/my-agreements" element={<MyAgreementsPage />} />
            <Route path="/rental-agreement" element={<RentalAgreementPage />} />
            <Route path="/sale-agreement" element={<CreateSaleAgreementPage />} />

            {/* Legal */}
            <Route
              path="/privacy"
              element={
                <LegalPage title="Privacy Policy" content={PRIVACY_POLICY_CONTENT} />
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

            {/* Static */}
            <Route path="/contact" element={<PlaceholderPage title="Contact Us" />} />
            <Route path="/about" element={<PlaceholderPage title="About Us" />} />
            <Route path="/faq" element={<PlaceholderPage title="FAQ" />} />
            <Route path="/loan" element={<PlaceholderPage title="Home Loan Assistance" />} />

            {/* 404 */}
            <Route path="*" element={<PlaceholderPage title="Page Not Found" />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      <WhatsAppWidget
        phoneNumber="917730051329"
        message="Hi! I'm interested in properties on PropertyDealz.in"
      />

      {/* Modals */}
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onSwitchToSignup={() => {
            setIsLoginModalOpen(false);
            setIsSignupModalOpen(true);
          }}
        />
      )}

      {isSignupModalOpen && (
        <SignupModal
          onClose={() => setIsSignupModalOpen(false)}
          onSwitchToLogin={() => {
            setIsSignupModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      )}

      {isPostPropertyModalOpen && (
        <PostPropertyModal
          onClose={() => setIsPostPropertyModalOpen(false)}
          onPropertyPosted={handlePropertyPosted}
        />
      )}

      {isUserProfileModalOpen && (
        <UserProfileModal
          user={user}
          logout={logout}
          onClose={() => setIsUserProfileModalOpen(false)}
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
