import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import LoginModal from './LoginModal.jsx';
import PostPropertyModal from './PostPropertyModal.jsx';
import SignupModal from './SignupModal.jsx';
import PropertySearch from './components/PropertySearch';
import PropertyList from './components/PropertyList';
import PropertyDetails from './components/PropertyDetails';
import PropertyTypePage from './components/PropertyTypePage';
import { getFeaturedProperties } from './services/api';
import SimpleTowers from './components/SimpleTowers.jsx';
import TowerGraphics from './components/TowerGraphics.jsx';

// Header Component with Working Dropdowns
function Header({ onLoginClick, onSignupClick, onPostPropertyClick }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  const dropdownData = {
    buy: {
      popularChoices: ['Owner Properties', 'Verified Properties', 'Ready to Move'],
      propertyTypes: ['Apartments', 'Independent Houses', 'Villas', 'Plots'],
      budget: ['Under ₹50 Lac', '₹50 Lac - ₹1 Cr', '₹1 Cr - ₹2 Cr', 'Above ₹2 Cr']
    },
    rent: {
      popularChoices: ['Owner Properties', 'Verified Properties', 'Furnished Homes', 'Bachelor Friendly'],
      propertyTypes: ['Apartments', 'Independent Houses', 'Villas', 'PG', 'Flatmates'],
      budget: ['Under ₹10,000', '₹10,000 - ₹20,000', '₹20,000 - ₹40,000', 'Above ₹40,000']
    }
  };

  const handlePropertyTypeClick = (type, listingType) => {
    navigate(`/properties?type=${encodeURIComponent(type)}&listingType=${listingType}`);
    setActiveDropdown(null);
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div onClick={() => navigate('/')} style={styles.logo}>
          <span style={styles.logoIcon}>🏡</span>
          Visionary Homes
        </div>

        <nav style={styles.nav}>
          <div
            style={styles.navItem}
            onMouseEnter={() => setActiveDropdown('buy')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <span style={styles.navText}>Buy ▾</span>
            {activeDropdown === 'buy' && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownSection}>
                  <h4 style={styles.dropdownTitle}>Popular Choices</h4>
                  {dropdownData.buy.popularChoices.map(item => (
                    <div key={item} style={styles.dropdownItem}>{item}</div>
                  ))}
                </div>
                <div style={styles.dropdownSection}>
                  <h4 style={styles.dropdownTitle}>Property Types</h4>
                  {dropdownData.buy.propertyTypes.map(item => (
                    <div
                      key={item}
                      style={styles.dropdownItem}
                      onClick={() => handlePropertyTypeClick(item, 'sale')}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div style={styles.dropdownSection}>
                  <h4 style={styles.dropdownTitle}>Budget</h4>
                  {dropdownData.buy.budget.map(item => (
                    <div key={item} style={styles.dropdownItem}>{item}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            style={styles.navItem}
            onMouseEnter={() => setActiveDropdown('rent')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <span style={styles.navText}>Rent ▾</span>
            {activeDropdown === 'rent' && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownSection}>
                  <h4 style={styles.dropdownTitle}>Popular Choices</h4>
                  {dropdownData.rent.popularChoices.map(item => (
                    <div key={item} style={styles.dropdownItem}>{item}</div>
                  ))}
                </div>
                <div style={styles.dropdownSection}>
                  <h4 style={styles.dropdownTitle}>Property Types</h4>
                  {dropdownData.rent.propertyTypes.map(item => (
                    <div
                      key={item}
                      style={styles.dropdownItem}
                      onClick={() => handlePropertyTypeClick(item, 'rent')}
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div style={styles.dropdownSection}>
                  <h4 style={styles.dropdownTitle}>Budget</h4>
                  {dropdownData.rent.budget.map(item => (
                    <div key={item} style={styles.dropdownItem}>{item}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span style={styles.navItem}>
            <span style={styles.navText}>Sell</span>
          </span>

          {isAuthenticated ? (
            <div style={styles.authSection}>
              <button onClick={onPostPropertyClick} style={styles.postBtn}>
                <span style={styles.btnIcon}>📝</span>
                Post Property
              </button>
              <div style={styles.userSection}>
                <span style={styles.userIcon}>👋</span>
                <span style={styles.userName}>Welcome, {user?.firstName || 'User'}</span>
              </div>
              <button onClick={logout} style={styles.logoutBtn}>
                <span style={styles.btnIcon}>🚪</span>
                Logout
              </button>
            </div>
          ) : (
            <div style={styles.authButtons}>
              <button onClick={onLoginClick} style={styles.loginBtn}>
                <span style={styles.btnIcon}>🔑</span>
                Login
              </button>
              <button onClick={onSignupClick} style={styles.signupBtn}>
                <span style={styles.btnIcon}>✨</span>
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

// Home Page Component
function HomePage() {
  const [propsList, setPropsList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  const popularAreas = [
    { name: 'Gachibowli', emoji: '💼' },
    { name: 'HITEC City', emoji: '🏢' },
    { name: 'Madhapur', emoji: '🌆' },
    { name: 'Kondapur', emoji: '🏘️' },
    { name: 'Kukatpally', emoji: '🏠' },
    { name: 'Miyapur', emoji: '🌇' },
    { name: 'Jubilee Hills', emoji: '🏛️' }
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await getFeaturedProperties();
      if (response && response.success) {
        setPropsList(response.data);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setShowSearchResults(true);
    setSearchLoading(false);
  };

  const handleSearchStart = () => {
    setSearchLoading(true);
  };

  const handleResetSearch = () => {
    setShowSearchResults(false);
    setSearchResults([]);
    fetchProperties();
  };

  const handleAreaClick = (area) => {
    navigate(`/properties?area=${encodeURIComponent(area)}`);
  };

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.mainTitle}>
            Find Your
            <span style={styles.titleGradient}> Dream Home </span>
            🏡
          </h1>
          <p style={styles.heroSubtitle}>
            Discover the perfect property that matches your lifestyle and budget.
            From cozy apartments to luxurious villas.
          </p>
        </div>
        <div style={styles.heroGraphics}>
          <div style={styles.floatingElement1}>✨</div>
          <div style={styles.floatingElement2}>🏠</div>
          <div style={styles.floatingElement3}>🌆</div>
        </div>
      </section>


      <section style={styles.searchSection}>
        <PropertySearch
          onSearchResults={handleSearchResults}
          onSearchStart={handleSearchStart}
          onReset={handleResetSearch}
        />
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>📍</span>
          Popular Areas in Hyderabad
        </h2>
        <div style={styles.areasGrid}>
          {popularAreas.map(area => (
            <button
              key={area.name}
              onClick={() => handleAreaClick(area.name)}
              style={styles.areaButton}
            >
              <span style={styles.areaEmoji}>{area.emoji}</span>
              {area.name}
            </button>
          ))}
        </div>
      </section>

      {/* Properties Section */}
      <section style={styles.propertiesSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>⭐</span>
            {showSearchResults
              ? `Search Results (${searchResults.length} found)`
              : 'Featured Properties'}
          </h2>
          {showSearchResults && (
            <button onClick={handleResetSearch} style={styles.clearSearchBtn}>
              ✕ Clear Search
            </button>
          )}
        </div>
        <PropertyList
          properties={showSearchResults ? searchResults : propsList}
          loading={searchLoading}
        />
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏠</div>
            <div style={styles.statNumber}>10,000+</div>
            <div style={styles.statLabel}>Properties Listed</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>👥</div>
            <div style={styles.statNumber}>50,000+</div>
            <div style={styles.statLabel}>Happy Customers</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🏙️</div>
            <div style={styles.statNumber}>25+</div>
            <div style={styles.statLabel}>Areas Covered</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>⭐</div>
            <div style={styles.statNumber}>4.8/5</div>
            <div style={styles.statLabel}>Customer Rating</div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Properties List Page (filtered) - Enhanced
function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');
    const listingType = params.get('listingType');
    const area = params.get('area');

    fetchFilteredProperties(type, listingType, area);
  }, [window.location.search]);

  const fetchFilteredProperties = async (type, listingType, area) => {
    setLoading(true);
    try {
      const searchParams = {};
      if (type) searchParams.propertyType = type;
      if (listingType) searchParams.listingType = listingType;
      if (area) searchParams.area = area;

      const response = await fetch('http://localhost:8080/api/properties/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });

      const data = await response.json();
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={styles.backButton}>
        <span style={styles.backIcon}>←</span>
        Back to Home
      </button>

      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>🏡 Properties</h1>
        <p style={styles.pageSubtitle}>
          Discover amazing properties that match your criteria
        </p>
      </div>

      <PropertyList properties={properties} loading={loading} />
    </div>
  );
}

// Main App Component
function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPostPropertyModalOpen, setIsPostPropertyModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handlePropertyPosted = () => {
    window.location.reload();
  };

  return (
    <Router>
      <div style={styles.app}>
        <Header
          onLoginClick={() => setIsLoginModalOpen(true)}
          onSignupClick={() => setIsSignupModalOpen(true)}
          onPostPropertyClick={() => setIsPostPropertyModalOpen(true)}
        />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
        </Routes>

        {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
        {isPostPropertyModalOpen && (
          <PostPropertyModal
            onClose={() => setIsPostPropertyModalOpen(false)}
            onPropertyPosted={handlePropertyPosted}
          />
        )}
        {isSignupModalOpen && <SignupModal onClose={() => setIsSignupModalOpen(false)} />}
      </div>
    </Router>
  );
}

const styles = {
  app: {
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderBottom: 'none',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(10px)',
  },
  headerContent: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '16px 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '28px',
    color: 'white',
    fontWeight: 800,
    cursor: 'pointer',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logoIcon: {
    fontSize: '32px',
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
  },
  nav: {
    display: 'flex',
    gap: '28px',
    alignItems: 'center',
  },
  navItem: {
    position: 'relative',
    cursor: 'pointer',
    padding: '12px 0',
    transition: 'all 0.3s ease',
  },
  navText: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'white',
    textShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: '-20px',
    backgroundColor: 'white',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    borderRadius: '16px',
    padding: '24px',
    marginTop: '12px',
    minWidth: '650px',
    display: 'flex',
    gap: '32px',
    zIndex: 1000,
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(20px)',
  },
  dropdownSection: {
    flex: 1,
  },
  dropdownTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#4f46e5',
    marginBottom: '16px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  dropdownItem: {
    padding: '10px 16px',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    color: '#475569',
    fontWeight: 500,
    marginBottom: '4px',
    ':hover': {
      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      color: 'white',
      transform: 'translateX(4px)',
    },
  },
  authSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255,255,255,0.1)',
    padding: '8px 16px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
  },
  userIcon: {
    fontSize: '18px',
  },
  userName: {
    fontWeight: 600,
    fontSize: '14px',
    color: 'white',
  },
  authButtons: {
    display: 'flex',
    gap: '12px',
  },
  btnIcon: {
    marginRight: '8px',
    fontSize: '16px',
  },
  postBtn: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
    },
  },
  logoutBtn: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    padding: '12px 20px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
    },
  },
  loginBtn: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)',
    },
  },
  signupBtn: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: 'white',
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(245, 158, 11, 0.4)',
    },
  },
  container: {
    padding: '32px',
    maxWidth: 1400,
    margin: '0 auto',
  },
  // In your App.jsx, replace the heroSection in styles with this:
  heroSection: {
    position: 'relative',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '24px',
    padding: '80px 60px',
    marginBottom: '48px',
    color: 'white',
    textAlign: 'center',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
    minHeight: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
  },
  mainTitle: {
    fontSize: '72px',
    margin: '0 0 24px',
    fontWeight: 800,
    lineHeight: 1.1,
    textShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  titleGradient: {
    background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '20px',
    marginBottom: '0',
    fontWeight: 500,
    opacity: 0.9,
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  heroGraphics: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  floatingElement1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    fontSize: '48px',
    animation: 'float 6s ease-in-out infinite',
  },
  floatingElement2: {
    position: 'absolute',
    top: '60%',
    right: '15%',
    fontSize: '64px',
    animation: 'float 8s ease-in-out infinite 1s',
  },
  floatingElement3: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    fontSize: '56px',
    animation: 'float 7s ease-in-out infinite 0.5s',
  },
  searchSection: {
    marginBottom: '60px',
  },
  section: {
    marginBottom: '60px',
  },
  propertiesSection: {
    marginBottom: '80px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '36px',
    marginBottom: '24px',
    fontWeight: 700,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sectionIcon: {
    fontSize: '32px',
  },
  areasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  areaButton: {
    padding: '20px 24px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    border: '2px solid #e2e8f0',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 600,
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: '#475569',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
      borderColor: '#667eea',
      color: '#667eea',
    },
  },
  areaEmoji: {
    fontSize: '24px',
  },
  clearSearchBtn: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(239, 68, 68, 0.3)',
    },
  },
  statsSection: {
    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    borderRadius: '24px',
    padding: '60px 40px',
    color: 'white',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '32px',
    textAlign: 'center',
  },
  statCard: {
    padding: '32px 24px',
  },
  statIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  statNumber: {
    fontSize: '36px',
    fontWeight: 800,
    marginBottom: '8px',
    background: 'linear-gradient(45deg, #fbbf24, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  statLabel: {
    fontSize: '16px',
    fontWeight: 500,
    opacity: 0.8,
  },
  backButton: {
    padding: '12px 24px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '32px',
    fontSize: '14px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(107, 114, 128, 0.3)',
    },
  },
  backIcon: {
    fontSize: '18px',
  },
  pageHeader: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  pageTitle: {
    fontSize: '48px',
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: '16px',
  },
  pageSubtitle: {
    fontSize: '18px',
    color: '#64748b',
    fontWeight: 500,
  },
};


const floatingAnimation = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = floatingAnimation;
  document.head.appendChild(styleSheet);
}

export default App;