package com.management.supplierpo.service;

import com.management.supplierpo.dto.*;
import com.management.supplierpo.exception.BadRequestException;
import com.management.supplierpo.exception.ResourceNotFoundException;
import com.management.supplierpo.exception.UnauthorizedException;
import com.management.supplierpo.model.*;
import com.management.supplierpo.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final UserRepository userRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository,
                                SupplierRepository supplierRepository,
                                UserRepository userRepository,
                                OrderStatusHistoryRepository orderStatusHistoryRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
        this.userRepository = userRepository;
        this.orderStatusHistoryRepository = orderStatusHistoryRepository;
    }


    @Transactional
    public OrderResponseDto createOrder(CreateOrderRequest request, User buyer) {
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));

        if (!"ACTIVE".equalsIgnoreCase(supplier.getStatus())) {
            throw new BadRequestException("Cannot create order for inactive supplier: " + supplier.getCompanyName());
        }

        PurchaseOrder po = new PurchaseOrder();
        long orderCount = purchaseOrderRepository.count();
        po.setOrderNumber(String.format("PO-%d-%04d", LocalDate.now().getYear(), orderCount + 1));
        po.setBuyer(buyer);
        po.setSupplier(supplier);
        po.setStatus(OrderStatus.PENDING);
        po.setDeliveryAddress(request.getDeliveryAddress());
        po.setExpectedDeliveryDate(request.getExpectedDeliveryDate());
        po.setNotes(request.getNotes());
        po.setRemarks(request.getNotes());
        po.setOrderDate(LocalDateTime.now());

        String currencyCode = "INR";
        if (request.getCurrencyCode() != null && !request.getCurrencyCode().trim().isEmpty()) {
            currencyCode = request.getCurrencyCode().trim().toUpperCase();
        }
        if (!"INR".equals(currencyCode) && !"USD".equals(currencyCode)) {
            throw new BadRequestException("Unsupported currency: " + currencyCode + ". Allowed currencies are INR and USD.");
        }

        BigDecimal rate = BigDecimal.ONE;
        if ("USD".equals(currencyCode)) {
            rate = (request.getExchangeRateToInr() != null && request.getExchangeRateToInr().compareTo(BigDecimal.ZERO) > 0)
                    ? request.getExchangeRateToInr()
                    : new BigDecimal("83.500000");
        }
        po.setCurrencyCode(currencyCode);
        po.setExchangeRateToInr(rate);

        BigDecimal subtotalSum = BigDecimal.ZERO;
        for (OrderItemDto itemDto : request.getItems()) {
            BigDecimal lineSubtotal = itemDto.getUnitPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity()));
            OrderItem item = new OrderItem(null, po, itemDto.getItemDescription(), itemDto.getQuantity(), itemDto.getUnitPrice(), lineSubtotal);
            item.setCurrencyCode(currencyCode);
            po.addItem(item);
            subtotalSum = subtotalSum.add(lineSubtotal);
        }

        BigDecimal tax = subtotalSum.multiply(new BigDecimal("0.08")).setScale(2, RoundingMode.HALF_UP);
        po.setTotalAmount(subtotalSum);
        po.setTaxAmount(tax);
        po.setGrandTotal(subtotalSum.add(tax));

        PurchaseOrder savedPo = purchaseOrderRepository.save(po);

        // Audit log
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                savedPo, null, OrderStatus.PENDING, buyer, "Purchase order submitted", LocalDateTime.now()
        ));

        return mapToDto(savedPo);
    }

    public List<OrderResponseDto> getAllOrders(User currentUser, OrderStatus status) {
        List<PurchaseOrder> list;

        if (currentUser.getRole() == Role.ADMIN) {
            if (status != null) {
                list = purchaseOrderRepository.findByStatusOrderByCreatedAtDesc(status);
            } else {
                list = purchaseOrderRepository.findAllByOrderByCreatedAtDesc();
            }
        } else if (currentUser.getRole() == Role.SUPPLIER) {
            if (currentUser.getSupplier() == null) {
                return new ArrayList<>();
            }
            list = purchaseOrderRepository.findBySupplierOrderByCreatedAtDesc(currentUser.getSupplier());
            if (status != null) {
                list = list.stream().filter(o -> o.getStatus() == status).collect(Collectors.toList());
            }
        } else { // BUYER
            list = purchaseOrderRepository.findByBuyerOrderByCreatedAtDesc(currentUser);
            if (status != null) {
                list = list.stream().filter(o -> o.getStatus() == status).collect(Collectors.toList());
            }
        }


        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public OrderResponseDto getOrderById(Long id, User currentUser) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with ID: " + id));

        validateOrderAccess(po, currentUser);
        return mapToDto(po);
    }

    public PurchaseOrder getOrderEntity(Long id, User currentUser) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with ID: " + id));

        validateOrderAccess(po, currentUser);
        return po;
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long id, UpdateOrderStatusRequest request, User currentUser) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with ID: " + id));

        OrderStatus currentStatus = po.getStatus();
        OrderStatus targetStatus = request.getStatus();

        // Workflow Validation Rules
        if (currentUser.getRole() == Role.ADMIN) {
            if (currentStatus != OrderStatus.PENDING) {
                throw new BadRequestException("Admin can only approve or reject orders in PENDING status. Current status: " + currentStatus);
            }
            if (targetStatus != OrderStatus.APPROVED && targetStatus != OrderStatus.REJECTED) {
                throw new BadRequestException("Admin can only transition PENDING orders to APPROVED or REJECTED");
            }
            if (targetStatus == OrderStatus.REJECTED && (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty())) {
                throw new BadRequestException("A rejection reason must be provided when rejecting an order");
            }
        } else if (currentUser.getRole() == Role.SUPPLIER) {
            if (currentUser.getSupplier() == null || !currentUser.getSupplier().getId().equals(po.getSupplier().getId())) {
                throw new UnauthorizedException("You are not authorized to update orders for other suppliers");
            }
            if (currentStatus != OrderStatus.APPROVED) {
                throw new BadRequestException("Supplier can only mark orders as DELIVERED after they are APPROVED. Current status: " + currentStatus);
            }
            if (targetStatus != OrderStatus.DELIVERED) {
                throw new BadRequestException("Supplier can only transition orders from APPROVED to DELIVERED");
            }
        } else if (currentUser.getRole() == Role.BUYER) {
            if (!po.getBuyer().getId().equals(currentUser.getId())) {
                throw new UnauthorizedException("You can only cancel your own purchase orders");
            }
            if (currentStatus != OrderStatus.PENDING) {
                throw new BadRequestException("Buyer can only cancel orders that are in PENDING status. Current status: " + currentStatus);
            }
            if (targetStatus != OrderStatus.CANCELLED) {
                throw new BadRequestException("Buyer can only transition orders to CANCELLED");
            }
        }

        // Apply Status
        po.setStatus(targetStatus);

        if (targetStatus == OrderStatus.APPROVED) {
            po.setApprovedAt(LocalDateTime.now());
        } else if (targetStatus == OrderStatus.REJECTED) {
            po.setRejectionReason(request.getRejectionReason());
        } else if (targetStatus == OrderStatus.DELIVERED) {
            po.setDeliveredAt(LocalDateTime.now());
            po.setActualDeliveryDate(request.getActualDeliveryDate() != null ? request.getActualDeliveryDate() : LocalDate.now());
        }

        PurchaseOrder updatedPo = purchaseOrderRepository.save(po);

        // Audit log
        orderStatusHistoryRepository.save(new OrderStatusHistory(
                updatedPo, currentStatus, targetStatus, currentUser,
                request.getRejectionReason() != null ? request.getRejectionReason() : ("Status changed to " + targetStatus),
                LocalDateTime.now()
        ));

        return mapToDto(updatedPo);
    }

    private void validateOrderAccess(PurchaseOrder po, User currentUser) {
        if (currentUser == null) return;
        if (currentUser.getRole() == Role.ADMIN) return;
        if (currentUser.getRole() == Role.BUYER && po.getBuyer().getId().equals(currentUser.getId())) return;
        if (currentUser.getRole() == Role.SUPPLIER && currentUser.getSupplier() != null
                && po.getSupplier().getId().equals(currentUser.getSupplier().getId())) return;

        throw new UnauthorizedException("You are not authorized to view this purchase order");
    }

    public OrderResponseDto mapToDto(PurchaseOrder po) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(po.getId());
        dto.setOrderNumber(po.getOrderNumber());
        dto.setBuyerId(po.getBuyer().getId());
        dto.setBuyerName(po.getBuyer().getFullName());
        dto.setBuyerEmail(po.getBuyer().getEmail());
        dto.setSupplierId(po.getSupplier().getId());
        dto.setSupplierName(po.getSupplier().getName());
        dto.setSupplierCompany(po.getSupplier().getCompanyName());
        dto.setSupplierEmail(po.getSupplier().getContactEmail());
        dto.setStatus(po.getStatus());
        dto.setTotalAmount(po.getTotalAmount());
        dto.setTaxAmount(po.getTaxAmount());
        dto.setGrandTotal(po.getGrandTotal());
        dto.setCurrencyCode(po.getCurrencyCode());
        dto.setCurrencySymbol(po.getCurrencySymbol());
        dto.setExchangeRateToInr(po.getExchangeRateToInr());
        dto.setFormattedTotal(String.format("%s%,.2f", po.getCurrencySymbol(), po.getTotalAmount()));
        dto.setFormattedGrandTotal(String.format("%s%,.2f", po.getCurrencySymbol(), po.getGrandTotal()));
        dto.setDeliveryAddress(po.getDeliveryAddress());
        dto.setExpectedDeliveryDate(po.getExpectedDeliveryDate());
        dto.setActualDeliveryDate(po.getActualDeliveryDate());
        dto.setNotes(po.getNotes());
        dto.setRejectionReason(po.getRejectionReason());
        dto.setCreatedAt(po.getCreatedAt());
        dto.setUpdatedAt(po.getUpdatedAt());

        List<OrderItemDto> itemDtos = po.getItems().stream()
                .map(item -> new OrderItemDto(item.getId(), item.getItemDescription(), item.getQuantity(), item.getUnitPrice(), item.getSubtotal(), item.getCurrencyCode()))
                .collect(Collectors.toList());
        dto.setItems(itemDtos);

        return dto;
    }
}

