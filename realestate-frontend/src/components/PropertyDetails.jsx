import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { getPropertyDetails } from '../services/api';
import DealDetailsPopup from '../components/DealDetailsPopup';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  // Keep track of the user's specific deal (if any)
  const [myDeal, setMyDeal] = useState(null);
  const [showDealDetails, setShowDealDetails] = useState(false);
  const [checkingDeal, setCheckingDeal] = useState(false);
  // ⭐ NEW STATE: Tracks if *any* deal for this property is completed
  const [isPropertyDealCompleted, setIsPropertyDealCompleted] = useState(false);

  // Create Deal States (Agent specific)
  const [creatingDeal, setCreatingDeal] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [buyerPhone, setBuyerPhone] = useState('');

  // Interested Price States
  const [interestedPrice, setInterestedPrice] = useState('');
  const [priceRequestLoading, setPriceRequestLoading] = useState(false);
  const [priceRequestError, setPriceRequestError] = useState(null);
  const [priceRequestSuccess, setPriceRequestSuccess] = useState(null);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    // Check for deals once property details are loaded
    if (property?.id || property?.propertyId) {
      checkPropertyDealStatus(); // Check overall status first
    }
    // Check for *user-specific* deal if user is logged in
    if ((property?.id || property?.propertyId) && user?.id) {
        checkMySpecificDeal(); // Check if the current user is involved
    } else {
        setMyDeal(null); // Clear user-specific deal if not logged in
    }
  }, [property?.id, property?.propertyId, user?.id, user?.role]); // Dependencies


  const fetchPropertyDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming getPropertyDetails fetches property info including user/owner
      const data = await getPropertyDetails(id);
      setProperty(data);
    } catch (err) {
      console.error('Error fetching property details:', err);
      setError('Failed to load property details.');
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ NEW FUNCTION: Checks if ANY deal for this property is completed
  const checkPropertyDealStatus = async () => {
    const propertyId = property?.id || property?.propertyId;
    if (!propertyId) return;

    setIsPropertyDealCompleted(false); // Reset
    console.log(`🔍 Checking completion status for Property ID: ${propertyId}`);
    // No token needed if the endpoint is public or doesn't require auth just to check status
    // Add token if the endpoint requires authentication even for this check
    const token = localStorage.getItem('authToken') || '';
    try {
      const response = await fetch(
        `http://localhost:8080/api/deals/property/${propertyId}`,
        {
          // Add headers if needed, especially if endpoint is not public
           headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        let deals = [];
        if (data) {
           if (Array.isArray(data)) deals = data;
           else if (data.success && Array.isArray(data.data)) deals = data.data;
           else if (data.data && Array.isArray(data.data)) deals = data.data;
           else if (typeof data === 'object' && data !== null) deals = [data];
        }

        // Check if ANY deal in the list is completed
        const completedDealExists = deals.some(d => d.stage?.toUpperCase() === 'COMPLETED');
        if (completedDealExists) {
          setIsPropertyDealCompleted(true);
          console.log('✅ A deal for this property is COMPLETED.');
        } else {
          console.log('ℹ️ No completed deals found for this property.');
        }
      } else {
         console.warn(`⚠️ Failed to fetch deals to check completion status for property ${propertyId}. Status: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error checking property completion status:', err);
    }
  };


  // ⭐ RENAMED & MODIFIED: Checks for the CURRENT USER's specific deal
  const checkMySpecificDeal = async () => {
    if (!user?.id || !(property?.id || property?.propertyId)) return;

    setCheckingDeal(true); // Indicate loading specific deal info
    setMyDeal(null); // Reset user's deal
    const propertyId = property?.id || property?.propertyId;
    const token = localStorage.getItem('authToken') || '';

    console.log(`🔍 Checking user-specific deal for Property ID: ${propertyId}, User ID: ${user.id}`);

    try {
      // Fetch deals related to the property (requires auth)
      const response = await fetch(
        `http://localhost:8080/api/deals/property/${propertyId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;
        let deals = [];
         if (data) {
           if (Array.isArray(data)) deals = data;
           else if (data.success && Array.isArray(data.data)) deals = data.data;
           else if (data.data && Array.isArray(data.data)) deals = data.data;
           else if (typeof data === 'object' && data !== null) deals = [data];
        }

        // Find a deal where the current user is the buyer OR the agent
        const usersDeal = deals.find(d =>
            d.buyer?.id === user.id ||
            d.agent?.id === user.id
            // Add seller check if needed: || (d.property?.user?.id === user.id && user.role === 'SELLER')
        );

        if (usersDeal) {
            console.log(`✅ Found user's specific deal: ID ${usersDeal.id || usersDeal.dealId}, Stage: ${usersDeal.stage}`);
            setMyDeal(usersDeal); // Set the user's specific deal state
        } else {
            console.log('ℹ️ Current user is not directly involved in any deal for this property.');
        }

      } else {
         console.warn(`⚠️ Failed to fetch user-specific deals for property ${propertyId}. Status: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Error checking user-specific deal:', err);
    } finally {
      setCheckingDeal(false);
    }
  };


  // --- Create Deal (Agent only) ---
  const handleCreateDeal = async () => {
    // ... (logic remains the same, ensure checkForExistingDeal/checkMySpecificDeal is called after success) ...
    setCreateError(null);
    if (!buyerPhone || buyerPhone.length !== 10) {
      setCreateError('Please enter a valid 10-digit buyer phone number');
      return;
    }
    setCreatingDeal(true);
    const token = localStorage.getItem('authToken') || '';
    try {
      const searchResponse = await fetch(`http://localhost:8080/api/users/search?phone=${buyerPhone}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!searchResponse.ok) throw new Error('Error searching for buyer');
      const searchText = await searchResponse.text();
      const searchData = searchText ? JSON.parse(searchText) : null;
      const buyer = searchData?.success ? searchData.data : searchData;
      if (!buyer || !buyer.id) throw new Error('Buyer not found.');

      const createResponse = await fetch('http://localhost:8080/api/deals/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          propertyId: property.id || property.propertyId,
          buyerId: buyer.id,
          agentId: user.id,
        }),
      });
      const createText = await createResponse.text();
      const createData = createText ? JSON.parse(createText) : null;
      if (!createResponse.ok) throw new Error(createData?.message || 'Failed to create deal');

      alert('✅ Deal created successfully!');
      setBuyerPhone('');
      setCreateError(null);
      // Refresh both statuses after creating
      setTimeout(() => {
          checkPropertyDealStatus();
          checkMySpecificDeal();
      }, 500);
    } catch (err) {
      console.error("Error creating deal:", err);
      setCreateError('Error: ' + err.message);
    } finally {
      setCreatingDeal(false);
    }
  };

  // --- Submit Interested Price ---
  const handleSubmitInterestedPrice = async () => {
    // ... (logic remains the same) ...
     if (!interestedPrice || isNaN(parseFloat(interestedPrice)) || parseFloat(interestedPrice) <= 0) {
       setPriceRequestError('❌ Please enter a valid positive price.');
       return;
    }
    if (!user?.id) {
      setPriceRequestError('❌ You must be logged in to submit a price.');
      return;
    }
    setPriceRequestLoading(true);
    setPriceRequestError(null);
    setPriceRequestSuccess(null);
    const token = localStorage.getItem('authToken') || '';
    try {
      const response = await fetch('http://localhost:8080/api/properties/interested-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          propertyId: property.id || property.propertyId,
          userId: user.id,
          price: parseFloat(interestedPrice),
        }),
      });
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      if (response.ok) {
        setPriceRequestSuccess(data.message || '✅ Your price request has been submitted successfully!');
        setInterestedPrice('');
      } else {
        setPriceRequestError(data.message || `❌ Failed to submit request (Status: ${response.status})`);
      }
    } catch (err) {
      console.error("Error submitting price:", err);
      setPriceRequestError('❌ Network or server error: ' + err.message);
    } finally {
      setPriceRequestLoading(false);
    }
  };

  // Refreshes deal status (e.g., after closing popup)
  const handleRefreshDeal = () => {
    setShowDealDetails(false);
    checkPropertyDealStatus(); // Re-check overall status
    checkMySpecificDeal(); // Re-check user's specific deal
  };

  // Formats price (No change)
  const formatPrice = (price) => {
    if (price === null || price === undefined) return 'Price on request';
    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    if (isNaN(numPrice)) return 'Price on request';
    if (numPrice >= 10000000) return `₹${(numPrice / 10000000).toFixed(2)} Cr`;
    if (numPrice >= 100000) return `₹${(numPrice / 100000).toFixed(2)} Lac`;
    return `₹${numPrice.toLocaleString('en-IN')}`;
  };

  // ---------------------- UI Rendering ----------------------
  if (loading) { /* ... loading UI ... */
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}>⏳</div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error || !property) { /* ... error UI ... */
     return (
      <div style={styles.error}>
        <h2>{error || 'Property not found'}</h2>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          Go back to home
        </button>
      </div>
    );
  }

  // Prepare data for rendering
  const images = property.imageUrl ? [property.imageUrl] : ['https://via.placeholder.com/800x450.png?text=No+Image'];
  const amenitiesList = property.amenities ? property.amenities.split(',').map(a => a.trim()).filter(a => a) : [];
  const propertyType = property.propertyType?.typeName || property.type || 'N/A';
  const ownerName = property.user ? `${property.user.firstName || ''} ${property.user.lastName || ''}`.trim() : 'N/A';
  const isAgent = user && (user.role === 'AGENT' || user.role === 'ADMIN');
  const displayListingType = property.listingType?.toUpperCase() || (property.price ? 'SALE' : 'RENT');

  return (
    <div style={styles.container}>
      {/* Back Button */}
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Back
      </button>

      {/* Main Details Grid */}
      <div style={styles.detailsContainer}>
        {/* Image Section */}
        <div style={styles.imageSection}>
          <div style={styles.mainImage}>
            <img src={images[0]} alt={property.title || 'Property Image'} style={styles.largeImage} />
          </div>
        </div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          {/* Price and Featured Badge */}
          <div style={styles.priceSection}>
            <div style={styles.price}>
              {formatPrice(property.price)}
              {displayListingType === 'RENT' && <span style={styles.perMonth}>/month</span>}
            </div>
            {property.isFeatured && (<span style={styles.featuredBadge}>⭐ Featured</span>)}
          </div>

          {/* Title, Type Tag, Location */}
          <h1 style={styles.title}>{property.title || 'Untitled Property'}</h1>
          <div style={styles.typeTag}>FOR {displayListingType}</div>
          <div style={styles.location}>
            📍 {property.area?.areaName || property.city || 'N/A'}
            {property.area?.pincode && ` - ${property.area.pincode}`}
          </div>

          {/* Key Details (Beds, Baths, Area, Type) */}
          <div style={styles.keyDetails}>
            {/* ... Bed, Bath, AreaSqft, Type Cards ... */}
             <div style={styles.detailCard}><span style={styles.detailIcon}>🛏️</span><div><div style={styles.detailLabel}>Bedrooms</div><div style={styles.detailValue}>{property.bedrooms || 'N/A'}</div></div></div>
             <div style={styles.detailCard}><span style={styles.detailIcon}>🚿</span><div><div style={styles.detailLabel}>Bathrooms</div><div style={styles.detailValue}>{property.bathrooms || 'N/A'}</div></div></div>
             {property.areaSqft && (<div style={styles.detailCard}><span style={styles.detailIcon}>📐</span><div><div style={styles.detailLabel}>Area</div><div style={styles.detailValue}>{property.areaSqft} sqft</div></div></div>)}
             <div style={styles.detailCard}><span style={styles.detailIcon}>🏠</span><div><div style={styles.detailLabel}>Type</div><div style={styles.detailValue}>{propertyType}</div></div></div>
          </div>

          {/* Contact and Interaction Section */}
          <div style={styles.contactSection}>
            {ownerName !== 'N/A' && (<div style={styles.ownerInfo}>Listed by: <span style={styles.ownerName}>{ownerName}</span></div>)}

             {/* ⭐ Conditional Rendering based on isPropertyDealCompleted */}
             {isPropertyDealCompleted ? (
                // Show completed message to ALL users
                <div style={styles.dealClosedMessage}>
                  🎉 This property deal is settled and closed by Density!
                </div>
             ) : (
                // Show interactive elements only if deal is NOT completed
                <>
                  <h3 style={styles.contactTitle}>Contact Agent</h3>
                  <div style={styles.contactButtons}>
                    <button style={styles.contactOwnerBtn}>Contact Agent</button>
                    <button style={styles.getPhoneBtn}>Get Phone No.</button>
                    <button style={{ ...styles.favoriteBtn }} onClick={() => alert('Added to favorites!')} title="Add to Favorites">
                      ⭐ Add to Favorites
                    </button>
                  </div>

                  {/* Interested Price Section - Show only if logged in AND deal not completed */}
                  {user && (
                    <div style={styles.interestedPriceSection}>
                      <h3 style={styles.contactTitle}>💰 Submit Your Interested Price</h3>
                      <div style={styles.buyerInputContainer}>
                        <input
                          type="number"
                          placeholder="Enter your interested price (₹)"
                          value={interestedPrice}
                          onChange={(e) => {
                            setInterestedPrice(e.target.value);
                            setPriceRequestError(null);
                            setPriceRequestSuccess(null);
                          }}
                          style={styles.buyerInput}
                          disabled={priceRequestLoading}
                          min="1"
                        />
                        <button
                          onClick={handleSubmitInterestedPrice}
                          disabled={!interestedPrice || priceRequestLoading || isNaN(parseFloat(interestedPrice))}
                          style={{ ...styles.createDealBtn, opacity: (!interestedPrice || priceRequestLoading || isNaN(parseFloat(interestedPrice))) ? 0.6 : 1, cursor: (!interestedPrice || priceRequestLoading || isNaN(parseFloat(interestedPrice))) ? 'not-allowed' : 'pointer' }}
                        >
                          {priceRequestLoading ? '⏳ Submitting...' : 'Submit Request'}
                        </button>
                      </div>
                      {priceRequestError && <div style={styles.errorMessage}>{priceRequestError}</div>}
                      {priceRequestSuccess && <div style={styles.successMessage}>{priceRequestSuccess}</div>}
                    </div>
                  )}
                </>
             )}

            {/* Agent Deal Management Section - Show if user is Agent/Admin */}
            {/* This section appears regardless of completion status for agent's view */}
            {isAgent && (
              <div style={styles.dealSection}>
                <h3 style={styles.contactTitle}>🛡️ Agent Deal Management</h3>
                {checkingDeal ? ( // Checking specific deal for this user
                  <div style={styles.loadingDeal}>⏳ Checking your deal status...</div>
                ) : myDeal ? ( // Check if the current user has a deal
                  <>
                    {/* Badge shows overall property status, but info shows user's deal */}
                    <div style={{...styles.dealExistsBadge, backgroundColor: isPropertyDealCompleted ? '#dcfce7' : '#d1fae5', color: isPropertyDealCompleted ? '#166534' : '#065f46', borderColor: isPropertyDealCompleted ? '#86efac' : '#6ee7b7'}}>
                      <strong>{isPropertyDealCompleted ? '✅ Property Deal Completed' : '⏳ Property Deal Available'}</strong>
                    </div>
                     <div style={styles.dealStageInfo}>
                       <div style={styles.dealStageBadge}>Your Deal Stage: <strong>{myDeal.stage || 'N/A'}</strong></div>
                       <div style={styles.dealCreatedDate}>Created: {myDeal.createdAt ? new Date(myDeal.createdAt).toLocaleDateString() : 'N/A'}</div>
                     </div>
                    <button onClick={() => setShowDealDetails(true)} style={styles.viewDealBtn}>
                      👁️ View & Manage Your Deal
                    </button>
                  </>
                ) : (
                  <>
                    {/* Show overall status even if agent not involved */}
                     <div style={{...styles.noDealInfo, backgroundColor: isPropertyDealCompleted ? '#dcfce7' : '#fffbeb', color: isPropertyDealCompleted ? '#166534' : '#b45309', borderColor: isPropertyDealCompleted ? '#86efac' : '#fde68a'}}>
                       {isPropertyDealCompleted ? 'This property deal is closed.' : 'You are not assigned to a deal for this property.'}
                     </div>
                    {/* Allow agent to create a *new* deal only if property deal is NOT completed */}
                    {!isPropertyDealCompleted && (
                        <div style={styles.buyerInputContainer}>
                        <input
                            type="tel"
                            placeholder="Enter buyer phone (10 digits)"
                            value={buyerPhone}
                            onChange={(e) => {
                                const cleaned = e.target.value.replace(/\D/g, '');
                                setBuyerPhone(cleaned.slice(0, 10));
                                setCreateError(null);
                            }}
                            maxLength="10"
                            style={styles.buyerInput}
                            disabled={creatingDeal}
                        />
                        <button
                            onClick={handleCreateDeal}
                            disabled={creatingDeal || buyerPhone.length !== 10}
                            style={{ ...styles.createDealBtn, opacity: (creatingDeal || buyerPhone.length !== 10) ? 0.6 : 1, cursor: (creatingDeal || buyerPhone.length !== 10) ? 'not-allowed' : 'pointer' }}
                        >
                            {creatingDeal ? '⏳ Creating...' : '➕ Create New Deal'}
                        </button>
                        </div>
                    )}
                    {createError && (<div style={styles.errorMessage}>{createError}</div>)}
                  </>
                )}
              </div>
            )}
          </div> {/* End contactSection */}
        </div> {/* End infoSection */}
      </div> {/* End detailsContainer */}

      {/* More Details Section */}
      <div style={styles.moreDetails}>
         {/* ... More Details content (Price Breakup, Address, Description, Amenities) ... */}
         <h2 style={styles.sectionTitle}>More Details</h2>
         <div style={styles.detailsGrid}>
           <div style={styles.detailRow}><span style={styles.detailRowLabel}>Price Breakup:</span><span style={styles.detailRowValue}>{formatPrice(property.price)}</span></div>
           {property.address && (<div style={styles.detailRow}><span style={styles.detailRowLabel}>Address:</span><span style={styles.detailRowValue}>{property.address}</span></div>)}
           <div style={styles.detailRow}><span style={styles.detailRowLabel}>Ready to Move:</span><span style={styles.detailRowValue}>{property.isReadyToMove ? 'Yes' : 'No'}</span></div>
           <div style={styles.detailRow}><span style={styles.detailRowLabel}>Verification Status:</span><span style={styles.detailRowValue}>{property.isVerified ? 'Verified ✔️' : 'Pending'}</span></div>
         </div>
         {property.description && (<div style={styles.descriptionSection}><h3 style={styles.subSectionTitle}>Description</h3><p style={styles.description}>{property.description}</p></div>)}
         {amenitiesList.length > 0 && (<div style={styles.amenitiesSection}><h3 style={styles.subSectionTitle}>Amenities</h3><div style={styles.amenitiesGrid}>{amenitiesList.map((amenity, idx) => (<div key={idx} style={styles.amenityItem}>✓ {amenity}</div>))}</div></div>)}
      </div>

      {/* Deal Details Popup Modal - Show based on user's specific deal */}
      {showDealDetails && myDeal && (
        <DealDetailsPopup
          deal={myDeal} // Pass the user's specific deal
          onClose={handleRefreshDeal}
        />
      )}
    </div>
  );
};

// --- Styles Definition ---
// (Includes styles from previous version + dealClosedMessage)
const styles = {
  container: { maxWidth: 1200, margin: '40px auto', padding: '24px 32px', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', },
  loading: { textAlign: 'center', padding: '6rem 2rem', color: '#4b5563', },
  spinner: { fontSize: '3rem', marginBottom: '1rem', /* animation: 'spin 1s linear infinite', */ }, // Animation requires @keyframes
  error: { textAlign: 'center', padding: '6rem 2rem', color: '#dc2626', },
  backButton: { padding: '10px 20px', borderRadius: 8, background: '#4b5563', color: 'white', border: 'none', cursor: 'pointer', marginBottom: 24, fontSize: 14, fontWeight: 500, transition: 'background 0.2s', },
  detailsContainer: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 40, marginBottom: 40, },
  imageSection: { display: 'flex', flexDirection: 'column', gap: 16, },
  mainImage: { width: '100%', borderRadius: 12, overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.1)', aspectRatio: '16 / 10', },
  largeImage: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', },
  infoSection: { display: 'flex', flexDirection: 'column', gap: 24, },
  priceSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', },
  price: { fontSize: 36, fontWeight: 700, color: '#2563eb', },
  perMonth: { fontSize: 16, fontWeight: 500, color: '#6b7280', marginLeft: '8px', },
  featuredBadge: { backgroundColor: '#f59e0b', color: '#fff', padding: '8px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, letterSpacing: '0.5px', },
  title: { fontSize: 32, fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.3, },
  typeTag: { display: 'inline-block', padding: '6px 14px', backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: 6, fontSize: 13, fontWeight: 600, width: 'fit-content', },
  location: { fontSize: 16, color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px', },
  keyDetails: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 10, },
  detailCard: { display: 'flex', alignItems: 'center', gap: 12, padding: 16, backgroundColor: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb', },
  detailIcon: { fontSize: 28, color: '#6b7280', },
  detailLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px', },
  detailValue: { fontSize: 18, fontWeight: 600, color: '#111827', },
  contactSection: { backgroundColor: '#f9fafb', padding: 24, borderRadius: 12, border: '1px solid #e5e7eb', marginTop: 10, },
  contactTitle: { fontSize: 18, fontWeight: 600, color: '#1f2937', marginBottom: 16, marginTop: 0, paddingBottom: '8px', borderBottom: '1px solid #e5e7eb', },
  ownerInfo: { marginBottom: 16, fontSize: '14px', color: '#4b5563', },
  ownerName: { fontWeight: 600, color: '#1f2937', },
  contactButtons: { display: 'flex', gap: 12, marginBottom: 20, },
  contactOwnerBtn: { flex: 1, padding: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, textAlign: 'center', transition: 'background 0.2s', },
  getPhoneBtn: { flex: 1, padding: '12px', backgroundColor: 'white', color: '#dc2626', border: '2px solid #dc2626', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, textAlign: 'center', transition: 'background 0.2s, color 0.2s', },
  favoriteBtn: { flex: 1, padding: '12px', backgroundColor: '#fbbf24', color: '#422006', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, textAlign: 'center', transition: 'background 0.2s', },
  // ⭐ Style for the completed deal message shown to everyone
  dealClosedMessage: { padding: '16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', border: '1px solid #86efac', textAlign: 'center', fontWeight: '600', fontSize: '15px', margin: '10px 0 20px 0', },
  interestedPriceSection: { marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb', },
  dealSection: { marginTop: 20, paddingTop: 20, borderTop: '1px solid #e5e7eb', padding: 16, borderRadius: 8, },
  dealExistsBadge: { padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: 6, fontSize: 13, fontWeight: 600, marginBottom: 16, border: '1px solid #6ee7b7', textAlign: 'center', },
  dealStageInfo: { marginBottom: 16, padding: '12px', backgroundColor: '#f3f4f6', borderRadius: 8, border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', },
  dealStageBadge: { fontSize: 14, fontWeight: 600, color: '#1e40af', },
  dealCreatedDate: { fontSize: 12, color: '#64748b', fontStyle: 'italic', },
  noDealInfo: { padding: '12px', backgroundColor: '#fffbeb', color: '#b45309', borderRadius: 6, fontSize: 13, fontWeight: 500, marginBottom: 16, border: '1px solid #fde68a', textAlign: 'center', },
  loadingDeal: { padding: '12px', backgroundColor: '#e0e7ff', color: '#3730a3', borderRadius: 6, fontSize: 13, fontWeight: 600, textAlign: 'center', },
  errorMessage: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '10px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, marginTop: 12, border: '1px solid #fecaca', textAlign: 'center', },
  successMessage: { backgroundColor: '#d1fae5', color: '#065f46', padding: '10px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, marginTop: 12, border: '1px solid #6ee7b7', textAlign: 'center', },
  buyerInputContainer: { display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', },
  buyerInput: { flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, fontWeight: 500, boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s', },
  createDealBtn: { padding: '10px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer', fontSize: 14, transition: 'background 0.2s', whiteSpace: 'nowrap', },
  viewDealBtn: { width: '100%', padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14, transition: 'background 0.2s', marginTop: 'auto', },
  moreDetails: { backgroundColor: '#f9fafb', padding: 32, borderRadius: 12, border: '1px solid #e5e7eb', marginTop: '40px', },
  sectionTitle: { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 24, paddingBottom: '12px', borderBottom: '1px solid #e5e7eb', },
  detailsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px 30px', },
  detailRow: {}, // Removed styling as grid handles layout
  detailRowLabel: { fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: '4px', display: 'block', },
  detailRowValue: { fontSize: 15, color: '#111827', fontWeight: 600, },
  descriptionSection: { marginTop: 30, gridColumn: '1 / -1', },
  subSectionTitle: { fontSize: 18, fontWeight: 600, color: '#1f2937', marginBottom: 16, },
  description: { fontSize: 15, lineHeight: 1.7, color: '#374151', },
  amenitiesSection: { marginTop: 30, gridColumn: '1 / -1', },
  amenitiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, },
  amenityItem: { padding: '10px 14px', backgroundColor: '#f3f4f6', borderRadius: 6, fontSize: 14, color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', },
};

// Add keyframes for spinner animation in a separate CSS file or using a CSS-in-JS library
/*
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
*/

export default PropertyDetails;