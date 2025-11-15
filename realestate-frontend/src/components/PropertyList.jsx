// src/components/PropertyList.jsx
import React from "react";
import PropertyCard from "./PropertyCard";
import "./PropertyList.css";

const PropertyList = ({
  properties, // Array of items: { ...propertyData, dealInfo? }
  loading,
  onPropertyUpdated,
  onPropertyDeleted,
  onViewDealDetails, // Handler bubbled up (e.g., from HomePage)
}) => {
  if (loading) {
    return (
      <div className="pl-state pl-loading" role="status" aria-live="polite">
        <span className="pl-loading-icon" aria-hidden="true">
          ⏳
        </span>
        <span className="pl-loading-text">Loading properties...</span>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="pl-state pl-empty" role="status" aria-live="polite">
        <span className="pl-empty-icon" aria-hidden="true">
          🏘️
        </span>
        <div className="pl-empty-title">No properties found</div>
        <div className="pl-empty-subtitle">
          Try adjusting filters like budget, property type, or area.
        </div>
      </div>
    );
  }

  return (
    <div className="pl-grid" role="list">
      {properties.map((propertyItem, index) => {
        const { dealInfo, ...propertyData } = propertyItem || {};
        const propertyId =
          propertyData?.id || propertyData?.propertyId || `prop-${index}`;

        return (
          <div className="pl-grid-item" role="listitem" key={propertyId}>
            <PropertyCard
              property={propertyData}
              dealInfo={dealInfo}
              onPropertyUpdated={onPropertyUpdated}
              onPropertyDeleted={onPropertyDeleted}
              onViewDealDetails={onViewDealDetails}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PropertyList;