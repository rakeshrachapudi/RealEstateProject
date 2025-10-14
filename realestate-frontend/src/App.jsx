// realestate-frontend/src/App.jsx
// ⭐ COMPLETE FIXED VERSION - Replace entire file
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import LoginModal from './LoginModal.jsx';
import PostPropertyModal from './PostPropertyModal.jsx';
import SignupModal from './SignupModal.jsx';
import PropertySearch from './components/PropertySearch';
import PropertyList from './components/PropertyList';
import PropertyDetails from './components/PropertyDetails';
import { getFeaturedProperties } from './services/api';
import UserProfileModal from './UserProfileModal.jsx';

// ============================================
// HEADER COMPONENT
// ============================================
function Header({ onLoginClick, onSignupClick, onPostPropertyClick, onProfileClick }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  const handleMyPropertiesClick = () => {
    navigate('/my-properties');
    setActiveDropdown(null);
  };

  const dropdownData = {
    buy: {
      popularChoices: [
        { label: 'Owner Properties', params: { listingType: 'sale', ownerType: 'owner' } },
        { label: 'Verified Properties', params: { listingType: 'sale', verified: true } },
        { label: 'Ready to Move', params: { listingType: 'sale', status: 'ready' } }
      ],
      propertyTypes: ['Apartments', 'Independent Houses', 'Villas', 'Plots'],
      budget: [
        { label: 'Under ₹50 Lac', min: 0, max: 5000000 },
        { label: '₹50 Lac - ₹1 Cr', min: 5000000, max: 10000000 },
        { label: '₹1 Cr - ₹2 Cr', min: 10000000, max: 20000000 },
        { label: 'Above ₹2 Cr', min: 20000000, max: 999999999 }
      ]
    },
    rent: {
      popularChoices: [
        { label: 'Owner Properties', params: { listingType: 'rent', ownerType: 'owner' } },
        { label: 'Verified Properties', params: { listingType: 'rent', verified: true } },
        { label: 'Furnished Homes', params: { listingType: 'rent', furnishing: 'furnished' } },
        { label: 'Bachelor Friendly', params: { listingType: 'rent', bachelors: true } }
      ],
      propertyTypes: ['Apartments', 'Independent Houses', 'Villas', 'PG', 'Flatmates'],
      budget: [
        { label: 'Under ₹10,000', min: 0, max: 10000 },
        { label: '₹10,000 - ₹20,000', min: 10000, max: 20000 },
        { label: '₹20,000 - ₹40,000', min: 20000, max: 40000 },
        { label: 'Above ₹40,000', min: 40000, max: 999999 }
      ]
    },
    sell: {
        actions: [
            { label: 'Post Free Property Ad', type: 'action', key: 'postProperty' },
            { label: 'Owner Plans', type: 'navigate', path: '/owner-plans' },
        ],
        dashboard: { label: 'My Properties', type: 'navigate', path: '/my-properties' },
        assistance: [
            { label: 'Rental Agreement', type: 'navigate', path: '/rental-agreement' },
            { label: 'Home Interior/Renovation', type: 'navigate', path: '/home-renovation' },
        ]
    }
  };

  const handlePropertyTypeClick = (type, listingType) => {
    const params = new URLSearchParams({ propertyType: type, listingType });
    navigate(`/search?${params.toString()}`);
    setActiveDropdown(null);
  };
  const handleBudgetClick = (budget, listingType) => {
    const params = new URLSearchParams({ minPrice: budget.min, maxPrice: budget.max, listingType });
    navigate(`/search?${params.toString()}`);
    setActiveDropdown(null);
  };
  const handleChoiceClick = (choice) => {
    const params = new URLSearchParams(choice.params || {});
    navigate(`/search?${params.toString()}`);
    setActiveDropdown(null);
  };
  const handleSellItemClick = (item) => {
      if (item.type === 'navigate') navigate(item.path);
      else if (item.type === 'action' && item.key === 'postProperty') onPostPropertyClick();
      setActiveDropdown(null);
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div onClick={() => navigate('/')} style={styles.logo}>
          <span style={styles.logoIcon}>🏡</span>
           Your Destiny
            </div>
        <nav style={styles.nav}>
          <div style={styles.navItem} onClick={() => navigate('/')}>
             <span style={styles.navText}>Home</span>
          </div>
          <div style={styles.navItem} onMouseEnter={() => setActiveDropdown('buy')} onMouseLeave={() => setActiveDropdown(null)}>
            <span style={styles.navText}>Buy ▾</span>
            {activeDropdown === 'buy' && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownSection}>
                  <h4 style={styles.dropdownTitle}>Popular Choices</h4>
                  {dropdownData.buy.popularChoices.map(item => (
                    <div key={item.label} style={styles.dropdownItem} onClick={() => handleChoiceClick(item)}>
                      {item.label}
                    </div>
                  ))}
                </div>
                <div style={styles.dropdownSection}>
                  <h4 style={styles.dropdownTitle}>Property Types</h4>
                  {dropdownData.buy.propertyTypes.map(item => (
                    <div key={item} style={styles.dropdownItem} onClick={() => handlePropertyTypeClick(item, 'sale')}>
                      {item}
                    </div>
                  ))}
                </div>
                <div style={styles.dropdownSection}>
                  <h4 style={styles.dropdownTitle}>Budget</h4>
                  {dropdownData.buy.budget.map(item => (
                    <div key={item.label} style={styles.dropdownItem} onClick={() => handleBudgetClick(item, 'sale')}>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={styles.navItem} onMouseEnter={() => setActiveDropdown('rent')} onMouseLeave={() => setActiveDropdown(null)}>
            <span style={styles.navText}>Rent ▾</span>
            {activeDropdown === 'rent' && (
              <div style={{...styles.dropdown, minWidth: '700px'}}>
                <div style={styles.dropdownSection}><h4 style={styles.dropdownTitle}>Popular Choices</h4>{dropdownData.rent.popularChoices.map(item => (<div key={item.label} style={styles.dropdownItem} onClick={() => handleChoiceClick(item)}>{item.label}</div>))}</div>
                <div style={styles.dropdownSection}><h4 style={styles.dropdownTitle}>Property Types</h4>{dropdownData.rent.propertyTypes.map(item => (<div key={item} style={styles.dropdownItem} onClick={() => handlePropertyTypeClick(item, 'rent')}>{item}</div>))}</div>
                <div style={styles.dropdownSection}><h4 style={styles.dropdownTitle}>Budget</h4>{dropdownData.rent.budget.map(item => (<div key={item.label} style={styles.dropdownItem} onClick={() => handleBudgetClick(item, 'rent')}>{item.label}</div>))}</div>
              </div>
            )}
          </div>
          <div style={styles.navItem} onMouseEnter={() => setActiveDropdown('sell')} onMouseLeave={() => setActiveDropdown(null)}>
            <span style={styles.navText}>Sell ▾</span>
            {activeDropdown === 'sell' && (
              <div style={{...styles.dropdown, minWidth: '300px', left: 'auto', right: 0, transform: 'none'}}>
                <div style={styles.dropdownSection}>
                  {dropdownData.sell.actions.map(item => (<div key={item.label} style={styles.dropdownItem} onClick={() => handleSellItemClick(item)}>{item.label}</div>))}
                  {isAuthenticated && (<div key={dropdownData.sell.dashboard.label} style={styles.dropdownItem} onClick={() => handleSellItemClick(dropdownData.sell.dashboard)}>{dropdownData.sell.dashboard.label}</div>)}
                  <hr style={{border: 0, borderTop: '1px solid #eee', margin: '12px 0'}} />
                  <h4 style={styles.dropdownTitle}>Assistance</h4>
                  {dropdownData.sell.assistance.map(item => (<div key={item.label} style={styles.dropdownItem} onClick={() => handleSellItemClick(item)}>{item.label}</div>))}
                </div>
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div style={styles.authSection}>
              <button
                onClick={handleMyPropertiesClick}
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)', // Subtle background for tab look
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background-color 0.2s',
                }}
              >
                My Properties
              </button>
              <button onClick={onPostPropertyClick} style={styles.postBtn}><span style={styles.btnIcon}>📝</span> Post Property</button>
              <div style={{ position: 'relative', paddingBottom: '10px' }} onMouseEnter={() => setProfileDropdownOpen(true)} onMouseLeave={() => setProfileDropdownOpen(false)}>
                <div style={styles.userSection} className="userSection">
                    <span style={styles.userIcon}>👤</span>
                    <span style={styles.userName}>{user?.firstName || 'User'} ▾</span>
                </div>
                {isProfileDropdownOpen && (
                    <div style={styles.profileDropdown}>
                        <div style={styles.profileDropdownItem} onClick={() => { onProfileClick(); setProfileDropdownOpen(false); }}> View Profile </div>
                        <div style={styles.profileDropdownItem} onClick={() => { navigate('/my-properties'); setProfileDropdownOpen(false); }}> My Properties </div>
                        <div style={{...styles.profileDropdownItem, color: '#dc3545'}} onClick={logout}> Logout </div>
                    </div>
                )}
              </div>
            </div>
          ) : (
            <div style={styles.authButtons}>
              <button onClick={onLoginClick} style={styles.loginBtn}><span style={styles.btnIcon}>🔑</span> Login</button>
              <button onClick={onSignupClick} style={styles.signupBtn}><span style={styles.btnIcon}>✨</span> Sign Up</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

// ============================================
// HOME PAGE COMPONENT
// ============================================
function HomePage() {
    const { isAuthenticated, user } = useAuth();
  const [propsList, setPropsList] = useState([]);
  const [myProperties, setMyProperties] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('featured');
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
    if (isAuthenticated && user?.id) {
          fetchMyProperties();
    }
  },[isAuthenticated, user]);

  const fetchProperties = async () => {
    try {
      const response = await getFeaturedProperties();
      if (response && response.success) {
        let properties = response.data;
        if (isAuthenticated && user?.id) {
          properties = properties.sort((a, b) => {
            const aIsUser = a.user?.id === user.id;
            const bIsUser = b.user?.id === user.id;
            if (aIsUser && !bIsUser) return -1;
            if (!aIsUser && bIsUser) return 1;
            return 0;
          });
        }
        setPropsList(properties);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

 const fetchMyProperties = async () => {
    if (!user?.id) {
        console.log('❌ No user ID for fetching properties');
        return;
    }
    try {
      console.log('📥 Fetching my properties for user ID:', user.id);
      const response = await fetch(`http://localhost:8080/api/properties/user/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ My properties data:', data);
        const propertiesArray = Array.isArray(data) ? data : (data.data || []);
        console.log(`✅ Setting ${propertiesArray.length} properties`);
        setMyProperties(propertiesArray);
      } else {
        console.log('❌ Failed to fetch my properties:', response.status);
      }
    } catch (error) {
      console.error('Error loading my properties:', error);
    }
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setShowSearchResults(true);
    setSearchLoading(false);
    setActiveTab('featured');
  };

  const handleSearchStart = () => {
    setSearchLoading(true);
  };

  const handleResetSearch = () => {
    setShowSearchResults(false);
    setSearchResults([]);
    setActiveTab('featured');
    fetchProperties();
  };

  const handleAreaClick = (area) => {
    navigate(`/search?area=${encodeURIComponent(area)}`);
  };

  return (
    <div style={styles.container}>
      <section style={styles.heroSection}>
        <div style={styles.heroContent}>
          <h1 style={styles.mainTitle}>
            Find Your <span style={styles.titleGradient}> Dream Home </span> 🏡
          </h1>
          <p style={styles.heroSubtitle}>
            Discover the perfect property that matches your lifestyle and budget.
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
          <span style={styles.sectionIcon}>📍</span> Popular Areas in Hyderabad
        </h2>
        <div style={styles.areasGrid}>
          {popularAreas.map(area => (
            <button
              key={area.name}
              onClick={() => handleAreaClick(area.name)}
              style={styles.areaButton}
              className="areaButton"
            >
              <span style={styles.areaEmoji}>{area.emoji}</span>
              {area.name}
            </button>
          ))}
        </div>
      </section>

      <section style={styles.propertiesSection}>
           {isAuthenticated && myProperties.length > 0 && !showSearchResults && (
                    <div style={styles.tabContainer}>
                      <button
                        onClick={() => setActiveTab('featured')}
                        style={{
                          ...styles.tab,
                          ...(activeTab === 'featured' ? styles.activeTab : {})
                        }}
                      >
                        ⭐ Featured Properties
                      </button>
                      <button
                        onClick={() => setActiveTab('my-properties')}
                        style={{
                          ...styles.tab,
                          ...(activeTab === 'my-properties' ? styles.activeTab : {})
                        }}
                      >
                        📁 My Uploaded Properties ({myProperties.length})
                      </button>
                    </div>
                  )}

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>
             <span style={styles.sectionIcon}>
                          {showSearchResults ? '🔍' : activeTab === 'my-properties' ? '📁' : '⭐'}
                        </span>
                        {showSearchResults
                          ? `Search Results (${searchResults.length} found)`
                          : activeTab === 'my-properties'
                          ? 'My Uploaded Properties'
                          : 'Featured Properties'}
          </h2>
          {showSearchResults && (
            <button onClick={handleResetSearch} style={styles.clearSearchBtn}>
              ✕ Clear Search
            </button>
          )}
        </div>
                {activeTab === 'my-properties' && !showSearchResults ? (
                  myProperties.length > 0 ? (
        <PropertyList
          properties={myProperties}
          loading={searchLoading}
        />
        ):(
<div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <h3 style={styles.emptyTitle}>No Properties Posted Yet</h3>
              <p style={styles.emptyText}>
                Start by posting your first property to see it here
              </p>
            </div>
          )
        ) : (
          <PropertyList
            properties={showSearchResults ? searchResults : propsList}
            loading={searchLoading}
          />
        )}
    </section>

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

// ============================================
// SEARCH RESULTS PAGE COMPONENT
// ============================================
function SearchResultsPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParams = Object.fromEntries(params.entries());
    fetchFilteredProperties(searchParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.location.search]);

  const fetchFilteredProperties = async (searchParams) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/properties/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
      });
      const data = await response.json();
      if (data.success) {
        setProperties(data.data || []);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

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
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={styles.backButton}>
        <span style={styles.backIcon}>←</span> Back to Home
      </button>

      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>{getPageTitle()}</h1>
        <p style={styles.pageSubtitle}>
          {loading ? 'Searching...' : `${properties.length} properties found`}
        </p>
      </div>

      <PropertyList properties={properties} loading={loading} />
    </div>
  );
}

// ============================================
// MY PROPERTIES PAGE COMPONENT
// ============================================
function MyPropertiesPage({ onPostPropertyClick }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.id) {
      console.log('❌ No user ID, redirecting to home');
      navigate('/');
      return;
    }
    fetchMyProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const fetchMyProperties = async () => {
    if (!user?.id) {
      console.log('❌ Cannot fetch: No user ID');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    console.log('📥 Fetching properties for user ID:', user.id);

    try {
      const response = await fetch(`http://localhost:8080/api/properties/user/${user.id}`);

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Received data:', data);

      const propertiesArray = Array.isArray(data) ? data : (data.data || []);

      console.log(`✅ Found ${propertiesArray.length} properties for user`);
      setProperties(propertiesArray);

    } catch (err) {
      console.error('❌ Error fetching user properties:', err);
      setError(err.message);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}>⏳</div>
          <h3>Loading your properties...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <h2>❌ Error Loading Properties</h2>
          <p>{error}</p>
          <button onClick={fetchMyProperties} style={styles.retryBtn}>
            Try Again
          </button>
        </div>
        </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageTitle}>📁 My Posted Properties</h1>
        <p style={styles.pageSubtitle}>
          Manage and track the properties you've listed
        </p>
      </div>

      {properties.length > 0 ? (
        <>
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Total Properties:</span>
              <span style={styles.statValue}>{properties.length}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>For Sale:</span>
              <span style={styles.statValue}>
                {properties.filter(p => p.listingType === 'sale').length}
              </span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>For Rent:</span>
              <span style={styles.statValue}>
                {properties.filter(p => p.listingType === 'rent').length}
              </span>
            </div>
          </div>

          <PropertyList properties={properties} loading={false} />
        </>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No Properties Posted Yet</h3>
          <p style={styles.emptyText}>
            Start by posting your first property to see it here
          </p>
          <button onClick={onPostPropertyClick} style={styles.postBtn}>
            <span style={styles.btnIcon}>📝</span> Post Your First Property
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// PLACEHOLDER PAGE
// ============================================
const PlaceholderPage = ({ title }) => (
    <div style={{...styles.container, textAlign: 'center', padding: '80px 32px'}}>
        <h1 style={styles.pageTitle}>{title}</h1>
        <p style={styles.pageSubtitle}>This page is currently under construction. 🏗️ Please check back later!</p>
    </div>
);

// ============================================
// APP CONTENT
// ============================================
function AppContent() {
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPostPropertyModalOpen, setIsPostPropertyModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

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
  return ( <Router> <AppContent /> </Router> );
}

// ============================================
// STYLES
// ============================================
const styles = {
    pageSubtitle: {
        fontSize: '18px',
        color: '#64748b',
        fontWeight: 500,
    },
    viewMoreContainer: {
        textAlign: 'center',
        marginTop: '32px'
    },
    viewMoreBtn: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '14px 28px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '16px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s'
    },
    profileDropdown: {
        position: 'absolute',
        top: '100%',
        right: 0,
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        zIndex: 1010,
        width: '200px',
        overflow: 'hidden',
        paddingTop: '10px'
    },
    profileDropdownItem: {
        padding: '12px 16px',
        cursor: 'pointer',
        fontSize: '14px',
        color: '#475569',
        fontWeight: 500
    },
    noPropertiesContainer: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '16px',
        border: '2px dashed #e2e8f0'
    },
    noPropertiesText: {
        fontSize: '18px',
        color: '#64748b',
        marginBottom: '24px'
    },
    app: {
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
    },
    header: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'sticky',
        top: 8,
        borderRadius:20,
        zIndex: 1000,
        boxShadow: '0 4px 20px rgba(0,0,0,1)',
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
    },
    logoIcon: {
        fontSize: '32px',
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
    },
    navText: {
        fontSize: '16px',
        fontWeight: 600,
        color: 'white',
    },
    dropdown: {
        position: 'absolute',
        top: '100%',
        left: '-50px',
        backgroundColor: 'white',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '2px',
        minWidth: '650px',
        display: 'flex',
        gap: '32px',
        zIndex: 1000,
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
    },
    dropdownItem: {
        padding: '10px 16px',
        cursor: 'pointer',
        borderRadius: '8px',
        fontSize: '14px',
        color: '#475569',
        fontWeight: 500,
        marginBottom: '4px',
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
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    loginBtn: {
        backgroundColor: 'transparent',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '12px',
        border: '2px solid rgba(255,255,255,0.3)',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.2s, border-color 0.2s',
    },
    signupBtn: {
        background: 'white',
        color: '#667eea',
        padding: '12px 20px',
        borderRadius: '12px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
    },
    container: {
        maxWidth: 1400,
        margin: '0 auto',
        padding: '24px 32px',
        minHeight: '80vh',
    },
    heroSection: {
        backgroundColor: '#e0f2fe',
        padding: '60px 40px',
        borderRadius: '24px',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    heroContent: {
        maxWidth: '60%',
        zIndex: 2,
    },
    mainTitle: {
        fontSize: '48px',
        fontWeight: 800,
        color: '#1e293b',
        marginBottom: '16px',
    },
    titleGradient: {
        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    heroSubtitle: {
        fontSize: '20px',
        color: '#475569',
    },
    heroGraphics: {
        position: 'absolute',
        right: '50px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '300px',
        height: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingElement1: {
        position: 'absolute',
        fontSize: '50px',
        top: '10%',
        left: '10%',
        animation: 'float 6s ease-in-out infinite',
    },
    floatingElement2: {
        position: 'absolute',
        fontSize: '80px',
        top: '40%',
        right: '10%',
        animation: 'float 7s ease-in-out infinite 1s',
    },
    floatingElement3: {
        position: 'absolute',
        fontSize: '40px',
        bottom: '15%',
        left: '30%',
        animation: 'float 5s ease-in-out infinite 2s',
    },
    searchSection: {
        marginTop: '-100px',
        marginBottom: '60px',
        zIndex: 10,
        position: 'relative',
    },
    section: {
        marginBottom: '60px',
    },
    sectionTitle: {
        fontSize: '28px',
        fontWeight: 700,
        color: '#1e293b',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
    },
    sectionIcon: {
        marginRight: '12px',
        fontSize: '28px',
    },
    areasGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
    },
    areaButton: {
        backgroundColor: 'white',
        color: '#334155',
        padding: '12px 24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        fontWeight: 600,
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
    },
    areaEmoji: {
        fontSize: '18px',
    },
    propertiesSection: {
        marginBottom: '60px',
        paddingTop: '20px',
    },
    tabContainer: {
        display: 'flex',
        marginBottom: '20px',
        borderBottom: '2px solid #e2e8f0',
    },
    tab: {
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: 'pointer',
        border: 'none',
        backgroundColor: 'transparent',
        color: '#64748b',
        borderBottom: '3px solid transparent',
        transition: 'color 0.2s',
    },
    activeTab: {
        color: '#667eea',
        borderBottom: '3px solid #667eea',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
    },
    clearSearchBtn: {
        backgroundColor: '#f1f5f9',
        color: '#475569',
        padding: '8px 16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 500,
        fontSize: '14px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '2px dashed #cbd5e1',
        marginTop: '32px',
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    emptyTitle: {
        fontSize: '24px',
        fontWeight: 700,
        color: '#1e293b',
        marginBottom: '8px',
    },
    emptyText: {
        fontSize: '16px',
        color: '#64748b',
        marginBottom: '24px',
    },
    statsSection: {
        padding: '40px 0',
        backgroundColor: '#f1f5f9',
        borderRadius: '24px',
        marginBottom: '40px',
    },
    statsGrid: {
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '32px',
    },
    statCard: {
        textAlign: 'center',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '16px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
    },
    statIcon: {
        fontSize: '36px',
        marginBottom: '12px',
    },
    statNumber: {
        fontSize: '32px',
        fontWeight: 800,
        color: '#667eea',
        marginBottom: '4px',
    },
    // SearchResultsPage / MyPropertiesPage utility styles
    backButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#4f46e5',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 600,
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        transition: 'opacity 0.2s',
    },
    backIcon: {
        marginRight: '8px',
    },
    pageHeader: {
        marginBottom: '32px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '16px',
    },
    pageTitle: {
        fontSize: '36px',
        fontWeight: 800,
        color: '#1e293b',
        marginBottom: '8px',
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '16px',
        marginTop: '32px',
    },
    spinner: {
        fontSize: '48px',
        marginBottom: '16px',
    },
    errorContainer: {
        textAlign: 'center',
        padding: '60px 20px',
        backgroundColor: '#fee2e2',
        borderRadius: '16px',
        border: '2px solid #f87171',
        color: '#dc2626',
        marginTop: '32px',
    },
    retryBtn: {
        marginTop: '20px',
        backgroundColor: '#dc2626',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'background-color 0.2s',
    },
    statsBar: {
        display: 'flex',
        gap: '24px',
        marginBottom: '32px',
        padding: '24px',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        border: '2px solid #e2e8f0',
    },
    statItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    statLabel: {
        fontSize: '14px',
        color: '#64748b',
        fontWeight: 500,
    },
    statValue: {
        fontSize: '24px',
        fontWeight: 700,
        color: '#1e293b',
    },
};

// Inject animations and hover effects into the document
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }

  .areaButton:hover {
    transform: translateY(-4px);
    border-color: #667eea;
    color: #667eea;
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.15);
  }

  div[style*="dropdownItem"]:hover {
    background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
    color: #4f46e5;
  }

  .userSection:hover {
    cursor: pointer;
    background: rgba(255, 255, 255, 0.25) !important;
  }
`;
document.head.appendChild(styleSheet);

export default App;