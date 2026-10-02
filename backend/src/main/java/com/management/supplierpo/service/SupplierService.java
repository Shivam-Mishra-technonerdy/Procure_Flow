package com.management.supplierpo.service;

import com.management.supplierpo.dto.SupplierDto;
import com.management.supplierpo.exception.BadRequestException;
import com.management.supplierpo.exception.ResourceNotFoundException;
import com.management.supplierpo.model.Supplier;
import com.management.supplierpo.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public List<SupplierDto> getAllSuppliers(String search) {
        List<Supplier> list;
        if (search != null && !search.trim().isEmpty()) {
            list = supplierRepository.findByNameContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(search.trim(), search.trim());
        } else {
            list = supplierRepository.findAll();
        }
        return list.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public SupplierDto getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));
        return mapToDto(supplier);
    }

    @Transactional
    public SupplierDto createSupplier(SupplierDto dto) {
        if (supplierRepository.existsByContactEmail(dto.getContactEmail())) {
            throw new BadRequestException("A supplier with email " + dto.getContactEmail() + " already exists!");
        }

        Supplier s = new Supplier();
        s.setName(dto.getName());
        s.setCompanyName(dto.getCompanyName());
        s.setContactEmail(dto.getContactEmail());
        s.setPhone(dto.getPhone());
        s.setAddress(dto.getAddress());
        s.setCategory(dto.getCategory());
        s.setRating(dto.getRating() != null ? dto.getRating() : 4.5);
        s.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");
        s.setPhoneCountryCode(dto.getPhoneCountryCode());
        s.setPhoneNumber(dto.getPhoneNumber());
        s.setCountryCode(dto.getCountryCode());
        s.setAddressLine1(dto.getAddressLine1());
        s.setAddressLine2(dto.getAddressLine2());
        s.setCity(dto.getCity());
        s.setStateProvince(dto.getStateProvince());
        s.setPostalCode(dto.getPostalCode());
        if (dto.getIsDemo() != null) {
            s.setIsDemo(dto.getIsDemo());
        }

        if (s.getPhone() == null || s.getPhone().isBlank()) {
            s.setPhone(s.getFormattedPhone());
        }
        if (s.getAddress() == null || s.getAddress().isBlank()) {
            s.setAddress(s.getFormattedAddress());
        }

        return mapToDto(supplierRepository.save(s));
    }

    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierDto dto) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));

        s.setName(dto.getName());
        s.setCompanyName(dto.getCompanyName());
        s.setContactEmail(dto.getContactEmail());
        s.setPhone(dto.getPhone());
        s.setAddress(dto.getAddress());
        s.setCategory(dto.getCategory());
        if (dto.getRating() != null) s.setRating(dto.getRating());
        if (dto.getStatus() != null) s.setStatus(dto.getStatus());

        if (dto.getPhoneCountryCode() != null) s.setPhoneCountryCode(dto.getPhoneCountryCode());
        if (dto.getPhoneNumber() != null) s.setPhoneNumber(dto.getPhoneNumber());
        if (dto.getCountryCode() != null) s.setCountryCode(dto.getCountryCode());
        if (dto.getAddressLine1() != null) s.setAddressLine1(dto.getAddressLine1());
        if (dto.getAddressLine2() != null) s.setAddressLine2(dto.getAddressLine2());
        if (dto.getCity() != null) s.setCity(dto.getCity());
        if (dto.getStateProvince() != null) s.setStateProvince(dto.getStateProvince());
        if (dto.getPostalCode() != null) s.setPostalCode(dto.getPostalCode());
        if (dto.getIsDemo() != null) s.setIsDemo(dto.getIsDemo());

        if (s.getPhone() == null || s.getPhone().isBlank()) {
            s.setPhone(s.getFormattedPhone());
        }
        if (s.getAddress() == null || s.getAddress().isBlank()) {
            s.setAddress(s.getFormattedAddress());
        }

        return mapToDto(supplierRepository.save(s));
    }

    @Transactional
    public void deleteSupplier(Long id) {
        Supplier s = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with ID: " + id));
        supplierRepository.delete(s);
    }

    public SupplierDto mapToDto(Supplier s) {
        SupplierDto dto = new SupplierDto();
        dto.setId(s.getId());
        dto.setName(s.getName());
        dto.setCompanyName(s.getCompanyName());
        dto.setContactEmail(s.getContactEmail());
        dto.setPhone(s.getPhone());
        dto.setAddress(s.getAddress());
        dto.setCategory(s.getCategory());
        dto.setRating(s.getRating());
        dto.setStatus(s.getStatus());
        dto.setIsDemo(s.getIsDemo());
        dto.setPhoneCountryCode(s.getPhoneCountryCode());
        dto.setPhoneNumber(s.getPhoneNumber());
        dto.setCountryCode(s.getCountryCode());
        dto.setAddressLine1(s.getAddressLine1());
        dto.setAddressLine2(s.getAddressLine2());
        dto.setCity(s.getCity());
        dto.setStateProvince(s.getStateProvince());
        dto.setPostalCode(s.getPostalCode());
        return dto;
    }
}
