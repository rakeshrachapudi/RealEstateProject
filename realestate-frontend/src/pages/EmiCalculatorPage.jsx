import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EmiCalculatorPage.css";

const EmiCalculatorPage = () => {
  const [loanAmount, setLoanAmount] = useState("5000000");
  const [interestRate, setInterestRate] = useState("8.5");
  const [loanTenure, setLoanTenure] = useState("20");
  const [tenureType, setTenureType] = useState("years");
  const [results, setResults] = useState({
    emi: 0,
    totalAmount: 0,
    totalInterest: 0,
    principalAmount: 0,
  });
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);
  const [showSchedule, setShowSchedule] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Calculate EMI whenever inputs change
  useEffect(() => {
    calculateEMI();
  }, [loanAmount, interestRate, loanTenure, tenureType]);

  const calculateEMI = () => {
    setError("");

    // Input validation
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate);
    const tenure = parseFloat(loanTenure);

    if (!principal || principal <= 0) {
      setError("Please enter a valid loan amount");
      return;
    }

    if (!rate || rate <= 0 || rate > 50) {
      setError("Interest rate should be between 0.1% and 50%");
      return;
    }

    if (!tenure || tenure <= 0) {
      setError("Please enter a valid loan tenure");
      return;
    }

    // Convert tenure to months if needed
    const tenureInMonths = tenureType === "years" ? tenure * 12 : tenure;

    // Monthly interest rate
    const monthlyRate = rate / (12 * 100);

    // EMI calculation using formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureInMonths)) /
      (Math.pow(1 + monthlyRate, tenureInMonths) - 1);

    const totalAmount = emi * tenureInMonths;
    const totalInterest = totalAmount - principal;

    setResults({
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      principalAmount: Math.round(principal),
    });

    // Generate amortization schedule
    generateAmortizationSchedule(principal, monthlyRate, tenureInMonths, emi);
  };

  const generateAmortizationSchedule = (
    principal,
    monthlyRate,
    tenureInMonths,
    emi
  ) => {
    const schedule = [];
    let remainingPrincipal = principal;

    for (let month = 1; month <= tenureInMonths; month++) {
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment = emi - interestPayment;
      remainingPrincipal -= principalPayment;

      // Avoid negative remaining balance due to rounding
      if (remainingPrincipal < 0) remainingPrincipal = 0;

      schedule.push({
        month,
        emi: Math.round(emi),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.round(remainingPrincipal),
      });

      // Break if balance becomes 0
      if (remainingPrincipal <= 0) break;
    }

    setAmortizationSchedule(schedule);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const handleInputChange = (setter, value) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");
    setter(numericValue);
  };

  const resetCalculator = () => {
    setLoanAmount("5000000");
    setInterestRate("8.5");
    setLoanTenure("20");
    setTenureType("years");
    setShowSchedule(false);
    setError("");
  };

  const downloadSchedule = () => {
    if (amortizationSchedule.length === 0) return;

    // Create CSV content
    let csvContent = "Month,EMI,Principal,Interest,Balance\n";
    amortizationSchedule.forEach((row) => {
      csvContent += `${row.month},${row.emi},${row.principal},${row.interest},${row.balance}\n`;
    });

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EMI_Schedule_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Chart data for visualization (simplified representation)
  const chartData = {
    principal: results.principalAmount,
    interest: results.totalInterest,
  };

  const principalPercentage =
    results.totalAmount > 0
      ? (results.principalAmount / results.totalAmount) * 100
      : 50;
  const interestPercentage = 100 - principalPercentage;

  return (
    <div className="ecp-container">
      {/* Header */}
      <header className="ecp-header">
        <button className="ecp-back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="ecp-header-content">
          <h1 className="ecp-title">EMI Calculator</h1>
          <p className="ecp-subtitle">
            Calculate your home loan EMI and plan your finances
          </p>
        </div>
        <button className="ecp-reset-btn" onClick={resetCalculator}>
          🔄 Reset
        </button>
      </header>

      <div className="ecp-content">
        {/* Calculator Form */}
        <section className="ecp-calculator">
          <div className="ecp-form-container">
            <h2 className="ecp-section-title">Loan Details</h2>

            {error && <div className="ecp-error-message">⚠️ {error}</div>}

            <div className="ecp-form-grid">
              <div className="ecp-form-group">
                <label className="ecp-form-label">Loan Amount</label>
                <div className="ecp-input-container">
                  <span className="ecp-input-prefix">₹</span>
                  <input
                    type="text"
                    className="ecp-form-input"
                    value={loanAmount}
                    onChange={(e) =>
                      handleInputChange(setLoanAmount, e.target.value)
                    }
                    placeholder="5000000"
                  />
                </div>
                <div className="ecp-input-hint">
                  {loanAmount && `₹ ${formatNumber(loanAmount)}`}
                </div>
              </div>

              <div className="ecp-form-group">
                <label className="ecp-form-label">
                  Interest Rate (% per annum)
                </label>
                <div className="ecp-input-container">
                  <input
                    type="text"
                    className="ecp-form-input"
                    value={interestRate}
                    onChange={(e) =>
                      handleInputChange(setInterestRate, e.target.value)
                    }
                    placeholder="8.5"
                  />
                  <span className="ecp-input-suffix">%</span>
                </div>
              </div>

              <div className="ecp-form-group">
                <label className="ecp-form-label">Loan Tenure</label>
                <div className="ecp-tenure-group">
                  <input
                    type="text"
                    className="ecp-form-input ecp-tenure-input"
                    value={loanTenure}
                    onChange={(e) =>
                      handleInputChange(setLoanTenure, e.target.value)
                    }
                    placeholder="20"
                  />
                  <select
                    className="ecp-form-select ecp-tenure-select"
                    value={tenureType}
                    onChange={(e) => setTenureType(e.target.value)}
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="ecp-presets">
              <h3 className="ecp-presets-title">Quick Presets</h3>
              <div className="ecp-preset-buttons">
                <button
                  className="ecp-preset-btn"
                  onClick={() => {
                    setLoanAmount("2500000");
                    setInterestRate("8.0");
                    setLoanTenure("15");
                  }}
                >
                  ₹25L | 8% | 15Y
                </button>
                <button
                  className="ecp-preset-btn"
                  onClick={() => {
                    setLoanAmount("5000000");
                    setInterestRate("8.5");
                    setLoanTenure("20");
                  }}
                >
                  ₹50L | 8.5% | 20Y
                </button>
                <button
                  className="ecp-preset-btn"
                  onClick={() => {
                    setLoanAmount("10000000");
                    setInterestRate("9.0");
                    setLoanTenure("25");
                  }}
                >
                  ₹1Cr | 9% | 25Y
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="ecp-results-container">
            <h2 className="ecp-section-title">EMI Breakdown</h2>

            <div className="ecp-results-grid">
              <div className="ecp-result-card ecp-result-emi">
                <div className="ecp-result-icon">💰</div>
                <div className="ecp-result-content">
                  <div className="ecp-result-label">Monthly EMI</div>
                  <div className="ecp-result-value">
                    {formatCurrency(results.emi)}
                  </div>
                </div>
              </div>

              <div className="ecp-result-card ecp-result-total">
                <div className="ecp-result-icon">📊</div>
                <div className="ecp-result-content">
                  <div className="ecp-result-label">Total Amount</div>
                  <div className="ecp-result-value">
                    {formatCurrency(results.totalAmount)}
                  </div>
                </div>
              </div>

              <div className="ecp-result-card ecp-result-interest">
                <div className="ecp-result-icon">📈</div>
                <div className="ecp-result-content">
                  <div className="ecp-result-label">Total Interest</div>
                  <div className="ecp-result-value">
                    {formatCurrency(results.totalInterest)}
                  </div>
                </div>
              </div>
            </div>

            {/* Pie Chart Visualization */}
            <div className="ecp-chart-container">
              <h3 className="ecp-chart-title">Principal vs Interest</h3>
              <div className="ecp-pie-chart">
                <div
                  className="ecp-pie-slice ecp-principal-slice"
                  style={{ "--percentage": `${principalPercentage}%` }}
                ></div>
                <div
                  className="ecp-pie-slice ecp-interest-slice"
                  style={{ "--percentage": `${interestPercentage}%` }}
                ></div>
              </div>
              <div className="ecp-chart-legend">
                <div className="ecp-legend-item">
                  <div className="ecp-legend-color ecp-principal-color"></div>
                  <span>Principal ({principalPercentage.toFixed(1)}%)</span>
                </div>
                <div className="ecp-legend-item">
                  <div className="ecp-legend-color ecp-interest-color"></div>
                  <span>Interest ({interestPercentage.toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Amortization Schedule */}
        <section className="ecp-schedule">
          <div className="ecp-schedule-header">
            <h2 className="ecp-section-title">Payment Schedule</h2>
            <div className="ecp-schedule-actions">
              <button
                className="ecp-toggle-btn"
                onClick={() => setShowSchedule(!showSchedule)}
              >
                {showSchedule ? "📁 Hide" : "📂 Show"} Schedule
              </button>
              {showSchedule && amortizationSchedule.length > 0 && (
                <button className="ecp-download-btn" onClick={downloadSchedule}>
                  📥 Download CSV
                </button>
              )}
            </div>
          </div>

          {showSchedule && amortizationSchedule.length > 0 && (
            <div className="ecp-schedule-table-container">
              <table className="ecp-schedule-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>EMI</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {amortizationSchedule.slice(0, 12).map((payment, index) => (
                    <tr key={index}>
                      <td>{payment.month}</td>
                      <td>{formatCurrency(payment.emi)}</td>
                      <td className="ecp-principal-amount">
                        {formatCurrency(payment.principal)}
                      </td>
                      <td className="ecp-interest-amount">
                        {formatCurrency(payment.interest)}
                      </td>
                      <td>{formatCurrency(payment.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {amortizationSchedule.length > 12 && (
                <div className="ecp-table-footer">
                  <p>
                    Showing first 12 months. Download CSV for complete schedule.
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Tips & Information */}
        <section className="ecp-info">
          <h2 className="ecp-section-title">Helpful Tips</h2>
          <div className="ecp-tips-grid">
            <div className="ecp-tip-card">
              <div className="ecp-tip-icon">💡</div>
              <div className="ecp-tip-content">
                <h4>Lower Interest Rates</h4>
                <p>
                  Compare rates from different banks to get the best deal. Even
                  0.5% difference can save lakhs over loan tenure.
                </p>
              </div>
            </div>

            <div className="ecp-tip-card">
              <div className="ecp-tip-icon">⏱️</div>
              <div className="ecp-tip-content">
                <h4>Shorter Tenure</h4>
                <p>
                  Opt for shorter tenure if possible. Higher EMI but
                  significantly lower total interest payment.
                </p>
              </div>
            </div>

            <div className="ecp-tip-card">
              <div className="ecp-tip-icon">🎯</div>
              <div className="ecp-tip-content">
                <h4>Prepayment Strategy</h4>
                <p>
                  Make prepayments towards principal to reduce interest burden
                  and loan tenure effectively.
                </p>
              </div>
            </div>

            <div className="ecp-tip-card">
              <div className="ecp-tip-icon">📋</div>
              <div className="ecp-tip-content">
                <h4>EMI to Income Ratio</h4>
                <p>
                  Keep your EMI within 35-40% of your monthly income for
                  comfortable repayment.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmiCalculatorPage;
