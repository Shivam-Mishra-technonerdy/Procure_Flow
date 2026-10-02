package com.management.supplierpo.service;

import com.management.supplierpo.dto.*;
import com.management.supplierpo.exception.BadRequestException;
import com.management.supplierpo.exception.ResourceNotFoundException;
import com.management.supplierpo.model.Role;
import com.management.supplierpo.model.Supplier;
import com.management.supplierpo.model.User;
import com.management.supplierpo.repository.PurchaseOrderRepository;
import com.management.supplierpo.repository.SupplierRepository;
import com.management.supplierpo.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       SupplierRepository supplierRepository,
                       PurchaseOrderRepository purchaseOrderRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email address is already in use: " + email);
        }

        Supplier supplier = null;
        if (request.getRole() == Role.SUPPLIER) {
            if (request.getSupplierId() == null) {
                throw new BadRequestException("A supplier organization must be selected when creating a SUPPLIER user");
            }
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setActive(request.getActive() != null ? request.getActive() : true);
        user.setSupplier(supplier);
        user.setPhoneCountryCode(request.getPhoneCountryCode());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCountryCode(request.getCountryCode());
        user.setAddressLine1(request.getAddressLine1());
        user.setAddressLine2(request.getAddressLine2());
        user.setCity(request.getCity());
        user.setStateProvince(request.getStateProvince());
        user.setPostalCode(request.getPostalCode());

        User saved = userRepository.save(user);
        return mapToDto(saved);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (!newEmail.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("Email address is already in use by another user: " + newEmail);
            }
            user.setEmail(newEmail);
        }

        user.setFullName(request.getFullName().trim());
        user.setRole(request.getRole());

        if (request.getActive() != null) {
            user.setActive(request.getActive());
        }

        if (request.getPhoneCountryCode() != null) user.setPhoneCountryCode(request.getPhoneCountryCode());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getCountryCode() != null) user.setCountryCode(request.getCountryCode());
        if (request.getAddressLine1() != null) user.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) user.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) user.setCity(request.getCity());
        if (request.getStateProvince() != null) user.setStateProvince(request.getStateProvince());
        if (request.getPostalCode() != null) user.setPostalCode(request.getPostalCode());

        if (request.getRole() == Role.SUPPLIER) {
            if (request.getSupplierId() == null) {
                throw new BadRequestException("A supplier organization must be selected when role is SUPPLIER");
            }
            Supplier supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
            user.setSupplier(supplier);
        } else {
            user.setSupplier(null);
        }

        User updated = userRepository.save(user);
        return mapToDto(updated);
    }

    @Transactional
    public UserDto updateUserStatus(Long id, Boolean active, User currentUser) {
        if (currentUser != null && currentUser.getId().equals(id) && Boolean.FALSE.equals(active)) {
            throw new BadRequestException("You cannot deactivate your own administrative account");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(active != null ? active : true);
        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public UserDto resetPassword(Long id, String newPassword) {
        if (newPassword == null || newPassword.trim().length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setPassword(passwordEncoder.encode(newPassword.trim()));
        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id, User currentUser) {
        if (currentUser != null && currentUser.getId().equals(id)) {
            throw new BadRequestException("You cannot delete your own administrative account");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (purchaseOrderRepository.existsByBuyer(user)) {
            throw new BadRequestException("Cannot delete user with associated purchase orders. Deactivate the user instead to preserve audit records.");
        }

        try {
            userRepository.delete(user);
        } catch (Exception e) {
            throw new BadRequestException("Cannot delete user because they have linked historical records. Deactivate the account instead.");
        }
    }

    public UserDto mapToDto(User user) {
        Long supplierId = user.getSupplier() != null ? user.getSupplier().getId() : null;
        String supplierName = user.getSupplier() != null ? user.getSupplier().getCompanyName() : null;
        UserDto dto = new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole(),
                user.getActive(),
                supplierId,
                supplierName,
                user.getCreatedAt()
        );
        dto.setPhoneCountryCode(user.getPhoneCountryCode());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setCountryCode(user.getCountryCode());
        dto.setAddressLine1(user.getAddressLine1());
        dto.setAddressLine2(user.getAddressLine2());
        dto.setCity(user.getCity());
        dto.setStateProvince(user.getStateProvince());
        dto.setPostalCode(user.getPostalCode());
        return dto;
    }
}
