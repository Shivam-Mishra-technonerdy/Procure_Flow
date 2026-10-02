package com.management.supplierpo.controller;

import com.management.supplierpo.dto.CreateOrderRequest;
import com.management.supplierpo.dto.OrderResponseDto;
import com.management.supplierpo.dto.UpdateOrderStatusRequest;
import com.management.supplierpo.model.OrderStatus;
import com.management.supplierpo.model.PurchaseOrder;
import com.management.supplierpo.security.UserPrincipal;
import com.management.supplierpo.service.PdfGenerationService;
import com.management.supplierpo.service.PurchaseOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Purchase Orders", description = "Endpoints for purchase order creation, approval workflow, tracking, and PDF export")
@SecurityRequirement(name = "bearerAuth")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;
    private final PdfGenerationService pdfGenerationService;

    public PurchaseOrderController(PurchaseOrderService purchaseOrderService, PdfGenerationService pdfGenerationService) {
        this.purchaseOrderService = purchaseOrderService;
        this.pdfGenerationService = pdfGenerationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('BUYER', 'ADMIN')")
    @Operation(summary = "Create purchase order", description = "Places a new purchase order in PENDING status (Buyer or Admin)")
    public ResponseEntity<OrderResponseDto> createOrder(@Valid @RequestBody CreateOrderRequest request,
                                                        @AuthenticationPrincipal UserPrincipal currentUser) {
        return new ResponseEntity<>(purchaseOrderService.createOrder(request, currentUser.getUser()), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get purchase orders", description = "Lists orders filtered by user role and optional status")
    public ResponseEntity<List<OrderResponseDto>> getAllOrders(@RequestParam(required = false) OrderStatus status,
                                                               @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(purchaseOrderService.getAllOrders(currentUser.getUser(), status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase order details", description = "Retrieves complete order information and itemized lines")
    public ResponseEntity<OrderResponseDto> getOrderById(@PathVariable Long id,
                                                         @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(purchaseOrderService.getOrderById(id, currentUser.getUser()));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Performs status transitions in the workflow: Admin (Approve/Reject), Supplier (Delivered), Buyer (Cancelled)")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(@PathVariable Long id,
                                                              @Valid @RequestBody UpdateOrderStatusRequest request,
                                                              @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(purchaseOrderService.updateOrderStatus(id, request, currentUser.getUser()));
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Export purchase order as PDF", description = "Generates and downloads or streams a professional PDF document for the order")
    public ResponseEntity<byte[]> downloadOrderPdf(@PathVariable Long id,
                                                   @AuthenticationPrincipal UserPrincipal currentUser) {
        PurchaseOrder order;
        if (currentUser != null) {
            order = purchaseOrderService.getOrderEntity(id, currentUser.getUser());
        } else {
            // Direct link fallback
            order = purchaseOrderService.getOrderEntity(id, null);
        }

        byte[] pdfBytes = pdfGenerationService.generatePurchaseOrderPdf(order);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", order.getOrderNumber() + ".pdf");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
