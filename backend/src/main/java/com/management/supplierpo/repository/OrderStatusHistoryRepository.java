package com.management.supplierpo.repository;

import com.management.supplierpo.model.OrderStatusHistory;
import com.management.supplierpo.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> {
    List<OrderStatusHistory> findByPurchaseOrderOrderByChangedAtAsc(PurchaseOrder purchaseOrder);
}
