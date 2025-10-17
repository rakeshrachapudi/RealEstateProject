import React, { useState, useEffect } from 'react';
import DealStatusCard from './DealStatusCard';
import DealDetailModal from './DealDetailModal';
import { useAuth } from '../AuthContext';

const DealDashboard = () => {
    const { user } = useAuth();
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [filterStage, setFilterStage] = useState('ALL');

    useEffect(() => {
        fetchDeals();
    }, [user]);

    const fetchDeals = async () => {
        try {
            let url = `http://localhost:8080/api/deals`;

            if (user?.role === 'AGENT' || user?.role === 'ADMIN') {
                url += `/agent/${user.id}/active`;
            } else if (user?.role === 'USER') {
                url += `/buyer/${user.id}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
            });

            const data = await response.json();
            if (data.success) {
                setDeals(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching deals:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredDeals = filterStage === 'ALL'
        ? deals
        : deals.filter(d => d.currentStage === filterStage);

    const stages = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT', 'COMPLETED'];
    const stageCounts = {};
    stages.forEach(stage => {
        stageCounts[stage] = deals.filter(d => d.currentStage === stage).length;
    });

    const containerStyle = {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px',
    };

    const headerStyle = {
        marginBottom: '32px',
    };

    const titleStyle = {
        fontSize: '32px',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '8px',
        margin: 0,
    };

    const statsGridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
    };

    const statCardStyle = (count) => ({
        padding: '16px',
        backgroundColor: count > 0 ? '#f0f9ff' : '#f8fafc',
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s',
        border: `1px solid ${count > 0 ? '#bfdbfe' : '#e2e8f0'}`,
    });

    const statValueStyle = {
        fontSize: '24px',
        fontWeight: '700',
        color: '#3b82f6',
        marginBottom: '4px',
    };

    const statLabelStyle = {
        fontSize: '12px',
        color: '#64748b',
        fontWeight: '500',
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '16px',
    };

    const emptyStyle = {
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        color: '#64748b',
    };

    if (loading) {
        return <div style={containerStyle}><h2>Loading deals...</h2></div>;
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>📊 Deal Dashboard</h1>
                <p style={{ color: '#64748b', margin: '8px 0 0 0' }}>
                    Manage and track all real estate deals
                </p>
            </div>

            <div style={statsGridStyle}>
                {stages.map(stage => (
                    <div
                        key={stage}
                        style={statCardStyle(stageCounts[stage])}
                        onClick={() => setFilterStage(filterStage === stage ? 'ALL' : stage)}
                    >
                        <div style={statValueStyle}>{stageCounts[stage]}</div>
                        <div style={statLabelStyle}>{stage}</div>
                    </div>
                ))}
            </div>

            {filterStage !== 'ALL' && (
                <div style={{ marginBottom: '16px' }}>
                    <button
                        onClick={() => setFilterStage('ALL')}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                        }}
                    >
                        ✕ Clear Filter
                    </button>
                </div>
            )}

            {filteredDeals.length === 0 ? (
                <div style={emptyStyle}>
                    <h3>No deals found</h3>
                    <p>Create your first deal to get started</p>
                </div>
            ) : (
                <div style={gridStyle}>
                    {filteredDeals.map(deal => (
                        <DealStatusCard
                            key={deal.dealId}
                            deal={deal}
                            onViewDetails={setSelectedDeal}
                        />
                    ))}
                </div>
            )}

            {selectedDeal && (
                <DealDetailModal
                    deal={selectedDeal}
                    userRole={user?.role}
                    onClose={() => setSelectedDeal(null)}
                    onUpdate={fetchDeals}
                />
            )}
        </div>
    );
};

export default DealDashboard;