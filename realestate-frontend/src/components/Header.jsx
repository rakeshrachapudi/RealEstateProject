import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

// Header Component with all features integrated
function Header({ onLoginClick, onSignupClick, onPostPropertyClick, onProfileClick }) {
  const { isAuthenticated, user, logout } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();

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
    navigate(`/search?${new URLSearchParams({ propertyType: type, listingType })}`);
    setActiveDropdown(null);
  };
  const handleBudgetClick = (budget, listingType) => {
    navigate(`/search?${new URLSearchParams({ minPrice: budget.min, maxPrice: budget.max, listingType })}`);
    setActiveDropdown(null);
  };
  const handleChoiceClick = (choice) => {
    navigate(`/search?${new URLSearchParams(choice.params)}`);
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
          <span style={styles.logoIcon}>🏡</span> Your Destiny
        </div>
        <nav style={styles.nav}>
          {/* Main Navigation Links */}
          <div style={styles.navItem} onClick={() => navigate('/')}>
             <span style={styles.navText}>Home</span>
          </div>
          <div style={styles.navItem} onMouseEnter={() => setActiveDropdown('buy')} onMouseLeave={() => setActiveDropdown(null)}>
            <span style={styles.navText}>Buy ▾</span>
            {activeDropdown === 'buy' && (
              <div style={styles.dropdown}>
                <div style={styles.dropdownSection}><h4 style={styles.dropdownTitle}>Popular Choices</h4>{dropdownData.buy.popularChoices.map(item => (<div key={item.label} style={styles.dropdownItem} onClick={() => handleChoiceClick(item)}>{item.label}</div>))}</div>
                <div style={styles.dropdownSection}><h4 style={styles.dropdownTitle}>Property Types</h4>{dropdownData.buy.propertyTypes.map(item => (<div key={item} style={styles.dropdownItem} onClick={() => handlePropertyTypeClick(item, 'sale')}>{item}</div>))}</div>
                <div style={styles.dropdownSection}><h4 style={styles.dropdownTitle}>Budget</h4>{dropdownData.buy.budget.map(item => (<div key={item.label} style={styles.dropdownItem} onClick={() => handleBudgetClick(item, 'sale')}>{item.label}</div>))}</div>
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
          {/* Auth Section with Profile Dropdown */}
          {isAuthenticated ? (
            <div style={styles.authSection}>
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

// Styles specific to the Header component
const styles = {
    header: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', position: 'sticky', top: 8, borderRadius:20, zIndex: 1000, boxShadow: '0 4px 20px rgba(0,0,0,1)' },
    headerContent: { maxWidth: 1400, margin: '0 auto', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: '28px', color: 'white', fontWeight: 800, cursor: 'pointer' },
    logoIcon: { fontSize: '32px' },
    nav: { display: 'flex', gap: '28px', alignItems: 'center' },
    navItem: { position: 'relative', cursor: 'pointer', padding: '12px 0' },
    navText: { fontSize: '16px', fontWeight: 600, color: 'white' },
    dropdown: { position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', borderRadius: '16px', padding: '24px', marginTop: '2px', minWidth: '650px', display: 'flex', gap: '32px', zIndex: 1000, maxWidth: 'calc(100vw - 48px)' },
    dropdownSection: { flex: 1 },
    dropdownTitle: { fontSize: '14px', fontWeight: 700, color: '#4f46e5', marginBottom: '16px', textTransform: 'uppercase' },
    dropdownItem: { padding: '10px 16px', cursor: 'pointer', borderRadius: '8px', fontSize: '14px', color: '#475569', fontWeight: 500, marginBottom: '4px' },
    authSection: { display: 'flex', alignItems: 'center', gap: '16px' },
    userSection: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '12px', cursor: 'pointer' },
    userIcon: { fontSize: '18px' },
    userName: { fontWeight: 600, fontSize: '14px', color: 'white' },
    authButtons: { display: 'flex', gap: '12px' },
    btnIcon: { marginRight: '8px', fontSize: '16px' },
    postBtn: { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center' },
    loginBtn: { background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center' },
    signupBtn: { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center' },
    profileDropdown: { position: 'absolute', top: '100%', right: 0, background: 'white', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 1010, width: '200px', overflow: 'hidden', paddingTop: '10px' },
    profileDropdownItem: { padding: '12px 16px', cursor: 'pointer', fontSize: '14px', color: '#475569', fontWeight: 500 },
};

export default Header;

