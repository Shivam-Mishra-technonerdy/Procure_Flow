package com.management.supplierpo.config;

import com.management.supplierpo.model.*;
import com.management.supplierpo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           SupplierRepository supplierRepository,
                           PurchaseOrderRepository purchaseOrderRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return; // Data already present
        }

        // 1. Create Suppliers
        Supplier s1 = supplierRepository.save(new Supplier(null, "John Apex", "Apex Industrial Supplies",
                "sales@apexsupplies.com", "+1-555-0199", "100 Industrial Parkway, Chicago, IL",
                "Industrial Equipment", 4.8, "ACTIVE"));

        Supplier s2 = supplierRepository.save(new Supplier(null, "Elena Vance", "Global Tech Components",
                "orders@globaltech.com", "+1-555-0245", "450 Silicon Blvd, San Jose, CA",
                "Electronics & Semiconductors", 4.9, "ACTIVE"));

        Supplier s3 = supplierRepository.save(new Supplier(null, "Marcus Sterling", "Prime Logistics & Packaging",
                "contact@primelogistics.com", "+1-555-0378", "72 Cargo Way, Dallas, TX",
                "Packaging & Logistics", 4.6, "ACTIVE"));

        Supplier s4 = supplierRepository.save(new Supplier(null, "Sarah Jenkins", "Horizon Office Solutions",
                "help@horizonoffice.com", "+1-555-0412", "88 Market St, New York, NY",
                "Office Supplies", 4.7, "ACTIVE"));

        // 2. Create Users
        User admin = userRepository.save(new User(null, "admin", "admin@example.com",
                passwordEncoder.encode("Password123"), "System Administrator", Role.ADMIN, null));

        User buyer = userRepository.save(new User(null, "buyer", "buyer@example.com",
                passwordEncoder.encode("Password123"), "Alex Morgan (Procurement)", Role.BUYER, null));

        User supplierUser1 = userRepository.save(new User(null, "supplier", "supplier@example.com",
                passwordEncoder.encode("Password123"), "John Apex (Apex Supplies)", Role.SUPPLIER, s1));

        User supplierUser2 = userRepository.save(new User(null, "tech_supplier", "tech@example.com",
                passwordEncoder.encode("Password123"), "Elena Vance (Global Tech)", Role.SUPPLIER, s2));

        // 3. Create Sample Purchase Orders
        // Order 1: DELIVERED
        PurchaseOrder po1 = new PurchaseOrder();
        po1.setOrderNumber("PO-2026-0001");
        po1.setBuyer(buyer);
        po1.setSupplier(s1);
        po1.setStatus(OrderStatus.DELIVERED);
        po1.setDeliveryAddress("Warehouse Dock A, 500 Enterprise Way, Austin, TX");
        po1.setExpectedDeliveryDate(LocalDate.now().minusDays(10));
        po1.setActualDeliveryDate(LocalDate.now().minusDays(8));
        po1.setNotes("High-torque pneumatic tools with calibration certificates.");
        po1.setCreatedAt(LocalDateTime.now().minusDays(15));

        po1.addItem(new OrderItem(null, po1, "Pneumatic Impact Wrench Heavy Duty", 5, new BigDecimal("250.00"), new BigDecimal("1250.00")));
        po1.addItem(new OrderItem(null, po1, "Industrial Air Compressor Hose 50ft", 10, new BigDecimal("45.00"), new BigDecimal("450.00")));
        po1.setTotalAmount(new BigDecimal("1700.00"));
        po1.setTaxAmount(new BigDecimal("136.00"));
        po1.setGrandTotal(new BigDecimal("1836.00"));
        purchaseOrderRepository.save(po1);

        // Order 2: APPROVED
        PurchaseOrder po2 = new PurchaseOrder();
        po2.setOrderNumber("PO-2026-0002");
        po2.setBuyer(buyer);
        po2.setSupplier(s2);
        po2.setStatus(OrderStatus.APPROVED);
        po2.setDeliveryAddress("Production Facility 2, Cleanroom 4, San Jose, CA");
        po2.setExpectedDeliveryDate(LocalDate.now().plusDays(5));
        po2.setNotes("Electrostatic discharge safe packaging strictly required.");
        po2.setCreatedAt(LocalDateTime.now().minusDays(3));

        po2.addItem(new OrderItem(null, po2, "ARM Cortex-M4 Microcontroller IC (Tray of 50)", 20, new BigDecimal("180.00"), new BigDecimal("3600.00")));
        po2.addItem(new OrderItem(null, po2, "Precision Crystal Oscillators 16MHz (Reel of 1000)", 2, new BigDecimal("320.00"), new BigDecimal("640.00")));
        po2.setTotalAmount(new BigDecimal("4240.00"));
        po2.setTaxAmount(new BigDecimal("339.20"));
        po2.setGrandTotal(new BigDecimal("4579.20"));
        purchaseOrderRepository.save(po2);

        // Order 3: PENDING
        PurchaseOrder po3 = new PurchaseOrder();
        po3.setOrderNumber("PO-2026-0003");
        po3.setBuyer(buyer);
        po3.setSupplier(s3);
        po3.setStatus(OrderStatus.PENDING);
        po3.setDeliveryAddress("Fulfillment Center West, Phoenix, AZ");
        po3.setExpectedDeliveryDate(LocalDate.now().plusDays(12));
        po3.setNotes("Eco-friendly corrugated mailers bulk order.");
        po3.setCreatedAt(LocalDateTime.now().minusHours(4));

        po3.addItem(new OrderItem(null, po3, "Biodegradable Bubble Mailers 10x13 (Pack of 500)", 15, new BigDecimal("85.00"), new BigDecimal("1275.00")));
        po3.addItem(new OrderItem(null, po3, "Heavy Duty Reinforced Packing Tape (Case of 36)", 10, new BigDecimal("72.50"), new BigDecimal("725.00")));
        po3.setTotalAmount(new BigDecimal("2000.00"));
        po3.setTaxAmount(new BigDecimal("160.00"));
        po3.setGrandTotal(new BigDecimal("2160.00"));
        purchaseOrderRepository.save(po3);

        // Order 4: REJECTED
        PurchaseOrder po4 = new PurchaseOrder();
        po4.setOrderNumber("PO-2026-0004");
        po4.setBuyer(buyer);
        po4.setSupplier(s4);
        po4.setStatus(OrderStatus.REJECTED);
        po4.setDeliveryAddress("HQ Building B, Floor 3, Chicago, IL");
        po4.setExpectedDeliveryDate(LocalDate.now().plusDays(7));
        po4.setNotes("Ergonomic mesh chairs for new engineering batch.");
        po4.setRejectionReason("Requested item models are currently discontinued by vendor. Please re-submit using the updated 2026 catalogue.");
        po4.setCreatedAt(LocalDateTime.now().minusDays(5));

        po4.addItem(new OrderItem(null, po4, "Executive Ergonomic High-Back Mesh Chair", 8, new BigDecimal("350.00"), new BigDecimal("2800.00")));
        po4.setTotalAmount(new BigDecimal("2800.00"));
        po4.setTaxAmount(new BigDecimal("224.00"));
        po4.setGrandTotal(new BigDecimal("3024.00"));
        purchaseOrderRepository.save(po4);
    }
}
