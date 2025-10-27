import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles.js'; // Adjust path if needed

function CreateAgreementPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        ownerName: '', // Used as Seller Name
        tenantName: '', // Used as Buyer Name
        propertyAddress: '',
        startDate: '', // Used as Target Closing Date
        salePrice: 0,
        agreementType: 'Sale', // Explicitly set type
        status: 'DRAFT',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e) => {
        e.preventDefault();

        const agreementId = `AGR-${Date.now()}-${Math.floor(Math.random() * 999)}`;

        const newAgreement = {
            ...formData,
            agreementId,
            createdAt: new Date().toISOString(),
            // Basic short address for display
            propertyAddressShort: formData.propertyAddress.split(',')[0].trim(),
        };

        try {
            const agreementsRaw = localStorage.getItem('myAgreements');
            const existingAgreements = agreementsRaw ? JSON.parse(agreementsRaw) : [];

            const updatedAgreements = [newAgreement, ...existingAgreements];

            localStorage.setItem('myAgreements', JSON.stringify(updatedAgreements));

            console.log("Sale Agreement draft saved successfully:", newAgreement);

            navigate('/my-agreements');

        } catch (error) {
            console.error("Failed to save agreement to localStorage:", error);
            alert("Error: Could not save agreement. Please try again.");
        }
    };

    const formStyles = {
        label: {
            display: 'block',
            marginBottom: '5px',
            fontWeight: 600,
            color: '#1e293b',
            fontSize: '14px',
        },
        input: {
            width: '100%',
            padding: '12px',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontSize: '15px',
            marginBottom: '20px',
            boxSizing: 'border-box',
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '0 20px',
        }
    };

    return (
        <div style={styles.container}>
            {/* Page Header */}
            <div style={styles.pageHeader}>
                <button onClick={() => navigate(-1)} style={{ ...styles.secondaryBtn, marginBottom: '20px' }}>
                    ← Back to Agreements
                </button>
                <h1 style={styles.pageTitle}>Create New Sale Agreement</h1>
                <p style={styles.pageSubtitle}>Draft a new property sale agreement.</p>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <form onSubmit={handleSave}>
                    {/* Buyer & Seller Names */}
                    <div style={formStyles.grid}>
                        <div>
                            <label style={formStyles.label} htmlFor="ownerName">Seller Full Name (Current Owner)</label>
                            <input style={formStyles.input} type="text" id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={formStyles.label} htmlFor="tenantName">Buyer Full Name</label>
                            <input style={formStyles.input} type="text" id="tenantName" name="tenantName" value={formData.tenantName} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Property Address */}
                    <label style={formStyles.label} htmlFor="propertyAddress">Property Address (Full)</label>
                    <textarea style={{ ...formStyles.input, minHeight: '80px' }} id="propertyAddress" name="propertyAddress" value={formData.propertyAddress} onChange={handleChange} required />

                    {/* Closing Date & Price */}
                    <div style={formStyles.grid}>
                        <div>
                            <label style={formStyles.label} htmlFor="startDate">Closing Date (Target)</label>
                            <input style={formStyles.input} type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={formStyles.label} htmlFor="salePrice">Final Sale Price (INR)</label>
                            <input style={formStyles.input} type="number" id="salePrice" name="salePrice" value={formData.salePrice} onChange={handleChange} min="1" required />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" style={{ ...styles.postBtn, width: '100%', marginTop: '10px', backgroundColor: '#b91c1c' }}>
                        Save Sale Agreement Draft
                    </button>
                </form>
            </div>

            {/* ====================== DRAFT MANAGEMENT SECTION ====================== */}
            <div style={{ marginTop: '40px', backgroundColor: '#fff7ed', padding: '20px', borderRadius: '12px' }}>
                <h2 style={{ color: '#b91c1c', marginBottom: '15px' }}>🗂️ Manage Drafts</h2>
                <DraftList />
            </div>
        </div>
    );
}

// ====================== DRAFT LIST COMPONENT ======================
function DraftList() {
    const [drafts, setDrafts] = useState([]);

    // Load drafts from localStorage on mount
    React.useEffect(() => {
        const stored = localStorage.getItem('myAgreements');
        if (stored) {
            setDrafts(JSON.parse(stored));
        }
    }, []);

    const handleDelete = (agreementId) => {
        if (window.confirm("Are you sure you want to delete this draft?")) {
            const updated = drafts.filter(d => d.agreementId !== agreementId);
            setDrafts(updated);
            localStorage.setItem('myAgreements', JSON.stringify(updated));
        }
    };

    if (drafts.length === 0) {
        return <p style={{ color: '#475569' }}>No drafts saved yet.</p>;
    }

    return (
        <div>
            {drafts.map((draft) => (
                <div key={draft.agreementId} style={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '15px',
                    marginBottom: '10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <strong>{draft.propertyAddressShort || 'Unknown Property'}</strong>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Seller: {draft.ownerName} | Buyer: {draft.tenantName}
                        </p>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                            Date: {new Date(draft.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={() => handleDelete(draft.agreementId)}
                        style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        🗑️ Delete
                    </button>
                </div>
            ))}
        </div>
    );
}

export default CreateAgreementPage;
