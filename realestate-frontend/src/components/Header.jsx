import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { styles } from '../styles.js';

function Header({ onLoginClick, onSignupClick, onPostPropertyClick, onProfileClick }) {
    const { isAuthenticated, user, logout } = useAuth();
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [unreadDeals, setUnreadDeals] = useState(0);
    const navigate = useNavigate();
    const dropdownTimerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (dropdownTimerRef.current) clearTimeout(dropdownTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated && user && (user.role === 'AGENT' || user.role === 'ADMIN')) {
            fetchUnreadDeals();
        }
    }, [isAuthenticated, user]);

    const fetchUnreadDeals = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/deals/agent/' + user.id, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            if (response.ok) {
                const data = await response.json();
                const deals = data.data || [];
                const unread = deals.filter(d => d.stage !== 'COMPLETED').length;
                setUnreadDeals(unread);
            }
        } catch (error) {
            console.log('Could not fetch deals count');
        }
    };

    const handleMyPropertiesClick = () => {
        navigate('/my-properties');
        setActiveDropdown(null);
    };

    const handleAgentDashboardClick = () => {
        navigate('/agent-dashboard');
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
                { label: 'Owner Properties', params: { listingType: 'sale', ownerType: 'owner' } },
                { label: 'Verified Properties', params: { listingType: 'sale', isVerified: true } },
                { label: 'Ready to Move', params: { listingType: 'sale', isReadyToMove: true } },
                { label: 'Broker Properties', params: { listingType: 'sale', ownerType: 'broker' } },
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
                    Your Destiny
                </div>
                <nav style={styles.nav}>
                    <div style={styles.navItem} onClick={() => navigate('/')}>
                        <span style={styles.navText}>Home</span>
                    </div>

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

                            {user && (user.role === 'AGENT' || user.role === 'ADMIN') && (
                                <button
                                    onClick={handleAgentDashboardClick}
                                    style={{
                                        color: 'white',
                                        backgroundColor: 'rgba(34, 197, 94, 0.3)',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        border: '2px solid #22c55e',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        position: 'relative'
                                    }}
                                >
                                    📊 Agent Dashboard
                                    {unreadDeals > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '-8px',
                                            right: '-8px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: '700'
                                        }}>
                                            {unreadDeals}
                                        </span>
                                    )}
                                </button>
                            )}

                            <button onClick={onPostPropertyClick} style={styles.postBtn}><span style={styles.btnIcon}>📝</span> Post Property</button>
                            <div style={{ position: 'relative', paddingBottom: '10px' }} onMouseEnter={() => setProfileDropdownOpen(true)} onMouseLeave={() => setProfileDropdownOpen(false)}>
                                <div style={styles.userSection} className="userSection">
                                    <span style={styles.userIcon}>👤</span>
                                    <span style={styles.userName}>{user?.firstName || 'User'} ▾</span>
                                    {user && (user.role === 'AGENT' || user.role === 'ADMIN') && (
                                        <span style={{fontSize: '12px', marginLeft: '8px', backgroundColor: 'rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: '4px'}}>
                                            {user.role === 'ADMIN' ? '⚙️ Admin' : '📊 Agent'}
                                        </span>
                                    )}
                                </div>
                                {isProfileDropdownOpen && (
                                    <div style={styles.profileDropdown}>
                                        <div style={styles.profileDropdownItem} onClick={() => { onProfileClick(); setProfileDropdownOpen(false); }}>View Profile</div>
                                        <div style={styles.profileDropdownItem} onClick={() => { navigate('/my-properties'); setProfileDropdownOpen(false); }}>My Properties</div>
                                        {user && (user.role === 'AGENT' || user.role === 'ADMIN') && (
                                            <div style={styles.profileDropdownItem} onClick={() => { navigate('/agent-dashboard'); setProfileDropdownOpen(false); }}>Agent Dashboard</div>
                                        )}
                                        {user && (user.role === 'USER') && (
                                            <div style={styles.profileDropdownItem} onClick={() => { navigate('/my-deals'); setProfileDropdownOpen(false); }}>My Deals</div>
                                        )}
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