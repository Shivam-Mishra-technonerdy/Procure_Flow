package com.management.supplierpo.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class OrderItemDto {
    private Long id;

    @NotBlank(message = "Item description is required")
    private String itemDescription;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Unit price is required")
    private BigDecimal unitPrice;

    private BigDecimal subtotal;
    private String currencyCode = "INR";

    public OrderItemDto() {}
    public OrderItemDto(Long id, String itemDescription, Integer quantity, BigDecimal unitPrice, BigDecimal subtotal) {
        this.id = id;
        this.itemDescription = itemDescription;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
        this.currencyCode = "INR";
    }

    public OrderItemDto(Long id, String itemDescription, Integer quantity, BigDecimal unitPrice, BigDecimal subtotal, String currencyCode) {
        this.id = id;
        this.itemDescription = itemDescription;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
        this.currencyCode = (currencyCode != null && !currencyCode.isBlank()) ? currencyCode : "INR";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getItemDescription() { return itemDescription; }
    public void setItemDescription(String itemDescription) { this.itemDescription = itemDescription; }
    public String getItemName() { return itemDescription; }
    public void setItemName(String itemName) {
        if (this.itemDescription == null || this.itemDescription.isBlank()) {
            this.itemDescription = itemName;
        }
    }
    public String getDescription() { return itemDescription; }
    public void setDescription(String description) {
        if (this.itemDescription == null || this.itemDescription.isBlank()) {
            this.itemDescription = description;
        }
    }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public String getCurrencyCode() { return currencyCode != null ? currencyCode : "INR"; }
    public void setCurrencyCode(String currencyCode) { this.currencyCode = currencyCode; }
    public String getCurrencySymbol() {
        return "USD".equalsIgnoreCase(currencyCode) ? "$" : "₹";
    }
}
