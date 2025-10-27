// src/pages/ViewAgreementPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { styles } from '../styles'; // Make sure this path is correct

// --- 1. COPIED STYLES & UTILS FROM RentalAgreementPage.jsx ---

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
    if (scaleIndex === 1) {
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

// --- 2. COPIED AgreementPreview COMPONENT ---

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

  if (!formData) {
    return <div style={previewStyles.container} ref={ref}>Loading Agreement...</div>;
  }

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


// --- 3. THE UPDATED ViewAgreementPage COMPONENT ---

function ViewAgreementPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [agreement, setAgreement] = useState(null);
    const printRef = useRef();

    // Load agreement from localStorage using ID
    useEffect(() => {
        try {
            const storedAgreementsRaw = localStorage.getItem('myAgreements');
            const storedAgreements = storedAgreementsRaw ? JSON.parse(storedAgreementsRaw) : [];

            // This now finds the agreement saved by the handleSubmit function
            const found = storedAgreements.find(a => a.agreementId === id);
            setAgreement(found || null);
        } catch (err) {
            console.error("Error loading agreement:", err);
        }
    }, [id]);

    // This CSS is necessary to hide the UI when printing
    const printStyles = `
      @media print {
        body * {
          visibility: hidden;
        }
        #printable-agreement-view, #printable-agreement-view * {
          visibility: visible;
        }
        #printable-agreement-view {
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
    `;

    if (!agreement) {
        return (
            <div style={{...styles.container, textAlign: 'center'}}>
                <h2 style={styles.pageTitle}>Agreement Not Found</h2>
                <p>The document might have been deleted or the ID is incorrect.</p>
                <button
                  style={{...styles.signupBtn, backgroundColor: '#667eea', margin: '0 auto'}}
                  onClick={() => navigate('/my-agreements')}
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <style>{printStyles}</style>

            {/* Header (will be hidden on print) */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={styles.pageTitle}>Rental Agreement Preview</h1>
                <button
                  style={{...styles.loginBtn, backgroundColor: '#f1f5f9', color: '#475569'}}
                  onClick={() => navigate('/my-agreements')}
                >
                    Back
                </button>
            </div>

            {/* --- THIS IS THE NEW PREVIEW --- */}
            {/* It's wrapped in a div for the print styles to target */}
            <div id="printable-agreement-view">
              <AgreementPreview
                formData={agreement}
                ref={printRef}
              />
            </div>

            {/* Print Button (will be hidden on print) */}
            <div className="no-print" style={{ marginTop: '30px', textAlign: 'center' }}>
                <button
                    style={{...styles.signupBtn, backgroundColor: '#667eea'}}
                    onClick={() => window.print()}
                >
                    🖨️ Print / Download PDF
                </button>
            </div>
        </div>
    );
}

export default ViewAgreementPage;