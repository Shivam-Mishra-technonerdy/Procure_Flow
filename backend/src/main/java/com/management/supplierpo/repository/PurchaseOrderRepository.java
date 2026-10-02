package com.management.supplierpo.repository;

import com.management.supplierpo.model.OrderStatus;
import com.management.supplierpo.model.PurchaseOrder;
import com.management.supplierpo.model.Supplier;
import com.management.supplierpo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Optional<PurchaseOrder> findByOrderNumber(String orderNumber);
    List<PurchaseOrder> findByBuyerOrderByCreatedAtDesc(User buyer);
    List<PurchaseOrder> findBySupplierOrderByCreatedAtDesc(Supplier supplier);
    List<PurchaseOrder> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    List<PurchaseOrder> findAllByOrderByCreatedAtDesc();

    long countByStatus(OrderStatus status);
    boolean existsByBuyer(User buyer);
    boolean existsBySupplier(Supplier supplier);

    @Query("SELECT COALESCE(SUM(po.totalAmount), 0) FROM PurchaseOrder po WHERE po.status != com.management.supplierpo.model.OrderStatus.REJECTED")
    BigDecimal calculateTotalExpenditure();

    @Query("SELECT po.supplier.name, COUNT(po), SUM(po.totalAmount) FROM PurchaseOrder po GROUP BY po.supplier.name")
    List<Object[]> getSupplierOrderStats();
}

