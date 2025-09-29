import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import LoginModal from './LoginModal';
import PostPropertyModal from './PostPropertyModal'; // Import the new modal

function App() {
  const [propsList, setPropsList] = useState([]);
  const [query, setQuery] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPostPropertyModalOpen, setIsPostPropertyModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    fetch('http://localhost:8080/api/properties')
      .then(response => response.json())
      .then(data => setPropsList(data))
      .catch(error => console.error('Error fetching properties:', error));
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
    setPropsList(prevList => [newProperty, ...prevList]);
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
            <button onClick={() => setIsLoginModalOpen(true)} style={{ background: '#3b82f6', color: 'white', padding: '8px 14px', borderRadius: 10, border: 'none', cursor: 'pointer' }}>
              Login
            </button>
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

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>Popular locations</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {['Bangalore', 'Mumbai', 'Pune', 'Delhi', 'Hyderabad', 'Goa', 'Chennai'].map(location => (
            <button key={location} onClick={() => searchByCity(location)} style={{ padding: '14px 22px', borderRadius: 12, background: '#f3f4f6', border: 'none', cursor: 'pointer', fontSize: 16 }}>{location}</button>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>Featured properties</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {propsList.map(p => (
            <div key={p.id} style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
              <img
                src={p.imageUrl || 'https://via.placeholder.com/400x250'}
                alt={p.title}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 18, marginBottom: 8, fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{p.priceDisplay}</div>
                <div style={{ fontSize: 14, color: '#555', marginTop: 8 }}>
                    {`${p.type} • ${p.bedrooms} Beds • ${p.bathrooms} Baths`}
                </div>
                 {p.user && <div style={{fontSize: 14, color: '#333', marginTop: 8, fontWeight: 'bold'}}>{`Posted by: ${p.user.firstName} ${p.user.lastName}`}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
      {isPostPropertyModalOpen && (
        <PostPropertyModal
          onClose={() => setIsPostPropertyModalOpen(false)}
          onPropertyPosted={handlePropertyPosted}
        />
      )}
    </div>
  );
}

export default App;
