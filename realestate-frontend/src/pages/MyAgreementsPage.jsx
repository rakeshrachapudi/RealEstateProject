// src/pages/MyAgreementsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles'; // Adjust path if needed

function MyAgreementsPage() {
    const [agreements, setAgreements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Load agreements from localStorage when the component mounts
        console.log("Loading agreements from localStorage...");
        setIsLoading(true);
        setError(null);
        try {
            // Retrieve the stored agreements string
            const storedAgreementsRaw = localStorage.getItem('myAgreements');
            // Parse the JSON string into an array, default to empty array if nothing is stored
            const storedAgreements = storedAgreementsRaw ? JSON.parse(storedAgreementsRaw) : [];

            console.log("Found locally stored agreements:", storedAgreements);
            // Update the component's state with the loaded agreements
            setAgreements(storedAgreements);

        } catch (err) {
            // Handle errors during JSON parsing (e.g., corrupted data)
            console.error("Error loading agreements from localStorage:", err);
            setError("Could not load locally stored agreements. Data might be corrupted.");
            setAgreements([]); // Ensure agreements is an empty array on error
        } finally {
            setIsLoading(false);
        }
    }, []); // Runs only once on mount

    // --- Render Logic ---

    if (isLoading) {
        return (
            <div style={{ ...styles.container, ...styles.loadingContainer }}>
                {/* Manually verify this line is clean */}
                <div style={styles.spinner}></div>
                <p>Loading your agreements</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ ...styles.container, ...styles.errorContainer }}>
                 <div style={{fontSize: '48px', marginBottom: '16px'}}>⚠️</div>
                <p style={{fontWeight: '600'}}>Could not load agreements</p>
                <p style={{fontSize: '14px', color: '#b91c1c'}}>{error}</p>
            </div>
        );
    }

    // Main content display (list of agreements or empty state)
    return (
        <div style={styles.container}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>My Agreements</h1>
                <p style={styles.pageSubtitle}>Rental and Lease agreements created by you (Saved Locally).</p>
            </div>

            {/* Conditional Rendering based on agreements array */}
            {agreements.length === 0 ? (
                // Empty State: Displayed when no agreements are found
                <div style={styles.noPropertiesContainer}>
                    <p style={styles.noPropertiesText}>You haven't created any rental agreements yet.</p>
                    {/* Button to navigate to the agreement creation page */}
                    <button
                        style={styles.primaryButton || styles.signupBtn}
                        onClick={() => navigate('/rental-agreement')}
                    >
                        Create Your First Agreement
                    </button>
                </div>
            ) : (
                // Agreement List: Displayed when agreements exist
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Map through the agreements array and render a card for each */}
                    {agreements.map((agreement) => (
                        <div key={agreement.agreementId} style={agreementCardStyle.card}>
                            {/* Card Header: Agreement Type, ID, Status */}
                            <div style={agreementCardStyle.header}>
                                <h2 style={agreementCardStyle.title}>
                                    {agreement.agreementType} #{/* Display shorter ID for readability */} {agreement.agreementId ? agreement.agreementId.substring(6) : 'N/A'}
                                </h2>
                                {/* Status Badge (colored based on status) */}
                                <span style={{ ...agreementCardStyle.statusBadge, ...(agreement.status === 'ACTIVE' ? agreementCardStyle.activeStatus : agreementCardStyle.inactiveStatus) }}>
                                    {agreement.status || 'N/A'}
                                </span>
                            </div>
                            {/* Card Body: Details Grid */}
                            <div style={agreementCardStyle.detailsGrid}>
                                <DetailItem label="Owner" value={agreement.ownerName} />
                                <DetailItem label="Tenant" value={agreement.tenantName} />
                                {/* Use short address if available, otherwise full address */}
                                <DetailItem label="Property" value={agreement.propertyAddressShort || agreement.propertyAddress || 'N/A'} span={2}/>
                                <DetailItem label="Start Date" value={agreement.startDate ? new Date(agreement.startDate).toLocaleDateString() : 'N/A'} />
                                {/* Use standardized durationMonths if available */}
                                <DetailItem label="Duration" value={`${agreement.durationMonths || agreement.duration} months`} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


// --- Helper component for displaying details within the grid ---
const DetailItem = ({ label, value, span = 1 }) => (
    <div style={{ gridColumn: `span ${span}` }}>
        <p style={agreementCardStyle.detailLabel}>{label}:</p>
        <p style={agreementCardStyle.detailValue}>{value || 'N/A'}</p>
    </div>
);

// --- Basic Styles for the Agreement Card (Included for completeness) ---
const agreementCardStyle = {
    card: {
        border: '1px solid #e2e8f0',
        padding: '20px 25px',
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '10px',
        marginBottom: '15px',
    },
    title: {
        marginTop: 0,
        marginBottom: 0,
        fontSize: '18px',
        color: styles.sectionTitle ? styles.sectionTitle.color : '#1e293b',
        fontWeight: 600,
    },
    statusBadge: {
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    activeStatus: {
        backgroundColor: '#dcfce7', // Green background
        color: '#166534', // Dark green text
    },
    inactiveStatus: {
         backgroundColor: '#f1f5f9', // Gray background
         color: '#475569', // Gray text
    },
    detailsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px 20px',
    },
    detailLabel: {
        margin: '0 0 2px 0',
        fontSize: '13px',
        color: '#64748b',
        fontWeight: 500,
    },
    detailValue: {
        margin: 0,
        fontSize: '15px',
        color: '#334155',
        fontWeight: 500,
    }
};

export default MyAgreementsPage;