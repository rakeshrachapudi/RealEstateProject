import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

// ============================================
// SUB-COMPONENT: Deal Progress Bar
// ============================================

const DealProgressBar = ({ currentStatus, propertyId, onStatusUpdate }) => {
    const statuses = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT'];
    const currentIndex = statuses.indexOf(currentStatus);
    const { user } = useAuth();

    const handleStatusClick = async (newStatus) => {
        if (!['ADMIN', 'AGENT'].includes(user?.role)) {
            alert("You don't have permission to change the status.");
            return;
        }
        if (window.confirm(`Are you sure you want to change the deal status to "${newStatus}"?`)) {
            try {
                const response = await fetch(`http://localhost:8080/api/properties/${propertyId}/deal-status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dealStatus: newStatus }),
                });
                if (response.ok) {
                    alert('Status updated successfully!');
                    onStatusUpdate(propertyId, newStatus);
                } else {
                    const error = await response.text();
                    alert(`Failed to update status: ${error}`);
                }
            } catch (error) {
                console.error('Error updating deal status:', error);
                alert('An error occurred while updating the status.');
            }
        }
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
            {statuses.map((status, index) => (
                <div key={status}
                     onClick={() => handleStatusClick(status)}
                     title={`Click to set status to ${status}`}
                     style={{
                         padding: '6px 12px',
                         borderRadius: '15px',
                         fontSize: '11px',
                         fontWeight: 'bold',
                         cursor: 'pointer',
                         backgroundColor: index <= currentIndex ? '#28a745' : '#e9ecef',
                         color: index <= currentIndex ? 'white' : '#6c757d',
                         border: `2px solid ${index === currentIndex ? '#198754' : 'transparent'}`,
                         transition: 'transform 0.2s',
                     }}
                     onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                     onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {status}
                </div>
            ))}
        </div>
    );
};


// ============================================
// MAIN COMPONENT: Admin Dashboard
// ============================================

const AdminDashboard = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role !== 'ADMIN') {
            navigate('/'); // Redirect non-admins
            return;
        }
        fetchProperties();
    }, [user, navigate]);

    const fetchProperties = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:8080/api/admin/properties');
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
            const data = await response.json();
            setProperties(data);
        } catch (error) {
            console.error('Error fetching properties:', error);
            alert(`Could not fetch properties: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = (propertyId, newStatus) => {
        setProperties(prevProperties =>
            prevProperties.map(p => p.id === propertyId ? { ...p, dealStatus: newStatus } : p)
        );
    };

    const handleGenerateInvoice = (propertyId) => {
        if(window.confirm("This will open a new tab to download the PDF invoice. Continue?")) {
            window.open(`http://localhost:8080/api/invoices/property/${propertyId}`, '_blank');
        }
    };

    const handleTriggerPayment = (property) => {
        alert(`(Placeholder) Triggering 0.5% payment collection for Property ID: ${property.id}`);
    };

    const handleApproveRegistration = (propertyId) => {
        alert(`(Placeholder) Marking registration as approved for Property ID: ${propertyId}`);
    };

    if (loading) {
        return <div style={styles.container}><h2>Loading Admin Dashboard...</h2></div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>🔑 Admin Dashboard</h1>
            <p style={styles.subHeader}>Manage all properties and deal progressions.</p>
            <table style={styles.table}>
                <thead style={styles.thead}>
                    <tr>
                        <th style={styles.th}>ID</th>
                        <th style={styles.th}>Title</th>
                        <th style={styles.th}>Owner</th>
                        <th style={styles.th}>Deal Progress</th>
                        <th style={styles.th}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {properties.map(property => (
                        <tr key={property.id} style={styles.tr}>
                            <td style={styles.td}>{property.id}</td>
                            <td style={styles.td}>{property.title}</td>
                            <td style={styles.td}>{property.user?.username || 'N/A'}</td>
                            <td style={styles.td}>
                                <DealProgressBar
                                    currentStatus={property.dealStatus || 'INQUIRY'}
                                    propertyId={property.id}
                                    onStatusUpdate={handleStatusUpdate}
                                />
                            </td>
                            <td style={styles.td}>
                                <button style={styles.button} onClick={() => handleApproveRegistration(property.id)}>Approve</button>
                                <button style={{...styles.button, ...styles.paymentButton}} onClick={() => handleTriggerPayment(property)}>Trigger Payment</button>
                                <button style={{...styles.button, ...styles.invoiceButton}} onClick={() => handleGenerateInvoice(property.id)}>Invoice</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif'
    },
    header: {
        textAlign: 'center',
        fontSize: '2.5rem',
        color: '#1e293b',
        marginBottom: '0.5rem'
    },
    subHeader: {
        textAlign: 'center',
        fontSize: '1.1rem',
        color: '#64748b',
        marginBottom: '2rem'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    },
    thead: {
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0'
    },
    th: {
        padding: '12px 15px',
        textAlign: 'left',
        fontWeight: '600',
        color: '#475569',
        textTransform: 'uppercase',
        fontSize: '12px'
    },
    tr: {
        borderBottom: '1px solid #e2e8f0',
    },
    td: {
        padding: '15px',
        fontSize: '14px',
        color: '#334155'
    },
    button: {
        marginRight: '8px',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        border: '1px solid #ccc',
        borderRadius: '6px',
        backgroundColor: '#f8f9fa',
        transition: 'background-color 0.2s',
    },
    paymentButton: {
        backgroundColor: '#ffc107',
        color: '#000',
        borderColor: '#ffc107'
    },
    invoiceButton: {
        backgroundColor: '#17a2b8',
        color: 'white',
        borderColor: '#17a2b8'
    }
};

export default AdminDashboard;
