import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyAgreementsPage.css";

// Create Agreement Buttons Component
const CreateAgreementButtons = ({ navigate }) => (
  <div className="map-button-group">
    <button
      className="map-button map-button-secondary"
      onClick={() => navigate("/rental-agreement")}
    >
      Create Rental Agreement
    </button>
    <button
      className="map-button map-button-primary"
      onClick={() => navigate("/sale-agreement")}
    >
      Create Sale Agreement
    </button>
  </div>
);

// Detail Item Component
const DetailItem = ({ label, value, span = 1 }) => (
  <div className={`map-detail-item ${span === 2 ? "map-detail-span-2" : ""}`}>
    <p className="map-detail-label">{label}:</p>
    <p className="map-detail-value">{value || "N/A"}</p>
  </div>
);

function MyAgreementsPage() {
  const [agreements, setAgreements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Loading agreements from localStorage...");
    setIsLoading(true);
    setError(null);

    try {
      const storedAgreementsRaw = localStorage.getItem("myAgreements");
      const storedAgreements = storedAgreementsRaw
        ? JSON.parse(storedAgreementsRaw)
        : [];

      console.log("Found locally stored agreements:", storedAgreements);
      setAgreements(storedAgreements);
    } catch (err) {
      console.error("Error loading agreements from localStorage:", err);
      setError(
        "Could not load locally stored agreements. Data might be corrupted."
      );
      setAgreements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDelete = (agreementId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this agreement? This action cannot be undone."
      )
    ) {
      return;
    }

    const updatedAgreements = agreements.filter(
      (ag) => ag.agreementId !== agreementId
    );

    setAgreements(updatedAgreements);
    try {
      localStorage.setItem("myAgreements", JSON.stringify(updatedAgreements));
      console.log(`Agreement ${agreementId} deleted successfully.`);
    } catch (err) {
      console.error(
        "Error saving agreements to localStorage after deletion:",
        err
      );
      alert(
        "Error: Could not save changes after deleting the agreement. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="map-container map-loading-container">
        <div className="map-spinner"></div>
        <p className="map-loading-text">Loading your agreements</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="map-container map-error-container">
        <div className="map-error-icon">⚠️</div>
        <p className="map-error-title">Could not load agreements</p>
        <p className="map-error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="map-page-header">
        <div className="map-header-content">
          <h1 className="map-page-title">My Agreements</h1>
          <p className="map-page-subtitle">
            Rental and Lease agreements created by you (Saved Locally).
          </p>
        </div>
        <CreateAgreementButtons navigate={navigate} />
      </div>

      {agreements.length === 0 ? (
        <div className="map-empty-state">
          <div className="map-empty-icon">📄</div>
          <p className="map-empty-text">
            You haven't created any rental agreements yet.
          </p>
          <p className="map-empty-subtext">
            Create your first agreement to get started!
          </p>
        </div>
      ) : (
        <div className="map-agreements-list">
          {agreements.map((agreement) => (
            <div key={agreement.agreementId} className="map-agreement-card">
              <div className="map-card-header">
                <h2 className="map-card-title">
                  {agreement.agreementType} #
                  {agreement.agreementId
                    ? agreement.agreementId.substring(6)
                    : "N/A"}
                </h2>
                <span
                  className={`map-status-badge ${
                    agreement.status === "ACTIVE"
                      ? "map-status-active"
                      : "map-status-inactive"
                  }`}
                >
                  {agreement.status || "N/A"}
                </span>
              </div>

              <div className="map-details-grid">
                {agreement.agreementType === "Sale Agreement" ? (
                  <>
                    <DetailItem label="Seller" value={agreement.vendorName} />
                    <DetailItem label="Buyer" value={agreement.buyerName} />
                    <DetailItem
                      label="Price"
                      value={`Rs ${agreement.saleAmount || "N/A"}`}
                    />
                    <DetailItem
                      label="Date"
                      value={
                        agreement.startDate
                          ? new Date(agreement.startDate).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <DetailItem
                      label="Property"
                      value={
                        agreement.propertyAddressShort ||
                        agreement.propertyAddress ||
                        "N/A"
                      }
                      span={2}
                    />
                  </>
                ) : (
                  <>
                    <DetailItem label="Owner" value={agreement.ownerName} />
                    <DetailItem label="Tenant" value={agreement.tenantName} />
                    <DetailItem
                      label="Property"
                      value={
                        agreement.propertyAddressShort ||
                        agreement.propertyAddress ||
                        "N/A"
                      }
                      span={2}
                    />
                    <DetailItem
                      label="Start Date"
                      value={
                        agreement.startDate
                          ? new Date(agreement.startDate).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <DetailItem
                      label="Duration"
                      value={`${
                        agreement.durationMonths || agreement.duration
                      } months`}
                    />
                  </>
                )}
              </div>

              <div className="map-card-actions">
                <button
                  className="map-action-button map-view-button"
                  onClick={() =>
                    navigate(`/view-agreement/${agreement.agreementId}`)
                  }
                >
                  View/Edit
                </button>
                <button
                  className="map-action-button map-delete-button"
                  onClick={() => handleDelete(agreement.agreementId)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAgreementsPage;
