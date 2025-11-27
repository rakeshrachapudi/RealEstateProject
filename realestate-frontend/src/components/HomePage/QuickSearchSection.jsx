// src/components/HomePage/QuickSearchSection.jsx
import React from "react";

function QuickSearchSection({
  quickSearchInput,
  quickSearchLoading,
  showQuickSearchResults,
  quickSearchResults,
  onSearchChange,
  onSearchSubmit,
  onClear,
}) {
  return (
    <section className="hp-quick-search">
      <div className="hp-quick-search-container">
        <h2 className="hp-section-title">
          <span className="hp-section-ic">🔍</span> Quick Property Search
        </h2>
        <p className="hp-section-subtitle">
          Search by area, property type, or keywords
        </p>

        <form onSubmit={onSearchSubmit} className="hp-quick-search-form">
          <div className="hp-quick-search-input-wrapper">
            <input
              type="text"
              placeholder="Try 'Gachibowli apartment' or '3BHK Madhapur'..."
              value={quickSearchInput}
              onChange={onSearchChange}
              className="hp-quick-search-input"
            />
            {quickSearchInput && (
              <button
                type="button"
                onClick={onClear}
                className="hp-quick-search-btn hp-quick-search-btn-clear"
              >
                <span className="hp-quick-search-icon">✕</span> Clear
              </button>
            )}
          </div>
        </form>

        {quickSearchLoading && (
          <div className="hp-quick-search-status">
            <span className="hp-quick-search-spinner">⏳</span> Searching...
          </div>
        )}

        {showQuickSearchResults && quickSearchResults.length === 0 && (
          <div className="hp-quick-search-status">
            <span className="hp-quick-search-icon">📭</span> No properties found
          </div>
        )}
      </div>
    </section>
  );
}

export default QuickSearchSection;