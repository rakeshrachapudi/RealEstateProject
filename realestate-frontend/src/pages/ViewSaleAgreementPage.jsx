import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Printer, ArrowLeft } from 'lucide-react';

// --- MOCK STYLES FOR APPLICATION LAYOUT (Replaced external import) ---
const styles = {
    container: {
        maxWidth: '900px',
        margin: '40px auto',
        padding: '20px',
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    },
    pageHeader: {
        marginBottom: '25px',
    },
    pageTitle: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: '5px',
    },
    pageSubtitle: {
        fontSize: '16px',
        color: '#64748b',
    },
    postBtn: {
        padding: '12px 25px',
        borderRadius: '8px',
        border: 'none',
        color: 'white',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        backgroundColor: '#ef4444', // Red color
    },
    secondaryBtn: {
        padding: '10px 15px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        backgroundColor: 'white',
        color: '#475569',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
};

// --- UTILITY FUNCTIONS ---

// Helper for displaying data or a placeholder
const val = (data, placeholder) => data || placeholder || '[N/A]';

/**
 * Converts a number to Indian system words (Lakh, Crore).
 * Note: Simplified version for a cleaner example
 */
function convertToWords(num) {
  if (num === null || num === undefined || num === '') return '[AMOUNT IN WORDS]';
  const n = parseInt(num, 10);
  if (isNaN(n)) return '[AMOUNT IN WORDS]';

  // Basic conversion stub for presentation
  const words = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN'];
  if (n <= 10) return words[n-1] + ' LAKH';

  return n.toLocaleString('en-IN') + ' (IN WORDS)';
}


// --- DOCUMENT PREVIEW STYLES (For Printability) ---
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
  paragraph: {
    fontSize: '16px',
    marginBottom: '20px',
    textAlign: 'justify',
  },
  data: {
    fontWeight: 'bold',
    textDecoration: 'underline',
    padding: '0 5px',
    // Ensure data text is black for printing clarity
    color: 'black',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    borderBottom: '1px solid #ccc',
    paddingBottom: '5px',
    marginTop: '30px',
    marginBottom: '20px',
  },
  partyBlock: {
      paddingLeft: '20px',
      marginBottom: '15px',
  },
  scheduleBox: {
    border: '1px solid #000',
    padding: '20px 25px',
    marginTop: '30px',
  },
  signatureBlock: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: '60px',
    gap: '40px',
  },
  signature: {
    width: '45%',
    borderTop: '1px solid #000',
    paddingTop: '8px',
    fontSize: '15px',
    minWidth: '250px',
  },
};


// --- SaleDeedPreview COMPONENT ---

const SaleDeedPreview = React.forwardRef(({ formData }, ref) => {

  const getFormattedDate = (dateString) => {
    if (!dateString) return '[DATE]';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (e) {
      return '[DATE]';
    }
  };

  const executionDate = getFormattedDate(formData.startDate);
  const sellers = formData.sellers || [];
  const buyers = formData.buyers || [];

  if (!formData || sellers.length === 0 || buyers.length === 0) {
    return <div style={previewStyles.container} ref={ref}>Data missing or incomplete.</div>;
  }

  // Helper for rendering a party block (Seller or Buyer)
  const renderParty = (party, index) => (
    <div key={`party-${party.name}-${index}`} style={previewStyles.partyBlock}>
        <p style={{...previewStyles.paragraph, marginBottom: '5px'}}>
          <strong>{index + 1}. </strong>
          <span style={previewStyles.data}>{val(party.name, '[NAME]')}</span>,
          {party.so_wo} <span style={previewStyles.data}>{val(party.relationName, '[FATHER/HUSBAND NAME]')}</span>,
          Aged about <span style={previewStyles.data}>{val(party.age, '[AGE]')}</span> years,
          Occupation: <span style={previewStyles.data}>{val(party.occupation, '[OCCUPATION]')}</span>,
          Residing at <span style={previewStyles.data}>{val(party.address, '[ADDRESS]')}</span>.
          <br/>
          (Phone: <span style={previewStyles.data}>{val(party.phone, '[PHONE]')}</span>, {val(party.idType, 'ID')}: <span style={previewStyles.data}>{val(party.idNumber, '[ID NUMBER]')}</span>)
        </p>
    </div>
  );

  return (
    <div id="printable-sale-deed" style={previewStyles.container} ref={ref}>
      <h1 style={previewStyles.title}>SALE AGREEMENT / SALE DEED DRAFT</h1>

      <p style={previewStyles.paragraph}>
        This Sale Agreement / Deed is made and executed on this <span style={previewStyles.data}>{val(executionDate, 'DAY OF MONTH, YEAR')}</span> at <span style={previewStyles.data}>{val(formData.executionCity, '[CITY]')}</span> by and between:
      </p>

      {/* --- SELLERS --- */}
      <h3 style={previewStyles.sectionTitle}>I. VENDOR / SELLER (FIRST PART)</h3>
      {sellers.map(renderParty)}
      <p style={previewStyles.paragraph}>(Hereinafter collectively called the "<strong>SELLER(S)</strong>", which expression shall unless repugnant to the context or meaning thereof mean and include their respective legal heirs, executors, administrators, and assigns) of the <strong>FIRST PART</strong>.</p>


      <p style={{...previewStyles.paragraph, textAlign: 'center'}}>
        <strong>A N D</strong>
      </p>

      {/* --- BUYERS --- */}
      <h3 style={previewStyles.sectionTitle}>II. BUYER (SECOND PART)</h3>
      {buyers.map(renderParty)}
      <p style={previewStyles.paragraph}>(Hereinafter collectively called the "<strong>BUYER(S)</strong>", which expression shall unless repugnant to the context or meaning thereof mean and include their respective legal heirs, executors, administrators, and assigns) of the <strong>SECOND PART</strong>.</p>

      <p style={previewStyles.paragraph}>The expressions "SELLERS" and "BUYERS" shall mean and include their respective heirs, legal representatives, etc.</p>

      <h3 style={{...previewStyles.sectionTitle, textAlign: 'center', textDecoration: 'underline'}}>WHEREAS:</h3>

      <p style={previewStyles.paragraph}>
        A. WHEREAS the Sellers are the absolute owners, possessors and in peaceful enjoyment of the property described in the **SCHEDULE OF PROPERTY** hereunder, having acquired the same through <span style={previewStyles.data}>{val(formData.acquisitionMethod, '[Acquisition Method]')}</span>.
      </p>

      <p style={previewStyles.paragraph}>
        B. WHEREAS the Sellers have agreed to sell the Schedule Property to the Buyers for a total sale consideration of
        <span style={previewStyles.data}>Rs. {val(formData.totalConsideration?.toLocaleString('en-IN'), '[AMOUNT]')} /- (Rupees {val(convertToWords(formData.totalConsideration))} Only)</span>, and the Buyers have agreed to purchase the same.
      </p>


      <h2 style={{ ...previewStyles.sectionTitle, textAlign: 'center', marginTop: '40px' }}>
        NOW, THIS SALE AGREEMENT WITNESSETH AS FOLLOWS:
      </h2>

      <p style={previewStyles.paragraph}>
        1. In consideration of the sum of <span style={previewStyles.data}>Rs. {val(formData.totalConsideration?.toLocaleString('en-IN'), '[AMOUNT]')} /-</span>, the Sellers hereby convey, transfer, and assign the Schedule Property to the Buyers, the receipt of which is hereby admitted and acknowledged.
      </p>
      <p style={previewStyles.paragraph}>
        2. The Sellers confirm the delivery of vacant and peaceful possession of the property to the Buyers on the execution date.
      </p>


      {/* --- SCHEDULE OF PROPERTY --- */}
      <div style={previewStyles.scheduleBox}>
        <h3 style={{...previewStyles.sectionTitle, textAlign: 'center', borderBottom: 'none', margin: 0, padding: 0}}>SCHEDULE OF PROPERTY (SCHEDULE A)</h3>
        <h4 style={{textAlign: 'center', margin: '0 0 15px 0', textDecoration: 'underline', fontSize: '16px'}}>Description of the Property Hereby Sold</h4>
        <p style={previewStyles.paragraph}>
          All that piece and parcel of the <span style={previewStyles.data}>{val(formData.propertyType, '[Property Type]')}</span> situated at <span style={previewStyles.data}>{val(formData.propertyAddress, '[Full Property Address]')}</span>.
        </p>
         <p style={previewStyles.paragraph}>
          Bearing Survey No(s). <span style={previewStyles.data}>{val(formData.landSurveyNos, '[Survey Nos]')}</span>, located at <span style={previewStyles.data}>{val(formData.landVillage, '[Village]')}</span> Village, <span style={previewStyles.data}>{val(formData.landMandal, '[Mandal]')}</span> Mandal, <span style={previewStyles.data}>{val(formData.landDistrict, '[District]')}</span> District. Admeasuring a total extent of <span style={previewStyles.data}>{val(formData.landTotalArea, '[Area]')}</span>.
        </p>
        <h4 style={{...previewStyles.sectionTitle, fontSize: '16px', color: '#333', borderBottom: '1px dotted #ccc'}}>Boundaries (SCHEDULE B):</h4>
        <ul style={{listStyleType: 'none', paddingLeft: '10px'}}>
          <li><strong>North:</strong> <span style={previewStyles.data}>{val(formData.scheduleBoundsNorth, '[Boundary]')}</span></li>
          <li><strong>South:</strong> <span style={previewStyles.data}>{val(formData.scheduleBoundsSouth, '[Boundary]')}</span></li>
          <li><strong>East:</strong> <span style={previewStyles.data}>{val(formData.scheduleBoundsEast, '[Boundary]')}</span></li>
          <li><strong>West:</strong> <span style={previewStyles.data}>{val(formData.scheduleBoundsWest, '[Boundary]')}</span></li>
        </ul>
      </div>

      <p style={{ ...previewStyles.paragraph, marginTop: '50px' }}>
        <strong>IN WITNESS WHEREOF</strong>, the parties have executed this Sale Agreement / Deed on the day, month, and year first above written.
      </p>

      {/* --- SIGNATURES --- */}
      <div style={previewStyles.signatureBlock}>
        {/* Seller Signatures */}
        {sellers.map((seller, index) => (
             <div key={`sig-seller-${index}`} style={previewStyles.signature}>
              <strong>(SELLER {sellers.length > 1 ? index + 1 : ''})</strong>
              <br /><br /><br />
              <span style={{fontWeight: 'normal'}}>{val(seller.name, '[SELLER NAME]')}</span>
            </div>
        ))}
        {/* Buyer Signatures */}
        {buyers.map((buyer, index) => (
             <div key={`sig-buyer-${index}`} style={previewStyles.signature}>
              <strong>(BUYER {buyers.length > 1 ? index + 1 : ''})</strong>
              <br /><br /><br />
              <span style={{fontWeight: 'normal'}}>{val(buyer.name, '[BUYER NAME]')}</span>
            </div>
        ))}
      </div>

      <div className="mt-20">
        <p className="font-bold mb-8">WITNESSES:</p>
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


// --- MAIN PAGE COMPONENT ---
// Simulates fetching data based on a route parameter (id)
function ViewSaleAgreementPage() {
    // We can't use `useParams` without a Router, so we mock the ID for demonstration
    // If you are using React Router, uncomment the line below:
    // const { id } = useParams();
    const id = 'AGMT-1729780800000'; // Mocking an ID for a saved draft
    const navigate = useNavigate();
    const [agreement, setAgreement] = useState(null);
    const printRef = useRef();

    useEffect(() => {
        try {
            const storedAgreementsRaw = localStorage.getItem('myAgreements');
            const storedAgreements = storedAgreementsRaw ? JSON.parse(storedAgreementsRaw) : [];
            const found = storedAgreements.find(a => a.agreementId === id);
            setAgreement(found || null);

            // If no agreement is found, load a simple mock based on the initial state for demonstration
            if (!found) {
                console.log("Mocking default agreement data since no matching ID was found.");
                const personTemplate = { name: 'Ram Singh', so_wo: 'S/o', relationName: 'Dashrath Singh', age: '45', occupation: 'Service', address: '123, Main St, Hyd', phone: '9876543210', idType: 'Aadhaar', idNumber: '123456789012' };
                setAgreement({
                    agreementId: id,
                    agreementType: 'Sale Agreement',
                    startDate: '2024-10-27',
                    executionCity: 'Hyderabad',
                    sellers: [{ ...personTemplate, name: 'Sita Devi', age: '50' }],
                    buyers: [{ ...personTemplate, name: 'Laxman Varma' }],
                    propertyAddress: 'H.No 4-50, near Hanuman Temple, Begumpet, Hyderabad',
                    propertyType: 'Residential Plot',
                    acquisitionMethod: 'Ancestral',
                    totalConsideration: 5500000,
                    landSurveyNos: '101/A, 101/B',
                    landVillage: 'Kukatpally',
                    landMandal: 'Miyapur',
                    landDistrict: 'R.R. District',
                    landTotalArea: '300 Sq. Yds.',
                    scheduleBoundsNorth: 'Adjacent Plot',
                    scheduleBoundsSouth: '60 Ft Road',
                    scheduleBoundsEast: 'House of Mr. A',
                    scheduleBoundsWest: 'Park',
                });
            }
        } catch (err) {
            console.error("Error loading agreement:", err);
            setAgreement(null);
        }
    }, [id]);

    const printStyles = `
      @media print {
        body * { visibility: hidden !important; }
        #printable-sale-deed, #printable-sale-deed * { visibility: visible !important; }
        #printable-sale-deed { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; border: none; box-shadow: none; }
        .no-print { display: none !important; }
      }
    `;

    // Fallback in case of navigation error or no agreement data
    if (!agreement) {
        return (
            <div style={{...styles.container, textAlign: 'center'}}>
                <h2 style={styles.pageTitle}>Agreement Not Found</h2>
                <p>Loading agreement data or the document might have been deleted/ID is incorrect.</p>
                <button
                  style={{...styles.secondaryBtn, margin: '20px auto 0'}}
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

            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '15px' }}>
                <h1 style={styles.pageTitle}>Sale Agreement Preview</h1>
                <div style={{display: 'flex', gap: '10px'}}>
                     <button
                        style={styles.secondaryBtn}
                        onClick={() => navigate('/my-agreements')}
                    >
                        <ArrowLeft style={{display: 'inline', width: '16px', height: '16px', marginRight: '5px'}}/> Back
                    </button>
                    <button
                        style={{...styles.postBtn, backgroundColor: '#3b82f6'}}
                        onClick={() => window.print()}
                    >
                        <Printer style={{display: 'inline', width: '16px', height: '16px', marginRight: '5px'}}/> Print / Download PDF
                    </button>
                </div>
            </div>

            <SaleDeedPreview
                formData={agreement}
                ref={printRef}
            />
        </div>
    );
}

export default ViewSaleAgreementPage;