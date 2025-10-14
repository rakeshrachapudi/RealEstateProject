// src/pages/HomePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import PropertySearch from '../components/PropertySearch';
import PropertyList from '../components/PropertyList';
import { getFeaturedProperties } from '../services/api';
import { styles } from '../styles.js';

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

    // In your HomePage.jsx, update the handleAreaClick function:
    const handleAreaClick = (area) => {
        // Convert spaces to hyphens for URL
        const urlArea = area.name.toLowerCase().replace(/\s+/g, '-');
        navigate(`/area/${urlArea}`);
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

export default HomePage;