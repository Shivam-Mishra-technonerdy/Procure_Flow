package com.management.supplierpo.service;

import com.management.supplierpo.dto.DashboardStatsDto;
import com.management.supplierpo.dto.MonthlySpendingDto;
import com.management.supplierpo.dto.OrderResponseDto;
import com.management.supplierpo.model.OrderStatus;
import com.management.supplierpo.model.PurchaseOrder;
import com.management.supplierpo.model.Role;
import com.management.supplierpo.model.User;
import com.management.supplierpo.repository.PurchaseOrderRepository;
import com.management.supplierpo.repository.SupplierRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderService purchaseOrderService;

    public ReportService(PurchaseOrderRepository purchaseOrderRepository,
                         SupplierRepository supplierRepository,
                         PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseOrderService = purchaseOrderService;
    }

    public DashboardStatsDto getDashboardStats(User currentUser) {
        DashboardStatsDto dto = new DashboardStatsDto();

        List<PurchaseOrder> orders;
        if (currentUser.getRole() == Role.ADMIN) {
            orders = purchaseOrderRepository.findAllByOrderByCreatedAtDesc();
        } else if (currentUser.getRole() == Role.SUPPLIER) {
            orders = currentUser.getSupplier() != null
                    ? purchaseOrderRepository.findBySupplierOrderByCreatedAtDesc(currentUser.getSupplier())
                    : new ArrayList<>();
        } else {
            orders = purchaseOrderRepository.findByBuyerOrderByCreatedAtDesc(currentUser);
        }

        long pending = orders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long approved = orders.stream().filter(o -> o.getStatus() == OrderStatus.APPROVED).count();
        long delivered = orders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
        long rejected = orders.stream().filter(o -> o.getStatus() == OrderStatus.REJECTED).count();

        BigDecimal totalSpendInr = BigDecimal.ZERO;
        BigDecimal totalSpendUsd = BigDecimal.ZERO;
        BigDecimal totalSpendInrBase = BigDecimal.ZERO;

        for (PurchaseOrder o : orders) {
            if (o.getStatus() != OrderStatus.REJECTED && o.getStatus() != OrderStatus.CANCELLED) {
                BigDecimal inrBase = "USD".equalsIgnoreCase(o.getCurrencyCode())
                        ? o.getGrandTotal().multiply(o.getExchangeRateToInr() != null ? o.getExchangeRateToInr() : new BigDecimal("83.500000")).setScale(2, java.math.RoundingMode.HALF_UP)
                        : o.getGrandTotal();
                totalSpendInrBase = totalSpendInrBase.add(inrBase);

                if ("USD".equalsIgnoreCase(o.getCurrencyCode())) {
                    totalSpendUsd = totalSpendUsd.add(o.getGrandTotal());
                } else {
                    totalSpendInr = totalSpendInr.add(o.getGrandTotal());
                }
            }
        }

        dto.setTotalOrders(orders.size());
        dto.setPendingOrders(pending);
        dto.setApprovedOrders(approved);
        dto.setDeliveredOrders(delivered);
        dto.setRejectedOrders(rejected);
        dto.setTotalExpenditure(totalSpendInrBase);
        dto.setTotalExpenditureInrBase(totalSpendInrBase);
        dto.setTotalSpendInr(totalSpendInr);
        dto.setTotalSpendUsd(totalSpendUsd);
        dto.setTotalSuppliers(supplierRepository.count());

        // Status Distribution Map for Chart.js
        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("Pending", pending);
        distribution.put("Approved", approved);
        distribution.put("Delivered", delivered);
        distribution.put("Rejected", rejected);
        dto.setStatusDistribution(distribution);

        // Recent Orders (Top 5)
        List<OrderResponseDto> recent = orders.stream()
                .limit(5)
                .map(purchaseOrderService::mapToDto)
                .collect(Collectors.toList());
        dto.setRecentOrders(recent);

        // Monthly Breakdown for Chart.js (Base INR equivalent)
        Map<String, MonthlySpendingDto> monthlyMap = new LinkedHashMap<>();
        for (PurchaseOrder po : orders) {
            if (po.getCreatedAt() != null && po.getStatus() != OrderStatus.REJECTED && po.getStatus() != OrderStatus.CANCELLED) {
                String monthName = po.getCreatedAt().getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
                BigDecimal base = "USD".equalsIgnoreCase(po.getCurrencyCode())
                        ? po.getGrandTotal().multiply(po.getExchangeRateToInr() != null ? po.getExchangeRateToInr() : new BigDecimal("83.500000")).setScale(2, java.math.RoundingMode.HALF_UP)
                        : po.getGrandTotal();
                monthlyMap.compute(monthName, (k, v) -> {
                    if (v == null) {
                        return new MonthlySpendingDto(k, base, 1);
                    } else {
                        v.setAmount(v.getAmount().add(base));
                        v.setOrderCount(v.getOrderCount() + 1);
                        return v;
                    }
                });
            }
        }
        dto.setMonthlySpending(new ArrayList<>(monthlyMap.values()));

        // Supplier Breakdown
        List<Map<String, Object>> supplierStats = new ArrayList<>();
        Map<String, List<PurchaseOrder>> ordersBySupplier = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getSupplier().getCompanyName()));

        ordersBySupplier.forEach((company, poList) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("supplier", company);
            map.put("orderCount", poList.size());
            BigDecimal sumInrBase = poList.stream().map(p -> {
                if ("USD".equalsIgnoreCase(p.getCurrencyCode())) {
                    BigDecimal rate = p.getExchangeRateToInr() != null ? p.getExchangeRateToInr() : new BigDecimal("83.500000");
                    return p.getGrandTotal().multiply(rate).setScale(2, java.math.RoundingMode.HALF_UP);
                }
                return p.getGrandTotal();
            }).reduce(BigDecimal.ZERO, BigDecimal::add);
            map.put("totalAmount", sumInrBase);
            supplierStats.add(map);
        });
        dto.setSupplierPerformance(supplierStats);

        return dto;
    }
}
