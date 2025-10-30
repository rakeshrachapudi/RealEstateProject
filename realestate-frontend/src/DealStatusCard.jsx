// src/components/DealStatusCard.jsx
import React, { useState } from 'react';

const DealStatusCard = ({ deal, onViewDetails }) => {
    // Defensive check: if deal is null/undefined, render error message
    if (!deal) {
        console.error('DealStatusCard: deal prop is null or undefined');
        return (
            <div style={{ padding: '20px', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}>
                ⚠️ Invalid deal data
            </div>
        );
    }

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

    // Helper function to safely format price
    const formatPrice = (price) => {
        if (price === null || price === undefined) return null;
        const numPrice = Number(price);
        if (isNaN(numPrice)) return null;
        return numPrice.toLocaleString('en-IN');
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

    const dealIdBadgeStyle = {
        position: 'absolute',
        top: '12px',
        right: '12px',
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '0.5px',
    };

    const badgeStyle = {
        display: 'inline-block',
        padding: '6px 12px',
        backgroundColor: getStageColor(deal.currentStage || deal.stage),
        color: 'white',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        marginBottom: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    };

    const sectionStyle = {
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f1f5f9',
    };

    const lastSectionStyle = {
        ...sectionStyle,
        borderBottom: 'none',
        marginBottom: '0',
        paddingBottom: '0',
    };

    const labelStyle = {
        fontSize: '11px',
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginBottom: '2px',
    };

    const valueStyle = {
        fontSize: '13px',
        fontWeight: '600',
        color: '#1e293b',
        margin: '0',
    };

    const priceStyle = {
        fontSize: '16px',
        fontWeight: '700',
        color: '#10b981',
        margin: '4px 0 0 0',
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginTop: '8px',
    };

    // Format the agreed price safely
    const formattedPrice = formatPrice(deal.agreedPrice);

    return (
        <div
            style={cardStyle}
            onClick={() => onViewDetails && onViewDetails(deal)}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
        >
            {/* Deal ID Badge */}
            <div style={dealIdBadgeStyle}>
                ID: {deal.dealId || deal.id || 'N/A'}
            </div>

            {/* Stage Badge */}
            <div style={badgeStyle}>
                {deal.currentStage || deal.stage || 'INQUIRY'}
            </div>

            {/* Property Title */}
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1e293b', fontWeight: '700' }}>
                {deal.property?.title || deal.propertyTitle || 'Property'}
            </h3>

            {/* Location */}
            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                📍 {deal.property?.areaName || deal.property?.city || deal.propertyCity || 'Location'}
            </div>

            {/* Agreed Price - Prominent - Only show if valid */}
            {formattedPrice && (
                <div style={sectionStyle}>
                    <div style={labelStyle}>Agreed Price</div>
                    <div style={priceStyle}>
                        ₹{formattedPrice}
                    </div>
                </div>
            )}

            {/* Buyer Details */}
            <div style={sectionStyle}>
                <div style={labelStyle}>👤 Buyer</div>
                <div style={valueStyle}>
                    {deal.buyer?.firstName || deal.buyerName || 'N/A'} {deal.buyer?.lastName || ''}
                </div>
                {(deal.buyer?.mobileNumber || deal.buyerMobile) && (
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {deal.buyer?.mobileNumber || deal.buyerMobile}
                    </div>
                )}
            </div>

            {/* Seller Details */}
            {(deal.property?.user || deal.sellerName) && (
                <div style={sectionStyle}>
                    <div style={labelStyle}>🏠 Seller</div>
                    <div style={valueStyle}>
                        {deal.property?.user?.firstName || deal.sellerName || 'N/A'} {deal.property?.user?.lastName || ''}
                    </div>
                    {(deal.property?.user?.mobileNumber || deal.sellerMobile) && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {deal.property?.user?.mobileNumber || deal.sellerMobile}
                        </div>
                    )}
                </div>
            )}

            {/* Agent & Deal Info */}
            <div style={lastSectionStyle}>
                <div style={gridStyle}>
                    {/* Agent ID */}
                    <div>
                        <div style={labelStyle}>📊 Agent ID</div>
                        <div style={valueStyle}>
                            {deal.agent?.id || deal.agentId || 'N/A'}
                        </div>
                    </div>

                    {/* Agent Name */}
                    {(deal.agent || deal.agentName) && (
                        <div>
                            <div style={labelStyle}>Agent</div>
                            <div style={valueStyle}>
                                {deal.agent?.firstName || deal.agentName || 'Agent'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* View Button */}
            <button
                style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '10px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: 'background 0.2s',
                }}
                onClick={(e) => {
                    e.stopPropagation(); // Prevent card click from firing
                    onViewDetails && onViewDetails(deal);
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
            >
                👁️ View & Manage Deal
            </button>
        </div>
    );
};

export default DealStatusCard;