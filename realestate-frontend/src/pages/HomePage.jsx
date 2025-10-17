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
    const [myDealsProperties, setMyDealsProperties] = useState([]); // ✅ NEW: Properties with deals
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('featured');
    const [selectedArea, setSelectedArea] = useState(null);
    const [showBrowseDeals, setShowBrowseDeals] = useState(false);
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
            fetchMyDealsProperties(); // ✅ NEW: Fetch properties with deals
        }
    }, [isAuthenticated, user]);

    // ✅ 1. FEATURED PROPERTIES - All properties on site
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

    // ✅ 2. MY UPLOADED PROPERTIES - Properties uploaded by current user
    const fetchMyProperties = async () => {
        if (!user?.id) {
            console.log('❌ No user ID for fetching properties');
            return;
        }
        try {
            console.log('📥 Fetching properties uploaded by user ID:', user.id);
            const response = await fetch(`http://localhost:8080/api/properties/user/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                const propertiesArray = Array.isArray(data) ? data : (data.data || []);
                console.log(`✅ Found ${propertiesArray.length} properties uploaded by user`);
                setMyProperties(propertiesArray);
            } else {
                console.log('❌ Failed to fetch my properties:', response.status);
            }
        } catch (error) {
            console.error('Error loading my properties:', error);
        }
    };

    // ✅ 3. MY DEALS PROPERTIES - Deals ONLY on properties posted by the user
    const fetchMyDealsProperties = async () => {
        if (!user?.id) {
            console.log('❌ No user ID for fetching deals');
            return;
        }
        try {
            console.log('📥 Fetching deals for user properties ID:', user.id);

            // First, get all user's uploaded properties
            const userPropsResponse = await fetch(`http://localhost:8080/api/properties/user/${user.id}`);
            if (!userPropsResponse.ok) {
                console.log('❌ Failed to fetch user properties');
                setMyDealsProperties([]);
                return;
            }

            const userPropsData = await userPropsResponse.json();
            const userProperties = Array.isArray(userPropsData) ? userPropsData : (userPropsData.data || []);

            if (userProperties.length === 0) {
                console.log('ℹ️ User has no uploaded properties');
                setMyDealsProperties([]);
                return;
            }

            console.log(`✅ Found ${userProperties.length} properties uploaded by user`);

            // Create a Set of user's property IDs
            const userPropertyIds = new Set(
                userProperties.map(prop => prop.id || prop.propertyId)
            );

            console.log('User property IDs:', Array.from(userPropertyIds));

            let allDeals = [];

            // Fetch agent deals (deals created by this user as an agent)
            if (user.role === 'AGENT' || user.role === 'ADMIN') {
                try {
                    const agentResponse = await fetch(`http://localhost:8080/api/deals/agent/${user.id}`, {
                        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                    });
                    if (agentResponse.ok) {
                        const agentData = await agentResponse.json();
                        const deals = Array.isArray(agentData) ? agentData : (agentData.data || []);
                        allDeals = [...allDeals, ...deals];
                    }
                } catch (err) {
                    console.log('⚠️ Error fetching agent deals:', err);
                }
            }

            console.log(`✅ Found ${allDeals.length} agent deals`);

            // ✅ Filter deals to only include those on user's own uploaded properties
            const propertiesFromDeals = [];
            const seenPropertyIds = new Set();

            allDeals.forEach(deal => {
                const propertyId = deal.property?.id || deal.propertyId;

                // Only include if: property exists, it's the user's property, and we haven't seen it yet
                if (propertyId && userPropertyIds.has(propertyId) && !seenPropertyIds.has(propertyId) && deal.property) {
                    seenPropertyIds.add(propertyId);
                    propertiesFromDeals.push({
                        ...deal.property,
                        dealStage: deal.stage,
                        dealId: deal.id,
                        dealCreatedAt: deal.createdAt,
                        buyerName: deal.buyer ? `${deal.buyer.firstName} ${deal.buyer.lastName}` : 'N/A',
                        buyerPhone: deal.buyer?.mobileNumber || 'N/A'
                    });
                }
            });

            console.log(`✅ Found ${propertiesFromDeals.length} deals on user's own properties`);
            setMyDealsProperties(propertiesFromDeals);

        } catch (error) {
            console.error('Error loading deals properties:', error);
            setMyDealsProperties([]);
        }
    };

    const handleSearchResults = (results) => {
        setSearchResults(results);
        setShowSearchResults(true);
        setSearchLoading(false);
        setActiveTab('featured');
        setSelectedArea(null);
    };

    const handleSearchStart = () => {
        setSearchLoading(true);
    };

    const handleResetSearch = () => {
        setShowSearchResults(false);
        setSearchResults([]);
        setActiveTab('featured');
        setSelectedArea(null);
        fetchProperties();
    };

    const handleAreaClick = (area) => {
        console.log('🔍 Area clicked:', area.name);
        setSelectedArea(area.name);
        setShowSearchResults(false);
        setActiveTab('featured');
    };

    const getFilteredPropertiesByArea = () => {
        if (!selectedArea) return propsList;

        return propsList.filter(property => {
            const propertyArea = (property.areaName || property.area?.areaName || '').toLowerCase();
            const searchArea = selectedArea.toLowerCase();
            return propertyArea.includes(searchArea);
        });
    };

    const handlePropertyUpdated = () => {
        console.log('🔄 Property updated, refreshing lists...');
        fetchProperties();
        if (isAuthenticated && user?.id) {
            fetchMyProperties();
            fetchMyDealsProperties();
        }
    };

    const handlePropertyDeleted = () => {
        console.log('🔄 Property deleted, refreshing lists...');
        fetchProperties();
        if (isAuthenticated && user?.id) {
            fetchMyProperties();
            fetchMyDealsProperties();
        }
    };

    const handleCreateDealClick = () => {
        console.log('📋 Create deal clicked');
        setShowBrowseDeals(true);
    };

    const buttonShouldBeVisible =
        activeTab === 'deals' &&
        isAuthenticated &&
        user &&
        (user.role === 'AGENT' || user.role === 'ADMIN');

    // ✅ Determine which properties to display based on active tab
    const displayedProperties = showSearchResults
        ? searchResults
        : selectedArea
        ? getFilteredPropertiesByArea()
        : activeTab === 'my-properties'
        ? myProperties
        : activeTab === 'deals'
        ? myDealsProperties
        : propsList;

    // ✅ Get counts for each tab
    const dealsPropertyCount = myDealsProperties.length;

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
                            onClick={() => handleAreaClick(area)}
                            style={{
                                ...styles.areaButton,
                                backgroundColor: selectedArea === area.name ? '#667eea' : 'white',
                                color: selectedArea === area.name ? 'white' : '#334155',
                                borderColor: selectedArea === area.name ? '#667eea' : '#e2e8f0',
                                boxShadow: selectedArea === area.name ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                            }}
                            className="areaButton"
                        >
                            <span style={styles.areaEmoji}>{area.emoji}</span>
                            {area.name}
                        </button>
                    ))}
                </div>
            </section>

            <section style={styles.propertiesSection}>
                {isAuthenticated && !showSearchResults && !selectedArea && (
                    <div style={styles.tabContainer}>
                        {/* ✅ TAB 1: FEATURED PROPERTIES - All properties on site */}
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
                            ⭐ Featured Properties ({propsList.length})
                        </button>

                        {/* ✅ TAB 2: MY UPLOADED PROPERTIES - Properties uploaded by user */}
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

                        {/* ✅ TAB 3: MY DEALS - Properties with deals created */}
                        {dealsPropertyCount > 0 && (
                            <button
                                onClick={() => {
                                    console.log('📊 Switching to My Deals tab');
                                    setActiveTab('deals');
                                }}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'deals' ? styles.activeTab : {})
                                }}
                            >
                                📊 Properties with Deals ({dealsPropertyCount})
                            </button>
                        )}
                    </div>
                )}

                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        <span style={styles.sectionIcon}>
                            {showSearchResults ? '🔍' : selectedArea ? '📍' : activeTab === 'my-properties' ? '📁' : activeTab === 'deals' ? '📊' : '⭐'}
                        </span>
                        {showSearchResults
                            ? `Search Results (${searchResults.length} found)`
                            : selectedArea
                            ? `Properties in ${selectedArea} (${getFilteredPropertiesByArea().length} found)`
                            : activeTab === 'my-properties'
                            ? `My Uploaded Properties (${myProperties.length} found)`
                            : activeTab === 'deals'
                            ? `Properties with Deals (${myDealsProperties.length} found)`
                            : `Featured Properties (${propsList.length} found)`}
                    </h2>
                    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                        {(showSearchResults || selectedArea) && (
                            <button onClick={handleResetSearch} style={styles.clearSearchBtn}>
                                ✕ Clear Filter
                            </button>
                        )}
                        {buttonShouldBeVisible && (
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
                            >
                                ➕ Create New Deal
                            </button>
                        )}
                    </div>
                </div>

                {/* ✅ Display properties or deals based on active tab */}
                {activeTab === 'deals' && myDealsProperties.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📭</div>
                        <h3 style={styles.emptyTitle}>No Deals Yet</h3>
                        <p style={styles.emptyText}>
                            You haven't created any deals yet. Create one to see properties here.
                        </p>
                    </div>
                ) : (
                    <PropertyList
                        properties={displayedProperties}
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

            {showBrowseDeals && (
                <BrowsePropertiesForDeal
                    onClose={() => setShowBrowseDeals(false)}
                    onDealCreated={() => {
                        setShowBrowseDeals(false);
                        fetchProperties();
                        fetchMyDealsProperties(); // ✅ Refresh deals properties
                        setActiveTab('deals');
                    }}
                />
            )}
        </div>
    );
}

export default HomePage;