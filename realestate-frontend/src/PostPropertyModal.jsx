// realestate-frontend/src/PostPropertyModal.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';

function PostPropertyModal({ onClose, onPropertyPosted }) {
    const { user, isAuthenticated } = useAuth();
    const [areas, setAreas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [areasLoading, setAreasLoading] = useState(true);
    const [imageUploading, setImageUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        type: 'Apartment',
        listingType: 'sale',
        city: 'Hyderabad',
        areaId: '',
        address: '',
        imageUrl: '',
        bedrooms: '',
        bathrooms: '',
        balconies: '',
        areaSqft: '',
        price: '',
        amenities: '',
        description: '',
        ownerType: 'owner', // NEW: owner or broker
        isReadyToMove: false, // NEW: ready to move checkbox
    });

    const CLOUDINARY_CLOUD_NAME = 'diw5av4fw';
    const CLOUDINARY_UPLOAD_PRESET = 'ml_default';

    useEffect(() => {
        loadAreas();
    }, []);

    const loadAreas = async () => {
        setAreasLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/areas?city=Hyderabad');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setAreas(data.data);
                setError(null);
            } else {
                setError('Invalid response format');
            }
        } catch (err) {
            setError(`Failed to load areas: ${err.message}`);
            setAreas([]);
        } finally {
            setAreasLoading(false);
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
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError(null);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return alert('Please select an image file');
        if (file.size > 10 * 1024 * 1024) return alert('File too large (max 10MB)');

        setImageUploading(true);
        setUploadProgress(10);

        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            setUploadProgress(30);
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: fd
            });

            setUploadProgress(70);
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Upload failed: ${errorData.error?.message || res.statusText}`);
            }

            const data = await res.json();
            setUploadProgress(100);
            setFormData(p => ({...p, imageUrl: data.secure_url}));
            setTimeout(() => setUploadProgress(0), 2000);
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setImageUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.title || !formData.areaId || !formData.imageUrl ||
            !formData.bedrooms || !formData.bathrooms || !formData.price ||
            !formData.description) {
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
            address: formData.address || `Area ID ${formData.areaId}, ${formData.city}`,
            imageUrl: formData.imageUrl,
            description: formData.description,
            price: numericPrice,
            priceDisplay: priceDisplay,
            areaSqft: formData.areaSqft ? parseFloat(formData.areaSqft) : null,
            bedrooms: parseInt(formData.bedrooms),
            bathrooms: parseInt(formData.bathrooms),
            balconies: formData.balconies ? parseInt(formData.balconies) : 0,
            amenities: formData.amenities || null,
            listingType: formData.listingType,
            status: 'available',
            isFeatured: true,
            isActive: true,
            ownerType: formData.ownerType,
            isReadyToMove: formData.isReadyToMove,
            isVerified: false,
            area: { id: parseInt(formData.areaId) },
            user: { id: user.id }
        };

        console.log('📤 Submitting property data:', propertyData);

        try {
            const token = localStorage.getItem('authToken');

            const response = await fetch('http://localhost:8080/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(propertyData)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Failed to post property: ' + errorText);
            }

            const result = await response.json();
            console.log('✅ Property created successfully:', result);

            alert('✅ Property posted successfully!');
            if (onPropertyPosted) onPropertyPosted();
            onClose();
        } catch (err) {
            console.error('❌ Error posting property:', err);
            setError(err.message || 'Failed to post property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.backdrop} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={styles.closeBtn}>×</button>
                <h2 style={styles.title}>📝 Post Your Property</h2>

                {error && <div style={styles.error}>❌ {error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.field}>
                        <label style={styles.label}>Property Title *</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange}
                            placeholder="e.g., Spacious 2BHK Apartment" style={styles.input} required />
                    </div>

                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>Property Type *</label>
                            <select name="type" value={formData.type} onChange={handleChange} style={styles.select} required>
                                <option>Apartment</option>
                                <option>Villa</option>
                                <option>House</option>
                                <option>Plot</option>
                                <option>Commercial</option>
                                <option>Penthouse</option>
                                <option>Studio</option>
                                <option>Duplex</option>
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

                    {/* NEW: Owner Type and Ready to Move */}
                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>👤 Posted By *</label>
                            <select name="ownerType" value={formData.ownerType} onChange={handleChange} style={styles.select} required>
                                <option value="owner">Owner</option>
                                <option value="broker">Broker/Agent</option>
                            </select>
                        </div>
                        <div style={styles.field}>
                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="isReadyToMove"
                                    checked={formData.isReadyToMove}
                                    onChange={handleChange}
                                    style={styles.checkbox}
                                />
                                <span style={styles.checkboxText}>✅ Ready to Move</span>
                            </label>
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>City *</label>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} style={styles.input} required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>
                                📍 Area * {areasLoading && <span style={{color: '#f59e0b'}}> (Loading...)</span>}
                                {!areasLoading && areas.length > 0 && <span style={{color: '#10b981'}}> ({areas.length} available)</span>}
                            </label>
                            <select name="areaId" value={formData.areaId} onChange={handleChange}
                                style={styles.select} required disabled={areasLoading || areas.length === 0}>
                                <option value="">
                                    {areasLoading ? '⏳ Loading...' : areas.length === 0 ? '❌ No areas' : '-- Select Area --'}
                                </option>
                                {areas.map((area) => (
                                    <option key={area.areaId} value={area.areaId}>
                                        {area.areaName} ({area.pincode})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Complete Address (Optional)</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange}
                            placeholder="House/Plot number, Street name" style={styles.input} />
                    </div>

                    <div style={{...styles.imageSection, border: '2px solid #3b82f6', background: '#f0f9ff'}}>
                        <h3 style={{margin: '0 0 12px 0', fontSize: '16px', color: '#1e40af', fontWeight: '700'}}>
                            📁 Upload Property Image *
                        </h3>
                        {!formData.imageUrl ? (
                            <>
                                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={imageUploading}
                                    style={{display: 'block', width: '100%', padding: '16px', border: '3px dashed #3b82f6',
                                        borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer', fontSize: '16px',
                                        fontWeight: '600', color: '#1e40af'}} />
                                {imageUploading && (
                                    <div style={{marginTop: '12px'}}>
                                        <div style={{width: '100%', height: '10px', background: '#e0e7ff', borderRadius: '5px'}}>
                                            <div style={{width: `${uploadProgress}%`, height: '100%', background: '#3b82f6',
                                                borderRadius: '5px', transition: 'width 0.3s'}}></div>
                                        </div>
                                        <p style={{margin: '8px 0 0 0', color: '#3b82f6', fontWeight: '600'}}>
                                            Uploading {uploadProgress}%
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{textAlign: 'center'}}>
                                <div style={{background: '#d1fae5', color: '#065f46', padding: '12px',
                                    borderRadius: '8px', fontWeight: '600', marginBottom: '12px'}}>
                                    ✅ Image uploaded!
                                </div>
                                <img src={formData.imageUrl} alt="Preview" style={styles.imagePreview} />
                                <button type="button" onClick={() => setFormData(p => ({...p, imageUrl: ''}))}
                                    style={{marginTop: '12px', padding: '10px 20px', background: '#ef4444',
                                        color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer',
                                        fontWeight: '600'}}>🗑️ Remove</button>
                            </div>
                        )}
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>Description *</label>
                        <textarea name="description" value={formData.description} onChange={handleChange}
                            placeholder="Describe your property..." style={{...styles.input, minHeight: '100px', resize: 'vertical'}} required />
                    </div>

                    <div style={styles.row3}>
                        <div style={styles.field}>
                            <label style={styles.label}>🛏️ Bedrooms *</label>
                            <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange}
                                min="0" max="20" style={styles.input} placeholder="2" required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>🚿 Bathrooms *</label>
                            <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleChange}
                                min="0" max="20" style={styles.input} placeholder="2" required />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>🏠 Balconies</label>
                            <input type="number" name="balconies" value={formData.balconies} onChange={handleChange}
                                min="0" max="10" style={styles.input} placeholder="1" />
                        </div>
                    </div>

                    <div style={styles.row}>
                        <div style={styles.field}>
                            <label style={styles.label}>📐 Area (sqft)</label>
                            <input type="number" name="areaSqft" value={formData.areaSqft} onChange={handleChange}
                                placeholder="1200" style={styles.input} />
                        </div>
                        <div style={styles.field}>
                            <label style={styles.label}>💰 Expected Price (₹) *</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange}
                                placeholder="5000000" style={styles.input} required />
                        </div>
                    </div>

                    <div style={styles.field}>
                        <label style={styles.label}>✨ Amenities (comma-separated)</label>
                        <input type="text" name="amenities" value={formData.amenities} onChange={handleChange}
                            placeholder="Parking, Gym, Swimming Pool" style={styles.input} />
                    </div>

                    <button type="submit" disabled={loading || imageUploading}
                        style={{...styles.submitBtn, opacity: (loading || imageUploading) ? 0.6 : 1,
                            cursor: (loading || imageUploading) ? 'not-allowed' : 'pointer'}}>
                        {loading ? '⏳ Posting...' : imageUploading ? '⏳ Uploading...' : '📤 Post Property'}
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
    backdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modal: { background: 'white', padding: '2rem', borderRadius: '16px', width: '750px', maxHeight: '90vh',
        overflowY: 'auto', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
    closeBtn: { position: 'absolute', top: '15px', right: '15px', background: '#ef4444', color: 'white',
        border: 'none', fontSize: '24px', cursor: 'pointer', width: '40px', height: '40px', borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    title: { textAlign: 'center', marginBottom: '1rem', fontSize: '28px', color: '#1e293b', fontWeight: '800' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    field: { display: 'flex', flexDirection: 'column' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    row3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' },
    label: { marginBottom: '6px', fontWeight: '700', fontSize: '14px', color: '#1e293b' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
        background: '#f0f9ff', borderRadius: '8px', cursor: 'pointer', border: '2px solid #bfdbfe' },
    checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
    checkboxText: { fontSize: '14px', fontWeight: '600', color: '#1e40af' },
    input: { padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px',
        fontFamily: 'inherit', transition: 'border-color 0.3s' },
    select: { padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: '8px', fontSize: '14px',
        cursor: 'pointer', fontFamily: 'inherit', backgroundColor: 'white' },
    imageSection: { padding: '16px', borderRadius: '12px' },
    imagePreview: { marginTop: '12px', maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '2px solid #e2e8f0' },
    error: { background: '#fee2e2', border: '2px solid #fecaca', borderRadius: '8px', padding: '12px',
        marginBottom: '1rem', textAlign: 'center', color: '#dc3545', fontWeight: '600', fontSize: '14px' },
    submitBtn: { padding: '16px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white',
        border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '1rem',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }
};

export default PostPropertyModal;