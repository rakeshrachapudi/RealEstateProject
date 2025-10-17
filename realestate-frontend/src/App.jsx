// realestate-frontend/src/App.jsx - UPDATED

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { styles } from './styles.js';
import { injectAnimations } from './animations.js';

import LoginModal from './LoginModal.jsx';
import PostPropertyModal from './PostPropertyModal.jsx';
import SignupModal from './SignupModal.jsx';
import UserProfileModal from './UserProfileModal.jsx';
import PropertyEditModal from './PropertyEditModal.jsx';

// 🆕 Import new components
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import MyDealsPage from './pages/MyDealsPage.jsx';

// Existing imports
import Header from './components/Header.jsx';
import PropertyDetails from './components/PropertyDetails.jsx';
import PropertyTypePage from './components/PropertyTypePage.jsx';

import HomePage from './pages/HomePage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import MyPropertiesPage from './pages/MyPropertiesPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import AgentDashboard from './pages/AgentDashboard.jsx';
import BuyerDeals from './BuyerDeals.jsx';
import RentalAgreementPage from './pages/RentalAgreementPage.jsx';
import MyAgreementsPage from './pages/MyAgreementsPage.jsx';

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
        navigate('/my-properties');
    };

    const handlePostPropertyClick = () => {
        if (isAuthenticated) setIsPostPropertyModalOpen(true);
        else setIsLoginModalOpen(true);
    };

    return (
        <div style={styles.app}>
            <Header
                onLoginClick={() => setIsLoginModalOpen(true)}
                onSignupClick={() => setIsSignupModalOpen(true)}
                onPostPropertyClick={handlePostPropertyClick}
                onProfileClick={() => setIsUserProfileModalOpen(true)}
            />
            <Routes>
                {/* Home & Properties */}
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/property-type/:listingType/:propertyType" element={<PropertyTypePage />} />
                <Route path="/area/:areaName" element={<PropertyTypePage />} />

                {/* Property Management */}
                <Route path="/my-properties" element={<MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />} />
                <Route path="/dashboard" element={<MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />} />

                {/* 🆕 UNIFIED DEALS PAGE - Shows deals based on user role */}
                <Route path="/my-deals" element={<MyDealsPage />} />

                {/* Agent Dashboard */}
                <Route path="/agent-dashboard" element={<AgentDashboard />} />

                {/* 🆕 Admin Dashboard - All agents and their deals */}
                <Route path="/admin-dashboard" element={<AdminDashboardPage />} />

                {/* Keep old admin-deals route for backward compatibility */}
                <Route path="/admin-deals" element={<AdminDashboardPage />} />

                {/* Agreements */}
                <Route path="/rental-agreement" element={<RentalAgreementPage />} />
                <Route path="/my-agreements" element={<MyAgreementsPage />} />

                {/* Placeholder pages */}
                <Route path="/owner-plans" element={<PlaceholderPage title="Owner Plans" />} />
                <Route path="/home-renovation" element={<PlaceholderPage title="Home Interior/Renovation" />} />
            </Routes>

            {/* Modals */}
            {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
            {isPostPropertyModalOpen && <PostPropertyModal onClose={() => setIsPostPropertyModalOpen(false)} onPropertyPosted={handlePropertyPosted} />}
            {isSignupModalOpen && <SignupModal onClose={() => setIsSignupModalOpen(false)} />}
            {isUserProfileModalOpen && <UserProfileModal user={user} onClose={() => setIsUserProfileModalOpen(false)} logout={logout} />}
        </div>
    );
}

import { AuthProvider } from './AuthContext.jsx';

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