-- =============================================================================
-- Migration: Add delivery_address and expected_delivery_date to purchase_orders
-- Target Database: supplier_po_db (MySQL 8.0+)
-- Safety:
--   - Does NOT delete or truncate any tables.
--   - Adds nullable columns if they do not exist.
--   - Existing orders remain intact.
-- =============================================================================

USE `supplier_po_db`;

-- Add delivery_address column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'supplier_po_db' AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'delivery_address';

SET @ddl = IF(@col_exists = 0, 
    'ALTER TABLE `purchase_orders` ADD COLUMN `delivery_address` VARCHAR(255) NULL AFTER `remarks`', 
    'SELECT "Column delivery_address already exists"');
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add expected_delivery_date column
SET @col2_exists = 0;
SELECT COUNT(*) INTO @col2_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'supplier_po_db' AND TABLE_NAME = 'purchase_orders' AND COLUMN_NAME = 'expected_delivery_date';

SET @ddl2 = IF(@col2_exists = 0, 
    'ALTER TABLE `purchase_orders` ADD COLUMN `expected_delivery_date` DATE NULL AFTER `delivery_address`', 
    'SELECT "Column expected_delivery_date already exists"');
PREPARE stmt2 FROM @ddl2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- Verify columns
DESCRIBE `purchase_orders`;
