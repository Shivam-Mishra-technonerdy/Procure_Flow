package com.management.supplierpo.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalOrders;
    private long pendingOrders;
    private long approvedOrders;
    private long deliveredOrders;
    private long rejectedOrders;
    private BigDecimal totalExpenditure;
    private BigDecimal totalSpendInr = BigDecimal.ZERO;
    private BigDecimal totalSpendUsd = BigDecimal.ZERO;
    private BigDecimal totalExpenditureInrBase = BigDecimal.ZERO;
    private long totalSuppliers;
    private List<OrderResponseDto> recentOrders;
    private List<MonthlySpendingDto> monthlySpending;
    private Map<String, Long> statusDistribution;
    private List<Map<String, Object>> supplierPerformance;

    public DashboardStatsDto() {}

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
    public long getPendingOrders() { return pendingOrders; }
    public void setPendingOrders(long pendingOrders) { this.pendingOrders = pendingOrders; }
    public long getApprovedOrders() { return approvedOrders; }
    public void setApprovedOrders(long approvedOrders) { this.approvedOrders = approvedOrders; }
    public long getDeliveredOrders() { return deliveredOrders; }
    public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }
    public long getRejectedOrders() { return rejectedOrders; }
    public void setRejectedOrders(long rejectedOrders) { this.rejectedOrders = rejectedOrders; }
    public BigDecimal getTotalExpenditure() { return totalExpenditure; }
    public void setTotalExpenditure(BigDecimal totalExpenditure) { this.totalExpenditure = totalExpenditure; }
    public BigDecimal getTotalSpendInr() { return totalSpendInr; }
    public void setTotalSpendInr(BigDecimal totalSpendInr) { this.totalSpendInr = totalSpendInr; }
    public BigDecimal getTotalSpendUsd() { return totalSpendUsd; }
    public void setTotalSpendUsd(BigDecimal totalSpendUsd) { this.totalSpendUsd = totalSpendUsd; }
    public BigDecimal getTotalExpenditureInrBase() { return totalExpenditureInrBase; }
    public void setTotalExpenditureInrBase(BigDecimal totalExpenditureInrBase) { this.totalExpenditureInrBase = totalExpenditureInrBase; }
    public long getTotalSuppliers() { return totalSuppliers; }
    public void setTotalSuppliers(long totalSuppliers) { this.totalSuppliers = totalSuppliers; }
    public List<OrderResponseDto> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<OrderResponseDto> recentOrders) { this.recentOrders = recentOrders; }
    public List<MonthlySpendingDto> getMonthlySpending() { return monthlySpending; }
    public void setMonthlySpending(List<MonthlySpendingDto> monthlySpending) { this.monthlySpending = monthlySpending; }
    public Map<String, Long> getStatusDistribution() { return statusDistribution; }
    public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }
    public List<Map<String, Object>> getSupplierPerformance() { return supplierPerformance; }
    public void setSupplierPerformance(List<Map<String, Object>> supplierPerformance) { this.supplierPerformance = supplierPerformance; }
}
