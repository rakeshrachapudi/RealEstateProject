import React, { useState, useRef, useEffect } from "react";
import "./RentalAgreementPage.css";

// --- Number to Words Utility ---
function convertToWords(num) {
  if (num === null || num === undefined || num === "")
    return "[AMOUNT IN WORDS]";

  num = parseInt(num, 10);
  if (num === 0) return "Zero";

  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  const scales = ["", "Thousand", "Lakh", "Crore"];

  let words = [];
  let scaleIndex = 0;

  while (num > 0) {
    let chunk = num % 1000;
    if (scaleIndex === 1) {
      // Thousand
      chunk = num % 100;
    } else if (scaleIndex > 1) {
      chunk = num % 100;
    }

    if (chunk > 0) {
      let chunkWords = [];
      if (chunk >= 100) {
        chunkWords.push(ones[Math.floor(chunk / 100)] + " Hundred");
        chunk %= 100;
      }
      if (chunk >= 10 && chunk <= 19) {
        chunkWords.push(teens[chunk - 10]);
      } else {
        if (chunk >= 20) {
          chunkWords.push(tens[Math.floor(chunk / 10)]);
          chunk %= 10;
        }
        if (chunk > 0) {
          chunkWords.push(ones[chunk]);
        }
      }
      if (scales[scaleIndex]) {
        chunkWords.push(scales[scaleIndex]);
      }
      words.unshift(chunkWords.join(" "));
    }

    if (scaleIndex === 0) {
      num = Math.floor(num / 1000);
    } else {
      num = Math.floor(num / 100);
    }
    scaleIndex++;
    if (scaleIndex >= scales.length) break;
  }
  return words.join(" ");
}

// --- Professional Agreement Preview ---
const AgreementPreview = React.forwardRef(({ formData }, ref) => {
  const getFormattedDate = () => {
    if (!formData.startDate)
      return { day: "[DAY]", month: "[MONTH]", year: "[YEAR]" };
    try {
      const date = new Date(formData.startDate);
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      return { day, month, year };
    } catch (e) {
      return { day: "[DAY]", month: "[MONTH]", year: "[YEAR]" };
    }
  };
  const { day, month, year } = getFormattedDate();

  const agreementDuration = parseInt(formData.duration, 10);
  const isLease = formData.agreementType === "Lease Agreement";

  let clauseCounter = 1;

  return (
    <div className="rap-preview-container" ref={ref}>
      <div className="rap-preview-header">
        Generated through <strong>Zero Brokerage Platform</strong>
      </div>

      <h1 className="rap-preview-title">{formData.agreementType}</h1>

      <p className="rap-preview-paragraph">
        This {formData.agreementType} is made and entered into on this{" "}
        <span className="rap-preview-data">{day}</span> day of{" "}
        <span className="rap-preview-data">{month}</span>,{" "}
        <span className="rap-preview-data">{year}</span>
      </p>

      <p className="rap-preview-paragraph">
        <strong>BY AND BETWEEN:</strong>
      </p>

      <p className="rap-preview-paragraph rap-preview-indented">
        <span className="rap-preview-data">
          {formData.ownerName || "[OWNER NAME]"}
        </span>
        , (Phone:{" "}
        <span className="rap-preview-data">
          {formData.ownerPhone || "[OWNER PHONE]"}
        </span>
        , {formData.ownerIdType}:{" "}
        <span className="rap-preview-data">
          {formData.ownerIdNumber || "[OWNER ID]"}
        </span>
        ) (Hereinafter referred to as the "<strong>OWNER</strong>" or "
        {isLease ? "LESSOR" : "LICENSOR"}", which expression shall unless
        repugnant to the context or meaning thereof mean and include their legal
        heirs, executors, administrators, and assigns) of the{" "}
        <strong>FIRST PART</strong>.
      </p>

      <p className="rap-preview-paragraph">
        <strong>AND</strong>
      </p>

      <p className="rap-preview-paragraph rap-preview-indented">
        <span className="rap-preview-data">
          {formData.tenantName || "[TENANT NAME]"}
        </span>
        , (Phone:{" "}
        <span className="rap-preview-data">
          {formData.tenantPhone || "[TENANT PHONE]"}
        </span>
        , {formData.tenantIdType}:{" "}
        <span className="rap-preview-data">
          {formData.tenantIdNumber || "[TENANT ID]"}
        </span>
        ) (Hereinafter referred to as the "<strong>TENANT</strong>" or "
        {isLease ? "LESSEE" : "LICENSEE"}", which expression shall unless
        repugnant to the context or meaning thereof mean and include their legal
        heirs, executors, administrators, and assigns) of the{" "}
        <strong>SECOND PART</strong>.
      </p>

      <p className="rap-preview-paragraph">
        The Owner is the absolute and legal owner of the property situated at{" "}
        <span className="rap-preview-data">
          {formData.propertyAddress || "[PROPERTY ADDRESS]"}
        </span>{" "}
        (Hereinafter referred to as the "<strong>PREMISES</strong>").
      </p>
      <p className="rap-preview-paragraph">
        WHEREAS, the Tenant has requested the Owner to grant this{" "}
        {isLease ? "lease" : "license"} with respect to the Premises, and the
        Owner has agreed to grant the same on the terms and conditions
        hereinafter appearing.
      </p>

      <h2 className="rap-preview-subtitle">
        NOW, THIS AGREEMENT WITNESSETH AS FOLLOWS:
      </h2>

      {/* --- CLAUSES (Now with dynamic numbering) --- */}

      <div className="rap-preview-clause">
        <h3 className="rap-preview-clause-title">
          {clauseCounter++}. PREMISES
        </h3>
        <p className="rap-preview-paragraph">
          The Owner hereby grants to the Tenant the right to occupy and use the
          Premises located at:{" "}
          <span className="rap-preview-data">
            {formData.propertyAddress || "[PROPERTY ADDRESS]"}
          </span>
          .
        </p>
      </div>

      <div className="rap-preview-clause">
        <h3 className="rap-preview-clause-title">{clauseCounter++}. TERM</h3>
        <p className="rap-preview-paragraph">
          The term of this {isLease ? "lease" : "agreement"} shall be for a
          period of{" "}
          <span className="rap-preview-data">{formData.duration}</span>{" "}
          {formData.duration === "1" ? "month" : "months"}, commencing from{" "}
          <span className="rap-preview-data">
            {formData.startDate || "[START DATE]"}
          </span>
          .
        </p>
      </div>

      <div className="rap-preview-clause">
        <h3 className="rap-preview-clause-title">
          {clauseCounter++}. RENT / LICENSE FEE
        </h3>
        <p className="rap-preview-paragraph">
          The Tenant shall pay to the Owner a monthly{" "}
          {isLease ? "rent" : "license fee"} of{" "}
          <span className="rap-preview-data">
            ₹{formData.rentAmount || "[RENT AMOUNT]"}
          </span>{" "}
          (Rupees{" "}
          <span className="rap-preview-data">
            {convertToWords(formData.rentAmount)}
          </span>{" "}
          Only). This amount shall be payable in advance on or before the 5th
          day of each English calendar month.
        </p>
      </div>

      <div className="rap-preview-clause">
        <h3 className="rap-preview-clause-title">
          {clauseCounter++}. SECURITY DEPOSIT
        </h3>
        <p className="rap-preview-subparagraph">
          A. Upon the execution of this Agreement, the Tenant shall pay the
          Owner an interest-free security deposit of{" "}
          <span className="rap-preview-data">
            ₹{formData.depositAmount || "[DEPOSIT AMOUNT]"}
          </span>{" "}
          (Rupees{" "}
          <span className="rap-preview-data">
            {convertToWords(formData.depositAmount)}
          </span>{" "}
          Only).
        </p>
        <p className="rap-preview-subparagraph">
          B. The Owner shall refund this deposit to the Tenant, free of
          interest, within 15 (fifteen) days of the termination of this
          agreement and after the Tenant has handed over vacant and peaceful
          possession of the Premises, subject to any deductions for unpaid
          rent/utilities, damages to the property (reasonable wear and tear
          excepted), or any breach of the terms herein.
        </p>
      </div>

      {isLease &&
        agreementDuration >= 18 &&
        parseFloat(formData.incrementPercentage) > 0 && (
          <div className="rap-preview-clause">
            <h3 className="rap-preview-clause-title">
              {clauseCounter++}. RENT INCREMENT
            </h3>
            <p className="rap-preview-paragraph">
              It is hereby agreed that the rent shall be subject to an increment
              of{" "}
              <span className="rap-preview-data">
                {formData.incrementPercentage}%
              </span>{" "}
              after the completion of every 18 (eighteen) months of the term, in
              accordance with governing State Rent Control Laws.
            </p>
          </div>
        )}

      <div className="rap-preview-clause">
        <h3 className="rap-preview-clause-title">
          {clauseCounter++}. USE OF PREMISES
        </h3>
        <p className="rap-preview-paragraph">
          The Premises shall be used by the Tenant strictly for private
          residential purposes only and for no other purpose whatsoever.
        </p>
      </div>

      <div className="rap-preview-clause">
        <h3 className="rap-preview-clause-title">
          {clauseCounter++}. UTILITIES AND CHARGES
        </h3>
        <p className="rap-preview-paragraph">
          The Tenant shall be responsible for and shall pay all charges for
          electricity, water, gas, internet, and any other utilities consumed on
          the Premises directly to the concerned authorities.
        </p>
      </div>

      <div className="rap-preview-clause">
        <h3 className="rap-preview-clause-title">
          {clauseCounter++}. TERMINATION
        </h3>
        <p className="rap-preview-paragraph">
          Either party may terminate this Agreement by providing 30 (thirty)
          days' written notice to the other party, without assigning any reason
          therefor.
        </p>
      </div>

      <div className="rap-preview-clause">
        <h3 className="rap-preview-clause-title">
          {clauseCounter++}. GOVERNING LAW
        </h3>
        <p className="rap-preview-paragraph">
          This Agreement shall be governed by and construed in accordance with
          the laws of India. The courts in{" "}
          <span className="rap-preview-data">
            {formData.jurisdiction || "[CITY/STATE]"}
          </span>{" "}
          shall have exclusive jurisdiction over any disputes arising hereunder.
        </p>
      </div>

      <p className="rap-preview-paragraph rap-preview-witness">
        <strong>IN WITNESS WHEREOF</strong>, the parties have executed this
        Agreement on the date first above written.
      </p>

      <div className="rap-preview-signature-block">
        <div className="rap-preview-signature">
          <strong>(OWNER / {isLease ? "LESSOR" : "LICENSOR"})</strong>
          <br />
          <br />
          <br />
          <span className="rap-preview-data">
            {formData.ownerName || "[OWNER NAME]"}
          </span>
        </div>
        <div className="rap-preview-signature">
          <strong>(TENANT / {isLease ? "LESSEE" : "LICENSEE"})</strong>
          <br />
          <br />
          <br />
          <span className="rap-preview-data">
            {formData.tenantName || "[TENANT NAME]"}
          </span>
        </div>
      </div>

      <div className="rap-preview-witness-block">
        <p>
          <strong>WITNESSES:</strong>
        </p>
        <div className="rap-preview-signature-block">
          <div className="rap-preview-signature">
            <strong>1. Signature:</strong>
            <br />
            <strong>Name:</strong>
            <br />
            <strong>Address:</strong>
          </div>
          <div className="rap-preview-signature">
            <strong>2. Signature:</strong>
            <br />
            <strong>Name:</strong>
            <br />
            <strong>Address:</strong>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- Initial empty state for the form data ---
const initialFormData = {
  ownerName: "",
  ownerPhone: "",
  ownerIdType: "Aadhaar",
  ownerIdNumber: "",
  tenantName: "",
  tenantPhone: "",
  tenantIdType: "Aadhaar",
  tenantIdNumber: "",
  propertyAddress: "",
  jurisdiction: "",
  rentAmount: "",
  depositAmount: "",
  startDate: "",
  duration: "11",
  incrementPercentage: "5",
  agreementType: "Rental Agreement",
};

// --- Main Page Component ---

function RentalAgreementPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  const agreementPreviewRef = useRef();

  // --- Validation Functions ---
  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    if (!phone) return "Phone number is required.";
    if (!phoneRegex.test(phone)) return "Must be exactly 10 numeric digits.";
    return "";
  };

  const validateAadhaar = (aadhaar) => {
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaar) return "Aadhaar number is required.";
    if (!aadhaarRegex.test(aadhaar))
      return "Must be exactly 12 numeric digits.";
    return "";
  };

  const validatePAN = (pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!pan) return "PAN number is required.";
    if (!panRegex.test(pan)) return "Invalid PAN format (AAAAA1111A).";
    return "";
  };

  const validateRequired = (value, fieldName) => {
    if (!value) return `${fieldName} is required.`;
    return "";
  };

  // --- Single Field Validator ---
  const validateField = (name, value, currentFormData) => {
    let error = "";
    const data = currentFormData || formData;

    switch (name) {
      case "ownerName":
        error = validateRequired(value, "Owner name");
        break;
      case "tenantName":
        error = validateRequired(value, "Tenant name");
        break;
      case "ownerPhone":
        error = validatePhone(value);
        break;
      case "tenantPhone":
        error = validatePhone(value);
        break;
      case "ownerIdNumber":
        error =
          data.ownerIdType === "Aadhaar"
            ? validateAadhaar(value)
            : validatePAN(value);
        break;
      case "tenantIdNumber":
        error =
          data.tenantIdType === "Aadhaar"
            ? validateAadhaar(value)
            : validatePAN(value);
        break;
      case "propertyAddress":
        error = validateRequired(value, "Property address");
        break;
      case "jurisdiction":
        error = validateRequired(value, "Jurisdiction");
        break;
      case "rentAmount":
        error = validateRequired(value, "Rent amount");
        break;
      case "depositAmount":
        error = validateRequired(value, "Deposit amount");
        break;
      case "startDate":
        error = validateRequired(value, "Start date");
        break;
      default:
        break;
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  // --- Full Step Validator (for "Next" button click) ---
  const validateStep = (stepToValidate) => {
    const errors = {};
    let allFieldsTouched = {};

    if (stepToValidate === 2) {
      errors.ownerName = validateRequired(formData.ownerName, "Owner name");
      errors.tenantName = validateRequired(formData.tenantName, "Tenant name");
      errors.ownerPhone = validatePhone(formData.ownerPhone);
      errors.tenantPhone = validatePhone(formData.tenantPhone);
      errors.ownerIdNumber =
        formData.ownerIdType === "Aadhaar"
          ? validateAadhaar(formData.ownerIdNumber)
          : validatePAN(formData.ownerIdNumber);
      errors.tenantIdNumber =
        formData.tenantIdType === "Aadhaar"
          ? validateAadhaar(formData.tenantIdNumber)
          : validatePAN(formData.tenantIdNumber);
      allFieldsTouched = {
        ownerName: true,
        tenantName: true,
        ownerPhone: true,
        tenantPhone: true,
        ownerIdNumber: true,
        tenantIdNumber: true,
      };
    } else if (stepToValidate === 3) {
      errors.propertyAddress = validateRequired(
        formData.propertyAddress,
        "Property address"
      );
      errors.jurisdiction = validateRequired(
        formData.jurisdiction,
        "Jurisdiction"
      );
      errors.rentAmount = validateRequired(formData.rentAmount, "Rent amount");
      errors.depositAmount = validateRequired(
        formData.depositAmount,
        "Deposit amount"
      );
      errors.startDate = validateRequired(formData.startDate, "Start date");
      allFieldsTouched = {
        propertyAddress: true,
        jurisdiction: true,
        rentAmount: true,
        depositAmount: true,
        startDate: true,
      };
    }

    const validErrors = Object.keys(errors).reduce((acc, key) => {
      if (errors[key]) acc[key] = errors[key];
      return acc;
    }, {});

    setFormErrors(validErrors);
    setTouched((prev) => ({ ...prev, ...allFieldsTouched }));
    return Object.keys(validErrors).length === 0;
  };

  // --- Functions to check if step is valid (for button disabling) ---
  const isStep2Valid = () => {
    if (validateRequired(formData.ownerName, "")) return false;
    if (validateRequired(formData.tenantName, "")) return false;
    if (validatePhone(formData.ownerPhone)) return false;
    if (validatePhone(formData.tenantPhone)) return false;
    if (
      formData.ownerIdType === "Aadhaar"
        ? validateAadhaar(formData.ownerIdNumber)
        : validatePAN(formData.ownerIdNumber)
    )
      return false;
    if (
      formData.tenantIdType === "Aadhaar"
        ? validateAadhaar(formData.tenantIdNumber)
        : validatePAN(formData.tenantIdNumber)
    )
      return false;
    return true;
  };

  const isStep3Valid = () => {
    if (validateRequired(formData.propertyAddress, "")) return false;
    if (validateRequired(formData.jurisdiction, "")) return false;
    if (validateRequired(formData.rentAmount, "")) return false;
    if (validateRequired(formData.depositAmount, "")) return false;
    if (validateRequired(formData.startDate, "")) return false;
    return true;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // --- Input Sanitization & Formatting ---
    if (name === "ownerPhone" || name === "tenantPhone") {
      value = value.replace(/\D/g, "").substring(0, 10);
    }

    if (name === "ownerIdNumber" || name === "tenantIdNumber") {
      const idType =
        name === "ownerIdNumber" ? formData.ownerIdType : formData.tenantIdType;
      if (idType === "Aadhaar") {
        value = value.replace(/\D/g, "").substring(0, 12);
      } else if (idType === "PAN") {
        value = value.toUpperCase();
        let sanitized = "";
        if (value.length > 0) {
          sanitized += value.substring(0, 5).replace(/[^A-Z]/g, "");
        }
        if (value.length > 5) {
          sanitized += value.substring(5, 9).replace(/[^0-9]/g, "");
        }
        if (value.length > 9) {
          sanitized += value.substring(9, 10).replace(/[^A-Z]/g, "");
        }
        value = sanitized;
      }
    }

    if (name === "rentAmount" || name === "depositAmount") {
      value = value.replace(/\D/g, "");
    }

    // --- Update Form Data State ---
    const newData = { ...formData, [name]: value };

    if (name === "duration") {
      const durationMonths = parseInt(value, 10);
      newData.agreementType =
        durationMonths <= 11 ? "Rental Agreement" : "Lease Agreement";
    }

    if (name === "ownerIdType") {
      newData.ownerIdNumber = "";
      if (touched.ownerIdNumber) validateField("ownerIdNumber", "", newData);
    }
    if (name === "tenantIdType") {
      newData.tenantIdNumber = "";
      if (touched.tenantIdNumber) validateField("tenantIdNumber", "", newData);
    }

    setFormData(newData);

    if (touched[name]) {
      validateField(name, value, newData);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value, formData);
  };

  const handleNext = () => {
    let isCurrentStepValid = false;

    if (step === 2) {
      isCurrentStepValid = validateStep(2);
    } else if (step === 3) {
      isCurrentStepValid = validateStep(3);
    } else {
      isCurrentStepValid = true;
    }

    if (!isCurrentStepValid) return;

    setFormErrors({});
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setFormErrors({});
    setStep((prev) => prev - 1);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Final Agreement Data:", formData);
    setStep(5);
  };

  const step2ButtonDisabled = !isStep2Valid();
  const step3ButtonDisabled = !isStep3Valid();

  return (
    <div className="rap-container">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-agreement, #printable-agreement * {
              visibility: visible;
            }
            #printable-agreement {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              border: none;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <h1 className="no-print rap-page-title">Online Rental Agreement</h1>
      <p className="no-print rap-page-subtitle">
        through <strong>Zero Brokerage Platform</strong>
      </p>

      {/* Step 1: Introduction */}
      {step === 1 && (
        <div className="no-print">
          <p className="rap-intro-text">
            Streamline your rental process with our easy-to-use digital rental
            agreement service. We provide government-approved, e-stamped
            agreements delivered right to your doorstep.
          </p>
          <div className="rap-form-container">
            <h3 className="rap-section-title">Key Features:</h3>
            <ul className="rap-features-list">
              <li className="rap-feature-item">
                <span className="rap-feature-icon">✅</span>
                100% Online & Paperless Process
              </li>
              <li className="rap-feature-item">
                <span className="rap-feature-icon">⚖️</span>
                Legally Valid & E-Stamped
              </li>
              <li className="rap-feature-item">
                <span className="rap-feature-icon">🚚</span>
                Express Delivery Available
              </li>
            </ul>
            <button
              className="rap-primary-button rap-full-width"
              onClick={handleNext}
            >
              Create Your Agreement Now
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Parties Information */}
      {step === 2 && (
        <div className="rap-form-container no-print">
          <h2 className="rap-step-title">Step 1: Parties Information</h2>

          <h3 className="rap-subsection-title">Owner Details</h3>
          <div className="rap-form-group">
            <label className="rap-form-label" htmlFor="ownerName">
              Owner Full Name
            </label>
            <input
              className={`rap-form-input ${
                touched.ownerName && formErrors.ownerName
                  ? "rap-error-input"
                  : ""
              }`}
              type="text"
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., John Doe"
            />
            {touched.ownerName && formErrors.ownerName && (
              <span className="rap-error-message">{formErrors.ownerName}</span>
            )}
          </div>

          <div className="rap-form-group">
            <label className="rap-form-label" htmlFor="ownerPhone">
              Owner Phone Number (10 Digits)
            </label>
            <input
              className={`rap-form-input ${
                touched.ownerPhone && formErrors.ownerPhone
                  ? "rap-error-input"
                  : ""
              }`}
              type="tel"
              id="ownerPhone"
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 9876543210"
            />
            {touched.ownerPhone && formErrors.ownerPhone && (
              <span className="rap-error-message">{formErrors.ownerPhone}</span>
            )}
          </div>

          <div className="rap-id-group">
            <div className="rap-id-type">
              <label className="rap-form-label" htmlFor="ownerIdType">
                Govt. ID Type
              </label>
              <select
                className="rap-form-select"
                id="ownerIdType"
                name="ownerIdType"
                value={formData.ownerIdType}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="Aadhaar">Aadhaar</option>
                <option value="PAN">PAN</option>
              </select>
            </div>
            <div className="rap-id-number">
              <label className="rap-form-label" htmlFor="ownerIdNumber">
                ID Number
              </label>
              <input
                className={`rap-form-input ${
                  touched.ownerIdNumber && formErrors.ownerIdNumber
                    ? "rap-error-input"
                    : ""
                }`}
                type="text"
                id="ownerIdNumber"
                name="ownerIdNumber"
                value={formData.ownerIdNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={
                  formData.ownerIdType === "Aadhaar"
                    ? "12-digit number"
                    : "e.g. AAAAA1111A"
                }
              />
              {touched.ownerIdNumber && formErrors.ownerIdNumber && (
                <span className="rap-error-message">
                  {formErrors.ownerIdNumber}
                </span>
              )}
            </div>
          </div>

          <hr className="rap-separator" />

          <h3 className="rap-subsection-title">Tenant Details</h3>
          <div className="rap-form-group">
            <label className="rap-form-label" htmlFor="tenantName">
              Tenant Full Name
            </label>
            <input
              className={`rap-form-input ${
                touched.tenantName && formErrors.tenantName
                  ? "rap-error-input"
                  : ""
              }`}
              type="text"
              id="tenantName"
              name="tenantName"
              value={formData.tenantName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., Jane Smith"
            />
            {touched.tenantName && formErrors.tenantName && (
              <span className="rap-error-message">{formErrors.tenantName}</span>
            )}
          </div>

          <div className="rap-form-group">
            <label className="rap-form-label" htmlFor="tenantPhone">
              Tenant Phone Number (10 Digits)
            </label>
            <input
              className={`rap-form-input ${
                touched.tenantPhone && formErrors.tenantPhone
                  ? "rap-error-input"
                  : ""
              }`}
              type="tel"
              id="tenantPhone"
              name="tenantPhone"
              value={formData.tenantPhone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 1234567890"
            />
            {touched.tenantPhone && formErrors.tenantPhone && (
              <span className="rap-error-message">
                {formErrors.tenantPhone}
              </span>
            )}
          </div>

          <div className="rap-id-group">
            <div className="rap-id-type">
              <label className="rap-form-label" htmlFor="tenantIdType">
                Govt. ID Type
              </label>
              <select
                className="rap-form-select"
                id="tenantIdType"
                name="tenantIdType"
                value={formData.tenantIdType}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="Aadhaar">Aadhaar</option>
                <option value="PAN">PAN</option>
              </select>
            </div>
            <div className="rap-id-number">
              <label className="rap-form-label" htmlFor="tenantIdNumber">
                ID Number
              </label>
              <input
                className={`rap-form-input ${
                  touched.tenantIdNumber && formErrors.tenantIdNumber
                    ? "rap-error-input"
                    : ""
                }`}
                type="text"
                id="tenantIdNumber"
                name="tenantIdNumber"
                value={formData.tenantIdNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={
                  formData.tenantIdType === "Aadhaar"
                    ? "12-digit number"
                    : "e.g. AAAAA1111A"
                }
              />
              {touched.tenantIdNumber && formErrors.tenantIdNumber && (
                <span className="rap-error-message">
                  {formErrors.tenantIdNumber}
                </span>
              )}
            </div>
          </div>

          <div className="rap-button-group">
            <button
              type="button"
              className="rap-secondary-button rap-back-button"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="button"
              className={
                step2ButtonDisabled
                  ? "rap-disabled-button rap-next-button"
                  : "rap-primary-button rap-next-button"
              }
              onClick={handleNext}
              disabled={step2ButtonDisabled}
            >
              Next: Property Details
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Property & Terms */}
      {step === 3 && (
        <div className="rap-form-container no-print">
          <h2 className="rap-step-title">Step 2: Property & Terms</h2>

          <div className="rap-info-box">
            <h4 className="rap-info-box-title">📄 Agreement Type Note:</h4>
            <p>
              Agreements up to 11 months are typically considered 'Rental
              Agreements'. Agreements for 12 months or longer are often treated
              as 'Lease Agreements' and may require registration and potentially
              different stamp duty depending on state laws.
            </p>
          </div>

          <div className="rap-form-group">
            <label className="rap-form-label" htmlFor="propertyAddress">
              Property Address
            </label>
            <input
              className={`rap-form-input ${
                touched.propertyAddress && formErrors.propertyAddress
                  ? "rap-error-input"
                  : ""
              }`}
              type="text"
              id="propertyAddress"
              name="propertyAddress"
              value={formData.propertyAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Full address of the rental property"
            />
            {touched.propertyAddress && formErrors.propertyAddress && (
              <span className="rap-error-message">
                {formErrors.propertyAddress}
              </span>
            )}
          </div>

          <div className="rap-form-group">
            <label className="rap-form-label" htmlFor="jurisdiction">
              Jurisdiction (City/State)
            </label>
            <input
              className={`rap-form-input ${
                touched.jurisdiction && formErrors.jurisdiction
                  ? "rap-error-input"
                  : ""
              }`}
              type="text"
              id="jurisdiction"
              name="jurisdiction"
              value={formData.jurisdiction}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., Hyderabad, Telangana"
            />
            {touched.jurisdiction && formErrors.jurisdiction && (
              <span className="rap-error-message">
                {formErrors.jurisdiction}
              </span>
            )}
          </div>

          <div className="rap-rent-deposit-group">
            <div className="rap-form-group rap-flex-1">
              <label className="rap-form-label" htmlFor="rentAmount">
                Monthly Rent (₹)
              </label>
              <input
                className={`rap-form-input ${
                  touched.rentAmount && formErrors.rentAmount
                    ? "rap-error-input"
                    : ""
                }`}
                type="tel"
                id="rentAmount"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., 15000"
              />
              {touched.rentAmount && formErrors.rentAmount && (
                <span className="rap-error-message">
                  {formErrors.rentAmount}
                </span>
              )}
            </div>
            <div className="rap-form-group rap-flex-1">
              <label className="rap-form-label" htmlFor="depositAmount">
                Security Deposit (₹)
              </label>
              <input
                className={`rap-form-input ${
                  touched.depositAmount && formErrors.depositAmount
                    ? "rap-error-input"
                    : ""
                }`}
                type="tel"
                id="depositAmount"
                name="depositAmount"
                value={formData.depositAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., 30000"
              />
              {touched.depositAmount && formErrors.depositAmount && (
                <span className="rap-error-message">
                  {formErrors.depositAmount}
                </span>
              )}
            </div>
          </div>

          <div className="rap-form-group">
            <label className="rap-form-label" htmlFor="startDate">
              Agreement Start Date
            </label>
            <input
              className={`rap-form-input ${
                touched.startDate && formErrors.startDate
                  ? "rap-error-input"
                  : ""
              }`}
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.startDate && formErrors.startDate && (
              <span className="rap-error-message">{formErrors.startDate}</span>
            )}
          </div>

          <div className="rap-form-group">
            <label className="rap-form-label" htmlFor="duration">
              Agreement Duration
            </label>
            <select
              className="rap-form-select"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              {Array.from({ length: 60 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {month} {month === 1 ? "Month" : "Months"}
                  {month === 12 && " (1 Year)"}
                  {month === 24 && " (2 Years)"}
                  {month === 36 && " (3 Years)"}
                  {month === 48 && " (4 Years)"}
                  {month === 60 && " (5 Years)"}
                </option>
              ))}
            </select>
          </div>

          <div className="rap-form-group">
            <label className="rap-form-label">
              Agreement Type (Determined by Duration)
            </label>
            <input
              className="rap-form-input rap-disabled-input"
              type="text"
              value={formData.agreementType}
              disabled
            />
          </div>

          {formData.agreementType === "Lease Agreement" &&
            parseInt(formData.duration, 10) >= 18 && (
              <div className="rap-form-group">
                <label className="rap-form-label" htmlFor="incrementPercentage">
                  Rent Increment (%) after 18 Months
                </label>
                <input
                  className="rap-form-input"
                  type="number"
                  id="incrementPercentage"
                  name="incrementPercentage"
                  value={formData.incrementPercentage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., 5"
                />
              </div>
            )}

          <div className="rap-button-group">
            <button
              type="button"
              className="rap-secondary-button rap-back-button"
              onClick={handleBack}
            >
              Back
            </button>
            <button
              type="button"
              className={
                step3ButtonDisabled
                  ? "rap-disabled-button rap-next-button"
                  : "rap-primary-button rap-next-button"
              }
              onClick={handleNext}
              disabled={step3ButtonDisabled}
            >
              Next: Review & Print
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Print */}
      {step === 4 && (
        <form onSubmit={handleSubmit}>
          <h2 className="rap-step-title no-print">
            Step 3: Review & Print Agreement
          </h2>
          <p className="rap-review-subtitle no-print">
            Review the agreement below. You can print it or save it as a PDF
            before submitting.
          </p>

          <div id="printable-agreement">
            <AgreementPreview formData={formData} ref={agreementPreviewRef} />
          </div>

          <div className="rap-button-group no-print">
            <button
              type="button"
              className="rap-secondary-button"
              onClick={handleBack}
            >
              Back
            </button>
            <button
              type="button"
              className="rap-secondary-button rap-print-button"
              onClick={handlePrint}
            >
              🖨️ Print/Save as PDF
            </button>
            <button type="submit" className="rap-primary-button">
              Submit Agreement
            </button>
          </div>
        </form>
      )}

      {/* Step 5: Success Message */}
      {step === 5 && (
        <div>
          <div className="rap-success-message no-print">
            <div className="rap-success-icon">🎉</div>
            <h2 className="rap-success-title">Agreement Submitted!</h2>
            <p className="rap-success-text">
              The {formData.agreementType} between
              <strong className="rap-success-name">
                {" "}
                {formData.ownerName}{" "}
              </strong>
              (Owner) and
              <strong className="rap-success-name">
                {" "}
                {formData.tenantName}{" "}
              </strong>
              (Tenant) has been successfully created. Thank you for using{" "}
              <strong>Zero Brokerage Platform</strong>!
            </p>
            <div className="rap-success-buttons">
              <button className="rap-secondary-button" onClick={handlePrint}>
                Download Duplicate
              </button>
              <button
                className="rap-primary-button rap-success-primary"
                onClick={() => {
                  setStep(1);
                  setFormData(initialFormData);
                  setFormErrors({});
                  setTouched({});
                }}
              >
                Create Another Agreement
              </button>
            </div>
          </div>

          <div style={{ display: "none" }}>
            <div id="printable-agreement-duplicate">
              <AgreementPreview formData={formData} ref={agreementPreviewRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RentalAgreementPage;
