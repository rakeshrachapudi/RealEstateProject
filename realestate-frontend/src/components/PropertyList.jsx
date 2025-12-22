// src/components/PropertyList.jsx
import React, { useState, useMemo, useEffect } from "react";
import PropertyCard from "./PropertyCard";
import "./PropertyList.css";

const PropertyList = ({
  properties,
  loading,
  loadingMore,
  onPropertyUpdated,
  onPropertyDeleted,
  onViewDealDetails,
  itemsPerPage = 9, // 3x3 grid
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate pagination
  const totalPages = Math.ceil((properties?.length || 0) / itemsPerPage);

  const paginatedProperties = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return properties.slice(startIndex, endIndex);
  }, [properties, currentPage, itemsPerPage]);

  // Reset to page 1 when properties change
  useEffect(() => {
    setCurrentPage(1);
  }, [properties?.length]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);

    // Scroll to the property listings section
    setTimeout(() => {
      // Try multiple selectors to find the listings section
      const listingsSection =
        document.querySelector('.hp-listings') || // HomePage listings section
        document.querySelector('.pl-container') || // PropertyList container
        document.querySelector('.pl-grid')?.parentElement; // Grid parent

      if (listingsSection) {
        const headerOffset = 100; // Account for fixed header
        const elementPosition = listingsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

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
      <div className="pl-state pl-empty">
        <span className="pl-empty-icon">🏘️</span>
        <div className="pl-empty-title">Properties coming soon</div>
        <div className="pl-empty-subtitle">
          We're adding verified listings for this section.
        </div>
      </div>
    );
  }

  return (
    <div className="pl-container">
      {/* Property Grid */}
      <div className="pl-grid" role="list">
        {paginatedProperties.map((propertyItem, index) => {
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

        {/* Show skeleton loaders while loading more */}
        {loadingMore && (
          <>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div className="pl-grid-item" key={`skeleton-${i}`}>
                <div className="pl-skeleton-card">
                  <div className="pl-skeleton-image"></div>
                  <div className="pl-skeleton-content">
                    <div className="pl-skeleton-line xl"></div>
                    <div className="pl-skeleton-line medium"></div>
                    <div className="pl-skeleton-line long"></div>
                    <div className="pl-skeleton-line short"></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loadingMore && (
        <>
          <div className="pl-pagination">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="pl-page-btn pl-page-prev"
              aria-label="Previous page"
            >
              ← Previous
            </button>

            <div className="pl-page-numbers">
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="pl-page-dots">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`pl-page-number ${
                        currentPage === page ? "active" : ""
                      }`}
                      aria-label={`Page ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="pl-page-btn pl-page-next"
              aria-label="Next page"
            >
              Next →
            </button>
          </div>

          {/* Results Info */}
          <div className="pl-results-info">
            Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(currentPage * itemsPerPage, properties.length)} of{" "}
            {properties.length} properties
          </div>
        </>
      )}
    </div>
  );
};

export default PropertyList;