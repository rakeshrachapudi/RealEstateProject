-- ============================================
-- COMPLETE AND CORRECTED DATABASE SCRIPT
-- Version: 5.0 (Ensures all columns match entities)
-- ============================================

CREATE DATABASE IF NOT EXISTS realestate_db;
USE realestate_db;

-- ============================================
-- STEP 1: SAFELY DROP ALL TABLES
-- ============================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS deal_status_audit;
DROP TABLE IF EXISTS property_images;
DROP TABLE IF EXISTS property;
DROP TABLE IF EXISTS areas;
DROP TABLE IF EXISTS property_types;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS configuration;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- STEP 2: CREATE TABLES IN CORRECT ORDER
-- ============================================

-- USERS (Parent table)
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mobile_number VARCHAR(20) UNIQUE,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(100) UNIQUE,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- CITIES (Parent table)
CREATE TABLE cities (
    city_id INT PRIMARY KEY AUTO_INCREMENT,
    city_name VARCHAR(100) NOT NULL UNIQUE,
    state VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PROPERTY_TYPES (Parent table)
CREATE TABLE property_types (
    property_type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AREAS (Depends on CITIES)
CREATE TABLE areas (
    area_id INT PRIMARY KEY AUTO_INCREMENT,
    city_id INT NOT NULL,
    area_name VARCHAR(200) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(city_id)
);

-- PROPERTY (Depends on USERS, AREAS, PROPERTY_TYPES)
CREATE TABLE property (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(255),
    city VARCHAR(255), -- THIS IS THE MISSING COLUMN
    price DECIMAL(15, 2),
    price_display VARCHAR(255),
    bedrooms INT,
    bathrooms INT,
    balconies INT,
    area_sqft DECIMAL(10, 2),
    address TEXT,
    amenities TEXT,
    image_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'available',
    listing_type VARCHAR(10) DEFAULT 'sale',
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    owner_type VARCHAR(20) DEFAULT 'owner',
    is_ready_to_move BOOLEAN DEFAULT FALSE,
    deal_status VARCHAR(50) DEFAULT 'INQUIRY',
    registration_proof_url VARCHAR(500),
    registration_confirmed_by VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id BIGINT,
    area_id INT,
    property_type_id INT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (area_id) REFERENCES areas(area_id),
    FOREIGN KEY (property_type_id) REFERENCES property_types(property_type_id)
);

-- DEAL_STATUS_AUDIT (Depends on PROPERTY, USERS)
CREATE TABLE deal_status_audit (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by_id BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by_id) REFERENCES users(id) ON DELETE SET NULL
);

-- PROPERTY_IMAGES (Depends on PROPERTY)
CREATE TABLE property_images (
    image_id INT PRIMARY KEY AUTO_INCREMENT,
    property_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE
);

-- ============================================
-- STEP 3: INSERT ALL DATA
-- ============================================

-- Insert Users
INSERT INTO users (username, password, email, first_name, last_name, role, mobile_number) VALUES
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8ssKQqpKUKKDRhBkM2', 'admin@zerobrokerage.com', 'Admin', 'User', 'ADMIN', '9999999999'),
('agent', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'agent@zerobrokerage.com', 'Agent', 'Smith', 'AGENT', '8888888888'),
('testuser', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'test@realestate.com', 'Test', 'User', 'USER', '7777777777');

-- Insert Cities
INSERT INTO cities (city_name, state) VALUES ('Hyderabad', 'Telangana');

-- Insert Hyderabad Areas
INSERT INTO areas (city_id, area_name, pincode, is_active) VALUES 
(1, 'Banjara Hills', '500034', TRUE), (1, 'Jubilee Hills', '500033', TRUE), (1, 'Somajiguda', '500082', TRUE),
(1, 'Begumpet', '500016', TRUE), (1, 'Ameerpet', '500038', TRUE), (1, 'Punjagutta', '500082', TRUE),
(1, 'Himayatnagar', '500029', TRUE), (1, 'Abids', '500001', TRUE), (1, 'Nampally', '500001', TRUE),
(1, 'Madhapur', '500081', TRUE), (1, 'Gachibowli', '500032', TRUE), (1, 'HITEC City', '500081', TRUE),
(1, 'Kondapur', '500084', TRUE), (1, 'Manikonda', '500089', TRUE), (1, 'Narsingi', '500075', TRUE),
(1, 'Kokapet', '500075', TRUE), (1, 'Financial District', '500032', TRUE), (1, 'Secunderabad', '500003', TRUE),
(1, 'Tarnaka', '500017', TRUE), (1, 'Uppal', '500039', TRUE), (1, 'Habsiguda', '500007', TRUE),
(1, 'LB Nagar', '500074', TRUE), (1, 'Dilsukhnagar', '500060', TRUE), (1, 'Malakpet', '500036', TRUE),
(1, 'Kukatpally', '500072', TRUE), (1, 'Miyapur', '500049', TRUE), (1, 'KPHB Colony', '500072', TRUE),
(1, 'Nizampet', '500090', TRUE), (1, 'Bachupally', '500090', TRUE), (1, 'Tolichowki', '500008', TRUE),
(1, 'Mehdipatnam', '500028', TRUE), (1, 'Attapur', '500048', TRUE), (1, 'Shamshabad', '500409', TRUE);

-- Insert Property Types
INSERT INTO property_types (type_name, description) VALUES
('Apartment', 'A self-contained housing unit that occupies only part of a building.'),
('Villa', 'A large and luxurious house.'),
('Plot', 'A piece of land for building or other purposes.');

-- Insert Properties
INSERT INTO property (title, type, city, image_url, price_display, description, property_type_id, area_id, price, area_sqft, bedrooms, bathrooms, listing_type, user_id, deal_status)
VALUES
('Modern 3BHK in Gachibowli', 'Apartment', 'Hyderabad', 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800', '₹1.5 Cr', 'A beautiful apartment in the heart of the IT corridor.', 1, 11, 15000000, 1800, 3, 3, 'sale', 2, 'NEGOTIATION'),
('Spacious Villa in Kondapur', 'Villa', 'Hyderabad', 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800', '₹3.2 Cr', 'A luxurious villa with a private garden.', 2, 13, 32000000, 3000, 4, 4, 'sale', 3, 'INQUIRY');

-- ============================================
-- STEP 4: VERIFICATION
-- ============================================
SELECT 'Database setup complete.' as Status;

