import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx'; // Assuming AuthProvider is exported from here
import { styles } from './styles.js';
import { injectAnimations } from './animations.js';



import LoginModal from './LoginModal.jsx';
import PostPropertyModal from './PostPropertyModal.jsx';
import SignupModal from './SignupModal.jsx';
import UserProfileModal from './UserProfileModal.jsx';
import PropertyEditModal from './PropertyEditModal.jsx'; // Assuming this exists
import AdminDealPanel from './AdminDealPanel.jsx';

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
import MyAgreementsPage from './pages/MyAgreementsPage.jsx'; // Make sure the path is correct

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
        // Consider removing reload or using state management for updates
        // setTimeout(() => window.location.reload(), 100);
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
                {/* Existing Routes */}
                <Route path="/my-deals" element={<BuyerDeals />} />
                <Route path="/agent-dashboard" element={<AgentDashboard />} />
                <Route path="/admin-deals" element={<AdminDealPanel />} />
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/property-type/:listingType/:propertyType" element={<PropertyTypePage />} />
                <Route path="/area/:areaName" element={<PropertyTypePage />} />
                <Route path="/owner-plans" element={<PlaceholderPage title="Owner Plans" />} />
                <Route path="/my-properties" element={<MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />} />
                <Route path="/dashboard" element={<MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />} />
                <Route path="/rental-agreement" element={<RentalAgreementPage />} />

                {/* --- ADDED ROUTE FOR MY AGREEMENTS --- */}
                <Route path="/my-agreements" element={<MyAgreementsPage />} />
                {/* --- END ADDITION --- */}

                {/* Remove duplicate/conflicting routes if they existed */}
                {/* <Route path="/agent-dashboard" element={<AgentDashboard />} /> */}
                {/* <Route path="/my-deals" element={<BuyerDeals />} /> */}
                {/* <Route path="/rental-agreement" element={<PlaceholderPage title="Rental Agreement" />} /> */}
                <Route path="/home-renovation" element={<PlaceholderPage title="Home Interior/Renovation" />} />
            </Routes>

            {/* Modals */}
            {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
            {isPostPropertyModalOpen && <PostPropertyModal onClose={() => setIsPostPropertyModalOpen(false)} onPropertyPosted={handlePropertyPosted} />}
            {isSignupModalOpen && <SignupModal onClose={() => setIsSignupModalOpen(false)} />}
            {isUserProfileModalOpen && <UserProfileModal user={user} onClose={() => setIsUserProfileModalOpen(false)} logout={logout} />}
            {/* You might need PropertyEditModal rendered conditionally elsewhere */}
        </div>
    );
}

// Ensure AuthProvider wraps AppContent if useAuth is used within these pages
import { AuthProvider } from './AuthContext.jsx';

function App() {
    return (
        <Router>
            <AuthProvider> {/* Wrap AppContent with AuthProvider */}
                <AppContent />
            </AuthProvider>
        </Router>
    );
}

export default App;