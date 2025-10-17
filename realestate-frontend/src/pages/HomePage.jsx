
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import PropertySearch from '../components/PropertySearch';
import PropertyList from '../components/PropertyList';
import DealsDashboard from '../components/DealsDashboard';
import { getFeaturedProperties } from '../services/api';
import { styles } from '../styles.js';
import BrowsePropertiesForDeal from '../pages/BrowsePropertiesForDeal';

function HomePage() {
    const { isAuthenticated, user } = useAuth();
    const [propsList, setPropsList] = useState([]);
    const [myProperties, setMyProperties] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('featured');
    const [showBrowseDeals, setShowBrowseDeals] = useState(false);
    const navigate = useNavigate();

    // 🔍 DEBUG: Log state changes
    useEffect(() => {
        console.log('========== HOMEPAGE STATE CHANGED ==========');
        console.log('activeTab:', activeTab);
        console.log('isAuthenticated:', isAuthenticated);
        console.log('user:', user);
        console.log('user?.role:', user?.role);
        console.log('showBrowseDeals:', showBrowseDeals);
        console.log('Button should be visible?',
            activeTab === 'deals' &&
            isAuthenticated &&
            user &&
            (user.role === 'AGENT' || user.role === 'ADMIN')
        );
        console.log('==========================================');
    }, [activeTab, isAuthenticated, user, showBrowseDeals]);

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
    }, [isAuthenticated, user]);

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
        const urlArea = area.name.toLowerCase().replace(/\s+/g, '-');
        navigate(`/area/${urlArea}`);
    };

    const handlePropertyUpdated = () => {
        console.log('🔄 Property updated, refreshing lists...');
        fetchProperties();
        if (isAuthenticated && user?.id) {
            fetchMyProperties();
        }
    };

    const handlePropertyDeleted = () => {
        console.log('🔄 Property deleted, refreshing lists...');
        fetchProperties();
        if (isAuthenticated && user?.id) {
            fetchMyProperties();
        }
    };

    // 🔍 DEBUG: Enhanced click handler
    const handleCreateDealClick = () => {
        console.log('========== CREATE DEAL BUTTON CLICKED ==========');
        console.log('Timestamp:', new Date().toLocaleTimeString());
        console.log('activeTab:', activeTab);
        console.log('isAuthenticated:', isAuthenticated);
        console.log('user:', user);
        console.log('user?.id:', user?.id);
        console.log('user?.role:', user?.role);
        console.log('Is Agent/Admin?', user?.role === 'AGENT' || user?.role === 'ADMIN');
        console.log('Current showBrowseDeals:', showBrowseDeals);
        console.log('About to call setShowBrowseDeals(true)');

        setShowBrowseDeals(true);

        console.log('✅ setShowBrowseDeals(true) called');
        console.log('============================================');
    };

    const buttonShouldBeVisible =
        activeTab === 'deals' &&
        isAuthenticated &&
        user &&
        (user.role === 'AGENT' || user.role === 'ADMIN');

    console.log('🔍 DEBUG: Button should be visible?', buttonShouldBeVisible);
    console.log('  - activeTab === "deals"?', activeTab === 'deals');
    console.log('  - isAuthenticated?', isAuthenticated);
    console.log('  - user exists?', !!user);
    console.log('  - user.role is AGENT/ADMIN?', user?.role === 'AGENT' || user?.role === 'ADMIN');

    return (
        <div style={styles.container}>
            {/* DEBUG BOX - Remove after fixing */}
            <div style={{
                position: 'fixed',
                top: 100,
                right: 10,
                backgroundColor: '#1e293b',
                color: '#10b981',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '11px',
                maxWidth: '380px',
                zIndex: 9999,
                border: '2px solid #10b981',
                fontFamily: 'monospace',
                lineHeight: '1.5',
                maxHeight: '300px',
                overflowY: 'auto'
            }}>
                <div style={{fontWeight: 'bold', marginBottom: '8px', fontSize: '12px'}}>🔍 DEBUG INFO</div>
                <div>Tab: <span style={{color: '#fbbf24'}}>{activeTab}</span></div>
                <div>Auth: <span style={{color: '#fbbf24'}}>{isAuthenticated ? '✅' : '❌'}</span></div>
                <div>User: <span style={{color: '#fbbf24'}}>{user?.firstName || 'NONE'}</span></div>
                <div>Role: <span style={{color: '#fbbf24'}}>{user?.role || 'NONE'}</span></div>
                <div>Modal: <span style={{color: '#fbbf24'}}>{showBrowseDeals ? '✅ OPEN' : '❌ CLOSED'}</span></div>
                <div>Btn Visible: <span style={{color: buttonShouldBeVisible ? '#10b981' : '#ef4444'}}>
                    {buttonShouldBeVisible ? '✅ YES' : '❌ NO'}
                </span></div>
                <button
                    onClick={() => {
                        console.clear();
                        console.log('=== FULL STATE LOG ===');
                        console.log({activeTab, isAuthenticated, user, showBrowseDeals});
                    }}
                    style={{
                        marginTop: '8px',
                        padding: '4px 8px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        backgroundColor: '#10b981',
                        color: '#1e293b',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Log State
                </button>
                <button
                    onClick={() => setShowBrowseDeals(!showBrowseDeals)}
                    style={{
                        marginTop: '8px',
                        marginLeft: '8px',
                        padding: '4px 8px',
                        fontSize: '10px',
                        cursor: 'pointer',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px'
                    }}
                >
                    Toggle Modal
                </button>
            </div>

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
                            onClick={() => handleAreaClick(area)}
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
                {isAuthenticated && !showSearchResults && (
                    <div style={styles.tabContainer}>
                        <button
                            onClick={() => {
                                console.log('📊 Switching to Featured tab');
                                setActiveTab('featured');
                            }}
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'featured' ? styles.activeTab : {})
                            }}
                        >
                            ⭐ Featured Properties
                        </button>
                        {myProperties.length > 0 && (
                            <button
                                onClick={() => {
                                    console.log('📁 Switching to My Properties tab');
                                    setActiveTab('my-properties');
                                }}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'my-properties' ? styles.activeTab : {})
                                }}
                            >
                                📁 My Uploaded Properties ({myProperties.length})
                            </button>
                        )}
                        <button
                            onClick={() => {
                                console.log('📊 Switching to Deals tab');
                                setActiveTab('deals');
                            }}
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'deals' ? styles.activeTab : {})
                            }}
                        >
                            📊 My Deals
                        </button>
                    </div>
                )}

                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        <span style={styles.sectionIcon}>
                            {showSearchResults ? '🔍' : activeTab === 'my-properties' ? '📁' : activeTab === 'deals' ? '📊' : '⭐'}
                        </span>
                        {showSearchResults
                            ? `Search Results (${searchResults.length} found)`
                            : activeTab === 'my-properties'
                                ? 'My Uploaded Properties'
                                : activeTab === 'deals'
                                    ? 'My Deals'
                                    : 'Featured Properties'}
                    </h2>
                    {showSearchResults && (
                        <button onClick={handleResetSearch} style={styles.clearSearchBtn}>
                            ✕ Clear Search
                        </button>
                    )}

                    {/* ✅ CREATE DEAL BUTTON - WITH DEBUG */}
                    {buttonShouldBeVisible ? (
                        <button
                            onClick={handleCreateDealClick}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '700',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background 0.2s, transform 0.2s',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#059669';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#10b981';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            ➕ Create New Deal
                        </button>
                    ) : (
                        <div style={{padding: '8px 16px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#dc2626', fontSize: '12px'}}>
                            ❌ Button not visible: activeTab={activeTab}, auth={isAuthenticated}, role={user?.role}
                        </div>
                    )}
                </div>

                {/* ✅ RENDER DIFFERENT CONTENT BASED ON ACTIVE TAB */}
                {activeTab === 'deals' ? (
                    <DealsDashboard />
                ) : activeTab === 'my-properties' ? (
                    myProperties.length > 0 ? (
                        <PropertyList
                            properties={myProperties}
                            loading={searchLoading}
                            onPropertyUpdated={handlePropertyUpdated}
                            onPropertyDeleted={handlePropertyDeleted}
                        />
                    ) : (
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
                        onPropertyUpdated={handlePropertyUpdated}
                        onPropertyDeleted={handlePropertyDeleted}
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

            {/* ✅ CREATE DEAL MODAL */}
            {console.log('Modal render check: showBrowseDeals =', showBrowseDeals)}
            {showBrowseDeals && (
                <>
                    {console.log('✅ Rendering BrowsePropertiesForDeal modal')}
                    <BrowsePropertiesForDeal
                        onClose={() => {
                            console.log('🔧 Debug: Closing modal');
                            setShowBrowseDeals(false);
                        }}
                        onDealCreated={() => {
                            console.log('🔧 Debug: Deal created');
                            setShowBrowseDeals(false);
                            fetchProperties();
                            setActiveTab('deals');
                        }}
                    />
                </>
            )}
            {!showBrowseDeals && console.log('Modal NOT rendering - showBrowseDeals is false')}
        </div>
    );
}

export default HomePage;