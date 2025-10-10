import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import LoginModal from './LoginModal.jsx';
import PostPropertyModal from './PostPropertyModal.jsx';
import SignupModal from './SignupModal.jsx';
import PropertySearch from './components/PropertySearch';
import PropertyList from './components/PropertyList';
import PropertyDetails from './components/PropertyDetails';
import PropertyTypePage from './components/PropertyTypePage';
import { getFeaturedProperties } from './services/api';

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
    setActiveDropdown(null);
    navigate(`/properties/${listingType}/${type.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div onClick={() => navigate('/')} style={styles.logo}>Visionary Homes</div>

        <nav style={styles.nav}>
          <div
            style={styles.navItem}
            onMouseEnter={() => setActiveDropdown('buy')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <span>Buy ▾</span>
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
            <span>Rent ▾</span>
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

          <span style={styles.navItem}>Sell</span>

          {isAuthenticated ? (
            <>
              <button onClick={onPostPropertyClick} style={styles.postBtn}>
                Post Property
              </button>
              <span style={styles.userName}>Welcome, {user?.firstName || 'User'}</span>
              <button onClick={logout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <div style={styles.authButtons}>
              <button onClick={onLoginClick} style={styles.loginBtn}>Login</button>
              <button onClick={onSignupClick} style={styles.signupBtn}>Sign Up</button>
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
    'Gachibowli', 'HITEC City', 'Madhapur', 'Kondapur',
    'Kukatpally', 'Miyapur', 'Jubilee Hills'
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
    navigate(`/area/${encodeURIComponent(area)}`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.mainTitle}>Find your dream home</h1>

      <PropertySearch
        onSearchResults={handleSearchResults}
        onSearchStart={handleSearchStart}
        onReset={handleResetSearch}
      />

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Popular Areas</h2>
        <div style={styles.areasGrid}>
          {popularAreas.map(area => (
            <button
              key={area}
              onClick={() => handleAreaClick(area)}
              style={styles.areaButton}
            >
              {area}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 style={styles.sectionTitle}>
          {showSearchResults
            ? `Search Results (${searchResults.length} found)`
            : 'Featured properties'}
        </h2>
        <PropertyList
          properties={showSearchResults ? searchResults : propsList}
          loading={searchLoading}
        />
      </section>
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
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/properties/:listingType/:propertyType" element={<PropertyTypePage />} />
          <Route path="/area/:areaName" element={<PropertyTypePage />} />
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
    fontFamily: 'Inter, system-ui, Arial',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    fontSize: 28,
    color: '#3b82f6',
    fontWeight: 700,
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    gap: 24,
    alignItems: 'center',
  },
  navItem: {
    position: 'relative',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 500,
    padding: '8px 0',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    backgroundColor: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    borderRadius: 8,
    padding: 20,
    marginTop: 8,
    minWidth: 600,
    display: 'flex',
    gap: 30,
    zIndex: 1000,
  },
  dropdownSection: {
    flex: 1,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 12,
    marginTop: 0,
  },
  dropdownItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: 4,
    fontSize: 14,
    transition: 'background 0.2s',
    color: '#374151',
  },
  postBtn: {
    background: '#28a745',
    color: 'white',
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
  },
  userName: {
    fontWeight: 600,
    fontSize: 14,
  },
  logoutBtn: {
    background: '#ef4444',
    color: 'white',
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
  },
  authButtons: {
    display: 'flex',
    gap: 12,
  },
  loginBtn: {
    background: '#3b82f6',
    color: 'white',
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
  },
  signupBtn: {
    background: '#f59e0b',
    color: 'white',
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 500,
  },
  container: {
    padding: 24,
    maxWidth: 1200,
    margin: '0 auto',
  },
  mainTitle: {
    fontSize: 56,
    margin: '20px 0 30px',
    fontWeight: 700,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: 600,
  },
  areasGrid: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
  },
  areaButton: {
    padding: '14px 24px',
    borderRadius: 12,
    background: '#f3f4f6',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 500,
    transition: 'all 0.3s',
  },
};

// Add CSS for hover effects
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .dropdown-item:hover {
      background-color: #f3f4f6 !important;
    }
    .area-button:hover {
      background-color: #e5e7eb !important;
      transform: translateY(-2px);
    }
  `;
  document.head.appendChild(style);
}

export default App;