// src/pages/SearchResultsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropertyList from '../components/PropertyList';
import { styles } from '../styles.js';

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

export default SearchResultsPage;