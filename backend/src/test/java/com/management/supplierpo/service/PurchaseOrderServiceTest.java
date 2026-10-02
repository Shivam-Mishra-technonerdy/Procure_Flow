package com.management.supplierpo.service;

import com.management.supplierpo.dto.CreateOrderRequest;
import com.management.supplierpo.dto.OrderItemDto;
import com.management.supplierpo.dto.OrderResponseDto;
import com.management.supplierpo.dto.UpdateOrderStatusRequest;
import com.management.supplierpo.exception.BadRequestException;
import com.management.supplierpo.model.*;
import com.management.supplierpo.repository.PurchaseOrderRepository;
import com.management.supplierpo.repository.SupplierRepository;
import com.management.supplierpo.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseOrderServiceTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.management.supplierpo.repository.OrderStatusHistoryRepository orderStatusHistoryRepository;

    private PurchaseOrderService purchaseOrderService;

    private User buyer;
    private User admin;
    private User supplierUser;
    private Supplier supplier;
    private PurchaseOrder samplePo;

    @BeforeEach
    void setUp() {
        purchaseOrderService = new PurchaseOrderService(purchaseOrderRepository, supplierRepository, userRepository, orderStatusHistoryRepository);

        buyer = new User(1L, "buyer", "buyer@example.com", "pass", "Buyer One", Role.BUYER, null);
        admin = new User(2L, "admin", "admin@example.com", "pass", "Admin One", Role.ADMIN, null);
        supplier = new Supplier(10L, "Acme", "Acme Corp", "acme@example.com", "123", "456 Rd", "Industrial", 4.5, "ACTIVE");
        supplierUser = new User(3L, "supplier", "sup@example.com", "pass", "Supplier Rep", Role.SUPPLIER, supplier);

        samplePo = new PurchaseOrder();
        samplePo.setId(100L);
        samplePo.setOrderNumber("PO-2026-0001");
        samplePo.setBuyer(buyer);
        samplePo.setSupplier(supplier);
        samplePo.setStatus(OrderStatus.PENDING);
        samplePo.setTotalAmount(new BigDecimal("100.00"));
        samplePo.setTaxAmount(new BigDecimal("8.00"));
        samplePo.setGrandTotal(new BigDecimal("108.00"));
    }

    @Test
    void createOrder_CalculatesTotalsAndSetsPending() {
        CreateOrderRequest req = new CreateOrderRequest();
        req.setSupplierId(10L);
        req.setDeliveryAddress("Austin Warehouse");
        req.setExpectedDeliveryDate(LocalDate.now().plusDays(5));

        OrderItemDto item = new OrderItemDto(null, "Test Widget", 2, new BigDecimal("50.00"), null);
        req.setItems(Collections.singletonList(item));

        when(supplierRepository.findById(10L)).thenReturn(Optional.of(supplier));
        when(purchaseOrderRepository.count()).thenReturn(0L);
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(invocation -> {
            PurchaseOrder po = invocation.getArgument(0);
            po.setId(101L);
            return po;
        });

        OrderResponseDto created = purchaseOrderService.createOrder(req, buyer);

        assertNotNull(created);
        assertEquals(OrderStatus.PENDING, created.getStatus());
        assertEquals(new BigDecimal("100.00"), created.getTotalAmount());
        assertEquals(new BigDecimal("8.00"), created.getTaxAmount());
        assertEquals(new BigDecimal("108.00"), created.getGrandTotal());
    }

    @Test
    void updateOrderStatus_AdminApprovesPendingOrder_Success() {
        when(purchaseOrderRepository.findById(100L)).thenReturn(Optional.of(samplePo));
        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateOrderStatusRequest req = new UpdateOrderStatusRequest(OrderStatus.APPROVED, null);
        OrderResponseDto updated = purchaseOrderService.updateOrderStatus(100L, req, admin);

        assertEquals(OrderStatus.APPROVED, updated.getStatus());
    }

    @Test
    void updateOrderStatus_SupplierCannotDeliverUnapprovedOrder_ThrowsBadRequest() {
        when(purchaseOrderRepository.findById(100L)).thenReturn(Optional.of(samplePo)); // Currently PENDING

        UpdateOrderStatusRequest req = new UpdateOrderStatusRequest(OrderStatus.DELIVERED, null);

        assertThrows(BadRequestException.class, () -> purchaseOrderService.updateOrderStatus(100L, req, supplierUser));
    }
}