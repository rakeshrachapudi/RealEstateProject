import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext'; // Ensure path is correct, likely ../AuthContext.jsx
import DealDetailModal from './DealDetailModal'; // Ensure path is correct, likely ../DealDetailModal.jsx

// Helper function to safely get user data
const getUserDetails = (user, role) => {
    if (!user) return { name: `(No ${role} Data)`, mobile: 'N/A' };
    return {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || `[${role} Name Missing]`,
        mobile: user.mobileNumber || 'N/A'
    };
};

const AdminDealPanel = () => {
    const { user } = useAuth();
    const [dealsByAgent, setDealsByAgent] = useState({});
    const [allDeals, setAllDeals] = useState([]);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [error, setError] = useState(null);

    // --- Data Fetching ---
    useEffect(() => {
        if (user?.id) fetchDeals();
    }, [user?.id]);

    const fetchDeals = async () => {
        setLoading(true);
        setError(null);
        const headers = { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` };
        const allDealsFlat = [];
        const agentDealsMap = {};

        try {
            // Fetch agent performance data first to get agent IDs
            const adminRes = await fetch(`http://localhost:8080/api/deals/admin/dashboard?userId=${user.id}`, { headers });
            if (!adminRes.ok) throw new Error(`Failed Admin Dashboard fetch (${adminRes.status})`);
            const adminData = await adminRes.json();

            if (adminData.success && adminData.data?.agentPerformance) {
                // Fetch deals for each agent
                for (const agentPerf of adminData.data.agentPerformance) {
                    const agentDealsRes = await fetch(`http://localhost:8080/api/deals/admin/agent/${agentPerf.agentId}?userId=${user.id}`, { headers });
                    if (agentDealsRes.ok) {
                        const agentDealsData = await agentDealsRes.json();
                        let deals = [];
                        // Handle potential API response variations
                        if (Array.isArray(agentDealsData)) deals = agentDealsData;
                        else if (agentDealsData?.data && Array.isArray(agentDealsData.data)) deals = agentDealsData.data;
                        else if (agentDealsData?.success && Array.isArray(agentDealsData.data)) deals = agentDealsData.data;

                        if (deals.length > 0) {
                            // Use agentId directly as key if available and unique
                            const agentKey = agentPerf.agentId ? String(agentPerf.agentId) : `${agentPerf.agentId}-${agentPerf.agentName}`;
                            agentDealsMap[agentKey] = { ...agentPerf, deals: deals };
                            allDealsFlat.push(...deals);
                        }
                    } else {
                        console.warn(`Failed fetch for agent ${agentPerf.agentName}`);
                    }
                }
            } else {
                console.warn("No agent performance data found in admin dashboard response.");
            }

            setAllDeals(allDealsFlat);
            setDealsByAgent(agentDealsMap);

        } catch (error) {
            setError(`Error loading deal data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Filtering ---
    const getFilteredDealsByAgent = () => {
        const filtered = {};
        Object.keys(dealsByAgent).forEach(agentKey => {
            const agentData = dealsByAgent[agentKey];
            const deals = (activeTab === 'all')
                ? agentData.deals
                : agentData.deals.filter(d => d.stage === activeTab);

            if (deals.length > 0) {
                filtered[agentKey] = { ...agentData, deals: deals };
            }
        });
        return filtered;
    };

    // --- Styles ---
    const styles = {
        container: { maxWidth: '1600px', margin: '0 auto', padding: '24px' },
        title: { fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
        subtitle: { fontSize: '16px', color: '#64748b', marginBottom: '24px' },
        tabs: { display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', overflowX: 'auto' },
        tab: (isActive) => ({ padding: '10px 20px', backgroundColor: isActive ? '#3b82f6' : '#f8fafc', color: isActive ? 'white' : '#64748b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap' }),
        agentSection: { backgroundColor: '#f9fafb', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e2e8f0' },
        agentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' },
        agentName: { fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: '0 0 8px 0' },
        agentMeta: { display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b' },
        agentStats: { display: 'flex', gap: '12px' },
        statBox: { backgroundColor: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' },
        statLabel: { fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '4px' },
        statValue: { fontSize: '18px', fontWeight: '700', color: '#3b82f6' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' },
        card: { padding: '16px', backgroundColor: '#fffbeb', borderRadius: '12px', border: '1px solid #fde047', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
        stageBadge: { display: 'inline-block', padding: '4px 8px', backgroundColor: '#f59e0b', color: 'white', borderRadius: '4px', fontSize: '11px', fontWeight: '600', marginBottom: '8px' },
        titleSmall: { margin: '0 0 12px 0', color: '#1e293b', fontWeight: '600', fontSize: '14px' },
        button: { width: '100%', padding: '8px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' },
        loading: { padding: '40px', textAlign: 'center', fontSize: '18px', color: '#64748b' },
        error: { padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', border: '1px solid #fecaca' },
        noDeals: { textAlign: 'center', padding: '60px 20px', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px' }
    };


    if (loading) return <div style={styles.loading}>⏳ Loading deals...</div>;
    if (!user) return <div style={styles.loading}>❌ Please log in to view deals.</div>;

    const stages = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT'];
    const stageCounts = stages.reduce((acc, stage) => {
        acc[stage] = allDeals.filter(d => d.stage === stage).length;
        return acc;
    }, {});

    const filteredDealsByAgent = getFilteredDealsByAgent();
    const totalAgents = Object.keys(dealsByAgent).length;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>⚙️ Admin Dashboard - Deal Management</h1>
            <p style={styles.subtitle}>{totalAgents} Agent(s) • {allDeals.length} Total Deals</p>

            {error && <div style={styles.error}>❌ {error}</div>}

            {/* Filter Tabs */}
            <div style={styles.tabs}>
                <button style={styles.tab(activeTab === 'all')} onClick={() => setActiveTab('all')}>All ({allDeals.length})</button>
                {stages.map(stage => (
                    // KEY PROP for stage filter buttons
                    <button key={stage} style={styles.tab(activeTab === stage)} onClick={() => setActiveTab(stage)}>
                        {stage} ({stageCounts[stage]})
                    </button>
                ))}
            </div>

            {/* Deals grouped by agent */}
            {Object.keys(filteredDealsByAgent).length === 0 ? (
                <div style={styles.noDeals}>🔍 No deals found matching the current filter.</div>
            ) : (
                <div>
                    {Object.entries(filteredDealsByAgent).map(([agentKey, agentData]) => (
                        // KEY PROP for agent sections
                        <div key={agentKey} style={styles.agentSection}>
                            {/* Agent Header */}
                            <div style={styles.agentHeader}>
                                <div>
                                    <h2 style={styles.agentName}>📊 {agentData.agentName}</h2>
                                    <div style={styles.agentMeta}>
                                        <span>ID: {agentData.agentId}</span>
                                        <span>Email: {agentData.agentEmail || 'N/A'}</span>
                                        <span>Phone: {agentData.agentMobile || 'N/A'}</span>
                                    </div>
                                </div>
                                <div style={styles.agentStats}>
                                    <div style={styles.statBox}><div style={styles.statLabel}>Total Deals</div><div style={styles.statValue}>{agentData.totalDeals}</div></div>
                                    <div style={styles.statBox}><div style={styles.statLabel}>Completed</div><div style={styles.statValue}>{agentData.completedDeals}</div></div>
                                    <div style={styles.statBox}><div style={styles.statLabel}>Filtered</div><div style={styles.statValue}>{agentData.deals.length}</div></div>
                                </div>
                            </div>

                            {/* Agent's Deals Grid */}
                            <div style={styles.grid}>
                                {agentData.deals.map((deal) => {
                                    const buyerDetails = getUserDetails(deal.buyer, 'Buyer');
                                    const sellerDetails = getUserDetails(deal.property?.user, 'Seller');
                                    // Make sure deal.id is unique and available
                                    const dealKey = deal.id || `deal-${Math.random()}`;

                                    return (
                                        // KEY PROP for deal cards
                                        <div
                                            key={dealKey}
                                            style={styles.card}
                                            onClick={() => setSelectedDeal(deal)}
                                            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                        >
                                            <div style={styles.stageBadge}>{deal.stage}</div>
                                            <h4 style={styles.titleSmall}>🏠 {deal.propertyTitle || deal.property?.title || 'Property Title Unavailable'}</h4>
                                            {deal.agreedPrice && <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '6px', marginBottom: '10px', fontSize: '14px', fontWeight: '700', color: '#065f46' }}>💰 ₹{deal.agreedPrice.toLocaleString('en-IN')}</div>}
                                            <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '6px', marginBottom: '8px', fontSize: '12px' }}>
                                                <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>👤 Buyer: {buyerDetails.name}</div>
                                                <div style={{ color: '#64748b', fontSize: '11px' }}>📞 {buyerDetails.mobile}</div>
                                            </div>
                                            <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '6px', marginBottom: '8px', fontSize: '12px' }}>
                                                <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>🏢 Seller: {sellerDetails.name}</div>
                                                <div style={{ color: '#64748b', fontSize: '11px' }}>📞 {sellerDetails.mobile}</div>
                                            </div>
                                            <p style={{ margin: '8px 0 12px 0', fontSize: '11px', color: '#64748b' }}>📅 {new Date(deal.createdAt).toLocaleDateString()}</p>
                                            <button style={styles.button} onClick={(e) => { e.stopPropagation(); setSelectedDeal(deal); }}>View & Manage</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedDeal && (
                <DealDetailModal
                    deal={selectedDeal}
                    onClose={() => setSelectedDeal(null)}
                    onUpdate={() => { setSelectedDeal(null); fetchDeals(); }} // Refresh list on update
                    userRole="ADMIN" // Pass userRole if needed by Modal
                />
            )}
        </div>
    );
};

export default AdminDealPanel;