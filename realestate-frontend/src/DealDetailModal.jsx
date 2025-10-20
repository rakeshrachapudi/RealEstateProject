import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ===========================================
// 1. INLINE DealProgressBar Component
// ===========================================
const DealProgressBar = ({ deal }) => {
  const allStages = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT', 'COMPLETED'];
  const currentStage = deal.currentStage || deal.stage || 'INQUIRY';
  const currentStageIndex = allStages.indexOf(currentStage);

  const getStageColor = (stage) => {
    const colors = {
      'INQUIRY': '#3b82f6',
      'SHORTLIST': '#8b5cf6',
      'NEGOTIATION': '#f59e0b',
      'AGREEMENT': '#10b981',
      'REGISTRATION': '#06b6d4',
      'PAYMENT': '#ec4899',
      'COMPLETED': '#22c55e',
    };
    return colors[stage] || '#6b7280';
  };

  return (
    <div style={{ marginBottom: '24px', padding: '10px 0', overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', minWidth: '700px', padding: '10px' }}>
        {allStages.map((stage, index) => {
          const isActive = index <= currentStageIndex;
          const isCompleted = index < currentStageIndex;
          const color = getStageColor(stage);

          return (
            <div key={stage} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
              {/* Progress Line */}
              {index > 0 && (
                <div style={{
                  position: 'absolute', top: '15px', left: '-50%', right: '50%', height: '4px',
                  backgroundColor: isCompleted ? color : '#e5e7eb', zIndex: 0
                }} />
              )}
              {/* Stage Pin */}
              <div style={{
                width: '30px', height: '30px', margin: '0 auto 8px', borderRadius: '50%',
                backgroundColor: isActive ? color : '#e5e7eb', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold', fontSize: '12px', position: 'relative', zIndex: 1,
                boxShadow: isActive ? `0 0 0 3px white, 0 0 0 5px ${color}` : 'none'
              }}>
                {isCompleted ? '✓' : index + 1}
              </div>
              {/* Label */}
              <div style={{
                fontSize: '11px', fontWeight: '600', color: isActive ? color : '#64748b'
              }}>
                {stage}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


// ===========================================
// 2. INLINE DocumentUploadModal Component
// ===========================================
const DocumentUploadModal = ({ deal, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('Agreement');
  const [uploading, setUploading] = useState(false);

  const mockDocuments = [
    { id: 1, name: 'Sale Agreement Draft.pdf', type: 'Agreement', uploaded: '2025-10-01' },
    { id: 2, name: 'Buyer_KYC_Aadhar.jpg', type: 'KYC', uploaded: '2025-09-28' },
    { id: 3, name: 'Property_Title_Scan.pdf', type: 'Title Deed', uploaded: '2025-09-25' },
  ];

  const [documents, setDocuments] = useState(mockDocuments);

  const handleFileUpload = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    // Simulate API call delay
    setTimeout(() => {
      console.log(`Mock Uploading file: ${selectedFile.name} as type ${docType} for deal ${deal.dealId}`);
      // Simulate successful upload and update local list
      const newDoc = {
        id: documents.length + 1,
        name: selectedFile.name,
        type: docType,
        uploaded: new Date().toISOString().substring(0, 10)
      };
      setDocuments([...documents, newDoc]);
      setSelectedFile(null);
      setUploading(false);
      // NOTE: Using console.log instead of alert()
      console.log('Document uploaded successfully (Mock)!');
    }, 1500);
  };

  const modalStyles = {
    backdrop: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 10002, padding: '20px'
    },
    modal: {
      backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '700px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.4)', padding: '30px', position: 'relative', maxHeight: '90vh', overflowY: 'auto'
    },
    title: { fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: '0 0 20px 0' },
    closeBtn: {
      position: 'absolute', top: '15px', right: '15px', background: 'none',
      border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b'
    },
    uploadCard: {
      padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '10px',
      marginBottom: '20px', border: '1px dashed #94a3b8'
    },
    formGroup: { marginBottom: '15px' },
    label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '5px' },
    input: {
      width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1',
      borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: 'white'
    },
    fileInputContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
    fileInputText: {
        flex: 1, padding: '10px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px',
        fontSize: '14px', color: selectedFile ? '#1e293b' : '#94a3b8',
    },
    fileInputBtn: {
        backgroundColor: '#8b5cf6', color: 'white', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer',
        fontSize: '14px', border: 'none', fontWeight: '600', flexShrink: 0
    },
    submitBtn: {
        width: '100%', padding: '12px 0', backgroundColor: '#10b981', color: 'white',
        border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s',
        marginTop: '10px'
    },
    listTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b', margin: '0 0 15px 0' },
    documentItem: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px', borderBottom: '1px solid #e2e8f0'
    },
    docInfo: { display: 'flex', flexDirection: 'column' },
    docName: { fontWeight: '600', color: '#1e293b', fontSize: '14px' },
    docMeta: { fontSize: '12px', color: '#64748b' },
    viewBtn: {
      backgroundColor: '#3b82f6', color: 'white', padding: '8px 12px', borderRadius: '4px',
      fontSize: '12px', border: 'none', cursor: 'pointer', transition: 'background 0.2s'
    }
  };

  return (
    <div style={modalStyles.backdrop} onClick={onClose}>
      <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onClose}>×</button>
        <h2 style={modalStyles.title}>📄 Documents for Deal #{deal.dealId || deal.id}</h2>

        {/* Upload Form */}
        <div style={modalStyles.uploadCard}>
          <h3 style={{...modalStyles.title, fontSize: '18px', margin: '0 0 15px 0'}}>Upload New Document</h3>
          <form onSubmit={handleSubmit}>
            <div style={modalStyles.formGroup}>
              <label style={modalStyles.label} htmlFor="docType">Document Type</label>
              <select
                id="docType"
                value={docType}
                onChange={e => setDocType(e.target.value)}
                style={modalStyles.input}
              >
                <option>Agreement</option>
                <option>KYC</option>
                <option>Title Deed</option>
                <option>Financials</option>
                <option>Other</option>
              </select>
            </div>

            <div style={modalStyles.formGroup}>
                <label style={modalStyles.label} htmlFor="fileInput">Select File</label>
                <div style={modalStyles.fileInputContainer}>
                    <div style={modalStyles.fileInputText}>
                        {selectedFile ? selectedFile.name : 'No file selected'}
                    </div>
                    <input
                      type="file"
                      id="fileInput"
                      onChange={handleFileUpload}
                      style={{display: 'none'}}
                    />
                    <label htmlFor="fileInput" style={modalStyles.fileInputBtn}>
                        Choose File
                    </label>
                </div>
            </div>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              style={modalStyles.submitBtn}
            >
              {uploading ? '⏳ Uploading...' : '✓ Upload Document'}
            </button>
          </form>
        </div>

        {/* Document List */}
        <h3 style={modalStyles.listTitle}>Existing Documents ({documents.length})</h3>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {documents.length > 0 ? (
            documents.map(doc => (
              <div key={doc.id} style={modalStyles.documentItem}>
                <div style={modalStyles.docInfo}>
                  <span style={modalStyles.docName}>{doc.name}</span>
                  <span style={modalStyles.docMeta}>Type: {doc.type} | Uploaded: {doc.uploaded}</span>
                </div>
                <button
                  style={modalStyles.viewBtn}
                  onClick={() => console.log(`Mock: Viewing document ${doc.name}`)}
                >
                  View
                </button>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
              No documents have been uploaded for this deal yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// ===========================================
// 3. MAIN DealDetailModal Component
// ===========================================

// --- MOCK FUNCTION FOR DETAILED HISTORY (FINAL, ROBUST FIX) ---
const mockDealHistory = (deal) => {
  const history = [];
  const allStages = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT', 'COMPLETED'];

  const getStageNotes = (stage) => {
      // These are FALLBACK notes, used ONLY if the agent hasn't provided a custom note
      // when transitioning to or updating status within this stage.
      switch (stage) {
          case 'INQUIRY': return 'Initial interest expressed by buyer after seeing property listing online.';
          case 'SHORTLIST': return 'Agent conducted a physical property visit with the buyer. Buyer confirmed shortlisted status.';
          case 'NEGOTIATION': return 'Standard progression to negotiation phase.';
          case 'AGREEMENT': return 'Standard progression to agreement phase.';
          case 'REGISTRATION': return 'Standard progression to registration phase.';
          case 'PAYMENT': return 'Standard progression to payment phase.';
          case 'COMPLETED': return 'Deal completed (Finalized).';
          default: return '';
      }
  };

  // 1. Get the list of all agent-provided notes
  const localHistory = deal.localNotesHistory || [];

  // 2. Build the history from confirmed stage dates, prioritizing the agent's note
  const usedNoteKeys = new Set();

  allStages.forEach((stage) => {
      const dateKey = `${stage.toLowerCase()}Date`;
      const date = deal[dateKey];

      if (date) {
          let notes = '';
          let noteDate = date;

          // CRITICAL: Find the LATEST custom note from the agent that occurred ON OR AFTER the stage transition date.
          const customNoteEntry = localHistory
              .filter(entry =>
                  entry.stage === stage &&
                  new Date(entry.date).getTime() >= new Date(date).getTime() - 1000 // Allow 1s tolerance for API vs local clock sync
              )
              .sort((a, b) => new Date(b.date) - new Date(a.date))[0]; // Get the newest

          if (customNoteEntry) {
              // Priority 1: Use the agent's custom note and its exact timestamp.
              notes = customNoteEntry.notes;
              noteDate = customNoteEntry.date;
              usedNoteKeys.add(`${noteDate}-${customNoteEntry.stage}`);
          } else {
              // Fallback: Use the fixed canned note and the official API stage date.
              notes = getStageNotes(stage);
          }

          if (notes) {
              history.push({
                  date: noteDate,
                  stage: stage,
                  notes: notes,
                  formattedDate: new Date(noteDate).toLocaleString()
              });
          }
      }
  });


  // 3. Add any custom notes that are *not* the primary stage transition note (updates within a stage).
  localHistory.forEach(entry => {
      const entryKey = `${entry.date}-${entry.stage}`;

      // Only push the note if it hasn't already been used as the official stage transition entry
      if (!usedNoteKeys.has(entryKey) && entry.notes) {
          // Check if this note is close enough to a stage date to be considered the same, and if so, skip it.
          // This prevents notes entered at the *exact* transition moment from duplicating.

          const isDuplicateTransition = history.some(h =>
            h.stage === entry.stage &&
            Math.abs(new Date(h.date).getTime() - new Date(entry.date).getTime()) < 500 // 500ms tolerance
          );

          if (!isDuplicateTransition) {
              history.push(entry);
          }
      }
  });

  // Ensure entries are sorted by date
  return history.sort((a, b) => new Date(a.date) - new Date(b.date));
};


const DealDetailModal = ({ deal: initialDeal, onClose, onUpdate, userRole, showOnlyOverview = false }) => {
  const [deal, setDeal] = useState(initialDeal || {});
  const [activeTab, setActiveTab] = useState('overview');
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().substring(0, 10));
  const [newStage, setNewStage] = useState(() => (initialDeal?.currentStage || initialDeal?.stage || 'INQUIRY'));

  const timelineEndRef = useRef(null);
  const navigate = useNavigate();

  const dealId = deal.id || deal.dealId;
  const currentDealStage = deal.currentStage || deal.stage || 'INQUIRY';

  // Role-based tab visibility
  const isAgentOrAdmin = userRole === 'AGENT' || userRole === 'ADMIN';
  const displayTabs = isAgentOrAdmin ? ['overview', 'timeline', 'actions'] : ['overview'];

  useEffect(() => {
    // This effect handles the initial data load/mock
    if (initialDeal && initialDeal.dealId) {
      // Mock fetch...
      const fetchFullDeal = async () => {
        try {
          // Mocking an API call to load the full deal object
          const mockApiData = {
              ...initialDeal,
              // If the initial deal came from a list, it might be incomplete.
              // We ensure local history is preserved or initialized.
              localNotesHistory: initialDeal.localNotesHistory || [],
          };

          // Simulate a network delay
          await new Promise(resolve => setTimeout(resolve, 50));

          setDeal(mockApiData);

        } catch (err) {
          console.error("Mock fetch failed:", err);
          setDeal(initialDeal || {});
        }
      };

      fetchFullDeal();
    } else {
      setDeal(initialDeal || {});
    }

    // Reset form state on deal change
    setNewStage(initialDeal?.currentStage || initialDeal?.stage || 'INQUIRY');
    setNotes('');
    setVisitDate(new Date().toISOString().substring(0, 10));
  }, [initialDeal, userRole]);

  // ========== BUILD TIMELINE DATA AND LATEST NOTES ==========
  const getTimelineDataWithHistory = (dealData = {}) => {
    return mockDealHistory(dealData);
  };

  const timelineData = getTimelineDataWithHistory(deal);

  // CRITICAL: Extract the latest note AND phase directly from the timeline data
  const latestNoteEntry = timelineData.length > 0 ? timelineData[timelineData.length - 1] : null;
  const latestNote = latestNoteEntry ? latestNoteEntry.notes : '';
  const latestStage = latestNoteEntry ? latestNoteEntry.stage : '';


  const scrollToTimelineEnd = (smooth = true) => {
    setTimeout(() => {
      if (timelineEndRef.current) {
        timelineEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
      }
    }, 150);
  };

  const updateLocalAndParent = (updatedDeal, newHistoryEntry = null) => {
    let finalDeal = updatedDeal;

    if (newHistoryEntry) {
        const existingLocalHistory = finalDeal.localNotesHistory || deal.localNotesHistory || [];
        finalDeal = {
            ...finalDeal,
            // Ensure the API's latest notes are also reflected in the finalDeal object for other displays
            notes: newHistoryEntry.notes,
            localNotesHistory: [...existingLocalHistory, newHistoryEntry]
        };
    }

    setDeal(finalDeal);
    if (typeof onUpdate === 'function') onUpdate(finalDeal);
  };

  // ========== API HANDLERS ==========
  const handleUpdateStage = async () => {
    if (!visitDate || !notes.trim()) {
      console.error('❌ Please provide both the Date of Visit/Update and a Matter of Visit/Note.');
      return;
    }

    setUpdating(true);
    try {
      // --- MOCK API CALL START ---
      console.log(`MOCK: Updating deal ${dealId} to ${newStage} with notes: "${notes}" on date ${visitDate}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      // Mock the updated deal object as if returned from the server
      const updatedDeal = {
          ...deal,
          currentStage: newStage,
          stage: newStage,
          notes: notes, // API returns the latest note
          // Mocking the stage date update based on the agent's input date
          [`${newStage.toLowerCase()}Date`]: new Date(visitDate).toISOString(),
          updatedAt: new Date().toISOString(),
      };
      // --- MOCK API CALL END ---

      // Create the new history entry LOCALLY using the exact 'notes' the agent typed
      const newHistoryEntry = {
          date: new Date().toISOString(), // Use current time for the history log entry
          stage: newStage,
          notes: notes, // Capturing the agent's entered note
          formattedDate: new Date().toLocaleString()
      };

      // Pass the new note to update local state and local history
      updateLocalAndParent(updatedDeal, newHistoryEntry);

      setNotes('');
      setVisitDate(new Date().toISOString().substring(0, 10));
      setActiveTab('timeline');
      scrollToTimelineEnd();

    } catch (err) {
      console.error('Error updating deal: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSellerConfirm = async () => {
    // ... (logic for seller confirm)
    try {
      // --- MOCK API CALL START ---
      console.log(`MOCK: Seller Confirm for deal ${dealId}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      const updatedDeal = {
          ...deal,
          sellerConfirmed: true,
          // Move to next stage and update date
          currentStage: 'PAYMENT',
          stage: 'PAYMENT',
          paymentDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
      };
      // --- MOCK API CALL END ---

      // Create a history entry for the confirmation
      const newHistoryEntry = {
          date: new Date().toISOString(),
          stage: 'PAYMENT',
          notes: 'Seller confirmed all registration documents. Deal officially moved to PAYMENT stage.',
          formattedDate: new Date().toLocaleString()
      };
      updateLocalAndParent(updatedDeal, newHistoryEntry);
      setActiveTab('timeline');
      setNewStage('PAYMENT'); // Update form selector
      scrollToTimelineEnd();
    } catch (err) {
      console.error('Error confirming deal: ' + err.message);
    }
  };

  const handleCompletePayment = async () => {
    // ... (logic for payment)
    try {
      // --- MOCK API CALL START ---
      console.log(`MOCK: Payment Complete for deal ${dealId}`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

      const updatedDeal = {
          ...deal,
          paymentCompleted: true,
          // Move to final stage and update date
          currentStage: 'COMPLETED',
          stage: 'COMPLETED',
          completedDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
      };
      // --- MOCK API CALL END ---

      // Create a history entry for the completion
       const newHistoryEntry = {
          date: new Date().toISOString(),
          stage: 'COMPLETED',
          notes: 'Final payment received and verified. Deal successfully completed!',
          formattedDate: new Date().toLocaleString()
      };
      updateLocalAndParent(updatedDeal, newHistoryEntry);
      setActiveTab('timeline');
      scrollToTimelineEnd();
    } catch (err) {
      console.error('Error completing payment: ' + err.message);
    }
  };

  const getStageOptions = (current) => {
    const stages = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT', 'COMPLETED'];
    const currentIndex = Math.max(0, stages.indexOf(current));
    return stages.slice(currentIndex);
  };

  const getStageColor = (stage) => {
    const colors = {
      'INQUIRY': '#3b82f6',
      'SHORTLIST': '#8b5cf6',
      'NEGOTIATION': '#f59e0b',
      'AGREEMENT': '#10b981',
      'REGISTRATION': '#06b6d4',
      'PAYMENT': '#ec4899',
      'COMPLETED': '#22c55e',
    };
    return colors[stage] || '#6b7280';
  };

  const formatPrice = (price) => {
    if (!price) return 'TBD';
    const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numericPrice)) return String(price);
    return numericPrice.toLocaleString('en-IN');
  };

  const handleViewProperty = () => {
    console.log(`Navigating to property: /property/${deal.propertyId || deal.property?.id}`);
    navigate(`/property/${deal.propertyId || deal.property?.id}`);
    onClose();
  };

  if (!deal) return null;

  const styles = {
    backdrop: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 10001, padding: '20px'
    },
    modal: {
      backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '900px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.4)', position: 'relative', maxHeight: '90vh', overflowY: 'auto'
    },
    header: { padding: '20px 30px 10px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '24px', fontWeight: '700', color: '#1e293b', margin: 0 },
    stageBadge: { padding: '5px 10px', borderRadius: '20px', color: 'white', fontWeight: 'bold', fontSize: '12px' },
    closeBtn: { position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b', zIndex: 10 },
    tabContainer: { display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 30px' },
    tab: { padding: '10px 15px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600', color: '#64748b', borderBottom: '3px solid transparent', transition: 'all 0.2s' },
    activeTab: { color: '#3b82f6', borderBottom: '3px solid #3b82f6' },
    content: { padding: '30px' },
    gridContainer: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    section: { marginBottom: '10px' },
    sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#3b82f6', marginBottom: '10px', borderBottom: '2px solid #eff6ff', paddingBottom: '5px' },
    infoBox: { backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #e5e7eb' },
    infoRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
    label: { fontWeight: '600', color: '#475569', fontSize: '14px' },
    value: { color: '#1e293b', fontSize: '14px' },
    notesBox: { backgroundColor: '#fffbe6', padding: '15px', borderRadius: '8px', border: '1px solid #fde047', color: '#78350f', whiteSpace: 'pre-wrap' },
    datesGrid: { display: 'flex', justifyContent: 'space-between', padding: '10px 0' },
    dateItem: { textAlign: 'center', flex: 1, padding: '0 10px' },

    // Timeline Styles
    timelineContainer: { borderLeft: '3px solid #e2e8f0', paddingLeft: '20px', position: 'relative', maxHeight: '400px', overflowY: 'auto' },
    timelineEntry: { marginBottom: '30px', position: 'relative' },
    timelinePin: {
      position: 'absolute', left: '-31.5px', top: '0',
      width: '15px', height: '15px', borderRadius: '50%',
      backgroundColor: '#3b82f6', border: '3px solid white', boxShadow: '0 0 0 2px #3b82f6'
    },
    timelineStage: { fontWeight: '700', color: '#1e293b', marginBottom: '5px', fontSize: '16px' },
    timelineDate: { fontSize: '12px', color: '#64748b', marginBottom: '8px' },
    timelineNotes: {
        backgroundColor: '#f0f9ff',
        padding: '10px',
        borderRadius: '6px',
        borderLeft: '4px solid #3b82f6',
        fontSize: '14px',
        color: '#1e293b',
        whiteSpace: 'pre-wrap',
    },

    // Actions Styles
    actionCard: { padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#f9fafb' },
    actionTitle: { fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '15px' },
    formGroup: { marginBottom: '15px' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: 'white' },
    primaryBtn: { width: '100%', padding: '12px 0', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' },
    secondaryBtn: { width: '100%', padding: '12px 0', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s' },
    successBtn: { width: '100%', padding: '12px 0', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s', marginBottom: '20px' },
    warningBtn: { width: '100%', padding: '12px 0', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.2s', marginBottom: '20px' },
    successAlert: { padding: '15px', backgroundColor: '#d1fae5', border: '1px solid #34d399', color: '#065f46', borderRadius: '8px', marginBottom: '20px', fontWeight: '600' },
    warningAlert: { padding: '15px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', color: '#92400e', borderRadius: '8px', marginBottom: '20px', fontWeight: '600' },
    footer: { padding: '15px 30px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' },
    viewPropertyBtn: { backgroundColor: '#10b981', color: 'white', padding: '10px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' },
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button style={styles.closeBtn} onClick={onClose}>×</button>

        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>{deal.propertyTitle || deal.property?.title || 'Deal Details'}</h2>
          <div style={{ ...styles.stageBadge, backgroundColor: getStageColor(currentDealStage) }}>
            {currentDealStage}
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={styles.tabContainer}>
          {displayTabs.includes('overview') && (
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                ...styles.tab,
                ...(activeTab === 'overview' ? styles.activeTab : {})
              }}
            >
              📋 Overview
            </button>
          )}
          {displayTabs.includes('timeline') && (
            <button
              onClick={() => { setActiveTab('timeline'); scrollToTimelineEnd(); }}
              style={{
                ...styles.tab,
                ...(activeTab === 'timeline' ? styles.activeTab : {})
              }}
            >
              📅 Timeline
            </button>
          )}
          {displayTabs.includes('actions') && (
            <button
              onClick={() => setActiveTab('actions')}
              style={{
                ...styles.tab,
                ...(activeTab === 'actions' ? styles.activeTab : {})
              }}
            >
              ⚙️ Actions
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div style={styles.content}>
          {/* ========== OVERVIEW TAB ========== */}
          {activeTab === 'overview' && (
            <div>
              <DealProgressBar
                deal={deal}
              />

              <div style={styles.gridContainer}>
                {/* Property Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>🏠 Property</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Title</span>
                      <span style={styles.value}>{deal.propertyTitle || deal.property?.title || 'Property'}</span>
                    </div>
                    {deal.propertyPrice && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Listing Price (₹)</span>
                        <span style={styles.value}>₹{formatPrice(deal.propertyPrice)}</span>
                      </div>
                    )}
                    {deal.agreedPrice && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Agreed Price (₹)</span>
                        <span style={styles.value}>₹{formatPrice(deal.agreedPrice)}</span>
                      </div>
                    )}
                    {deal.propertyCity && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Location</span>
                        <span style={styles.value}>{deal.propertyCity}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Buyer Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>👤 Buyer</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Name</span>
                      <span style={styles.value}>{deal.buyerName || 'N/A'}</span>
                    </div>
                    {deal.buyerEmail && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Email</span>
                        <span style={styles.value}>{deal.buyerEmail}</span>
                      </div>
                    )}
                    {deal.buyerMobile && isAgentOrAdmin && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Phone</span>
                        <span style={styles.value}>{deal.buyerMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seller Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>🏢 Seller</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Name</span>
                      <span style={styles.value}>{deal.sellerName || 'N/A'}</span>
                    </div>
                    {deal.sellerEmail && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Email</span>
                        <span style={styles.value}>{deal.sellerEmail}</span>
                      </div>
                    )}
                    {deal.sellerMobile && isAgentOrAdmin && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Phone</span>
                        <span style={styles.value}>{deal.sellerMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Agent Section */}
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>📊 Agent</h3>
                  <div style={styles.infoBox}>
                    <div style={styles.infoRow}>
                      <span style={styles.label}>Name</span>
                      <span style={styles.value}>{deal.agentName || 'Not Assigned'}</span>
                    </div>
                    {deal.agentEmail && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Email</span>
                        <span style={styles.value}>{deal.agentEmail}</span>
                      </div>
                    )}
                    {deal.agentMobile && isAgentOrAdmin && (
                      <div style={styles.infoRow}>
                        <span style={styles.label}>Phone</span>
                        <span style={styles.value}>{deal.agentMobile}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes Section (CRITICAL: Uses the latestNote and latestStage) */}
                {(latestNote && latestStage) && (
                  <div style={{ ...styles.section, gridColumn: '1 / -1' }}>
                    <h3 style={styles.sectionTitle}>📝 Latest Status Note</h3>
                    <div style={styles.notesBox}>
                        {/* Display the Phase (Stage) before the note for clarity */}
                        <span style={{fontWeight: '700', color: getStageColor(latestStage), display: 'block', marginBottom: '5px'}}>
                           {latestStage} PHASE UPDATE:
                        </span>
                        {latestNote}
                        <br/><br/>
                        <span style={{fontSize: '11px', color: '#52525b'}}>
                            *Matches the last entry in the Timeline Tab.
                        </span>
                    </div>
                  </div>
                )}

                {/* Dates Section */}
                <div style={{ ...styles.section, gridColumn: '1 / -1' }}>
                  <h3 style={styles.sectionTitle}>📅 Important Dates</h3>
                  <div style={styles.datesGrid}>
                    <div style={styles.dateItem}>
                      <span style={styles.label}>Created</span>
                      <span style={styles.value}>
                        {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div style={styles.dateItem}>
                      <span style={styles.label}>Last Updated</span>
                      <span style={styles.value}>
                        {deal.updatedAt ? new Date(deal.updatedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========== TIMELINE TAB ========== */}
          {activeTab === 'timeline' && displayTabs.includes('timeline') && (
            <div>
              {timelineData.length > 0 ? (
                <div style={styles.timelineContainer}>
                  {timelineData.map((entry, index) => (
                    <div key={`${entry.stage}-${entry.date}-${index}`} style={styles.timelineEntry}>
                      <div style={{...styles.timelinePin, backgroundColor: getStageColor(entry.stage)}}></div>
                      <div style={styles.timelineStage}>{entry.stage}</div>
                      <div style={styles.timelineDate}>{new Date(entry.date).toLocaleString()}</div>
                      <div style={styles.timelineNotes}>
                        {entry.notes}
                      </div>
                    </div>
                  ))}
                  <div ref={timelineEndRef}></div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                  📅 No timeline events yet. Update the deal stage to start tracking.
                </div>
              )}
            </div>
          )}

          {/* ========== ACTIONS TAB ========== */}
          {activeTab === 'actions' && displayTabs.includes('actions') && (
            <div>
              {/* Status Messages */}
              {(currentDealStage === 'REGISTRATION' && !deal.sellerConfirmed) && (
                <div style={styles.successAlert}>
                  🎉 **Registration Completed!** Please confirm with seller.
                </div>
              )}
              {(currentDealStage === 'COMPLETED' || (currentDealStage === 'PAYMENT' && deal.paymentCompleted)) && (
                <div style={styles.warningAlert}>
                  🎉 **Deal Completed Successfully!** Congratulations!
                </div>
              )}

              {/* Update Stage Form */}
              {userRole === 'AGENT' && currentDealStage !== 'COMPLETED' && (
                <div style={styles.actionCard}>
                  <h3 style={styles.actionTitle}>📋 Update Deal Stage</h3>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Next Stage:</label>
                    <select
                      value={newStage}
                      onChange={e => setNewStage(e.target.value)}
                      style={styles.input}
                    >
                      {getStageOptions(currentDealStage).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Date of Visit/Update:</label>
                    <input
                      type="date"
                      value={visitDate}
                      onChange={e => setVisitDate(e.target.value)}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Matter/Notes:</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      style={{ ...styles.input, minHeight: '100px', resize: 'vertical' }}
                    />
                  </div>
                  <button
                    onClick={handleUpdateStage}
                    disabled={updating}
                    style={styles.primaryBtn}
                  >
                    {updating ? '⏳ Updating...' : '✓ Update Stage'}
                  </button>
                </div>
              )}

              {/* Seller Confirm Button */}
              {(currentDealStage === 'REGISTRATION' && !deal.sellerConfirmed && userRole === 'SELLER') && (
                <button
                  onClick={handleSellerConfirm}
                  style={styles.successBtn}
                >
                  ✓ Confirm Registration
                </button>
              )}

              {/* Complete Payment Button */}
              {(currentDealStage === 'PAYMENT' && !deal.paymentCompleted && userRole === 'AGENT') && (
                <button
                  onClick={handleCompletePayment}
                  style={styles.warningBtn}
                >
                  💰 Complete Payment
                </button>
              )}

              {/* Document Upload */}
              <div style={styles.actionCard}>
                <button
                  onClick={() => setShowDocUpload(true)}
                  style={styles.secondaryBtn}
                >
                  📄 Upload/View Documents
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            onClick={handleViewProperty}
            style={styles.viewPropertyBtn}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            🏠 View Property
          </button>
          <button
            onClick={onClose}
            style={{...styles.viewPropertyBtn, backgroundColor: '#dc2626'}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
          >
            Close
          </button>
        </div>
      </div>
      {showDocUpload && <DocumentUploadModal deal={deal} onClose={() => setShowDocUpload(false)} />}
    </div>
  );
};

export default DealDetailModal;