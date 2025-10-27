// src/pages/MyAgreementsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles'; // Adjust path if needed

// --- ADDED CODE: NEW HELPER COMPONENT FOR BUTTONS (Renders options) ---
const CreateAgreementButtons = ({ navigate, primaryStyle, secondaryStyle, buttonGroupStyle }) => (
    <div style={buttonGroupStyle}>
        {/* Button 1: Create Rental Agreement (Secondary style) */}
        <button
            style={secondaryStyle}
            onClick={() => navigate('/rental-agreement')}
        >
            Create Rental Agreement
        </button>

        {/* Button 2: Create Sale Agreement (Primary style) */}
        <button
            style={primaryStyle}
            onClick={() => navigate('/sale-agreement')}
        >
            Create Sale Agreement
        </button>
    </div>
);
// --- END ADDED CODE ---


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

    // ADDED CODE: Handler for Deleting an Agreement (from previous request)
    const handleDelete = (agreementId) => {
        if (!window.confirm("Are you sure you want to delete this agreement? This action cannot be undone.")) {
            return;
        }

        // Filter out the agreement to be deleted
        const updatedAgreements = agreements.filter(ag => ag.agreementId !== agreementId);

        // Update both the state and localStorage
        setAgreements(updatedAgreements);
        try {
            localStorage.setItem('myAgreements', JSON.stringify(updatedAgreements));
            console.log(`Agreement ${agreementId} deleted successfully.`);
        } catch (err) {
            console.error("Error saving agreements to localStorage after deletion:", err);
            // Notify the user of the save failure
            alert("Error: Could not save changes after deleting the agreement. Please try again.");
        }
    };


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
            {/* 🎯 MODIFIED CODE: Use Flexbox on pageHeader container to align title and buttons */}
            <div style={{ ...styles.pageHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={styles.pageTitle}>My Agreements</h1>
                    <p style={styles.pageSubtitle}>Rental and Lease agreements created by you (Saved Locally).</p>
                </div>

                {/* 🎯 ADDED CODE: Place the creation options here (renders unconditionally) */}
                <CreateAgreementButtons
                    navigate={navigate}
                    primaryStyle={styles.primaryButton || styles.signupBtn}
                    secondaryStyle={emptyStateButtonStyle.secondaryButton || styles.primaryButton}
                    buttonGroupStyle={{ display: 'flex', gap: '15px', marginTop: 0 }} // Added marginTop: 0 for alignment
                />
                {/* END ADDED CODE */}
            </div>

            {/* Conditional Rendering based on agreements array */}
            {agreements.length === 0 ? (
                // Empty State: Displayed when no agreements are found
                <div style={styles.noPropertiesContainer}>
                    <p style={styles.noPropertiesText}>You haven't created any rental agreements yet.</p>

                    {/* ❌ REMOVED CODE: The original button group block is removed from here. */}

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

                                {/* 🎯 ADDED CODE: Conditional details rendering to handle both sale and rental agreements */}
                                {agreement.agreementType === 'Sale Agreement' ? (
                                    <>
                                        <DetailItem label="Seller" value={agreement.vendorName} />
                                        <DetailItem label="Buyer" value={agreement.buyerName} />
                                        <DetailItem label="Price" value={`Rs ${agreement.saleAmount || 'N/A'}`} />
                                        <DetailItem label="Date" value={agreement.startDate ? new Date(agreement.startDate).toLocaleDateString() : 'N/A'} />
                                        <DetailItem label="Property" value={agreement.propertyAddressShort || agreement.propertyAddress || 'N/A'} span={2}/>
                                    </>
                                ) : (
                                    <>
                                        <DetailItem label="Owner" value={agreement.ownerName} />
                                        <DetailItem label="Tenant" value={agreement.tenantName} />
                                        <DetailItem label="Property" value={agreement.propertyAddressShort || agreement.propertyAddress || 'N/A'} span={2}/>
                                        <DetailItem label="Start Date" value={agreement.startDate ? new Date(agreement.startDate).toLocaleDateString() : 'N/A'} />
                                        <DetailItem label="Duration" value={`${agreement.durationMonths || agreement.duration} months`} />
                                    </>
                                )}
                                {/* END ADDED CODE */}

                            </div>

                            {/* ADDED CODE: Action Buttons (from previous request) */}
                            <div style={agreementCardStyle.actions}>
                                <button
                                    style={{...styles.primaryButton, padding: '8px 15px', fontSize: '14px', flex: 'initial'}}
                                    // Assuming a view route exists
                                    onClick={() => navigate(`/view-agreement/${agreement.agreementId}`)}
                                >
                                    View/Edit
                                </button>
                                <button
                                    style={styles.deleteButton || {
                                        cursor: 'pointer', border: 'none', borderRadius: '8px',
                                        backgroundColor: '#ef4444', color: 'white',
                                        padding: '8px 15px', fontSize: '14px', fontWeight: '600',
                                    }}
                                    onClick={() => handleDelete(agreement.agreementId)}
                                >
                                    Delete
                                </button>
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

// ADDED CODE: Styles for the new empty state buttons (used for the secondary style)
const emptyStateButtonStyle = {
    // buttonGroup is not strictly needed here, but keeping for minimal change
    buttonGroup: {
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        marginTop: '20px',
    },
    // This style is used for the "Create Rental Agreement" button in the header
    secondaryButton: {
        cursor: 'pointer',
        border: '1px solid #3b82f6', // Border color matching primary button base
        borderRadius: '8px',
        backgroundColor: 'transparent', // Transparent background
        color: '#3b82f6', // Blue text
        padding: '10px 20px', // Adjusted padding for better fit in the header
        fontSize: '15px',
        fontWeight: '600',
        transition: 'background-color 0.3s, color 0.3s',
    }
};

// --- Basic Styles for the Agreement Card (Included for completeness) ---
const agreementCardStyle = {
    card: {
        border: '1px solid #e2e8f0',
        padding: '20px 25px',
        borderRadius: '12px',
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex', // ADDED for layout flexibility
        flexDirection: 'column', // ADDED for layout flexibility
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
    },
    // ADDED CODE: Style for the action button container (from previous request)
    actions: {
        marginTop: '20px',
        paddingTop: '15px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
    }
};

export default MyAgreementsPage;