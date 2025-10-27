// src/components/PropertyList.jsx (Complete File - Passes dealInfo Down)
import React from "react";
import PropertyCard from "./PropertyCard"; // Assuming PropertyCard is in the same folder
import { styles } from "../styles.js"; // Assuming shared styles

const PropertyList = ({
  properties, // This array now contains objects like { ...propertyData, dealInfo: dealObject | null }
  loading,
  onPropertyUpdated,
  onPropertyDeleted,
  onViewDealDetails // ⭐ Receive the handler from HomePage
}) => {

  // Debug log to check the props received by PropertyList
  // console.log("[PropertyList Render] Received properties (with potential dealInfo):", properties);
  // console.log("[PropertyList Render] Loading:", loading);

  if (loading) {
    return (
      <div style={styles.loadingState || { textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        ⏳ Loading properties...
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div style={styles.emptyState || { textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🏝️</span>
        No properties found matching your criteria.
      </div>
    );
  }

  return (
    <div style={styles.propertyGrid || { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
      {properties.map((propertyItem, index) => { // Use index as fallback key only if needed
        // ⭐ CRITICAL FIX: Extract dealInfo from the property item passed down from HomePage
        const { dealInfo, ...propertyData } = propertyItem; // Separates dealInfo from the rest of the property data

        // Use a reliable unique key - propertyData.id or propertyData.propertyId should exist
        const propertyId = propertyData.id || propertyData.propertyId || `prop-${index}`;

         // Debug log for each property being mapped
        // console.log(`[PropertyList Map] Rendering Card for Prop ID: ${propertyId}, Has dealInfo:`, !!dealInfo);

        return (
          <PropertyCard
            key={propertyId} // Use property's actual ID
            property={propertyData} // Pass the property data WITHOUT dealInfo inside it
            dealInfo={dealInfo}    // ⭐ Pass dealInfo explicitly as its own prop
            onPropertyUpdated={onPropertyUpdated}
            onPropertyDeleted={onPropertyDeleted}
            onViewDealDetails={onViewDealDetails} // ⭐ Pass the handler down
          />
        );
      })}
    </div>
  );
};

// Define default styles if not imported
styles.propertyGrid = styles.propertyGrid || { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' };
styles.loadingState = styles.loadingState || { textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '1.1rem' };
styles.emptyState = styles.emptyState || { textAlign: 'center', padding: '60px 20px', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' };

export default PropertyList;