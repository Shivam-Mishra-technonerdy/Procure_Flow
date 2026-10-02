-- =============================================================================
-- Migration: Add Realistic Global Demo Suppliers
-- Target Database: supplier_po_db (MySQL 8.0+)
-- Safety:
--   - Does NOT delete, overwrite, or modify existing supplier records.
--   - Existing suppliers remain is_demo = FALSE.
--   - Adds new records only, marked as is_demo = TRUE.
--   - All demo emails use the reserved non-routable @example.test domain.
-- =============================================================================

USE `supplier_po_db`;

-- Step 1: Add is_demo column if it does not exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'supplier_po_db' AND TABLE_NAME = 'suppliers' AND COLUMN_NAME = 'is_demo';

SET @ddl_col = IF(@col_exists = 0, 
    'ALTER TABLE `suppliers` ADD COLUMN `is_demo` BOOLEAN NOT NULL DEFAULT FALSE COMMENT \'Flags synthetic global demo suppliers\' AFTER `active`', 
    'SELECT "Column is_demo already exists"');
PREPARE stmt_col FROM @ddl_col;
EXECUTE stmt_col;
DEALLOCATE PREPARE stmt_col;

-- Step 2: Add index on is_demo if it does not exist
SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'supplier_po_db' AND TABLE_NAME = 'suppliers' AND INDEX_NAME = 'idx_suppliers_is_demo';

SET @ddl_idx = IF(@idx_exists = 0, 
    'CREATE INDEX `idx_suppliers_is_demo` ON `suppliers` (`is_demo`)', 
    'SELECT "Index idx_suppliers_is_demo already exists"');
PREPARE stmt_idx FROM @ddl_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;

-- Step 3: Guarantee existing legacy/production suppliers have is_demo = FALSE
UPDATE `suppliers` SET `is_demo` = FALSE WHERE `email` NOT LIKE '%@example.test';

-- Step 4: Insert 100 Realistic Global MNC Demo Suppliers
INSERT INTO `suppliers` (
    `name`, `contact_name`, `email`, `phone`, `category`, `address`,
    `phone_country_code`, `phone_number`, `country_code`, `address_line1`,
    `city`, `state_province`, `postal_code`, `active`, `is_demo`
) VALUES
-- ==================== GROUP 1: TECHNOLOGY ====================
('Apple', 'Arthur Pendelton', 'procurement.apple@example.test', '+1 408-555-0101', 'Technology', '1 Apple Park Way, Cupertino, CA 95014, US', '+1', '408-555-0101', 'US', '1 Apple Park Way', 'Cupertino', 'CA', '95014', TRUE, TRUE),
('Microsoft', 'Claire Redfield', 'procurement.microsoft@example.test', '+1 425-555-0102', 'Technology', 'One Microsoft Way, Redmond, WA 98052, US', '+1', '425-555-0102', 'US', 'One Microsoft Way', 'Redmond', 'WA', '98052', TRUE, TRUE),
('Amazon', 'Marcus Vance', 'procurement.amazon@example.test', '+1 206-555-0103', 'Technology', '410 Terry Ave N, Seattle, WA 98109, US', '+1', '206-555-0103', 'US', '410 Terry Ave N', 'Seattle', 'WA', '98109', TRUE, TRUE),
('Google', 'Elena Rostova', 'procurement.google@example.test', '+1 650-555-0104', 'Technology', '1600 Amphitheatre Pkwy, Mountain View, CA 94043, US', '+1', '650-555-0104', 'US', '1600 Amphitheatre Pkwy', 'Mountain View', 'CA', '94043', TRUE, TRUE),
('Meta', 'Julian Thorne', 'procurement.meta@example.test', '+1 650-555-0105', 'Technology', '1 Hacker Way, Menlo Park, CA 94025, US', '+1', '650-555-0105', 'US', '1 Hacker Way', 'Menlo Park', 'CA', '94025', TRUE, TRUE),
('NVIDIA', 'Siddharth Rao', 'procurement.nvidia@example.test', '+1 408-555-0106', 'Technology', '2788 San Tomas Expressway, Santa Clara, CA 95051, US', '+1', '408-555-0106', 'US', '2788 San Tomas Expressway', 'Santa Clara', 'CA', '95051', TRUE, TRUE),
('Intel', 'Samantha Brooks', 'procurement.intel@example.test', '+1 408-555-0107', 'Technology', '2200 Mission College Blvd, Santa Clara, CA 95054, US', '+1', '408-555-0107', 'US', '2200 Mission College Blvd', 'Santa Clara', 'CA', '95054', TRUE, TRUE),
('IBM', 'Vincent Sterling', 'procurement.ibm@example.test', '+1 914-555-0108', 'Technology', '1 New Orchard Rd, Armonk, NY 10504, US', '+1', '914-555-0108', 'US', '1 New Orchard Rd', 'Armonk', 'NY', '10504', TRUE, TRUE),
('Oracle', 'Nadia Al-Mansoor', 'procurement.oracle@example.test', '+1 737-555-0109', 'Technology', '2300 Oracle Way, Austin, TX 78741, US', '+1', '737-555-0109', 'US', '2300 Oracle Way', 'Austin', 'TX', '78741', TRUE, TRUE),
('Cisco', 'Donald Fletcher', 'procurement.cisco@example.test', '+1 408-555-0110', 'Technology', '170 West Tasman Dr, San Jose, CA 95134, US', '+1', '408-555-0110', 'US', '170 West Tasman Dr', 'San Jose', 'CA', '95134', TRUE, TRUE),

-- ==================== GROUP 2: ELECTRONICS ====================
('Samsung Electronics', 'Min-jun Kim', 'procurement.samsung@example.test', '+82 2-555-0111', 'Electronics', '129 Samsung-ro, Yeongtong-gu, Suwon-si, Gyeonggi-do 16677, KR', '+82', '2-555-0111', 'KR', '129 Samsung-ro, Yeongtong-gu', 'Suwon', 'Gyeonggi-do', '16677', TRUE, TRUE),
('LG Electronics', 'Ji-won Park', 'procurement.lge@example.test', '+82 2-555-0112', 'Electronics', '128 Yeoui-daero, Yeongdeungpo-gu, Seoul 07336, KR', '+82', '2-555-0112', 'KR', '128 Yeoui-daero, Yeongdeungpo-gu', 'Seoul', 'Seoul', '07336', TRUE, TRUE),
('Sony', 'Kenji Takahashi', 'procurement.sony@example.test', '+81 3-555-0113', 'Electronics', '1-7-1 Konan, Minato-ku, Tokyo 108-0075, JP', '+81', '3-555-0113', 'JP', '1-7-1 Konan, Minato-ku', 'Tokyo', 'Tokyo', '108-0075', TRUE, TRUE),
('Panasonic', 'Naoki Sato', 'procurement.panasonic@example.test', '+81 6-555-0114', 'Electronics', '1006 Oaza Kadoma, Kadoma-shi, Osaka 571-8501, JP', '+81', '6-555-0114', 'JP', '1006 Oaza Kadoma', 'Kadoma', 'Osaka', '571-8501', TRUE, TRUE),
('Hitachi', 'Yuki Tanaka', 'procurement.hitachi@example.test', '+81 3-555-0115', 'Electronics', '6-6 Marunouchi 1-chome, Chiyoda-ku, Tokyo 100-8280, JP', '+81', '3-555-0115', 'JP', '6-6 Marunouchi 1-chome, Chiyoda-ku', 'Tokyo', 'Tokyo', '100-8280', TRUE, TRUE),
('Huawei', 'Li Wei', 'procurement.huawei@example.test', '+86 755-555-0116', 'Electronics', 'Huawei Base, Bantian, Longgang District, Shenzhen 518129, CN', '+86', '755-555-0116', 'CN', 'Huawei Base, Bantian, Longgang', 'Shenzhen', 'Guangdong', '518129', TRUE, TRUE),
('Lenovo', 'Chen Bo', 'procurement.lenovo@example.test', '+86 10-555-0117', 'Electronics', 'No. 6 Chuangye Rd, Haidian District, Beijing 100085, CN', '+86', '10-555-0117', 'CN', 'No. 6 Chuangye Rd, Haidian', 'Beijing', 'Beijing', '100085', TRUE, TRUE),
('Xiaomi', 'Zhang Yong', 'procurement.xiaomi@example.test', '+86 10-555-0118', 'Electronics', 'No. 33 Xi''erqi Middle Rd, Haidian District, Beijing 100085, CN', '+86', '10-555-0118', 'CN', 'No. 33 Xi''erqi Middle Rd', 'Beijing', 'Beijing', '100085', TRUE, TRUE),
('TSMC', 'Hao-Ming Lin', 'procurement.tsmc@example.test', '+886 3-555-0119', 'Electronics', '8 Li-Hsin Rd 6, Hsinchu Science Park, Hsinchu 300-096, TW', '+886', '3-555-0119', 'TW', '8 Li-Hsin Rd 6, Science Park', 'Hsinchu', 'Hsinchu', '300-096', TRUE, TRUE),
('Foxconn', 'Kuo-Wei Huang', 'procurement.foxconn@example.test', '+886 2-555-0120', 'Electronics', 'No. 2 Ziyou St, Tucheng District, New Taipei City 23678, TW', '+886', '2-555-0120', 'TW', 'No. 2 Ziyou St, Tucheng District', 'New Taipei', 'New Taipei', '23678', TRUE, TRUE),

-- ==================== GROUP 3: AUTOMOTIVE ====================
('Toyota', 'Hiroshi Yamamoto', 'procurement.toyota@example.test', '+81 565-555-0121', 'Automotive', '1 Toyota-cho, Toyota City, Aichi Prefecture 471-8571, JP', '+81', '565-555-0121', 'JP', '1 Toyota-cho', 'Toyota City', 'Aichi', '471-8571', TRUE, TRUE),
('Honda', 'Takeshi Endo', 'procurement.honda@example.test', '+81 3-555-0122', 'Automotive', '2-1-1 Minami-Aoyama, Minato-ku, Tokyo 107-8556, JP', '+81', '3-555-0122', 'JP', '2-1-1 Minami-Aoyama, Minato-ku', 'Tokyo', 'Tokyo', '107-8556', TRUE, TRUE),
('Nissan', 'Kazuki Mori', 'procurement.nissan@example.test', '+81 45-555-0123', 'Automotive', '1-1-1 Takashima, Nishi-ku, Yokohama, Kanagawa 220-8686, JP', '+81', '45-555-0123', 'JP', '1-1-1 Takashima, Nishi-ku', 'Yokohama', 'Kanagawa', '220-8686', TRUE, TRUE),
('BMW', 'Maximilian Weber', 'procurement.bmw@example.test', '+49 89-555-0124', 'Automotive', 'Petuelring 130, 80788 Munich, DE', '+49', '89-555-0124', 'DE', 'Petuelring 130', 'Munich', 'Bavaria', '80788', TRUE, TRUE),
('Mercedes-Benz', 'Stefan Becker', 'procurement.mercedes@example.test', '+49 711-555-0125', 'Automotive', 'Mercedesstrasse 120, 70372 Stuttgart, DE', '+49', '711-555-0125', 'DE', 'Mercedesstrasse 120', 'Stuttgart', 'Baden-Wuerttemberg', '70372', TRUE, TRUE),
('Volkswagen Group', 'Felix Hoffmann', 'procurement.vw@example.test', '+49 5361-555-0126', 'Automotive', 'Berliner Ring 2, 38440 Wolfsburg, DE', '+49', '5361-555-0126', 'DE', 'Berliner Ring 2', 'Wolfsburg', 'Lower Saxony', '38440', TRUE, TRUE),
('Ford', 'Douglas Campbell', 'procurement.ford@example.test', '+1 313-555-0127', 'Automotive', 'One American Rd, Dearborn, MI 48126, US', '+1', '313-555-0127', 'US', 'One American Rd', 'Dearborn', 'MI', '48126', TRUE, TRUE),
('General Motors', 'Patricia Reynolds', 'procurement.gm@example.test', '+1 313-555-0128', 'Automotive', '300 Renaissance Center, Detroit, MI 48265, US', '+1', '313-555-0128', 'US', '300 Renaissance Center', 'Detroit', 'MI', '48265', TRUE, TRUE),
('Stellantis', 'Luciano Ferrari', 'procurement.stellantis@example.test', '+31 20-555-0129', 'Automotive', 'Taurusavenue 1, 2132 LS Hoofddorp, NL', '+31', '20-555-0129', 'NL', 'Taurusavenue 1', 'Hoofddorp', 'North Holland', '2132 LS', TRUE, TRUE),
('BYD', 'Wang Feng', 'procurement.byd@example.test', '+86 755-555-0130', 'Automotive', 'No. 3009 BYD Rd, Pingshan District, Shenzhen 518118, CN', '+86', '755-555-0130', 'CN', 'No. 3009 BYD Rd, Pingshan', 'Shenzhen', 'Guangdong', '518118', TRUE, TRUE),

-- ==================== GROUP 4: INDIAN CONGLOMERATES / TECH / FINANCE ====================
('Tata Group', 'Ratan Kulkarni', 'procurement.tatagroup@example.test', '+91 22-555-0131', 'Manufacturing', 'Bombay House, 24 Homi Mody St, Fort, Mumbai, MH 400001, IN', '+91', '22-555-0131', 'IN', 'Bombay House, 24 Homi Mody St', 'Mumbai', 'Maharashtra', '400001', TRUE, TRUE),
('Reliance Industries', 'Vikramaditya Ambani', 'procurement.reliance@example.test', '+91 22-555-0132', 'Energy', 'Maker Chambers IV, 222 Nariman Point, Mumbai, MH 400021, IN', '+91', '22-555-0132', 'IN', 'Maker Chambers IV, Nariman Point', 'Mumbai', 'Maharashtra', '400021', TRUE, TRUE),
('Infosys', 'Aarav Nambiar', 'procurement.infosys@example.test', '+91 80-555-0133', 'Technology', '44 Electronics City, Hosur Rd, Bengaluru, KA 560100, IN', '+91', '80-555-0133', 'IN', '44 Electronics City, Hosur Rd', 'Bengaluru', 'Karnataka', '560100', TRUE, TRUE),
('Wipro', 'Rohan Premji', 'procurement.wipro@example.test', '+91 80-555-0134', 'Technology', 'Doddakannelli, Sarjapur Rd, Bengaluru, KA 560035, IN', '+91', '80-555-0134', 'IN', 'Doddakannelli, Sarjapur Rd', 'Bengaluru', 'Karnataka', '560035', TRUE, TRUE),
('Tata Consultancy Services', 'Pooja Chandrasekaran', 'procurement.tcs@example.test', '+91 22-555-0135', 'Technology', 'TCS House, Raveline St, Fort, Mumbai, MH 400001, IN', '+91', '22-555-0135', 'IN', 'TCS House, Raveline St, Fort', 'Mumbai', 'Maharashtra', '400001', TRUE, TRUE),
('Mahindra & Mahindra', 'Anand Keshub', 'procurement.mahindra@example.test', '+91 22-555-0136', 'Automotive', 'Gateway Bldg, Apollo Bunder, Colaba, Mumbai, MH 400001, IN', '+91', '22-555-0136', 'IN', 'Gateway Bldg, Apollo Bunder', 'Mumbai', 'Maharashtra', '400001', TRUE, TRUE),
('ITC', 'Devendra Puri', 'procurement.itc@example.test', '+91 33-555-0137', 'Food & Beverage', 'Virginia House, 37 J.L. Nehru Rd, Kolkata, WB 700071, IN', '+91', '33-555-0137', 'IN', 'Virginia House, 37 J.L. Nehru Rd', 'Kolkata', 'West Bengal', '700071', TRUE, TRUE),
('Adani Group', 'Gautam Singhania', 'procurement.adani@example.test', '+91 79-555-0138', 'Logistics', 'Adani Shantigram, SG Highway, Ahmedabad, GJ 382421, IN', '+91', '79-555-0138', 'IN', 'Adani Shantigram, SG Highway', 'Ahmedabad', 'Gujarat', '382421', TRUE, TRUE),
('Bharti Airtel', 'Sunil Jagdish', 'procurement.airtel@example.test', '+91 11-555-0139', 'Technology', 'Bharti Crescent, 1 Nelson Mandela Rd, New Delhi, DL 110070, IN', '+91', '11-555-0139', 'IN', '1 Nelson Mandela Rd, Vasant Kunj', 'New Delhi', 'Delhi', '110070', TRUE, TRUE),
('HDFC Bank', 'Sanjay Jagdishan', 'procurement.hdfcbank@example.test', '+91 22-555-0140', 'Finance', 'HDFC Bank House, Senapati Bapat Marg, Lower Parel, Mumbai, MH 400013, IN', '+91', '22-555-0140', 'IN', 'HDFC Bank House, Lower Parel', 'Mumbai', 'Maharashtra', '400013', TRUE, TRUE),

-- ==================== GROUP 5: RETAIL & LOGISTICS ====================
('Walmart', 'Bradford Miller', 'procurement.walmart@example.test', '+1 479-555-0141', 'Retail', '702 SW 8th St, Bentonville, AR 72716, US', '+1', '479-555-0141', 'US', '702 SW 8th St', 'Bentonville', 'AR', '72716', TRUE, TRUE),
('Costco', 'Craig Jelinek', 'procurement.costco@example.test', '+1 425-555-0142', 'Retail', '999 Lake Dr, Issaquah, WA 98027, US', '+1', '425-555-0142', 'US', '999 Lake Dr', 'Issaquah', 'WA', '98027', TRUE, TRUE),
('Target', 'Brian Cornell', 'procurement.target@example.test', '+1 612-555-0143', 'Retail', '1000 Nicollet Mall, Minneapolis, MN 55403, US', '+1', '612-555-0143', 'US', '1000 Nicollet Mall', 'Minneapolis', 'MN', '55403', TRUE, TRUE),
('Home Depot', 'Ted Decker', 'procurement.homedepot@example.test', '+1 770-555-0144', 'Retail', '2455 Paces Ferry Rd NW, Atlanta, GA 30339, US', '+1', '770-555-0144', 'US', '2455 Paces Ferry Rd NW', 'Atlanta', 'GA', '30339', TRUE, TRUE),
('IKEA', 'Lars Jonsson', 'procurement.ikea@example.test', '+46 476-555-0145', 'Retail', 'Tulpanvagen 1, 343 34 Almhult, SE', '+46', '476-555-0145', 'SE', 'Tulpanvagen 1', 'Almhult', 'Kronoberg', '343 34', TRUE, TRUE),
('DHL', 'Tobias Meyer', 'procurement.dhl@example.test', '+49 228-555-0146', 'Logistics', 'Charles-de-Gaulle-Strasse 20, 53113 Bonn, DE', '+49', '228-555-0146', 'DE', 'Charles-de-Gaulle-Strasse 20', 'Bonn', 'North Rhine-Westphalia', '53113', TRUE, TRUE),
('FedEx', 'Raj Subramaniam', 'procurement.fedex@example.test', '+1 901-555-0147', 'Logistics', '942 S Shady Grove Rd, Memphis, TN 38120, US', '+1', '901-555-0147', 'US', '942 S Shady Grove Rd', 'Memphis', 'TN', '38120', TRUE, TRUE),
('UPS', 'Carol Tome', 'procurement.ups@example.test', '+1 404-555-0148', 'Logistics', '55 Glenlake Pkwy NE, Atlanta, GA 30328, US', '+1', '404-555-0148', 'US', '55 Glenlake Pkwy NE', 'Atlanta', 'GA', '30328', TRUE, TRUE),
('Maersk', 'Vincent Clerc', 'procurement.maersk@example.test', '+45 33-555-0149', 'Logistics', 'Esplanaden 50, 1098 Copenhagen K, DK', '+45', '33-555-0149', 'DK', 'Esplanaden 50', 'Copenhagen', 'Hovedstaden', '1098', TRUE, TRUE),
('Cargill', 'Brian Sikes', 'procurement.cargill@example.test', '+1 952-555-0150', 'Food & Beverage', '15407 McGinty Rd W, Wayzata, MN 55391, US', '+1', '952-555-0150', 'US', '15407 McGinty Rd W', 'Wayzata', 'MN', '55391', TRUE, TRUE),

-- ==================== GROUP 6: FOOD & BEVERAGE / CONSUMER GOODS ====================
('Coca-Cola', 'James Quincey', 'procurement.cocacola@example.test', '+1 404-555-0151', 'Food & Beverage', 'One Coca-Cola Plaza, Atlanta, GA 30313, US', '+1', '404-555-0151', 'US', 'One Coca-Cola Plaza', 'Atlanta', 'GA', '30313', TRUE, TRUE),
('PepsiCo', 'Ramon Laguarta', 'procurement.pepsico@example.test', '+1 914-555-0152', 'Food & Beverage', '700 Anderson Hill Rd, Purchase, NY 10577, US', '+1', '914-555-0152', 'US', '700 Anderson Hill Rd', 'Purchase', 'NY', '10577', TRUE, TRUE),
('Nestlé', 'Mark Schneider', 'procurement.nestle@example.test', '+41 21-555-0153', 'Food & Beverage', 'Avenue Nestle 55, 1800 Vevey, CH', '+41', '21-555-0153', 'CH', 'Avenue Nestle 55', 'Vevey', 'Vaud', '1800', TRUE, TRUE),
('Unilever', 'Hein Schumacher', 'procurement.unilever@example.test', '+44 20-555-0154', 'Food & Beverage', '100 Victoria Embankment, London EC4Y 0DY, GB', '+44', '20-555-0154', 'GB', '100 Victoria Embankment', 'London', 'Greater London', 'EC4Y 0DY', TRUE, TRUE),
('Procter & Gamble', 'Jon Moeller', 'procurement.pg@example.test', '+1 513-555-0155', 'Manufacturing', '1 Procter & Gamble Plaza, Cincinnati, OH 45202, US', '+1', '513-555-0155', 'US', '1 Procter & Gamble Plaza', 'Cincinnati', 'OH', '45202', TRUE, TRUE),
('Mondelez', 'Dirk Van de Put', 'procurement.mondelez@example.test', '+1 847-555-0156', 'Food & Beverage', '905 West Fulton Market, Chicago, IL 60607, US', '+1', '847-555-0156', 'US', '905 West Fulton Market', 'Chicago', 'IL', '60607', TRUE, TRUE),
('Danone', 'Antoine de Saint-Affrique', 'procurement.danone@example.test', '+33 1-555-0157', 'Food & Beverage', '17 Boulevard Haussmann, 75009 Paris, FR', '+33', '1-555-0157', 'FR', '17 Boulevard Haussmann', 'Paris', 'Ile-de-France', '75009', TRUE, TRUE),
('McDonald’s', 'Chris Kempczinski', 'procurement.mcdonalds@example.test', '+1 312-555-0158', 'Food & Beverage', '110 N Carpenter St, Chicago, IL 60607, US', '+1', '312-555-0158', 'US', '110 N Carpenter St', 'Chicago', 'IL', '60607', TRUE, TRUE),
('Starbucks', 'Laxman Narasimhan', 'procurement.starbucks@example.test', '+1 206-555-0159', 'Food & Beverage', '2401 Utah Ave S, Seattle, WA 98134, US', '+1', '206-555-0159', 'US', '2401 Utah Ave S', 'Seattle', 'WA', '98134', TRUE, TRUE),
('Nike', 'John Donahoe', 'procurement.nike@example.test', '+1 503-555-0160', 'Manufacturing', 'One Bowerman Dr, Beaverton, OR 97005, US', '+1', '503-555-0160', 'US', 'One Bowerman Dr', 'Beaverton', 'OR', '97005', TRUE, TRUE),

-- ==================== GROUP 7: HEALTHCARE & PHARMACEUTICALS ====================
('Pfizer', 'Albert Bourla', 'procurement.pfizer@example.test', '+1 212-555-0161', 'Healthcare', '66 Hudson Blvd E, New York, NY 10001, US', '+1', '212-555-0161', 'US', '66 Hudson Blvd E', 'New York', 'NY', '10001', TRUE, TRUE),
('Johnson & Johnson', 'Joaquin Duato', 'procurement.jnj@example.test', '+1 732-555-0162', 'Healthcare', 'One Johnson & Johnson Plaza, New Brunswick, NJ 08933, US', '+1', '732-555-0162', 'US', 'One Johnson & Johnson Plaza', 'New Brunswick', 'NJ', '08933', TRUE, TRUE),
('Roche', 'Severin Schwan', 'procurement.roche@example.test', '+41 61-555-0163', 'Healthcare', 'Grenzacherstrasse 124, 4070 Basel, CH', '+41', '61-555-0163', 'CH', 'Grenzacherstrasse 124', 'Basel', 'Basel-Stadt', '4070', TRUE, TRUE),
('Novartis', 'Vas Narasimhan', 'procurement.novartis@example.test', '+41 61-555-0164', 'Healthcare', 'Lichtstrasse 35, 4056 Basel, CH', '+41', '61-555-0164', 'CH', 'Lichtstrasse 35', 'Basel', 'Basel-Stadt', '4056', TRUE, TRUE),
('Merck', 'Robert Davis', 'procurement.merck@example.test', '+1 908-555-0165', 'Healthcare', '126 E Lincoln Ave, Rahway, NJ 07065, US', '+1', '908-555-0165', 'US', '126 E Lincoln Ave', 'Rahway', 'NJ', '07065', TRUE, TRUE),
('Bayer', 'Bill Anderson', 'procurement.bayer@example.test', '+49 214-555-0166', 'Healthcare', 'Kaiser-Wilhelm-Allee 1, 51373 Leverkusen, DE', '+49', '214-555-0166', 'DE', 'Kaiser-Wilhelm-Allee 1', 'Leverkusen', 'North Rhine-Westphalia', '51373', TRUE, TRUE),
('Abbott', 'Robert Ford', 'procurement.abbott@example.test', '+1 224-555-0167', 'Healthcare', '100 Abbott Park Rd, Abbott Park, IL 60064, US', '+1', '224-555-0167', 'US', '100 Abbott Park Rd', 'Abbott Park', 'IL', '60064', TRUE, TRUE),
('Sanofi', 'Paul Hudson', 'procurement.sanofi@example.test', '+33 1-555-0168', 'Healthcare', '46 Avenue de la Grande Armee, 75017 Paris, FR', '+33', '1-555-0168', 'FR', '46 Avenue de la Grande Armee', 'Paris', 'Ile-de-France', '75017', TRUE, TRUE),
('AstraZeneca', 'Pascal Soriot', 'procurement.astrazeneca@example.test', '+44 20-555-0169', 'Healthcare', '1 Francis Crick Ave, Cambridge CB2 0AA, GB', '+44', '20-555-0169', 'GB', '1 Francis Crick Ave', 'Cambridge', 'Cambridgeshire', 'CB2 0AA', TRUE, TRUE),
('GSK', 'Emma Walmsley', 'procurement.gsk@example.test', '+44 20-555-0170', 'Healthcare', '980 Great West Rd, Brentford TW8 9GS, GB', '+44', '20-555-0170', 'GB', '980 Great West Rd', 'Brentford', 'Middlesex', 'TW8 9GS', TRUE, TRUE),

-- ==================== GROUP 8: ENERGY & RESOURCES ====================
('Shell', 'Wael Sawan', 'procurement.shell@example.test', '+44 20-555-0171', 'Energy', 'Shell Centre, London SE1 7NA, GB', '+44', '20-555-0171', 'GB', 'Shell Centre', 'London', 'Greater London', 'SE1 7NA', TRUE, TRUE),
('BP', 'Murray Auchincloss', 'procurement.bp@example.test', '+44 20-555-0172', 'Energy', '1 St James''s Square, London SW1Y 4PD, GB', '+44', '20-555-0172', 'GB', '1 St James''s Square', 'London', 'Greater London', 'SW1Y 4PD', TRUE, TRUE),
('ExxonMobil', 'Darren Woods', 'procurement.exxonmobil@example.test', '+1 972-555-0173', 'Energy', '22777 Springwoods Village Pkwy, Spring, TX 77389, US', '+1', '972-555-0173', 'US', '22777 Springwoods Village Pkwy', 'Spring', 'TX', '77389', TRUE, TRUE),
('Chevron', 'Michael Wirth', 'procurement.chevron@example.test', '+1 925-555-0174', 'Energy', '6001 Bollinger Canyon Rd, San Ramon, CA 94583, US', '+1', '925-555-0174', 'US', '6001 Bollinger Canyon Rd', 'San Ramon', 'CA', '94583', TRUE, TRUE),
('TotalEnergies', 'Patrick Pouyanne', 'procurement.totalenergies@example.test', '+33 1-555-0175', 'Energy', '2 Place Jean Millier, 92400 Courbevoie, FR', '+33', '1-555-0175', 'FR', '2 Place Jean Millier', 'Courbevoie', 'Hauts-de-Seine', '92400', TRUE, TRUE),
('Saudi Aramco', 'Amin Nasser', 'procurement.aramco@example.test', '+966 13-555-0176', 'Energy', 'Aramco Main Bldg, Dhahran 31311, SA', '+966', '13-555-0176', 'SA', 'Aramco Main Bldg', 'Dhahran', 'Eastern Province', '31311', TRUE, TRUE),
('Rio Tinto', 'Jakob Stausholm', 'procurement.riotinto@example.test', '+61 3-555-0177', 'Energy', '360 Collins St, Melbourne, VIC 3000, AU', '+61', '3-555-0177', 'AU', '360 Collins St', 'Melbourne', 'Victoria', '3000', TRUE, TRUE),
('BHP', 'Mike Henry', 'procurement.bhp@example.test', '+61 3-555-0178', 'Energy', '171 Collins St, Melbourne, VIC 3000, AU', '+61', '3-555-0178', 'AU', '171 Collins St', 'Melbourne', 'Victoria', '3000', TRUE, TRUE),
('ArcelorMittal', 'Aditya Mittal', 'procurement.arcelormittal@example.test', '+352 479-555-0179', 'Manufacturing', '24-26 Boulevard d''Avranches, 1160 Luxembourg, LU', '+352', '479-555-0179', 'LU', '24-26 Boulevard d''Avranches', 'Luxembourg City', 'Luxembourg', '1160', TRUE, TRUE),
('POSCO', 'Jeong-Woo Choi', 'procurement.posco@example.test', '+82 2-555-0180', 'Manufacturing', '626 Teheran-ro, Gangnam-gu, Seoul 06194, KR', '+82', '2-555-0180', 'KR', '626 Teheran-ro, Gangnam-gu', 'Seoul', 'Seoul', '06194', TRUE, TRUE),

-- ==================== GROUP 9: INDUSTRIAL EQUIPMENT & AEROSPACE ====================
('Siemens', 'Roland Busch', 'procurement.siemens@example.test', '+49 89-555-0181', 'Industrial Equipment', 'Werner-von-Siemens-Strasse 1, 80333 Munich, DE', '+49', '89-555-0181', 'DE', 'Werner-von-Siemens-Strasse 1', 'Munich', 'Bavaria', '80333', TRUE, TRUE),
('Bosch', 'Stefan Hartung', 'procurement.bosch@example.test', '+49 711-555-0182', 'Industrial Equipment', 'Robert-Bosch-Platz 1, 70839 Gerlingen-Schillerhoehe, DE', '+49', '711-555-0182', 'DE', 'Robert-Bosch-Platz 1', 'Gerlingen', 'Baden-Wuerttemberg', '70839', TRUE, TRUE),
('Schneider Electric', 'Peter Herweck', 'procurement.schneider@example.test', '+33 1-555-0183', 'Industrial Equipment', '35 Rue Joseph Monier, 92500 Rueil-Malmaison, FR', '+33', '1-555-0183', 'FR', '35 Rue Joseph Monier', 'Rueil-Malmaison', 'Hauts-de-Seine', '92500', TRUE, TRUE),
('Honeywell', 'Vimal Kapur', 'procurement.honeywell@example.test', '+1 704-555-0184', 'Industrial Equipment', '855 S Mint St, Charlotte, NC 28202, US', '+1', '704-555-0184', 'US', '855 S Mint St', 'Charlotte', 'NC', '28202', TRUE, TRUE),
('3M', 'Mike Roman', 'procurement.3m@example.test', '+1 651-555-0185', 'Industrial Equipment', '3M Center, St Paul, MN 55144, US', '+1', '651-555-0185', 'US', '3M Center', 'St Paul', 'MN', '55144', TRUE, TRUE),
('Caterpillar', 'Jim Umpleby', 'procurement.caterpillar@example.test', '+1 224-555-0186', 'Industrial Equipment', '5205 N O''Connor Blvd, Irving, TX 75039, US', '+1', '224-555-0186', 'US', '5205 N O''Connor Blvd', 'Irving', 'TX', '75039', TRUE, TRUE),
('Deere & Company', 'John May', 'procurement.deere@example.test', '+1 309-555-0187', 'Industrial Equipment', 'One John Deere Place, Moline, IL 61265, US', '+1', '309-555-0187', 'US', 'One John Deere Place', 'Moline', 'IL', '61265', TRUE, TRUE),
('Boeing', 'Dave Calhoun', 'procurement.boeing@example.test', '+1 703-555-0188', 'Industrial Equipment', '929 Long Bridge Dr, Arlington, VA 22202, US', '+1', '703-555-0188', 'US', '929 Long Bridge Dr', 'Arlington', 'VA', '22202', TRUE, TRUE),
('Airbus', 'Guillaume Faury', 'procurement.airbus@example.test', '+33 5-555-0189', 'Industrial Equipment', '2 Rond-Point Emile Dewoitine, 31700 Blagnac, FR', '+33', '5-555-0189', 'FR', '2 Rond-Point Emile Dewoitine', 'Blagnac', 'Haute-Garonne', '31700', TRUE, TRUE),
('Lockheed Martin', 'Jim Taiclet', 'procurement.lockheed@example.test', '+1 301-555-0190', 'Industrial Equipment', '6801 Rockledge Dr, Bethesda, MD 20817, US', '+1', '301-555-0190', 'US', '6801 Rockledge Dr', 'Bethesda', 'MD', '20817', TRUE, TRUE),

-- ==================== GROUP 10: FINANCE, TECH & PROFESSIONAL SERVICES ====================
('JPMorgan Chase', 'Jamie Dimon', 'procurement.jpmorgan@example.test', '+1 212-555-0191', 'Finance', '383 Madison Ave, New York, NY 10179, US', '+1', '212-555-0191', 'US', '383 Madison Ave', 'New York', 'NY', '10179', TRUE, TRUE),
('Bank of America', 'Brian Moynihan', 'procurement.bofa@example.test', '+1 704-555-0192', 'Finance', '100 N Tryon St, Charlotte, NC 28255, US', '+1', '704-555-0192', 'US', '100 N Tryon St', 'Charlotte', 'NC', '28255', TRUE, TRUE),
('HSBC', 'Noel Quinn', 'procurement.hsbc@example.test', '+44 20-555-0193', 'Finance', '8 Canada Square, Canary Wharf, London E14 5HQ, GB', '+44', '20-555-0193', 'GB', '8 Canada Square, Canary Wharf', 'London', 'Greater London', 'E14 5HQ', TRUE, TRUE),
('ICBC', 'Chen Siqing', 'procurement.icbc@example.test', '+86 10-555-0194', 'Finance', '55 Fuxingmennei St, Xicheng District, Beijing 100140, CN', '+86', '10-555-0194', 'CN', '55 Fuxingmennei St', 'Beijing', 'Beijing', '100140', TRUE, TRUE),
('Allianz', 'Oliver Bate', 'procurement.allianz@example.test', '+49 89-555-0195', 'Finance', 'Koeniginstrasse 28, 80802 Munich, DE', '+49', '89-555-0195', 'DE', 'Koeniginstrasse 28', 'Munich', 'Bavaria', '80802', TRUE, TRUE),
('AXA', 'Thomas Buberl', 'procurement.axa@example.test', '+33 1-555-0196', 'Finance', '25 Avenue Matignon, 75008 Paris, FR', '+33', '1-555-0196', 'FR', '25 Avenue Matignon', 'Paris', 'Ile-de-France', '75008', TRUE, TRUE),
('Alibaba Group', 'Eddie Wu', 'procurement.alibaba@example.test', '+86 571-555-0197', 'Technology', '969 West Wen Yi Rd, Yu Hang District, Hangzhou 311121, CN', '+86', '571-555-0197', 'CN', '969 West Wen Yi Rd', 'Hangzhou', 'Zhejiang', '311121', TRUE, TRUE),
('Tencent', 'Pony Ma', 'procurement.tencent@example.test', '+86 755-555-0198', 'Technology', 'Tencent Binhai Towers, Nanshan District, Shenzhen 518054, CN', '+86', '755-555-0198', 'CN', 'Tencent Binhai Towers, Nanshan', 'Shenzhen', 'Guangdong', '518054', TRUE, TRUE),
('SAP', 'Christian Klein', 'procurement.sap@example.test', '+49 6227-555-0199', 'Technology', 'Dietmar-Hopp-Allee 16, 69190 Walldorf, DE', '+49', '6227-555-0199', 'DE', 'Dietmar-Hopp-Allee 16', 'Walldorf', 'Baden-Wuerttemberg', '69190', TRUE, TRUE),
('Accenture', 'Julie Sweet', 'procurement.accenture@example.test', '+353 1-555-0200', 'Technology', '1 Grand Canal Square, Grand Canal Harbour, Dublin 2, IE', '+353', '1-555-0200', 'IE', '1 Grand Canal Square', 'Dublin', 'Leinster', 'D02 P820', TRUE, TRUE)
ON DUPLICATE KEY UPDATE
    `name` = VALUES(`name`),
    `contact_name` = VALUES(`contact_name`),
    `phone` = VALUES(`phone`),
    `category` = VALUES(`category`),
    `address` = VALUES(`address`),
    `phone_country_code` = VALUES(`phone_country_code`),
    `phone_number` = VALUES(`phone_number`),
    `country_code` = VALUES(`country_code`),
    `address_line1` = VALUES(`address_line1`),
    `city` = VALUES(`city`),
    `state_province` = VALUES(`state_province`),
    `postal_code` = VALUES(`postal_code`),
    `active` = VALUES(`active`),
    `is_demo` = VALUES(`is_demo`);
