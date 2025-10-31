import React, { useState } from 'react';
import { BACKEND_BASE_URL } from "./config/config";

const DocumentUploadModal = ({ dealId, propertyId, onClose, onSuccess, docType = null }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    // Get document type label
    const getDocTypeLabel = () => {
        if (!docType) return 'Document';
        if (docType === 'AGREEMENT') return 'Agreement Document';
        if (docType === 'REGISTRATION') return 'Registration Document';
        return 'Document';
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file size (10MB)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                return;
            }

            // Validate file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];

            if (!allowedTypes.includes(selectedFile.type)) {
                setError('Invalid file type. Only PDF, DOC, DOCX allowed');
                return;
            }

            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        if (!propertyId) {
            setError('Property ID is required');
            return;
        }

        // If docType is provided, dealId is required
        if (docType && !dealId) {
            setError('Deal ID is required for stage-specific documents');
            return;
        }

        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            // Determine endpoint based on whether this is a deal document
            let uploadEndpoint;

            if (docType && dealId) {
                // Stage-specific deal document (AGREEMENT or REGISTRATION)
                uploadEndpoint = `${BACKEND_BASE_URL}/api/upload/deal-document?dealId=${dealId}&propertyId=${propertyId}&docType=${docType}`;
            } else if (dealId) {
                // General deal document (no specific type)
                uploadEndpoint = `${BACKEND_BASE_URL}/api/upload/deal-document?dealId=${dealId}&propertyId=${propertyId}`;
            } else {
                // Property document (no deal)
                uploadEndpoint = `${BACKEND_BASE_URL}/api/upload/document?propertyId=${propertyId}`;
            }

            console.log('📤 Uploading to:', uploadEndpoint);
            console.log('📄 Document type:', docType || 'General');

            const response = await fetch(uploadEndpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Document uploaded to:', data.url);
                alert(`✅ ${getDocTypeLabel()} uploaded successfully!`);
                onSuccess(data.url, docType);
                onClose();
            } else {
                setError(data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('❌ Upload error:', err);
            setError('Error uploading document: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    };

    const contentStyle = {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        width: '400px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <h2 style={{ marginTop: 0 }}>
                    📄 Upload {getDocTypeLabel()}
                </h2>

                {docType && (
                    <div style={{
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '15px',
                        fontSize: '14px',
                    }}>
                        ℹ️ This document is required to proceed to the next stage
                    </div>
                )}

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '15px',
                    }}>
                        ❌ {error}
                    </div>
                )}

                <div style={{
                    padding: '30px',
                    border: '2px dashed #3b82f6',
                    borderRadius: '8px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#f0f9ff',
                    marginBottom: '15px',
                }}>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        style={{ display: 'none' }}
                        id="fileInput"
                    />
                    <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                        <div style={{ fontWeight: '600', color: '#1e40af' }}>
                            {file ? file.name : `Click to upload ${getDocTypeLabel()}`}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                            PDF, DOC, DOCX (Max 10MB)
                        </div>
                        {file && (
                            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>
                                ✓ {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                        )}
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: uploading ? '#9ca3af' : '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: !file || uploading ? '#ccc' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: !file || uploading ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                        }}
                    >
                        {uploading ? '⏳ Uploading...' : '✅ Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentUploadModal;