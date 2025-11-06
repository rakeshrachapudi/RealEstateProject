import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateSaleAgreementPage.css";

// Number to Words Utility
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

// Professional Sale Agreement Preview
const SaleAgreementPreview = React.forwardRef(({ formData }, ref) => {
  const getFormattedDate = () => {
    if (!formData.saleDate)
      return { day: "[DAY]", month: "[MONTH]", year: "[YEAR]" };
    try {
      const date = new Date(formData.saleDate);
      const day = date.getDate();
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      return { day, month, year };
    } catch (e) {
      return { day: "[DAY]", month: "[MONTH]", year: "[YEAR]" };
    }
  };
  const { day, month, year } = getFormattedDate();

  let clauseCounter = 1;

  return (
    <div className="csap-preview-container" ref={ref}>
      <div className="csap-preview-header">
        Generated through <strong>Zero Brokerage Platform</strong>
      </div>

      <h1 className="csap-preview-title">Sale Agreement</h1>

      <p className="csap-preview-paragraph">
        This Sale Agreement is made and entered into on this{" "}
        <span className="csap-preview-data">{day}</span> day of{" "}
        <span className="csap-preview-data">{month}</span>,{" "}
        <span className="csap-preview-data">{year}</span>
      </p>

      <p className="csap-preview-paragraph">
        <strong>BY AND BETWEEN:</strong>
      </p>

      <p className="csap-preview-paragraph csap-preview-indented">
        <span className="csap-preview-data">
          {formData.vendorName || "[VENDOR NAME]"}
        </span>
        , (Phone:{" "}
        <span className="csap-preview-data">
          {formData.vendorPhone || "[VENDOR PHONE]"}
        </span>
        , {formData.vendorIdType}:{" "}
        <span className="csap-preview-data">
          {formData.vendorIdNumber || "[VENDOR ID]"}
        </span>
        ) (Hereinafter referred to as the "<strong>VENDOR</strong>" or "SELLER",
        which expression shall unless repugnant to the context or meaning
        thereof mean and include their legal heirs, executors, administrators,
        and assigns) of the <strong>FIRST PART</strong>.
      </p>

      <p className="csap-preview-paragraph">
        <strong>AND</strong>
      </p>

      <p className="csap-preview-paragraph csap-preview-indented">
        <span className="csap-preview-data">
          {formData.buyerName || "[BUYER NAME]"}
        </span>
        , (Phone:{" "}
        <span className="csap-preview-data">
          {formData.buyerPhone || "[BUYER PHONE]"}
        </span>
        , {formData.buyerIdType}:{" "}
        <span className="csap-preview-data">
          {formData.buyerIdNumber || "[BUYER ID]"}
        </span>
        ) (Hereinafter referred to as the "<strong>PURCHASER</strong>" or
        "BUYER", which expression shall unless repugnant to the context or
        meaning thereof mean and include their legal heirs, executors,
        administrators, and assigns) of the <strong>SECOND PART</strong>.
      </p>

      <p className="csap-preview-paragraph">
        The Vendor is the absolute and legal owner of the property situated at{" "}
        <span className="csap-preview-data">
          {formData.propertyAddress || "[PROPERTY ADDRESS]"}
        </span>{" "}
        (Hereinafter referred to as the "<strong>PROPERTY</strong>").
      </p>

      <p className="csap-preview-paragraph">
        WHEREAS, the Purchaser has requested the Vendor to sell the Property,
        and the Vendor has agreed to sell the same on the terms and conditions
        hereinafter appearing.
      </p>

      <h2 className="csap-preview-subtitle">
        NOW, THIS AGREEMENT WITNESSETH AS FOLLOWS:
      </h2>

      <div className="csap-preview-clause">
        <h3 className="csap-preview-clause-title">
          {clauseCounter++}. PROPERTY
        </h3>
        <p className="csap-preview-paragraph">
          The Vendor hereby agrees to sell to the Purchaser the Property located
          at:{" "}
          <span className="csap-preview-data">
            {formData.propertyAddress || "[PROPERTY ADDRESS]"}
          </span>
          .
        </p>
      </div>

      <div className="csap-preview-clause">
        <h3 className="csap-preview-clause-title">
          {clauseCounter++}. SALE CONSIDERATION
        </h3>
        <p className="csap-preview-paragraph">
          The total sale consideration for the Property is{" "}
          <span className="csap-preview-data">
            ₹{formData.saleAmount || "[SALE AMOUNT]"}
          </span>{" "}
          (Rupees{" "}
          <span className="csap-preview-data">
            {convertToWords(formData.saleAmount)}
          </span>{" "}
          Only).
        </p>
      </div>

      <div className="csap-preview-clause">
        <h3 className="csap-preview-clause-title">
          {clauseCounter++}. ADVANCE PAYMENT
        </h3>
        <p className="csap-preview-subparagraph">
          A. Upon the execution of this Agreement, the Purchaser shall pay the
          Vendor an advance amount of{" "}
          <span className="csap-preview-data">
            ₹{formData.advanceAmount || "[ADVANCE AMOUNT]"}
          </span>{" "}
          (Rupees{" "}
          <span className="csap-preview-data">
            {convertToWords(formData.advanceAmount)}
          </span>{" "}
          Only).
        </p>
        <p className="csap-preview-subparagraph">
          B. The balance amount of{" "}
          <span className="csap-preview-data">
            ₹
            {formData.saleAmount - formData.advanceAmount || "[BALANCE AMOUNT]"}
          </span>{" "}
          shall be paid at the time of registration of the sale deed.
        </p>
      </div>

      <div className="csap-preview-clause">
        <h3 className="csap-preview-clause-title">
          {clauseCounter++}. REGISTRATION
        </h3>
        <p className="csap-preview-paragraph">
          The sale deed shall be executed and registered within{" "}
          <span className="csap-preview-data">
            {formData.registrationDays || "30"}
          </span>{" "}
          days from the date of this agreement.
        </p>
      </div>

      <div className="csap-preview-clause">
        <h3 className="csap-preview-clause-title">
          {clauseCounter++}. POSSESSION
        </h3>
        <p className="csap-preview-paragraph">
          The Vendor shall hand over vacant and peaceful possession of the
          Property to the Purchaser on the date of registration of the sale
          deed.
        </p>
      </div>

      <div className="csap-preview-clause">
        <h3 className="csap-preview-clause-title">
          {clauseCounter++}. GOVERNING LAW
        </h3>
        <p className="csap-preview-paragraph">
          This Agreement shall be governed by and construed in accordance with
          the laws of India. The courts in{" "}
          <span className="csap-preview-data">
            {formData.jurisdiction || "[CITY/STATE]"}
          </span>{" "}
          shall have exclusive jurisdiction over any disputes arising hereunder.
        </p>
      </div>

      <p className="csap-preview-paragraph csap-preview-witness">
        <strong>IN WITNESS WHEREOF</strong>, the parties have executed this
        Agreement on the date first above written.
      </p>

      <div className="csap-preview-signature-block">
        <div className="csap-preview-signature">
          <strong>(VENDOR / SELLER)</strong>
          <br />
          <br />
          <br />
          <span className="csap-preview-data">
            {formData.vendorName || "[VENDOR NAME]"}
          </span>
        </div>
        <div className="csap-preview-signature">
          <strong>(PURCHASER / BUYER)</strong>
          <br />
          <br />
          <br />
          <span className="csap-preview-data">
            {formData.buyerName || "[BUYER NAME]"}
          </span>
        </div>
      </div>

      <div className="csap-preview-witness-block">
        <p>
          <strong>WITNESSES:</strong>
        </p>
        <div className="csap-preview-signature-block">
          <div className="csap-preview-signature">
            <strong>1. Signature:</strong>
            <br />
            <strong>Name:</strong>
            <br />
            <strong>Address:</strong>
          </div>
          <div className="csap-preview-signature">
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

// Initial form data
const initialFormData = {
  vendorName: "",
  vendorPhone: "",
  vendorIdType: "Aadhaar",
  vendorIdNumber: "",
  buyerName: "",
  buyerPhone: "",
  buyerIdType: "Aadhaar",
  buyerIdNumber: "",
  propertyAddress: "",
  jurisdiction: "",
  saleAmount: "",
  advanceAmount: "",
  saleDate: "",
  registrationDays: "30",
};

function CreateSaleAgreementPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  const agreementPreviewRef = useRef();

  // Validation Functions
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

  const validateField = (name, value, currentFormData) => {
    let error = "";
    const data = currentFormData || formData;

    switch (name) {
      case "vendorName":
        error = validateRequired(value, "Vendor name");
        break;
      case "buyerName":
        error = validateRequired(value, "Buyer name");
        break;
      case "vendorPhone":
        error = validatePhone(value);
        break;
      case "buyerPhone":
        error = validatePhone(value);
        break;
      case "vendorIdNumber":
        error =
          data.vendorIdType === "Aadhaar"
            ? validateAadhaar(value)
            : validatePAN(value);
        break;
      case "buyerIdNumber":
        error =
          data.buyerIdType === "Aadhaar"
            ? validateAadhaar(value)
            : validatePAN(value);
        break;
      case "propertyAddress":
        error = validateRequired(value, "Property address");
        break;
      case "jurisdiction":
        error = validateRequired(value, "Jurisdiction");
        break;
      case "saleAmount":
        error = validateRequired(value, "Sale amount");
        break;
      case "advanceAmount":
        error = validateRequired(value, "Advance amount");
        break;
      case "saleDate":
        error = validateRequired(value, "Sale date");
        break;
      default:
        break;
    }
    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateStep = (stepToValidate) => {
    const errors = {};
    let allFieldsTouched = {};

    if (stepToValidate === 2) {
      errors.vendorName = validateRequired(formData.vendorName, "Vendor name");
      errors.buyerName = validateRequired(formData.buyerName, "Buyer name");
      errors.vendorPhone = validatePhone(formData.vendorPhone);
      errors.buyerPhone = validatePhone(formData.buyerPhone);
      errors.vendorIdNumber =
        formData.vendorIdType === "Aadhaar"
          ? validateAadhaar(formData.vendorIdNumber)
          : validatePAN(formData.vendorIdNumber);
      errors.buyerIdNumber =
        formData.buyerIdType === "Aadhaar"
          ? validateAadhaar(formData.buyerIdNumber)
          : validatePAN(formData.buyerIdNumber);
      allFieldsTouched = {
        vendorName: true,
        buyerName: true,
        vendorPhone: true,
        buyerPhone: true,
        vendorIdNumber: true,
        buyerIdNumber: true,
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
      errors.saleAmount = validateRequired(formData.saleAmount, "Sale amount");
      errors.advanceAmount = validateRequired(
        formData.advanceAmount,
        "Advance amount"
      );
      errors.saleDate = validateRequired(formData.saleDate, "Sale date");
      allFieldsTouched = {
        propertyAddress: true,
        jurisdiction: true,
        saleAmount: true,
        advanceAmount: true,
        saleDate: true,
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

  const isStep2Valid = () => {
    if (validateRequired(formData.vendorName, "")) return false;
    if (validateRequired(formData.buyerName, "")) return false;
    if (validatePhone(formData.vendorPhone)) return false;
    if (validatePhone(formData.buyerPhone)) return false;
    if (
      formData.vendorIdType === "Aadhaar"
        ? validateAadhaar(formData.vendorIdNumber)
        : validatePAN(formData.vendorIdNumber)
    )
      return false;
    if (
      formData.buyerIdType === "Aadhaar"
        ? validateAadhaar(formData.buyerIdNumber)
        : validatePAN(formData.buyerIdNumber)
    )
      return false;
    return true;
  };

  const isStep3Valid = () => {
    if (validateRequired(formData.propertyAddress, "")) return false;
    if (validateRequired(formData.jurisdiction, "")) return false;
    if (validateRequired(formData.saleAmount, "")) return false;
    if (validateRequired(formData.advanceAmount, "")) return false;
    if (validateRequired(formData.saleDate, "")) return false;
    return true;
  };

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Input Sanitization & Formatting
    if (name === "vendorPhone" || name === "buyerPhone") {
      value = value.replace(/\D/g, "").substring(0, 10);
    }

    if (name === "vendorIdNumber" || name === "buyerIdNumber") {
      const idType =
        name === "vendorIdNumber"
          ? formData.vendorIdType
          : formData.buyerIdType;
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

    if (name === "saleAmount" || name === "advanceAmount") {
      value = value.replace(/\D/g, "");
    }

    const newData = { ...formData, [name]: value };

    if (name === "vendorIdType") {
      newData.vendorIdNumber = "";
      if (touched.vendorIdNumber) validateField("vendorIdNumber", "", newData);
    }
    if (name === "buyerIdType") {
      newData.buyerIdNumber = "";
      if (touched.buyerIdNumber) validateField("buyerIdNumber", "", newData);
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

    // Save to localStorage
    const agreementId = Date.now().toString();
    const agreementData = {
      ...formData,
      agreementId,
      agreementType: "Sale Agreement",
      status: "DRAFT",
      createdAt: new Date().toISOString(),
    };

    try {
      const existingAgreements = JSON.parse(
        localStorage.getItem("myAgreements") || "[]"
      );
      const updatedAgreements = [agreementData, ...existingAgreements];
      localStorage.setItem("myAgreements", JSON.stringify(updatedAgreements));
      console.log("Sale Agreement saved:", agreementData);
    } catch (error) {
      console.error("Error saving agreement:", error);
    }

    setStep(5);
  };

  const step2ButtonDisabled = !isStep2Valid();
  const step3ButtonDisabled = !isStep3Valid();

  return (
    <div className="csap-container">
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

      <h1 className="no-print csap-page-title">Online Sale Agreement</h1>
      <p className="no-print csap-page-subtitle">
        through <strong>Zero Brokerage Platform</strong>
      </p>

      {/* Step 1: Introduction */}
      {step === 1 && (
        <div className="no-print">
          <p className="csap-intro-text">
            Create a legally binding sale agreement with our comprehensive
            digital platform. Generate professional documents with
            government-approved templates.
          </p>
          <div className="csap-form-container">
            <h3 className="csap-section-title">Key Features:</h3>
            <ul className="csap-features-list">
              <li className="csap-feature-item">
                <span className="csap-feature-icon">✅</span>
                100% Online & Professional
              </li>
              <li className="csap-feature-item">
                <span className="csap-feature-icon">⚖️</span>
                Legally Valid Documents
              </li>
              <li className="csap-feature-item">
                <span className="csap-feature-icon">📋</span>
                Comprehensive Sale Terms
              </li>
            </ul>
            <button
              className="csap-primary-button csap-full-width"
              onClick={handleNext}
            >
              Create Sale Agreement Now
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Parties Information */}
      {step === 2 && (
        <div className="csap-form-container no-print">
          <h2 className="csap-step-title">Step 1: Parties Information</h2>

          <h3 className="csap-subsection-title">Vendor Details (Seller)</h3>
          <div className="csap-form-group">
            <label className="csap-form-label" htmlFor="vendorName">
              Vendor Full Name
            </label>
            <input
              className={`csap-form-input ${
                touched.vendorName && formErrors.vendorName
                  ? "csap-error-input"
                  : ""
              }`}
              type="text"
              id="vendorName"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., John Doe"
            />
            {touched.vendorName && formErrors.vendorName && (
              <span className="csap-error-message">
                {formErrors.vendorName}
              </span>
            )}
          </div>

          <div className="csap-form-group">
            <label className="csap-form-label" htmlFor="vendorPhone">
              Vendor Phone Number (10 Digits)
            </label>
            <input
              className={`csap-form-input ${
                touched.vendorPhone && formErrors.vendorPhone
                  ? "csap-error-input"
                  : ""
              }`}
              type="tel"
              id="vendorPhone"
              name="vendorPhone"
              value={formData.vendorPhone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 9876543210"
            />
            {touched.vendorPhone && formErrors.vendorPhone && (
              <span className="csap-error-message">
                {formErrors.vendorPhone}
              </span>
            )}
          </div>

          <div className="csap-id-group">
            <div className="csap-id-type">
              <label className="csap-form-label" htmlFor="vendorIdType">
                Govt. ID Type
              </label>
              <select
                className="csap-form-select"
                id="vendorIdType"
                name="vendorIdType"
                value={formData.vendorIdType}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="Aadhaar">Aadhaar</option>
                <option value="PAN">PAN</option>
              </select>
            </div>
            <div className="csap-id-number">
              <label className="csap-form-label" htmlFor="vendorIdNumber">
                ID Number
              </label>
              <input
                className={`csap-form-input ${
                  touched.vendorIdNumber && formErrors.vendorIdNumber
                    ? "csap-error-input"
                    : ""
                }`}
                type="text"
                id="vendorIdNumber"
                name="vendorIdNumber"
                value={formData.vendorIdNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={
                  formData.vendorIdType === "Aadhaar"
                    ? "12-digit number"
                    : "e.g. AAAAA1111A"
                }
              />
              {touched.vendorIdNumber && formErrors.vendorIdNumber && (
                <span className="csap-error-message">
                  {formErrors.vendorIdNumber}
                </span>
              )}
            </div>
          </div>

          <hr className="csap-separator" />

          <h3 className="csap-subsection-title">Buyer Details (Purchaser)</h3>
          <div className="csap-form-group">
            <label className="csap-form-label" htmlFor="buyerName">
              Buyer Full Name
            </label>
            <input
              className={`csap-form-input ${
                touched.buyerName && formErrors.buyerName
                  ? "csap-error-input"
                  : ""
              }`}
              type="text"
              id="buyerName"
              name="buyerName"
              value={formData.buyerName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., Jane Smith"
            />
            {touched.buyerName && formErrors.buyerName && (
              <span className="csap-error-message">{formErrors.buyerName}</span>
            )}
          </div>

          <div className="csap-form-group">
            <label className="csap-form-label" htmlFor="buyerPhone">
              Buyer Phone Number (10 Digits)
            </label>
            <input
              className={`csap-form-input ${
                touched.buyerPhone && formErrors.buyerPhone
                  ? "csap-error-input"
                  : ""
              }`}
              type="tel"
              id="buyerPhone"
              name="buyerPhone"
              value={formData.buyerPhone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., 1234567890"
            />
            {touched.buyerPhone && formErrors.buyerPhone && (
              <span className="csap-error-message">
                {formErrors.buyerPhone}
              </span>
            )}
          </div>

          <div className="csap-id-group">
            <div className="csap-id-type">
              <label className="csap-form-label" htmlFor="buyerIdType">
                Govt. ID Type
              </label>
              <select
                className="csap-form-select"
                id="buyerIdType"
                name="buyerIdType"
                value={formData.buyerIdType}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="Aadhaar">Aadhaar</option>
                <option value="PAN">PAN</option>
              </select>
            </div>
            <div className="csap-id-number">
              <label className="csap-form-label" htmlFor="buyerIdNumber">
                ID Number
              </label>
              <input
                className={`csap-form-input ${
                  touched.buyerIdNumber && formErrors.buyerIdNumber
                    ? "csap-error-input"
                    : ""
                }`}
                type="text"
                id="buyerIdNumber"
                name="buyerIdNumber"
                value={formData.buyerIdNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder={
                  formData.buyerIdType === "Aadhaar"
                    ? "12-digit number"
                    : "e.g. AAAAA1111A"
                }
              />
              {touched.buyerIdNumber && formErrors.buyerIdNumber && (
                <span className="csap-error-message">
                  {formErrors.buyerIdNumber}
                </span>
              )}
            </div>
          </div>

          <div className="csap-button-group">
            <button
              type="button"
              className="csap-secondary-button csap-back-button"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="button"
              className={
                step2ButtonDisabled
                  ? "csap-disabled-button csap-next-button"
                  : "csap-primary-button csap-next-button"
              }
              onClick={handleNext}
              disabled={step2ButtonDisabled}
            >
              Next: Property & Terms
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Property & Sale Terms */}
      {step === 3 && (
        <div className="csap-form-container no-print">
          <h2 className="csap-step-title">Step 2: Property & Sale Terms</h2>

          <div className="csap-form-group">
            <label className="csap-form-label" htmlFor="propertyAddress">
              Property Address
            </label>
            <input
              className={`csap-form-input ${
                touched.propertyAddress && formErrors.propertyAddress
                  ? "csap-error-input"
                  : ""
              }`}
              type="text"
              id="propertyAddress"
              name="propertyAddress"
              value={formData.propertyAddress}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Full address of the property being sold"
            />
            {touched.propertyAddress && formErrors.propertyAddress && (
              <span className="csap-error-message">
                {formErrors.propertyAddress}
              </span>
            )}
          </div>

          <div className="csap-form-group">
            <label className="csap-form-label" htmlFor="jurisdiction">
              Jurisdiction (City/State)
            </label>
            <input
              className={`csap-form-input ${
                touched.jurisdiction && formErrors.jurisdiction
                  ? "csap-error-input"
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
              <span className="csap-error-message">
                {formErrors.jurisdiction}
              </span>
            )}
          </div>

          <div className="csap-sale-amount-group">
            <div className="csap-form-group csap-flex-1">
              <label className="csap-form-label" htmlFor="saleAmount">
                Total Sale Amount (₹)
              </label>
              <input
                className={`csap-form-input ${
                  touched.saleAmount && formErrors.saleAmount
                    ? "csap-error-input"
                    : ""
                }`}
                type="tel"
                id="saleAmount"
                name="saleAmount"
                value={formData.saleAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., 5000000"
              />
              {touched.saleAmount && formErrors.saleAmount && (
                <span className="csap-error-message">
                  {formErrors.saleAmount}
                </span>
              )}
            </div>
            <div className="csap-form-group csap-flex-1">
              <label className="csap-form-label" htmlFor="advanceAmount">
                Advance Amount (₹)
              </label>
              <input
                className={`csap-form-input ${
                  touched.advanceAmount && formErrors.advanceAmount
                    ? "csap-error-input"
                    : ""
                }`}
                type="tel"
                id="advanceAmount"
                name="advanceAmount"
                value={formData.advanceAmount}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., 500000"
              />
              {touched.advanceAmount && formErrors.advanceAmount && (
                <span className="csap-error-message">
                  {formErrors.advanceAmount}
                </span>
              )}
            </div>
          </div>

          <div className="csap-form-group">
            <label className="csap-form-label" htmlFor="saleDate">
              Agreement Date
            </label>
            <input
              className={`csap-form-input ${
                touched.saleDate && formErrors.saleDate
                  ? "csap-error-input"
                  : ""
              }`}
              type="date"
              id="saleDate"
              name="saleDate"
              value={formData.saleDate}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.saleDate && formErrors.saleDate && (
              <span className="csap-error-message">{formErrors.saleDate}</span>
            )}
          </div>

          <div className="csap-form-group">
            <label className="csap-form-label" htmlFor="registrationDays">
              Registration Timeline (Days)
            </label>
            <select
              className="csap-form-select"
              id="registrationDays"
              name="registrationDays"
              value={formData.registrationDays}
              onChange={handleChange}
              onBlur={handleBlur}
            >
              <option value="15">15 Days</option>
              <option value="30">30 Days</option>
              <option value="45">45 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
            </select>
          </div>

          <div className="csap-button-group">
            <button
              type="button"
              className="csap-secondary-button csap-back-button"
              onClick={handleBack}
            >
              Back
            </button>
            <button
              type="button"
              className={
                step3ButtonDisabled
                  ? "csap-disabled-button csap-next-button"
                  : "csap-primary-button csap-next-button"
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
          <h2 className="csap-step-title no-print">
            Step 3: Review & Print Agreement
          </h2>
          <p className="csap-review-subtitle no-print">
            Review the sale agreement below. You can print it or save it as a
            PDF before submitting.
          </p>

          <div id="printable-agreement">
            <SaleAgreementPreview
              formData={formData}
              ref={agreementPreviewRef}
            />
          </div>

          <div className="csap-button-group no-print">
            <button
              type="button"
              className="csap-secondary-button"
              onClick={handleBack}
            >
              Back
            </button>
            <button
              type="button"
              className="csap-secondary-button csap-print-button"
              onClick={handlePrint}
            >
              🖨️ Print/Save as PDF
            </button>
            <button type="submit" className="csap-primary-button">
              Submit Agreement
            </button>
          </div>
        </form>
      )}

      {/* Step 5: Success Message */}
      {step === 5 && (
        <div>
          <div className="csap-success-message no-print">
            <div className="csap-success-icon">🎉</div>
            <h2 className="csap-success-title">Sale Agreement Created!</h2>
            <p className="csap-success-text">
              The Sale Agreement between
              <strong className="csap-success-name">
                {" "}
                {formData.vendorName}{" "}
              </strong>
              (Vendor) and
              <strong className="csap-success-name">
                {" "}
                {formData.buyerName}{" "}
              </strong>
              (Buyer) has been successfully created. Thank you for using{" "}
              <strong>Zero Brokerage Platform</strong>!
            </p>
            <div className="csap-success-buttons">
              <button className="csap-secondary-button" onClick={handlePrint}>
                Download Duplicate
              </button>
              <button
                className="csap-primary-button csap-success-primary"
                onClick={() => navigate("/my-agreements")}
              >
                View My Agreements
              </button>
              <button
                className="csap-secondary-button"
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
        </div>
      )}
    </div>
  );
}

export default CreateSaleAgreementPage;
