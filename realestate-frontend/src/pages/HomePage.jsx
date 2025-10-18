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
    const [myDealsProperties, setMyDealsProperties] = useState([]);
    const [myDeals, setMyDeals] = useState([]);
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
        if (!isAuthenticated || !user?.id) {
            console.log('❌ Not authenticated or no user ID');
            setMyProperties([]);
            return;
        }

        try {
            console.log('📥 Fetching properties uploaded by user ID:', user.id);
            const response = await fetch(`http://localhost:8080/api/properties/user/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const propertiesArray = Array.isArray(data) ? data : (data.data || []);

                const verifiedProperties = propertiesArray.filter(prop => prop.user?.id === user.id);

                console.log(`✅ Found ${propertiesArray.length} properties, verified ${verifiedProperties.length}`);
                setMyProperties(verifiedProperties);
            } else {
                console.log('❌ Failed to fetch my properties:', response.status);
                setMyProperties([]);
            }
        } catch (error) {
            console.error('Error loading my properties:', error);
            setMyProperties([]);
        }
    };

    // ✅ FETCH MY DEALS - Multi-role deal fetching with NEW endpoint
    const fetchMyDeals = async () => {
        if (!isAuthenticated || !user?.id) {
            console.log('❌ Not authenticated or missing user info');
            setMyDeals([]);
            return;
        }

        try {
            console.log('📥 Fetching deals for user ID:', user.id);

            const authToken = localStorage.getItem('authToken');
            const allDeals = [];
            const dealIds = new Set();

            // ✅ 1. Fetch by primary role (AGENT, ADMIN, etc.)
            if (user.role) {
                try {
                    const roleResponse = await fetch(
                        `http://localhost:8080/api/deals/user/${user.id}/role/${user.role}`,
                        {
                            headers: {
                                'Authorization': `Bearer ${authToken}`
                            }
                        }
                    );

                    console.log(`📊 Primary role (${user.role}) response status:`, roleResponse.status);

                    if (roleResponse.ok) {
                        const roleData = await roleResponse.json();
                        console.log(`📊 Primary role (${user.role}) response:`, roleData);

                        let roleDealsList = [];
                        if (Array.isArray(roleData)) {
                            roleDealsList = roleData;
                        } else if (roleData.data && Array.isArray(roleData.data)) {
                            roleDealsList = roleData.data;
                        }

                        console.log(`✅ Found ${roleDealsList.length} deals for primary role: ${user.role}`);

                        roleDealsList.forEach(deal => {
                            if (!dealIds.has(deal.dealId || deal.id)) {
                                allDeals.push(deal);
                                dealIds.add(deal.dealId || deal.id);
                            }
                        });
                    }
                } catch (err) {
                    console.error('⚠️ Error fetching deals by primary role:', err);
                }
            }

            // ✅ 2. If not AGENT/ADMIN, also fetch as BUYER
            if (user.role !== 'AGENT' && user.role !== 'ADMIN') {
                try {
                    const buyerResponse = await fetch(
                        `http://localhost:8080/api/deals/user/${user.id}/role/BUYER`,
                        {
                            headers: {
                                'Authorization': `Bearer ${authToken}`
                            }
                        }
                    );

                    console.log(`📊 BUYER role response status:`, buyerResponse.status);

                    if (buyerResponse.ok) {
                        const buyerData = await buyerResponse.json();
                        console.log(`📊 BUYER role response:`, buyerData);

                        let buyerDealsList = [];
                        if (Array.isArray(buyerData)) {
                            buyerDealsList = buyerData;
                        } else if (buyerData.data && Array.isArray(buyerData.data)) {
                            buyerDealsList = buyerData.data;
                        }

                        console.log(`✅ Found ${buyerDealsList.length} deals as BUYER`);

                        buyerDealsList.forEach(deal => {
                            if (!dealIds.has(deal.dealId || deal.id)) {
                                allDeals.push(deal);
                                dealIds.add(deal.dealId || deal.id);
                            }
                        });
                    }
                } catch (err) {
                    console.error('⚠️ Error fetching deals as BUYER:', err);
                }
            }

            // ✅ 3. Also fetch as SELLER
            try {
                const sellerResponse = await fetch(
                    `http://localhost:8080/api/deals/user/${user.id}/role/SELLER`,
                    {
                        headers: {
                            'Authorization': `Bearer ${authToken}`
                        }
                    }
                );

                console.log(`📊 SELLER role response status:`, sellerResponse.status);

                if (sellerResponse.ok) {
                    const sellerData = await sellerResponse.json();
                    console.log(`📊 SELLER role response:`, sellerData);

                    let sellerDealsList = [];
                    if (Array.isArray(sellerData)) {
                        sellerDealsList = sellerData;
                    } else if (sellerData.data && Array.isArray(sellerData.data)) {
                        sellerDealsList = sellerData.data;
                    }

                    console.log(`✅ Found ${sellerDealsList.length} deals as SELLER`);

                    sellerDealsList.forEach(deal => {
                        if (!dealIds.has(deal.dealId || deal.id)) {
                            allDeals.push(deal);
                            dealIds.add(deal.dealId || deal.id);
                        }
                    });
                }
            } catch (err) {
                console.error('⚠️ Error fetching deals as SELLER:', err);
            }

            console.log(`✅ FINAL: Total combined deals: ${allDeals.length}`, allDeals);
            setMyDeals(allDeals);

        } catch (error) {
            console.error('Error loading deals:', error);
            setMyDeals([]);
        }
    };

    const fetchMyDealsProperties = async () => {
        if (!isAuthenticated || !user?.id) {
            console.log('❌ Not authenticated for deals');
            setMyDealsProperties([]);
            return;
        }

        try {
            console.log('📥 Fetching deals for user properties ID:', user.id);

            const userPropsResponse = await fetch(`http://localhost:8080/api/properties/user/${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });

            if (!userPropsResponse.ok) {
                console.log('❌ Failed to fetch user properties');
                setMyDealsProperties([]);
                return;
            }

            const userPropsData = await userPropsResponse.json();
            const userProperties = Array.isArray(userPropsData) ? userPropsData : (userPropsData.data || []);

            const userPropertyIds = new Set(
                userProperties
                    .filter(prop => prop.user?.id === user.id)
                    .map(prop => prop.id || prop.propertyId)
            );

            if (userPropertyIds.size === 0) {
                console.log('ℹ️ User has no uploaded properties');
                setMyDealsProperties([]);
                return;
            }

            console.log(`✅ Found ${userPropertyIds.size} user properties`);

            let allDeals = [];

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

            console.log(`✅ Found ${allDeals.length} total deals`);

            const propertiesFromDeals = [];
            const seenPropertyIds = new Set();

            allDeals.forEach(deal => {
                const propertyId = deal.property?.id || deal.propertyId;

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

    useEffect(() => {
        fetchProperties();

        if (isAuthenticated && user?.id) {
            console.log('✅ User authenticated:', user.id, user.firstName, 'Role:', user.role);
            fetchMyProperties();
            fetchMyDeals();
            fetchMyDealsProperties();
        } else {
            console.log('❌ User logged out, clearing data');
            setMyProperties([]);
            setMyDeals([]);
            setMyDealsProperties([]);
            setActiveTab('featured');
        }
    }, [isAuthenticated, user?.id, user?.role]);

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
            fetchMyDeals();
            fetchMyDealsProperties();
        }
    };

    const handlePropertyDeleted = () => {
        console.log('🔄 Property deleted, refreshing lists...');
        fetchProperties();
        if (isAuthenticated && user?.id) {
            fetchMyProperties();
            fetchMyDeals();
            fetchMyDealsProperties();
        }
    };

    const handleCreateDealClick = () => {
        setShowBrowseDeals(true);
    };

    const buttonShouldBeVisible =
        activeTab === 'deals' &&
        isAuthenticated &&
        user &&
        (user.role === 'AGENT' || user.role === 'ADMIN');

    const displayedProperties = showSearchResults
        ? searchResults
        : selectedArea
        ? getFilteredPropertiesByArea()
        : activeTab === 'my-properties'
        ? myProperties
        : activeTab === 'deals'
        ? myDealsProperties
        : propsList;

    const dealsPropertyCount = myDealsProperties.length;
    const dealsCount = myDeals.length;

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
                        <button
                            onClick={() => setActiveTab('featured')}
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'featured' ? styles.activeTab : {})
                            }}
                        >
                            ⭐ Featured Properties ({propsList.length})
                        </button>

                        {myProperties.length > 0 && (
                            <button
                                onClick={() => setActiveTab('my-properties')}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'my-properties' ? styles.activeTab : {})
                                }}
                            >
                                📁 My Uploaded Properties ({myProperties.length})
                            </button>
                        )}

                        {dealsCount > 0 && (
                            <button
                                onClick={() => setActiveTab('my-deals')}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'my-deals' ? styles.activeTab : {})
                                }}
                            >
                                📊 My Deals ({dealsCount})
                            </button>
                        )}

                        {dealsPropertyCount > 0 && (
                            <button
                                onClick={() => setActiveTab('property-deals')}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'property-deals' ? styles.activeTab : {})
                                }}
                            >
                                🏠 Deals on My Properties ({dealsPropertyCount})
                            </button>
                        )}
                    </div>
                )}

                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>
                        <span style={styles.sectionIcon}>
                            {showSearchResults ? '🔍' : selectedArea ? '📍' : activeTab === 'my-properties' ? '📁' : activeTab === 'my-deals' ? '📊' : activeTab === 'property-deals' ? '🏠' : '⭐'}
                        </span>
                        {showSearchResults
                            ? `Search Results (${searchResults.length} found)`
                            : selectedArea
                            ? `Properties in ${selectedArea} (${getFilteredPropertiesByArea().length} found)`
                            : activeTab === 'my-properties'
                            ? `My Uploaded Properties (${myProperties.length} found)`
                            : activeTab === 'my-deals'
                            ? `My Deals (${myDeals.length} found)`
                            : activeTab === 'property-deals'
                            ? `Deals on My Properties (${myDealsProperties.length} found)`
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

                {activeTab === 'my-deals' && myDeals.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📭</div>
                        <h3 style={styles.emptyTitle}>No Deals Yet</h3>
                        <p style={styles.emptyText}>
                            You don't have any deals yet.
                        </p>
                    </div>
                ) : activeTab === 'my-deals' ? (
                    <div style={styles.dealsGrid}>
                        {myDeals.map(deal => (
                            <div key={deal.dealId || deal.id} style={styles.dealCard}>
                                <div style={{...styles.stageBadge, backgroundColor: getStageColor(deal.stage)}}>
                                    {deal.stage}
                                </div>
                                <h4 style={styles.dealTitle}>{deal.propertyTitle || 'Property'}</h4>
                                {deal.agreedPrice && (
                                    <p style={{color: '#10b981', fontWeight: '700', margin: '8px 0'}}>
                                        💰 ₹{deal.agreedPrice.toLocaleString('en-IN')}
                                    </p>
                                )}
                                <p style={{fontSize: '13px', color: '#64748b', margin: '4px 0'}}>
                                    👤 Buyer: {deal.buyerName || 'N/A'}
                                </p>
                                <p style={{fontSize: '13px', color: '#64748b', margin: '4px 0'}}>
                                    🏠 Seller: {deal.sellerName || 'N/A'}
                                </p>
                                <p style={{fontSize: '12px', color: '#94a3b8', margin: '8px 0 0 0'}}>
                                    {new Date(deal.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : activeTab === 'property-deals' && myDealsProperties.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>📭</div>
                        <h3 style={styles.emptyTitle}>No Deals on Your Properties</h3>
                        <p style={styles.emptyText}>
                            No one has shown interest in your properties yet.
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
                        fetchMyDeals();
                        fetchMyDealsProperties();
                        setActiveTab('my-deals');
                    }}
                />
            )}
        </div>
    );
}

function getStageColor(stage) {
    const colors = {
        'INQUIRY': '#3b82f6',
        'SHORTLIST': '#8b5cf6',
        'NEGOTIATION': '#f59e0b',
        'AGREEMENT': '#10b981',
        'REGISTRATION': '#06b6d4',
        'PAYMENT': '#ec4899',
        'COMPLETED': '#22c55e',
    };
    return colors[stage] || '#6b7280';
}

const dealCardStyles = {
    dealsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
    },
    dealCard: {
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    stageBadge: {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '6px',
        color: 'white',
        fontSize: '12px',
        fontWeight: '600',
        marginBottom: '12px',
    },
    dealTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#1e293b',
        margin: '0 0 12px 0',
    }
};

Object.assign(styles, dealCardStyles);

export default HomePage;