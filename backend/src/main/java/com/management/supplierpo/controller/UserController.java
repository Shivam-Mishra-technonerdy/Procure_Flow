package com.management.supplierpo.controller;

import com.management.supplierpo.dto.*;
import com.management.supplierpo.security.UserPrincipal;
import com.management.supplierpo.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User management APIs (Admin only)")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Get all users", description = "Returns a list of all registered system users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Fetches details of a specific user")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @Operation(summary = "Create user", description = "Creates a new user account (Admin only)")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserDto created = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Updates an existing user's details (Admin only)")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update user active status", description = "Activates or deactivates a user account")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Boolean active = body.containsKey("active") ? Boolean.valueOf(body.get("active").toString()) : true;
        return ResponseEntity.ok(userService.updateUserStatus(id, active, currentUser != null ? currentUser.getUser() : null));
    }

    @PatchMapping("/{id}/reset-password")
    @Operation(summary = "Reset user password", description = "Sets a new password for the specified user")
    public ResponseEntity<UserDto> resetPassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newPassword = body.get("password");
        return ResponseEntity.ok(userService.resetPassword(id, newPassword));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user", description = "Safely removes a user account if no constraints exist")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        userService.deleteUser(id, currentUser != null ? currentUser.getUser() : null);
        return ResponseEntity.noContent().build();
    }
}
