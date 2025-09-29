CREATE DATABASE realestate_db;
USE realestate_db;

CREATE TABLE property (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    `type` VARCHAR(255),
    city VARCHAR(255),
    image_url VARCHAR(255),
    price_display VARCHAR(255)
);
INSERT INTO property (title, `type`, city, image_url, price_display) VALUES
('Luxury 3BHK Apartment', 'Apartment', 'Hyderabad', 'https://www.bing.com/th/id/OIP.cJ8_kTO_0mJtkydwA1u7mgHaDy?w=248&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2', '₹75,00,000'),
('Modern 2BHK Flat', 'Flat', 'Bangalore', 'https://www.bing.com/th/id/OIP.6zE2GNoHULPIi91Rg97j7gHaH3?w=190&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2', '₹55,00,000'),
('Independent Villa with Garden', 'Villa', 'Chennai', 'https://www.bing.com/th/id/OIP.YOsK2EvUhgpy_IgU_qihSgHaFY?w=278&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2', '₹1,25,00,000'),
('Budget 1BHK Studio', 'Studio', 'Pune', 'https://www.bing.com/th/id/OIP.tBOf_Y-Z-8U8HBnAPk_v1QHaEM?w=283&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2', '₹22,00,000'),
('Beachside Penthouse', 'Penthouse', 'Goa', 'https://www.bing.com/th/id/OIP.uwyyeCJJgCLS1q66krmiFgHaH3?w=190&h=211&c=8&rs=1&qlt=90&o=6&pid=3.1&rm=2', '₹3,50,00,000'),
('Penthouse', 'Penthouse', 'Mumbai', 'https://th.bing.com/th/id/OIP.PVMoar3qN0TP4lUQWnKIvwHaFj?w=188&h=180&c=7&r=0&o=7&pid=1.7&rm=3', '₹3,50,00,000'),
('Beachside Penthouse', 'Penthouse', 'Delhi', 'https://th.bing.com/th/id/OIP.O0dBXNaMJWoiKuduuwMtlgHaDt?w=305&h=180&c=7&r=0&o=7&pid=1.7&rm=3', '₹3,50,00,000');
SELECT * FROM property;
SHOW TABLES;
TRUNCATE TABLE property;