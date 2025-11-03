// src/pages/EmiCalculatorPage.jsx

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Recommended DTI limit used by lenders
const DTI_LIMIT = 0.38;
const MAX_LOAN_TENURE = 30; // Maximum tenure in years for pre-qualification

// ===================================
// Define styles globally
// ===================================
const styles = {
    pageContainer: {
        maxWidth: '1200px',
        margin: '3rem auto',
        padding: '0 24px',
        minHeight: '60vh',
        position: 'relative',
    },
    header: {
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#1e293b',
        textAlign: 'center',
        marginBottom: '2rem',
    },
    contentWrapper: {
        // Main container for the 3 columns (2 small, 1 wide)
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px', // Reduced gap for tighter horizontal flow
        justifyContent: 'center', // Center content when there's space
        alignItems: 'stretch', // Ensures all panels have the same height
        margin: '0 auto 40px',
    },
    container: {
        backgroundColor: '#ffffff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        flex: '1 1 48%',
        minWidth: '350px',
        margin: '0',
    },
    fullWidthSection: {
        // Container for the Affordability Check (occupies one row)
        flex: '1 1 100%',
        marginTop: '0',
        padding: '20px 0',
        borderTop: '1px solid #e2e8f0',
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '20px',
        borderBottom: '2px solid #e2e8f0',
        paddingBottom: '10px',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        marginBottom: '5px',
        fontWeight: '600',
        fontSize: '0.9rem',
        color: '#475569',
    },
    input: {
        width: '100%',
        padding: '10px',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        fontSize: '1rem',
        boxSizing: 'border-box',
    },
    resultBox: {
        marginTop: '25px',
        padding: '20px',
        backgroundColor: '#f1f5f9',
        borderRadius: '8px',
    },
    resultItem: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px',
        fontSize: '1rem',
    },
    resultLabel: {
        color: '#475569',
    },
    resultValue: {
        fontWeight: '700',
        color: '#1e293b',
    },
    emiValue: {
        fontSize: '1.6rem',
        fontWeight: '800',
        color: '#10b981',
    },
    chartLegend: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '15px',
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.9rem',
    },
    legendColor: {
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        marginRight: '5px',
    },
    pieContainer: {
        position: 'relative',
        width: '150px',
        height: '150px',
        margin: '0 auto 20px',
        transform: 'rotate(-90deg)',
    },
    circle: {
        transition: 'stroke-dashoffset 0.8s ease-in-out',
    },
    qualificationBox: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#fef3c7',
        borderRadius: '8px',
        border: '1px solid #fde68a',
        color: '#92400e',
        fontWeight: '600',
    },
    successBox: {
        backgroundColor: '#d1fae5',
        border: '1px solid #a7f3d0',
        color: '#065f46',
    },
    autofillButton: {
        marginTop: '10px',
        padding: '8px 15px',
        backgroundColor: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600',
        transition: 'background-color 0.2s',
        display: 'block',
        width: '100%',
    },
    backButton: {
        padding: '8px 15px',
        backgroundColor: '#f1f5f9',
        color: '#475569',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '0.85rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10,
        transition: 'background-color 0.2s, transform 0.2s',
        textDecoration: 'none',
        float: 'right',
        marginLeft: '20px',
    }
};

// ===================================
// Core Calculator Logic Components
// ===================================

const PieChart = ({ principalShare, interestShare }) => {
    if (principalShare + interestShare <= 0.001) {
         return (
             <svg viewBox="0 0 120 120" style={styles.pieContainer}>
                 <circle cx="60" cy="60" r="50" fill="transparent" stroke="#d1d5db" strokeWidth="20" />
                 <text x="60" y="65" textAnchor="middle" fill="#475569" fontSize="12" fontWeight="600" transform="rotate(90 60 60)">
                     No Loan
                 </text>
             </svg>
         );
    }
    const circumference = 2 * Math.PI * 50;
    const principalDash = circumference * principalShare;
    const interestDash = circumference * interestShare;

    return (
        <svg viewBox="0 0 120 120" style={styles.pieContainer}>
            <circle cx="60" cy="60" r="50" fill="transparent" stroke="#f093fb" strokeWidth="20"
                style={styles.circle}
                strokeDasharray={`${interestDash} ${circumference}`}
                strokeDashoffset={circumference}
            />
            <circle
                cx="60" cy="60" r="50" fill="transparent" stroke="#667eea" strokeWidth="20"
                style={styles.circle}
                strokeDasharray={`${principalDash} ${circumference}`}
                strokeDashoffset={0}
            />
            <text x="60" y="65" textAnchor="middle" fill="#1e293b" fontSize="14" fontWeight="600" transform="rotate(90 60 60)">
                Breakdown
            </text>
        </svg>
    );
};

const EmiCalculatorCore = () => {
    // EMI Calculation State
    const [principal, setPrincipal] = useState('');
    const [rate, setRate] = useState('');
    const [years, setYears] = useState('');

    // DTI Calculation State
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [monthlyDebt, setMonthlyDebt] = useState('');

    // Helper to format currency
    const formatCurrency = (amount) => {
        if (amount <= 0 || isNaN(amount) || amount === '') {
            return '₹ 0';
        }
        return Number(amount).toLocaleString('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).replace('₹', '₹ ');
    };

    // ===============================================
    // 1. EMI Calculation Logic
    // ===============================================
    const emiDetails = useMemo(() => {
        const p = Number(principal) || 0;
        const r = Number(rate) || 0;
        const y = Number(years) || 0;

        const monthlyRate = r / 100 / 12;
        const tenureMonths = y * 12;

        const results = { emi: 0, totalPayment: 0, totalInterest: 0, principalShare: 0, interestShare: 0 };

        if (p > 0 && monthlyRate > 0 && tenureMonths > 0) {
            const powerFactor = Math.pow(1 + monthlyRate, tenureMonths);
            const emiValue = p * monthlyRate * powerFactor / (powerFactor - 1);

            const totalPayment = emiValue * tenureMonths;
            const totalInterest = totalPayment - p;
            const total = p + totalInterest;

            results.emi = Math.round(emiValue);
            results.totalPayment = Math.round(totalPayment);
            results.totalInterest = Math.round(totalInterest);
            results.principalShare = p / total;
            results.interestShare = totalInterest / total;
        } else if (p > 0 && r === 0 && y > 0) {
            // 0% interest
            results.emi = Math.round(p / tenureMonths);
            results.totalPayment = p;
            results.principalShare = 1;
            results.interestShare = 0;
        }

        return results;

    }, [principal, rate, years]);

    // ===============================================
    // 2. DTI Pre-Qualification Logic
    // ===============================================
    const dtiDetails = useMemo(() => {
        const income = Number(monthlyIncome) || 0;
        const debt = Number(monthlyDebt) || 0;
        const r = Number(rate) || 0; // Use the same interest rate
        const tenureMonths = MAX_LOAN_TENURE * 12;

        if (income <= 0 || r <= 0) {
            return { maxLoan: 0, maxEmi: 0, dti: 0, status: 'INSUFFICIENT' };
        }

        // 1. Calculate Maximum Allowed Monthly Payment based on DTI limit
        const maxAllowedDebt = income * DTI_LIMIT;
        const maxEmiAllowed = maxAllowedDebt - debt;

        if (maxEmiAllowed <= 0) {
            return { maxLoan: 0, maxEmi: 0, dti: maxAllowedDebt < 0 ? 1 : debt / income, status: 'TOO_MUCH_DEBT' };
        }

        // 2. Reverse EMI Formula to find Principal (Max Loan Amount)
        // P = EMI * [ (1 - (1 + r)^(-n)) / r ]
        const monthlyRate = r / 100 / 12;
        const factor = (1 - Math.pow(1 + monthlyRate, -tenureMonths)) / monthlyRate;
        const maxLoan = maxEmiAllowed * factor;

        const currentDTI = (debt + (maxEmiAllowed > 0 ? maxEmiAllowed : 0)) / income;

        return {
            maxLoan: Math.round(maxLoan),
            maxEmi: Math.round(maxEmiAllowed),
            dti: currentDTI,
            status: currentDTI <= DTI_LIMIT ? 'QUALIFIED' : 'FAILED',
        };

    }, [monthlyIncome, monthlyDebt, rate]);

    // 🎯 NEW HANDLER: Autofills the principal loan amount
    const handleAutoFillPrincipal = (maxLoanAmount) => {
        if (maxLoanAmount > 0) {
            setPrincipal(String(maxLoanAmount));
            if (!years) {
                setYears(String(MAX_LOAN_TENURE));
            }
        }
    };


    return (
        <>
            {/* ----------------- 1. EMI CALCULATOR PANEL ----------------- */}
            <div style={styles.container}>
                <h2 style={styles.title}>Loan Parameters</h2>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Loan Amount (₹)</label>
                    <input
                        type="number"
                        style={styles.input}
                        value={principal}
                        onChange={(e) => setPrincipal(e.target.value)}
                        min="0"
                        placeholder="e.g., 5000000"
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Interest Rate (Annual %)</label>
                    <input
                        type="number"
                        style={styles.input}
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        step="0.05"
                        min="0"
                        placeholder="e.g., 8.5"
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Loan Tenure (Years)</label>
                    <input
                        type="number"
                        style={styles.input}
                        value={years}
                        onChange={(e) => setYears(e.target.value)}
                        min="0"
                        max="30"
                        placeholder="e.g., 20"
                    />
                </div>

                <div style={styles.resultBox}>
                    <h3 style={{...styles.title, marginBottom: '10px'}}>Monthly EMI</h3>
                    <div style={styles.resultItem}>
                        <span style={styles.resultLabel}>Calculated EMI:</span>
                        <span style={styles.emiValue}>{formatCurrency(emiDetails.emi)}</span>
                    </div>
                    <hr style={{margin: '10px 0', border: '0', borderTop: '1px solid #d1d5db'}} />
                    <div style={styles.resultItem}>
                        <span style={styles.resultLabel}>Total Payable Amount:</span>
                        <span style={styles.resultValue}>{formatCurrency(emiDetails.totalPayment)}</span>
                    </div>
                </div>
            </div>

            {/* ----------------- 2. LOAN BREAKDOWN PANEL ----------------- */}
            <div style={styles.container}>
                <h2 style={styles.title}>Loan Breakdown & Visualization</h2>

                <PieChart
                    principalShare={emiDetails.principalShare}
                    interestShare={emiDetails.interestShare}
                />

                <div style={styles.chartLegend}>
                    <div style={styles.legendItem}>
                        <span style={{...styles.legendColor, backgroundColor: '#667eea'}}></span> Principal Share
                    </div>
                    <div style={styles.legendItem}>
                        <span style={{...styles.legendColor, backgroundColor: '#f093fb'}}></span> Interest Share
                    </div>
                </div>

                <div style={styles.resultBox}>
                    <div style={styles.resultItem}>
                        <span style={styles.resultLabel}>Principal Amount:</span>
                        <span style={styles.resultValue}>{formatCurrency(principal || 0)}</span>
                    </div>
                    <div style={styles.resultItem}>
                        <span style={styles.resultLabel}>Total Interest Paid:</span>
                        <span style={styles.resultValue}>{formatCurrency(emiDetails.totalInterest)}</span>
                    </div>
                    <div style={styles.resultItem}>
                        <span style={styles.resultLabel}>Total Tenure:</span>
                        <span style={styles.resultValue}>{(Number(years) || 0) * 12} months</span>
                    </div>
                </div>
            </div>

            {/* ----------------- 3. DTI PRE-QUALIFICATION PANEL (Full Width) ----------------- */}
            <div style={styles.fullWidthSection}>
                <h2 style={{...styles.title, textAlign: 'left', borderBottom: 'none'}}>Max Loan Affordability Check</h2>

                <div style={styles.contentWrapper}>
                    <div style={{flex: '1 1 45%', minWidth: '300px'}}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Gross Monthly Income (₹)</label>
                            <input
                                type="number"
                                style={styles.input}
                                value={monthlyIncome}
                                onChange={(e) => setMonthlyIncome(e.target.value)}
                                min="0"
                                placeholder="e.g., 100000"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Other Monthly Debts (₹) - Car, Credit Cards, etc.</label>
                            <input
                                type="number"
                                style={styles.input}
                                value={monthlyDebt}
                                onChange={(e) => setMonthlyDebt(e.target.value)}
                                min="0"
                                placeholder="e.g., 15000"
                            />
                        </div>
                        <p style={{fontSize: '0.8rem', color: '#64748b', margin: '10px 0'}}>
                            *Uses the Interest Rate entered above and a max tenure of {MAX_LOAN_TENURE} years.
                        </p>
                    </div>

                    {/* Qualification Results Box */}
                    <div style={{flex: '1 1 45%', minWidth: '350px'}}>
                        <div style={{...styles.qualificationBox, ...(dtiDetails.maxLoan > 0 ? styles.successBox : {})}}>
                            <h3 style={{fontSize: '1.2rem', margin: 0, paddingBottom: '10px', borderBottom: '1px solid rgba(0,0,0,0.1)'}}>
                                Loan Qualification Estimate
                            </h3>
                            {dtiDetails.maxLoan > 0 ? (
                                <>
                                    <p style={{margin: '10px 0 0', fontWeight: '700', fontSize: '1.3rem'}}>
                                        ✅ Max Affordable Loan: {formatCurrency(dtiDetails.maxLoan)}
                                    </p>
                                    {/* 🎯 FIX: Corrected syntax error on the line below */}
                                    <p style={{margin: '5px 0 0', fontSize: '0.9rem', color: dtiDetails.maxLoan > 0 ? '#065f46' : 'inherit'}}>
                                        Your maximum monthly mortgage payment is {formatCurrency(dtiDetails.maxEmi)}.
                                    </p>

                                    {/* 🎯 NEW AUTO-FILL BUTTON 🎯 */}
                                    <button
                                        onClick={() => handleAutoFillPrincipal(dtiDetails.maxLoan)}
                                        style={{...styles.autofillButton, backgroundColor: '#10b981'}}
                                    >
                                        Use this as Loan Amount for EMI Calculation
                                    </button>
                                </>
                            ) : (
                                <p style={{margin: 0}}>
                                    {(!monthlyIncome || !monthlyDebt || !rate) ? (
                                        'Enter income, debt, and interest rate to see your maximum pre-qualified loan amount.'
                                    ) : dtiDetails.status === 'TOO_MUCH_DEBT' ? (
                                        '❌ High Existing Debt. Max affordable payment is ₹0.'
                                    ) : (
                                        'Interest rate or tenure is required for qualification calculation.'
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

function EmiCalculatorPage() {
    const navigate = useNavigate(); // Initialize useNavigate hook

    return (
        <div style={styles.pageContainer}>
            {/* 🎯 BACK BUTTON INTEGRATION (RIGHT ALIGNED BELOW HEADING) */}
            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '10px'}}>
                <button
                    onClick={() => navigate(-1)}
                    style={styles.backButton}
                    onMouseEnter={e => e.target.style.backgroundColor = '#e2e8f0'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#f1f5f9'}
                >
                    <span role="img" aria-label="back">⬅️</span> Back to Homepage
                </button>
            </div>
            {/* END BACK BUTTON */}

            <h1 style={styles.header}>💰 Home Loan EMI and Affordability Calculator</h1>

            <div style={styles.contentWrapper}>
                <EmiCalculatorCore />
            </div>

            {/* Informational Section */}
            <div style={{marginTop: '3rem', maxWidth: '800px', margin: '3rem auto', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px'}}>
                <h2 style={{fontSize: '1.5rem', marginBottom: '10px', color: '#3b82f6'}}>About This Tool</h2>

                <p style={{color: '#475569', marginBottom: '15px'}}>
                    The tool above provides two key financial insights:
                </p>

                <p style={{color: '#475569'}}>
                    1. **Loan Parameters (EMI Calculation):** Calculate your monthly installment based on a loan amount, rate, and tenure you input.
                </p>
                <p style={{color: '#475569', marginTop: '10px'}}>
                    2. **Max Loan Affordability Check (DTI):** This crucial section estimates your **Max Affordable Loan Amount**. It uses your **Income** and **Debt** against a standard **Debt-to-Income (DTI)** ratio to determine the maximum loan amount banks would likely pre-qualify you for, helping you set a realistic property budget.
                </p>

            </div>
        </div>
    );
}

export default EmiCalculatorPage;