import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import BrowsePropertiesForDeal from "../pages/BrowsePropertiesForDeal.jsx";
import DealDetailModal from "../DealDetailModal.jsx";
import { BACKEND_BASE_URL } from "../config/config";

// --- CONSTANT: Define the Deal Stages and their order ---
const DEAL_STAGES = [
    "INQUIRY",
    "SHORTLIST",
    "NEGOTIATION",
    "AGREEMENT",
    "REGISTRATION",
    "PAYMENT",
    "COMPLETED",
];
// --- END CONSTANT ---

const AgentDashboard = () => {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [deals, setDeals] = useState([]);
    const [properties, setProperties] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateDeal, setShowCreateDeal] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState(null);
    // 'properties' now serves as the key for the Pipeline view (Kanban)
    const [filterTab, setFilterTab] = useState("active");
    const [overviewStats, setOverviewStats] = useState({});

    useEffect(() => {
        if (
            !isAuthenticated ||
            !user ||
            (user.role !== "AGENT" && user.role !== "ADMIN")
        ) {
            console.log("❌ Access Denied: Not an agent or admin");
            navigate("/");
            return;
        }
        console.log("✅ Agent Dashboard: User authenticated and authorized");
        console.log("User Role:", user.role);
        fetchAgentData();
    }, [user, isAuthenticated, navigate]);

    const calculateOverviewStats = (allDeals) => {
        const now = new Date();
        // 7 days ago
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        // Approximately 30 days ago
        const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        // 1 year ago
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        const stats = {
            pastWeek: 0,
            pastMonth: 0,
            pastYear: 0,
        };

        allDeals.forEach(deal => {
            // Assuming deal.createdAt is a valid date string/timestamp
            const dealDate = new Date(deal.createdAt);

            if (dealDate >= oneWeekAgo) {
                stats.pastWeek += 1;
            }
            if (dealDate >= oneMonthAgo) {
                stats.pastMonth += 1;
            }
            if (dealDate >= oneYearAgo) {
                stats.pastYear += 1;
            }
        });

        setOverviewStats(stats);
    };

    const fetchAgentData = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            console.log("📥 Fetching agent data for user:", user.id);

            // Fetch deals
            const dealsRes = await fetch(
                `${BACKEND_BASE_URL}/api/deals/agent/${user.id}`,
                { headers }
            );

            if (dealsRes.ok) {
                const responseData = await dealsRes.json();
                let dealsList = [];
                if (Array.isArray(responseData)) {
                    dealsList = responseData;
                } else if (responseData.success && Array.isArray(responseData.data)) {
                    dealsList = responseData.data;
                } else if (responseData.data && Array.isArray(responseData.data)) {
                    dealsList = responseData.data;
                }

                console.log("✅ Deals loaded:", dealsList.length);
                setDeals(dealsList);
                calculateOverviewStats(dealsList);
            } else {
                console.error("❌ Deals response not ok:", dealsRes.status);
                setError("Failed to load deals");
                setDeals([]);
            }

            // Fetch properties
            const propsRes = await fetch(
                `${BACKEND_BASE_URL}/api/agents/${user.id}/all-properties`,
                { headers }
            ).catch(() => ({ ok: false }));

            if (propsRes.ok) {
                const data = await propsRes.json();
                setProperties(
                    data.success ? data.data : Array.isArray(data) ? data : []
                );
            } else {
                console.log("⚠️ Properties endpoint failed");
                setProperties([]);
            }

            // Fetch stats
            const statsRes = await fetch(
                `${BACKEND_BASE_URL}/api/agents/${user.id}/stats`,
                { headers }
            ).catch(() => ({ ok: false }));

            if (statsRes.ok) {
                const data = await statsRes.json();
                setStats(data.success ? data.data : {});
            } else {
                console.log("⚠️ Stats endpoint failed");
                setStats({});
            }
        } catch (err) {
            console.error("❌ Error fetching agent data:", err);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDealClick = () => {
        console.log("➕ Opening create deal modal");
        setShowCreateDeal(true);
    };

    const handleCreateAgreementClick = () => {
        console.log("📝 Navigating to create sale agreement page");
        navigate("/sale-agreement");
    };

    // Calculate counts
    const totalDealCount = deals.length;
    const activeDealCount = deals.filter((d) => d.stage !== "COMPLETED").length;
    const completedDealCount = deals.filter(
        (d) => d.stage === "COMPLETED"
    ).length;

    // Success Rate Calculation
    const successRate =
        totalDealCount > 0
            ? ((completedDealCount / totalDealCount) * 100).toFixed(1)
            : "0.0";

    // Filter deals based on active tab
    let displayedDeals =
        filterTab === "active"
            ? deals.filter((d) => d.stage !== "COMPLETED")
            : filterTab === "completed"
                ? deals.filter((d) => d.stage === "COMPLETED")
                : filterTab === "total"
                    ? deals
                    : [];

    // 🎯 REFINED LOGIC: Sort deals by days since creation (highest to lowest)
    // ONLY apply this aging sort to 'active' and 'total' views.
    if (filterTab === "active" || filterTab === "total") {
        displayedDeals.sort((a, b) => {
            const daysA = Math.ceil(
                (new Date() - new Date(a.createdAt)) / (1000 * 60 * 60 * 24)
            );
            const daysB = Math.ceil(
                (new Date() - new Date(b.createdAt)) / (1000 * 60 * 60 * 24)
            );
            // Sort descending: daysB - daysA
            return daysB - daysA;
        });
    }

    // Get section title
    const getSectionTitle = () => {
        switch (filterTab) {
            case "active":
                return `📈 Active Deals (${activeDealCount})`;
            // Pipeline Title
            case "properties":
                return `🏗️ Sales Pipeline View (${activeDealCount})`;
            case "completed":
                return `✅ Completed Deals (${completedDealCount})`;
            case "total":
                return `📊 Total Deals (${deals.length})`;
            case "overview":
                return `⏳ Deal Creation Overview`;
            default:
                return "Deals";
        }
    };

    // HANDLER: Function to handle dragging a deal to a new stage (simulated)
    const handleStageChange = (dealId, newStage) => {
        console.log(`Attempting to move Deal ${dealId} to stage: ${newStage}`);
        // --- Local State Update (Temporary for demo) ---
        setDeals(prevDeals => prevDeals.map(d =>
            d.id === dealId || d.dealId === dealId ? { ...d, stage: newStage } : d
        ));
        // --- End Local State Update ---
    };

    if (!isAuthenticated) {
        return (
            <div style={styles.container}>
                <h2>Please log in</h2>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loading}>
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
                    <h3>Loading dashboard...</h3>
                </div>
            </div>
        );
    }

    // --- Kanban View Renderer Component ---
    const KanbanView = () => {
        // Filter out completed deals for the pipeline view
        const pipelineDeals = deals.filter(d => d.stage !== "COMPLETED");

        // Stages to show in the Kanban board (excluding 'COMPLETED')
        const kanbanStages = DEAL_STAGES.filter(stage => stage !== "COMPLETED");

        // Kanban deals should also be sorted by age for consistency and urgency
        pipelineDeals.sort((a, b) => {
            const daysA = Math.ceil((new Date() - new Date(a.createdAt)) / (1000 * 60 * 60 * 24));
            const daysB = Math.ceil((new Date() - new Date(b.createdAt)) / (1000 * 60 * 60 * 24));
            return daysB - daysA;
        });


        return (
            <div style={styles.kanbanContainer}>
                {kanbanStages.map(stage => {
                    const dealsInStage = pipelineDeals.filter(deal => deal.stage === stage);

                    return (
                        // Kanban Column
                        <div key={stage} style={styles.kanbanColumn}>
                            <h3 style={{ ...styles.kanbanColumnTitle, backgroundColor: getStageColor(stage) }}>
                                {stage} ({dealsInStage.length})
                            </h3>

                            <div style={styles.kanbanColumnCards}>
                                {dealsInStage.length > 0 ? (
                                    dealsInStage.map(deal => {
                                        const { isStale, warningMessage, daysStale } = getDealPriority(deal);
                                        const daysSinceStart = Math.ceil(
                                            (new Date() - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24)
                                        );

                                        // Kanban Deal Card
                                        return (
                                            <div
                                                key={deal.id || deal.dealId}
                                                style={{
                                                    ...styles.dealCard,
                                                    padding: '12px',
                                                    marginBottom: '12px',
                                                    border: isStale ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => setSelectedDeal(deal)}
                                            >
                                                {/* Priority Alert Badge */}
                                                {isStale && (
                                                    <div style={{ ...styles.priorityBadge, marginBottom: '6px', padding: '4px 8px' }}>
                                                        🛑 {warningMessage}
                                                    </div>
                                                )}

                                                {/* Days Since Start Badge */}
                                                <div style={{
                                                    display: 'block', // Use block for better spacing in Kanban card
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    backgroundColor: '#e5e7eb',
                                                    color: '#4b5563',
                                                    fontSize: '11px',
                                                    fontWeight: '600',
                                                    marginBottom: '8px',
                                                    textAlign: 'center'
                                                }}>
                                                    ⏳ Started: {daysSinceStart} days ago
                                                </div>

                                                {/* Title & Price */}
                                                <h4 style={{ ...styles.dealTitle, fontSize: '14px', margin: '0 0 8px 0' }}>
                                                    {deal.property?.title || "Property"}
                                                </h4>

                                                <div style={{ ...styles.dealMeta, marginBottom: '8px' }}>
                                                    <p style={{ ...styles.metaItem, margin: 0 }}>
                                                        💰 ₹{
                                                            // Show agreed price first, then property price, then 'N/A'
                                                            (deal.agreedPrice || deal.property?.price)?.toLocaleString("en-IN") || 'N/A'
                                                        }
                                                    </p>
                                                    <p style={{ ...styles.metaItem, margin: '2px 0 0 0' }}>
                                                        📍 {deal.property?.city || "Location"}
                                                    </p>
                                                </div>

                                                {/* Action Button (Simplified for Kanban) */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const nextIndex = DEAL_STAGES.indexOf(deal.stage) + 1;
                                                        if (nextIndex < DEAL_STAGES.length) {
                                                            handleStageChange(deal.id || deal.dealId, DEAL_STAGES[nextIndex]);
                                                        } else {
                                                            setSelectedDeal(deal);
                                                        }
                                                    }}
                                                    style={{
                                                        ...styles.viewDealBtn,
                                                        padding: '6px',
                                                        fontSize: '12px',
                                                        backgroundColor: isStale ? '#ef4444' : '#10b981',
                                                    }}
                                                >
                                                    {isStale ? `Urgent Action (${daysStale} days)` : 'View Details'}
                                                </button>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={styles.kanbanEmpty}>
                                        No deals in this stage.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };
    // --- END Kanban View Renderer Component ---


    return (
        <div style={styles.container}>
            <div style={styles.header}>

                <div style={styles.headerContainer}>
                    {/* Left side: Title and Subtitle */}
                    <div style={styles.titleGroup}>
                        <h1 style={styles.title}>📊 Agent Dashboard</h1>
                        <p style={styles.subtitle}>Manage your deals and properties</p>
                    </div>

                    {/* Right Corner: Success Rate Card */}
                    <div style={{
                        ...styles.statCardSmall,
                        backgroundColor: '#dcfce7',
                        borderColor: '#bbf7d0',
                        cursor: 'default',
                    }}>
                        <div style={styles.statIconSmall}>🏆</div>
                        <div style={{ ...styles.statLabelSmall, color: '#15803d' }}>Success Rate</div>
                        <div style={{ ...styles.statValueSmall, color: '#15803d' }}>{successRate}%</div>
                    </div>
                </div>

                {/* Horizontal line for separation */}
                <div style={styles.headerDivider} />
            </div>

            {error && <div style={styles.error}>❌ {error}</div>}

            {/* Stats Grid */}
            <div style={styles.statsGrid}>

                {/* ACTIVE DEALS */}
                <div style={styles.statCard} onClick={() => setFilterTab("active")}>
                    <div style={styles.statIcon}>📈</div>
                    <div style={styles.statLabel}>Active Deals</div>
                    <div style={styles.statValue}>{activeDealCount}</div>
                </div>

                {/* PIPELINE VIEW (using 'properties' key) */}
                <div style={styles.statCard} onClick={() => setFilterTab("properties")}>
                    <div style={styles.statIcon}>🏗️</div>
                    <div style={styles.statLabel}>Sales Pipeline</div>
                    <div style={styles.statValue}>{activeDealCount}</div>
                </div>

                {/* COMPLETED DEALS */}
                <div style={styles.statCard} onClick={() => setFilterTab("completed")}>
                    <div style={styles.statIcon}>✅</div>
                    <div style={styles.statLabel}>Completed Deals</div>
                    <div style={styles.statValue}>{completedDealCount}</div>
                </div>

                {/* MANAGED PROPERTIES (card links to 'total' deals for now) */}
                <div style={styles.statCard} onClick={() => setFilterTab("total")}>
                    <div style={styles.statIcon}>🏠</div>
                    <div style={styles.statLabel}>Managed Properties</div>
                    <div style={styles.statValue}>{properties.length}</div>
                </div>

                {/* OVERVIEW STAT CARD */}
                <div
                    style={{ ...styles.statCard, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
                    onClick={() => setFilterTab("overview")}
                >
                    <div style={styles.statIcon}>🗓️</div>
                    <div style={{ ...styles.statLabel, color: '#1e40af' }}>Deals Overview</div>
                    <div style={{ ...styles.statValue, color: '#1e40af' }}>{totalDealCount}</div>
                </div>
                {/* END OVERVIEW STAT CARD */}
            </div>

            {/* Action Section Grid */}
            <div style={styles.actionSectionGrid}>
                {/* COLUMN 1: Create New Deal */}
                <div style={{ ...styles.actionCard, borderColor: '#bfdbfe' }}>
                    <div>
                        <div style={styles.actionTitlePrimary}>
                            ➕ Create New Deal
                        </div>
                        <div style={styles.actionSubtitle}>
                            Start a new sales process by linking a buyer to a property.
                        </div>
                    </div>
                    <button onClick={handleCreateDealClick} style={styles.newDealBtn}>
                        + New Deal
                    </button>
                </div>

                {/* COLUMN 2: Create Sale Agreement */}
                <div style={{ ...styles.actionCard, borderColor: '#fbcfe8' }}>
                    <div>
                        <div style={styles.actionTitleSecondary}>
                            📝 Create Sale Agreement
                        </div>
                        <div style={styles.actionSubtitle}>
                            Draft the formal legal agreement for a property sale.
                        </div>
                    </div>
                    <button onClick={handleCreateAgreementClick} style={styles.createAgreementBtn}>
                        Sale Agreement
                    </button>
                </div>
            </div>
            {/* END Action Section Grid */}

            {/* Deals Section with Tabs */}
            <div style={styles.section}>
                {/* Tab Navigation */}
                <div style={styles.tabContainer}>
                    <button
                        onClick={() => setFilterTab("active")}
                        style={{
                            ...styles.tab,
                            ...(filterTab === "active" ? styles.activeTab : {}),
                        }}
                    >
                        📈 Active Deals ({activeDealCount})
                    </button>
                    {/* Pipeline Tab Button */}
                    <button
                        onClick={() => setFilterTab("properties")}
                        style={{
                            ...styles.tab,
                            ...(filterTab === "properties" ? styles.activeTab : {}),
                        }}
                    >
                        🏗️ Sales Pipeline
                    </button>
                    <button
                        onClick={() => setFilterTab("completed")}
                        style={{
                            ...styles.tab,
                            ...(filterTab === "completed" ? styles.activeTab : {}),
                        }}
                    >
                        ✅ Completed Deals ({completedDealCount})
                    </button>
                    <button
                        onClick={() => setFilterTab("total")}
                        style={{
                            ...styles.tab,
                            ...(filterTab === "total" ? styles.activeTab : {}),
                        }}
                    >
                        📊 Total Deals ({deals.length})
                    </button>
                    {/* Overview Tab Button */}
                    <button
                        onClick={() => setFilterTab("overview")}
                        style={{
                            ...styles.tab,
                            ...(filterTab === "overview" ? styles.activeTab : {}),
                        }}
                    >
                        ⏳ Overview
                    </button>
                </div>

                <h2 style={styles.sectionTitle}>{getSectionTitle()}</h2>

                {/* --- DYNAMIC CONTENT BASED ON FILTER TAB --- */}
                {filterTab === "overview" ? (
                    /* Overview Stats View (Updated to use provided styles) */
                    <div style={styles.dealsGrid}>
                        <div style={styles.overviewCard}>
                            <h3 style={styles.overviewTitle}>Last 7 Days</h3>
                            <div style={styles.overviewValue}>{overviewStats.pastWeek}</div>
                            <p style={styles.overviewLabel}>deals created</p>
                        </div>
                        <div style={styles.overviewCard}>
                            <h3 style={styles.overviewTitle}>Last 30 Days</h3>
                            <div style={styles.overviewValue}>{overviewStats.pastMonth}</div>
                            <p style={styles.overviewLabel}>deals created</p>
                        </div>
                        <div style={styles.overviewCard}>
                            <h3 style={styles.overviewTitle}>Last 1 Year</h3>
                            <div style={styles.overviewValue}>{overviewStats.pastYear}</div>
                            <p style={styles.overviewLabel}>deals created</p>
                        </div>
                        <div style={styles.overviewCardTotal}>
                            <h3 style={styles.overviewTitleTotal}>Total Deals Handled</h3>
                            <div style={styles.overviewValueTotal}>{deals.length}</div>
                        </div>
                    </div>
                ) : filterTab === "properties" ? (
                    /* Kanban Pipeline View */
                    activeDealCount > 0 ? (
                        <KanbanView />
                    ) : (
                        <div style={styles.emptyState}>
                            <p>🏗️ Your pipeline is empty! Time to create some new deals.</p>
                        </div>
                    )
                ) : (
                    /* Active, Completed, or Total Deals View (List) */
                    displayedDeals.length > 0 ? (
                        <div style={styles.dealsGrid}>
                            {displayedDeals.map((deal) => {
                                // Calculate Priority Status and Days Stale
                                const { isStale, warningMessage, daysStale } = getDealPriority(deal);

                                // Calculate days since start (Used only if not completed)
                                const daysSinceStart = Math.ceil(
                                    (new Date() - new Date(deal.createdAt)) / (1000 * 60 * 60 * 24)
                                );

                                return (
                                    <div key={deal.id || deal.dealId} style={{ ...styles.dealCard, border: isStale ? '2px solid #ef4444' : '1px solid #e2e8f0' }}>

                                        {/* Priority Alert Badge (Only for active/stale deals) */}
                                        {isStale && (
                                            <div style={styles.priorityBadge}>
                                                🛑 {warningMessage} ({daysStale} days)
                                            </div>
                                        )}

                                        {/* Stage Badge */}
                                        <div
                                            style={{
                                                ...styles.stageBadge,
                                                backgroundColor: getStageColor(deal.stage),
                                                marginBottom: '8px',
                                                // Adjust margin to align with date/timeline badge
                                                marginRight: deal.stage !== "COMPLETED" ? '8px' : '0',
                                            }}
                                        >
                                            {deal.stage}
                                        </div>

                                        {/* Days Since Start Display - HIDDEN FOR COMPLETED DEALS */}
                                        {deal.stage !== "COMPLETED" && (
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                backgroundColor: '#f1f5f9', // Light gray background
                                                color: '#4b5563',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                            }}>
                                                ⏳ Started: {daysSinceStart} days ago
                                            </div>
                                        )}

                                        {/* Completed On Date Display - SHOWN ONLY FOR COMPLETED DEALS */}
                                        {deal.stage === "COMPLETED" && (
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                backgroundColor: '#dcfce7', // Light Green
                                                color: '#15803d', // Dark Green
                                                fontSize: '12px',
                                                fontWeight: '600',
                                            }}>
                                                ✅ Completed On: {new Date(deal.updatedAt || deal.createdAt).toLocaleDateString()}
                                            </div>
                                        )}


                                        {/* Deal Info */}
                                        <h3 style={styles.dealTitle}>
                                            {deal.property?.title || "Property"}
                                        </h3>

                                        <div style={styles.dealMeta}>
                                            <p style={styles.metaItem}>
                                                📍 {deal.property?.city || "Location"}
                                            </p>
                                            <p style={styles.metaItem}>
                                                👤 Buyer: {deal.buyer?.firstName || "N/A"}{" "}
                                                {deal.buyer?.lastName || ""}
                                            </p>
                                            {deal.agreedPrice && (
                                                <p style={styles.metaItem}>
                                                    💰 ₹{deal.agreedPrice.toLocaleString("en-IN")}
                                                </p>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        <div style={styles.progressBar}>
                                            <div
                                                style={{
                                                    ...styles.progressFill,
                                                    width: `${getProgressPercentage(deal.stage)}%`,
                                                    backgroundColor: getStageColor(deal.stage),
                                                }}
                                            />
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => setSelectedDeal(deal)}
                                            style={styles.viewDealBtn}
                                        >
                                            📋 View Deal
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={styles.emptyState}>
                            <p>
                                {filterTab === "active"
                                    ? "📭 No active deals yet. Create one to get started!"
                                    : filterTab === "completed"
                                        ? "📭 No completed deals yet."
                                        : "📭 No deals found."}
                            </p>
                        </div>
                    )
                )}
            </div>

            {/* Modals (unchanged) */}
            {showCreateDeal && (
                <BrowsePropertiesForDeal
                    onClose={() => {
                        console.log("Closing modal");
                        setShowCreateDeal(false);
                    }}
                    onDealCreated={() => {
                        console.log("Deal created");
                        setShowCreateDeal(false);
                        fetchAgentData();
                    }}
                />
            )}

            {selectedDeal && (
                <DealDetailModal
                    deal={selectedDeal}
                    onClose={() => setSelectedDeal(null)}
                    onUpdate={() => {
                        setSelectedDeal(null);
                        fetchAgentData();
                    }}
                    userRole={user.role}
                />
            )}
        </div>
    );
};

// HELPER FUNCTION: Calculates deal priority based on age and stage
const getDealPriority = (deal) => {
    // 🎯 MODIFICATION: Immediately return non-stale for completed deals.
    if (deal.stage === "COMPLETED") {
        return {
            isStale: false,
            warningMessage: null,
            daysStale: 0,
        };
    }

    const lastMovementDate = new Date(deal.updatedAt || deal.createdAt);
    const now = new Date();

    const diffTime = Math.abs(now - lastMovementDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const stageThresholds = {
        INQUIRY: { days: 10, message: "Urgent: Initial Follow-up" },
        SHORTLIST: { days: 15, message: "Stale: Buyer Needs Nudging" },
        NEGOTIATION: { days: 30, message: "Critical: Negotiation Stalled" },
        AGREEMENT: { days: 45, message: "Critical: Agreement Pending" },
        REGISTRATION: { days: 60, message: "Critical: Registration Delay" },
        PAYMENT: { days: 7, message: "Critical: Payment Overdue" },
        // COMPLETED is excluded from the check
    };

    const threshold = stageThresholds[deal.stage];

    if (threshold && diffDays > threshold.days) {
        return {
            isStale: true,
            warningMessage: threshold.message,
            daysStale: diffDays,
        };
    }

    return {
        isStale: false,
        warningMessage: null,
        daysStale: diffDays,
    };
};

// Helper functions
const getStageColor = (stage) => {
    const colors = {
        INQUIRY: "#3b82f6",
        SHORTLIST: "#8b5cf6",
        NEGOTIATION: "#f59e0b",
        AGREEMENT: "#10b981",
        REGISTRATION: "#06b6d4",
        PAYMENT: "#ec4899",
        COMPLETED: "#22c55e",
    };
    return colors[stage] || "#6b7280";
};

const getProgressPercentage = (stage) => {
    const index = DEAL_STAGES.indexOf(stage);
    // Calculate percentage based on 6 active stages (excluding COMPLETED)
    return ((index + 1) / (DEAL_STAGES.length - 1)) * 100;
};

// --- STYLES (Retained and fixed) ---
const styles = {
    container: {
        maxWidth: 1700,
        margin: "0 auto",
        padding: "24px 32px",
        minHeight: "80vh",
        backgroundColor: "#f9fafb",
        marginTop: "10px",
    },
    header: {
        marginBottom: "32px",
    },
    headerContainer: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "16px",
    },
    titleGroup: {
        // Keeps title and subtitle together
    },
    headerDivider: {
        borderBottom: "2px solid #e5e7eb",
        marginBottom: "24px",
    },
    title: {
        fontSize: "36px",
        fontWeight: "800",
        color: "#1e293b",
        margin: 0,
        marginBottom: "8px",
    },
    subtitle: {
        fontSize: "16px",
        color: "#64748b",
        fontWeight: "500",
        margin: 0,
    },
    error: {
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "24px",
        border: "1px solid #fca5a5",
    },
    statCardSmall: {
        backgroundColor: "white",
        padding: "16px 20px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        textAlign: "center",
        border: "1px solid #e5e7eb",
        width: "140px",
        flexShrink: 0,
        transition: "all 0.3s ease",
    },
    statIconSmall: {
        fontSize: "24px",
        marginBottom: "8px",
    },
    statLabelSmall: {
        fontSize: "12px",
        color: "#64748b",
        marginBottom: "4px",
        fontWeight: "600",
    },
    statValueSmall: {
        fontSize: "24px",
        fontWeight: "800",
        color: "#1e293b",
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "16px",
        marginBottom: "32px",
    },
    statCard: {
        backgroundColor: "white",
        padding: "24px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        textAlign: "center",
        border: "1px solid #e5e7eb",
        cursor: "pointer",
        transition: "all 0.3s ease",
    },
    statIcon: {
        fontSize: "32px",
        marginBottom: "12px",
    },
    statLabel: {
        fontSize: "14px",
        color: "#64748b",
        marginBottom: "8px",
    },
    statValue: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#1e293b",
    },

    newDealBtn: {
        padding: "10px 20px",
        backgroundColor: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        whiteSpace: "nowrap",
        marginLeft: "12px",
        transition: "background 0.2s, transform 0.2s",
        boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
    },

    actionSectionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
    },
    actionCard: {
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "12px",
        border: "2px solid",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.2s",
    },
    actionTitlePrimary: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#1e40af",
        marginBottom: "4px",
    },
    actionTitleSecondary: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#be185d",
        marginBottom: "4px",
    },
    actionSubtitle: {
        fontSize: "12px",
        color: "#64748b"
    },
    createAgreementBtn: {
        padding: "10px 20px",
        backgroundColor: "#ec4899", // Pink/Red
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        whiteSpace: "nowrap",
        marginLeft: "12px",
        transition: "background 0.2s",
        boxShadow: "0 2px 8px rgba(236, 72, 153, 0.3)",
    },

    section: {
        marginBottom: "40px",
    },
    tabContainer: {
        display: "flex",
        borderBottom: "2px solid #e5e7eb",
        marginBottom: "16px",
    },
    tab: {
        padding: "10px 20px",
        fontSize: "16px",
        fontWeight: "600",
        color: "#6b7280",
        backgroundColor: "transparent",
        border: "none",
        borderBottom: "3px solid transparent",
        cursor: "pointer",
        transition: "color 0.2s, border-bottom 0.2s",
        marginRight: "8px",
        whiteSpace: "nowrap",
    },
    activeTab: {
        color: "#1d4ed8",
        borderBottom: "3px solid #1d4ed8",
    },
    sectionTitle: {
        fontSize: "24px",
        fontWeight: "700",
        color: "#1e293b",
        marginBottom: "20px",
    },
    dealsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "20px",
    },
    dealCard: {
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "transform 0.2s, box-shadow 0.2s",
    },
    priorityBadge: {
        backgroundColor: "#fee2e2",
        color: "#dc2626",
        padding: "6px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700",
        display: "inline-block",
        marginBottom: "12px",
        border: "1px solid #fca5a5",
    },
    stageBadge: {
        color: "white",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "700",
        display: "inline-block",
        textTransform: "uppercase",
    },
    dealTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: "#1e293b",
        margin: "10px 0 8px 0",
        lineHeight: "1.3",
    },
    dealMeta: {
        fontSize: "14px",
        color: "#4b5563",
        marginBottom: "16px",
    },
    metaItem: {
        margin: "4px 0",
        lineHeight: "1.4",
        fontWeight: "500",
    },
    progressBar: {
        height: "8px",
        backgroundColor: "#e5e7eb",
        borderRadius: "4px",
        marginBottom: "16px",
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        transition: "width 0.5s ease",
    },
    viewDealBtn: {
        padding: "10px 16px",
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        marginTop: "auto",
        textAlign: "center",
        transition: "background-color 0.2s",
        fontSize: "14px",
    },
    emptyState: {
        textAlign: "center",
        padding: "40px",
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        gridColumn: "1 / -1", // Span across the entire grid
        fontSize: "16px",
        color: "#6b7280",
    },
    loading: {
        textAlign: "center",
        padding: "80px",
        color: "#1d4ed8",
    },
    overviewCard: {
        backgroundColor: "#f8fafc",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        textAlign: "center",
    },
    overviewCardTotal: {
        backgroundColor: "#1e40af",
        color: "white",
        padding: "24px",
        borderRadius: "12px",
        border: "1px solid #1e40af",
        textAlign: "center",
    },
    overviewTitle: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#4b5563",
        margin: 0,
        marginBottom: "8px",
    },
    overviewTitleTotal: {
        fontSize: "14px",
        fontWeight: "600",
        color: "#bfdbfe",
        margin: 0,
        marginBottom: "8px",
    },
    overviewValue: {
        fontSize: "36px",
        fontWeight: "800",
        color: "#1e293b",
        margin: "4px 0",
    },
    overviewValueTotal: {
        fontSize: "36px",
        fontWeight: "800",
        color: "white",
        margin: "4px 0",
    },
    overviewLabel: {
        fontSize: "12px",
        color: "#9ca3af",
        margin: 0,
    },
    // Kanban Styles
    kanbanContainer: {
        display: 'flex',
        overflowX: 'auto',
        gap: '20px',
        paddingBottom: '10px',
        alignItems: 'flex-start',
    },
    kanbanColumn: {
        minWidth: '300px',
        maxWidth: '300px',
        backgroundColor: '#f3f4f6',
        borderRadius: '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        paddingBottom: '10px',
    },
    kanbanColumnTitle: {
        padding: '12px 16px',
        fontSize: '16px',
        fontWeight: '700',
        color: 'white',
        borderRadius: '12px 12px 0 0',
        margin: 0,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    kanbanColumnCards: {
        padding: '10px',
        minHeight: '100px',
    },
    kanbanEmpty: {
        textAlign: 'center',
        color: '#9ca3af',
        padding: '20px 10px',
        fontSize: '14px',
    }
};

export default AgentDashboard;