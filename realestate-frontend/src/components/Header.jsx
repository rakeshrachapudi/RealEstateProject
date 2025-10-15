// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { styles } from '../styles.js';

function Header({ onLoginClick, onSignupClick, onPostPropertyClick, onProfileClick }) {
    const { isAuthenticated, user, logout } = useAuth();
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
        };
    }, []);

    const handleMyPropertiesClick = () => {
        navigate('/my-properties');
        setActiveDropdown(null);
    };

    const handleMouseEnter = (dropdown) => {
        if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
        setActiveDropdown(dropdown);
    };

    const handleMouseLeave = () => {
        dropdownTimerRef.current = setTimeout(() => setActiveDropdown(null), 300);
    };

    const handleDropdownEnter = () => {
        if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
    };

    const handlePropertyTypeClick = (propertyTypeValue, listingType) => {
        const params = new URLSearchParams({ propertyType: propertyTypeValue, listingType });
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

    const dropdownData = {
        buy: {
            popularChoices: [
                { label: 'Owner Properties', params: { listingType: 'sale' } },
                { label: 'Verified Properties', params: { listingType: 'sale' } },
                { label: 'Ready to Move', params: { listingType: 'sale' } }
            ],
            propertyTypes: [
                { label: 'Apartments', value: 'Apartment' },
                { label: 'Villas', value: 'Villa' },
                { label: 'Houses', value: 'House' },
                { label: 'Plots', value: 'Plot' },
                { label: 'Commercial', value: 'Commercial' }
            ],
            budget: [
                { label: 'Under ₹50 Lac', min: 0, max: 5000000 },
                { label: '₹50 Lac - ₹1 Cr', min: 5000000, max: 10000000 },
                { label: '₹1 Cr - ₹2 Cr', min: 10000000, max: 20000000 },
                { label: 'Above ₹2 Cr', min: 20000000, max: 999999999 }
            ]
        },
        rent: {
            popularChoices: [
                { label: 'Owner Properties', params: { listingType: 'rent' } },
                { label: 'Verified Properties', params: { listingType: 'rent' } },
                { label: 'Furnished Homes', params: { listingType: 'rent' } },
                { label: 'Bachelor Friendly', params: { listingType: 'rent' } }
            ],
            propertyTypes: [
                { label: 'Apartments', value: 'Apartment' },
                { label: 'Houses', value: 'House' },
                { label: 'Villas', value: 'Villa' },
                { label: 'PG', value: 'PG' }
            ],
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

    return (
        <header style={styles.header}>
            <div style={styles.headerContent}>
                <div onClick={() => navigate('/')} style={styles.logo}>
                    <span style={styles.logoIcon}>🏡</span>
                    ZeroBrokerageHomes
                </div>
                <nav style={styles.nav}>
                    <div style={styles.navItem} onClick={() => navigate('/')}>
                        <span style={styles.navText}>Home</span>
                    </div>

                    {/* BUY */}
                    <div style={styles.navItem} onMouseEnter={() => handleMouseEnter('buy')} onMouseLeave={handleMouseLeave}>
                        <span style={styles.navText}>Buy ▾</span>
                        {activeDropdown === 'buy' && (
                            <div style={styles.dropdown} onMouseEnter={handleDropdownEnter} onMouseLeave={handleMouseLeave}>
                                <div style={styles.dropdownSection}>
                                    <h4 style={styles.dropdownTitle}>Popular Choices</h4>
                                    {dropdownData.buy.popularChoices.map(item => (
                                        <div key={item.label} style={styles.dropdownItem} onClick={() => handleChoiceClick(item)}>{item.label}</div>
                                    ))}
                                </div>
                                <div style={styles.dropdownSection}>
                                    <h4 style={styles.dropdownTitle}>Property Types</h4>
                                    {dropdownData.buy.propertyTypes.map(item => (
                                        <div key={item.value} style={styles.dropdownItem} onClick={() => handlePropertyTypeClick(item.value, 'sale')}>{item.label}</div>
                                    ))}
                                </div>
                                <div style={styles.dropdownSection}>
                                    <h4 style={styles.dropdownTitle}>Budget</h4>
                                    {dropdownData.buy.budget.map(item => (
                                        <div key={item.label} style={styles.dropdownItem} onClick={() => handleBudgetClick(item, 'sale')}>{item.label}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RENT */}
                    <div style={styles.navItem} onMouseEnter={() => handleMouseEnter('rent')} onMouseLeave={handleMouseLeave}>
                        <span style={styles.navText}>Rent ▾</span>
                        {activeDropdown === 'rent' && (
                            <div style={{...styles.dropdown, minWidth: '700px'}} onMouseEnter={handleDropdownEnter} onMouseLeave={handleMouseLeave}>
                                <div style={styles.dropdownSection}>
                                    <h4 style={styles.dropdownTitle}>Popular Choices</h4>
                                    {dropdownData.rent.popularChoices.map(item => (
                                        <div key={item.label} style={styles.dropdownItem} onClick={() => handleChoiceClick(item)}>{item.label}</div>
                                    ))}
                                </div>
                                <div style={styles.dropdownSection}>
                                    <h4 style={styles.dropdownTitle}>Property Types</h4>
                                    {dropdownData.rent.propertyTypes.map(item => (
                                        <div key={item.value} style={styles.dropdownItem} onClick={() => handlePropertyTypeClick(item.value, 'rent')}>{item.label}</div>
                                    ))}
                                </div>
                                <div style={styles.dropdownSection}>
                                    <h4 style={styles.dropdownTitle}>Budget</h4>
                                    {dropdownData.rent.budget.map(item => (
                                        <div key={item.label} style={styles.dropdownItem} onClick={() => handleBudgetClick(item, 'rent')}>{item.label}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SELL */}
                    <div style={styles.navItem} onMouseEnter={() => handleMouseEnter('sell')} onMouseLeave={handleMouseLeave}>
                        <span style={styles.navText}>Sell ▾</span>
                        {activeDropdown === 'sell' && (
                            <div style={{...styles.dropdown, minWidth: '300px', left: 'auto', right: 0, transform: 'none'}} onMouseEnter={handleDropdownEnter} onMouseLeave={handleMouseLeave}>
                                <div style={styles.dropdownSection}>
                                    {dropdownData.sell.actions.map(item => (
                                        <div key={item.label} style={styles.dropdownItem} onClick={() => handleSellItemClick(item)}>{item.label}</div>
                                    ))}
                                    {isAuthenticated && (
                                        <div style={styles.dropdownItem} onClick={() => handleSellItemClick(dropdownData.sell.dashboard)}>{dropdownData.sell.dashboard.label}</div>
                                    )}
                                    <hr style={{border: 0, borderTop: '1px solid #eee', margin: '12px 0'}} />
                                    <h4 style={styles.dropdownTitle}>Assistance</h4>
                                    {dropdownData.sell.assistance.map(item => (
                                        <div key={item.label} style={styles.dropdownItem} onClick={() => handleSellItemClick(item)}>{item.label}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {isAuthenticated ? (
                        <div style={styles.authSection}>
                            <button onClick={handleMyPropertiesClick} style={{color: 'white', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '12px 20px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px'}}>My Properties</button>
                            <button onClick={onPostPropertyClick} style={styles.postBtn}><span style={styles.btnIcon}>📝</span> Post Property</button>
                            <div style={{ position: 'relative', paddingBottom: '10px' }} onMouseEnter={() => setProfileDropdownOpen(true)} onMouseLeave={() => setProfileDropdownOpen(false)}>
                                <div style={styles.userSection} className="userSection">
                                    <span style={styles.userIcon}>👤</span>
                                    <span style={styles.userName}>{user?.firstName || 'User'} ▾</span>
                                </div>
                                {isProfileDropdownOpen && (
                                    <div style={styles.profileDropdown}>
                                        <div style={styles.profileDropdownItem} onClick={() => { onProfileClick(); setProfileDropdownOpen(false); }}>View Profile</div>
                                        <div style={styles.profileDropdownItem} onClick={() => { navigate('/my-properties'); setProfileDropdownOpen(false); }}>My Properties</div>
                                        <div style={{...styles.profileDropdownItem, color: '#dc3545'}} onClick={logout}>Logout</div>
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

export default Header;