import React, { useState } from 'react';
import DealProgress from './DealProgress';
import DocumentUploadModal from './DocumentUploadModal';

const DealDetailModal = ({ deal, onClose, onUpdate, userRole }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [showDocUpload, setShowDocUpload] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState('');
    const [newStage, setNewStage] = useState(deal.currentStage || deal.stage);

    // ✅ FIX: Standardize deal ID - handle both id and dealId
    const dealId = deal.id || deal.dealId;
    const currentStage = deal.currentStage || deal.stage;

    const handleUpdateStage = async () => {
        setUpdating(true);
        try {
            const response = await fetch(`http://localhost:8080/api/deals/${dealId}/stage`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ stage: newStage, notes }),
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ Deal updated');
                onUpdate();
                onClose();
            } else {
                console.error('Update failed:', data.message);
                alert('❌ Error: ' + (data.message || 'Failed to update deal'));
            }
        } catch (err) {
            console.error('Error updating deal:', err);
            alert('Error updating deal: ' + err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleSellerConfirm = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/deals/${dealId}/seller-confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({ notes: 'Seller confirmed - Documents received' }),
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ Confirmed by seller');
                onUpdate();
                onClose();
            }
        } catch (err) {
            alert('Error confirming deal: ' + err.message);
        }
    };

    const handleCompletePayment = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/deals/${dealId}/complete-payment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                },
            });

            const data = await response.json();
            if (data.success) {
                alert('✅ Payment completed - Deal closed');
                onUpdate();
                onClose();
            }
        } catch (err) {
            alert('Error completing payment: ' + err.message);
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
        overflowY: 'auto',
    };

    const contentStyle = {
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        marginTop: '20px',
        marginBottom: '20px',
    };

    const tabsStyle = {
        display: 'flex',
        borderBottom: '2px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        padding: '0 20px',
    };

    const tabStyle = (isActive) => ({
        padding: '12px 20px',
        cursor: 'pointer',
        fontWeight: '600',
        borderBottom: isActive ? '3px solid #3b82f6' : 'none',
        color: isActive ? '#3b82f6' : '#64748b',
    });

    const tabContentStyle = {
        padding: '20px',
    };

    return (
        <div style={modalStyle} onClick={onClose}>
            <div style={contentStyle} onClick={e => e.stopPropagation()}>
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h2 style={{ margin: 0 }}>{deal.property?.title || 'Deal'}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#6b7280',
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={tabsStyle}>
                    <div style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>
                        📊 Overview
                    </div>
                    <div style={tabStyle(activeTab === 'timeline')} onClick={() => setActiveTab('timeline')}>
                        📅 Timeline
                    </div>
                    <div style={tabStyle(activeTab === 'actions')} onClick={() => setActiveTab('actions')}>
                        ⚙️ Actions
                    </div>
                </div>

                <div style={tabContentStyle}>
                    {activeTab === 'overview' && (
                        <div>
                            <DealProgress currentStage={currentStage} dealData={deal} />

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '16px',
                                marginBottom: '20px',
                            }}>
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                }}>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Buyer</div>
                                    <div style={{ fontWeight: '600' }}>
                                        {deal.buyer?.firstName} {deal.buyer?.lastName}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                }}>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Seller</div>
                                    <div style={{ fontWeight: '600' }}>
                                        {deal.seller?.firstName} {deal.seller?.lastName} or {deal.property?.user?.firstName} {deal.property?.user?.lastName}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                }}>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Price</div>
                                    <div style={{ fontWeight: '600' }}>
                                        ₹{deal.agreedPrice?.toLocaleString('en-IN') || 'TBD'}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0',
                                }}>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Agent</div>
                                    <div style={{ fontWeight: '600' }}>
                                        {deal.agent?.firstName || 'Unassigned'}
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                            }}>
                                <strong>Status Checklist:</strong>
                                <div style={{ fontSize: '12px', marginTop: '8px', lineHeight: '1.8' }}>
                                    <div>Buyer Document: {deal.buyerDocUploaded ? '✅' : '❌'}</div>
                                    <div>Seller Confirmed: {deal.sellerConfirmed ? '✅' : '❌'}</div>
                                    <div>Admin Verified: {deal.adminVerified ? '✅' : '❌'}</div>
                                    <div>Payment Initiated: {deal.paymentInitiated ? '✅' : '❌'}</div>
                                    <div>Payment Completed: {deal.paymentCompleted ? '✅' : '❌'}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'timeline' && (
                        <div>
                            <div style={{ fontSize: '13px', lineHeight: '2' }}>
                                {deal.inquiryDate && <div>🔍 Inquiry: {new Date(deal.inquiryDate).toLocaleDateString()}</div>}
                                {deal.shortlistDate && <div>⭐ Shortlist: {new Date(deal.shortlistDate).toLocaleDateString()}</div>}
                                {deal.negotiationDate && <div>💬 Negotiation: {new Date(deal.negotiationDate).toLocaleDateString()}</div>}
                                {deal.agreementDate && <div>✅ Agreement: {new Date(deal.agreementDate).toLocaleDateString()}</div>}
                                {deal.registrationDate && <div>📋 Registration: {new Date(deal.registrationDate).toLocaleDateString()}</div>}
                                {deal.paymentDate && <div>💰 Payment: {new Date(deal.paymentDate).toLocaleDateString()}</div>}
                                {deal.completedDate && <div>🎉 Completed: {new Date(deal.completedDate).toLocaleDateString()}</div>}
                            </div>
                        </div>
                    )}

                    {activeTab === 'actions' && (
                        <div>
                            {currentStage === 'INQUIRY' && (
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: '#f0f9ff',
                                    borderRadius: '8px',
                                    border: '1px solid #bfdbfe',
                                    marginBottom: '12px',
                                }}>
                                    <p style={{ margin: '0 0 12px 0' }}>📄 Buyer needs to upload document</p>
                                    <button
                                        onClick={() => setShowDocUpload(true)}
                                        style={{
                                            padding: '8px 16px',
                                            backgroundColor: '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                        }}
                                    >
                                        📁 Upload Document
                                    </button>
                                </div>
                            )}

                            {(userRole === 'AGENT' || userRole === 'ADMIN') && currentStage !== 'COMPLETED' && (
                                <div style={{
                                    padding: '16px',
                                    backgroundColor: '#f0fdf4',
                                    borderRadius: '8px',
                                    border: '1px solid #bbf7d0',
                                    marginBottom: '12px',
                                }}>
                                    <label style={{ display: 'block', marginBottom: '8px' }}>
                                        <strong>Move to Stage:</strong>
                                    </label>
                                    <select
                                        value={newStage}
                                        onChange={(e) => setNewStage(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            marginBottom: '12px',
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0',
                                        }}
                                    >
                                        <option value="INQUIRY">INQUIRY</option>
                                        <option value="SHORTLIST">SHORTLIST</option>
                                        <option value="NEGOTIATION">NEGOTIATION</option>
                                        <option value="AGREEMENT">AGREEMENT</option>
                                        <option value="REGISTRATION">REGISTRATION</option>
                                        <option value="PAYMENT">PAYMENT</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                    </select>

                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Add notes about this stage change..."
                                        style={{
                                            width: '100%',
                                            padding: '8px',
                                            marginBottom: '12px',
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0',
                                            minHeight: '60px',
                                            boxSizing: 'border-box',
                                        }}
                                    />

                                    <button
                                        onClick={handleUpdateStage}
                                        disabled={updating}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            backgroundColor: updating ? '#ccc' : '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: updating ? 'not-allowed' : 'pointer',
                                            fontWeight: '600',
                                        }}
                                    >
                                        {updating ? '⏳ Updating...' : '✅ Update Stage'}
                                    </button>
                                </div>
                            )}

                            {userRole === 'SELLER' && currentStage === 'REGISTRATION' && !deal.sellerConfirmed && (
                                <button
                                    onClick={handleSellerConfirm}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                    }}
                                >
                                    ✅ Confirm as Seller
                                </button>
                            )}

                            {currentStage === 'PAYMENT' && deal.paymentInitiated && !deal.paymentCompleted && (
                                <button
                                    onClick={handleCompletePayment}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                    }}
                                >
                                    💰 Mark Payment Complete
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showDocUpload && (
                <DocumentUploadModal
                    dealId={dealId}
                    onClose={() => setShowDocUpload(false)}
                    onSuccess={() => {
                        setShowDocUpload(false);
                        onUpdate();
                    }}
                />
            )}
        </div>
    );
};

export default DealDetailModal;