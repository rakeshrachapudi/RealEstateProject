import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

function PostPropertyModal({ onClose, onPropertyPosted }) {
    const { user, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        type: 'Apartment',
        listingType: 'sale', // FIXED: Added listing type
        city: 'Hyderabad',
        address: '',
        imageUrl: '',
        bedrooms: '',
        bathrooms: '',
        areaSqft: '', // FIXED: Changed from balconies to areaSqft
        price: '', // FIXED: Changed from expectedPrice to price
        amenities: '', // FIXED: Added amenities field
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

        // FIXED: Updated required fields validation
        const requiredFields = ['title', 'type', 'listingType', 'city', 'imageUrl', 'bedrooms', 'bathrooms', 'price', 'description'];
        for (const field of requiredFields) {
            if (!formData[field] || String(formData[field]).trim() === '') {
                setError(`Please fill in the '${field.replace(/([A-Z])/g, ' $1')}' field.`);
                setLoading(false);
                return;
            }
        }

        // FIXED: Parse price correctly
        const numericPrice = parseFloat(formData.price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            setError('Please enter a valid price.');
            setLoading(false);
            return;
        }

        // Generate price display
        let priceDisplay;
        if (numericPrice >= 10000000) {
            priceDisplay = `₹${(numericPrice / 10000000).toFixed(2)} Cr`;
        } else if (numericPrice >= 100000) {
            priceDisplay = `₹${(numericPrice / 100000).toFixed(2)} Lac`;
        } else {
            priceDisplay = `₹${numericPrice.toLocaleString('en-IN')}`;
        }

        // FIXED: Correct property data structure matching backend Property entity
        const propertyData = {
            title: formData.title,
            type: formData.type,
            city: formData.city,
            address: formData.address || formData.city, // Use city as fallback
            imageUrl: formData.imageUrl,
            description: formData.description,
            price: numericPrice, // FIXED: Use 'price' not 'expectedPrice'
            priceDisplay: priceDisplay,
            areaSqft: formData.areaSqft ? parseFloat(formData.areaSqft) : null,
            bedrooms: parseInt(formData.bedrooms) || 0,
            bathrooms: parseInt(formData.bathrooms) || 0,
            amenities: formData.amenities || null,
            listingType: formData.listingType, // FIXED: Added listingType
            status: 'available', // FIXED: Added status
            isFeatured: false, // FIXED: Added isFeatured
            isActive: true, // FIXED: Added isActive
            user: {
                id: user.id // FIXED: Correct user structure
            }
        };

        console.log('Sending property data:', propertyData); // Debug log

        try {
            const response = await fetch('http://localhost:8080/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(propertyData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                throw new Error(`Failed to post property: ${response.status} ${response.statusText}`);
            }

            const newProperty = await response.json();
            console.log('Property posted successfully:', newProperty);

            // Show success message
            alert('Property posted successfully!');

            if (onPropertyPosted) {
                onPropertyPosted(newProperty);
            }
            onClose();
        } catch (err) {
            console.error('Error posting property:', err);
            setError(err.message || 'Failed to post property. Please try again.');
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
        width: '600px', maxHeight: '90vh', overflowY: 'auto',
        fontFamily: 'system-ui', position: 'relative', boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
    };
    const inputStyle = {
        width: '100%', padding: '10px', boxSizing: 'border-box',
        marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ccc',
        fontSize: '14px'
    };
    const buttonStyle = {
        width: '100%', padding: '12px', background: '#28a745',
        color: 'white', border: 'none', cursor: 'pointer',
        borderRadius: '4px', fontSize: '1rem', fontWeight: 'bold'
    };
    const closeButtonStyle = {
        position: 'absolute', top: '10px', right: '15px',
        border: 'none', background: 'transparent', fontSize: '1.5rem',
        cursor: 'pointer', color: '#333'
    };
    const errorStyle = {
        color: '#dc3545', marginBottom: '1rem',
        textAlign: 'center', padding: '10px',
        background: '#f8d7da', borderRadius: '4px',
        border: '1px solid #f5c6cb'
    };

    return (
        <div style={modalBackdropStyle} onClick={onClose}>
            <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={closeButtonStyle}>&times;</button>
                <h2 style={{ marginTop: 0, textAlign: 'center', color: '#333' }}>Post Your Property</h2>

                {error && <p style={errorStyle}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <label><strong>Property Title:</strong></label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., Spacious 2BHK Apartment"
                        required
                        style={inputStyle}
                    />

                    <label><strong>Property Type:</strong></label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    >
                        <option value="Apartment">Apartment</option>
                        <option value="Villa">Villa</option>
                        <option value="House">House</option>
                        <option value="Plot">Plot</option>
                        <option value="Commercial">Commercial</option>
                    </select>

                    {/* FIXED: Added Listing Type */}
                    <label><strong>Listing Type:</strong></label>
                    <select
                        name="listingType"
                        value={formData.listingType}
                        onChange={handleChange}
                        required
                        style={inputStyle}
                    >
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                    </select>

                    <label><strong>City:</strong></label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g., Hyderabad"
                        required
                        style={inputStyle}
                    />

                    <label><strong>Address:</strong></label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="e.g., Hitech City, Madhapur"
                        style={inputStyle}
                    />

                    <label><strong>Image URL:</strong></label>
                    <input
                        type="url"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/property.jpg"
                        required
                        style={inputStyle}
                    />

                    <label><strong>Description:</strong></label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe your property..."
                        required
                        style={{ ...inputStyle, minHeight: '80px' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label><strong>Bedrooms:</strong></label>
                            <input
                                type="number"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                min="0"
                                max="20"
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label><strong>Bathrooms:</strong></label>
                            <input
                                type="number"
                                name="bathrooms"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                min="0"
                                max="20"
                                required
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            {/* FIXED: Changed from Balconies to Area (sqft) */}
                            <label><strong>Area (sqft):</strong></label>
                            <input
                                type="number"
                                name="areaSqft"
                                value={formData.areaSqft}
                                onChange={handleChange}
                                min="0"
                                placeholder="e.g., 1200"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* FIXED: Changed from expectedPrice to price */}
                    <label><strong>Price (in INR):</strong></label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="e.g., 5000000 (for 50 Lacs)"
                        min="0"
                        step="any"
                        required
                        style={inputStyle}
                    />

                    {/* FIXED: Added Amenities */}
                    <label><strong>Amenities (comma-separated):</strong></label>
                    <input
                        type="text"
                        name="amenities"
                        value={formData.amenities}
                        onChange={handleChange}
                        placeholder="e.g., Parking, Gym, Swimming Pool"
                        style={inputStyle}
                    />

                    <button
                        type="submit"
                        style={{
                            ...buttonStyle,
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Posting...' : 'Post Property'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PostPropertyModal;