-- =============================================================================
-- Database Schema: Supplier & Purchase Order Management System
-- Target Database Engine: MySQL 8.0+
-- Storage Engine: InnoDB
-- Character Set: utf8mb4 / utf8mb4_unicode_ci
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `supplier_po_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `supplier_po_db`;

-- Drop existing tables in reverse dependency order to prevent FK constraint conflicts
DROP TABLE IF EXISTS `order_status_history`;
DROP TABLE IF EXISTS `purchase_order_items`;
DROP TABLE IF EXISTS `purchase_orders`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `suppliers`;

-- =============================================================================
-- Table 1: suppliers
-- Stores vendor and supplier directory information.
-- Must be created before 'users' if users are optionally linked to a supplier.
-- =============================================================================
CREATE TABLE `suppliers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Primary key for supplier',
    `name` VARCHAR(150) NOT NULL COMMENT 'Supplier business/contact legal name',
    `contact_name` VARCHAR(150) NULL COMMENT 'Primary point of contact person',
    `email` VARCHAR(150) NULL COMMENT 'Corporate contact email (unique)',
    `phone` VARCHAR(30) NULL COMMENT 'Contact phone number (legacy)',
    `category` VARCHAR(100) NULL COMMENT 'Product or industry category (e.g. Industrial Equipment, Electronics)',
    `address` TEXT NULL COMMENT 'Physical mailing / billing address of the vendor (legacy)',
    `phone_country_code` VARCHAR(8) NULL COMMENT 'International dialing prefix (e.g. +1, +91)',
    `phone_number` VARCHAR(25) NULL COMMENT 'Local phone number',
    `country_code` VARCHAR(2) NULL COMMENT 'ISO 3166-1 alpha-2 country code (e.g. IN, US)',
    `address_line1` VARCHAR(255) NULL COMMENT 'Street address line 1',
    `address_line2` VARCHAR(255) NULL COMMENT 'Suite, unit, building line 2',
    `city` VARCHAR(100) NULL COMMENT 'City / Municipality',
    `state_province` VARCHAR(100) NULL COMMENT 'State, province, or region',
    `postal_code` VARCHAR(20) NULL COMMENT 'Postal / ZIP code',
    `active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Indicates whether the supplier is active and eligible for new orders',
    `is_demo` BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Flags synthetic global demo suppliers',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when supplier was created',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when supplier was last updated',
    
    CONSTRAINT `pk_suppliers` PRIMARY KEY (`id`),
    CONSTRAINT `uk_suppliers_email` UNIQUE (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Directory of approved and registered vendors/suppliers';

-- Indexes on suppliers
CREATE INDEX `idx_suppliers_name` ON `suppliers` (`name`);
CREATE INDEX `idx_suppliers_category` ON `suppliers` (`category`);
CREATE INDEX `idx_suppliers_active` ON `suppliers` (`active`);
CREATE INDEX `idx_suppliers_is_demo` ON `suppliers` (`is_demo`);


-- =============================================================================
-- Table 2: users
-- Stores all authenticated user identities across three roles:
-- ADMIN, SUPPLIER, BUYER.
-- Optionally references suppliers.id if the user is a SUPPLIER representative.
-- =============================================================================
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Primary key for user',
    `full_name` VARCHAR(150) NOT NULL COMMENT 'Display name of user',
    `email` VARCHAR(150) NOT NULL COMMENT 'Unique email address used for login and notifications',
    `password_hash` VARCHAR(255) NOT NULL COMMENT 'BCrypt encrypted password hash (length 60+)',
    `role` ENUM('ADMIN', 'SUPPLIER', 'BUYER') NOT NULL COMMENT 'Role-based access level for security',
    `supplier_id` BIGINT NULL COMMENT 'Optional foreign key to suppliers.id for users with role SUPPLIER',
    `phone_country_code` VARCHAR(8) NULL COMMENT 'International dialing prefix (e.g. +91, +1, +44)',
    `phone_number` VARCHAR(25) NULL COMMENT 'User phone number',
    `country_code` VARCHAR(2) NULL COMMENT 'ISO 3166-1 alpha-2 country code (e.g. IN, US, GB)',
    `address_line1` VARCHAR(255) NULL COMMENT 'Street address line 1',
    `address_line2` VARCHAR(255) NULL COMMENT 'Suite, apartment, unit line 2',
    `city` VARCHAR(100) NULL COMMENT 'City / Municipality',
    `state_province` VARCHAR(100) NULL COMMENT 'State or Province',
    `postal_code` VARCHAR(20) NULL COMMENT 'Postal or ZIP code',
    `active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Account status flag; false disables login',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when user was registered',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when user was last updated',
    
    CONSTRAINT `pk_users` PRIMARY KEY (`id`),
    CONSTRAINT `uk_users_email` UNIQUE (`email`),
    CONSTRAINT `fk_users_supplier` FOREIGN KEY (`supplier_id`)
        REFERENCES `suppliers` (`id`)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='System user accounts for authentication and RBAC';

-- Indexes on users
CREATE INDEX `idx_users_role` ON `users` (`role`);
CREATE INDEX `idx_users_active` ON `users` (`active`);
CREATE INDEX `idx_users_supplier_id` ON `users` (`supplier_id`);


-- =============================================================================
-- Table 3: purchase_orders
-- Represents the primary purchase order document with workflow lifecycle:
-- PENDING -> APPROVED -> DELIVERED (or PENDING -> REJECTED).
-- Safe delete behavior: ON DELETE RESTRICT prevents accidental deletion of
-- users or suppliers when active purchase orders reference them.
-- =============================================================================
CREATE TABLE `purchase_orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Primary key for purchase order',
    `order_number` VARCHAR(50) NOT NULL COMMENT 'Human-readable unique identifier (e.g. PO-2026-0001)',
    `supplier_id` BIGINT NOT NULL COMMENT 'Foreign key to suppliers.id (Vendor fulfilling the order)',
    `buyer_id` BIGINT NOT NULL COMMENT 'Foreign key to users.id (Procurement officer / Buyer placing order)',
    `status` ENUM('PENDING', 'APPROVED', 'DELIVERED', 'REJECTED') NOT NULL DEFAULT 'PENDING' COMMENT 'Current state in order workflow',
    `currency_code` VARCHAR(3) NOT NULL DEFAULT 'INR' COMMENT 'ISO 4217 currency code (e.g. INR, USD)',
    `exchange_rate_to_inr` DECIMAL(15,6) NULL DEFAULT 1.000000 COMMENT 'Snapshot exchange rate to base INR',
    `order_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when order was submitted',
    `approved_at` DATETIME NULL COMMENT 'Timestamp when Admin approved or rejected order',
    `delivered_at` DATETIME NULL COMMENT 'Timestamp when Supplier marked order as delivered',
    `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00 COMMENT 'Cumulative total in order currency',
    `remarks` TEXT NULL COMMENT 'Optional notes, terms, shipping instructions or rejection reason',
    `delivery_address` VARCHAR(255) NULL COMMENT 'Destination / receiving facility address for order fulfillment',
    `expected_delivery_date` DATE NULL COMMENT 'Target expected delivery date agreed with supplier',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Audit creation timestamp',
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Audit update timestamp',
    
    CONSTRAINT `pk_purchase_orders` PRIMARY KEY (`id`),
    CONSTRAINT `uk_purchase_orders_order_number` UNIQUE (`order_number`),
    
    -- Foreign Key to suppliers: Safe delete (RESTRICT prevents deleting suppliers with active orders)
    CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`)
        REFERENCES `suppliers` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
        
    -- Foreign Key to users (Buyer): Safe delete (RESTRICT prevents deleting buyer accounts with orders)
    CONSTRAINT `fk_po_buyer` FOREIGN KEY (`buyer_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
        
    -- Check constraint for non-negative total amount
    CONSTRAINT `chk_po_total_amount` CHECK (`total_amount` >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Purchase orders with workflow states and financial aggregates';

-- Indexes on purchase_orders for fast searching, filtering, and reporting
CREATE INDEX `idx_po_supplier_id` ON `purchase_orders` (`supplier_id`);
CREATE INDEX `idx_po_buyer_id` ON `purchase_orders` (`buyer_id`);
CREATE INDEX `idx_po_status` ON `purchase_orders` (`status`);
CREATE INDEX `idx_po_order_date` ON `purchase_orders` (`order_date`);
CREATE INDEX `idx_po_status_order_date` ON `purchase_orders` (`status`, `order_date`);


-- =============================================================================
-- Table 4: purchase_order_items
-- Line items associated with a purchase order.
-- Deleting a purchase order cascades to its line items.
-- Enforces positive quantity and non-negative unit_price and line_total.
-- =============================================================================
CREATE TABLE `purchase_order_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Primary key for purchase order line item',
    `purchase_order_id` BIGINT NOT NULL COMMENT 'Foreign key to purchase_orders.id',
    `item_name` VARCHAR(200) NOT NULL COMMENT 'Name or code of the item ordered',
    `description` TEXT NULL COMMENT 'Detailed item specifications or part description',
    `quantity` INT NOT NULL COMMENT 'Quantity of items ordered (must be > 0)',
    `unit_price` DECIMAL(12,2) NOT NULL COMMENT 'Cost per single unit (must be >= 0.00)',
    `line_total` DECIMAL(12,2) NOT NULL COMMENT 'Total cost for this line: quantity * unit_price',
    `currency_code` VARCHAR(3) NOT NULL DEFAULT 'INR' COMMENT 'ISO 4217 currency code',
    
    CONSTRAINT `pk_purchase_order_items` PRIMARY KEY (`id`),
    
    CONSTRAINT `fk_poi_purchase_order` FOREIGN KEY (`purchase_order_id`)
        REFERENCES `purchase_orders` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    -- Check constraints
    CONSTRAINT `chk_poi_quantity` CHECK (`quantity` > 0),
    CONSTRAINT `chk_poi_unit_price` CHECK (`unit_price` >= 0.00),
    CONSTRAINT `chk_poi_line_total` CHECK (`line_total` >= 0.00)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Line items breakdown for purchase orders';

-- Indexes on purchase_order_items
CREATE INDEX `idx_poi_purchase_order_id` ON `purchase_order_items` (`purchase_order_id`);


-- =============================================================================
-- Table 5: order_status_history
-- Full audit trail recording all transitions in order status
-- (e.g. who approved, rejected, or delivered the order, when, and reasons).
-- Safe delete: RESTRICT on changed_by_user_id preserves audit integrity.
-- =============================================================================
CREATE TABLE `order_status_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Primary key for status history record',
    `purchase_order_id` BIGINT NOT NULL COMMENT 'Foreign key to purchase_orders.id',
    `old_status` ENUM('PENDING', 'APPROVED', 'DELIVERED', 'REJECTED') NULL COMMENT 'Previous workflow state (NULL on creation)',
    `new_status` ENUM('PENDING', 'APPROVED', 'DELIVERED', 'REJECTED') NOT NULL COMMENT 'New workflow state after transition',
    `changed_by_user_id` BIGINT NOT NULL COMMENT 'Foreign key to users.id (User who initiated the transition)',
    `remarks` TEXT NULL COMMENT 'Audit notes, comments or rejection reason',
    `changed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when status change occurred',
    
    CONSTRAINT `pk_order_status_history` PRIMARY KEY (`id`),
    
    CONSTRAINT `fk_osh_purchase_order` FOREIGN KEY (`purchase_order_id`)
        REFERENCES `purchase_orders` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
        
    CONSTRAINT `fk_osh_changed_by` FOREIGN KEY (`changed_by_user_id`)
        REFERENCES `users` (`id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Audit trail of purchase order status workflow changes';

-- Indexes on order_status_history
CREATE INDEX `idx_osh_po_id` ON `order_status_history` (`purchase_order_id`);
CREATE INDEX `idx_osh_changed_by` ON `order_status_history` (`changed_by_user_id`);
CREATE INDEX `idx_osh_changed_at` ON `order_status_history` (`changed_at`);