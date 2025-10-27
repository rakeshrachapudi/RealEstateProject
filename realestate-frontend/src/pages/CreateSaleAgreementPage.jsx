// src/pages/CreateSaleAgreementPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { styles } from '../styles.js'; // Adjust path if needed

// --- Template for a person (Seller, Buyer) ---
const personTemplate = {
    name: '',
    so_wo: 'S/o', // S/o or W/o
    relationName: '', // Father/Husband Name
    age: '',
    occupation: '',
    address: '',
    phone: '',
    idType: 'Aadhaar',
    idNumber: '',
};

// --- UPDATED: Initial State for a Person-to-Person Sale Agreement ---
const initialFormData = {
    // --- Execution ---
    executionCity: '',
    startDate: '', // Execution Date

    // --- Parties ---
    sellers: [{ ...personTemplate }], // Array of sellers
    buyers: [{ ...personTemplate }], // Array of buyers

    // --- Property & Consideration ---
    propertyAddress: '', // Full address of the property being sold
    propertyType: 'Residential House', // e.g., House, Apartment
    acquisitionMethod: '', // How seller got the property
    totalConsideration: '',

    // --- Schedule 'A' (Property Details) ---
    landSurveyNos: '',
    landVillage: '',
    landMandal: '',
    landDistrict: '',
    landTotalArea: '', // e.g., 200 Sq. Yds.

    // --- Schedule 'B' (Boundaries) ---
    scheduleBoundsNorth: '',
    scheduleBoundsSouth: '',
    scheduleBoundsEast: '',
    scheduleBoundsWest: '',

    // --- Metadata ---
    agreementType: 'Sale Agreement',
    status: 'DRAFT',
};

// --- Main Page Component ---
function CreateSaleAgreementPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);

    // Generic handler for top-level fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Generic handler for array fields (sellers, buyers)
    const handleArrayChange = (section, index, e) => {
        const { name, value } = e.target;
        const updatedArray = [...formData[section]];
        updatedArray[index] = { ...updatedArray[index], [name]: value };
        setFormData(prev => ({ ...prev, [section]: updatedArray }));
    };

    // Generic add item to array
    const handleAddItem = (section) => {
        setFormData(prev => ({
            ...prev,
            [section]: [...prev[section], { ...personTemplate }]
        }));
    };

    // Generic remove item from array
    const handleRemoveItem = (section, index) => {
        const updatedArray = [...formData[section]];
        updatedArray.splice(index, 1);
        setFormData(prev => ({ ...prev, [section]: updatedArray }));
    };


    const handleSave = (e) => {
        e.preventDefault();

        const agreementId = `AGMT-${Date.now()}`;

        const newAgreement = {
            ...formData,
            agreementId,
            createdAt: new Date().toISOString(),
            // --- Keys for MyAgreementsPage card ---
            saleAmount: formData.totalConsideration,
            vendorName: formData.sellers[0]?.name || 'N/A', // Use first seller's name
            buyerName: formData.buyers[0]?.name || 'N/A', // Use first buyer's name
            propertyAddressShort: formData.propertyAddress.split(',')[0].trim() || 'Untitled Property',
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

    // --- Styles ---
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
        },
        grid3: {
             display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0 20px',
        },
        sectionTitle: {
            fontSize: '20px',
            fontWeight: 700,
            color: '#b91c1c',
            borderBottom: '2px solid #fde2e2',
            paddingBottom: '8px',
            marginTop: '25px',
            marginBottom: '20px',
        },
        itemContainer: {
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8fafc',
            position: 'relative',
            marginBottom: '20px',
        },
        removeButton: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            lineHeight: '28px',
            textAlign: 'center',
        },
        addButton: {
            ...styles.secondaryBtn, // Assuming styles.secondaryBtn exists
            backgroundColor: '#f1f5f9',
            color: '#0f172a',
            border: '1px solid #cbd5e1',
            width: '100%',
            marginTop: '0px',
            marginBottom: '20px'
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
                <p style={styles.pageSubtitle}>Draft a new person-to-person property sale agreement.</p>
            </div>

            <div style={{ padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <form onSubmit={handleSave}>

                    {/* --- EXECUTION --- */}
                    <h2 style={formStyles.sectionTitle}>1. Execution Details</h2>
                    <div style={formStyles.grid}>
                        <div>
                            <label style={formStyles.label} htmlFor="startDate">Execution Date (Signing Date)</label>
                            <input style={formStyles.input} type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required />
                        </div>
                        <div>
                            <label style={formStyles.label} htmlFor="executionCity">Execution City</label>
                            <input style={formStyles.input} type="text" id="executionCity" name="executionCity" value={formData.executionCity} onChange={handleChange} />
                        </div>
                    </div>

                    {/* --- SELLER(S) --- */}
                    <h2 style={formStyles.sectionTitle}>2. Seller(s) Details</h2>
                    {formData.sellers.map((seller, index) => (
                        <div key={index} style={formStyles.itemContainer}>
                            {formData.sellers.length > 1 && (
                                <button type="button" style={formStyles.removeButton} onClick={() => handleRemoveItem('sellers', index)}>×</button>
                            )}
                            <p style={{fontWeight: 600, marginTop: 0, color: '#334155'}}>Seller {index + 1}</p>
                            <div style={formStyles.grid3}>
                                <div>
                                    <label style={formStyles.label}>Full Name</label>
                                    <input style={formStyles.input} type="text" name="name" value={seller.name} onChange={(e) => handleArrayChange('sellers', index, e)} required />
                                </div>
                                <div>
                                    <label style={formStyles.label}>S/o or W/o</label>
                                    <select style={formStyles.input} name="so_wo" value={seller.so_wo} onChange={(e) => handleArrayChange('sellers', index, e)}>
                                        <option value="S/o">S/o (Son of)</option>
                                        <option value="W/o">W/o (Wife of)</option>
                                        <option value="D/o">D/o (Daughter of)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={formStyles.label}>Father/Husband Name</label>
                                    <input style={formStyles.input} type="text" name="relationName" value={seller.relationName} onChange={(e) => handleArrayChange('sellers', index, e)} />
                                </div>
                                <div>
                                    <label style={formStyles.label}>Age</label>
                                    <input style={formStyles.input} type="number" name="age" value={seller.age} onChange={(e) => handleArrayChange('sellers', index, e)} />
                                </div>
                                <div>
                                    <label style={formStyles.label}>Occupation</label>
                                    <input style={formStyles.input} type="text" name="occupation" value={seller.occupation} onChange={(e) => handleArrayChange('sellers', index, e)} />
                                </div>
                                 <div>
                                    <label style={formStyles.label}>Phone Number</label>
                                    <input style={formStyles.input} type="tel" name="phone" value={seller.phone} onChange={(e) => handleArrayChange('sellers', index, e)} />
                                </div>
                            </div>
                            <label style={formStyles.label}>Address</label>
                            <textarea style={{ ...formStyles.input, minHeight: '80px' }} name="address" value={seller.address} onChange={(e) => handleArrayChange('sellers', index, e)} />
                            <div style={formStyles.grid3}>
                                <div>
                                    <label style={formStyles.label}>Govt. ID Type</label>
                                    <select style={formStyles.input} name="idType" value={seller.idType} onChange={(e) => handleArrayChange('sellers', index, e)}>
                                        <option value="Aadhaar">Aadhaar</option>
                                        <option value="PAN">PAN</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={formStyles.label}>ID Number</label>
                                    <input style={formStyles.input} type="text" name="idNumber" value={seller.idNumber} onChange={(e) => handleArrayChange('sellers', index, e)} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" style={formStyles.addButton} onClick={() => handleAddItem('sellers')}>
                        + Add Another Seller
                    </button>


                    {/* --- BUYER(S) --- */}
                    <h2 style={formStyles.sectionTitle}>3. Buyer(s) Details</h2>
                    {formData.buyers.map((buyer, index) => (
                        <div key={index} style={formStyles.itemContainer}>
                            {formData.buyers.length > 1 && (
                                <button type="button" style={formStyles.removeButton} onClick={() => handleRemoveItem('buyers', index)}>×</button>
                            )}
                            <p style={{fontWeight: 600, marginTop: 0, color: '#334155'}}>Buyer {index + 1}</p>
                            <div style={formStyles.grid3}>
                                <div>
                                    <label style={formStyles.label}>Full Name</label>
                                    <input style={formStyles.input} type="text" name="name" value={buyer.name} onChange={(e) => handleArrayChange('buyers', index, e)} required />
                                </div>
                                <div>
                                    <label style={formStyles.label}>S/o or W/o</label>
                                    <select style={formStyles.input} name="so_wo" value={buyer.so_wo} onChange={(e) => handleArrayChange('buyers', index, e)}>
                                        <option value="S/o">S/o (Son of)</option>
                                        <option value="W/o">W/o (Wife of)</option>
                                        <option value="D/o">D/o (Daughter of)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={formStyles.label}>Father/Husband Name</label>
                                    <input style={formStyles.input} type="text" name="relationName" value={buyer.relationName} onChange={(e) => handleArrayChange('buyers', index, e)} />
                                </div>
                                <div>
                                    <label style={formStyles.label}>Age</label>
                                    <input style={formStyles.input} type="number" name="age" value={buyer.age} onChange={(e) => handleArrayChange('buyers', index, e)} />
                                </div>
                                <div>
                                    <label style={formStyles.label}>Occupation</label>
                                    <input style={formStyles.input} type="text" name="occupation" value={buyer.occupation} onChange={(e) => handleArrayChange('buyers', index, e)} />
                                </div>
                                 <div>
                                    <label style={formStyles.label}>Phone Number</label>
                                    <input style={formStyles.input} type="tel" name="phone" value={buyer.phone} onChange={(e) => handleArrayChange('buyers', index, e)} />
                                </div>
                            </div>
                            <label style={formStyles.label}>Address</label>
                            <textarea style={{ ...formStyles.input, minHeight: '80px' }} name="address" value={buyer.address} onChange={(e) => handleArrayChange('buyers', index, e)} />
                            <div style={formStyles.grid3}>
                                <div>
                                    <label style={formStyles.label}>Govt. ID Type</label>
                                    <select style={formStyles.input} name="idType" value={buyer.idType} onChange={(e) => handleArrayChange('buyers', index, e)}>
                                        <option value="Aadhaar">Aadhaar</option>
                                        <option value="PAN">PAN</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={formStyles.label}>ID Number</label>
                                    <input style={formStyles.input} type="text" name="idNumber" value={buyer.idNumber} onChange={(e) => handleArrayChange('buyers', index, e)} />
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" style={formStyles.addButton} onClick={() => handleAddItem('buyers')}>
                        + Add Another Buyer
                    </button>

                    {/* --- PROPERTY & SALE DETAILS --- */}
                    <h2 style={formStyles.sectionTitle}>4. Property & Sale Details</h2>
                    <div>
                        <label style={formStyles.label} htmlFor="totalConsideration">Total Consideration (INR)</label>
                        <input style={formStyles.input} type="number" id="totalConsideration" name="totalConsideration" value={formData.totalConsideration} onChange={handleChange} min="1" required />
                    </div>
                    <label style={formStyles.label} htmlFor="propertyAddress">Full Property Address</label>
                    <textarea style={{ ...formStyles.input, minHeight: '80px' }} id="propertyAddress" name="propertyAddress" value={formData.propertyAddress} onChange={handleChange} required />
                    <div style={formStyles.grid}>
                        <div>
                            <label style={formStyles.label} htmlFor="propertyType">Property Type</label>
                            <input style={formStyles.input} type="text" id="propertyType" name="propertyType" value={formData.propertyType} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={formStyles.label} htmlFor="acquisitionMethod">How Seller Acquired Property</label>
                            <input style={formStyles.input} type="text" id="acquisitionMethod" name="acquisitionMethod" value={formData.acquisitionMethod} onChange={handleChange} />
                        </div>
                    </div>


                    {/* --- SCHEDULES --- */}
                    <h2 style={formStyles.sectionTitle}>5. Schedule of Property (Land Details & Boundaries)</h2>
                    <div style={formStyles.grid3}>
                        <div>
                            <label style={formStyles.label} htmlFor="landSurveyNos">Survey Nos.</label>
                            <input style={formStyles.input} type="text" id="landSurveyNos" name="landSurveyNos" value={formData.landSurveyNos} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={formStyles.label} htmlFor="landVillage">Village</label>
                            <input style={formStyles.input} type="text" id="landVillage" name="landVillage" value={formData.landVillage} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={formStyles.label} htmlFor="landMandal">Mandal</label>
                            <input style={formStyles.input} type="text" id="landMandal" name="landMandal" value={formData.landMandal} onChange={handleChange} />
                        </div>
                         <div>
                            <label style={formStyles.label} htmlFor="landDistrict">District</label>
                            <input style={formStyles.input} type="text" id="landDistrict" name="landDistrict" value={formData.landDistrict} onChange={handleChange} />
                        </div>
                         <div>
                            <label style={formStyles.label} htmlFor="landTotalArea">Total Land Area</label>
                            <input style={formStyles.input} type="text" id="landTotalArea" name="landTotalArea" onChange={handleChange} />
                        </div>
                    </div>

                    <h3 style={{...formStyles.sectionTitle, fontSize: '16px', color: '#1e293b', border: 'none', marginTop: '15px'}}>Property Boundaries</h3>
                    <div style={formStyles.grid}>
                        <div>
                            <label style={formStyles.label} htmlFor="scheduleBoundsNorth">North</label>
                            <input style={formStyles.input} type="text" id="scheduleBoundsNorth" name="scheduleBoundsNorth" value={formData.scheduleBoundsNorth} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={formStyles.label} htmlFor="scheduleBoundsSouth">South</label>
                            <input style={formStyles.input} type="text" id="scheduleBoundsSouth" name="scheduleBoundsSouth" value={formData.scheduleBoundsSouth} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={formStyles.label} htmlFor="scheduleBoundsEast">East</label>
                            <input style={formStyles.input} type="text" id="scheduleBoundsEast" name="scheduleBoundsEast" value={formData.scheduleBoundsEast} onChange={handleChange} />
                        </div>
                        <div>
                            <label style={formStyles.label} htmlFor="scheduleBoundsWest">West</label>
                            <input style={formStyles.input} type="text" id="scheduleBoundsWest" name="scheduleBoundsWest" value={formData.scheduleBoundsWest} onChange={handleChange} />
                        </div>
                    </div>


                    {/* Submit Button */}
                    <button type="submit" style={{ ...styles.postBtn, width: '100%', marginTop: '30px', backgroundColor: '#b91c1c', fontSize: '18px', padding: '15px' }}>
                        Save Sale Agreement Draft
                    </button>
                </form>
            </div>

            {/* ====================== DRAFT MANAGEMENT SECTION ====================== */}
            <div style={{ marginTop: '40px', backgroundColor: '#fff7ed', padding: '20px', borderRadius: '12px' }}>
                <h2 style={{ color: '#b91c1c', marginBottom: '15px' }}>🗂️ My Sale Agreement Drafts</h2>
                <DraftList />
            </div>
        </div>
    );
}


// ====================== DRAFT LIST COMPONENT ======================
function DraftList() {
    const [drafts, setDrafts] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('myAgreements');
        if (stored) {
            const allAgreements = JSON.parse(stored);
            const saleDrafts = allAgreements.filter(ag => ag.agreementType === 'Sale Agreement');
            setDrafts(saleDrafts);
        }
    }, []);

    const handleDelete = (agreementId) => {
        if (window.confirm("Are you sure you want to delete this draft?")) {
            const stored = localStorage.getItem('myAgreements');
            const allAgreements = stored ? JSON.parse(stored) : [];
            const updatedAgreements = allAgreements.filter(d => d.agreementId !== agreementId);
            localStorage.setItem('myAgreements', JSON.stringify(updatedAgreements));
            setDrafts(prevDrafts => prevDrafts.filter(d => d.agreementId !== agreementId));
        }
    };

    if (drafts.length === 0) {
        return <p style={{ color: '#475569' }}>No sale agreement drafts saved yet.</p>;
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
                        <strong style={{color: '#b91c1c'}}>{draft.propertyAddressShort || 'Untitled Property'}</strong>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Seller: {draft.sellers && draft.sellers[0] ? draft.sellers[0].name : 'N/A'} | Buyer: {draft.buyers && draft.buyers[0] ? draft.buyers[0].name : 'N/A'}
                        </p>
                        <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px' }}>
                            Saved: {new Date(draft.createdAt).toLocaleString()}
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

export default CreateSaleAgreementPage;