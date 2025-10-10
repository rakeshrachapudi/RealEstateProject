-- ============================================
-- COMPLETE DATABASE SETUP WITH USERS TABLE
-- This matches your User.java entity perfectly
-- ============================================

USE realestate_db;

-- ============================================
-- STEP 1: DISABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- STEP 2: DROP ALL TABLES (INCLUDING USERS)
-- ============================================
DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS property;
DROP TABLE IF EXISTS areas;
DROP TABLE IF EXISTS property_types;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS configuration;
DROP TABLE IF EXISTS users;  -- NOW WE DROP USERS TOO

-- ============================================
-- STEP 3: RE-ENABLE FOREIGN KEY CHECKS
-- ============================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- STEP 4: CREATE USERS TABLE FIRST
-- This MUST match your User.java entity exactly
-- ============================================
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mobile_number VARCHAR(20) UNIQUE,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(100) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    otp VARCHAR(10),
    otp_expiry_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mobile (mobile_number),
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- ============================================
-- STEP 5: INSERT DEFAULT USERS
-- ============================================

-- Admin user (password: admin123 - bcrypt encoded)
INSERT INTO users (mobile_number, username, password, email, first_name, last_name) 
VALUES 
('+919876543210', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8ssKQqpKUKKDRhBkM2', 'admin@realestate.com', 'Admin', 'User');

-- Test user (password: password123)
INSERT INTO users (mobile_number, username, password, email, first_name, last_name) 
VALUES 
('+919876543211', 'testuser', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'test@realestate.com', 'Test', 'User');

-- Property owners
INSERT INTO users (mobile_number, username, password, email, first_name, last_name) 
VALUES 
('+919876543212', 'owner1', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'owner1@realestate.com', 'Rajesh', 'Kumar'),
('+919876543213', 'owner2', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'owner2@realestate.com', 'Priya', 'Sharma'),
('+919876543214', 'owner3', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'owner3@realestate.com', 'Amit', 'Patel');

-- ============================================
-- STEP 6: CREATE OTHER TABLES
-- ============================================

-- Cities Table
CREATE TABLE cities (
    city_id INT PRIMARY KEY AUTO_INCREMENT,
    city_name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Areas Table
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

-- Property Types Table
CREATE TABLE property_types (
    property_type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Property Table
CREATE TABLE property (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(255),
    city VARCHAR(255),
    image_url VARCHAR(500),
    price_display VARCHAR(255),
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id BIGINT,
    FOREIGN KEY (property_type_id) REFERENCES property_types(property_type_id),
    FOREIGN KEY (area_id) REFERENCES areas(area_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_property_type (property_type_id),
    INDEX idx_area (area_id),
    INDEX idx_price (price),
    INDEX idx_listing_type (listing_type),
    INDEX idx_status (status),
    INDEX idx_city (city),
    INDEX idx_type (type),
    INDEX idx_user_id (user_id)
);

-- Property Images Table
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

-- Configuration Table
CREATE TABLE configuration (
    config_id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- STEP 7: INSERT REFERENCE DATA
-- ============================================

-- Insert Hyderabad City
INSERT INTO cities (city_name, state, is_active) VALUES 
('Hyderabad', 'Telangana', TRUE);

-- Insert Hyderabad Areas
INSERT INTO areas (city_id, area_name, pincode, is_active) VALUES 
(1, 'Banjara Hills', '500034', TRUE),
(1, 'Jubilee Hills', '500033', TRUE),
(1, 'Somajiguda', '500082', TRUE),
(1, 'Begumpet', '500016', TRUE),
(1, 'Ameerpet', '500038', TRUE),
(1, 'Punjagutta', '500082', TRUE),
(1, 'Himayatnagar', '500029', TRUE),
(1, 'Abids', '500001', TRUE),
(1, 'Nampally', '500001', TRUE),
(1, 'Madhapur', '500081', TRUE),
(1, 'Gachibowli', '500032', TRUE),
(1, 'HITEC City', '500081', TRUE),
(1, 'Kondapur', '500084', TRUE),
(1, 'Manikonda', '500089', TRUE),
(1, 'Narsingi', '500075', TRUE),
(1, 'Kokapet', '500075', TRUE),
(1, 'Financial District', '500032', TRUE),
(1, 'Secunderabad', '500003', TRUE),
(1, 'Tarnaka', '500017', TRUE),
(1, 'Uppal', '500039', TRUE),
(1, 'Habsiguda', '500007', TRUE),
(1, 'LB Nagar', '500074', TRUE),
(1, 'Dilsukhnagar', '500060', TRUE),
(1, 'Malakpet', '500036', TRUE),
(1, 'Kukatpally', '500072', TRUE),
(1, 'Miyapur', '500049', TRUE),
(1, 'KPHB Colony', '500072', TRUE),
(1, 'Nizampet', '500090', TRUE),
(1, 'Bachupally', '500090', TRUE),
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
('Farmhouse', 'Rural property with agricultural land', TRUE),
('Independent House', 'Standalone house with independent entrance', TRUE),
('PG', 'Paying Guest accommodation with shared facilities', TRUE),
('Flatmates', 'Shared apartment accommodation with roommates', TRUE),
('Builder Floor', 'Independent floor in a multi-story building', TRUE),
('Service Apartment', 'Furnished apartment with hotel-like services', TRUE);

-- Insert Configuration
INSERT INTO configuration (config_key, config_value, description) VALUES 
('ALLOWED_PINCODES', '500001,500003,500007,500008,500016,500017,500028,500029,500032,500033,500034,500036,500038,500039,500048,500049,500060,500072,500074,500075,500081,500082,500084,500089,500090,500409', 'Comma-separated list of allowed pincodes for Hyderabad'),
('DEFAULT_CITY', 'Hyderabad', 'Default city for property search'),
('MAX_SEARCH_RESULTS', '100', 'Maximum number of search results to return');

-- ============================================
-- STEP 8: INSERT SAMPLE PROPERTIES WITH PROPER user_id
-- ============================================

-- Properties owned by owner1 (user_id = 3)
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active, user_id) 
VALUES 
('Luxury 3BHK Apartment in Banjara Hills', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', '₹1.25 Cr', 
'Spacious 3BHK apartment with modern amenities, marble flooring, and scenic views.',
1, 1, 'Road No 12, Banjara Hills, Hyderabad - 500034', 
12500000, 2100, 3, 3, 'available', 'sale', 
'Swimming Pool, Gym, Parking, 24/7 Security, Power Backup, Clubhouse, Children Play Area', 
TRUE, TRUE, 3),

('Premium Villa in Jubilee Hills', 'Villa', 'Hyderabad', 
'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', '₹4.50 Cr', 
'Independent villa with private garden, 4 bedrooms, modern kitchen, and premium interiors.',
2, 2, 'Plot 145, Road No 36, Jubilee Hills, Hyderabad - 500033', 
45000000, 4500, 4, 5, 'available', 'sale', 
'Private Garden, Parking for 4 cars, Security, Clubhouse, Solar Panels, Rain Water Harvesting', 
TRUE, TRUE, 3);

-- Properties owned by owner2 (user_id = 4)
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active, user_id) 
VALUES 
('2BHK Ready to Move - Madhapur', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', '₹85 Lac', 
'Ready to move 2BHK apartment near IT hubs. Ideal for working professionals.',
1, 10, 'Cyber Towers Road, Madhapur, Hyderabad - 500081', 
8500000, 1400, 2, 2, 'available', 'sale', 
'Gym, Parking, Power Backup, Internet Ready, Modular Kitchen, Covered Parking', 
FALSE, TRUE, 4),

('Prime Commercial Space - Gachibowli', 'Commercial', 'Hyderabad', 
'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', '₹2.50 Cr', 
'Prime location office space in the heart of IT corridor.',
4, 11, 'HITEC City Main Road, Gachibowli, Hyderabad - 500032', 
25000000, 3000, 0, 2, 'available', 'sale', 
'Parking, Lift, Security, Cafeteria, Conference Room, Central AC', 
TRUE, TRUE, 4);

-- Properties owned by owner3 (user_id = 5)
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, address, price, area_sqft, bedrooms, bathrooms, status, listing_type, amenities, is_featured, is_active, user_id) 
VALUES 
('HMDA Approved Residential Plot', 'Plot', 'Hyderabad', 
'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', '₹65 Lac', 
'HMDA approved residential plot ready for construction.',
3, 13, 'Survey No 234, Kondapur Village, Hyderabad - 500084', 
6500000, 2400, 0, 0, 'available', 'sale', 
'HMDA Approved, Gated Community, Security, Street Lights, Underground Drainage, Water Supply', 
FALSE, TRUE, 5),

('3BHK Apartment for Rent', 'Apartment', 'Hyderabad', 
'https://images.unsplash.com/photo-1502672260066-6bc31f1a7c4f?w=800', '₹35,000/month', 
'Well maintained 3BHK apartment available for rent.',
1, 5, 'SR Nagar Main Road, Ameerpet, Hyderabad - 500038', 
35000, 1650, 3, 2, 'available', 'rent', 
'Parking, Water Supply, Security, Power Backup, Semi-Furnished, Balcony', 
FALSE, TRUE, 5),

('Ultra Luxury Penthouse - Banjara Hills', 'Penthouse', 'Hyderabad', 
'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', '₹8.50 Cr', 
'Ultra luxury penthouse with private terrace, 5 bedrooms, premium fixtures.',
5, 1, 'Road No 10, Banjara Hills, Hyderabad - 500034', 
85000000, 5500, 5, 6, 'available', 'sale', 
'Private Pool, Terrace Garden, Home Theater, Gym, Premium Imported Interiors, Private Elevator, Smart Home', 
TRUE, TRUE, 5),

('Spacious 4BHK Duplex Villa', 'Duplex', 'Hyderabad', 
'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', '₹1.85 Cr', 
'Spacious duplex villa with 4 bedrooms, modern kitchen, and all amenities.',
7, 25, 'KPHB Main Road, Kukatpally, Hyderabad - 500072', 
18500000, 3200, 4, 4, 'available', 'sale', 
'Parking, Garden, Security, Clubhouse, Swimming Pool, Gym, Children Play Area', 
FALSE, TRUE, 5);

-- ============================================
-- STEP 9: VERIFICATION
-- ============================================

SELECT '========== VERIFICATION ==========' as Status;

-- Check users
SELECT 'Users Table:' as Info;
SELECT id, username, email, first_name, last_name, mobile_number FROM users;

-- Check properties with user info
SELECT 'Properties with Owners:' as Info;
SELECT 
    p.id,
    p.title,
    p.price_display,
    p.user_id,
    u.username as owner_username,
    u.first_name as owner_first_name
FROM property p
LEFT JOIN users u ON p.user_id = u.id
LIMIT 10;
