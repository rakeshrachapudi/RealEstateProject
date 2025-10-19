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
import AdminDealPanel from './AdminDealPanel.jsx';

import AdminUsersPage from './pages/AdminUsersPage';


import Header from './components/Header.jsx';
import PropertyDetails from './components/PropertyDetails.jsx';
import PropertyTypePage from './components/PropertyTypePage.jsx';

import HomePage from './pages/HomePage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import MyPropertiesPage from './pages/MyPropertiesPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';
import AgentDashboard from './pages/AgentDashboard.jsx';
import BuyerDeals from './BuyerDeals.jsx';
import MyDealsPage from './pages/MyDealsPage.jsx';
import AdminAgentsPage from './pages/AdminAgentsPage';
import SellerDealsPage from './pages/SellerDealsPage.jsx';
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
                {/* Main Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/property-type/:listingType/:propertyType" element={<PropertyTypePage />} />
                <Route path="/area/:areaName" element={<PropertyTypePage />} />

                {/* User Properties */}
                <Route path="/my-properties" element={<MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />} />
                <Route path="/dashboard" element={<MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />} />

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

                {/* Placeholder Pages */}
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