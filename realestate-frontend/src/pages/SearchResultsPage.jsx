// src/pages/SearchResultsPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PropertyList from '../components/PropertyList';
import { styles } from '../styles.js';
import { BACKEND_BASE_URL } from "../config/config";

function SearchResultsPage() {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchParams = Object.fromEntries(params.entries());
        fetchFilteredProperties(searchParams);
    }, [location.search]);

    const fetchFilteredProperties = async (searchParams) => {
        setLoading(true);

        try {



        const requestBody = {
            propertyType: searchParams.propertyType || null,
            minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : null,
            maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : null,
            city: searchParams.city || null,
            area: searchParams.area || null,
            listingType: searchParams.listingType || null,
            minBedrooms: searchParams.minBedrooms ? parseInt(searchParams.minBedrooms) : null,
            maxBedrooms: searchParams.maxBedrooms ? parseInt(searchParams.maxBedrooms) : null,
            isVerified: searchParams.isVerified === 'true' ? true : null,
            ownerType: searchParams.ownerType || null,
            isReadyToMove: searchParams.isReadyToMove === 'true' ? true : null,  // NEW
            sortBy: 'createdAt',
            sortOrder: 'DESC',
            page: 0,
            size: 50
        };

            const response = await fetch(`${BACKEND_BASE_URL}/api/properties/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

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
        const params = new URLSearchParams(location.search);
        const type = params.get('propertyType');
        const listingType = params.get('listingType');
        const area = params.get('area');

        if (area) return `Properties in ${area}`;
        if (type && listingType) return `${type}s for ${listingType === 'sale' ? 'Sale' : 'Rent'}`;
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
                    {loading ? 'Searching...' : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} found`}
                </p>
            </div>

            {!loading && properties.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🏚️</div>
                    <h3 style={styles.emptyTitle}>No properties found</h3>
                    <p style={styles.emptyText}>Try adjusting your search or browse all properties</p>
                    <button onClick={() => navigate('/')} style={styles.postBtn}>Browse All Properties</button>
                </div>
            ) : (
                <PropertyList properties={properties} loading={loading} />
            )}
        </div>
    );
}

export default SearchResultsPage;