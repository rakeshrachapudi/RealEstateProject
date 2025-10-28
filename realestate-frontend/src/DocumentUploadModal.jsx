import React, { useState } from 'react';
import { BACKEND_BASE_URL } from "./config/config";

const DocumentUploadModal = ({ dealId, propertyId, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

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

        setUploading(true);
        setError(null);

        try {
            // ✅ ACTUAL FILE UPLOAD using FormData
            const formData = new FormData();
            formData.append('file', file);

            // Use the new backend endpoint
            const uploadEndpoint = dealId
                ? `${BACKEND_BASE_URL}/api/upload/deal-document?dealId=${dealId}&propertyId=${propertyId}`
                : `${BACKEND_BASE_URL}/api/upload/document?propertyId=${propertyId}`;

            console.log('📤 Uploading to:', uploadEndpoint);

            const response = await fetch(uploadEndpoint, {
                method: 'POST',
                body: formData,
                // ⚠️ DO NOT set Content-Type header - browser sets it automatically with boundary
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Document uploaded to:', data.url);

                // Optional: If you need to save the document URL to the deal in database
                if (dealId && data.url) {
                    await saveDealDocumentUrl(dealId, data.url);
                }

                alert('✅ Document uploaded successfully');
                onSuccess(data.url); // Pass the URL back to parent
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

    // Optional: Save document URL to deal record in database
    const saveDealDocumentUrl = async (dealId, docUrl) => {
        try {
            // If you have an endpoint to update deal with document URL
            await fetch(`${BACKEND_BASE_URL}/api/deals/${dealId}/add-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ documentUrl: docUrl }),
            });
        } catch (err) {
            console.error('Error saving document URL to deal:', err);
            // Not critical - file is already uploaded to S3
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
                <h2 style={{ marginTop: 0 }}>📄 Upload Document</h2>

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
                            {file ? file.name : 'Click to upload document'}
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