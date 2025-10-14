import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext.jsx';
import { uploadMultipleImages } from './config/cloudinary';
import { getPropertyTypes, getAreas } from './services/api';

function PostPropertyModal({ onClose, onPropertyPosted }) {
    const { user, isAuthenticated } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        propertyType: '',
        listingType: 'sale',
        city: 'Hyderabad',
        area: '',
        address: '',
        bedrooms: '',
        bathrooms: '',
        areaSqft: '',
        price: '',
        description: '',
        amenities: '',
        status: 'available',
        isFeatured: false
    });

    // Image handling state
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');

    // Dropdown data
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [areas, setAreas] = useState([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        loadPropertyTypes();
        loadAreas();
    }, []);

    const loadPropertyTypes = async () => {
        try {
            const response = await getPropertyTypes();
            if (response && response.success) {
                setPropertyTypes(response.data);
            }
        } catch (error) {
            console.error('Error loading property types:', error);
        }
    };

    const loadAreas = async () => {
        try {
            const response = await getAreas(formData.city);
            if (response && response.success) {
                setAreas(response.data);
            }
        } catch (error) {
            console.error('Error loading areas:', error);
        }
    };

    useEffect(() => {
        if (formData.city) {
            loadAreas();
        }
    }, [formData.city]);

    if (!isAuthenticated || !user) {
        return (
            <div style={styles.modalBackdrop} onClick={onClose}>
                <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <h2>⚠️ Authentication Required</h2>
                    <p>Please login to post a property.</p>
                    <button onClick={onClose} style={styles.buttonPrimary}>Close</button>
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
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);

        if (files.length + images.length > 10) {
            setError('Maximum 10 images allowed');
            return;
        }

        const validFiles = files.filter(file => {
            const isValidType = file.type.startsWith('image/');
            const isValidSize = file.size <= 5 * 1024 * 1024;

            if (!isValidType) {
                setError('Only image files are allowed');
                return false;
            }
            if (!isValidSize) {
                setError(`File ${file.name} is too large. Maximum size is 5MB.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setImages(prev => [...prev, ...validFiles]);

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, {
                    file: file,
                    preview: reader.result,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        });

        setError(null);
    };

    const handleRemoveImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const moveImage = (index, direction) => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= images.length) return;

        const newImages = [...images];
        const newPreviews = [...imagePreviews];

        [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
        [newPreviews[index], newPreviews[newIndex]] = [newPreviews[newIndex], newPreviews[index]];

        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const validateForm = () => {
        const requiredFields = [
            { field: 'title', label: 'Property Title' },
            { field: 'propertyType', label: 'Property Type' },
            { field: 'listingType', label: 'Listing Type' },
            { field: 'city', label: 'City' },
            { field: 'bedrooms', label: 'Bedrooms' },
            { field: 'bathrooms', label: 'Bathrooms' },
            { field: 'price', label: 'Price' },
            { field: 'description', label: 'Description' }
        ];

        for (const { field, label } of requiredFields) {
            if (!formData[field] || String(formData[field]).trim() === '') {
                setError(`Please fill in the '${label}' field.`);
                return false;
            }
        }

        if (images.length === 0) {
            setError('Please upload at least one image');
            return false;
        }

        if (parseFloat(formData.price) <= 0) {
            setError('Price must be greater than 0');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            setUploadingImages(true);
            setUploadProgress(`Uploading ${images.length} image(s) to cloud...`);

            const uploadResults = await uploadMultipleImages(images);

            if (uploadResults.length === 0) {
                throw new Error('Failed to upload images to Cloudinary. Please check your configuration.');
            }

            setUploadProgress(`✅ ${uploadResults.length} image(s) uploaded successfully!`);
            setUploadingImages(false);

            const mainImageUrl = uploadResults[0].url;

            const numericPrice = parseFloat(formData.price);
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
                type: formData.propertyType,
                city: formData.city,
                imageUrl: mainImageUrl,
                priceDisplay: priceDisplay,
                description: formData.description,
                address: formData.address || null,
                price: numericPrice,
                areaSqft: formData.areaSqft ? parseFloat(formData.areaSqft) : null,
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                amenities: formData.amenities || null,
                status: formData.status,
                listingType: formData.listingType,
                isFeatured: formData.isFeatured,
                isActive: true,
                user: { id: user.id }
            };

            if (formData.area) {
                const selectedArea = areas.find(a => a.areaName === formData.area);
                if (selectedArea) {
                    propertyData.area = { areaId: selectedArea.areaId };
                }
            }

            setUploadProgress('💾 Saving property to database...');

            const response = await fetch('http://localhost:8080/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(propertyData),
            });

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`Failed to post property: ${errorData}`);
            }

            const newProperty = await response.json();

            setUploadProgress('🎉 Property posted successfully!');

            setTimeout(() => {
                onPropertyPosted(newProperty);
                onClose();
            }, 1000);

        } catch (err) {
            console.error('Error posting property:', err);
            setError(err.message || 'Failed to post property. Please try again.');
            setUploadProgress('');
        } finally {
            setLoading(false);
            setUploadingImages(false);
        }
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.title || !formData.propertyType || !formData.listingType) {
                setError('Please fill in all required fields');
                return;
            }
        }
        if (currentStep === 2) {
            if (images.length === 0) {
                setError('Please upload at least one image');
                return;
            }
        }
        setError(null);
        setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        setError(null);
        setCurrentStep(prev => prev - 1);
    };

    return (
        <div style={styles.modalBackdrop} onClick={onClose}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={styles.closeButton}>&times;</button>

                <h2 style={styles.title}>🏠 Post Your Property</h2>

                <div style={styles.progressSteps}>
                    <div style={{...styles.step, ...(currentStep >= 1 ? styles.stepActive : {})}}>
                        <div style={styles.stepNumber}>1</div>
                        <div style={styles.stepLabel}>Basic Info</div>
                    </div>
                    <div style={styles.stepLine}></div>
                    <div style={{...styles.step, ...(currentStep >= 2 ? styles.stepActive : {})}}>
                        <div style={styles.stepNumber}>2</div>
                        <div style={styles.stepLabel}>Images</div>
                    </div>
                    <div style={styles.stepLine}></div>
                    <div style={{...styles.step, ...(currentStep >= 3 ? styles.stepActive : {})}}>
                        <div style={styles.stepNumber}>3</div>
                        <div style={styles.stepLabel}>Details</div>
                    </div>
                </div>

                {error && <div style={styles.error}>⚠️ {error}</div>}
                {uploadProgress && <div style={styles.progress}>{uploadProgress}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    {currentStep === 1 && (
                        <div style={styles.formSection}>
                            <h3 style={styles.sectionTitle}>📋 Basic Information</h3>

                            <label style={styles.label}>Property Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., Spacious 3BHK Apartment in Gachibowli"
                                style={styles.input}
                            />

                            <label style={styles.label}>Property Type *</label>
                            <select
                                name="propertyType"
                                value={formData.propertyType}
                                onChange={handleChange}
                                style={styles.select}
                            >
                                <option value="">Select Property Type</option>
                                {propertyTypes.map(type => (
                                    <option key={type.propertyTypeId} value={type.typeName}>
                                        {type.typeName}
                                    </option>
                                ))}
                            </select>

                            <label style={styles.label}>Listing Type *</label>
                            <div style={styles.radioGroup}>
                                <label style={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="listingType"
                                        value="sale"
                                        checked={formData.listingType === 'sale'}
                                        onChange={handleChange}
                                        style={styles.radio}
                                    />
                                    🏠 For Sale
                                </label>
                                <label style={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        name="listingType"
                                        value="rent"
                                        checked={formData.listingType === 'rent'}
                                        onChange={handleChange}
                                        style={styles.radio}
                                    />
                                    🔑 For Rent
                                </label>
                            </div>

                            <div style={styles.gridTwo}>
                                <div>
                                    <label style={styles.label}>City *</label>
                                    <select
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        style={styles.select}
                                    >
                                        <option value="Hyderabad">Hyderabad</option>
                                        <option value="Bangalore">Bangalore</option>
                                        <option value="Mumbai">Mumbai</option>
                                        <option value="Delhi">Delhi</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.label}>Area</label>
                                    <select
                                        name="area"
                                        value={formData.area}
                                        onChange={handleChange}
                                        style={styles.select}
                                    >
                                        <option value="">Select Area</option>
                                        {areas.map(area => (
                                            <option key={area.areaId} value={area.areaName}>
                                                {area.areaName} ({area.pincode})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <label style={styles.label}>Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="e.g., Plot No 123, Road No 45"
                                style={styles.input}
                            />

                            <button type="button" onClick={nextStep} style={styles.buttonPrimary}>
                                Next: Upload Images →
                            </button>
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div style={styles.formSection}>
                            <h3 style={styles.sectionTitle}>📸 Property Images</h3>
                            <p style={styles.helpText}>Upload up to 10 images (5MB each). First image will be the main display image.</p>

                            <div
                                style={styles.imageUploadArea}
                                onClick={() => document.getElementById('imageInput').click()}
                            >
                                <div style={styles.uploadIcon}>📷</div>
                                <p style={styles.uploadText}>Click to upload images</p>
                                <p style={styles.uploadSubtext}>PNG, JPG, JPEG (max 5MB each)</p>
                            </div>

                            <input
                                id="imageInput"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />

                            {imagePreviews.length > 0 && (
                                <div style={styles.imagePreviewGrid}>
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} style={styles.imagePreview}>
                                            <img
                                                src={preview.preview}
                                                alt={`Preview ${index + 1}`}
                                                style={styles.previewImage}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                style={styles.removeImageButton}
                                            >
                                                ×
                                            </button>
                                            {index === 0 && (
                                                <div style={styles.mainBadge}>MAIN</div>
                                            )}
                                            <div style={styles.imageControls}>
                                                {index > 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => moveImage(index, 'up')}
                                                        style={styles.moveButton}
                                                    >
                                                        ←
                                                    </button>
                                                )}
                                                {index < imagePreviews.length - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => moveImage(index, 'down')}
                                                        style={styles.moveButton}
                                                    >
                                                        →
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div style={styles.buttonGroup}>
                                <button type="button" onClick={prevStep} style={styles.buttonSecondary}>
                                    ← Back
                                </button>
                                <button type="button" onClick={nextStep} style={styles.buttonPrimary}>
                                    Next: Property Details →
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div style={styles.formSection}>
                            <h3 style={styles.sectionTitle}>🏗️ Property Details</h3>

                            <div style={styles.gridThree}>
                                <div>
                                    <label style={styles.label}>Bedrooms *</label>
                                    <input
                                        type="number"
                                        name="bedrooms"
                                        value={formData.bedrooms}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="3"
                                        style={styles.input}
                                    />
                                </div>
                                <div>
                                    <label style={styles.label}>Bathrooms *</label>
                                    <input
                                        type="number"
                                        name="bathrooms"
                                        value={formData.bathrooms}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="2"
                                        style={styles.input}
                                    />
                                </div>
                                <div>
                                    <label style={styles.label}>Area (sq ft)</label>
                                    <input
                                        type="number"
                                        name="areaSqft"
                                        value={formData.areaSqft}
                                        onChange={handleChange}
                                        min="0"
                                        placeholder="1850"
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            <label style={styles.label}>
                                {formData.listingType === 'sale' ? 'Sale Price (₹) *' : 'Monthly Rent (₹) *'}
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder={formData.listingType === 'sale' ? '12000000' : '35000'}
                                min="0"
                                style={styles.input}
                            />

                            <label style={styles.label}>Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe your property..."
                                rows="5"
                                style={styles.textarea}
                            />

                            <label style={styles.label}>Amenities</label>
                            <input
                                type="text"
                                name="amenities"
                                value={formData.amenities}
                                onChange={handleChange}
                                placeholder="Parking, Gym, Pool, Security"
                                style={styles.input}
                            />

                            <label style={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                    style={styles.checkbox}
                                />
                                ⭐ Mark as Featured Property
                            </label>

                            <div style={styles.buttonGroup}>
                                <button type="button" onClick={prevStep} style={styles.buttonSecondary}>
                                    ← Back
                                </button>
                                <button
                                    type="submit"
                                    style={{
                                        ...styles.buttonSuccess,
                                        opacity: loading || uploadingImages ? 0.6 : 1
                                    }}
                                    disabled={loading || uploadingImages}
                                >
                                    {uploadingImages ? '📤 Uploading...' : loading ? '💾 Saving...' : '🚀 Post Property'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

const styles = {
    modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0, 0, 0, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflowY: 'auto', padding: '20px' },
    modalContent: { background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', fontFamily: 'system-ui', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', margin: 'auto' },
    closeButton: { position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: '#f3f4f6', fontSize: '2rem', cursor: 'pointer', color: '#6b7280', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
    title: { marginTop: 0, marginBottom: '1.5rem', textAlign: 'center', color: '#1f2937', fontSize: '28px', fontWeight: '700' },
    progressSteps: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', gap: '0.5rem' },
    step: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
    stepActive: { color: '#3b82f6' },
    stepNumber: { width: '36px', height: '36px', borderRadius: '50%', background: '#e5e7eb', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' },
    stepLabel: { fontSize: '12px', fontWeight: '600', color: 'inherit' },
    stepLine: { width: '60px', height: '2px', background: '#e5e7eb', marginTop: '-20px' },
    error: { color: '#dc2626', background: '#fee2e2', padding: '12px 16px', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '14px', fontWeight: '600' },
    progress: { background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', fontSize: '14px', fontWeight: '600' },
    form: { width: '100%' },
    formSection: { width: '100%' },
    sectionTitle: { fontSize: '20px', fontWeight: '700', color: '#374151', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' },
    helpText: { fontSize: '14px', color: '#6b7280', marginBottom: '1rem' },
    label: { display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#374151', fontSize: '14px' },
    input: { width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', marginBottom: '1rem', boxSizing: 'border-box', fontFamily: 'inherit' },
    select: { width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', marginBottom: '1rem', boxSizing: 'border-box', background: 'white', cursor: 'pointer', fontFamily: 'inherit' },
    textarea: { width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', marginBottom: '1rem', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' },
    radioGroup: { display: 'flex', gap: '1rem', marginBottom: '1rem' },
    radioLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '12px 20px', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', flex: 1, justifyContent: 'center' },
    radio: { width: '18px', height: '18px', cursor: 'pointer' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', fontWeight: '600', marginBottom: '1rem', background: '#f9fafb' },
    checkbox: { width: '20px', height: '20px', cursor: 'pointer' },
    gridTwo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
    gridThree: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' },
    imageUploadArea: { border: '2px dashed #cbd5e1', borderRadius: '12px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem', cursor: 'pointer', background: '#f8fafc' },
    uploadIcon: { fontSize: '48px', marginBottom: '1rem' },
    uploadText: { margin: '0 0 0.5rem', color: '#475569', fontWeight: '600', fontSize: '16px' },
    uploadSubtext: { margin: 0, fontSize: '13px', color: '#94a3b8' },
    imagePreviewGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px', marginBottom: '1.5rem' },
    imagePreview: { position: 'relative', paddingBottom: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid #e5e7eb', background: '#f9fafb' },
    previewImage: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' },
    removeImageButton: { position: 'absolute', top: '8px', right: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', lineHeight: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
    mainBadge: { position: 'absolute', bottom: '8px', left: '8px', background: '#10b981', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' },
    imageControls: { position: 'absolute', bottom: '8px', right: '8px', display: 'flex', gap: '4px' },
    moveButton: { background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', width: '24px', height: '24px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' },
    buttonGroup: { display: 'flex', gap: '12px', marginTop: '1.5rem' },
    buttonPrimary: { flex: 1, padding: '14px 24px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' },
    buttonSecondary: { flex: 1, padding: '14px 24px', background: '#f3f4f6', color: '#374151', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
    buttonSuccess: { flex: 1, padding: '14px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }
};

export default PostPropertyModal;