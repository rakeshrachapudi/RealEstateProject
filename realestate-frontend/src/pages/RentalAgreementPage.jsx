import React, { useState, useRef, useEffect } from 'react';
import { styles } from '../styles'; // Make sure this path is correct

// --- New Styles for the Form & Preview ---

const formStyles = {
  formContainer: {
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    marginTop: '32px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '8px',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    boxSizing: 'border-box', // Ensures padding doesn't affect width
    color: '#334155',
  },
  errorInput: {
    border: '1px solid #ef4444',
    boxShadow: '0 0 0 2px #fecaca',
  },
  errorMessage: {
    color: '#dc2626',
    fontSize: '12px',
    fontWeight: 500,
    marginTop: '4px',
  },
  idGroup: {
    display: 'flex',
    gap: '12px',
  },
  idType: {
    flex: '1 1 30%',
  },
  idNumber: {
    flex: '1 1 70%',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '1px solid #cbd5e1',
    borderRadius: '12px',
    boxSizing: 'border-box',
    color: '#334155',
    backgroundColor: 'white',
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    marginTop: '32px',
  },
  primaryButton: {
    ...styles.signupBtn,
    backgroundColor: '#667eea',
    color: 'white',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    flex: 1,
  },
  disabledButton: {
    ...styles.signupBtn,
    backgroundColor: '#94a3b8',
    color: 'white',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    flex: 1,
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  secondaryButton: {
    ...styles.loginBtn,
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    flex: 1,
  },
  successMessage: {
    ...styles.noPropertiesContainer,
    border: '2px solid #10b981',
    backgroundColor: '#f0fdf4',
    color: '#065f46',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    padding: '16px',
    borderRadius: '12px',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '20px',
  },
  infoBoxTitle: {
    marginTop: 0,
    marginBottom: '10px',
    color: '#0369a1',
    fontSize: '16px',
    fontWeight: '700',
  },
  infoList: {
    paddingLeft: '20px',
    margin: 0,
  }
};

const previewStyles = {
  container: {
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    padding: '50px 60px',
    fontFamily: "'Times New Roman', Times, serif",
    color: '#000',
    lineHeight: 1.6,
    margin: '20px 0',
  },
  title: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textDecoration: 'underline',
    marginBottom: '40px',
  },
  header: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#555',
    borderBottom: '1px dashed #ccc',
    paddingBottom: '10px',
    marginBottom: '30px',
  },
  paragraph: {
    fontSize: '16px',
    marginBottom: '20px',
    textAlign: 'justify',
  },
  data: {
    fontWeight: 'bold',
  },
  clause: {
    marginBottom: '25px',
  },
  clauseTitle: {
    fontSize: '17px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  subParagraph: {
    fontSize: '16px',
    marginBottom: '10px',
    textAlign: 'justify',
    paddingLeft: '20px',
  },
  signatureBlock: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '60px',
  },
  witnessBlock: {
    marginTop: '70px',
    fontSize: '15px',
  },
  signature: {
    width: '45%',
    borderTop: '1px solid #000',
    paddingTop: '8px',
    fontSize: '16px',
  }
};


// --- Number to Words Utility ---
function convertToWords(num) {
  if (num === null || num === undefined || num === '') return '[AMOUNT IN WORDS]';

  num = parseInt(num, 10);
  if (num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const scales = ['', 'Thousand', 'Lakh', 'Crore'];

  let words = [];
  let scaleIndex = 0;

  while (num > 0) {
    let chunk = num % 1000;
    if (scaleIndex === 1) { // Thousand
      chunk = num % 100;
    } else if (scaleIndex > 1) {
      chunk = num % 100;
    }

    if (chunk > 0) {
      let chunkWords = [];
      if (chunk >= 100) {
        chunkWords.push(ones[Math.floor(chunk / 100)] + ' Hundred');
        chunk %= 100;
      }
      if (chunk >= 10 && chunk <= 19) {
        chunkWords.push(teens[chunk - 10]);
      } else {
        if (chunk >= 20) {
          chunkWords.push(tens[Math.floor(chunk / 10)]);
          chunk %= 10;
        }
        if (chunk > 0) {
          chunkWords.push(ones[chunk]);
        }
      }
      if (scales[scaleIndex]) {
        chunkWords.push(scales[scaleIndex]);
      }
      words.unshift(chunkWords.join(' '));
    }

    if (scaleIndex === 0) {
      num = Math.floor(num / 1000);
    } else {
      num = Math.floor(num / 100);
    }
    scaleIndex++;
    if (scaleIndex >= scales.length) break;
  }
  return words.join(' ');
}


// --- Professional Agreement Preview ---
const AgreementPreview = React.forwardRef(({ formData }, ref) => {

  const getFormattedDate = () => {
    if (!formData.startDate) return { day: '[DAY]', month: '[MONTH]', year: '[YEAR]' };
    try {
      const date = new Date(formData.startDate);
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      return { day, month, year };
    } catch (e) {
      return { day: '[DAY]', month: '[MONTH]', year: '[YEAR]' };
    }
  };
  const { day, month, year } = getFormattedDate();

  const agreementDuration = parseInt(formData.duration, 10);
  const isLease = formData.agreementType === 'Lease Agreement';

  let clauseCounter = 1;

  return (
    <div style={previewStyles.container} ref={ref}>
      <div style={previewStyles.header}>
        Generated through <strong>Zero Brokerage Platform</strong>
      </div>

      <h1 style={previewStyles.title}>{formData.agreementType}</h1>

      <p style={previewStyles.paragraph}>
        This {formData.agreementType} is made and entered into on this <span style={previewStyles.data}>{day}</span> day of <span style={previewStyles.data}>{month}</span>, <span style={previewStyles.data}>{year}</span>
      </p>

      <p style={previewStyles.paragraph}>
        <strong>BY AND BETWEEN:</strong>
      </p>

      <p style={{ ...previewStyles.paragraph, paddingLeft: '20px' }}>
        <span style={previewStyles.data}>{formData.ownerName || '[OWNER NAME]'}</span>,
        (Phone: <span style={previewStyles.data}>{formData.ownerPhone || '[OWNER PHONE]'}</span>, {formData.ownerIdType}: <span style={previewStyles.data}>{formData.ownerIdNumber || '[OWNER ID]'}</span>)
        (Hereinafter referred to as the "<strong>OWNER</strong>" or "{isLease ? 'LESSOR' : 'LICENSOR'}", which expression shall unless repugnant to the context or meaning thereof mean and include their legal heirs, executors, administrators, and assigns) of the <strong>FIRST PART</strong>.
      </p>

      <p style={previewStyles.paragraph}>
        <strong>AND</strong>
      </p>

      <p style={{ ...previewStyles.paragraph, paddingLeft: '20px' }}>
        <span style={previewStyles.data}>{formData.tenantName || '[TENANT NAME]'}</span>,
        (Phone: <span style={previewStyles.data}>{formData.tenantPhone || '[TENANT PHONE]'}</span>, {formData.tenantIdType}: <span style={previewStyles.data}>{formData.tenantIdNumber || '[TENANT ID]'}</span>)
        (Hereinafter referred to as the "<strong>TENANT</strong>" or "{isLease ? 'LESSEE' : 'LICENSEE'}", which expression shall unless repugnant to the context or meaning thereof mean and include their legal heirs, executors, administrators, and assigns) of the <strong>SECOND PART</strong>.
      </p>

      <p style={previewStyles.paragraph}>
        The Owner is the absolute and legal owner of the property situated at <span style={previewStyles.data}>{formData.propertyAddress || '[PROPERTY ADDRESS]'}</span> (Hereinafter referred to as the "<strong>PREMISES</strong>").
      </p>
      <p style={previewStyles.paragraph}>
        WHEREAS, the Tenant has requested the Owner to grant this {isLease ? 'lease' : 'license'} with respect to the Premises, and the Owner has agreed to grant the same on the terms and conditions hereinafter appearing.
      </p>

      <h2 style={{ ...previewStyles.title, fontSize: '20px', textDecoration: 'none', marginBottom: '30px', marginTop: '40px' }}>
        NOW, THIS AGREEMENT WITNESSETH AS FOLLOWS:
      </h2>

      {/* --- CLAUSES (Now with dynamic numbering) --- */}

      <div style={previewStyles.clause}>
        <h3 style={previewStyles.clauseTitle}>{clauseCounter++}. PREMISES</h3>
        <p style={previewStyles.paragraph}>
          The Owner hereby grants to the Tenant the right to occupy and use the Premises located at: <span style={previewStyles.data}>{formData.propertyAddress || '[PROPERTY ADDRESS]'}</span>.
        </p>
      </div>

      <div style={previewStyles.clause}>
        <h3 style={previewStyles.clauseTitle}>{clauseCounter++}. TERM</h3>
        <p style={previewStyles.paragraph}>
          The term of this {isLease ? 'lease' : 'agreement'} shall be for a period of <span style={previewStyles.data}>{formData.duration}</span> {formData.duration === '1' ? 'month' : 'months'}, commencing from <span style={previewStyles.data}>{formData.startDate || '[START DATE]'}</span>.
        </p>
      </div>

      <div style={previewStyles.clause}>
        <h3 style={previewStyles.clauseTitle}>{clauseCounter++}. RENT / LICENSE FEE</h3>
        <p style={previewStyles.paragraph}>
          The Tenant shall pay to the Owner a monthly {isLease ? 'rent' : 'license fee'} of <span style={previewStyles.data}>₹{formData.rentAmount || '[RENT AMOUNT]'}</span> (Rupees <span style={previewStyles.data}>{convertToWords(formData.rentAmount)}</span> Only). This amount shall be payable in advance on or before the 5th day of each English calendar month.
        </p>
      </div>

      <div style={previewStyles.clause}>
        <h3 style={previewStyles.clauseTitle}>{clauseCounter++}. SECURITY DEPOSIT</h3>
        <p style={previewStyles.subParagraph}>
          A. Upon the execution of this Agreement, the Tenant shall pay the Owner an interest-free security deposit of <span style={previewStyles.data}>₹{formData.depositAmount || '[DEPOSIT AMOUNT]'}</span> (Rupees <span style={previewStyles.data}>{convertToWords(formData.depositAmount)}</span> Only).
        </p>
        <p style={previewStyles.subParagraph}>
          B. The Owner shall refund this deposit to the Tenant, free of interest, within 15 (fifteen) days of the termination of this agreement and after the Tenant has handed over vacant and peaceful possession of the Premises, subject to any deductions for unpaid rent/utilities, damages to the property (reasonable wear and tear excepted), or any breach of the terms herein.
        </p>
      </div>

      {isLease && agreementDuration >= 18 && parseFloat(formData.incrementPercentage) > 0 && (
        <div style={previewStyles.clause}>
          <h3 style={previewStyles.clauseTitle}>{clauseCounter++}. RENT INCREMENT</h3>
          <p style={previewStyles.paragraph}>
            It is hereby agreed that the rent shall be subject to an increment of <span style={previewStyles.data}>{formData.incrementPercentage}%</span> after the completion of every 18 (eighteen) months of the term, in accordance with governing State Rent Control Laws.
          </p>
        </div>
      )}

      <div style={previewStyles.clause}>
        <h3 style={previewStyles.clauseTitle}>{clauseCounter++}. USE OF PREMISES</h3>
        <p style={previewStyles.paragraph}>
          The Premises shall be used by the Tenant strictly for private residential purposes only and for no other purpose whatsoever.
        </p>
      </div>

      <div style={previewStyles.clause}>
        <h3 style={previewStyles.clauseTitle}>{clauseCounter++}. UTILITIES AND CHARGES</h3>
        <p style={previewStyles.paragraph}>
          The Tenant shall be responsible for and shall pay all charges for electricity, water, gas, internet, and any other utilities consumed on the Premises directly to the concerned authorities.
        </p>
      </div>

      <div style={previewStyles.clause}>
        <h3 style={previewStyles.clauseTitle}>{clauseCounter++}. TERMINATION</h3>
        <p style={previewStyles.paragraph}>
          Either party may terminate this Agreement by providing 30 (thirty) days' written notice to the other party, without assigning any reason therefor.
        </p>
      </div>

      <div style={previewStyles.clause}>
        <h3 style={previewStyles.clauseTitle}>{clauseCounter++}. GOVERNING LAW</h3>
        <p style={previewStyles.paragraph}>
          This Agreement shall be governed by and construed in accordance with the laws of India. The courts in <span style={previewStyles.data}>{formData.jurisdiction || '[CITY/STATE]'}</span> shall have exclusive jurisdiction over any disputes arising hereunder.
        </p>
      </div>

      <p style={{ ...previewStyles.paragraph, marginTop: '50px' }}>
        <strong>IN WITNESS WHEREOF</strong>, the parties have executed this Agreement on the date first above written.
      </p>

      <div style={previewStyles.signatureBlock}>
        <div style={previewStyles.signature}>
          <strong>(OWNER / {isLease ? 'LESSOR' : 'LICENSOR'})</strong>
          <br /><br /><br />
          <span style={previewStyles.data}>{formData.ownerName || '[OWNER NAME]'}</span>
        </div>
        <div style={previewStyles.signature}>
          <strong>(TENANT / {isLease ? 'LESSEE' : 'LICENSEE'})</strong>
          <br /><br /><br />
          <span style={previewStyles.data}>{formData.tenantName || '[TENANT NAME]'}</span>
        </div>
      </div>

      <div style={previewStyles.witnessBlock}>
        <p><strong>WITNESSES:</strong></p>
        <div style={previewStyles.signatureBlock}>
          <div style={previewStyles.signature}>
            <strong>1. Signature:</strong>
            <br />
            <strong>Name:</strong>
            <br />
            <strong>Address:</strong>
          </div>
          <div style={previewStyles.signature}>
            <strong>2. Signature:</strong>
            <br />
            <strong>Name:</strong>
            <br />
            <strong>Address:</strong>
          </div>
        </div>
      </div>

    </div>
  );
});


// --- Initial empty state for the form data ---
const initialFormData = {
  ownerName: '',
  ownerPhone: '',
  ownerIdType: 'Aadhaar',
  ownerIdNumber: '',
  tenantName: '',
  tenantPhone: '',
  tenantIdType: 'Aadhaar',
  tenantIdNumber: '',
  propertyAddress: '',
  jurisdiction: '',
  rentAmount: '',
  depositAmount: '',
  startDate: '',
  duration: '11',
  incrementPercentage: '5',
  agreementType: 'Rental Agreement',
};

// --- Main Page Component ---

function RentalAgreementPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({}); // To track blurred fields

  const agreementPreviewRef = useRef();

  // --- Validation Functions ---
  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) return 'Phone number is required.';
    if (!phoneRegex.test(phone)) return 'Must be exactly 10 numeric digits.';
    return '';
  };

  const validateAadhaar = (aadhaar) => {
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaar) return 'Aadhaar number is required.';
    if (!aadhaarRegex.test(aadhaar)) return 'Must be exactly 12 numeric digits.';
    return '';
  };

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!pan) return 'PAN number is required.';
    if (!panRegex.test(pan)) return 'Invalid PAN format (AAAAA1111A).';
    return '';
  };

  const validateRequired = (value, fieldName) => {
    if (!value) return `${fieldName} is required.`;
    return '';
  }

  // --- Single Field Validator ---
  const validateField = (name, value, currentFormData) => {
    let error = '';
    const data = currentFormData || formData;

    switch (name) {
      case 'ownerName':
        error = validateRequired(value, 'Owner name');
        break;
      case 'tenantName':
        error = validateRequired(value, 'Tenant name');
        break;
      case 'ownerPhone':
        error = validatePhone(value);
        break;
      case 'tenantPhone':
        error = validatePhone(value);
        break;
      case 'ownerIdNumber':
        error = (data.ownerIdType === 'Aadhaar') ? validateAadhaar(value) : validatePAN(value);
        break;
      case 'tenantIdNumber':
        error = (data.tenantIdType === 'Aadhaar') ? validateAadhaar(value) : validatePAN(value);
        break;
      case 'propertyAddress':
        error = validateRequired(value, 'Property address');
        break;
      case 'jurisdiction':
        error = validateRequired(value, 'Jurisdiction');
        break;
      case 'rentAmount':
        error = validateRequired(value, 'Rent amount');
        break;
      case 'depositAmount':
        error = validateRequired(value, 'Deposit amount');
        break;
      case 'startDate':
        error = validateRequired(value, 'Start date');
        break;
      default:
        break;
    }
    setFormErrors(prev => ({ ...prev, [name]: error }));
    return error;
  };

  // --- Full Step Validator (for "Next" button click) ---
  const validateStep = (stepToValidate) => {
    const errors = {};
    let allFieldsTouched = {};

    if (stepToValidate === 2) {
      errors.ownerName = validateRequired(formData.ownerName, 'Owner name');
      errors.tenantName = validateRequired(formData.tenantName, 'Tenant name');
      errors.ownerPhone = validatePhone(formData.ownerPhone);
      errors.tenantPhone = validatePhone(formData.tenantPhone);
      errors.ownerIdNumber = (formData.ownerIdType === 'Aadhaar') ? validateAadhaar(formData.ownerIdNumber) : validatePAN(formData.ownerIdNumber);
      errors.tenantIdNumber = (formData.tenantIdType === 'Aadhaar') ? validateAadhaar(formData.tenantIdNumber) : validatePAN(formData.tenantIdNumber);
      allFieldsTouched = { ownerName: true, tenantName: true, ownerPhone: true, tenantPhone: true, ownerIdNumber: true, tenantIdNumber: true };
    } else if (stepToValidate === 3) {
      errors.propertyAddress = validateRequired(formData.propertyAddress, 'Property address');
      errors.jurisdiction = validateRequired(formData.jurisdiction, 'Jurisdiction');
      errors.rentAmount = validateRequired(formData.rentAmount, 'Rent amount');
      errors.depositAmount = validateRequired(formData.depositAmount, 'Deposit amount');
      errors.startDate = validateRequired(formData.startDate, 'Start date');
      allFieldsTouched = { propertyAddress: true, jurisdiction: true, rentAmount: true, depositAmount: true, startDate: true };
    }

    const validErrors = Object.keys(errors).reduce((acc, key) => {
      if (errors[key]) acc[key] = errors[key];
      return acc;
    }, {});

    setFormErrors(validErrors);
    setTouched(prev => ({ ...prev, ...allFieldsTouched })); // Mark all as touched
    return Object.keys(validErrors).length === 0; // Return true if no errors
  };

  // --- Functions to check if step is valid (for button disabling) ---
  const isStep2Valid = () => {
    if (validateRequired(formData.ownerName, '')) return false;
    if (validateRequired(formData.tenantName, '')) return false;
    if (validatePhone(formData.ownerPhone)) return false;
    if (validatePhone(formData.tenantPhone)) return false;
    if ((formData.ownerIdType === 'Aadhaar') ? validateAadhaar(formData.ownerIdNumber) : validatePAN(formData.ownerIdNumber)) return false;
    if ((formData.tenantIdType === 'Aadhaar') ? validateAadhaar(formData.tenantIdNumber) : validatePAN(formData.tenantIdNumber)) return false;
    return true; // All checks passed
  };

  const isStep3Valid = () => {
    if (validateRequired(formData.propertyAddress, '')) return false;
    if (validateRequired(formData.jurisdiction, '')) return false;
    if (validateRequired(formData.rentAmount, '')) return false;
    if (validateRequired(formData.depositAmount, '')) return false;
    if (validateRequired(formData.startDate, '')) return false;
    return true; // All checks passed
  };


  // --- HandleChange with Corrected PAN Sanitization ---
  // (Note: This is the version YOU provided, not the stricter one I suggested later)
  const handleChange = (e) => {
    let { name, value } = e.target;

    // --- Input Sanitization & Formatting ---
    if (name === 'ownerPhone' || name === 'tenantPhone') {
      value = value.replace(/\D/g, '').substring(0, 10);
    }

    if (name === 'ownerIdNumber' || name === 'tenantIdNumber') {
      const idType = (name === 'ownerIdNumber') ? formData.ownerIdType : formData.tenantIdType;
      if (idType === 'Aadhaar') {
        value = value.replace(/\D/g, '').substring(0, 12);
      } else if (idType === 'PAN') {
        value = value.toUpperCase();
        // --- Original PAN Sanitization ---
        let sanitized = '';
        if (value.length > 0) {
          sanitized += value.substring(0, 5).replace(/[^A-Z]/g, '');
        }
        if (value.length > 5) {
          sanitized += value.substring(5, 9).replace(/[^0-9]/g, '');
        }
        if (value.length > 9) {
          sanitized += value.substring(9, 10).replace(/[^A-Z]/g, '');
        }
        value = sanitized;
        // --- End of Original Sanitization ---
      }
    }

    if (name === 'rentAmount' || name === 'depositAmount') {
        value = value.replace(/\D/g, '');
    }

    // --- Update Form Data State ---
    const newData = { ...formData, [name]: value };

    if (name === 'duration') {
      const durationMonths = parseInt(value, 10);
      newData.agreementType = durationMonths <= 11 ? 'Rental Agreement' : 'Lease Agreement';
    }

    if (name === 'ownerIdType') {
      newData.ownerIdNumber = '';
      if(touched.ownerIdNumber) validateField('ownerIdNumber', '', newData);
    }
    if (name === 'tenantIdType') {
      newData.tenantIdNumber = '';
      if(touched.tenantIdNumber) validateField('tenantIdNumber', '', newData);
    }

    setFormData(newData);

    if (touched[name]) {
      validateField(name, value, newData);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value, formData);
  };

  const handleNext = () => {
    let isCurrentStepValid = false;

    if (step === 2) {
      isCurrentStepValid = validateStep(2);
    } else if (step === 3) {
      isCurrentStepValid = validateStep(3);
    } else {
      isCurrentStepValid = true; // Step 1
    }

    if (!isCurrentStepValid) return; // Stop if errors

    setFormErrors({}); // Clear errors for next step
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setFormErrors({}); // Clear errors when going back
    setStep(prev => prev - 1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Final Agreement Data:", formData);
    setStep(5); // Show success message
  };

  const step2ButtonDisabled = !isStep2Valid();
  const step3ButtonDisabled = !isStep3Valid();

  return (
    <div style={{ ...styles.container, maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>

      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-agreement, #printable-agreement * {
              visibility: visible;
            }
            #printable-agreement {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              border: none;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <h1 className="no-print" style={{ ...styles.pageTitle, fontSize: '32px', marginBottom: '8px' }}>
        Online Rental Agreement
      </h1>
      <p className="no-print" style={{ ...styles.pageSubtitle, fontSize: '16px', color: '#667eea', fontWeight: 600, marginTop: 0, marginBottom: '16px' }}>
        through <strong>Zero Brokerage Platform</strong>
      </p>

      {/* Step 1: Introduction */}
      {step === 1 && (
        <div className="no-print">
          <p style={{ ...styles.pageSubtitle, fontSize: '18px', lineHeight: '1.6', marginBottom: '32px' }}>
            Streamline your rental process with our easy-to-use digital rental agreement service.
            We provide government-approved, e-stamped agreements delivered right to your doorstep.
          </p>
          <div style={formStyles.formContainer}>
            <h3 style={{ ...styles.sectionTitle, fontSize: '22px', margin: '0 0 20px 0' }}>Key Features:</h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, margin: 0, fontSize: '16px', lineHeight: '1.7', color: '#334155' }}>
              <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '12px', fontSize: '20px' }}>✅</span>
                100% Online & Paperless Process
              </li>
              <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '12px', fontSize: '20px' }}>⚖️</span>
                Legally Valid & E-Stamped
              </li>
              <li style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '12px', fontSize: '20px' }}>🚚</span>
                Express Delivery Available
              </li>
            </ul>
            <button
              style={{ ...formStyles.primaryButton, marginTop: '30px', width: '100%', flex: 'none' }}
              onClick={handleNext}
            >
              Create Your Agreement Now
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Parties Information */}
      {step === 2 && (
        <div style={formStyles.formContainer} className="no-print">
          <h2 style={{ ...styles.sectionTitle, fontSize: '22px', marginTop: 0 }}>Step 1: Parties Information</h2>

          <h3 style={{ ...styles.dropdownTitle, color: '#334155', fontSize: '16px' }}>Owner Details</h3>
          <div style={formStyles.formGroup}>
            <label style={formStyles.label} htmlFor="ownerName">Owner Full Name</label>
            <input style={{...formStyles.input, ...(touched.ownerName && formErrors.ownerName && formStyles.errorInput)}} type="text" id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., John Doe" />
            {touched.ownerName && formErrors.ownerName && <span style={formStyles.errorMessage}>{formErrors.ownerName}</span>}
          </div>
          <div style={formStyles.formGroup}>
            <label style={formStyles.label} htmlFor="ownerPhone">Owner Phone Number (10 Digits)</label>
            <input style={{...formStyles.input, ...(touched.ownerPhone && formErrors.ownerPhone && formStyles.errorInput)}} type="tel" id="ownerPhone" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., 9876543210" />
            {touched.ownerPhone && formErrors.ownerPhone && <span style={formStyles.errorMessage}>{formErrors.ownerPhone}</span>}
          </div>
          <div style={formStyles.idGroup}>
            <div style={{...formStyles.formGroup, ...formStyles.idType}}>
              <label style={formStyles.label} htmlFor="ownerIdType">Govt. ID Type</label>
              <select style={formStyles.select} id="ownerIdType" name="ownerIdType" value={formData.ownerIdType} onChange={handleChange} onBlur={handleBlur}>
                <option value="Aadhaar">Aadhaar</option>
                <option value="PAN">PAN</option>
              </select>
            </div>
            <div style={{...formStyles.formGroup, ...formStyles.idNumber}}>
              <label style={formStyles.label} htmlFor="ownerIdNumber">ID Number</label>
              <input style={{...formStyles.input, ...(touched.ownerIdNumber && formErrors.ownerIdNumber && formStyles.errorInput)}} type="text" id="ownerIdNumber" name="ownerIdNumber" value={formData.ownerIdNumber} onChange={handleChange} onBlur={handleBlur} placeholder={formData.ownerIdType === 'Aadhaar' ? '12-digit number' : 'e.g. AAAAA1111A'} />
              {touched.ownerIdNumber && formErrors.ownerIdNumber && <span style={formStyles.errorMessage}>{formErrors.ownerIdNumber}</span>}
            </div>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid #eee', margin: '24px 0' }} />

          <h3 style={{ ...styles.dropdownTitle, color: '#334155', fontSize: '16px' }}>Tenant Details</h3>
          <div style={formStyles.formGroup}>
            <label style={formStyles.label} htmlFor="tenantName">Tenant Full Name</label>
            <input style={{...formStyles.input, ...(touched.tenantName && formErrors.tenantName && formStyles.errorInput)}} type="text" id="tenantName" name="tenantName" value={formData.tenantName} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., Jane Smith" />
            {touched.tenantName && formErrors.tenantName && <span style={formStyles.errorMessage}>{formErrors.tenantName}</span>}
          </div>
          <div style={formStyles.formGroup}>
            <label style={formStyles.label} htmlFor="tenantPhone">Tenant Phone Number (10 Digits)</label>
            <input style={{...formStyles.input, ...(touched.tenantPhone && formErrors.tenantPhone && formStyles.errorInput)}} type="tel" id="tenantPhone" name="tenantPhone" value={formData.tenantPhone} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., 1234567890" />
            {touched.tenantPhone && formErrors.tenantPhone && <span style={formStyles.errorMessage}>{formErrors.tenantPhone}</span>}
          </div>
          <div style={formStyles.idGroup}>
            <div style={{...formStyles.formGroup, ...formStyles.idType}}>
              <label style={formStyles.label} htmlFor="tenantIdType">Govt. ID Type</label>
              <select style={formStyles.select} id="tenantIdType" name="tenantIdType" value={formData.tenantIdType} onChange={handleChange} onBlur={handleBlur}>
                <option value="Aadhaar">Aadhaar</option>
                <option value="PAN">PAN</option>
              </select>
            </div>
            <div style={{...formStyles.formGroup, ...formStyles.idNumber}}>
              <label style={formStyles.label} htmlFor="tenantIdNumber">ID Number</label>
              <input style={{...formStyles.input, ...(touched.tenantIdNumber && formErrors.tenantIdNumber && formStyles.errorInput)}} type="text" id="tenantIdNumber" name="tenantIdNumber" value={formData.tenantIdNumber} onChange={handleChange} onBlur={handleBlur} placeholder={formData.tenantIdType === 'Aadhaar' ? '12-digit number' : 'e.g. AAAAA1111A'} />
              {touched.tenantIdNumber && formErrors.tenantIdNumber && <span style={formStyles.errorMessage}>{formErrors.tenantIdNumber}</span>}
            </div>
          </div>

          {/* Button Group */}
          <div style={formStyles.buttonGroup}>
            <button type="button" style={{...formStyles.secondaryButton, flex: '0 1 auto'}} onClick={() => setStep(1)}>Back</button>
            <button
              type="button"
              style={step2ButtonDisabled ? formStyles.disabledButton : {...formStyles.primaryButton, flex: '1 1 auto'}}
              onClick={handleNext}
              disabled={step2ButtonDisabled}
            >
              Next: Property Details
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Property & Terms */}
      {step === 3 && (
        <div style={formStyles.formContainer} className="no-print">
             <h2 style={{ ...styles.sectionTitle, fontSize: '22px', marginTop: 0 }}>Step 2: Property & Terms</h2>

             {/* Info Box */}
             <div style={formStyles.infoBox}>
               <h4 style={formStyles.infoBoxTitle}>📄 Agreement Type Note:</h4>
               <p style={{margin: 0}}>Agreements up to 11 months are typically considered 'Rental Agreements'. Agreements for 12 months or longer are often treated as 'Lease Agreements' and may require registration and potentially different stamp duty depending on state laws.</p>
             </div>

             {/* Property Address */}
             <div style={formStyles.formGroup}>
                 <label style={formStyles.label} htmlFor="propertyAddress">Property Address</label>
                 <input style={{...formStyles.input, ...(touched.propertyAddress && formErrors.propertyAddress && formStyles.errorInput)}} type="text" id="propertyAddress" name="propertyAddress" value={formData.propertyAddress} onChange={handleChange} onBlur={handleBlur} placeholder="Full address of the rental property" />
                 {touched.propertyAddress && formErrors.propertyAddress && <span style={formStyles.errorMessage}>{formErrors.propertyAddress}</span>}
             </div>
             {/* Jurisdiction */}
              <div style={formStyles.formGroup}>
                 <label style={formStyles.label} htmlFor="jurisdiction">Jurisdiction (City/State)</label>
                 <input style={{...formStyles.input, ...(touched.jurisdiction && formErrors.jurisdiction && formStyles.errorInput)}} type="text" id="jurisdiction" name="jurisdiction" value={formData.jurisdiction} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., Hyderabad, Telangana" />
                 {touched.jurisdiction && formErrors.jurisdiction && <span style={formStyles.errorMessage}>{formErrors.jurisdiction}</span>}
             </div>

            {/* Rent & Deposit */}
            <div style={{display: 'flex', gap: '12px'}}>
                 <div style={{...formStyles.formGroup, flex: 1}}>
                     <label style={formStyles.label} htmlFor="rentAmount">Monthly Rent (₹)</label>
                     <input style={{...formStyles.input, ...(touched.rentAmount && formErrors.rentAmount && formStyles.errorInput)}} type="tel" id="rentAmount" name="rentAmount" value={formData.rentAmount} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., 15000" />
                     {touched.rentAmount && formErrors.rentAmount && <span style={formStyles.errorMessage}>{formErrors.rentAmount}</span>}
                 </div>
                 <div style={{...formStyles.formGroup, flex: 1}}>
                     <label style={formStyles.label} htmlFor="depositAmount">Security Deposit (₹)</label>
                     <input style={{...formStyles.input, ...(touched.depositAmount && formErrors.depositAmount && formStyles.errorInput)}} type="tel" id="depositAmount" name="depositAmount" value={formData.depositAmount} onChange={handleChange} onBlur={handleBlur} placeholder="e.g., 30000" />
                     {touched.depositAmount && formErrors.depositAmount && <span style={formStyles.errorMessage}>{formErrors.depositAmount}</span>}
                 </div>
             </div>

             {/* Start Date */}
             <div style={formStyles.formGroup}>
                 <label style={formStyles.label} htmlFor="startDate">Agreement Start Date</label>
                 <input style={{...formStyles.input, ...(touched.startDate && formErrors.startDate && formStyles.errorInput)}} type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} onBlur={handleBlur} />
                 {touched.startDate && formErrors.startDate && <span style={formStyles.errorMessage}>{formErrors.startDate}</span>}
             </div>

            {/* Duration Dropdown */}
            <div style={formStyles.formGroup}>
                <label style={formStyles.label} htmlFor="duration">Agreement Duration</label>
                <select style={formStyles.select} id="duration" name="duration" value={formData.duration} onChange={handleChange} onBlur={handleBlur}>
                  {Array.from({ length: 60 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month}>
                      {month} {month === 1 ? 'Month' : 'Months'}
                      {month === 12 && ' (1 Year)'}
                      {month === 24 && ' (2 Years)'}
                      {month === 36 && ' (3 Years)'}
                      {month === 48 && ' (4 Years)'}
                      {month === 60 && ' (5 Years)'}
                    </option>
                  ))}
                </select>
            </div>
            {/* Agreement Type Display */}
            <div style={formStyles.formGroup}>
                 <label style={formStyles.label}>Agreement Type (Determined by Duration)</label>
                 <input
                   style={{...formStyles.input, backgroundColor: '#f8fafc', color: '#334155', fontWeight: 'bold'}}
                   type="text"
                   value={formData.agreementType}
                   disabled
                 />
            </div>
            {/* Conditional Increment Field */}
            {formData.agreementType === 'Lease Agreement' && parseInt(formData.duration, 10) >= 18 && (
                <div style={formStyles.formGroup}>
                  <label style={formStyles.label} htmlFor="incrementPercentage">Rent Increment (%) after 18 Months</label>
                  <input
                    style={formStyles.input}
                    type="number"
                    id="incrementPercentage"
                    name="incrementPercentage"
                    value={formData.incrementPercentage}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="e.g., 5"
                  />
                  {/* Optional: Add error display for increment if needed */}
                </div>
            )}

            {/* Button Group */}
            <div style={formStyles.buttonGroup}>
                <button type="button" style={{...formStyles.secondaryButton, flex: '0 1 auto'}} onClick={handleBack}>Back</button>
                <button
                  type="button"
                  style={step3ButtonDisabled ? formStyles.disabledButton : {...formStyles.primaryButton, flex: '1 1 auto'}}
                  onClick={handleNext}
                  disabled={step3ButtonDisabled}
                >
                  Next: Review & Print
                </button>
            </div>
        </div>
      )}

      {/* Step 4: Review & Print */}
      {step === 4 && (
           <form onSubmit={handleSubmit}>
             <h2 style={{ ...styles.sectionTitle, fontSize: '22px', marginTop: 0 }} className="no-print">Step 3: Review & Print Agreement</h2>
             <p style={{...styles.pageSubtitle, marginTop: '-16px', marginBottom: '24px'}} className="no-print">
               Review the agreement below. You can print it or save it as a PDF before submitting.
             </p>

             <div id="printable-agreement">
               <AgreementPreview formData={formData} ref={agreementPreviewRef} />
             </div>

             <div style={formStyles.buttonGroup} className="no-print">
               <button type="button" style={formStyles.secondaryButton} onClick={handleBack}>Back</button>
               <button type="button" style={{...formStyles.secondaryButton, ...styles.postBtn}} onClick={handlePrint}>
                 🖨️ Print/Save as PDF
               </button>
               <button type="submit" style={formStyles.primaryButton}>Submit Agreement</button>
             </div>
           </form>
      )}

      {/* Step 5: Success Message */}
      {step === 5 && (
            <div>
              <div style={formStyles.successMessage} className="no-print">
                <div style={{fontSize: '48px', marginBottom: '16px'}}>🎉</div>
                <h2 style={{ ...styles.emptyTitle, color: 'inherit' }}>Agreement Submitted!</h2>
                <p style={{ ...styles.emptyText, color: 'inherit', maxWidth: '550px', margin: '0 auto 24px auto' }}>
                  The {formData.agreementType} between
                  <strong style={{color: '#047857'}}> {formData.ownerName} </strong>
                  (Owner) and
                  <strong style={{color: '#047857'}}> {formData.tenantName} </strong>
                  (Tenant) has been successfully created.
                  Thank you for using <strong>Zero Brokerage Platform</strong>!
                </p>
                <div style={{...formStyles.buttonGroup, maxWidth: '500px', margin: '0 auto'}}>
                  <button
                    style={formStyles.secondaryButton}
                    onClick={handlePrint} // Maybe change this to download a saved copy later?
                  >
                    Download Duplicate
                  </button>
                  <button
                    style={{ ...formStyles.primaryButton, backgroundColor: '#059669' }}
                    onClick={() => { setStep(1); setFormData(initialFormData); setFormErrors({}); setTouched({}); }}
                  >
                    Create Another Agreement
                  </button>
                </div>
              </div>

              {/* Include printable agreement here too for the "Download Duplicate" button */}
              <div style={{ display: 'none' }}>
                <div id="printable-agreement-duplicate"> {/* Use different ID if needed */}
                  <AgreementPreview formData={formData} ref={agreementPreviewRef} />
                </div>
              </div>
            </div>
      )}

    </div> // End Main Container Div
  );
}

export default RentalAgreementPage;