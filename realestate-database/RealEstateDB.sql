-- ===================================================================
--    COMPLETE AND CONSOLIDATED DATABASE SCRIPT
--    Project: RealEstateProject
--    Version: Final
--
--    This script creates the database schema from scratch,
--    incorporating all table creations, alterations, and new
--    features from the provided files into a single, clean script.
-- ===================================================================

-- ============================================
--  STEP 1: DATABASE CREATION
-- ============================================
CREATE DATABASE IF NOT EXISTS defaultdb;
USE defaultdb;

-- ============================================
--  STEP 2: SAFELY DROP ALL EXISTING TABLES
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS deal_status;
DROP TABLE IF EXISTS property;
DROP TABLE IF EXISTS areas;
DROP TABLE IF EXISTS property_types;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS configuration;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
--  STEP 3: CREATE TABLES (FINALIZED SCHEMA)
-- ============================================
drop table users;
-- Users Table (OTP fields removed, role and status fields added)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    address VARCHAR(255),
    mobile_number VARCHAR(20) UNIQUE,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(100) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    role ENUM('USER', 'ADMIN', 'AGENT') NOT NULL DEFAULT 'USER',
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_mobile (mobile_number),
    INDEX idx_username (username),
    INDEX idx_email (email)
);

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

INSERT INTO property_types (property_type_id, type_name, description) VALUES
(1, 'Apartment', 'A self-contained residential unit within a building.'),
(2, 'Villa', 'A luxurious standalone residence, often with a garden or pool.'),
(3, 'House', 'A single-family dwelling typically detached or semi-detached.'),
(4, 'Plot', 'A piece of land available for building or investment purposes.'),
(5, 'Commercial', 'Property intended for business use such as offices or shops.'),
(6, 'Penthouse', 'A premium apartment located on the top floor of a building.'),
(7, 'Studio', 'A small single-room apartment combining living and sleeping spaces.'),
(8, 'Duplex', 'A two-level house or apartment connected by an internal staircase.');


-- Property Table (Consolidated with all new columns)
CREATE TABLE property (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(255), -- Maintained from original script
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
    balconies INT DEFAULT 0,
    amenities TEXT,
    status VARCHAR(20) DEFAULT 'available',
    listing_type VARCHAR(10) DEFAULT 'sale',
    owner_type VARCHAR(20) DEFAULT 'owner',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_ready_to_move BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_type_id) REFERENCES property_types(property_type_id),
    FOREIGN KEY (area_id) REFERENCES areas(area_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_property_type (property_type_id),
    INDEX idx_area (area_id),
    INDEX idx_price (price),
    INDEX idx_listing_type (listing_type),
    INDEX idx_status (status),
    INDEX idx_city (city)
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

-- Deal Status Table (New table for tracking deals)
CREATE TABLE deal_status (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    agent_id BIGINT,
    stage VARCHAR(50) DEFAULT 'INQUIRY' NOT NULL,
    notes TEXT,
    agreed_price DECIMAL(15,2),
    buyer_doc_url TEXT,
    buyer_doc_uploaded BOOLEAN DEFAULT FALSE,
    seller_confirmed BOOLEAN DEFAULT FALSE,
    admin_verified BOOLEAN DEFAULT FALSE,
    payment_initiated BOOLEAN DEFAULT FALSE,
    payment_completed BOOLEAN DEFAULT FALSE,
    inquiry_date TIMESTAMP NULL,
    shortlist_date TIMESTAMP NULL,
    negotiation_date TIMESTAMP NULL,
    agreement_date TIMESTAMP NULL,
    registration_date TIMESTAMP NULL,
    payment_date TIMESTAMP NULL,
    completed_date TIMESTAMP NULL,
    last_updated_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_property (property_id),
    INDEX idx_buyer (buyer_id),
    INDEX idx_agent (agent_id),
    INDEX idx_stage (stage)
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
--  STEP 4: INSERT REFERENCE & SAMPLE DATA
-- ============================================


-- Insert Cities
INSERT INTO cities (city_name, state) VALUES ('Hyderabad', 'Telangana');

-- Insert Areas
INSERT INTO areas (city_id, area_name, pincode) VALUES
(1, 'Banjara Hills', '500034'), (1, 'Jubilee Hills', '500033'), (1, 'Somajiguda', '500082'),
(1, 'Begumpet', '500016'), (1, 'Ameerpet', '500038'), (1, 'Punjagutta', '500082'),
(1, 'Himayatnagar', '500029'), (1, 'Abids', '500001'), (1, 'Nampally', '500001'),
(1, 'Madhapur', '500081'), (1, 'Gachibowli', '500032'), (1, 'HITEC City', '500081'),
(1, 'Kondapur', '500084'), (1, 'Manikonda', '500089'), (1, 'Narsingi', '500075'),
(1, 'Kokapet', '500075'), (1, 'Financial District', '500032'), (1, 'Secunderabad', '500003'),
(1, 'Tarnaka', '500017'), (1, 'Uppal', '500039'), (1, 'Habsiguda', '500007'),
(1, 'LB Nagar', '500074'), (1, 'Dilsukhnagar', '500060'), (1, 'Malakpet', '500036'),
(1, 'Kukatpally', '500072'), (1, 'Miyapur', '500049'), (1, 'KPHB Colony', '500072'),
(1, 'Nizampet', '500090'), (1, 'Bachupally', '500090'), (1, 'Tolichowki', '500008'),
(1, 'Mehdipatnam', '500028'), (1, 'Attapur', '500048'), (1, 'Shamshabad', '500409');

-- Insert Configuration
INSERT INTO configuration (config_key, config_value, description) VALUES
('ALLOWED_PINCODES', '500001,500003,500007,500008,500016,500017,500028,500029,500032,500033,500034,500036,500038,500039,500048,500049,500060,500072,500074,500075,500081,500082,500084,500089,500090,500409', 'Comma-separated list of allowed pincodes for Hyderabad'),
('DEFAULT_CITY', 'Hyderabad', 'Default city for property search'),
('MAX_SEARCH_RESULTS', '100', 'Maximum number of search results to return');

-- ============================================
--  STEP 5: FINAL VERIFICATION
-- ============================================

SELECT '==================================' as Status;
SELECT 'DATABASE SETUP SCRIPT COMPLETED' as Message;
SELECT '==================================' as Status;

-- Check Users Table
SELECT 'Users Table:' as ``;
SELECT id, username, email, role, is_active FROM users;

-- Check Properties Table
SELECT 'Properties Table:' as ``;
SELECT id, title, user_id, price_display, balconies, is_verified, owner_type, is_ready_to_move FROM property LIMIT 5;

-- Check Deal Status Table (will be empty)
SELECT 'Deal Status Table:' as ``;
SELECT * FROM deal_status;

-- =========================== Users ===========================
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

SELECT * FROM property;
SELECT * FROM users;

INSERT INTO users (username, mobile_number, password, email, first_name, last_name, role)
VALUES
('admin1',"1111111111", '$2a$12$oolzoLw6dMMN8ouCCXHDjeJldCOu2pi8HU1NyacUFBjYYKeb7oQTe', 'admin1@realestate.com', 'admin', '1', 'ADMIN'),
('agent1',"2222222222", '$2a$12$oolzoLw6dMMN8ouCCXHDjeJldCOu2pi8HU1NyacUFBjYYKeb7oQTe', 'agent1@realestate.com', 'agent', '1', 'AGENT'),
('seller1',"3333333333", '$2a$12$oolzoLw6dMMN8ouCCXHDjeJldCOu2pi8HU1NyacUFBjYYKeb7oQTe', 'seller1@realestate.com', 'seller', '1', 'USER'),
('buyer1',"4444444444", '$2a$12$oolzoLw6dMMN8ouCCXHDjeJldCOu2pi8HU1NyacUFBjYYKeb7oQTe', 'buyer1@realestate.com', 'buyer', '1', 'USER');

UPDATE users SET role = 'AGENT' WHERE username='agent1';
