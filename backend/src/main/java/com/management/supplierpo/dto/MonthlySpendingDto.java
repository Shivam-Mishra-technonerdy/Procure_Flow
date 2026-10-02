package com.management.supplierpo.dto;

import java.math.BigDecimal;

public class MonthlySpendingDto {
    private String month;
    private BigDecimal amount;
    private long orderCount;

    public MonthlySpendingDto() {}
    public MonthlySpendingDto(String month, BigDecimal amount, long orderCount) {
        this.month = month;
        this.amount = amount;
        this.orderCount = orderCount;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public long getOrderCount() { return orderCount; }
    public void setOrderCount(long orderCount) { this.orderCount = orderCount; }
}
