import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import LoginModal from './LoginModal.jsx';
import PostPropertyModal from './PostPropertyModal.jsx';
import SignupModal from './SignupModal.jsx';
import PropertySearch from './components/PropertySearch';
import PropertyList from './components/PropertyList';
import { getFeaturedProperties } from './services/api';

function App() {
  const [propsList, setPropsList] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPostPropertyModalOpen, setIsPostPropertyModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  // NEW: Search state
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();

  const fetchProperties = async () => {
    try {
      const response = await getFeaturedProperties();
      if (response && response.success) {
        setPropsList(response.data);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Error loading featured properties:', error);
      // Fallback to old API
      fetch('http://localhost:8080/api/properties')
        .then(response => response.json())
        .then(data => setPropsList(data))
        .catch(err => console.error('Error with fallback:', err));
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const searchByCity = (city) => {
    fetch(`http://localhost:8080/api/properties/city/${encodeURIComponent(city)}`)
      .then(response => response.json())
      .then(data => setPropsList(data))
      .catch(error => console.error(`Error fetching properties for ${city}:`, error));
  };

  const onSearch = () => {
    if (!query.trim()) return;
    searchByCity(query);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    onSearch();
  };

  const handlePropertyPosted = (newProperty) => {
    fetchProperties();
  };

  // NEW: Search handlers
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

  return (
    <div style={{ fontFamily: 'Inter, system-ui, Arial', padding: 24, maxWidth: 1100, margin: '0 auto', color: '#111827' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ fontSize: 34, color: '#3b82f6', fontWeight: 700 }}>Visionary Homes</div>
        <nav style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <span>Buy</span>
          <span>Rent</span>
          <span>Sell</span>
          {isAuthenticated ? (
            <>
              <button
                onClick={() => setIsPostPropertyModalOpen(true)}
                style={{ background: '#28a745', color: 'white', padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 500 }}
              >
                Post Property
              </button>
              <span style={{ fontWeight: 600 }}>Welcome, {user?.firstName || 'User'}</span>
              <button onClick={logout} style={{ background: '#ef4444', color: 'white', padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setIsLoginModalOpen(true)} style={{ background: '#3b82f6', color: 'white', padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
                Login
              </button>
              <button onClick={() => setIsSignupModalOpen(true)} style={{ background: '#f59e0b', color: 'white', padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Sign Up
              </button>
            </div>
          )}
        </nav>
      </header>

      <h1 style={{ fontSize: 64, margin: '10px 0', fontWeight: 700 }}>Find your dream home</h1>

      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        <input
          placeholder="Search by city..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, padding: 18, borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 18 }}
        />
        <button type="submit" style={{ background: '#3b82f6', color: 'white', padding: '18px 24px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 18 }}>Search</button>
      </form>

      {/* NEW: Property Search Component */}
      <PropertySearch
        onSearchResults={handleSearchResults}
        onSearchStart={handleSearchStart}
        onReset={handleResetSearch}
      />

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>Popular locations</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Bangalore', 'Mumbai', 'Pune', 'Delhi', 'Hyderabad', 'Goa', 'Chennai'].map(location => (
            <button key={location} onClick={() => searchByCity(location)} style={{ padding: '14px 22px', borderRadius: 12, background: '#f3f4f6', border: 'none', cursor: 'pointer', fontSize: 16 }}>{location}</button>
          ))}
        </div>
      </section>

      {/* MODIFIED: Property List Section */}
      <section>
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>
          {showSearchResults
            ? `Search Results (${searchResults.length} found)`
            : 'Featured properties'}
        </h2>

        <PropertyList
          properties={showSearchResults ? searchResults : propsList}
          loading={searchLoading}
        />
      </section>

      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
      {isPostPropertyModalOpen && (
        <PostPropertyModal
          onClose={() => setIsPostPropertyModalOpen(false)}
          onPropertyPosted={handlePropertyPosted}
        />
      )}
      {isSignupModalOpen && <SignupModal onClose={() => setIsSignupModalOpen(false)} />}
    </div>
  );
}

export default App;