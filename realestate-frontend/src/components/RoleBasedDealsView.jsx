// src/components/RoleBasedDealsView.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import DealDetailModal from '../DealDetailModal';
import { BACKEND_BASE_URL } from "../config/config";

const RoleBasedDealsView = () => {
  const { user } = useAuth();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [activeFilter, setActiveFilter] = useState('active');
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchDeals();
      if (user.role === 'ADMIN') {
        fetchAgents();
      }
    }
  }, [user, selectedAgent]);

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/deals/admin/agents-performance`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAgents(data.success ? data.data : []);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const fetchDeals = async () => {
    setLoading(true);
    const headers = { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` };

    try {
      let dealsData = [];
      let endpoint = '';

      // Determine endpoint based on role
      if (user.role === 'BUYER') {
        endpoint = `${BACKEND_BASE_URL}/api/deals/buyer/${user.id}`;
      } else if (user.role === 'SELLER') {
        endpoint = `${BACKEND_BASE_URL}/api/deals/my-deals?userRole=SELLER`;
      } else if (user.role === 'AGENT') {
        endpoint = `${BACKEND_BASE_URL}/api/deals/agent/${user.id}`;
      } else if (user.role === 'ADMIN') {
        if (selectedAgent) {
          endpoint = `${BACKEND_BASE_URL}/api/deals/admin/agent/${selectedAgent}`;
        } else {
          // Fetch all deals for admin
          const stages = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT', 'COMPLETED'];
          const allDeals = [];

          for (const stage of stages) {
            const res = await fetch(`${BACKEND_BASE_URL}/api/deals/stage/${stage}`, { headers });
            if (res.ok) {
              const stageData = await res.json();
              if (stageData.success && stageData.data) {
                allDeals.push(...stageData.data);
              }
            }
          }

          setDeals(allDeals);
          setLoading(false);
          return;
        }
      }

      if (endpoint) {
        const response = await fetch(endpoint, { headers });

        if (response.ok) {
          const data = await response.json();
          dealsData = Array.isArray(data) ? data : (data.success ? data.data : []);
        }
      }

      setDeals(dealsData);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDeals = () => {
    if (activeFilter === 'active') {
      return deals.filter(d => (d.stage || d.currentStage) !== 'COMPLETED');
    } else if (activeFilter === 'completed') {
      return deals.filter(d => (d.stage || d.currentStage) === 'COMPLETED');
    }
    return deals;
  };

  const getRoleTitle = () => {
    if (user.role === 'BUYER') return '💰 My Purchase Deals';
    if (user.role === 'SELLER') return '🏠 Deals on My Properties';
    if (user.role === 'AGENT') return '📊 Deals I Created';
    if (user.role === 'ADMIN') {
      return selectedAgent
        ? `📊 Deals by Agent ${selectedAgent}`
        : '👥 All Deals Across Platform';
    }
    return 'My Deals';
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

  const filteredDeals = getFilteredDeals();

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Loading your deals...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>{getRoleTitle()}</h1>
        <p style={styles.subtitle}>
          {user.role === 'BUYER' && 'Track properties you\'re interested in purchasing'}
          {user.role === 'SELLER' && 'Monitor deals on your listed properties'}
          {user.role === 'AGENT' && 'Manage deals you\'ve created for buyers'}
          {user.role === 'ADMIN' && 'View and manage all deals across agents'}
        </p>
      </div>

      {/* Admin Agent Selector */}
      {user.role === 'ADMIN' && (
        <div style={styles.agentSelector}>
          <label style={styles.agentLabel}>Filter by Agent:</label>
          <select
            value={selectedAgent || ''}
            onChange={(e) => setSelectedAgent(e.target.value ? parseInt(e.target.value) : null)}
            style={styles.agentSelect}
          >
            <option value="">All Agents</option>
            {agents.map(agent => (
              <option key={agent.agentId} value={agent.agentId}>
                {agent.agentName} ({agent.totalDeals} deals)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        <button
          onClick={() => setActiveFilter('active')}
          style={{
            ...styles.tab,
            ...(activeFilter === 'active' ? styles.activeTab : {})
          }}
        >
          📈 Active ({deals.filter(d => (d.stage || d.currentStage) !== 'COMPLETED').length})
        </button>
        <button
          onClick={() => setActiveFilter('completed')}
          style={{
            ...styles.tab,
            ...(activeFilter === 'completed' ? styles.activeTab : {})
          }}
        >
          ✅ Completed ({deals.filter(d => (d.stage || d.currentStage) === 'COMPLETED').length})
        </button>
        <button
          onClick={() => setActiveFilter('all')}
          style={{
            ...styles.tab,
            ...(activeFilter === 'all' ? styles.activeTab : {})
          }}
        >
          📊 All ({deals.length})
        </button>
      </div>

      {/* Deals Grid */}
      {filteredDeals.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <h3 style={styles.emptyTitle}>No Deals Found</h3>
          <p style={styles.emptyText}>
            {activeFilter === 'active' && 'No active deals at the moment'}
            {activeFilter === 'completed' && 'No completed deals yet'}
            {activeFilter === 'all' && 'No deals have been created yet'}
          </p>
        </div>
      ) : (
        <div style={styles.dealsGrid}>
          {filteredDeals.map(deal => (
            <div
              key={deal.id || deal.dealId}
              style={styles.dealCard}
              onClick={() => setSelectedDeal(deal)}
            >
              {/* Stage Badge */}
              <div
                style={{
                  ...styles.stageBadge,
                  backgroundColor: getStageColor(deal.stage || deal.currentStage)
                }}
              >
                {deal.stage || deal.currentStage}
              </div>

              {/* Property Title */}
              <h3 style={styles.dealTitle}>{deal.property?.title || 'Property'}</h3>

              {/* Deal Info */}
              <div style={styles.dealInfo}>
                <div style={styles.infoRow}>
                  <span>📍</span>
                  <span>{deal.property?.city || 'Location'}</span>
                </div>

                {user.role !== 'BUYER' && (
                  <div style={styles.infoRow}>
                    <span>👤</span>
                    <span>Buyer: {deal.buyer?.firstName} {deal.buyer?.lastName}</span>
                  </div>
                )}

                {user.role !== 'SELLER' && deal.property?.user && (
                  <div style={styles.infoRow}>
                    <span>🏠</span>
                    <span>Seller: {deal.property.user.firstName} {deal.property.user.lastName}</span>
                  </div>
                )}

                {(user.role === 'ADMIN' || user.role === 'SELLER') && deal.agent && (
                  <div style={styles.infoRow}>
                    <span>📊</span>
                    <span>Agent: {deal.agent.firstName} {deal.agent.lastName}</span>
                  </div>
                )}

                {deal.agreedPrice && (
                  <div style={styles.priceRow}>
                    <span>💰</span>
                    <span>₹{deal.agreedPrice.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {/* Date */}
              <div style={styles.date}>
                Created: {new Date(deal.createdAt).toLocaleDateString()}
              </div>

              {/* View Button */}
              <button style={styles.viewBtn}>
                📋 View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {
            setSelectedDeal(null);
            fetchDeals();
          }}
          userRole={user.role}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '24px 32px',
    minHeight: '80vh'
  },
  header: {
    marginBottom: '32px',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '16px'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
    margin: 0
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    marginTop: '8px',
    margin: '8px 0 0 0'
  },
  loading: {
    textAlign: 'center',
    padding: '80px 20px',
    fontSize: '18px',
    color: '#64748b'
  },
  agentSelector: {
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  },
  agentLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    marginRight: '12px'
  },
  agentSelect: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    minWidth: '250px'
  },
  filterTabs: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    borderBottom: '2px solid #e2e8f0',
    paddingBottom: '12px'
  },
  tab: {
    padding: '10px 20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    color: '#64748b',
    transition: 'all 0.2s'
  },
  activeTab: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#f8fafc',
    borderRadius: '16px',
    border: '2px dashed #e2e8f0'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
    margin: '0 0 8px 0'
  },
  emptyText: {
    fontSize: '16px',
    color: '#64748b',
    margin: 0
  },
  dealsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  dealCard: {
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  stageBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '6px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '12px'
  },
  dealTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
    margin: '0 0 16px 0'
  },
  dealInfo: {
    marginBottom: '12px'
  },
  infoRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '8px'
  },
  priceRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontSize: '16px',
    color: '#10b981',
    fontWeight: '700',
    marginTop: '12px'
  },
  date: {
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '16px'
  },
  viewBtn: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background 0.2s'
  }
};

export default RoleBasedDealsView;