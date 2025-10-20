import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './AuthContext.jsx'; // Combined AuthProvider and useAuth
import { styles } from './styles.js';
import { injectAnimations } from './animations.js';

// --- Core Files (Directly in src) ---
import LoginModal from './LoginModal.jsx';
import PostPropertyModal from './PostPropertyModal.jsx';
import SignupModal from './SignupModal.jsx';
import UserProfileModal from './UserProfileModal.jsx';
import PropertyEditModal from './PropertyEditModal.jsx';
import AdminDealPanel from './AdminDealPanel.jsx';
import BuyerDeals from './BuyerDeals.jsx';

// --- Components (Inside src/components) ---
import Header from './components/Header.jsx';
import PropertyDetails from './components/PropertyDetails.jsx';
import PropertyTypePage from './components/PropertyTypePage.jsx';

// --- Pages (Inside src/pages) ---
import HomePage from './pages/HomePage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import MyPropertiesPage from './pages/MyPropertiesPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import AgentDashboard from './pages/AgentDashboard.jsx';
import MyDealsPage from './pages/MyDealsPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx'; // The new main dashboard
import SellerDealsPage from './pages/SellerDealsPage.jsx';
import RentalAgreementPage from './pages/RentalAgreementPage.jsx';
import MyAgreementsPage from './pages/MyAgreementsPage.jsx';

function AppContent() {
    const navigate = useNavigate();
    const [isLoginModalOpen, setIsLoginModal] = useState(false);
    const [isPostPropertyModalOpen, setIsPostPropertyModal] = useState(false);
    const [isSignupModalOpen, setIsSignupModal] = useState(false);
    const [isUserProfileModalOpen, setIsUserProfileModal] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    useEffect(() => {
        injectAnimations();
    }, []);

    const handlePropertyPosted = () => {
        setIsPostPropertyModal(false);
        navigate('/my-properties');
    };

    const handlePostPropertyClick = () => {
        if (isAuthenticated) setIsPostPropertyModal(true);
        else setIsLoginModal(true);
    };

    return (
        <div style={styles.app}>
            <Header
                onLoginClick={() => setIsLoginModal(true)}
                onSignupClick={() => setIsSignupModal(true)}
                onPostPropertyClick={handlePostPropertyClick}
                onProfileClick={() => setIsUserProfileModal(true)}
            />
            <Routes>
                {/* Main Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/property-type/:listingType/:propertyType" element={<PropertyTypePage />} />
                <Route path="/area/:areaName" element={<PropertyTypePage />} />

                {/* User Properties */}
                <Route path="/my-properties" element={<MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />} />
                <Route path="/dashboard" element={<MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />} />

                {/* Deals Pages */}
                <Route path="/my-deals" element={<MyDealsPage />} />
                <Route path="/buyer-deals" element={<BuyerDeals />} />
                <Route path="/seller-deals" element={<SellerDealsPage />} />

                {/* Agent Dashboard */}
                <Route path="/agent-dashboard" element={<AgentDashboard />} />

                {/* ⭐ ADMIN ROUTE: CONSOLIDATED ⭐ */}
                <Route path="/admin" element={<AdminDashboard />} />
                {/* Keep old routes for bookmarks, but point them to the new dashboard */}
                <Route path="/admin-deals" element={<AdminDashboard />} />
                <Route path="/admin-agents" element={<AdminDashboard />} />

                {/* Agreement Pages */}
                <Route path="/rental-agreement" element={<RentalAgreementPage />} />
                <Route path="/my-agreements" element={<MyAgreementsPage />} />

                {/* Placeholder Pages */}
                <Route path="/owner-plans" element={<PlaceholderPage title="Owner Plans" />} />
                <Route path="/home-renovation" element={<PlaceholderPage title="Home Interior/Renovation" />} />
            </Routes>

            {/* Modals */}
            {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModal(false)} />}
            {isPostPropertyModalOpen && <PostPropertyModal onClose={() => setIsPostPropertyModal(false)} onPropertyPosted={handlePropertyPosted} />}
            {isSignupModalOpen && <SignupModal onClose={() => setIsSignupModal(false)} />}
            {isUserProfileModalOpen && <UserProfileModal user={user} onClose={() => setIsUserProfileModal(false)} logout={logout} />}
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;