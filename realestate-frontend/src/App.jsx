import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { styles } from "./styles.js";
import { injectAnimations } from "./animations.js";

import LoginModal from "./LoginModal.jsx";
import PostPropertyModal from "./PostPropertyModal.jsx";
import SignupModal from "./SignupModal.jsx";
import UserProfileModal from "./UserProfileModal.jsx";
import PropertyEditModal from "./PropertyEditModal.jsx";
import AdminDealPanel from "./AdminDealPanel.jsx";

import AdminUsersPage from "./pages/AdminUsersPage";
import CreateSaleAgreementPage from './pages/CreateSaleAgreementPage';
import EmiCalculatorPage from "./pages/EmiCalculatorPage.jsx";

import Header from "./components/Header.jsx";
import SubHeader from "./components/SubHeader.jsx";
import PropertyDetails from "./components/PropertyDetails.jsx";
import PropertyTypePage from "./components/PropertyTypePage.jsx";

// 🎯 New Import
import Footer from "./components/Footer.jsx";
// 🎯 NEW LEGAL PAGE IMPORT
import LegalPage from "./pages/LegalPage.jsx";

import HomePage from "./pages/HomePage.jsx";
import SearchResultsPage from "./pages/SearchResultsPage.jsx";
import MyPropertiesPage from "./pages/MyPropertiesPage.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import AgentDashboard from "./pages/AgentDashboard.jsx";
import BuyerDeals from "./BuyerDeals.jsx";
import MyDealsPage from "./pages/MyDealsPage.jsx";
import AdminAgentsPage from "./pages/AdminAgentsPage";
import SellerDealsPage from "./pages/SellerDealsPage.jsx";
import RentalAgreementPage from "./pages/RentalAgreementPage.jsx";
import MyAgreementsPage from "./pages/MyAgreementsPage.jsx";
import "./responsiveness.css";

// --- LEGAL DRAFT DATA (ADDED FOR ROUTE CONTENT) ---

const PRIVACY_POLICY_CONTENT = [
    {
        title: "1. Introduction",
        body: "This Privacy Policy describes how PropertyDealz ('we,' 'us,' or 'our') collects, uses, and protects the personal information of users of our platform, which is dedicated to real estate transactions primarily within the **Hyderabad metropolitan area**."
    },
    {
        title: "2. Information We Collect",
        body: "We collect information necessary to provide our services and facilitate secure transactions.",
        list: [
            "**Identity & Contact Data:** Name, email address, phone number, and physical address collected during registration, profile setup, and deal initiation.",
            "**Property Data:** Detailed information regarding property listings, including title details, photos, and price, which may contain PII related to the Seller/Owner.",
            "**Financial Data:** Information related to agreed prices and payment status. We **do not** store full credit/debit card details.",
            "**Usage Data:** Information automatically collected, including IP address, browser type, pages viewed, and time spent on the Platform.",
            "**Location Data:** General location derived from your IP address to prioritize relevant properties in the Hyderabad region."
        ]
    },
    {
        title: "3. How We Use Your Information",
        body: "We use your data strictly to fulfill our services and maintain the integrity of the Platform:",
        list: [
            "To facilitate connections between Buyers, Sellers, and Agents.",
            "To generate formal legal documents (Rental Agreements, Sale Agreements) upon user initiation.",
            "To verify the identity and role of users (e.g., confirming Agents and validating property ownership).",
            "To communicate updates regarding your deals, inquiries, and platform security.",
            "To comply with legal obligations and regulations, including RERA (if applicable)."
        ]
    },
    {
        title: "4. Sharing and Disclosure of Information",
        body: "We share your personal data only when necessary to complete a transaction or upon your explicit consent.",
        list: [
            "**With Deal Parties:** Your contact information is shared directly with the specific Buyer, Seller, or Agent involved in your pending deal or inquiry.",
            "**With Trusted Partners:** We will share your Identity Data with our **Trusted Partners** (e.g., Furniture Partner, Electrical Contractor) **only if you explicitly request or consent** to receive a service quote from them.",
            "**Legal Requirements:** We may disclose data if required by a court order, law enforcement, or other legal process."
        ]
    },
    {
        title: "5. Data Security and Retention",
        body: "We employ robust technical and organizational security measures to protect your PII against unauthorized access, loss, or disclosure. We retain your data for as long as your account is active or as necessary to provide services, meet legal obligations, and maintain accurate transaction records."
    },
    {
        title: "6. Your Choices and Rights",
        body: "You have the right to access, update, or delete your personal information, subject to certain legal restrictions (e.g., mandatory data retention for completed deals). You may opt-out of marketing communications at any time."
    }
];
const TERMS_AND_CONDITIONS_CONTENT = [
    {
        title: "1. Acceptance of Terms",
        body: "By accessing or using the PropertyDealz website and mobile application (the 'Platform'), you agree to be bound by these Terms and Conditions ('Terms') and all applicable laws and regulations in Hyderabad, India. If you do not agree to these Terms, you may not use the Platform."
    },
    {
        title: "2. User Registration and Account Security",
        body: "To access certain features, you must register for an account. You are responsible for maintaining the confidentiality of your account password and are fully responsible for all activities that occur under your account. You agree to notify PropertyDealz immediately of any unauthorized use of your account."
    },
    {
        title: "3. User Obligations and Conduct",
        body: "You are solely responsible for the accuracy and legality of any information, data, or content you submit. You agree to:",
        list: [
            "Ensure all information provided for registration and property listings (including photos and documents) is accurate, current, and complete.",
            "Acknowledge that the Platform is primarily intended for property transactions within the **Hyderabad metropolitan area**.",
            "Refrain from posting fraudulent listings, engaging in harassment, or submitting false inquiries.",
            "Use the Platform only for lawful purposes related to legitimate real estate dealings."
        ]
    },
    {
        title: "4. Property Listings and Content",
        body: "All property listings must be legally compliant and accurate. PropertyDealz reserves the right, but not the obligation, to screen, remove, or edit any content that we deem harmful, misleading, or in violation of these Terms."
    },
    {
        title: "5. Platform Role and Limitation of Liability",
        body: "PropertyDealz acts strictly as a technology platform and facilitator. We are **not** a real estate broker, agent, or contracting party in any transaction. Your transaction is solely between you (the Buyer/Seller/Renter) and the other user.",
        list: [
            "We do not verify the financial capability of any user or the title/condition of any property beyond basic document checks.",
            "PropertyDealz is not responsible for losses, damages, or disputes arising from negotiations or finalized agreements between users.",
            "You must seek independent legal and financial advice before entering into any property agreement."
        ]
    },
    {
        title: "6. Trusted Partners and Third-Party Services",
        body: "We may feature or link to services provided by our Trusted Partners (e.g., Furniture Partner, Electrical Contractor). Your use of their services is a direct contract between you and the Partner. PropertyDealz is **not** liable for the quality, performance, or service delivery of any Trusted Partner.",
        list: [
            "We share your contact information with a Trusted Partner **only upon your explicit request or consent** for that specific service.",
            "All claims regarding partner services must be directed to the Partner directly."
        ]
    },
    {
        title: "7. Termination",
        body: "We reserve the right to suspend or terminate your account access immediately, without prior notice, if you breach these Terms, submit fraudulent information, or engage in activity detrimental to the integrity of the Platform or its users."
    },
    {
        title: "8. Governing Law and Jurisdiction",
        body: "These Terms shall be governed by and construed in accordance with the laws of **India**. You irrevocably consent to the exclusive jurisdiction of the courts located in **Hyderabad, Telangana**, for any dispute arising out of or relating to these Terms or your use of the Platform."
    }
];
// --- END LEGAL DRAFT DATA ---

function AppContent() {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPostPropertyModalOpen, setIsPostPropertyModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    injectAnimations();
  }, []);

  const handlePropertyPosted = () => {
    setIsPostPropertyModalOpen(false);
    navigate("/my-properties");
  };

  const handlePostPropertyClick = () => {
    if (isAuthenticated) setIsPostPropertyModalOpen(true);
    else setIsLoginModalOpen(true);
  };

  return (
    // 🎯 Wrap AppContent in a main container with flexGrow: 1
    <div style={{ flexGrow: 1, ...styles.app }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          // A background color is good practice for sticky elements
          backgroundColor: "#fff",
        }}
      >
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onSignupClick={() => setIsSignupModalOpen(true)}
          onPostPropertyClick={handlePostPropertyClick}
          onProfileClick={() => setIsUserProfileModalOpen(true)}
        />
      </div>
      <div
        style={{
          position: "sticky",
          top: "20px",
          zIndex: 1000,
          // A background color is good practice for sticky elements
          backgroundColor: "#fff",
        }}
      ></div>
      <SubHeader />
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route
          path="/property-type/:listingType/:propertyType"
          element={<PropertyTypePage />}
        />
        <Route path="/area/:areaName" element={<PropertyTypePage />} />
        <Route path="/emi-calculator" element={<EmiCalculatorPage />} />

        {/* User Properties */}
        <Route
          path="/my-properties"
          element={
            <MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />
          }
        />
        <Route
          path="/dashboard"
          element={
            <MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />
          }
        />

        {/* Deals Pages - Role Based */}
        <Route path="/my-deals" element={<MyDealsPage />} />
        <Route path="/buyer-deals" element={<BuyerDeals />} />
        <Route path="/seller-deals" element={<SellerDealsPage />} />

        {/* Agent Dashboard */}
        <Route path="/agent-dashboard" element={<AgentDashboard />} />

        {/* Admin Pages */}
        <Route path="/admin-deals" element={<AdminDealPanel />} />
        {/* NEW ADMIN ROUTES - Add these */}
        <Route path="/admin-agents" element={<AdminAgentsPage />} />
        <Route path="/admin-users" element={<AdminUsersPage />} />

        {/* Agreement Pages */}
        <Route path="/rental-agreement" element={<RentalAgreementPage />} />
        <Route path="/my-agreements" element={<MyAgreementsPage />} />

        {/* ⭐️ ADDED: Sale Agreement Creation Route ⭐️ */}
        <Route path="/sale-agreement" element={<CreateSaleAgreementPage />} />

        {/* 🎯 NEW LEGAL ROUTES 🎯 */}
        <Route
            path="/privacy"
            element={<LegalPage title="Privacy Policy" content={PRIVACY_POLICY_CONTENT} />}
        />
        <Route
            path="/terms"
            element={<LegalPage title="Terms and Conditions" content={TERMS_AND_CONDITIONS_CONTENT} />}
        />

        {/* Placeholder Pages (Assuming these routes correspond to Footer links) */}
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
          element={<PlaceholderPage title="Trusted Electrical Contractor" />}
        />
        <Route
          path="/loan"
          element={<PlaceholderPage title="Home Loan Assistance" />}
        />


      </Routes>

      {/* Modals */}
      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}
      {isPostPropertyModalOpen && (
        <PostPropertyModal
          onClose={() => setIsPostPropertyModalOpen(false)}
          onPropertyPosted={handlePropertyPosted}
        />
      )}
      {isSignupModalOpen && (
        <SignupModal onClose={() => setIsSignupModalOpen(false)} />
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

import { AuthProvider } from "./AuthContext.jsx";

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* 🎯 Outer wrapper for sticky footer and full height */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* AppContent now acts as the main content area with flexGrow: 1 */}
            <AppContent />
            {/* 🎯 ADDED FOOTER */}
            <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;