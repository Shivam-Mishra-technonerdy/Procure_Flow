-- =============================================================================
-- Migration V2: International User & Supplier Profiles and Multi-Currency POs
-- Compatible with MySQL 8.0+
-- Preserves all existing data and tables
-- =============================================================================

USE `supplier_po_db`;

-- Drop helper procedure if it exists
DROP PROCEDURE IF EXISTS `AddColumnIfNotExists`;

DELIMITER $$
CREATE PROCEDURE `AddColumnIfNotExists`(
    IN target_table VARCHAR(64),
    IN target_column VARCHAR(64),
    IN column_definition VARCHAR(255)
)
BEGIN
    DECLARE col_count INT;
    SELECT COUNT(*) INTO col_count
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = target_table
      AND COLUMN_NAME = target_column;

    IF col_count = 0 THEN
        SET @ddl_query = CONCAT('ALTER TABLE `', target_table, '` ADD COLUMN `', target_column, '` ', column_definition);
        PREPARE stmt FROM @ddl_query;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END $$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- 1. Add International Profile Fields to `users`
-- -----------------------------------------------------------------------------
CALL AddColumnIfNotExists('users', 'phone_country_code', 'VARCHAR(8) NULL');
CALL AddColumnIfNotExists('users', 'phone_number', 'VARCHAR(25) NULL');
CALL AddColumnIfNotExists('users', 'country_code', 'VARCHAR(2) NULL');
CALL AddColumnIfNotExists('users', 'address_line1', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('users', 'address_line2', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('users', 'city', 'VARCHAR(100) NULL');
CALL AddColumnIfNotExists('users', 'state_province', 'VARCHAR(100) NULL');
CALL AddColumnIfNotExists('users', 'postal_code', 'VARCHAR(20) NULL');

-- -----------------------------------------------------------------------------
-- 2. Add Complete International Address & Phone Fields to `suppliers`
-- -----------------------------------------------------------------------------
CALL AddColumnIfNotExists('suppliers', 'phone_country_code', 'VARCHAR(8) NULL');
CALL AddColumnIfNotExists('suppliers', 'phone_number', 'VARCHAR(25) NULL');
CALL AddColumnIfNotExists('suppliers', 'country_code', 'VARCHAR(2) NULL');
CALL AddColumnIfNotExists('suppliers', 'address_line1', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('suppliers', 'address_line2', 'VARCHAR(255) NULL');
CALL AddColumnIfNotExists('suppliers', 'city', 'VARCHAR(100) NULL');
CALL AddColumnIfNotExists('suppliers', 'state_province', 'VARCHAR(100) NULL');
CALL AddColumnIfNotExists('suppliers', 'postal_code', 'VARCHAR(20) NULL');

-- -----------------------------------------------------------------------------
-- 3. Add Multi-Currency Support to `purchase_orders`
-- -----------------------------------------------------------------------------
CALL AddColumnIfNotExists('purchase_orders', 'currency_code', "VARCHAR(3) NOT NULL DEFAULT 'INR'");
CALL AddColumnIfNotExists('purchase_orders', 'exchange_rate_to_inr', "DECIMAL(15,6) NULL DEFAULT 1.000000");

-- -----------------------------------------------------------------------------
-- 4. Add Currency Code to `purchase_order_items`
-- -----------------------------------------------------------------------------
CALL AddColumnIfNotExists('purchase_order_items', 'currency_code', "VARCHAR(3) NOT NULL DEFAULT 'INR'");

-- Clean up helper procedure
DROP PROCEDURE IF EXISTS `AddColumnIfNotExists`;

-- -----------------------------------------------------------------------------
-- 5. Backfill sensible defaults for existing demo and seed records
-- -----------------------------------------------------------------------------

-- Admin demo account
UPDATE `users`
SET `phone_country_code` = '+1',
    `phone_number` = '5550100',
    `country_code` = 'US',
    `address_line1` = '100 Tech Enterprise Blvd',
    `city` = 'Chicago',
    `state_province` = 'Illinois',
    `postal_code` = '60601'
WHERE `email` = 'admin@example.com' AND `country_code` IS NULL;

-- Buyer demo account
UPDATE `users`
SET `phone_country_code` = '+91',
    `phone_number` = '9876543210',
    `country_code` = 'IN',
    `address_line1` = '42 Marine Drive, Suite 500',
    `city` = 'Mumbai',
    `state_province` = 'Maharashtra',
    `postal_code` = '400020'
WHERE `email` = 'buyer@example.com' AND `country_code` IS NULL;

-- Supplier demo account
UPDATE `users`
SET `phone_country_code` = '+1',
    `phone_number` = '5550199',
    `country_code` = 'US',
    `address_line1` = '800 Innovation Way',
    `city` = 'San Jose',
    `state_province` = 'California',
    `postal_code` = '95134'
WHERE `email` = 'supplier@example.com' AND `country_code` IS NULL;

-- Generic backfill for any other existing users
UPDATE `users`
SET `phone_country_code` = COALESCE(`phone_country_code`, '+91'),
    `phone_number` = COALESCE(`phone_number`, '9876543210'),
    `country_code` = COALESCE(`country_code`, 'IN'),
    `address_line1` = COALESCE(`address_line1`, '123 Main Street'),
    `city` = COALESCE(`city`, 'Bengaluru'),
    `state_province` = COALESCE(`state_province`, 'Karnataka'),
    `postal_code` = COALESCE(`postal_code`, '560001')
WHERE `country_code` IS NULL;

-- Backfill existing suppliers
UPDATE `suppliers`
SET `phone_country_code` = COALESCE(`phone_country_code`, '+1'),
    `phone_number` = COALESCE(`phone_number`, '5550199'),
    `country_code` = COALESCE(`country_code`, 'US'),
    `address_line1` = COALESCE(`address_line1`, `address`, '500 Industrial Pkwy'),
    `city` = COALESCE(`city`, 'Chicago'),
    `state_province` = COALESCE(`state_province`, 'IL'),
    `postal_code` = COALESCE(`postal_code`, '60607')
WHERE `country_code` IS NULL;

-- Ensure all existing purchase orders have currency_code and exchange rate
UPDATE `purchase_orders`
SET `currency_code` = 'INR',
    `exchange_rate_to_inr` = 1.000000
WHERE `currency_code` IS NULL OR `currency_code` = '';

UPDATE `purchase_order_items`
SET `currency_code` = 'INR'
WHERE `currency_code` IS NULL OR `currency_code` = '';
