import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

function PostPropertyModal({ onClose, onPropertyPosted }) {
    const { user, isAuthenticated } = useAuth();
    const [areas, setAreas] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        type: 'Apartment',
        listingType: 'sale',
        city: 'Hyderabad',
        area: '',
        address: '',
        imageUrl: '',
        bedrooms: '',
        bathrooms: '',
        balconies: '',
        areaSqft: '',
        price: '',
        amenities: '',
        description: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // THIS IS THE NEW VERSION - you should see "UPDATED MODAL v2.0" in the title
    console.log('PostPropertyModal LOADED - Version 2.0');

    useEffect(() => {
        console.log('Fetching areas...');
        loadAreas();
    }, []);

    const loadAreas = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/areas?city=Hyderabad');
            console.log('Areas response status:', response.status);

            const data = await response.json();
            console.log('Areas data received:', data);

            if (data.success && data.data && Array.isArray(data.data)) {
                setAreas(data.data);
                console.log('Areas set successfully:', data.data.length, 'areas');
            } else {
                console.error('Invalid areas data format:', data);
                setError('Could not load areas. Please check backend connection.');
            }
        } catch (error) {
            console.error('Error loading areas:', error);
            setError('Backend connection failed. Make sure Spring Boot is running on port 8080.');
        }
    };

    if (!isAuthenticated || !user) {
        return (
            <div style={styles.backdrop} onClick={onClose}>
                <div style={styles.modal} onClick={e => e.stopPropagation()}>
                    <button onClick={onClose} style={styles.closeBtn}>×</button>
                    <h2 style={{ color: '#dc3545', textAlign: 'center' }}>Please Login First</h2>
                    <p style={{ textAlign: 'center' }}>You need to be logged in to post a property.</p>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validate required fields
        if (!formData.title || !formData.area || !formData.imageUrl || !formData.bedrooms || !formData.bathrooms || !formData.price || !formData.description) {
            setError('Please fill all required fields marked with *');
            setLoading(false);
            return;
        }

        const numericPrice = parseFloat(formData.price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            setError('Please enter a valid price');
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

        const propertyData = {
            title: formData.title,
            type: formData.type,
            city: formData.city,
            address: formData.address || `${formData.area}, ${formData.city}`,
            imageUrl: formData.imageUrl,
            description: formData.description,
            price: numericPrice,
            priceDisplay: priceDisplay,
            areaSqft: formData.areaSqft ? parseFloat(formData.areaSqft) : null,
            bedrooms: parseInt(formData.bedrooms),
            bathrooms: parseInt(formData.bathrooms),
            amenities: formData.amenities || null,
            listingType: formData.listingType,
            status: 'available',
            isFeatured: true,
            isActive: true,
            user: { id: user.id }
        };

        console.log('Submitting property:', propertyData);

        try {
            const response = await fetch('http://localhost:8080/api/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(propertyData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server error:', errorText);
                throw new Error('Failed to post property');
            }

            const result = await response.json();
            console.log('Property posted successfully:', result);

            alert('✅ Property posted successfully!');
            onClose();
            window.location.reload();
        } catch (err) {
            console.error('Error posting property:', err);
            setError(err.message || 'Failed to post property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.backdrop} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={styles.closeBtn}>×</button>

                <h2 style={styles.title}>📝 Post Your Property (UPDATED v2.0)</h2>

                {error && <div style={styles.error}>❌ {error}</div>}

                {/* Debug Info */}
                <div style={styles.debugInfo}>
                    <strong>Debug:</strong> {areas.length} areas loaded | User ID: {user.id}
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* Property Title */}
                    <div style={styles.field}>
                        <label style={styles.label}>Property Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Spacious 2BHK Apartment"
                            style={styles.input}
                            required
                        />
                    </div>

                    {/* Type and Listing Type */}
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Property Type *</label>
                            <select name="type" value={formData.type} onChange={handleChange} style={styles.select} required>
                                <option>Apartment</option>
                                <option>Villa</option>
                                <option>House</option>
                                <option>Plot</option>
                                <option>Commercial</option>
                            </select>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>Listing Type *</label>
                            <select name="listingType" value={formData.listingType} onChange={handleChange} style={styles.select} required>
                                <option value="sale">🏠 For Sale</option>
                                <option value="rent">🔑 For Rent</option>
                            </select>
                        </div>
                    </div>

                    {/* City and Area - THIS IS THE KEY SECTION */}
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>City *</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                style={styles.input}
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>
                                📍 Area *
                                {areas.length === 0 && <span style={{color: '#ef4444'}}> (Loading...)</span>}
                                {areas.length > 0 && <span style={{color: '#10b981'}}> ({areas.length} available)</span>}
                            </label>
                            <select
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                style={{...styles.select, borderColor: areas.length > 0 ? '#10b981' : '#ef4444'}}
                                required
                            >
                                <option value="">-- Select Area --</option>
                                {areas.map(area => (
                                    <option key={area.areaId} value={area.areaName}>
                                        {area.areaName} ({area.pincode})
                                    </option>
                                ))}
                            </select>
                            {areas.length === 0 && (
                                <small style={{color: '#ef4444', fontSize: '12px', display: 'block', marginTop: '4px'}}>
                                    ⚠️ No areas loaded. Backend might not be running.
                                </small>
                            )}
                        </div>
                    </div>

                    {/* Address */}
                    <div style={styles.field}>
                        <label style={styles.label}>Complete Address (Optional)</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="House/Plot number, Street name"
                            style={styles.input}
                        />
                    </div>

                    {/* Image URL Section - SIMPLIFIED */}
                    <div style={styles.imageSection}>
                        <label style={styles.label}>🖼️ Property Image *</label>
                        <input
                            type="url"
                            name="imageUrl"
                            value={formData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            style={styles.input}
                            required
                        />
                        <div style={styles.imageHelp}>
                            <p style={{margin: 0, fontSize: '13px', color: '#6b7280'}}>
                                💡 <strong>How to add image:</strong>
                            </p>
                            <ol style={{margin: '8px 0', paddingLeft: '20px', fontSize: '12px', color: '#6b7280'}}>
                                <li>Go to <a href="https://imgur.com/upload" target="_blank" rel="noopener noreferrer" style={{color: '#3b82f6'}}>Imgur</a> or <a href="https://postimages.org/" target="_blank" rel="noopener noreferrer" style={{color: '#3b82f6'}}>PostImages</a></li>
                                <li>Upload your property image</li>
                                <li>Copy the <strong>direct image link</strong></li>
                                <li>Paste it in the field above</li>
                            </ol>
                        </div>
                        {formData.imageUrl && (
                            <img
                                src={formData.imageUrl}
                                alt="Preview"
                                style={styles.imagePreview}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                }}
                            />
                        )}
                    </div>

                    {/* Description */}
                    <div style={styles.field}>
                        <label style={styles.label}>Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your property features, nearby facilities, amenities, etc."
                            style={{...styles.input, minHeight: '100px', resize: 'vertical'}}
                            required
                        />
                    </div>

                    {/* Bedrooms, Bathrooms, Balconies */}
                    <div style={styles.row3}>
                        <div style={styles.field}>
                            <label style={styles.label}>🛏️ Bedrooms *</label>
                            <input
                                type="number"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                min="0"
                                max="20"
                                style={styles.input}
                                placeholder="2"
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>🚿 Bathrooms *</label>
                            <input
                                type="number"
                                name="bathrooms"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                min="0"
                                max="20"
                                style={styles.input}
                                placeholder="2"
                                required
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>🏠 Balconies</label>
                            <input
                                type="number"
                                name="balconies"
                                value={formData.balconies}
                                onChange={handleChange}
                                min="0"
                                max="10"
                                style={styles.input}
                                placeholder="1"
                            />
                        </div>
                    </div>

                    {/* Area and Price */}
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>📐 Area (sqft)</label>
                            <input
                                type="number"
                                name="areaSqft"
                                value={formData.areaSqft}
                                onChange={handleChange}
                                placeholder="1200"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>💰 Expected Price (₹) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="5000000 (for 50 Lacs)"
                                style={styles.input}
                                required
                            />
                        </div>
                    </div>

                    {/* Amenities */}
                    <div style={styles.field}>
                        <label style={styles.label}>✨ Amenities (comma-separated)</label>
                        <input
                            type="text"
                            name="amenities"
                            value={formData.amenities}
                            onChange={handleChange}
                            placeholder="Parking, Gym, Swimming Pool, 24/7 Security"
                            style={styles.input}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        style={{
                            ...styles.submitBtn,
                            opacity: loading ? 0.6 : 1,
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                        disabled={loading}
                    >
                        {loading ? '⏳ Posting Property...' : '📤 Post Property'}
                    </button>

                    <p style={{textAlign: 'center', fontSize: '12px', color: '#9ca3af', margin: '8px 0 0 0'}}>
                        * Required fields
                    </p>
                </form>
            </div>
        </div>
    );
}

const styles = {
    backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
    },
    modal: {
        background: 'white',
        padding: '2rem',
        borderRadius: '16px',
        width: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    },
    closeBtn: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        background: '#ef4444',
        color: 'white',
        border: 'none',
        fontSize: '24px',
        cursor: 'pointer',
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
    },
    title: {
        textAlign: 'center',
        marginBottom: '1rem',
        fontSize: '28px',
        color: '#1e293b',
        fontWeight: '800',
    },
    debugInfo: {
        background: '#dbeafe',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        marginBottom: '1rem',
        color: '#1e40af',
        border: '1px solid #93c5fd',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
    },
    row3: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '1rem',
    },
    label: {
        marginBottom: '6px',
        fontWeight: '700',
        fontSize: '14px',
        color: '#1e293b',
    },
    input: {
        padding: '12px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'inherit',
        transition: 'border-color 0.3s',
    },
    select: {
        padding: '12px 16px',
        border: '2px solid #e2e8f0',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        backgroundColor: 'white',
        transition: 'border-color 0.3s',
    },
    imageSection: {
        background: '#f8fafc',
        padding: '16px',
        borderRadius: '12px',
        border: '2px dashed #cbd5e1',
    },
    imageHelp: {
        marginTop: '8px',
        background: 'white',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
    },
    imagePreview: {
        marginTop: '12px',
        maxWidth: '100%',
        maxHeight: '200px',
        borderRadius: '8px',
        border: '2px solid #e2e8f0',
    },
    error: {
        background: '#fee2e2',
        border: '2px solid #fecaca',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '1rem',
        textAlign: 'center',
        color: '#dc3545',
        fontWeight: '600',
        fontSize: '14px',
    },
    submitBtn: {
        padding: '16px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        marginTop: '1rem',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
        transition: 'all 0.3s',
    },
};

export default PostPropertyModal;