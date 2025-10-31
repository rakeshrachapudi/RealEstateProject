import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DocumentUploadModal from "./DocumentUploadModal";
import DealProgressBar from "./DealProgressBar";
import { BACKEND_BASE_URL } from "./config/config";
import { useAuth } from "./AuthContext"; // ✅ 1. Import useAuth (Ensure this path is correct)

const DealDetailModal = ({
  deal: initialDeal,
  onClose,
  onUpdate,
  userRole, // Keep prop if used elsewhere, but rely on currentUser for actions
  showOnlyOverview = false,
}) => {
  const [deal, setDeal] = useState(initialDeal || {});
  const [activeTab, setActiveTab] = useState("overview");
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [docType, setDocType] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState("");
  const [visitDate, setVisitDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [newStage, setNewStage] = useState(
    () => initialDeal?.currentStage || initialDeal?.stage || "INQUIRY"
  );

  // ✅ Keep Error state
  const [error, setError] = useState(null);

  const timelineEndRef = useRef(null);
  const navigate = useNavigate();

  // ✅ 2. Get currentUser from AuthContext
  const { user: currentUser } = useAuth(); // Make sure useAuth() provides { user: { username: '...' } }

  const dealId = deal.id || deal.dealId;
  const currentDealStage = deal.currentStage || deal.stage || "INQUIRY";

  // Role-based tab visibility (use currentUser if available)
  const effectiveRole = currentUser?.role || userRole;
  const isAgentOrAdmin = effectiveRole === "AGENT" || effectiveRole === "ADMIN";
  const displayTabs = isAgentOrAdmin
    ? ["overview", "timeline", "actions"]
    : ["overview"];

  // --- Keep your existing useEffect hooks ---
  useEffect(() => {
    // Fetch full deal data... (Your existing logic)
     if (initialDeal && initialDeal.dealId) {
      const fetchFullDeal = async () => {
         try {
           // Use effectiveRole for fetching if needed
           const response = await fetch(
             `${BACKEND_BASE_URL}/api/deals/my-deals?userRole=${effectiveRole}&userId=${
               initialDeal.agentId || initialDeal.buyerId || initialDeal.sellerId
             }`,
             {
               headers: {
                 // Still need Authorization here for fetching deals unless removed globally
                 Authorization: `Bearer ${localStorage.getItem("authToken")}`,
               },
             }
           );
           const data = await response.json();
           if (response.ok && data.data) {
             const foundDeal = data.data.find(
               (d) => d.dealId === initialDeal.dealId
             );
             if (foundDeal) setDeal(foundDeal);
             else setDeal(initialDeal || {});
           } else {
             setDeal(initialDeal || {});
           }
         } catch (err) {
           console.warn("Error fetching full deal:", err);
           setDeal(initialDeal || {});
         }
       };
      fetchFullDeal();
    } else {
      setDeal(initialDeal || {});
    }

    setNewStage(initialDeal?.currentStage || initialDeal?.stage || "INQUIRY");
    setError(null); // Keep clearing error
    setNotes("");
    setVisitDate(new Date().toISOString().substring(0, 10));
  }, [initialDeal, effectiveRole]); // Depend on effectiveRole if fetch uses it

  useEffect(() => {
    if (activeTab === "timeline" && timelineEndRef.current) {
      timelineEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab]);


  // --- Keep your existing helper functions (handleStageChange, etc.) ---
   const handleStageChange = (e) => {
     setNewStage(e.target.value);
     setError(null);
   };

   const handleDocumentUploadSuccess = (updatedDeal) => {
     setDeal(updatedDeal);
     onUpdate(updatedDeal);
     setShowDocUpload(false);
   };

   const updateLocalAndParent = (updatedDeal) => {
     setDeal(updatedDeal);
     if (typeof onUpdate === "function") onUpdate(updatedDeal);
   };

   const refreshDealData = async () => {
     try {
       const response = await fetch(
         `${BACKEND_BASE_URL}/api/deals/my-deals?userRole=${effectiveRole}&userId=${
           deal.agentId || deal.buyerId || deal.sellerId
         }`,
         { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } } // Still needed?
       );
       const data = await response.json();
       if (response.ok && data.data) {
         const foundDeal = data.data.find((d) => d.dealId === dealId);
         if (foundDeal) {
           setDeal(foundDeal);
           updateLocalAndParent(foundDeal);
         }
       }
     } catch (err) { console.error("Error refreshing deal data:", err); }
   };

 const handleUpdateStage = async () => {
   if (!newStage) {
     setError("Please select a new stage to update.");
     return;
   }

   if (newStage === currentDealStage) {
     setError("Please select a *new* stage to update.");
     return;
   }

   setUpdating(true);
   setError(null);

   try {
     const payload = {
       stage: newStage,
       notes: notes || "",
     };

     console.log("🟢 Sending update payload:", payload);

     const response = await fetch(`${BACKEND_BASE_URL}/api/deals/${dealId}/stage`, {
       method: "PUT",
       headers: {
         "Content-Type": "application/json",
       },
       body: JSON.stringify(payload),
     });

     console.log("Update stage response status:", response.status);
     const text = await response.text();
     console.log("Raw response text:", text);

     let data;
     try {
       data = JSON.parse(text);
     } catch {
       setError(text || `Unexpected server response (${response.status})`);
       setUpdating(false);
       return;
     }

     if (response.ok && data.data) {
       console.log("✅ Stage update successful:", data.data);
       updateLocalAndParent(data.data);
       setNotes("");
       setActiveTab("timeline");
       scrollToTimelineEnd();
     } else {
       const msg = data.message || `Failed to update stage (Status: ${response.status})`;
       setError(msg);
       console.error("❌ Stage update failed:", msg);
     }
   } catch (err) {
     console.error("Error during fetch operation:", err);
     setError("Network error. Please try again later.");
   } finally {
     setUpdating(false);
   }
 };


  // --- Keep your other handlers (handleSellerConfirm, etc.) ---
  // Note: These might still need Authorization headers if their backend counterparts require it
   const handleSellerConfirm = async () => {
     try {
       const response = await fetch(
         `${BACKEND_BASE_URL}/api/deals/${dealId}/seller-confirm`,
         {
           method: "POST",
           headers: {
             "Content-Type": "application/json",
             Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Keep if needed
           },
           body: JSON.stringify({ notes: "Seller confirmed - Documents received" }),
         }
       );
       const data = await response.json();
       if (response.ok && data.data) { updateLocalAndParent(data.data); setActiveTab("timeline"); scrollToTimelineEnd(); }
       else { alert("❌ Error: " + (data.message || "Failed")); }
     } catch (err) { alert("Error: " + err.message); }
   };
   const handleCompletePayment = async () => {
     try {
        const response = await fetch(
          `${BACKEND_BASE_URL}/api/deals/${dealId}/complete-payment`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }, // Keep if needed
          }
        );
       const data = await response.json();
       if (response.ok && data.data) { updateLocalAndParent(data.data); setActiveTab("timeline"); scrollToTimelineEnd(); }
       else { alert("❌ Error: " + (data.message || "Failed")); }
     } catch (err) { alert("Error: " + err.message); }
   };
   const openDocumentUpload = (type = null) => {
     setDocType(type);
     setShowDocUpload(true);
   };

  // --- Keep your helper and formatting functions ---
   const getStageOptions = (current) => {
       const stages = ["INQUIRY", "SHORTLIST", "NEGOTIATION", "AGREEMENT", "REGISTRATION", "PAYMENT", "COMPLETED"];
       const currentIndex = Math.max(0, stages.indexOf(current));
       return stages.slice(currentIndex);
   };
   const getStageColor = (stage) => {
       const colors = { INQUIRY: "#3b82f6", SHORTLIST: "#8b5cf6", NEGOTIATION: "#f59e0b", AGREEMENT: "#10b981", REGISTRATION: "#06b6d4", PAYMENT: "#ec4899", COMPLETED: "#22c55e" };
       return colors[stage] || "#6b7280";
   };
   const formatPrice = (price) => {
       if (!price) return "TBD";
       if (typeof price === "number") return price.toLocaleString("en-IN");
       return String(price);
   };
   const handleViewProperty = () => {
       navigate(`/property/${deal.propertyId || deal.property?.id}`);
       onClose();
   };
   const getTimelineData = (dealData = {}) => {
       const stagesMap = [
         { key: "inquiryDate", stage: "INQUIRY", label: "🔍 INQUIRY" },
         { key: "shortlistDate", stage: "SHORTLIST", label: "⭐ SHORTLIST" },
         { key: "negotiationDate", stage: "NEGOTIATION", label: "💬 NEGOTIATION" },
         { key: "agreementDate", stage: "AGREEMENT", label: "✅ AGREEMENT" },
         { key: "registrationDate", stage: "REGISTRATION", label: "📋 REGISTRATION" },
         { key: "paymentDate", stage: "PAYMENT", label: "💰 PAYMENT" },
         { key: "completedDate", stage: "COMPLETED", label: "🎉 COMPLETED" },
       ];
       let timeline = stagesMap
         .map(s => dealData[s.key] ? { ...s, date: dealData[s.key], formattedDate: new Date(dealData[s.key]).toLocaleString() } : null)
         .filter(Boolean);
       timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
       // console.log("Timeline data:", timeline); // Keep for debugging if needed
       return timeline;
   };
   const timelineData = getTimelineData(deal);
   const scrollToTimelineEnd = (smooth = true) => {
      setTimeout(() => { if (timelineEndRef.current) { timelineEndRef.current.scrollIntoView({ behavior: smooth ? "smooth" : "auto" }); } }, 150);
   };
   const formatDateTime = (isoString) => {
      if (!isoString) return "Not set";
      return new Date(isoString).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
   };
   const getStageDate = (stage) => {
      const stageKey = `${stage.toLowerCase()}Date`;
      return deal[stageKey] ? formatDateTime(deal[stageKey]) : null;
   };


  // --- Keep your RENDER functions ---
  const renderOverview = () => (
    <div style={styles.tabContent}>
      <h3 style={styles.tabTitle}>Deal Overview</h3>
      <DealProgressBar deal={deal} isEditable={isAgentOrAdmin} onStageChange={onUpdate} />

      {/* Document Status Section */}
      {isAgentOrAdmin && (
        <div style={styles.documentSection}>
          <h3 style={styles.sectionTitle}>📄 Required Documents</h3>
          <div style={styles.documentGrid}>
            {/* Agreement */}
            <div style={styles.documentCard}>
              <div style={styles.documentHeader}>
                <span style={styles.documentLabel}>📝 Agreement Document</span>
                <span style={{ ...styles.documentBadge, backgroundColor: deal.agreementUploaded ? "#10b981" : "#f59e0b" }}>
                  {deal.agreementUploaded ? "✅ Uploaded" : "⏳ Pending"}
                </span>
              </div>
              <div style={styles.documentInfo}>Required to move to Registration stage</div>
              {!deal.agreementUploaded && ( <button onClick={() => openDocumentUpload("AGREEMENT")} style={styles.uploadBtn}> 📤 Upload Agreement </button> )}
            </div>
            {/* Registration */}
            <div style={styles.documentCard}>
              <div style={styles.documentHeader}>
                <span style={styles.documentLabel}>📋 Registration Document</span>
                <span style={{ ...styles.documentBadge, backgroundColor: deal.registrationUploaded ? "#10b981" : "#f59e0b" }}>
                  {deal.registrationUploaded ? "✅ Uploaded" : "⏳ Pending"}
                </span>
              </div>
              <div style={styles.documentInfo}>Required to move to Payment stage</div>
              {!deal.registrationUploaded && ( <button onClick={() => openDocumentUpload("REGISTRATION")} style={styles.uploadBtn} disabled={currentDealStage !== 'REGISTRATION'} > 📤 Upload Registration </button> )}
            </div>
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div style={styles.gridContainer}>
        {/* Property */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🏠 Property</h3>
          <div style={styles.infoBox}>
            <div style={styles.infoRow}><span style={styles.label}>Title</span><span style={styles.value}>{deal.propertyTitle || deal.property?.title || "Property"}</span></div>
            {deal.propertyPrice && <div style={styles.infoRow}><span style={styles.label}>Listing Price</span><span style={styles.value}>₹{formatPrice(deal.propertyPrice)}</span></div>}
            {deal.agreedPrice && <div style={styles.infoRow}><span style={styles.label}>Agreed Price</span><span style={styles.value}>₹{formatPrice(deal.agreedPrice)}</span></div>}
            {deal.propertyCity && <div style={styles.infoRow}><span style={styles.label}>Location</span><span style={styles.value}>{deal.propertyCity}</span></div>}
          </div>
        </div>
        {/* Buyer */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>👤 Buyer</h3>
          <div style={styles.infoBox}>
            <div style={styles.infoRow}><span style={styles.label}>Name</span><span style={styles.value}>{deal.buyerName || "N/A"}</span></div>
            {deal.buyerEmail && <div style={styles.infoRow}><span style={styles.label}>Email</span><span style={styles.value}>{deal.buyerEmail}</span></div>}
            {deal.buyerMobile && isAgentOrAdmin && <div style={styles.infoRow}><span style={styles.label}>Phone</span><span style={styles.value}>{deal.buyerMobile}</span></div>}
          </div>
        </div>
        {/* Seller */}
        <div style={styles.section}>
           <h3 style={styles.sectionTitle}>🏢 Seller</h3>
           <div style={styles.infoBox}>
             <div style={styles.infoRow}><span style={styles.label}>Name</span><span style={styles.value}>{deal.sellerName || "N/A"}</span></div>
             {deal.sellerEmail && <div style={styles.infoRow}><span style={styles.label}>Email</span><span style={styles.value}>{deal.sellerEmail}</span></div>}
             {deal.sellerMobile && isAgentOrAdmin && <div style={styles.infoRow}><span style={styles.label}>Phone</span><span style={styles.value}>{deal.sellerMobile}</span></div>}
           </div>
         </div>
        {/* Agent */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📊 Agent</h3>
          <div style={styles.infoBox}>
            <div style={styles.infoRow}><span style={styles.label}>Name</span><span style={styles.value}>{deal.agentName || "Not Assigned"}</span></div>
            {deal.agentEmail && <div style={styles.infoRow}><span style={styles.label}>Email</span><span style={styles.value}>{deal.agentEmail}</span></div>}
            {deal.agentMobile && isAgentOrAdmin && <div style={styles.infoRow}><span style={styles.label}>Phone</span><span style={styles.value}>{deal.agentMobile}</span></div>}
          </div>
        </div>
        {/* Notes */}
        {deal.notes && <div style={{ ...styles.section, gridColumn: "1 / -1" }}><h3 style={styles.sectionTitle}>📝 Notes</h3><div style={styles.notesBox}>{deal.notes}</div></div>}
        {/* Dates */}
        <div style={{ ...styles.section, gridColumn: "1 / -1" }}>
          <h3 style={styles.sectionTitle}>📅 Important Dates</h3>
          <div style={styles.datesGrid}>
            <div style={styles.dateItem}><span style={styles.label}>Created</span><span style={styles.value}>{deal.createdAt ? new Date(deal.createdAt).toLocaleDateString() : "N/A"}</span></div>
            <div style={styles.dateItem}><span style={styles.label}>Last Updated</span><span style={styles.value}>{deal.updatedAt ? new Date(deal.updatedAt).toLocaleDateString() : "N/A"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div style={styles.tabContent}>
      <h3 style={styles.tabTitle}>Deal Timeline</h3>
      {timelineData.length > 0 ? (
        <div style={styles.timelineContainer}>
          {timelineData.map((entry) => (
            <div key={entry.stage} style={styles.timelineEntry}>
              <div style={styles.timelinePin}></div>
              <div style={styles.timelineStage}>{entry.label}</div>
              <div style={styles.timelineDate}>{entry.formattedDate}</div>
            </div>
          ))}
          <div ref={timelineEndRef}></div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#64748b" }}>
          📅 No timeline events yet. Update the deal stage to start tracking.
        </div>
      )}
    </div>
  );

  // ✅ Keep renderUpdateStatus with ERROR BOX
  const renderUpdateStatus = () => (
    <div style={styles.actionCard}> {/* Use actionCard style for consistency */}
      <h3 style={styles.actionTitle}>📋 Update Deal Stage</h3> {/* Use actionTitle */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Next Stage:</label>
        <select
          value={newStage}
          onChange={(e) => { setNewStage(e.target.value); setError(null); }}
          style={styles.input} // Use your input style
        >
          {getStageOptions(currentDealStage).map((s) => (
            <option key={s} value={s} disabled={s === currentDealStage}> {s} </option>
          ))}
        </select>
      </div>
      {/* Removed Date Input */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Matter/Notes (Optional):</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ ...styles.input, minHeight: "100px", resize: "vertical" }} // Use your input style
          placeholder="Add notes if needed..."
        />
      </div>

      {/* ✅ THIS IS THE ERROR BOX */}
      {error && (
        <div style={styles.errorBox}>
          {error}
        </div>
      )}

      <button
        onClick={handleUpdateStage} // Calls the modified function
        disabled={updating || newStage === currentDealStage}
        style={updating || newStage === currentDealStage ? styles.disabledBtn : styles.primaryBtn}
      >
        {updating ? "⏳ Updating..." : "✓ Update Stage"}
      </button>
    </div>
  );


  if (!deal) return null; // Your existing check

  // --- Keep your main return structure ---
  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
         <button style={styles.closeBtn} onClick={onClose}>×</button>

        {/* Header */}
         <div style={styles.header}>
           <h2 style={styles.title}>{deal.propertyTitle || deal.property?.title || "Deal Details"}</h2>
           <div style={{ ...styles.stageBadge, backgroundColor: getStageColor(currentDealStage) }}>{currentDealStage}</div>
         </div>

        {/* Tab Navigation */}
         <div style={styles.tabContainer}>
           {displayTabs.includes("overview") && <button onClick={() => setActiveTab("overview")} style={{ ...styles.tab, ...(activeTab === "overview" ? styles.activeTab : {}) }}>📋 Overview</button>}
           {displayTabs.includes("timeline") && <button onClick={() => { setActiveTab("timeline"); scrollToTimelineEnd(); }} style={{ ...styles.tab, ...(activeTab === "timeline" ? styles.activeTab : {}) }}>📅 Timeline</button>}
           {displayTabs.includes("actions") && <button onClick={() => setActiveTab("actions")} style={{ ...styles.tab, ...(activeTab === "actions" ? styles.activeTab : {}) }}>⚙️ Actions</button>}
         </div>

        {/* Tab Content */}
        <div style={styles.content}>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "timeline" && displayTabs.includes("timeline") && renderTimeline()}
          {/* Use renderUpdateStatus directly if it's the main content for the actions tab for agents */}
          {activeTab === "actions" && isAgentOrAdmin && displayTabs.includes("actions") && (
              <div> {/* Wrap actions content */}
                  {/* Status Messages */}
                  {currentDealStage === "REGISTRATION" && !deal.sellerConfirmed && ( <div style={styles.successAlert}> 🎉 Registration Completed! Please confirm with seller. </div> )}
                  {(currentDealStage === "COMPLETED" || (currentDealStage === "PAYMENT" && deal.paymentCompleted)) && ( <div style={styles.warningAlert}> 🎉 Deal Completed Successfully! Congratulations! </div> )}

                  {/* Render the Update Stage form if applicable */}
                  {/* Check effectiveRole here */}
                  {effectiveRole === "AGENT" && currentDealStage !== "COMPLETED" && renderUpdateStatus()}

                  {/* Seller Confirm Button */}
                  {currentDealStage === "REGISTRATION" && !deal.sellerConfirmed && effectiveRole === "SELLER" && ( <button onClick={handleSellerConfirm} style={styles.successBtn}>✓ Confirm Registration</button> )}
                  {/* Complete Payment Button */}
                  {currentDealStage === "PAYMENT" && !deal.paymentCompleted && effectiveRole === "AGENT" && ( <button onClick={handleCompletePayment} style={styles.warningBtn}>💰 Complete Payment</button> )}
                  {/* Document Upload Section (General) */}
                   <div style={styles.actionCard}> <h3 style={styles.actionTitle}>📄 Document Management</h3> <button onClick={() => openDocumentUpload(null)} style={styles.secondaryBtn} > 📄 Upload General Document </button> </div>
              </div>
          )}
        </div>

        {/* Footer */}
         <div style={styles.footer}>
           <button onClick={handleViewProperty} style={styles.viewPropertyBtn} onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'} onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}>🏠 View Property</button>
           <button onClick={onClose} style={styles.closeBottomBtn} onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'} onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}>Close</button>
         </div>
      </div>

      {/* Document Upload Modal */}
      {showDocUpload && (
        <DocumentUploadModal
          dealId={dealId}
          propertyId={deal.propertyId || deal.property?.id}
          docType={docType}
          onClose={() => { setShowDocUpload(false); setDocType(null); }}
          onSuccess={async (url, uploadedDocType) => { console.log("✅ Document uploaded:", url); await refreshDealData(); }}
        />
      )}
    </div>
  );
};


// ====================
// STYLES
// ====================

// ✅ Keep ALL your styles, including the 'errorBox' style
const styles = {
  backdrop: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 10001, overflowY: "auto", padding: "20px",
  },
  modal: {
    backgroundColor: "white", borderRadius: "16px", width: "100%", maxWidth: "1000px", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", padding: "32px",
  },
  closeBtn: {
    position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "32px", cursor: "pointer", color: "#6b7280", padding: 0, width: "40px", height: "40px",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #e5e7eb",
  },
  title: { fontSize: "28px", fontWeight: "800", color: "#1e293b", margin: 0 },
  stageBadge: {
    padding: "8px 16px", borderRadius: "20px", color: "white", fontWeight: "600", fontSize: "14px",
  },
  tabContainer: {
    display: "flex", gap: "12px", marginBottom: "24px", borderBottom: "2px solid #e5e7eb", paddingBottom: "12px",
  },
  tab: {
    padding: "10px 20px", background: "#f8fafc", color: "#64748b", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "all 0.2s",
  },
  activeTab: { backgroundColor: "#3b82f6", color: "white" },
  content: { marginBottom: "24px" },
  documentSection: {
    padding: "20px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px",
  },
  documentGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px",
  },
  documentCard: {
    padding: "16px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0",
  },
  documentHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px",
  },
  documentLabel: {
    fontSize: "14px", fontWeight: "600", color: "#1e293b",
  },
  documentBadge: {
    padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "600", color: "white",
  },
  documentInfo: {
    fontSize: "12px", color: "#64748b", marginBottom: "12px",
  },
  uploadBtn: {
    width: "100%", padding: "8px 16px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px", transition: "background 0.2s",
  },
  gridContainer: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px",
  },
  section: {
    padding: "20px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0",
  },
  sectionTitle: {
    fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 16px 0",
  },
  infoBox: { display: "flex", flexDirection: "column", gap: "12px" },
  infoRow: { display: "flex", flexDirection: "column", gap: "4px" },
  label: { fontSize: "12px", fontWeight: "600", color: "#64748b" }, // Shared label style
  value: { fontSize: "14px", fontWeight: "600", color: "#1e293b" },
  notesBox: {
    padding: "12px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", color: "#475569", lineHeight: "1.6",
  },
  datesGrid: {
    display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px",
  },
  dateItem: {
    padding: "12px", backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0",
  },
  timelineContainer: {
    borderLeft: "3px solid #e2e8f0", paddingLeft: "20px", marginTop: "16px", marginBottom: "16px", maxHeight: "400px", overflowY: "auto",
  },
  timelineEntry: {
    marginBottom: "15px", position: "relative", paddingBottom: "5px", padding: "8px", borderRadius: "8px",
  },
  timelinePin: {
    position: "absolute", left: "-28px", top: "12px", height: "12px", width: "12px", backgroundColor: "#3b82f6", borderRadius: "50%", border: "2px solid white",
  },
  timelineStage: { fontWeight: "700", color: "#1f2937", fontSize: "15px" },
  timelineDate: { fontSize: "12px", color: "#64748b", marginTop: "4px" },
  actionCard: {
    padding: "20px", backgroundColor: "#f1f5f9", borderRadius: "8px", marginBottom: "16px",
  },
  actionTitle: {
    fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 16px 0",
  },
  formGroup: { marginBottom: "12px" },
  input: { // Style for select, input, textarea in actions tab
    width: "100%", padding: "8px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "14px", marginTop: "4px", boxSizing: "border-box",
  },
  errorBox: { // Keep the error box style
    color: '#721c24', backgroundColor: '#f8d7da', border: '1px solid #f5c6cb', padding: '12px', marginBottom: '16px', borderRadius: '6px', fontSize: '14px',
  },
  successAlert: {
    padding: "20px", backgroundColor: "#ecfdf5", borderRadius: "8px", border: "1px solid #bbf7d0", textAlign: "center", fontWeight: "600", color: "#059669", marginBottom: "16px",
  },
  warningAlert: {
    padding: "20px", backgroundColor: "#fef3c7", borderRadius: "8px", border: "1px solid #fde68a", textAlign: "center", fontWeight: "600", color: "#b45309", marginBottom: "16px",
  },
  // --- Keep ALL your button styles ---
  primaryBtn: { padding: "10px 18px", backgroundColor: "#3b82f6", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", width: "100%", boxSizing: "border-box" },
  disabledBtn: { padding: "10px 18px", backgroundColor: "#e2e8f0", color: "#94a3b8", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "not-allowed", width: "100%", boxSizing: "border-box" },
  successBtn: { padding: "10px 18px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", marginBottom: "16px", width: "100%", boxSizing: "border-box" },
  warningBtn: { padding: "10px 18px", backgroundColor: "#f59e0b", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", marginBottom: "16px", width: "100%", boxSizing: "border-box" },
  secondaryBtn: { width: "100%", padding: "10px 18px", backgroundColor: "#8b5cf6", color: "white", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer" },
  footer: { display: "flex", gap: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "20px" },
  viewPropertyBtn: { flex: 1, padding: "12px 20px", backgroundColor: "#10b981", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px", transition: "background 0.2s" },
  closeBottomBtn: { flex: 1, padding: "12px 20px", backgroundColor: "#6b7280", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", fontSize: "14px", transition: "background 0.2s" },
};

export default DealDetailModal;