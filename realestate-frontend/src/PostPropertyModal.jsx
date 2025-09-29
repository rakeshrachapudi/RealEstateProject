import React, { useState } from 'react';
import { useAuth } from './AuthContext.jsx';

function PostPropertyModal({ onClose, onPropertyPosted }) {
    const { user, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        type: 'Apartment',
        city: '',
        imageUrl: '',
        bedrooms: '',
        bathrooms: '',
        balconies: '',
        expectedPrice: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isAuthenticated || !user) {
        console.error("User not authenticated to post property.");
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const requiredFields = ['title', 'type', 'city', 'imageUrl', 'bedrooms', 'bathrooms', 'balconies', 'expectedPrice', 'description'];
        for (const field of requiredFields) {
            if (!formData[field] || String(formData[field]).trim() === '') {
                setError(`Please fill in the '${field.replace(/([A-Z])/g, ' $1')}' field.`);
                setLoading(false);
                return;
            }
        }

        const numericPrice = parseFloat(formData.expectedPrice);
        let priceDisplay;
        if (numericPrice >= 10000000) {
            priceDisplay = `₹${(numericPrice / 10000000).toFixed(2)} Cr`;
        } else if (numericPrice >= 100000) {
            priceDisplay = `₹${(numericPrice / 100000).toFixed(2)} Lac`;
        } else {
            priceDisplay = `₹${numericPrice.toLocaleString('en-IN')}`;
        }

        const propertyData = {
            ...formData,
            bedrooms: parseInt(formData.bedrooms),
            bathrooms: parseInt(formData.bathrooms),
            balconies: parseInt(formData.balconies),
            expectedPrice: numericPrice,
            priceDisplay: priceDisplay,
            user: { id: user.id }
        };

        try {
            const response = await fetch('http://localhost:8080/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(propertyData),
            });

            if (!response.ok) {
                throw new Error('Failed to post property. Please try again.');
            }

            const newProperty = await response.json();
            onPropertyPosted(newProperty);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const modalBackdropStyle = {
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(0, 0, 0, 0.6)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000
    };
    const modalContentStyle = {
        background: 'white', padding: '2rem', borderRadius: '8px',
        width: '500px', maxHeight: '90vh', overflowY: 'auto',
        fontFamily: 'system-ui', position: 'relative', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
    };
    const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc' };
    const buttonStyle = { width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontSize: '1rem' };
    const closeButtonStyle = { position: 'absolute', top: '10px', right: '15px', border: 'none', background: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#333' };
    const errorStyle = { color: '#dc3545', marginBottom: '1rem', textAlign: 'center' };

    return (
        <div style={modalBackdropStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                <h2 style={{ marginTop: 0, textAlign: 'center', color: '#333' }}>Post Your Property</h2>

                {error && <p style={errorStyle}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <label>Property Title:</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Spacious 2BHK Apartment" required style={inputStyle} />

                    <label>Property Type:</label>
                    <select name="type" value={formData.type} onChange={handleChange} required style={inputStyle}>
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="House">House</option>
                        <option value="Plot">Plot</option>
                    </select>

                    <label>City:</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="e.g., Bangalore" required style={inputStyle} />

                    <label>Image URL:</label>
                    <input type="url" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/property.jpg" required style={inputStyle} />

                    <label>Description:</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe your property..." required style={{ ...inputStyle, minHeight: '80px' }}></textarea>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label>Bedrooms:</label>
                            <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} min="0" required style={inputStyle} />
                        </div>
                        <div>
                            <label>Bathrooms:</label>
                            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange} min="0" required style={inputStyle} />
                        </div>
                        <div>
                            <label>Balconies:</label>
                            <input type="number" name="balconies" value={formData.balconies} onChange={handleChange} min="0" required style={inputStyle} />
                        </div>
                    </div>

                    <label>Expected Price (in INR):</label>
                    <input type="number" name="expectedPrice" value={formData.expectedPrice} onChange={handleChange} placeholder="e.g., 5000000 (for 50 Lacs)" min="0" step="any" required style={inputStyle} />

                    <button type="submit" style={buttonStyle} disabled={loading}>
                        {loading ? 'Posting...' : 'Post Property'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PostPropertyModal;

