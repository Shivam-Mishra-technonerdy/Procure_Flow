package com.management.supplierpo.controller;

import com.management.supplierpo.dto.DashboardStatsDto;
import com.management.supplierpo.security.UserPrincipal;
import com.management.supplierpo.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/reports", "/api/admin/reports"})
@Tag(name = "Reports & Analytics", description = "Aggregated metrics and statistics for dashboard charts")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping({"/dashboard", "/orders"})
    @Operation(summary = "Get dashboard analytics", description = "Returns aggregated statistics, Chart.js datasets, and recent orders")
    public ResponseEntity<DashboardStatsDto> getDashboardStats(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(reportService.getDashboardStats(currentUser.getUser()));
    }
}
