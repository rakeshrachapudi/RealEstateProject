import React, { useEffect, useState } from 'react';
import DealDetailsModal from './DealDetailsModal';

const AdminDealPanel = () => {
    const [pendingPayments, setPendingPayments] = useState([]);
    const [pendingConfirmations, setPendingConfirmations] = useState([]);
    const [pendingVerifications, setPendingVerifications] = useState([]);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingItems();
    }, []);

    const fetchPendingItems = async () => {
        try {
            const [payments, confirmations, verifications] = await Promise.all([
                fetch('http://localhost:8080/api/deals/pending-payments').then(r => r.json()),
                fetch('http://localhost:8080/api/deals/pending-seller-confirmations').then(r => r.json()),
                fetch('http://localhost:8080/api/deals/pending-admin-verifications').then(r => r.json()),
            ]);

            setPendingPayments(payments.data || []);
            setPendingConfirmations(confirmations.data || []);
            setPendingVerifications(verifications.data || []);
        } catch (error) {
            console.error('Error fetching pending items:', error);
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
    };

    const titleStyle = {
        fontSize: '28px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '24px',
    };

    const sectionStyle = {
        marginBottom: '32px',
    };

    const sectionTitleStyle = {
        fontSize: '20px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '2px solid #e2e8f0',
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
    };

    const cardStyle = {
        padding: '16px',
        backgroundColor: '#fef3c7',
        borderRadius: '12px',
        border: '1px solid #fcd34d',
        cursor: 'pointer',
        transition: 'all 0.2s',
    };

    const renderDealCards = (deals) => {
        if (deals.length === 0) {
            return <p style={{ color: '#64748b' }}>No pending items</p>;
        }

        return (
            <div style={gridStyle}>
                {deals.map((deal) => (
                    <div
                        key={deal.dealId}
                        style={cardStyle}
                        onClick={() => setSelectedDeal(deal)}
                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                        <h4 style={{ margin: '0 0 8px 0', color: '#1e293b' }}>
                            {deal.property.title}
                        </h4>
                        <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#64748b' }}>
                            Buyer: {deal.buyer.firstName}
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#64748b' }}>
                            Amount: ₹{deal.agreedPrice?.toLocaleString('en-IN')}
                        </p>
                        <button
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#f59e0b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '12px',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDeal(deal);
                            }}
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return <div style={containerStyle}><h2>Loading pending items...</h2></div>;
    }

    return (
        <div style={containerStyle}>
            <h1 style={titleStyle}>⚙️ Admin Dashboard - Pending Items</h1>

            {/* Pending Payments */}
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>💰 Pending Payments ({pendingPayments.length})</h2>
                {renderDealCards(pendingPayments)}
            </div>

            {/* Pending Seller Confirmations */}
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>✋ Pending Seller Confirmations ({pendingConfirmations.length})</h2>
                {renderDealCards(pendingConfirmations)}
            </div>

            {/* Pending Admin Verifications */}
            <div style={sectionStyle}>
                <h2 style={sectionTitleStyle}>📋 Pending Admin Verifications ({pendingVerifications.length})</h2>
                {renderDealCards(pendingVerifications)}
            </div>

            {selectedDeal && (
                <DealDetailsModal
                    deal={selectedDeal}
                    onClose={() => setSelectedDeal(null)}
                    onUpdate={() => {
                        setSelectedDeal(null);
                        fetchPendingItems();
                    }}
                />
            )}
        </div>
    );
};

export default AdminDealPanel;