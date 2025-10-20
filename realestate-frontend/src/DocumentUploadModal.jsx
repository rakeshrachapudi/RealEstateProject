import React, { useState } from 'react';
import { BACKEND_BASE_URL } from "./config/config";

const DocumentUploadModal = ({ dealId, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
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

        setUploading(true);
        setError(null);

        try {
            // Simulate upload to S3/storage
            const docUrl = `https://s3.amazonaws.com/deals/doc_${dealId}_${Date.now()}.pdf`;

            const response = await fetch(`${BACKEND_BASE_URL}/api/deals/${dealId}/upload-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ docUrl }),
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ Document uploaded successfully');
                onSuccess();
                onClose();
            } else {
                setError('Upload failed');
            }
        } catch (err) {
            setError('Error uploading document');
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
                <h2 style={{ marginTop: 0 }}>📄 Upload Document</h2>

                {error && (
                    <div style={{
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        padding: '12px',
                        borderRadius: '6px',
                        marginBottom: '15px',
                    }}>
                        {error}
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
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        id="fileInput"
                    />
                    <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📁</div>
                        <div style={{ fontWeight: '600', color: '#1e40af' }}>
                            {file ? file.name : 'Click to upload document'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            PDF, DOC, DOCX (Max 10MB)
                        </div>
                    </label>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '10px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
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
                            backgroundColor: uploading ? '#ccc' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: uploading ? 'not-allowed' : 'pointer',
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