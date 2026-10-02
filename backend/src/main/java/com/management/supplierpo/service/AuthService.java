package com.management.supplierpo.service;

import com.management.supplierpo.dto.AuthRequest;
import com.management.supplierpo.dto.AuthResponse;
import com.management.supplierpo.dto.RegisterRequest;
import com.management.supplierpo.dto.UserDto;
import com.management.supplierpo.exception.BadRequestException;
import com.management.supplierpo.exception.ResourceNotFoundException;
import com.management.supplierpo.model.Role;
import com.management.supplierpo.model.Supplier;
import com.management.supplierpo.model.User;
import com.management.supplierpo.repository.SupplierRepository;
import com.management.supplierpo.repository.UserRepository;
import com.management.supplierpo.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       SupplierRepository supplierRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider tokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.supplierRepository = supplierRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Long supplierId = user.getSupplier() != null ? user.getSupplier().getId() : null;
        String supplierName = user.getSupplier() != null ? user.getSupplier().getCompanyName() : null;

        return new AuthResponse(jwt, user.getId(), user.getUsername(), user.getEmail(),
                user.getFullName(), user.getRole(), supplierId, supplierName);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        Role targetRole = request.getRole() != null ? request.getRole() : Role.BUYER;

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered!");
        }

        Supplier supplier = null;
        if (targetRole == Role.SUPPLIER) {
            if (request.getSupplierId() == null) {
                throw new BadRequestException("A supplier company must be selected when registering as a Supplier.");
            }
            supplier = supplierRepository.findById(request.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + request.getSupplierId()));
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setRole(targetRole);
        user.setSupplier(supplier);
        user.setActive(true);

        User savedUser = userRepository.save(user);

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        Long supplierId = savedUser.getSupplier() != null ? savedUser.getSupplier().getId() : null;
        String supplierName = savedUser.getSupplier() != null ? savedUser.getSupplier().getCompanyName() : null;

        return new AuthResponse(jwt, savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(),
                savedUser.getFullName(), savedUser.getRole(), supplierId, supplierName);

    }

    public UserDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Long supplierId = user.getSupplier() != null ? user.getSupplier().getId() : null;
        String supplierName = user.getSupplier() != null ? user.getSupplier().getCompanyName() : null;

        UserDto dto = new UserDto(user.getId(), user.getUsername(), user.getEmail(),
                user.getFullName(), user.getRole(), user.isActive(), supplierId, supplierName, user.getCreatedAt());
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
