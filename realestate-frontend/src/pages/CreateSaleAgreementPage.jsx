import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- Modern Styling Definitions ---
const baseColor = '#3b82f6'; // Tailwind blue-500
const baseInput = {
    padding: '12px',
    border: '1px solid #d1d5db', // Grey-300
    borderRadius: '8px',
    fontSize: '16px',
    backgroundColor: '#ffffff',
    transition: 'border-color 0.2s',
};

const styles = {
    container: { maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: 'Inter, sans-serif' },
    pageHeader: { marginBottom: '40px', borderBottom: `2px solid ${baseColor}`, paddingBottom: '15px' },
    pageTitle: { fontSize: '38px', color: '#1e293b', fontWeight: '800' },
    pageSubtitle: { fontSize: '16px', color: '#64748b', marginTop: '5px' },
    form: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '30px',
        padding: '40px',
        borderRadius: '16px',
        backgroundColor: '#f8fafc', // Light grey background
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
    },
    sectionTitle: {
        gridColumn: 'span 3',
        fontSize: '24px',
        color: baseColor,
        fontWeight: '700',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        marginBottom: '10px'
    },
    formGroup: { display: 'flex', flexDirection: 'column' },
    fullWidth: { gridColumn: 'span 3' },
    label: { marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#334155' },

    // Applying focus styles via JS in a real environment is complex with inline styles.
    // For this context, we just use the baseInput style.
    input: baseInput,
    textarea: { ...baseInput, minHeight: '100px', resize: 'vertical' },

    errorText: { marginTop: '4px', fontSize: '12px', color: '#ef4444', height: '18px' },

    buttonGroup: { gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px' },
    primaryButton: {
        cursor: 'pointer', border: 'none', borderRadius: '8px', backgroundColor: baseColor, color: 'white',
        padding: '12px 30px', fontSize: '16px', fontWeight: '600', transition: 'background-color 0.2s, box-shadow 0.2s',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    },
    secondaryButton: {
        cursor: 'pointer', border: '1px solid #9ca3af', borderRadius: '8px', backgroundColor: 'white', color: '#475569',
        padding: '12px 30px', fontSize: '16px', fontWeight: '600', transition: 'background-color 0.2s',
    },
    warningBox: {
        gridColumn: 'span 3',
        padding: '15px',
        backgroundColor: '#fef2f2',
        color: '#b91c1c',
        borderRadius: '8px',
        fontWeight: '500',
        border: '1px solid #fca5a5'
    },
    readOnlyInput: {
        ...baseInput,
        backgroundColor: '#f3f4f6', // Light gray background for calculated field
        color: '#4b5563',
    }
};

// --- Initial State Definition ---
const initialFormData = {
    // 1. Agreement Details
    agreementDate: new Date().toISOString().split('T')[0],

    // 2. Seller Details
    sellerFullName: '', sellerFathersName: '', sellerAge: '', sellerAddress: '', sellerAadhar: '', sellerPan: '',

    // 3. Purchaser Details
    purchaserFullName: '', purchaserFathersName: '', purchaserAge: '', purchaserAddress: '', purchaserAadhar: '', purchaserPan: '',

    // 4. Property Details
    propertyDescription: '', previousOwnerName: '', previousDeedDate: '', previousDeedNumber: '',

    // 5. Payment Details
    totalSalePrice: '', advancePaid: '', advanceMode: 'Cash', advanceNumber: '',
    balanceAmount: '0', // Calculated field
    balancePaymentDate: '', registrationCompletionDate: '',

    // 6. Spouse Consent
    spouseConsent: 'No',

    // 7. Witnesses
    witness1Name: '', witness2Name: '',
};

function CreateSaleAgreementPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [validationErrors, setValidationErrors] = useState({});
    const [globalError, setGlobalError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Validation Logic ---
    const validateForm = (data) => {
        const errors = {};
        let isValid = true;

        const requiredFields = [
            'agreementDate', 'sellerFullName', 'sellerFathersName', 'sellerAge', 'sellerAddress', 'sellerAadhar', 'sellerPan',
            'purchaserFullName', 'purchaserFathersName', 'purchaserAge', 'purchaserAddress', 'purchaserAadhar', 'purchaserPan',
            'propertyDescription', 'previousOwnerName', 'previousDeedDate', 'previousDeedNumber',
            'totalSalePrice', 'advancePaid', 'advanceMode', 'balancePaymentDate', 'registrationCompletionDate',
            'witness1Name', 'witness2Name'
        ];

        // 1. Check for empty fields
        requiredFields.forEach(field => {
            if (!data[field] || String(data[field]).trim() === '') {
                errors[field] = 'Required.';
                isValid = false;
            }
        });

        // 2. Numeric and Positive Validation (Ages and Prices)
        const numericFields = ['sellerAge', 'purchaserAge', 'totalSalePrice', 'advancePaid'];
        numericFields.forEach(field => {
            const value = Number(data[field]);
            if (data[field] && (isNaN(value) || value <= 0)) {
                errors[field] = 'Must be a positive number.';
                isValid = false;
            }
        });

        // 3. Calculation Integrity Check: Advance Paid cannot exceed Total Sale Price
        const total = parseFloat(data.totalSalePrice) || 0;
        const advance = parseFloat(data.advancePaid) || 0;

        if (total > 0 && advance > total) {
            errors['advancePaid'] = 'Advance cannot exceed Total Price.';
            isValid = false;
        }

        // 4. Aadhar Validation (12 digits, numeric only)
        const aadharRegex = /^\d{12}$/;
        ['sellerAadhar', 'purchaserAadhar'].forEach(field => {
            if (data[field] && !aadharRegex.test(data[field])) {
                errors[field] = 'Must be exactly 12 numeric digits.';
                isValid = false;
            }
        });

        // 5. PAN Validation (ABCDE1234F format)
        const panRegex = /^[A-Z]{5}\d{4}[A-Z]{1}$/;
        ['sellerPan', 'purchaserPan'].forEach(field => {
            if (data[field] && !panRegex.test(data[field].toUpperCase())) {
                errors[field] = 'Format: 5 Letters, 4 Digits, 1 Letter (e.g., ABCDE1234F).';
                isValid = false;
            }
        });

        setValidationErrors(errors);
        return isValid;
    };

    // --- Change Handler with Live Balance Calculation ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        const newValue = (name === 'sellerPan' || name === 'purchaserPan') ? value.toUpperCase() : value;

        setFormData(prevData => {
            let newData = {
                ...prevData,
                [name]: type === 'checkbox' ? (checked ? 'Yes' : 'No') : newValue
            };

            // Live Balance Calculation Logic
            if (name === 'totalSalePrice' || name === 'advancePaid') {
                const total = parseFloat(newData.totalSalePrice) || 0;
                const advance = parseFloat(newData.advancePaid) || 0;

                if (!isNaN(total) && !isNaN(advance) && total >= advance) {
                    // Update balanceAmount to the calculated value
                    newData.balanceAmount = String(total - advance);
                } else if (!total && !advance) {
                    newData.balanceAmount = '0';
                }
            }
            return newData;
        });

        // Clear specific error on change
        if (validationErrors[name]) {
            setValidationErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
        }
    };

    // --- Submission Handler (FIXED to save to 'myAgreements' key) ---
    const handleSubmit = (e) => {
        e.preventDefault();
        setGlobalError('');
        setIsSubmitting(true);

        if (!validateForm(formData)) {
            setGlobalError('Please correct the validation errors before saving the draft.');
            setIsSubmitting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        try {
            // Use 'agreementId' and 'agreementType' to match MyAgreementsPage structure
            const agreementId = `sale-${Date.now()}`;
            const draftDate = new Date().toISOString().split('T')[0];

            // Structure the data to include top-level fields for the listing page
            const newAgreement = {
                agreementId: agreementId,
                agreementType: 'Sale Agreement',
                status: 'DRAFT',
                startDate: draftDate,

                // Key summary fields for listing view
                vendorName: formData.sellerFullName,
                buyerName: formData.purchaserFullName,
                propertyAddress: formData.propertyDescription.substring(0, 50) + '...', // Short snippet
                saleAmount: formData.totalSalePrice,

                // Store ALL detailed form data
                details: formData,
            };

            // 🎯 CORRECTED KEY: Use 'myAgreements' to make the draft appear in the list
            const storedAgreementsRaw = localStorage.getItem('myAgreements');
            const existingAgreements = storedAgreementsRaw ? JSON.parse(storedAgreementsRaw) : [];

            const updatedAgreements = [...existingAgreements, newAgreement];
            localStorage.setItem('myAgreements', JSON.stringify(updatedAgreements));

            console.log("Draft saved successfully to myAgreements:", newAgreement);
            alert("Draft Saved Successfully! Redirecting to Agreements List.");

            // Navigate to the list page
            navigate('/my-agreements');

        } catch (err) {
            console.error("Error saving draft:", err);
            setGlobalError("Failed to save draft locally. Please check your browser settings.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={styles.container}>

            <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>Create Sale Agreement</h1>
                <p style={styles.pageSubtitle}>Enter all details. Fields marked with * are mandatory for saving the draft.</p>
            </div>

            {/* Global Error Message */}
            {globalError && (
                <div style={{...styles.warningBox, marginBottom: '20px'}}>
                    🚨 {globalError}
                </div>
            )}

            <form style={styles.form} onSubmit={handleSubmit}>

                {/* --------------------- 1. AGREEMENT DETAILS --------------------- */}
                <h2 style={{ ...styles.sectionTitle, borderTop: 'none', paddingTop: '0', color: '#10b981' }}>1. Agreement Details</h2>

                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="agreementDate">Date of Agreement *</label>
                    <input style={styles.input} type="date" name="agreementDate" value={formData.agreementDate} onChange={handleChange} required />
                    <p style={styles.errorText}>{validationErrors.agreementDate}</p>
                </div>
                {/* Spacers */}
                <div style={styles.formGroup}></div>
                <div style={styles.formGroup}></div>

                {/* --------------------- 2. SELLER DETAILS --------------------- */}
                <h2 style={styles.sectionTitle}>2. Seller (Vendor) Details</h2>

                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="sellerFullName">Full Name *</label>
                    <input style={styles.input} type="text" name="sellerFullName" value={formData.sellerFullName} onChange={handleChange} placeholder="Full Legal Name" required />
                    <p style={styles.errorText}>{validationErrors.sellerFullName}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="sellerFathersName">Father's Name *</label>
                    <input style={styles.input} type="text" name="sellerFathersName" value={formData.sellerFathersName} onChange={handleChange} placeholder="Father's/Husband's Name" required />
                    <p style={styles.errorText}>{validationErrors.sellerFathersName}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="sellerAge">Age *</label>
                    <input style={styles.input} type="number" name="sellerAge" value={formData.sellerAge} onChange={handleChange} placeholder="Years (Positive Numeric)" min="1" required />
                    <p style={styles.errorText}>{validationErrors.sellerAge}</p>
                </div>

                <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                    <label style={styles.label} htmlFor="sellerAadhar">Aadhar Number *</label>
                    <input style={styles.input} type="text" name="sellerAadhar" value={formData.sellerAadhar} onChange={handleChange} placeholder="12 numeric digits (Strict Validation)" maxLength="12" required />
                    <p style={styles.errorText}>{validationErrors.sellerAadhar}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="sellerPan">PAN Number *</label>
                    <input style={styles.input} type="text" name="sellerPan" value={formData.sellerPan} onChange={handleChange} placeholder="Format: ABCDE1234F (Strict Validation)" maxLength="10" required />
                    <p style={styles.errorText}>{validationErrors.sellerPan}</p>
                </div>

                <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                    <label style={styles.label} htmlFor="sellerAddress">Address *</label>
                    <textarea style={styles.textarea} name="sellerAddress" value={formData.sellerAddress} onChange={handleChange} placeholder="Full Residential Address" required />
                    <p style={styles.errorText}>{validationErrors.sellerAddress}</p>
                </div>


                {/* --------------------- 3. PURCHASER DETAILS --------------------- */}
                <h2 style={styles.sectionTitle}>3. Purchaser (Buyer) Details</h2>

                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="purchaserFullName">Full Name *</label>
                    <input style={styles.input} type="text" name="purchaserFullName" value={formData.purchaserFullName} onChange={handleChange} placeholder="Full Legal Name" required />
                    <p style={styles.errorText}>{validationErrors.purchaserFullName}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="purchaserFathersName">Father's Name *</label>
                    <input style={styles.input} type="text" name="purchaserFathersName" value={formData.purchaserFathersName} onChange={handleChange} placeholder="Father's/Husband's Name" required />
                    <p style={styles.errorText}>{validationErrors.purchaserFathersName}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="purchaserAge">Age *</label>
                    <input style={styles.input} type="number" name="purchaserAge" value={formData.purchaserAge} onChange={handleChange} placeholder="Years (Positive Numeric)" min="1" required />
                    <p style={styles.errorText}>{validationErrors.purchaserAge}</p>
                </div>

                <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
                    <label style={styles.label} htmlFor="purchaserAadhar">Aadhar Number *</label>
                    <input style={styles.input} type="text" name="purchaserAadhar" value={formData.purchaserAadhar} onChange={handleChange} placeholder="12 numeric digits (Strict Validation)" maxLength="12" required />
                    <p style={styles.errorText}>{validationErrors.purchaserAadhar}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="purchaserPan">PAN Number *</label>
                    <input style={styles.input} type="text" name="purchaserPan" value={formData.purchaserPan} onChange={handleChange} placeholder="Format: ABCDE1234F (Strict Validation)" maxLength="10" required />
                    <p style={styles.errorText}>{validationErrors.purchaserPan}</p>
                </div>

                <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                    <label style={styles.label} htmlFor="purchaserAddress">Address *</label>
                    <textarea style={styles.textarea} name="purchaserAddress" value={formData.purchaserAddress} onChange={handleChange} placeholder="Full Residential Address" required />
                    <p style={styles.errorText}>{validationErrors.purchaserAddress}</p>
                </div>

                {/* --------------------- 4. PROPERTY DETAILS --------------------- */}
                <h2 style={styles.sectionTitle}>4. Property Details</h2>

                <div style={{ ...styles.formGroup, ...styles.fullWidth }}>
                    <label style={styles.label} htmlFor="propertyDescription">Property Description (Schedule Property) *</label>
                    <textarea style={{ ...styles.textarea, minHeight: '120px' }} name="propertyDescription" value={formData.propertyDescription} onChange={handleChange} placeholder="Detailed description including boundaries, survey numbers, and total area." required />
                    <p style={styles.errorText}>{validationErrors.propertyDescription}</p>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="previousOwnerName">Previous Owner Name *</label>
                    <input style={styles.input} type="text" name="previousOwnerName" value={formData.previousOwnerName} onChange={handleChange} placeholder="Name from whom the Seller acquired the property" required />
                    <p style={styles.errorText}>{validationErrors.previousOwnerName}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="previousDeedDate">Previous Deed Date *</label>
                    <input style={styles.input} type="date" name="previousDeedDate" value={formData.previousDeedDate} onChange={handleChange} required />
                    <p style={styles.errorText}>{validationErrors.previousDeedDate}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="previousDeedNumber">Previous Deed Number *</label>
                    <input style={styles.input} type="text" name="previousDeedNumber" value={formData.previousDeedNumber} onChange={handleChange} placeholder="Document/Registration Number" required />
                    <p style={styles.errorText}>{validationErrors.previousDeedNumber}</p>
                </div>

                {/* --------------------- 5. PAYMENT DETAILS --------------------- */}
                <h2 style={styles.sectionTitle}>5. Payment and Timeline</h2>

                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="totalSalePrice">Total Sale Price (Rs) *</label>
                    <input style={styles.input} type="number" name="totalSalePrice" value={formData.totalSalePrice} onChange={handleChange} placeholder="Total agreed price" min="1" required />
                    <p style={styles.errorText}>{validationErrors.totalSalePrice}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="advancePaid">Advance Paid (Rs) *</label>
                    <input style={styles.input} type="number" name="advancePaid" value={formData.advancePaid} onChange={handleChange} placeholder="Amount paid as advance" min="0" required />
                    <p style={styles.errorText}>{validationErrors.advancePaid}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="balanceAmount">Balance Amount (Rs) *</label>
                    <input
                        style={styles.readOnlyInput}
                        type="text"
                        name="balanceAmount"
                        value={formData.balanceAmount}
                        readOnly
                        placeholder="Calculated automatically"
                    />
                    <p style={styles.errorText}>Calculated field (Total Price - Advance Paid)</p>
                </div>

                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="advanceMode">Advance Mode *</label>
                    <select style={styles.input} name="advanceMode" value={formData.advanceMode} onChange={handleChange} required>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                        <option value="DD">Demand Draft (DD)</option>
                    </select>
                    <p style={styles.errorText}>{validationErrors.advanceMode}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="advanceNumber">Cheque/DD Number (If applicable)</label>
                    <input style={styles.input} type="text" name="advanceNumber" value={formData.advanceNumber} onChange={handleChange} placeholder="Cheque or DD number" />
                    <p style={styles.errorText}>{validationErrors.advanceNumber}</p>
                </div>
                <div style={styles.formGroup}></div> {/* Spacer */}

                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="balancePaymentDate">Balance Payment Date *</label>
                    <input style={styles.input} type="date" name="balancePaymentDate" value={formData.balancePaymentDate} onChange={handleChange} required />
                    <p style={styles.errorText}>{validationErrors.balancePaymentDate}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="registrationCompletionDate">Registration Completion Date *</label>
                    <input style={styles.input} type="date" name="registrationCompletionDate" value={formData.registrationCompletionDate} onChange={handleChange} required />
                    <p style={styles.errorText}>{validationErrors.registrationCompletionDate}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="spouseConsent">6. Spouse Consent (If Applicable)</label>
                    <div style={{display: 'flex', alignItems: 'center', marginTop: '15px'}}>
                        <input
                            type="checkbox"
                            name="spouseConsent"
                            checked={formData.spouseConsent === 'Yes'}
                            onChange={handleChange}
                            style={{width: '20px', height: '20px', marginRight: '10px'}}
                        />
                        <span style={{fontSize: '15px', color: '#475569', fontWeight: '500'}}>Spouse Consent is **required**</span>
                    </div>
                </div>

                {/* --------------------- 7. WITNESS DETAILS --------------------- */}
                <h2 style={styles.sectionTitle}>7. Witness Details</h2>

                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="witness1Name">Witness 1 Full Name *</label>
                    <input style={styles.input} type="text" name="witness1Name" value={formData.witness1Name} onChange={handleChange} placeholder="Full Name of Witness 1" required />
                    <p style={styles.errorText}>{validationErrors.witness1Name}</p>
                </div>
                <div style={styles.formGroup}>
                    <label style={styles.label} htmlFor="witness2Name">Witness 2 Full Name *</label>
                    <input style={styles.input} type="text" name="witness2Name" value={formData.witness2Name} onChange={handleChange} placeholder="Full Name of Witness 2" required />
                    <p style={styles.errorText}>{validationErrors.witness2Name}</p>
                </div>
                <div style={styles.formGroup}></div>

                {/* Action Buttons */}
                <div style={styles.buttonGroup}>
                    <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={() => setFormData(initialFormData)}
                        disabled={isSubmitting}
                    >
                        Reset Form
                    </button>
                    <button
                        type="submit"
                        style={styles.primaryButton}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving Draft...' : 'Save Draft'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateSaleAgreementPage;