import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

// Import Modals and other components
import LoginModal from './LoginModal.jsx';
import PostPropertyModal from './PostPropertyModal.jsx';
import SignupModal from './SignupModal.jsx';
import UserProfileModal from './UserProfileModal.jsx';
import Header from './components/Header.jsx';
import PropertySearch from './components/PropertySearch';
import PropertyList from './components/PropertyList';
import PropertyDetails from './components/PropertyDetails';

// Import all necessary API functions
import { getFeaturedProperties, searchProperties, getPropertiesByOwner } from './services/api';

// Home Page Component (for all users)
function HomePage() {
  const [propsList, setPropsList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  const popularAreas = [
    { name: 'Gachibowli', emoji: '💼' }, { name: 'HITEC City', emoji: '🏢' }, { name: 'Madhapur', emoji: '🌆' },
    { name: 'Kondapur', emoji: '🏘️' }, { name: 'Kukatpally', emoji: '🏠' }, { name: 'Miyapur', emoji: '🌇' },
    { name: 'Jubilee Hills', emoji: '🏛️' }
  ];

  useEffect(() => {
    const fetchProperties = async () => {
      const response = await getFeaturedProperties();
      if (response && response.success) setPropsList(response.data);
    };
    fetchProperties();
  }, []);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setShowSearchResults(true);
    setSearchLoading(false);
  };
  const handleSearchStart = () => setSearchLoading(true);
  const handleResetSearch = () => {
    setShowSearchResults(false);
    setSearchResults([]);
  };
  const handleAreaClick = (area) => navigate(`/search?area=${encodeURIComponent(area)}`);

  return (
    <div style={styles.container}>
      <section style={styles.heroSection}><div style={styles.heroContent}><h1 style={styles.mainTitle}> Find Your <span style={styles.titleGradient}> Dream Home </span> 🏡 </h1><p style={styles.heroSubtitle}> Discover the perfect property that matches your lifestyle and budget. </p></div><div style={styles.heroGraphics}><div style={styles.floatingElement1}>✨</div> <div style={styles.floatingElement2}>🏠</div> <div style={styles.floatingElement3}>🌆</div></div></section>
      <section style={styles.searchSection}><PropertySearch onSearchResults={handleSearchResults} onSearchStart={handleSearchStart} onReset={handleResetSearch} /></section>
      <section style={styles.section}><h2 style={styles.sectionTitle}> <span style={styles.sectionIcon}>📍</span> Popular Areas in Hyderabad </h2><div style={styles.areasGrid}>{popularAreas.map(area => (<button key={area.name} onClick={() => handleAreaClick(area.name)} style={styles.areaButton} className="areaButton"><span style={styles.areaEmoji}>{area.emoji}</span> {area.name}</button>))}</div></section>
      <section style={styles.propertiesSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}><span style={styles.sectionIcon}>⭐</span>{showSearchResults ? `Search Results (${searchResults.length} found)` : 'Featured Properties'}</h2>
          {showSearchResults && ( <button onClick={handleResetSearch} style={styles.clearSearchBtn}> ✕ Clear Search </button> )}
        </div>
        <PropertyList properties={showSearchResults ? searchResults : propsList} loading={searchLoading} />
        {/* "View More" Button */}
        {!showSearchResults && propsList.length > 0 && (<div style={styles.viewMoreContainer}><button onClick={() => navigate('/search')} style={styles.viewMoreBtn} className="viewMoreBtn">View All Properties →</button></div>)}
      </section>
      <section style={styles.statsSection}><div style={styles.statsGrid}><div style={styles.statCard}> <div style={styles.statIcon}>🏠</div> <div style={styles.statNumber}>10,000+</div> <div style={styles.statLabel}>Properties Listed</div> </div><div style={styles.statCard}> <div style={styles.statIcon}>👥</div> <div style={styles.statNumber}>50,000+</div> <div style={styles.statLabel}>Happy Customers</div> </div><div style={styles.statCard}> <div style={styles.statIcon}>🏙️</div> <div style={styles.statNumber}>25+</div> <div style={styles.statLabel}>Areas Covered</div> </div><div style={styles.statCard}> <div style={styles.statIcon}>⭐</div> <div style={styles.statNumber}>4.8/5</div> <div style={styles.statLabel}>Customer Rating</div> </div></div></section>
    </div>
  );
}

// Search Results Page
function SearchResultsPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFilteredProperties = async (params) => {
      setLoading(true);
      const data = await searchProperties(params);
      if (data.success) setProperties(data.data || []);
      else setProperties([]);
      setLoading(false);
    };
    const urlParams = new URLSearchParams(window.location.search);
    const searchParams = Object.fromEntries(urlParams.entries());
    fetchFilteredProperties(searchParams);
  }, [window.location.search]);

  const getPageTitle = () => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('propertyType');
    const listingType = params.get('listingType');
    const area = params.get('area');
    if (area) return `Properties in ${area}`;
    if (type) return `${type}s for ${listingType === 'sale' ? 'Sale' : 'Rent'}`;
    if (listingType) return `Properties for ${listingType === 'sale' ? 'Sale' : 'Rent'}`;
    return 'Search Results';
  };

  return (
    <div style={styles.container}><button onClick={() => navigate('/')} style={styles.backButton}> <span style={styles.backIcon}>←</span> Back to Home </button><div style={styles.pageHeader}><h1 style={styles.pageTitle}>{getPageTitle()}</h1><p style={styles.pageSubtitle}> {loading ? 'Searching...' : `${properties.length} properties found`} </p></div><PropertyList properties={properties} loading={loading} /></div>
  );
}

// "My Properties" Page Component
function MyPropertiesPage({ onPostPropertyClick }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?._id) {
      navigate('/');
      return;
    }
    const fetchMyProperties = async () => {
      setLoading(true);
      const response = await getPropertiesByOwner(user._id);
      if (response.success) {
        setProperties(response.data || []);
      }
      setLoading(false);
    };
    fetchMyProperties();
  }, [user, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>My Posted Properties</h1>
        <p style={styles.pageSubtitle}>Here you can view and manage the properties you've listed.</p>
      </div>
      <PropertyList properties={properties} loading={loading} />
      {!loading && properties.length === 0 && (
        <div style={styles.noPropertiesContainer}>
          <p style={styles.noPropertiesText}>You haven't posted any properties yet.</p>
          <button onClick={onPostPropertyClick} style={styles.postBtn}>
            <span style={styles.btnIcon}>📝</span> Post Your First Property
          </button>
        </div>
      )}
    </div>
  );
}


const PlaceholderPage = ({ title }) => (
    <div style={{...styles.container, textAlign: 'center', padding: '80px 32px'}}><h1 style={styles.pageTitle}>{title}</h1><p style={styles.pageSubtitle}>This page is currently under construction. 🏗️ Please check back later!</p></div>
);

// Main App Logic Wrapper
function AppContent() {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPostPropertyModalOpen, setIsPostPropertyModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

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

// Main App Component
function App() {
  return ( <Router> <AppContent /> </Router> );
}

// Global Styles
const styles = {
    app: { fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", minHeight: '100vh', backgroundColor: '#f8fafc' },
    container: { padding: '32px', maxWidth: 1400, margin: '0 auto' },
    heroSection: { position: 'relative', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '24px', padding: '80px 60px', marginBottom: '48px', color: 'white', textAlign: 'center', overflow: 'hidden' },
    heroContent: { position: 'relative', zIndex: 2 },
    mainTitle: { fontSize: '72px', margin: '0 0 24px', fontWeight: 800 },
    titleGradient: { background: 'linear-gradient(45deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    heroSubtitle: { fontSize: '20px', opacity: 0.9 },
    heroGraphics: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' },
    floatingElement1: { position: 'absolute', top: '20%', left: '10%', fontSize: '48px', animation: 'float 6s ease-in-out infinite' },
    floatingElement2: { position: 'absolute', top: '60%', right: '15%', fontSize: '64px', animation: 'float 8s ease-in-out infinite 1s' },
    floatingElement3: { position: 'absolute', bottom: '20%', left: '20%', fontSize: '56px', animation: 'float 7s ease-in-out infinite 0.5s' },
    searchSection: { marginBottom: '60px' },
    section: { marginBottom: '60px' },
    propertiesSection: { marginBottom: '80px' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    sectionTitle: { fontSize: '36px', marginBottom: '24px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '12px' },
    sectionIcon: { fontSize: '32px' },
    areasGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
    areaButton: { padding: '20px 24px', borderRadius: '16px', background: 'white', border: '2px solid #e2e8f0', cursor: 'pointer', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', transition: 'all 0.3s' },
    areaEmoji: { fontSize: '24px' },
    clearSearchBtn: { background: '#ef4444', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px' },
    statsSection: { background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', borderRadius: '24px', padding: '60px 40px', color: 'white', textAlign: 'center' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' },
    statCard: { padding: '32px 24px' },
    statIcon: { fontSize: '48px', marginBottom: '16px' },
    statNumber: { fontSize: '36px', fontWeight: 800, marginBottom: '8px', background: 'linear-gradient(45deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    statLabel: { fontSize: '16px', fontWeight: 500, opacity: 0.8 },
    backButton: { padding: '12px 24px', borderRadius: '12px', background: '#6b7280', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '32px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' },
    backIcon: { fontSize: '18px' },
    pageHeader: { textAlign: 'center', marginBottom: '48px' },
    pageTitle: { fontSize: '48px', fontWeight: 800, color: '#1e293b', marginBottom: '16px' },
    pageSubtitle: { fontSize: '18px', color: '#64748b', fontWeight: 500 },
    viewMoreContainer: { textAlign: 'center', marginTop: '32px' },
    viewMoreBtn: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '14px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '16px', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'transform 0.2s, box-shadow 0.2s' },
    noPropertiesContainer: { textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8f9fa', borderRadius: '16px', border: '2px dashed #e2e8f0' },
    noPropertiesText: { fontSize: '18px', color: '#64748b', marginBottom: '24px' },
    btnIcon: { marginRight: '8px', fontSize: '16px' },
    postBtn: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center' },
};

// Inject animations and hover effects into the document
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
  .areaButton:hover { transform: translateY(-4px); border-color: #667eea; color: #667eea; box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15); }
  div[style*="dropdownItem"]:hover { background: linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%); color: #4f46e5; transform: translateX(4px); }
  div[style*="profileDropdownItem"]:hover { background: #f1f5f9; }
  .viewMoreBtn:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(102, 126, 234, 0.2); }
  .userSection:hover { background: rgba(255,255,255,0.2); }
`;
document.head.appendChild(styleSheet);

export default App;

