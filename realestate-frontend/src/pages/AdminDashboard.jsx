import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AdminAgentsDashboard from './AdminAgentsDashboard';
import UserManagementTab from './UserManagementTab';

const AdminDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('agents'); // Default to Agents tab

    // --- Access Control ---
    if (!isAuthenticated || user?.role !== 'ADMIN') {
        navigate('/');
        return null;
    }

    // --- Styles for Tabs ---
    const styles = {
        container: { maxWidth: 1600, margin: '0 auto', padding: '24px 32px', minHeight: '100vh', backgroundColor: '#f8fafc' },
        header: { marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e2e8f0' },
        title: { fontSize: '28px', fontWeight: '800', color: '#1e293b' },
        subtitle: { fontSize: '16px', color: '#64748b' },
        tabContainer: { display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px', overflowX: 'auto' },
        tabButton: (isActive) => ({
            padding: '12px 20px',
            cursor: 'pointer',
            backgroundColor: isActive ? '#4f46e5' : 'transparent',
            color: isActive ? 'white' : '#4f46e5',
            border: isActive ? '2px solid #4f46e5' : '1px solid #e2e8f0',
            borderBottom: isActive ? '2px solid #4f46e5' : '1px solid #e2e8f0',
            borderRadius: '8px 8px 0 0',
            fontWeight: '600',
            transition: 'all 0.2s',
            marginRight: '-1px',
            outline: 'none',
            flexShrink: 0,
            boxShadow: isActive ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
            transform: isActive ? 'translateY(-2px)' : 'none',
        }),
        contentWrapper: {
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>👑 Main Admin Control Panel</h1>
                <p style={styles.subtitle}>Navigate administrative views below.</p>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabContainer}>
                <button
                    onClick={() => setActiveTab('agents')}
                    style={styles.tabButton(activeTab === 'agents')}
                >
                    📈 Agent Performance
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    style={styles.tabButton(activeTab === 'users')}
                >
                    👥 User Management
                </button>
            </div>

            {/* Conditional Content Rendering */}
            <div style={styles.contentWrapper}>
                {activeTab === 'agents' && <AdminAgentsDashboard />}
                {activeTab === 'users' && <UserManagementTab />}
            </div>
        </div>
    );
};

export default AdminDashboard;
