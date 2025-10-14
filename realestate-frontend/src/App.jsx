// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { styles } from './styles.js';
import { injectAnimations } from './animations.js';

// Import Modals
import LoginModal from './LoginModal.jsx';
import PostPropertyModal from './PostPropertyModal.jsx';
import SignupModal from './SignupModal.jsx';
import UserProfileModal from './UserProfileModal.jsx';

// Import Components
import Header from './components/Header.jsx';
import PropertyDetails from './components/PropertyDetails.jsx';

// Import Pages
import HomePage from './pages/HomePage.jsx';
import SearchResultsPage from './pages/SearchResultsPage.jsx';
import MyPropertiesPage from './pages/MyPropertiesPage.jsx';
import PlaceholderPage from './pages/PlaceholderPage.jsx';

// ============================================
// APP CONTENT
// ============================================
function AppContent() {
    const navigate = useNavigate();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isPostPropertyModalOpen, setIsPostPropertyModalOpen] = useState(false);
    const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
    const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();

    // Inject animations once when the app loads
    useEffect(() => {
        injectAnimations();
    }, []);

    const handlePropertyPosted = () => {
        setIsPostPropertyModalOpen(false);
        navigate('/my-properties');
        setTimeout(() => window.location.reload(), 100);
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
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchResultsPage />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/owner-plans" element={<PlaceholderPage title="Owner Plans" />} />
                <Route path="/my-properties" element={<MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />} />
                <Route path="/dashboard" element={<MyPropertiesPage onPostPropertyClick={handlePostPropertyClick} />} />
                <Route path="/rental-agreement" element={<PlaceholderPage title="Rental Agreement" />} />
                <Route path="/home-renovation" element={<PlaceholderPage title="Home Interior/Renovation" />} />
            </Routes>
            {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
            {isPostPropertyModalOpen && <PostPropertyModal onClose={() => setIsPostPropertyModalOpen(false)} onPropertyPosted={handlePropertyPosted} />}
            {isSignupModalOpen && <SignupModal onClose={() => setIsSignupModalOpen(false)} />}
            {isUserProfileModalOpen && <UserProfileModal user={user} onClose={() => setIsUserProfileModalOpen(false)} logout={logout} />}
        </div>
    );
}

// ============================================
// MAIN APP
// ============================================
function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;