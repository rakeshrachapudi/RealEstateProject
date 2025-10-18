// src/pages/AdminAgentsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import DealDetailModal from '../DealDetailModal';

const AdminAgentsDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentDeals, setAgentDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    fetchAgentPerformance();
  }, [user, navigate]);

  const fetchAgentPerformance = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'http://localhost:8080/api/deals/admin/agents-performance',
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setAgentPerformance(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching agent performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentDeals = async (agentId) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/deals/admin/agent/${agentId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      const data = await response.json();
      if (data.success) {
        setAgentDeals(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching agent deals:', error);
    }
  };

  const handleSelectAgent = (agent) => {
    setSelectedAgent(agent);
    fetchAgentDeals(agent.agentId);
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

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>⏳ Loading agent data...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Agent Performance Dashboard</h1>
      <p style={styles.subtitle}>Monitor all agents and their deal performance</p>

      <div style={styles.mainGrid}>
        {/* Left: Agents List */}
        <div style={styles.leftPanel}>
          <h2 style={styles.panelTitle}>Agents ({agentPerformance.length})</h2>
          <div style={styles.agentsList}>
            {agentPerformance.map(agent => (
              <div
                key={agent.agentId}
                style={{
                  ...styles.agentCard,
                  backgroundColor: selectedAgent?.agentId === agent.agentId ? '#dbeafe' : 'white',
                  borderColor: selectedAgent?.agentId === agent.agentId ? '#3b82f6' : '#e2e8f0'
                }}
                onClick={() => handleSelectAgent(agent)}
              >
                <div style={styles.agentHeader}>
                  <div>
                    <h4 style={styles.agentName}>{agent.agentName}</h4>
                    <p style={styles.agentEmail}>{agent.agentEmail}</p>
                  </div>
                </div>

                <div style={styles.agentStats}>
                  <div style={styles.statBadge}>
                    <span style={styles.statLabel}>Deals</span>
                    <span style={styles.statValue}>{agent.totalDeals}</span>
                  </div>
                  <div style={styles.statBadge}>
                    <span style={styles.statLabel}>Completed</span>
                    <span style={styles.statValue}>{agent.completedDeals}</span>
                  </div>
                  <div style={styles.statBadge}>
                    <span style={styles.statLabel}>Rate</span>
                    <span style={styles.statValue}>{agent.conversionRate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Agent Details & Deals */}
        <div style={styles.rightPanel}>
          {selectedAgent ? (
            <>
              <div style={styles.agentDetailCard}>
                <h2 style={styles.agentDetailTitle}>{selectedAgent.agentName}</h2>
                <div style={styles.detailGrid}>
                  <div>
                    <p style={styles.detailLabel}>Email</p>
                    <p style={styles.detailValue}>{selectedAgent.agentEmail}</p>
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Mobile</p>
                    <p style={styles.detailValue}>{selectedAgent.agentMobile}</p>
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Total Deals</p>
                    <p style={styles.detailValue}>{selectedAgent.totalDeals}</p>
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Active Deals</p>
                    <p style={styles.detailValue}>{selectedAgent.activeDeals}</p>
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Completed</p>
                    <p style={styles.detailValue}>{selectedAgent.completedDeals}</p>
                  </div>
                  <div>
                    <p style={styles.detailLabel}>Conversion Rate</p>
                    <p style={styles.detailValue}>{selectedAgent.conversionRate}</p>
                  </div>
                </div>

                {/* Stage Breakdown */}
                <div style={styles.stageBreakdown}>
                  <h4 style={styles.breakdownTitle}>Deals by Stage</h4>
                  <div style={styles.stageGrid}>
                    <div style={styles.stageItem}>
                      <span>🔍 Inquiry:</span>
                      <strong>{selectedAgent.inquiryCount}</strong>
                    </div>
                    <div style={styles.stageItem}>
                      <span>⭐ Shortlist:</span>
                      <strong>{selectedAgent.shortlistCount}</strong>
                    </div>
                    <div style={styles.stageItem}>
                      <span>💬 Negotiation:</span>
                      <strong>{selectedAgent.negotiationCount}</strong>
                    </div>
                    <div style={styles.stageItem}>
                      <span>✅ Agreement:</span>
                      <strong>{selectedAgent.agreementCount}</strong>
                    </div>
                    <div style={styles.stageItem}>
                      <span>📋 Registration:</span>
                      <strong>{selectedAgent.registrationCount}</strong>
                    </div>
                    <div style={styles.stageItem}>
                      <span>💰 Payment:</span>
                      <strong>{selectedAgent.paymentCount}</strong>
                    </div>
                  </div>
                </div>

                <div style={styles.averagePrice}>
                  <span>💵 Average Deal Price:</span>
                  <strong>₹{selectedAgent.averageDealPrice?.toLocaleString('en-IN') || 0}</strong>
                </div>
              </div>

              <h3 style={styles.dealsTitle}>Deals ({agentDeals.length})</h3>
              {agentDeals.length > 0 ? (
                <div style={styles.dealsGrid}>
                  {agentDeals.map(deal => (
                    <div
                      key={deal.id}
                      style={styles.dealCard}
                      onClick={() => setSelectedDeal(deal)}
                    >
                      <div
                        style={{
                          ...styles.dealStageBadge,
                          backgroundColor: getStageColor(deal.stage || deal.currentStage)
                        }}
                      >
                        {deal.stage || deal.currentStage}
                      </div>
                      <h4 style={styles.dealTitle}>{deal.property?.title}</h4>
                      <p style={styles.dealMeta}>👤 Buyer: {deal.buyer?.firstName} {deal.buyer?.lastName}</p>
                      <p style={styles.dealMeta}>🏠 Seller: {deal.property?.user?.firstName} {deal.property?.user?.lastName}</p>
                      {deal.agreedPrice && (
                        <p style={styles.dealPrice}>💰 ₹{deal.agreedPrice.toLocaleString('en-IN')}</p>
                      )}
                      <p style={styles.dealDate}>{new Date(deal.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={styles.noDeals}>No deals created by this agent</p>
              )}
            </>
          ) : (
            <div style={styles.emptyState}>
              <p>👈 Select an agent to view details and deals</p>
            </div>
          )}
        </div>
      </div>

      {selectedDeal && (
        <DealDetailModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={() => {
            setSelectedDeal(null);
            if (selectedAgent) {
              fetchAgentDeals(selectedAgent.agentId);
            }
          }}
          userRole="ADMIN"
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 1600,
    margin: '0 auto',
    padding: '24px 32px',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#64748b',
    marginBottom: '24px',
  },
  loading: {
    textAlign: 'center',
    padding: '80px 20px',
    fontSize: '18px',
    color: '#64748b',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '24px',
  },
  leftPanel: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    height: 'fit-content',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  rightPanel: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  panelTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
    marginTop: 0,
  },
  agentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  agentCard: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  agentHeader: {
    marginBottom: '8px',
  },
  agentName: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  agentEmail: {
    fontSize: '12px',
    color: '#64748b',
    margin: '4px 0 0 0',
  },
  agentStats: {
    display: 'flex',
    gap: '8px',
  },
  statBadge: {
    flex: 1,
    padding: '6px',
    backgroundColor: '#f1f5f9',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '11px',
  },
  statLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '10px',
  },
  statValue: {
    display: 'block',
    color: '#1e293b',
    fontWeight: '700',
    fontSize: '14px',
  },
  agentDetailCard: {
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginBottom: '24px',
  },
  agentDetailTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 16px 0',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '16px',
  },
  detailLabel: {
    fontSize: '12px',
    color: '#64748b',
    margin: '0 0 4px 0',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0,
  },
  stageBreakdown: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0',
  },
  breakdownTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 12px 0',
  },
  stageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '12px',
  },
  stageItem: {
    padding: '8px',
    backgroundColor: 'white',
    borderRadius: '6px',
    fontSize: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  averagePrice: {
    padding: '12px',
    backgroundColor: '#f0fdf4',
    borderRadius: '6px',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#065f46',
    fontWeight: '600',
    border: '1px solid #86efac',
  },
  dealsTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
    marginTop: '24px',
  },
  dealsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  dealCard: {
    padding: '14px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  dealStageBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '11px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  dealTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    margin: '0 0 8px 0',
  },
  dealMeta: {
    fontSize: '12px',
    color: '#64748b',
    margin: '4px 0',
  },
  dealPrice: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#10b981',
    margin: '8px 0 4px 0',
  },
  dealDate: {
    fontSize: '11px',
    color: '#94a3b8',
    margin: '4px 0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b',
    fontSize: '16px',
  },
  noDeals: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #e2e8f0',
  },
};

export default AdminAgentsDashboard;