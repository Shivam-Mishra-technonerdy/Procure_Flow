package com.management.supplierpo.dto;

import com.management.supplierpo.model.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponseDto {
    private Long id;
    private String orderNumber;
    private Long buyerId;
    private String buyerName;
    private String buyerEmail;
    private Long supplierId;
    private String supplierName;
    private String supplierCompany;
    private String supplierEmail;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private BigDecimal grandTotal;
    private String currencyCode = "INR";
    private String currencySymbol = "₹";
    private BigDecimal exchangeRateToInr;
    private String formattedTotal;
    private String formattedGrandTotal;
    private String deliveryAddress;
    private LocalDate expectedDeliveryDate;
    private LocalDate actualDeliveryDate;
    private String notes;
    private String rejectionReason;
    private List<OrderItemDto> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public OrderResponseDto() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }
    public Long getBuyerId() { return buyerId; }
    public void setBuyerId(Long buyerId) { this.buyerId = buyerId; }
    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }
    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }
    public String getSupplierCompany() { return supplierCompany; }
    public void setSupplierCompany(String supplierCompany) { this.supplierCompany = supplierCompany; }
    public String getSupplierEmail() { return supplierEmail; }
    public void setSupplierEmail(String supplierEmail) { this.supplierEmail = supplierEmail; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }
    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
    public LocalDate getActualDeliveryDate() { return actualDeliveryDate; }
    public void setActualDeliveryDate(LocalDate actualDeliveryDate) { this.actualDeliveryDate = actualDeliveryDate; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCurrencyCode() { return currencyCode != null ? currencyCode : "INR"; }
    public void setCurrencyCode(String currencyCode) {
        this.currencyCode = currencyCode;
        this.currencySymbol = "USD".equalsIgnoreCase(currencyCode) ? "$" : "₹";
    }

    public String getCurrencySymbol() {
        return currencySymbol != null ? currencySymbol : ("USD".equalsIgnoreCase(currencyCode) ? "$" : "₹");
    }
    public void setCurrencySymbol(String currencySymbol) { this.currencySymbol = currencySymbol; }

    public BigDecimal getExchangeRateToInr() { return exchangeRateToInr; }
    public void setExchangeRateToInr(BigDecimal exchangeRateToInr) { this.exchangeRateToInr = exchangeRateToInr; }

    public String getFormattedTotal() { return formattedTotal; }
    public void setFormattedTotal(String formattedTotal) { this.formattedTotal = formattedTotal; }

    public String getFormattedGrandTotal() { return formattedGrandTotal; }
    public void setFormattedGrandTotal(String formattedGrandTotal) { this.formattedGrandTotal = formattedGrandTotal; }
}
