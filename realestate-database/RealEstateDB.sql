-- ============================================
-- FRESH INSTALLATION SCRIPT
-- This will DROP all existing tables and create fresh ones
-- ⚠️ WARNING: ALL DATA WILL BE LOST!
-- ============================================

USE realestate_db;

-- ============================================
-- STEP 1: DISABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- STEP 2: DROP ALL EXISTING TABLES
-- ============================================

-- Drop child tables first (tables with foreign keys)
DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS property;

-- Drop reference tables
DROP TABLE IF EXISTS areas;
DROP TABLE IF EXISTS property_types;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS configuration;

-- Keep users table (your authentication data)
-- DROP TABLE IF EXISTS users; -- UNCOMMENT ONLY IF YOU WANT TO DELETE USERS TOO

-- ============================================
-- STEP 3: RE-ENABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- STEP 4: CREATE ALL TABLES FRESH
-- ============================================

-- Table 1: Cities
CREATE TABLE cities (
    city_id INT PRIMARY KEY AUTO_INCREMENT,
    city_name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table 2: Areas (localities with pincodes)
CREATE TABLE areas (
    area_id INT PRIMARY KEY AUTO_INCREMENT,
    city_id INT NOT NULL,
    area_name VARCHAR(200) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(city_id),
    INDEX idx_city_id (city_id),
    INDEX idx_pincode (pincode),
    UNIQUE KEY unique_area_pincode (city_id, area_name, pincode)
);

-- Table 3: Property Types
CREATE TABLE property_types (
    property_type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: Properties (Main table - completely redesigned)
CREATE TABLE property (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    
    -- Basic Info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Legacy fields (for backward compatibility)
    type VARCHAR(255),
    city VARCHAR(255),
    image_url VARCHAR(500),
    price_display VARCHAR(255),
    
    -- New enhanced fields
    property_type_id INT,
    area_id INT,
    address TEXT,
    price DECIMAL(15, 2),
    area_sqft DECIMAL(10, 2),
    bedrooms INT,
    bathrooms INT,
    amenities TEXT,
    status VARCHAR(20) DEFAULT 'available',
    listing_type VARCHAR(10) DEFAULT 'sale',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- User relation
    user_id BIGINT,
    
    -- Foreign Keys
    FOREIGN KEY (property_type_id) REFERENCES property_types(property_type_id),
    FOREIGN KEY (area_id) REFERENCES areas(area_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    
    -- Indexes for performance
    INDEX idx_property_type (property_type_id),
    INDEX idx_area (area_id),
    INDEX idx_price (price),
    INDEX idx_listing_type (listing_type),
    INDEX idx_status (status),
    INDEX idx_city (city),
    INDEX idx_type (type)
);

-- Table 5: Property Images (for multiple images per property)
CREATE TABLE property_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE,
    INDEX idx_property_id (property_id)
);

-- Table 6: Configuration (for system settings)
CREATE TABLE configuration (
    config_id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- STEP 5: INSERT INITIAL DATA
-- ============================================

-- Insert Hyderabad City
INSERT INTO cities (city_name, state, is_active) VALUES 
('Hyderabad', 'Telangana', TRUE);

-- Insert 33 Hyderabad Areas with Pincodes
INSERT INTO areas (city_id, area_name, pincode, is_active) VALUES 
-- Central Hyderabad
(1, 'Banjara Hills', '500034', TRUE),
(1, 'Jubilee Hills', '500033', TRUE),
(1, 'Somajiguda', '500082', TRUE),
(1, 'Begumpet', '500016', TRUE),
(1, 'Ameerpet', '500038', TRUE),
(1, 'Punjagutta', '500082', TRUE),
(1, 'Himayatnagar', '500029', TRUE),
(1, 'Abids', '500001', TRUE),
(1, 'Nampally', '500001', TRUE),

-- West Hyderabad (IT Corridor)
(1, 'Madhapur', '500081', TRUE),
(1, 'Gachibowli', '500032', TRUE),
(1, 'HITEC City', '500081', TRUE),
(1, 'Kondapur', '500084', TRUE),
(1, 'Manikonda', '500089', TRUE),
(1, 'Narsingi', '500075', TRUE),
(1, 'Kokapet', '500075', TRUE),
(1, 'Financial District', '500032', TRUE),

-- East Hyderabad
(1, 'Secunderabad', '500003', TRUE),
(1, 'Tarnaka', '500017', TRUE),
(1, 'Uppal', '500039', TRUE),
(1, 'Habsiguda', '500007', TRUE),
(1, 'LB Nagar', '500074', TRUE),
(1, 'Dilsukhnagar', '500060', TRUE),
(1, 'Malakpet', '500036', TRUE),

-- North Hyderabad
(1, 'Kukatpally', '500072', TRUE),
(1, 'Miyapur', '500049', TRUE),
(1, 'KPHB Colony', '500072', TRUE),
(1, 'Nizampet', '500090', TRUE),
(1, 'Bachupally', '500090', TRUE),

-- South Hyderabad
(1, 'Tolichowki', '500008', TRUE),
(1, 'Mehdipatnam', '500028', TRUE),
(1, 'Attapur', '500048', TRUE),
(1, 'Shamshabad', '500409', TRUE);

-- Insert Property Types
INSERT INTO property_types (type_name, description, is_active) VALUES 
('Apartment', 'Multi-unit residential building with shared amenities', TRUE),
('Villa', 'Independent house with private garden and parking', TRUE),
('Plot', 'Vacant land ready for construction', TRUE),
('Commercial', 'Office spaces, shops, and commercial buildings', TRUE),
('Penthouse', 'Luxury apartment on the top floor with premium amenities', TRUE),
('Studio', 'Single room apartment with combined living and sleeping area', TRUE),
('Duplex', 'Two-floor apartment with internal staircase', TRUE),
('Farmhouse', 'Rural property with agricultural land', TRUE);

-- Insert Configuration
INSERT INTO configuration (config_key, config_value, description) VALUES 
('ALLOWED_PINCODES', '500001,500003,500007,500008,500016,500017,500028,500029,500032,500033,500034,500036,500038,500039,500048,500049,500060,500072,500074,500075,500081,500082,500084,500089,500090,500409', 'Comma-separated list of allowed pincodes for Hyderabad'),
('DEFAULT_CITY', 'Hyderabad', 'Default city for property search'),
('MAX_SEARCH_RESULTS', '100', 'Maximum number of search results to return');

-- ============================================
-- STEP 6: INSERT SAMPLE PROPERTIES (Optional but Recommended)
-- ============================================

-- Sample Property 1: Luxury Apartment in Banjara Hills
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active) 
VALUES 
('Luxury 3BHK Apartment in Banjara Hills', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop', 
'₹1.25 Cr', 
'Spacious 3BHK apartment with modern amenities, marble flooring, and scenic views. Located in prime Banjara Hills with easy access to schools, hospitals, and shopping centers.',
1, 1, 'Road No 12, Banjara Hills, Hyderabad - 500034', 
12500000, 2100, 3, 3, 'available', 'sale', 
'Swimming Pool, Gym, Parking, 24/7 Security, Power Backup, Clubhouse, Children Play Area', 
TRUE, TRUE);

-- Sample Property 2: Premium Villa in Jubilee Hills
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active) 
VALUES 
('Premium Villa in Jubilee Hills', 'Villa', 'Hyderabad', 
'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop', 
'₹4.50 Cr', 
'Independent villa with private garden, 4 bedrooms, modern kitchen, and premium interiors. Perfect for families looking for luxury living.',
2, 2, 'Plot 145, Road No 36, Jubilee Hills, Hyderabad - 500033', 
45000000, 4500, 4, 5, 'available', 'sale', 
'Private Garden, Parking for 4 cars, Security, Clubhouse, Solar Panels, Rain Water Harvesting', 
TRUE, TRUE);

-- Sample Property 3: Modern 2BHK in Madhapur
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active) 
VALUES 
('2BHK Ready to Move - Madhapur', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop', 
'₹85 Lac', 
'Ready to move 2BHK apartment near IT hubs. Ideal for working professionals. Close to Cyber Towers, Inorbit Mall, and major tech parks.',
1, 10, 'Cyber Towers Road, Madhapur, Hyderabad - 500081', 
8500000, 1400, 2, 2, 'available', 'sale', 
'Gym, Parking, Power Backup, Internet Ready, Modular Kitchen, Covered Parking', 
FALSE, TRUE);

-- Sample Property 4: Commercial Space in Gachibowli
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active) 
VALUES 
('Prime Commercial Space - Gachibowli', 'Commercial', 'Hyderabad', 
'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop', 
'₹2.50 Cr', 
'Prime location office space in the heart of IT corridor. Suitable for startups and established businesses. High visibility and excellent connectivity.',
4, 11, 'HITEC City Main Road, Gachibowli, Hyderabad - 500032', 
25000000, 3000, 0, 2, 'available', 'sale', 
'Parking, Lift, Security, Cafeteria, Conference Room, Central AC', 
TRUE, TRUE);

-- Sample Property 5: Residential Plot in Kondapur
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active) 
VALUES 
('HMDA Approved Residential Plot', 'Plot', 'Hyderabad', 
'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop', 
'₹65 Lac', 
'HMDA approved residential plot ready for construction. Clear title, gated community with 24/7 security. All utilities available.',
3, 13, 'Survey No 234, Kondapur Village, Hyderabad - 500084', 
6500000, 2400, 0, 0, 'available', 'sale', 
'HMDA Approved, Gated Community, Security, Street Lights, Underground Drainage, Water Supply', 
FALSE, TRUE);

-- Sample Property 6: 3BHK for Rent in Ameerpet
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active) 
VALUES 
('3BHK Apartment for Rent', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1502672260066-6bc31f1a7c4f?w=800&h=600&fit=crop', 
'₹35,000/month', 
'Well maintained 3BHK apartment available for rent. Family-friendly neighborhood with schools, hospitals, and markets nearby. Metro connectivity.',
1, 5, 'SR Nagar Main Road, Ameerpet, Hyderabad - 500038', 
35000, 1650, 3, 2, 'available', 'rent', 
'Parking, Water Supply, Security, Power Backup, Semi-Furnished, Balcony', 
FALSE, TRUE);

-- Sample Property 7: Ultra Luxury Penthouse
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active) 
VALUES 
('Ultra Luxury Penthouse - Banjara Hills', 'Penthouse', 'Hyderabad', 
'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop', 
'₹8.50 Cr', 
'Ultra luxury penthouse with private terrace, 5 bedrooms, premium fixtures, and panoramic city views. One of the most prestigious addresses in Hyderabad.',
5, 1, 'Road No 10, Banjara Hills, Hyderabad - 500034', 
85000000, 5500, 5, 6, 'available', 'sale', 
'Private Pool, Terrace Garden, Home Theater, Gym, Premium Imported Interiors, Private Elevator, Smart Home', 
TRUE, TRUE);

-- Sample Property 8: Spacious Duplex in Kukatpally
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active) 
VALUES 
('Spacious 4BHK Duplex Villa', 'Duplex', 'Hyderabad', 
'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop', 
'₹1.85 Cr', 
'Spacious duplex villa with 4 bedrooms, modern kitchen, and all amenities. Gated community with excellent security and maintenance.',
7, 25, 'KPHB Main Road, Kukatpally, Hyderabad - 500072', 
18500000, 3200, 4, 4, 'available', 'sale', 
'Parking, Garden, Security, Clubhouse, Swimming Pool, Gym, Children Play Area', 
FALSE, TRUE);

-- ============================================
-- STEP 7: VERIFICATION QUERIES
-- ============================================

-- Verify all tables created
SELECT 'Tables Created' as Status;
SHOW TABLES;

-- Verify data counts
SELECT 'Data Counts' as Info;
SELECT 'Cities' as Table_Name, COUNT(*) as Count FROM cities
UNION ALL
SELECT 'Areas', COUNT(*) FROM areas
UNION ALL
SELECT 'Property Types', COUNT(*) FROM property_types
UNION ALL
SELECT 'Properties', COUNT(*) FROM property
UNION ALL
SELECT 'Configuration', COUNT(*) FROM configuration;

-- Show all areas with pincodes
SELECT 'Hyderabad Areas' as Info;
SELECT area_name, pincode FROM areas ORDER BY area_name;

-- Show all property types
SELECT 'Property Types' as Info;
SELECT type_name, description FROM property_types;

-- Show sample properties
SELECT 'Sample Properties' as Info;
SELECT id, title, type, city, price_display FROM property LIMIT 5;

-- Show configuration
SELECT 'Configuration' as Info;
SELECT config_key, description FROM configuration;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ ✅ ✅ DATABASE SETUP COMPLETED SUCCESSFULLY! ✅ ✅ ✅' as Status;
SELECT 'Backend is ready to start!' as Message;
SELECT 'Run: mvn spring-boot:run' as Next_Step;



====)CTOBER 10

-- ============================================
-- ADDITIONAL PROPERTY TYPES AND PROPERTIES
-- Run this AFTER the main database setup
-- ============================================

USE realestate_db;

-- ============================================
-- STEP 1: ADD MORE PROPERTY TYPES
-- ============================================

-- First, let's add property types that match your frontend dropdowns
INSERT IGNORE INTO property_types (type_name, description, is_active) VALUES 
('Independent House', 'Standalone house with independent entrance and no shared walls', TRUE),
('PG', 'Paying Guest accommodation with shared facilities', TRUE),
('Flatmates', 'Shared apartment accommodation with roommates', TRUE),
('Builder Floor', 'Independent floor in a multi-story building', TRUE),
('Service Apartment', 'Furnished apartment with hotel-like services', TRUE);

-- ============================================
-- STEP 2: DELETE OLD SAMPLE PROPERTIES (Optional)
-- If you want to start fresh, uncomment the line below
-- ============================================
-- DELETE FROM property WHERE id > 0;

-- ============================================
-- STEP 3: INSERT COMPREHENSIVE PROPERTY DATA
-- Covering all property types and areas
-- ============================================

-- ========== APARTMENTS FOR SALE ==========

INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active, user_id) 
VALUES 
-- Apartment 1: Gachibowli
('Spacious 3BHK Apartment - Gachibowli', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 
'₹95 Lac', 
'Modern 3BHK apartment in IT hub with premium fittings, ready to move. Near tech parks and metro station.',
1, 11, 'Gachibowli Main Road, Near DLF, Hyderabad - 500032', 
9500000, 1850, 3, 2, 'available', 'sale', 
'Clubhouse, Gym, Swimming Pool, 24/7 Security, Power Backup, Covered Parking, Modular Kitchen', 
TRUE, TRUE, NULL),

-- Apartment 2: Madhapur
('Luxury 2BHK Near HITEC City', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 
'₹78 Lac', 
'Premium 2BHK with modern amenities, close to major IT companies. Excellent investment opportunity.',
1, 10, 'Kavuri Hills, Madhapur, Hyderabad - 500081', 
7800000, 1350, 2, 2, 'available', 'sale', 
'Gym, Indoor Games, Parking, Security, Intercom, Vastu Compliant', 
TRUE, TRUE, NULL),

-- Apartment 3: Kondapur
('Ready to Move 2BHK - Kondapur', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1502672260066-6bc31f1a7c4f?w=800', 
'₹68 Lac', 
'Affordable 2BHK apartment with excellent connectivity. Near schools, hospitals, and shopping centers.',
1, 13, 'Botanical Garden Road, Kondapur, Hyderabad - 500084', 
6800000, 1200, 2, 2, 'available', 'sale', 
'Lift, Parking, Security, Water Supply, Power Backup', 
FALSE, TRUE, NULL),

-- Apartment 4: Kukatpally
('3BHK Spacious Flat - Kukatpally', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 
'₹72 Lac', 
'Well-ventilated 3BHK apartment in established residential area. Great for families.',
1, 25, 'KPHB Colony, Kukatpally, Hyderabad - 500072', 
7200000, 1550, 3, 2, 'available', 'sale', 
'Children Play Area, Gym, Parking, Security, Community Hall, Park', 
FALSE, TRUE, NULL),

-- Apartment 5: Miyapur
('Affordable 2BHK in Miyapur', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 
'₹55 Lac', 
'Budget-friendly 2BHK with metro connectivity. Perfect for first-time homebuyers.',
1, 26, 'Miyapur Main Road, Near Metro, Hyderabad - 500049', 
5500000, 1100, 2, 2, 'available', 'sale', 
'Metro Station Nearby, Parking, Lift, Security, 24/7 Water Supply', 
FALSE, TRUE, NULL);

-- ========== INDEPENDENT HOUSES FOR SALE ==========

INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active, user_id) 
VALUES 
-- Independent House 1: Jubilee Hills
('Luxury Independent House - Jubilee Hills', 'Independent House', 'Hyderabad', 
'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', 
'₹5.50 Cr', 
'Stunning independent house with modern architecture. 5 bedrooms, large garden, premium interiors.',
(SELECT property_type_id FROM property_types WHERE type_name = 'Independent House'), 2, 
'Plot 89, Road No 45, Jubilee Hills, Hyderabad - 500033', 
55000000, 5000, 5, 5, 'available', 'sale', 
'Private Garden, Parking for 5 cars, Servant Quarters, Modular Kitchen, Solar Panels, Rain Water Harvesting, Home Automation', 
TRUE, TRUE, NULL),

-- Independent House 2: Banjara Hills
('Spacious 4BHK Independent House', 'Independent House', 'Hyderabad', 
'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 
'₹3.80 Cr', 
'Well-maintained independent house in prime location. Perfect for large families. Ready to move.',
(SELECT property_type_id FROM property_types WHERE type_name = 'Independent House'), 1, 
'Road No 8, Banjara Hills, Hyderabad - 500034', 
38000000, 3800, 4, 4, 'available', 'sale', 
'Garden, Parking, Security, Puja Room, Study Room, Store Room, Balcony', 
TRUE, TRUE, NULL),

-- Independent House 3: Manikonda
('Modern Independent House - Manikonda', 'Independent House', 'Hyderabad', 
'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800', 
'₹1.85 Cr', 
'Contemporary design independent house with 3 bedrooms. Gated community with excellent amenities.',
(SELECT property_type_id FROM property_types WHERE type_name = 'Independent House'), 14, 
'Manikonda Village, Near ORR, Hyderabad - 500089', 
18500000, 2500, 3, 3, 'available', 'sale', 
'Gated Community, 24/7 Security, Clubhouse, Swimming Pool, Gym, Power Backup', 
FALSE, TRUE, NULL),

-- Independent House 4: Bachupally
('Spacious House with Garden - Bachupally', 'Independent House', 'Hyderabad', 
'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 
'₹1.45 Cr', 
'Independent house with large garden area. Peaceful neighborhood, great for families with children.',
(SELECT property_type_id FROM property_types WHERE type_name = 'Independent House'), 29, 
'Bachupally Main Road, Hyderabad - 500090', 
14500000, 2200, 3, 3, 'available', 'sale', 
'Large Garden, Parking, Bore Well, Rain Water Harvesting, Solar Water Heater', 
FALSE, TRUE, NULL),

-- Independent House 5: Nizampet
('Affordable Independent House - Nizampet', 'Independent House', 'Hyderabad', 
'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', 
'₹1.25 Cr', 
'Budget-friendly independent house perfect for nuclear families. Well-connected to major areas.',
(SELECT property_type_id FROM property_types WHERE type_name = 'Independent House'), 28, 
'Nizampet Road, Near Prashanth Nagar, Hyderabad - 500090', 
12500000, 2000, 3, 2, 'available', 'sale', 
'Parking, Bore Well, Corporation Water, Security, Near Schools and Hospitals', 
FALSE, TRUE, NULL);

-- ========== VILLAS FOR SALE ==========

INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active, user_id) 
VALUES 
-- Villa 1: Kokapet
('Luxury Villa with Private Pool', 'Villa', 'Hyderabad', 
'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 
'₹4.20 Cr', 
'Ultra-luxury villa with private swimming pool and landscaped garden. Premium imported fittings.',
2, 16, 'Kokapet Financial District, Hyderabad - 500075', 
42000000, 4800, 4, 5, 'available', 'sale', 
'Private Swimming Pool, Garden, Home Theater, Gym, Smart Home, Parking for 4 cars, Servant Quarters', 
TRUE, TRUE, NULL),

-- Villa 2: Narsingi
('Premium Gated Community Villa', 'Villa', 'Hyderabad', 
'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 
'₹2.85 Cr', 
'Beautiful villa in gated community with clubhouse and 24/7 security. Modern amenities.',
2, 15, 'Kollur Village, Narsingi, Hyderabad - 500075', 
28500000, 3500, 4, 4, 'available', 'sale', 
'Clubhouse, Swimming Pool, Gym, Security, Landscaped Garden, Parking, Power Backup', 
TRUE, TRUE, NULL),

-- Villa 3: Financial District
('Contemporary Villa - Financial District', 'Villa', 'Hyderabad', 
'https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=800', 
'₹3.50 Cr', 
'Modern architectural villa close to IT hubs. Premium location with excellent appreciation potential.',
2, 17, 'Nanakramguda, Financial District, Hyderabad - 500032', 
35000000, 4200, 4, 4, 'available', 'sale', 
'Private Garden, Parking, Security, Clubhouse Access, Premium Interiors, Vastu Compliant', 
TRUE, TRUE, NULL);

-- ========== PLOTS FOR SALE ==========

INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active, user_id) 
VALUES 
-- Plot 1: Shamshabad
('HMDA Approved Plot - Shamshabad', 'Plot', 'Hyderabad', 
'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 
'₹45 Lac', 
'HMDA approved residential plot near airport. Clear title, ready for construction.',
3, 33, 'Survey No 456, Shamshabad, Hyderabad - 500409', 
4500000, 2000, 0, 0, 'available', 'sale', 
'HMDA Approved, Clear Title, Gated Layout, Security, Water Connection, Electricity Available', 
FALSE, TRUE, NULL),

-- Plot 2: Bachupally
('Residential Plot in Gated Community', 'Plot', 'Hyderabad', 
'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 
'₹58 Lac', 
'Premium residential plot in gated community. All amenities available, 40ft wide roads.',
3, 29, 'Plot 234, Bachupally, Hyderabad - 500090', 
5800000, 2400, 0, 0, 'available', 'sale', 
'Gated Community, Security, Underground Drainage, Street Lights, Park, Club House Access', 
FALSE, TRUE, NULL),

-- Plot 3: Manikonda
('Corner Plot Ready for Construction', 'Plot', 'Hyderabad', 
'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', 
'₹72 Lac', 
'Corner plot with good Vastu. Near ORR, excellent connectivity to HITEC City.',
3, 14, 'Survey No 789, Manikonda, Hyderabad - 500089', 
7200000, 3000, 0, 0, 'available', 'sale', 
'Corner Plot, Wide Road, GHMC Approved, All Utilities, Good Vastu, Near ORR', 
FALSE, TRUE, NULL);

-- ========== APARTMENTS FOR RENT ==========

INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active, user_id) 
VALUES 
-- Rent 1: Gachibowli
('Fully Furnished 2BHK - Gachibowli', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 
'₹35,000/month', 
'Fully furnished 2BHK apartment with modern amenities. Perfect for IT professionals.',
1, 11, 'DLF Cyber City, Gachibowli, Hyderabad - 500032', 
35000, 1400, 2, 2, 'available', 'rent', 
'Fully Furnished, AC, Washing Machine, Refrigerator, Modular Kitchen, WiFi Ready, Parking', 
TRUE, TRUE, NULL),

-- Rent 2: Madhapur
('3BHK Semi-Furnished - Madhapur', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1502672260066-6bc31f1a7c4f?w=800', 
'₹42,000/month', 
'Spacious 3BHK semi-furnished apartment. Family-friendly with schools and hospitals nearby.',
1, 10, 'Ayyappa Society, Madhapur, Hyderabad - 500081', 
42000, 1650, 3, 2, 'available', 'rent', 
'Semi-Furnished, Parking, Lift, Security, Power Backup, Water Supply, Balcony', 
FALSE, TRUE, NULL),

-- Rent 3: HITEC City
('2BHK Ready to Move - HITEC City', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 
'₹32,000/month', 
'Ready to move 2BHK apartment near tech parks. Metro and bus connectivity available.',
1, 12, 'Cyber Gateway, HITEC City, Hyderabad - 500081', 
32000, 1300, 2, 2, 'available', 'rent', 
'Gym, Parking, Security, Maintenance, Lift, 24/7 Water Supply', 
FALSE, TRUE, NULL),

-- Rent 4: Kondapur
('Affordable 2BHK for Rent', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', 
'₹25,000/month', 
'Budget-friendly 2BHK apartment. Good for small families or working couples.',
1, 13, 'Kothaguda, Kondapur, Hyderabad - 500084', 
25000, 1150, 2, 2, 'available', 'rent', 
'Parking, Water Supply, Security, Bore Well, Corporation Water', 
FALSE, TRUE, NULL),

-- Rent 5: Kukatpally
('3BHK Family Apartment - Kukatpally', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 
'₹28,000/month', 
'Well-maintained 3BHK apartment in residential area. Near schools, malls, and metro.',
1, 25, 'JNTU, Kukatpally, Hyderabad - 500072', 
28000, 1500, 3, 2, 'available', 'rent', 
'Lift, Parking, Security, Children Play Area, Park, 24/7 Water', 
FALSE, TRUE, NULL);

-- ========== INDEPENDENT HOUSES FOR RENT ==========

INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active, user_id) 
VALUES 
-- House Rent 1: Manikonda
('3BHK Independent House - Manikonda', 'Independent House', 'Hyderabad', 
'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', 
'₹45,000/month', 
'Spacious independent house with garden. Perfect for families looking for privacy.',
(SELECT property_type_id FROM property_types WHERE type_name = 'Independent House'), 14, 
'Manikonda Village, Hyderabad - 500089', 
45000, 2200, 3, 3, 'available', 'rent', 
'Garden, Parking, Bore Well, Security, Solar Water Heater, Separate Entrance', 
TRUE, TRUE, NULL),

-- House Rent 2: Miyapur
('4BHK House for Family', 'Independent House', 'Hyderabad', 
'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', 
'₹38,000/month', 
'Large independent house suitable for joint families. Peaceful residential area.',
(SELECT property_type_id FROM property_types WHERE type_name = 'Independent House'), 26, 
'Miyapur Colony, Hyderabad - 500049', 
38000, 2500, 4, 3, 'available', 'rent', 
'Parking, Garden, Security, Corporation Water, Bore Well, Near Schools', 
FALSE, TRUE, NULL);

-- ========== PG ACCOMMODATIONS ==========

INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active, user_id) 
VALUES 
-- PG 1: Gachibowli
('Girls PG with Food - Gachibowli', 'PG', 'Hyderabad', 
'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 
'₹8,000/month', 
'Comfortable PG accommodation for working women. Homely food, clean rooms, good security.',
(SELECT property_type_id FROM property_types WHERE type_name = 'PG'), 11, 
'Gachibowli Circle, Near DLF, Hyderabad - 500032', 
8000, 150, 1, 1, 'available', 'rent', 
'Food Included, WiFi, AC, Washing Machine, Security, Housekeeping, Warden Available', 
FALSE, TRUE, NULL),

-- PG 2: Madhapur
('Boys PG Near HITEC City', 'PG', 'Hyderabad', 
'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 
'₹7,500/month', 
'Affordable PG for working professionals. Close to tech parks with good transport.',
(SELECT property_type_id FROM property_types WHERE type_name = 'PG'), 10, 
'Cyber Towers Road, Madhapur, Hyderabad - 500081', 
7500, 120, 1, 1, 'available', 'rent', 
'WiFi, Parking, Food Optional, Laundry, 24/7 Security, Power Backup', 
FALSE, TRUE, NULL),

-- PG 3: Ameerpet
('Premium PG for Working Professionals', 'PG', 'Hyderabad', 
'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 
'₹9,500/month', 
'Premium PG accommodation with all modern facilities. Separate rooms with attached bathrooms.',
(SELECT property_type_id FROM property_types WHERE type_name = 'PG'), 5, 
'SR Nagar Main Road, Ameerpet, Hyderabad - 500038', 
9500, 180, 1, 1, 'available', 'rent', 
'AC Rooms, WiFi, Food Included, Gym Access, Housekeeping, Security, Power Backup', 
FALSE, TRUE, NULL);

-- ========== COMMERCIAL PROPERTIES ==========

INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active, user_id) 
VALUES 
-- Commercial 1: Gachibowli
('Premium Office Space - Gachibowli', 'Commercial', 'Hyderabad', 
'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', 
'₹3.20 Cr', 
'Ready-to-use office space in prime IT corridor. Ideal for software companies.',
4, 11, 'Financial District Road, Gachibowli, Hyderabad - 500032', 
32000000, 3500, 0, 3, 'available', 'sale', 
'Central AC, Lift, Parking, Security, Power Backup, Cafeteria, Conference Rooms', 
TRUE, TRUE, NULL),

-- Commercial 2: Madhapur
('Commercial Space Near Tech Parks', 'Commercial', 'Hyderabad', 
'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', 
'₹2.50 Cr', 
'Well-located commercial property with high visibility. Suitable for various businesses.',
4, 10, 'Cyber Towers Main Road, Madhapur, Hyderabad - 500081', 
25000000, 2800, 0, 2, 'available', 'sale', 
'Lift, Parking, Security, Cafeteria, High-Speed Internet Ready, Conference Room', 
FALSE, TRUE, NULL);

-- ============================================
-- STEP 4: VERIFICATION QUERIES
-- ============================================

-- Count properties by type
SELECT 'Property Count by Type' as Info;
SELECT type as 'Property Type', COUNT(*) as 'Count' 
FROM property 
WHERE is_active = TRUE 
GROUP BY type 
ORDER BY COUNT(*) DESC;

-- Count properties by listing type
SELECT 'Property Count by Listing Type' as Info;
SELECT listing_type as 'Listing Type', COUNT(*) as 'Count' 
FROM property 
WHERE is_active = TRUE 
GROUP BY listing_type;

-- Show properties by area
SELECT 'Properties by Area' as Info;
SELECT a.area_name, COUNT(p.id) as property_count
FROM areas a
LEFT JOIN property p ON a.area_id = p.area_id AND p.is_active = TRUE
GROUP BY a.area_name
HAVING property_count > 0
ORDER BY property_count DESC;

-- Show all property types
SELECT 'All Property Types' as Info;
SELECT * FROM property_types ORDER BY type_name;

-- Show sample of each property type
SELECT 'Sample Properties' as Info;
SELECT id, title, type, listing_type, price_display, bedrooms, bathrooms
FROM property 
WHERE is_active = TRUE
ORDER BY type, listing_type
LIMIT 20;

-- ============================================
-- STEP 5: QUICK TEST QUERIES FOR FRONTEND
-- ============================================

-- Test query for Apartments for Sale (Your dropdown)
SELECT 'TEST: Apartments for Sale' as Test;
SELECT id, title, price_display, bedrooms, bathrooms 
FROM property 
WHERE type = 'Apartment' 
  AND listing_type = 'sale' 
  AND is_active = TRUE
LIMIT 5;

-- Test query for Independent Houses for Sale
SELECT 'TEST: Independent Houses for Sale' as Test;
SELECT id, title, price_display, bedrooms, bathrooms 
FROM property 
WHERE type = 'Independent House' 
  AND listing_type = 'sale' 
  AND is_active = TRUE
LIMIT 5;

-- Test query for Villas for Rent
SELECT 'TEST: Villas for Rent' as Test;
SELECT id, title, price_display, bedrooms, bathrooms 
FROM property 
WHERE type = 'Villa' 
  AND listing_type = 'rent' 
  AND is_active = TRUE
LIMIT 5;

-- Test query for Properties in Gachibowli
SELECT 'TEST: Properties in Gachibowli' as Test;
SELECT id, title, type, price_display 
FROM property p
JOIN areas a ON p.area_id = a.area_id
WHERE a.area_name = 'Gachibowli' 
  AND p.is_active = TRUE
LIMIT 5;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ ✅ ✅ PROPERTIES ADDED SUCCESSFULLY! ✅ ✅ ✅' as Status;
SELECT CONCAT('Total Active Properties: ', COUNT(*)) as Summary 
FROM property 
WHERE is_active = TRUE;
