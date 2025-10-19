-- ===================================================================
--  SAMPLE DATA SCRIPT FOR RealEstateProject
--  This script populates the database with test data for properties,
--  images, and deals, linking them to existing users and areas.
-- ===================================================================

-- ============================================
--  STEP 1: POPULATE PROPERTY TYPES (Prerequisite)
-- ============================================
-- This table needs data before properties can be added.
-- ============================================
--  STEP 2: INSERT SAMPLE PROPERTIES
-- ============================================
-- Make sure to run the user inserts first so that user_id=3 (seller1) exists.
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE property;
SET FOREIGN_KEY_CHECKS = 1;

-- Assuming seller1 has id=3 from your user insert script.
-- Assuming area_ids correspond to the order in your script (Jubilee Hills=2, Gachibowli=11, Kukatpally=25, Banjara Hills=1)
-- Assuming property_type_ids are 1=Apartment, 2=Villa, 3=Independent House, 4=Plot

INSERT INTO property (user_id, title, description, type, city, image_url, price_display, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, balconies, amenities, status, listing_type, owner_type, is_featured, is_active, is_verified, is_ready_to_move)
VALUES
-- Property 1: A premium, verified 3BHK apartment that is ready to move in.
(3, 'Luxury 3BHK Apartment in Jubilee Hills', 'A stunning, fully furnished 3BHK apartment located in the heart of Jubilee Hills. Comes with modular kitchen, premium fittings, and a beautiful city view. Part of a gated community with top-tier amenities.', 'Residential', 'Hyderabad', 'https://placehold.co/600x400/0000FF/FFFFFF?text=3BHK+JubileeHills', '₹ 2.5 Cr', 1, 2, 'Road No. 45, Near Peddamma Temple, Jubilee Hills', 25000000.00, 2200.00, 3, 3, 2, 'Swimming Pool,Gym,Clubhouse,24x7 Security,Power Backup', 'available', 'sale', 'owner', TRUE, TRUE, TRUE, TRUE),

-- Property 2: A spacious villa that is not yet verified.
(3, 'Spacious 4BHK Villa in Gachibowli', 'An elegant and spacious villa perfect for a large family, located near the Financial District. Features a private garden, servant quarters, and ample parking space.', 'Residential', 'Hyderabad', 'https://placehold.co/600x400/28a745/FFFFFF?text=4BHK+Villa', '₹ 4.2 Cr', 2, 11, 'Lane 5, Behind Wipro Circle, Gachibowli', 42000000.00, 3500.00, 4, 5, 3, 'Private Garden,Servant Quarters,CCTV Surveillance', 'available', 'sale', 'owner', TRUE, TRUE, FALSE, TRUE),

-- Property 3: A standard 2BHK apartment, marked as "sold" to test deal status.
(3, 'Cozy 2BHK Flat in Kukatpally', 'A well-maintained 2BHK flat in a prime location in Kukatpally, close to the metro station and markets. Ideal for small families or as an investment.', 'Residential', 'Hyderabad', 'https://placehold.co/600x400/dc3545/FFFFFF?text=2BHK+Kukatpally', '₹ 85 Lacs', 1, 25, 'KPHB 5th Phase, Near Forum Mall, Kukatpally', 8500000.00, 1250.00, 2, 2, 1, 'Lift,Car Parking,Municipal Water', 'sold', 'sale', 'owner', FALSE, TRUE, TRUE, TRUE),

-- Property 4: A plot of land for sale.
(3, 'Residential Plot in Banjara Hills', 'A prime residential plot available for sale in the prestigious Banjara Hills area. Perfect for building your dream home. Clear title and ready for registration.', 'Land', 'Hyderabad', 'https://placehold.co/600x400/ffc107/000000?text=Plot+for+Sale', '₹ 5 Cr', 4, 1, 'Road No. 12, Near Omega Hospital, Banjara Hills', 50000000.00, 4500.00, 0, 0, 0, 'Gated Community,Clear Title', 'available', 'sale', 'owner', FALSE, TRUE, TRUE, TRUE);


-- ============================================
--  STEP 3: INSERT PROPERTY IMAGES
-- ============================================
-- Link images to the properties created above (assuming their IDs are 1, 2, 3, 4)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE property_images;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO property_images (property_id, image_url, is_primary, display_order)
VALUES
-- Images for Property 1 (3BHK Jubilee Hills)
(1, 'https://placehold.co/600x400/0000FF/FFFFFF?text=3BHK+JubileeHills', TRUE, 0),
(1, 'https://placehold.co/600x400/5555FF/FFFFFF?text=Living+Room', FALSE, 1),
(1, 'https://placehold.co/600x400/7777FF/FFFFFF?text=Kitchen', FALSE, 2),
(1, 'https://placehold.co/600x400/9999FF/FFFFFF?text=Master+Bedroom', FALSE, 3),

-- Images for Property 2 (4BHK Villa Gachibowli)
(2, 'https://placehold.co/600x400/28a745/FFFFFF?text=4BHK+Villa', TRUE, 0),
(2, 'https://placehold.co/600x400/55b870/FFFFFF?text=Garden+View', FALSE, 1),
(2, 'https://placehold.co/600x400/82c99b/FFFFFF?text=Exterior', FALSE, 2),

-- Images for Property 3 (2BHK Kukatpally)
(3, 'https://placehold.co/600x400/dc3545/FFFFFF?text=2BHK+Kukatpally', TRUE, 0),
(3, 'https://placehold.co/600x400/e4606d/FFFFFF?text=Hall', FALSE, 1),

-- Images for Property 4 (Plot in Banjara Hills)
(4, 'https://placehold.co/600x400/ffc107/000000?text=Plot+for+Sale', TRUE, 0),
(4, 'https://placehold.co/600x400/ffd966/000000?text=Site+View', FALSE, 1);


-- ============================================
--  STEP 4: INSERT A SAMPLE DEAL STATUS
-- ============================================
-- Create a deal for Property 1, involving buyer1 (id=4) and agent1 (id=2)
TRUNCATE TABLE deal_status;

INSERT INTO deal_status (property_id, buyer_id, agent_id, stage, notes, agreed_price, buyer_doc_uploaded, seller_confirmed, inquiry_date, shortlist_date, negotiation_date, last_updated_by)
VALUES
(1, 4, 2, 'NEGOTIATION', 'Initial inquiry received. Site visit completed on Oct 18. Buyer has shown strong interest. First offer made at 2.3 Cr, negotiation in progress.', 23500000.00, FALSE, FALSE, '2025-10-17 10:00:00', '2025-10-18 15:00:00', '2025-10-19 11:30:00', 'agent1');


-- ============================================
--  STEP 5: FINAL VERIFICATION
-- ============================================

SELECT '==================================' as Status;
SELECT 'SAMPLE DATA INSERTION COMPLETED' as Message;
SELECT '==================================' as Status;

-- Check Property Types
SELECT 'Property Types Table:' as ``;
SELECT * FROM property_types;

-- Check Properties Table
SELECT 'Properties Table:' as ``;
SELECT id, user_id, title, price_display, status, is_verified FROM property;

-- Check Property Images Table
SELECT 'Property Images Table:' as ``;
SELECT property_id, image_url, is_primary FROM property_images ORDER BY property_id, display_order;

-- Check Deal Status Table
SELECT 'Deal Status Table:' as ``;
SELECT id, property_id, buyer_id, agent_id, stage, agreed_price FROM deal_status;