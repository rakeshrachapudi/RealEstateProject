import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import BrowsePropertiesForDeal from '../pages/BrowsePropertiesForDeal.jsx';
import DealDetailModal from '../DealDetailModal.jsx';

const AgentDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [deals, setDeals] = useState([]);
    const [properties, setProperties] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateDeal, setShowCreateDeal] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    const [filterTab, setFilterTab] = useState('pending'); // Start on pending tab

    useEffect(() => {
        // Redirect if not authenticated or not an agent/admin
        if (!isAuthenticated || !user || (user.role !== 'AGENT' && user.role !== 'ADMIN')) {
            console.log('❌ Access Denied: Not an agent or admin');
            navigate('/'); // Redirect to home or login page
            return; // Stop further execution in this effect
        }
        // Fetch data if authenticated and has the correct role
        fetchAgentData();
    }, [user, isAuthenticated, navigate]); // Dependencies for the effect

    // Helper function for safe JSON parsing
    const safeParseJson = async (response) => {
        const text = await response.text();
        if (!text) {
            return null; // Return null if the response body is empty
        }
        try {
            return JSON.parse(text);
        } catch (e) {
            console.error('Failed to parse JSON:', text, e);
            return null; // Return null if parsing fails
        }
    };

    // Fetches all data needed for the agent dashboard
    const fetchAgentData = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        // Ensure token exists before making requests
        if (!token) {
            setError("Authentication token not found. Please log in again.");
            setLoading(false);
            navigate('/login'); // Redirect to login if no token
            return;
        }
        const headers = { Authorization: `Bearer ${token}` };

        try {
            console.log('📥 Fetching agent data for user:', user?.id); // Safely access user.id

            // Fetch deals assigned to the agent
            const dealsRes = await fetch(`http://localhost:8080/api/deals/agent/${user.id}`, { headers });
            if (dealsRes.ok) {
                const responseData = await safeParseJson(dealsRes);
                let dealsList = [];
                // Handle different possible response structures
                if (responseData) {
                    if (Array.isArray(responseData)) {
                      dealsList = responseData;
                    } else if (responseData.success && Array.isArray(responseData.data)) {
                      dealsList = responseData.data;
                    } else if (responseData.data && Array.isArray(responseData.data)) {
                      dealsList = responseData.data;
                    }
                }
                console.log('✅ Deals loaded:', dealsList.length);
                setDeals(dealsList);
            } else {
                console.error('❌ Deals response not ok:', dealsRes.status, dealsRes.statusText);
                setError(`Failed to load deals (Status: ${dealsRes.status})`);
                setDeals([]); // Set empty on failure
            }

            // Fetch properties managed by the agent (assuming endpoint exists)
            // Using a generic endpoint for now, adjust if needed
            const propsRes = await fetch(`http://localhost:8080/api/properties/user/${user.id}`, { headers }).catch(() => ({ ok: false }));
            if (propsRes.ok) {
                const data = await safeParseJson(propsRes);
                // Filter properties where the current user is the owner/lister
                const agentProperties = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
                setProperties(agentProperties.filter(p => p.user?.id === user.id));
                console.log('✅ Agent Properties loaded:', properties.length);
            } else {
                console.error('❌ Properties response not ok:', propsRes.status);
                setProperties([]);
            }

            // Fetch agent stats (assuming endpoint exists)
            // Placeholder endpoint, adjust if needed
            // const statsRes = await fetch(`http://localhost:8080/api/agents/${user.id}/stats`, { headers }).catch(() => ({ ok: false }));
            // if (statsRes.ok) {
            //     const data = await safeParseJson(statsRes);
            //     setStats(data?.success ? data.data : {});
            // } else {
            //     console.error('❌ Stats response not ok:', statsRes.status);
            //     setStats({});
            // }
            // Using calculated stats for now:
             setStats({
                 activeDeals: deals.filter(d => d.stage !== 'COMPLETED').length,
                 completedDeals: deals.filter(d => d.stage === 'COMPLETED').length,
                 propertiesManaged: properties.length
             });


            // Fetch pending price requests for this agent/admin
            const requestsRes = await fetch(`http://localhost:8080/api/price-requests/pending`, { headers });
            if (requestsRes.ok) {
                const reqData = await safeParseJson(requestsRes);
                const pendingList = Array.isArray(reqData) ? reqData : []; // Ensure it's an array
                console.log('✅ Pending Requests loaded:', pendingList.length);
                setPendingRequests(pendingList);
            } else {
                console.error('❌ Pending Requests endpoint failed:', requestsRes.status);
                setError(`Failed to load pending requests (Status: ${requestsRes.status})`);
                setPendingRequests([]);
            }

        } catch (err) {
            console.error('❌ Error fetching agent data:', err);
            setError(`Failed to load dashboard data: ${err.message}`);
            // Clear data on error
            setDeals([]);
            setProperties([]);
            setStats({});
            setPendingRequests([]);
        } finally {
            setLoading(false);
        }
    };

    // Handler to accept a price request and create a deal
    const handleAcceptRequest = async (requestId) => {
        console.log(`Attempting to accept request ID: ${requestId}`);
        const token = localStorage.getItem('authToken');
        setError(null); // Clear previous errors

        if (!token) {
            setError("Authentication token missing.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/price-requests/${requestId}/accept`, {
                method: 'POST', // Use POST as per backend controller
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // No Content-Type needed if body is empty
                },
            });

            if (res.ok) {
                // Handle potentially empty success response
                const responseText = await res.text();
                const responseData = responseText ? JSON.parse(responseText) : null;
                console.log('Deal accepted successfully:', responseData);
                alert('✅ Deal accepted and created!');
                fetchAgentData(); // Refresh the whole dashboard
                setFilterTab('active'); // ⭐ Auto-switch to Active Deals tab
            } else {
                // Safely parse potential error response
                let errorMessage = `Failed to accept deal (Status: ${res.status})`;
                const errorText = await res.text();
                try {
                    const errData = errorText ? JSON.parse(errorText) : null;
                    // Try to get message from standard { "message": "..." } or just use text
                    errorMessage = errData?.message || errorText || errorMessage;
                } catch (parseError) {
                    console.warn("Could not parse error response as JSON:", errorText);
                    errorMessage = res.statusText || errorMessage; // Use HTTP status text as fallback
                }
                console.error(`Error accepting deal (Request ID ${requestId}): ${errorMessage}`);
                setError(errorMessage); // Set error state for UI display
                alert(`❌ Error: ${errorMessage}`);
                // Refresh data even on specific errors like conflict (409) or bad request (400)
                if (res.status === 400 || res.status === 409) {
                    fetchAgentData();
                }
            }
        } catch (err) {
            console.error('Network or other error accepting deal:', err);
            const displayError = `An error occurred: ${err.message}. Check console.`;
            setError(displayError); // Set error state
            alert(`❌ ${displayError}`);
        }
    };


    // Opens the modal/view to browse properties for creating a new deal
    const handleCreateDealClick = () => {
        console.log('➕ Opening create deal modal');
        setShowCreateDeal(true);
    };

    // Calculate counts based on the current deals state
    const activeDealCount = deals.filter(d => d.stage?.toUpperCase() !== 'COMPLETED').length;
    const completedDealCount = deals.filter(d => d.stage?.toUpperCase() === 'COMPLETED').length;

    // Filter deals to display based on the active tab
    const displayedDeals = filterTab === 'active'
        ? deals.filter(d => d.stage?.toUpperCase() !== 'COMPLETED')
        : filterTab === 'completed'
        ? deals.filter(d => d.stage?.toUpperCase() === 'COMPLETED')
        : filterTab === 'total'
        ? deals
        : []; // Default to empty if tab doesn't match deal types

    // Determines the title for the main section based on the active tab
    const getSectionTitle = () => {
        switch(filterTab) {
            case 'pending':
                return `🔔 Pending Price Requests (${pendingRequests.length})`;
            case 'active':
                return `📈 Active Deals (${activeDealCount})`;
            case 'completed':
                return `✅ Completed Deals (${completedDealCount})`;
            case 'properties':
                return `🏠 My Listed Properties (${properties.length})`;
            case 'total':
                return `📊 Total Deals (${deals.length})`;
            default:
                return 'Dashboard Overview'; // Fallback title
        }
    };

    // Render loading state
    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⏳</div>
                    <p>Loading Agent Dashboard...</p>
                </div>
            </div>
        );
    }

    // Main component render
    return (
        <div style={styles.container}>
            {/* Dashboard Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>📊 Agent Dashboard</h1>
                <p style={styles.subtitle}>Welcome, {user?.firstName}! Manage your deals and properties.</p>
            </div>

            {/* Display error message if any */}
            {error && <div style={styles.error}>❌ {error}</div>}

            {/* Statistics Grid - Clickable cards to switch tabs */}
            <div style={styles.statsGrid}>
                <div
                    style={{...styles.statCard, border: filterTab === 'pending' ? '2px solid #f59e0b' : '1px solid #e5e7eb'}}
                    onClick={() => setFilterTab('pending')}
                >
                    <div style={styles.statIcon}>🔔</div>
                    <div style={styles.statLabel}>Pending Requests</div>
                    <div style={{...styles.statValue, color: '#f59e0b'}}>{pendingRequests.length}</div>
                </div>
                <div
                    style={{...styles.statCard, border: filterTab === 'active' ? '2px solid #3b82f6' : '1px solid #e5e7eb'}}
                    onClick={() => setFilterTab('active')}
                >
                    <div style={styles.statIcon}>📈</div>
                    <div style={styles.statLabel}>Active Deals</div>
                    <div style={styles.statValue}>{activeDealCount}</div>
                </div>
                <div
                    style={{...styles.statCard, border: filterTab === 'completed' ? '2px solid #22c55e' : '1px solid #e5e7eb'}}
                    onClick={() => setFilterTab('completed')}
                >
                    <div style={styles.statIcon}>✅</div>
                    <div style={styles.statLabel}>Completed Deals</div>
                    <div style={styles.statValue}>{completedDealCount}</div>
                </div>
                <div
                    style={{...styles.statCard, border: filterTab === 'properties' ? '2px solid #6b7280' : '1px solid #e5e7eb'}}
                    onClick={() => setFilterTab('properties')}
                >
                    <div style={styles.statIcon}>🏠</div>
                    <div style={styles.statLabel}>My Properties</div>
                    <div style={styles.statValue}>{properties.length}</div>
                </div>
            </div>

            {/* Button to initiate creating a new deal */}
            <div style={styles.createDealSection}>
                <span>Ready to close a new deal? Select a property first.</span>
                 <button onClick={handleCreateDealClick} style={styles.newDealBtn}>
                     ➕ Create New Deal
                 </button>
            </div>

            {/* Main Content Section with Tabs */}
            <div style={styles.section}>
                {/* Tab Navigation Buttons */}
                <div style={styles.tabContainer}>
                    <button
                        onClick={() => setFilterTab('pending')}
                        style={{
                            ...styles.tab,
                            ...(filterTab === 'pending' ? styles.activeTab : {}),
                            backgroundColor: filterTab === 'pending' ? '#f59e0b' : '#f8fafc', // Amber background for active pending
                            color: filterTab === 'pending' ? 'white' : '#64748b'
                        }}
                    >
                        🔔 Pending ({pendingRequests.length})
                    </button>
                    <button
                        onClick={() => setFilterTab('active')}
                        style={{
                            ...styles.tab,
                            ...(filterTab === 'active' ? styles.activeTab : {}) // Default blue for active
                        }}
                    >
                        📈 Active ({activeDealCount})
                    </button>
                    <button
                        onClick={() => setFilterTab('completed')}
                        style={{
                            ...styles.tab,
                            ...(filterTab === 'completed' ? styles.activeTab : {}),
                            backgroundColor: filterTab === 'completed' ? '#22c55e' : '#f8fafc', // Green background for active completed
                            color: filterTab === 'completed' ? 'white' : '#64748b'
                        }}
                    >
                        ✅ Completed ({completedDealCount})
                    </button>
                    <button
                        onClick={() => setFilterTab('properties')}
                        style={{
                            ...styles.tab,
                            ...(filterTab === 'properties' ? styles.activeTab : {}),
                             backgroundColor: filterTab === 'properties' ? '#6b7280' : '#f8fafc', // Gray background for active properties
                            color: filterTab === 'properties' ? 'white' : '#64748b'
                        }}
                    >
                        🏠 My Properties ({properties.length})
                    </button>
                    <button
                        onClick={() => setFilterTab('total')}
                        style={{
                            ...styles.tab,
                            ...(filterTab === 'total' ? styles.activeTab : {}) // Default blue for active total
                        }}
                    >
                        📊 Total Deals ({deals.length})
                    </button>
                </div>

                {/* Section Title based on active tab */}
                <h2 style={styles.sectionTitle}>
                    {getSectionTitle()}
                </h2>

                {/* Conditional Rendering based on active tab */}

                {/* View for Pending Price Requests */}
                {filterTab === 'pending' ? (
                    pendingRequests.length > 0 ? (
                        <div style={styles.dealsGrid}>
                            {pendingRequests.map(req => (
                                <div key={req.id} style={{...styles.dealCard, border: '2px solid #fcd34d', backgroundColor: '#fffbeb'}}>
                                    <div style={{...styles.stageBadge, backgroundColor: '#f59e0b'}}>
                                        PENDING REQUEST
                                    </div>
                                    <h3 style={styles.dealTitle} onClick={() => navigate(`/property/${req.property?.id}`)} title={req.property?.title || `Property ID: ${req.propertyId}`}>
                                        {req.property?.title || `Property ID: ${req.propertyId}`}
                                    </h3>
                                    <div style={styles.dealMeta}>
                                        <p style={styles.metaItem}>
                                            👤 Buyer: {req.buyer?.firstName || `ID: ${req.userId}`} {req.buyer?.lastName || ''}
                                        </p>
                                        <p style={styles.metaItem}>
                                            💰 Offered Price: ₹{req.interestedPrice?.toLocaleString('en-IN') || 'N/A'}
                                        </p>
                                        <p style={styles.metaItem}>
                                            📅 Requested on: {new Date(req.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAcceptRequest(req.id)}
                                        style={{...styles.viewDealBtn, backgroundColor: '#16a34a', fontSize: '15px', marginTop: '12px'}}
                                    >
                                        ✔ Accept & Create Deal
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            <p>👍 No pending price requests. Good job!</p>
                        </div>
                    )
                )

                /* View for Active, Completed, or Total Deals */
                : (filterTab === 'active' || filterTab === 'completed' || filterTab === 'total') ? (
                    displayedDeals.length > 0 ? (
                        <div style={styles.dealsGrid}>
                            {displayedDeals.map(deal => {
                                const progress = getProgressPercentage(deal.stage);
                                return (
                                <div key={deal.id || deal.dealId} style={styles.dealCard}>
                                    <div style={{...styles.stageBadge, backgroundColor: getStageColor(deal.stage)}}>
                                        {deal.stage || 'N/A'}
                                    </div>
                                    <h3 style={styles.dealTitle} onClick={() => navigate(`/property/${deal.property?.id}`)} title={deal.property?.title || `Property ID: ${deal.propertyId}`}>
                                        {deal.property?.title || `Property ID: ${deal.propertyId}`}
                                    </h3>
                                    <div style={styles.dealMeta}>
                                       <p style={styles.metaItem}><strong>Buyer:</strong> {deal.buyer?.firstName || 'N/A'} {deal.buyer?.lastName || ''}</p>
                                       <p style={styles.metaItem}><strong>Prop. Price:</strong> ₹{deal.property?.price?.toLocaleString('en-IN') || 'N/A'}</p>
                                       {deal.agreedPrice && <p style={styles.metaItem}><strong>Agreed:</strong> ₹{deal.agreedPrice?.toLocaleString('en-IN')}</p>}
                                       <p style={styles.metaItem}><strong>Created:</strong> {new Date(deal.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div style={styles.progressBar}>
                                        <div style={{...styles.progressFill, width: `${progress}%`, backgroundColor: getStageColor(deal.stage)}}></div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDeal(deal)}
                                        style={styles.viewDealBtn}
                                    >
                                        📋 View & Manage Deal
                                    </button>
                                </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            <p>
                                {filterTab === 'active'
                                ? '📭 No active deals yet. Create one to get started!'
                                : filterTab === 'completed'
                                ? '📭 No completed deals yet.'
                                : '📭 No deals found.'}
                            </p>
                        </div>
                    )
                )

                /* View for My Listed Properties */
                : ( filterTab === 'properties' ? (
                    properties.length > 0 ? (
                        <div style={styles.dealsGrid}>
                           {properties.map(prop => (
                               <div key={prop.id || prop.propertyId} style={styles.propertyCard} onClick={() => navigate(`/property/${prop.id || prop.propertyId}`)}>
                                   <img
                                       src={prop.imageUrl || 'https://via.placeholder.com/300x180.png?text=No+Image'}
                                       alt={prop.title}
                                       style={styles.propertyImage}
                                   />
                                   <div style={{ padding: '12px' }}>
                                       <h4 style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={prop.title}>{prop.title}</h4>
                                       <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0' }}>📍 {prop.city || 'N/A'}</p>
                                       <p style={{ fontSize: '14px', color: '#3b82f6', fontWeight: '700', margin: '8px 0 0 0' }}>₹{prop.price?.toLocaleString('en-IN') || 'Price on Request'}</p>
                                   </div>
                               </div>
                           ))}
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            <p>🏠 You haven't listed any properties yet.</p>
                             <button onClick={() => navigate('/add-property')} style={{...styles.newDealBtn, marginTop: '20px'}}>+ Add New Property</button>
                        </div>
                    )
                  )
                  // Fallback for any unexpected tab value
                  : (<div style={styles.emptyState}><p>Select a tab to view details.</p></div>)
                )}
            </div>

            {/* Modal for Browsing Properties to Create a Deal */}
            {showCreateDeal && (
                <BrowsePropertiesForDeal
                    onClose={() => {
                        setShowCreateDeal(false);
                    }}
                    onDealCreated={() => {
                        setShowCreateDeal(false);
                        fetchAgentData(); // Refresh data after creating deal
                        setFilterTab('active'); // Switch to active deals tab
                    }}
                />
            )}

            {/* Modal for Viewing/Managing an Existing Deal */}
            {selectedDeal && (
                <DealDetailModal
                    deal={selectedDeal}
                    onClose={() => setSelectedDeal(null)}
                    onUpdate={() => {
                        setSelectedDeal(null);
                        fetchAgentData(); // Refresh data after updating deal
                    }}
                    userRole={user?.role} // Pass user role safely
                />
            )}
        </div>
    );
};

// Helper functions (Added safety checks)
const getStageColor = (stage) => {
    const colors = {
        'INQUIRY': '#3b82f6',     // Blue
        'SHORTLIST': '#8b5cf6',   // Purple
        'NEGOTIATION': '#f59e0b', // Amber
        'AGREEMENT': '#10b981',   // Emerald
        'REGISTRATION': '#06b6d4', // Cyan
        'PAYMENT': '#ec4899',     // Pink
        'COMPLETED': '#22c55e',   // Green
    };
    // Ensure stage is uppercase and handle null/undefined
    return colors[stage?.toUpperCase()] || '#6b7280'; // Gray for unknown
};

const getProgressPercentage = (stage) => {
    const stages = ['INQUIRY', 'SHORTLIST', 'NEGOTIATION', 'AGREEMENT', 'REGISTRATION', 'PAYMENT', 'COMPLETED'];
    // Ensure stage is uppercase and handle null/undefined safely
    const index = stages.indexOf(stage?.toUpperCase());
    if (index === -1) return 0; // Default to 0 if stage is not found or invalid
    return ((index + 1) / stages.length) * 100;
};


// Styles object
const styles = {
    container: {
        maxWidth: 1400,
        margin: '0 auto',
        padding: '24px 32px',
        minHeight: '80vh',
        backgroundColor: '#f9fafb' // Light gray background
    },
    header: {
        marginBottom: '32px',
        paddingBottom: '24px',
        borderBottom: '2px solid #e5e7eb' // Light border
    },
    title: {
        fontSize: '36px',
        fontWeight: '800', // Extra bold
        color: '#1e293b', // Dark blue-gray
        margin: 0,
        marginBottom: '8px'
    },
    subtitle: {
        fontSize: '16px',
        color: '#64748b', // Medium gray
        fontWeight: '500',
        margin: 0
    },
    error: {
        backgroundColor: '#fee2e2', // Light red background
        color: '#dc2626', // Dark red text
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #fca5a5' // Light red border
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', // Responsive grid
        gap: '20px', // Increased gap
        marginBottom: '32px'
    },
    statCard: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px', // More rounded corners
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)', // Subtle shadow
        textAlign: 'center',
        border: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out' // Smooth transition
        // Hover effect needs CSS or libraries like styled-components
    },
    statIcon: {
        fontSize: '36px', // Larger icon
        marginBottom: '12px'
    },
    statLabel: {
        fontSize: '14px',
        color: '#64748b',
        marginBottom: '8px',
        fontWeight: '500' // Medium weight
    },
    statValue: {
        fontSize: '30px', // Larger value
        fontWeight: '700', // Bold
        color: '#1e293b'
    },
    createDealSection: {
        padding: '16px 24px',
        backgroundColor: '#eff6ff', // Lighter blue background
        borderRadius: '12px',
        border: '1px solid #bfdbfe', // Light blue border
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '15px',
        color: '#1e40af', // Darker blue text
        fontWeight: '500'
    },
    newDealBtn: {
        padding: '10px 20px',
        backgroundColor: '#3b82f6', // Primary blue
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        whiteSpace: 'nowrap',
        marginLeft: '16px',
        transition: 'background 0.2s, transform 0.1s ease-out',
        boxShadow: '0 1px 3px rgba(59, 130, 246, 0.3)' // Softer shadow
        // Hover/active effects would ideally be in CSS
    },
    section: {
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '32px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)' // Subtle shadow
    },
    tabContainer: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb',
        flexWrap: 'wrap' // Allow tabs to wrap on smaller screens
    },
    tab: {
        padding: '12px 20px',
        background: '#f8fafc', // Very light gray background
        color: '#475569', // Darker gray text
        border: '1px solid #e2e8f0',
        borderRadius: '8px', // More rounded tabs
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.2s'
    },
    activeTab: {
        // Default active tab style (overridden by specific tab styles below)
        backgroundColor: '#3b82f6',
        color: 'white',
        borderColor: '#3b82f6'
    },
    sectionTitle: {
        fontSize: '22px', // Slightly larger section title
        fontWeight: '700',
        color: '#111827', // Almost black
        margin: '0 0 24px 0', // Increased bottom margin
    },
    dealsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', // Responsive grid for deals/props
        gap: '24px' // Increased gap
    },
    dealCard: {
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 3px 6px rgba(0,0,0,0.07)', // Slightly more shadow
        display: 'flex',
        flexDirection: 'column'
    },
    stageBadge: {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '16px', // Pill shape
        color: 'white',
        fontSize: '11px', // Smaller text
        fontWeight: '700',
        letterSpacing: '0.5px', // Add spacing
        marginBottom: '14px',
        alignSelf: 'flex-start'
    },
    dealTitle: {
        fontSize: '17px',
        fontWeight: '600',
        color: '#1e293b',
        margin: '0 0 14px 0',
        lineHeight: '1.4',
        cursor: 'pointer' // Indicate title is clickable
    },
    dealMeta: {
        fontSize: '14px',
        color: '#475569',
        marginBottom: '16px',
        flexGrow: 1 // Push button to bottom
    },
    metaItem: {
        margin: '6px 0',
        lineHeight: '1.5',
        wordBreak: 'break-word' // Prevent long text overflow
    },
    progressBar: {
        width: '100%',
        height: '8px',
        backgroundColor: '#e2e8f0',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '16px'
    },
    progressFill: {
        height: '100%',
        transition: 'width 0.4s ease-out',
        borderRadius: '4px'
    },
    viewDealBtn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#10b981', // Emerald green
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        transition: 'background 0.2s',
        marginTop: 'auto' // Ensure button is at the bottom
    },
    loading: {
        textAlign: 'center',
        padding: '80px 20px',
        color: '#475569',
        fontSize: '16px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px 20px',
        color: '#64748b',
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px dashed #cbd5e1',
        fontSize: '15px'
    },
    propertyCard: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        boxShadow: '0 3px 6px rgba(0,0,0,0.07)',
        cursor: 'pointer'
        // Hover effect requires CSS
    },
    propertyImage: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
        display: 'block',
        borderBottom: '1px solid #e2e8f0' // Add border below image
    }
};

export default AgentDashboard;