// src/components/HomePage/PropertiesSection.jsx
import React from "react";
import PropertyList from "../PropertyList";
import DealStatusCard from "../../DealStatusCard.jsx";

function PropertiesSection({
  activeTab,
  setActiveTab,
  selectedType,
  setSelectedType,
  propertyTypes,
  featuredPropsList,
  myProperties,
  myDeals,
  propertiesWithDeals,
  isDisplayingDeals,
  isLoading,
  loadingMyProperties,
  loadingMyDeals,
  sectionTitle,
  showSearchResults,
  showQuickSearchResults,
  selectedArea,
  canCreateDeal,
  isAuthenticated,
  onResetSearch,
  onCreateDealClick,
  onViewDealDetails,
  onPropertyUpdated,
  onPropertyDeleted,
}) {
  return (
    <section className="hp-properties">
      {/* Tabs */}
      {!showSearchResults && !showQuickSearchResults && !selectedArea && (
        <div className="hp-tabs">
          <button
            onClick={() => setActiveTab("featured")}
            className={`hp-tab ${activeTab === "featured" ? "active" : ""}`}
          >
            ⭐ Featured ({featuredPropsList.length})
          </button>

          <button
            onClick={() => setActiveTab("browse-by-type")}
            className={`hp-tab ${
              activeTab === "browse-by-type" ? "active" : ""
            }`}
          >
            🏘️ Browse by Type
          </button>

          {isAuthenticated &&
            (loadingMyProperties || myProperties.length > 0) && (
              <button
                onClick={() => setActiveTab("my-properties")}
                className={`hp-tab ${
                  activeTab === "my-properties" ? "active" : ""
                }`}
              >
                📄 My Properties ({myProperties.length})
              </button>
            )}

          {isAuthenticated && (loadingMyDeals || myDeals.length > 0) && (
            <button
              onClick={() => setActiveTab("my-deals")}
              className={`hp-tab ${activeTab === "my-deals" ? "active" : ""}`}
            >
              📊 My Deals ({myDeals.length})
            </button>
          )}
        </div>
      )}

      {/* Type Filter */}
      {activeTab === "browse-by-type" &&
        !showSearchResults &&
        !showQuickSearchResults &&
        !selectedArea && (
          <div className="hp-type-filter">
            {propertyTypes.map((type) => (
              <button
                key={type}
                className={`hp-type-chip ${
                  selectedType === type ? "selected" : ""
                }`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        )}

      {/* Section Header */}
      <div className="hp-section-header">
        <h2 className="hp-section-title">{sectionTitle}</h2>
        <div className="hp-section-actions">
          {(showSearchResults || showQuickSearchResults || selectedArea) && (
            <button onClick={onResetSearch} className="hp-btn hp-btn-clear">
              ✕ Clear Filter
            </button>
          )}
          {canCreateDeal && (
            <button
              onClick={onCreateDealClick}
              className="hp-btn hp-btn-primary"
            >
              ➕ Create New Deal
            </button>
          )}
        </div>
      </div>

      {/* Deals or Properties */}
      {isDisplayingDeals ? (
        isLoading ? (
          <div className="hp-loading">⏳ Loading your deals...</div>
        ) : myDeals.length === 0 ? (
          <div className="hp-empty">
            <div className="hp-empty-ic">🔭</div>
            <h3 className="hp-empty-title">No Deals Yet</h3>
            <p className="hp-empty-text">
              You are not currently involved in any deals.
            </p>
          </div>
        ) : (
          <div className="hp-deals-grid">
            {myDeals.map((deal) => (
              <DealStatusCard
                key={deal.dealId || deal.id}
                deal={deal}
                onViewDetails={onViewDealDetails}
              />
            ))}
          </div>
        )
      ) : (
       <PropertyList
         properties={
           activeTab === "featured"
             ? featuredPropsList
             : activeTab === "my-properties"
             ? myProperties
             : propertiesWithDeals
         }
         loading={isLoading}
         onPropertyUpdated={onPropertyUpdated}
         onPropertyDeleted={onPropertyDeleted}
         onViewDealDetails={onViewDealDetails}
       />

      )}
    </section>
  );
}

export default PropertiesSection;