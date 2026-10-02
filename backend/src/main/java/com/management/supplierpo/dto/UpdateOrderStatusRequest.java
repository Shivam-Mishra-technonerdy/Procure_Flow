package com.management.supplierpo.dto;

import com.management.supplierpo.model.OrderStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class UpdateOrderStatusRequest {
    @NotNull(message = "Status is required")
    private OrderStatus status;

    private LocalDate actualDeliveryDate;
    private String rejectionReason;

    public UpdateOrderStatusRequest() {}
    public UpdateOrderStatusRequest(OrderStatus status, String rejectionReason) {
        this.status = status;
        this.rejectionReason = rejectionReason;
    }

    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public LocalDate getActualDeliveryDate() { return actualDeliveryDate; }
    public void setActualDeliveryDate(LocalDate actualDeliveryDate) { this.actualDeliveryDate = actualDeliveryDate; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
