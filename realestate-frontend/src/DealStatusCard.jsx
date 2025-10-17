import React, { useState } from 'react';

const DealStatusCard = ({ deal, onViewDetails }) => {
    const getStageColor = (stage) => {
        const colors = {
            'INQUIRY': '#fbbf24',
            'SHORTLIST': '#60a5fa',
            'NEGOTIATION': '#f97316',
            'AGREEMENT': '#10b981',
            'REGISTRATION': '#8b5cf6',
            'PAYMENT': '#ec4899',
            'COMPLETED': '#06b6d4',
        };
        return colors[stage] || '#6b7280';
    };

    const cardStyle = {
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        border: '1px solid #e2e8f0',
        padding: '16px',
        cursor: 'pointer',
        position: 'relative',
    };

    const badgeStyle = {
        display: 'inline-block',
        padding: '6px 12px',
        backgroundColor: getStageColor(deal.currentStage),
        color: 'white',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        marginBottom: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    };

    return (
        <div
            style={cardStyle}
            onClick={() => onViewDetails(deal)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            <div style={badgeStyle}>
                {deal.currentStage}
            </div>

            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b', fontWeight: '700' }}>
                {deal.property?.title || 'Property'}
            </h3>

            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                <p style={{ margin: '4px 0' }}>
                    👤 Buyer: {deal.buyer?.firstName} {deal.buyer?.lastName}
                </p>
                {deal.agent && (
                    <p style={{ margin: '4px 0' }}>
                        🏢 Agent: {deal.agent.firstName} {deal.agent.lastName}
                    </p>
                )}
            </div>

            <div style={{
                padding: '12px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                marginBottom: '12px',
                fontSize: '13px',
            }}>
                <strong style={{ color: '#1e40af' }}>₹{deal.agreedPrice?.toLocaleString('en-IN') || deal.initialPrice?.toLocaleString('en-IN') || 'TBD'}</strong>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '11px',
                color: '#94a3b8',
            }}>
                <div>
                    Buyer Doc: {deal.buyerDocUploaded ? '✅' : '❌'}
                </div>
                <div>
                    Seller: {deal.sellerConfirmed ? '✅' : '❌'}
                </div>
                <div>
                    Admin: {deal.adminVerified ? '✅' : '❌'}
                </div>
                <div>
                    Payment: {deal.paymentCompleted ? '✅' : '❌'}
                </div>
            </div>
        </div>
    );
};

export default DealStatusCard;