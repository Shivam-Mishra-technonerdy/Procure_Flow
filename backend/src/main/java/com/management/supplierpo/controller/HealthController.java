package com.management.supplierpo.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health", description = "Public health check endpoint")
public class HealthController {

    @GetMapping
    @Operation(summary = "Check backend health", description = "Public health probe returning UP status")
    public ResponseEntity<Map<String, String>> checkHealth() {
        return ResponseEntity.ok(Collections.singletonMap("status", "UP"));
    }
}
