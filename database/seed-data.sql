-- =============================================================================
-- Seed Data: Supplier & Purchase Order Management System
-- Demonstrates realistic college project procurement scenario:
-- Users (Admin, Buyer, Supplier), Vendors, Orders across workflow states,
-- Line items, and Audit status history.
-- 
-- Note on Password Hashes:
-- All demo accounts use the password: Password123
-- =============================================================================

USE `supplier_po_db`;

-- Disable foreign key checks during batch initial load
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `order_status_history`;
TRUNCATE TABLE `purchase_order_items`;
TRUNCATE TABLE `purchase_orders`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `suppliers`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. Insert Suppliers
-- =============================================================================
INSERT INTO `suppliers` (`id`, `name`, `contact_name`, `email`, `phone`, `category`, `address`, `active`, `created_at`, `updated_at`)
VALUES
(1, 'Apex Industrial Supplies Ltd.', 'John Apex', 'sales@apexsupplies.com', '+1-555-0199', 'Industrial Equipment', '100 Industrial Parkway, Chicago, IL 60616', TRUE, '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
(2, 'Global Tech Components Inc.', 'Elena Vance', 'orders@globaltech.com', '+1-555-0245', 'Electronics & Semiconductors', '450 Silicon Blvd, San Jose, CA 95134', TRUE, '2026-08-05 10:30:00', '2026-08-05 10:30:00'),
(3, 'Prime Logistics & Packaging Corp.', 'Marcus Sterling', 'contact@primelogistics.com', '+1-555-0378', 'Packaging & Logistics', '72 Cargo Way, Dallas, TX 75201', TRUE, '2026-08-10 11:15:00', '2026-08-10 11:15:00');


-- =============================================================================
-- 2. Insert Users (ADMIN, BUYER, SUPPLIER)
-- All demo accounts use the password: Password123
-- =============================================================================
INSERT INTO `users` (`id`, `full_name`, `email`, `password_hash`, `role`, `supplier_id`, `active`, `created_at`, `updated_at`)
VALUES
(1, 'System Administrator', 'admin@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'ADMIN', NULL, TRUE, '2026-08-01 08:00:00', '2026-08-01 08:00:00'),
(2, 'Alex Morgan', 'buyer@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'BUYER', NULL, TRUE, '2026-08-01 08:30:00', '2026-08-01 08:30:00'),
(3, 'John Apex', 'supplier@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'SUPPLIER', 1, TRUE, '2026-08-01 09:05:00', '2026-08-01 09:05:00');


-- =============================================================================
-- 3. Insert Purchase Orders (Covering All Lifecycle States)
-- PO 1: DELIVERED (Fulfilled by Apex Industrial Supplies)
-- PO 2: APPROVED (In fulfillment by Global Tech)
-- PO 3: PENDING (New requisition awaiting Admin approval)
-- PO 4: REJECTED (Disapproved requisition with recorded remarks)
-- =============================================================================
INSERT INTO `purchase_orders` (`id`, `order_number`, `supplier_id`, `buyer_id`, `status`, `order_date`, `approved_at`, `delivered_at`, `total_amount`, `remarks`, `created_at`, `updated_at`)
VALUES
(1, 'PO-2026-0001', 1, 2, 'DELIVERED', '2026-09-01 10:00:00', '2026-09-02 14:30:00', '2026-09-08 16:45:00', 1700.00, 'Deliver to Central Warehouse Dock A. Calibration certificate required.', '2026-09-01 10:00:00', '2026-09-08 16:45:00'),
(2, 'PO-2026-0002', 2, 2, 'APPROVED',  '2026-09-10 11:30:00', '2026-09-11 09:15:00', NULL,                  4240.00, 'Cleanroom ESD safe packaging strictly mandated.',                     '2026-09-10 11:30:00', '2026-09-11 09:15:00'),
(3, 'PO-2026-0003', 3, 2, 'PENDING',   '2026-09-18 15:00:00', NULL,                  NULL,                  2000.00, 'Eco-friendly biodegradable mailers bulk restocking batch.',            '2026-09-18 15:00:00', '2026-09-18 15:00:00'),
(4, 'PO-2026-0004', 1, 2, 'REJECTED',  '2026-09-12 14:00:00', '2026-09-13 10:00:00', NULL,                  3500.00, 'Exceeds monthly department discretionary hardware budget ceiling.',   '2026-09-12 14:00:00', '2026-09-13 10:00:00');


-- =============================================================================
-- 4. Insert Purchase Order Items (Line Items)
-- =============================================================================
INSERT INTO `purchase_order_items` (`id`, `purchase_order_id`, `item_name`, `description`, `quantity`, `unit_price`, `line_total`)
VALUES
-- Items for PO-2026-0001 ($1,700.00)
(1, 1, 'Pneumatic Impact Wrench Heavy Duty', 'Twin-hammer mechanism 1/2-inch pneumatic wrench', 5, 250.00, 1250.00),
(2, 1, 'Industrial Air Compressor Hose 50ft', 'Rubberized reinforced 300 PSI air line', 10, 45.00, 450.00),

-- Items for PO-2026-0002 ($4,240.00)
(3, 2, 'ARM Cortex-M4 Microcontroller IC (Tray of 50)', '32-bit MCU 120MHz LQFP-64 components', 20, 180.00, 3600.00),
(4, 2, 'Precision Crystal Oscillators 16MHz (Reel of 1000)', 'Surface mount SMD-3225 timing crystals', 2, 320.00, 640.00),

-- Items for PO-2026-0003 ($2,000.00)
(5, 3, 'Biodegradable Bubble Mailers 10x13 (Pack of 500)', 'Compostable self-sealing shipping bags', 15, 85.00, 1275.00),
(6, 3, 'Reinforced Heavy Duty Water-Activated Packing Tape', 'Fiberglass reinforced kraft paper tape case of 36', 10, 72.50, 725.00),

-- Items for PO-2026-0004 ($3,500.00)
(7, 4, 'Motorized High-Capacity Hydraulic Pallet Jack', 'Electric lift pallet jack 4400 lbs capacity', 1, 3500.00, 3500.00);


-- =============================================================================
-- 5. Insert Order Status History (Audit Trail)
-- Tracks who changed what status, when, and reasons.
-- =============================================================================
INSERT INTO `order_status_history` (`id`, `purchase_order_id`, `old_status`, `new_status`, `changed_by_user_id`, `remarks`, `changed_at`)
VALUES
-- PO 1 audit trail: Created -> Approved -> Delivered
(1, 1, NULL, 'PENDING', 2, 'Initial purchase order placed by Buyer Alex Morgan', '2026-09-01 10:00:00'),
(2, 1, 'PENDING', 'APPROVED', 1, 'Approved by Administrator. Vendor notified for shipment.', '2026-09-02 14:30:00'),
(3, 1, 'APPROVED', 'DELIVERED', 3, 'Delivered and signed at Austin Warehouse Dock A by John Apex', '2026-09-08 16:45:00'),

-- PO 2 audit trail: Created -> Approved
(4, 2, NULL, 'PENDING', 2, 'Requisition created for Cleanroom Electronics Batch', '2026-09-10 11:30:00'),
(5, 2, 'PENDING', 'APPROVED', 1, 'Approved by Administrator. Fulfillment in progress.', '2026-09-11 09:15:00'),

-- PO 3 audit trail: Created (Pending)
(6, 3, NULL, 'PENDING', 2, 'Packaging bulk order placed by Buyer Alex Morgan. Awaiting review.', '2026-09-18 15:00:00'),

-- PO 4 audit trail: Created -> Rejected
(7, 4, NULL, 'PENDING', 2, 'Capital equipment purchase order submitted by Buyer Alex Morgan', '2026-09-12 14:00:00'),
(8, 4, 'PENDING', 'REJECTED', 1, 'Rejected: Exceeds Q3 discretionary hardware budget ceiling. Resubmit next quarter.', '2026-09-13 10:00:00');