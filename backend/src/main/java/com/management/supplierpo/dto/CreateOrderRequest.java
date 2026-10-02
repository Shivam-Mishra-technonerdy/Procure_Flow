package com.management.supplierpo.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class CreateOrderRequest {
    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private String deliveryAddress;
    private LocalDate expectedDeliveryDate;
    private String notes;

    @NotEmpty(message = "Order must have at least one line item")
    @Valid
    private List<OrderItemDto> items;

    private String currencyCode = "INR";
    private java.math.BigDecimal exchangeRateToInr;

    public CreateOrderRequest() {}

    public Long getSupplierId() { return supplierId; }
    public void setSupplierId(Long supplierId) { this.supplierId = supplierId; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }
    public LocalDate getDeliveryDate() { return expectedDeliveryDate; }
    public void setDeliveryDate(LocalDate deliveryDate) {
        if (this.expectedDeliveryDate == null) {
            this.expectedDeliveryDate = deliveryDate;
        }
    }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<OrderItemDto> getItems() { return items; }
    public void setItems(List<OrderItemDto> items) { this.items = items; }
    public String getCurrencyCode() { return currencyCode != null ? currencyCode : "INR"; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }
    public java.math.BigDecimal getExchangeRateToInr() { return exchangeRateToInr; }
    public void setExchangeRateToInr(java.math.BigDecimal exchangeRateToInr) { this.exchangeRateToInr = exchangeRateToInr; }
}
