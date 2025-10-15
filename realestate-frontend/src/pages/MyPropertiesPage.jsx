import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import PropertyCard from '../components/PropertyCard';
import { styles } from '../styles.js';

const RegistrationHandler = ({ property, onUpdate }) => {
    const { user } = useAuth();
    const isSeller = user?.id === property.user?.id;

    const handleConfirmRegistration = async () => {
        if (window.confirm("Are you sure you want to confirm that the property registration is complete?")) {
            try {
                const res = await fetch(`http://localhost:8080/api/properties/${property.id}/confirm-registration`, { method: 'POST' });
                if (res.ok) {
                    alert("Registration confirmed! An admin will now verify.");
                    onUpdate();
                } else {
                    alert("Failed to confirm registration.");
                }
            } catch (err) {
                alert("An error occurred.");
            }
        }
    };

    const handleUploadProof = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // In a real app, you would upload this to a service like S3 or Cloudinary.
        // For this demo, we'll just use a placeholder URL.
        const proofUrl = `https://example.com/proofs/registration_${property.id}_${file.name}`;

        try {
            const res = await fetch(`http://localhost:8080/api/properties/${property.id}/upload-proof`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ proofUrl })
            });
            if (res.ok) {
                alert("Proof uploaded successfully! An admin will now verify.");
                onUpdate();
            } else {
                alert("Failed to upload proof.");
            }
        } catch (err) {
            alert("An error occurred during upload.");
        }
    };

    if (property.dealStatus !== 'AGREEMENT') {
        return null;
    }

    return (
        <div style={styles.registrationBox}>
            <h4 style={styles.registrationTitle}>Registration Actions</h4>
            {isSeller ? (
                <div>
                    <p>Confirm that the registration process is complete.</p>
                    <button style={styles.confirmButton} onClick={handleConfirmRegistration}>Confirm Registration</button>
                </div>
            ) : (
                <div>
                    <p>Please upload proof of property registration (e.g., scan of the document).</p>
                    <input type="file" onChange={handleUploadProof} />
                </div>
            )}
        </div>
    );
};


function MyPropertiesPage({ onPostPropertyClick }) {
    const { user } = useAuth();
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchMyProperties = async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8080/api/properties/user/${user.id}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            const propertiesArray = Array.isArray(data) ? data : (data.data || []);
            setProperties(propertiesArray);
        } catch (err) {
            setError(err.message);
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user?.id) {
            navigate('/');
            return;
        }
        fetchMyProperties();
    }, [user, navigate]);

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}><h3>Loading your properties...</h3></div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>📁 My Posted Properties</h1>
                <p style={styles.pageSubtitle}>Manage and track the properties you've listed</p>
            </div>
            {properties.length > 0 ? (
                <div style={styles.grid}>
                    {properties.map(property => (
                        <div key={property.propertyId || property.id}>
                            <PropertyCard property={property} onPropertyUpdated={fetchMyProperties} onPropertyDeleted={fetchMyProperties} />
                            <RegistrationHandler property={property} onUpdate={fetchMyProperties} />
                        </div>
                    ))}
                </div>
            ) : (
                 <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📭</div>
                    <h3 style={styles.emptyTitle}>No Properties Posted Yet</h3>
                    <p style={styles.emptyText}>Start by posting your first property to see it here</p>
                    <button onClick={onPostPropertyClick} style={styles.postBtn}>Post Your First Property</button>
                </div>
            )}
        </div>
    );
}

// Add specific styles for the new components
const pageStyles = {
    registrationBox: {
        marginTop: '-1rem',
        padding: '1rem',
        border: '1px solid #ddd',
        borderTop: 'none',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        backgroundColor: '#f8f9fa'
    },
    registrationTitle: {
        margin: '0 0 10px 0',
        fontSize: '1rem',
        color: '#333'
    },
    confirmButton: {
        padding: '10px 15px',
        backgroundColor: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer'
    }
};

// Merge with existing styles
Object.assign(styles, pageStyles);


export default MyPropertiesPage;
