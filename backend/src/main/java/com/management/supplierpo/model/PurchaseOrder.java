package com.management.supplierpo.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "currency_code", nullable = false, length = 3)
    private String currencyCode = "INR";

    @Column(name = "exchange_rate_to_inr", precision = 15, scale = 6)
    private BigDecimal exchangeRateToInr = BigDecimal.ONE;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Transient fields to maintain frontend compatibility
    @Transient
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "delivery_address", length = 255)
    private String deliveryAddress;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    public PurchaseOrder() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.orderDate == null) {
            this.orderDate = LocalDateTime.now();
        }
        if (this.totalAmount == null) {
            this.totalAmount = BigDecimal.ZERO;
        }
        if (this.currencyCode == null || this.currencyCode.isBlank()) {
            this.currencyCode = "INR";
        }
        if (this.exchangeRateToInr == null) {
            this.exchangeRateToInr = BigDecimal.ONE;
        }
        if (this.status == null) {
            this.status = OrderStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setPurchaseOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setPurchaseOrder(null);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }

    public Supplier getSupplier() { return supplier; }
    public void setSupplier(Supplier supplier) { this.supplier = supplier; }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }

    public LocalDateTime getOrderDate() { return orderDate != null ? orderDate : createdAt; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public BigDecimal getTotalAmount() { return totalAmount != null ? totalAmount : BigDecimal.ZERO; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    @Transient
    private BigDecimal grandTotal;

    public BigDecimal getTaxAmount() { return taxAmount != null ? taxAmount : BigDecimal.ZERO; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getGrandTotal() {
        if (grandTotal != null) return grandTotal;
        if (taxAmount != null && taxAmount.compareTo(BigDecimal.ZERO) > 0) {
            return getTotalAmount().add(taxAmount);
        }
        return getTotalAmount();
    }
    public void setGrandTotal(BigDecimal grandTotal) {
        this.grandTotal = grandTotal;
    }

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }

    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }

    public LocalDate getActualDeliveryDate() {
        return deliveredAt != null ? deliveredAt.toLocalDate() : null;
    }
    public void setActualDeliveryDate(LocalDate actualDeliveryDate) {
        if (actualDeliveryDate != null) {
            this.deliveredAt = actualDeliveryDate.atStartOfDay();
        }
    }

    public String getNotes() { return remarks; }
    public void setNotes(String notes) { this.remarks = notes; }

    public String getRejectionReason() { return remarks; }
    public void setRejectionReason(String rejectionReason) { this.remarks = rejectionReason; }

    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCurrencyCode() { return currencyCode != null ? currencyCode : "INR"; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }

    public BigDecimal getExchangeRateToInr() { return exchangeRateToInr != null ? exchangeRateToInr : BigDecimal.ONE; }
    public void setExchangeRateToInr(BigDecimal exchangeRateToInr) { this.exchangeRateToInr = exchangeRateToInr; }

    public String getCurrencySymbol() {
        return "USD".equalsIgnoreCase(currencyCode) ? "$" : "₹";
    }
}

