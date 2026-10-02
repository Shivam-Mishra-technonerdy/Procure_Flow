package com.management.supplierpo.service;

import com.management.supplierpo.dto.SupplierDto;
import com.management.supplierpo.exception.BadRequestException;
import com.management.supplierpo.model.Supplier;
import com.management.supplierpo.repository.SupplierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupplierServiceTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierService supplierService;

    private Supplier sampleSupplier;
    private SupplierDto sampleDto;

    @BeforeEach
    void setUp() {
        sampleSupplier = new Supplier(1L, "Vendor A", "Vendor A Corp", "vendor@example.com",
                "1234567890", "123 Main St", "Hardware", 4.5, "ACTIVE");

        sampleDto = new SupplierDto();
        sampleDto.setName("Vendor A");
        sampleDto.setCompanyName("Vendor A Corp");
        sampleDto.setContactEmail("vendor@example.com");
    }

    @Test
    void getAllSuppliers_ReturnsList() {
        when(supplierRepository.findAll()).thenReturn(Collections.singletonList(sampleSupplier));

        List<SupplierDto> result = supplierService.getAllSuppliers(null);

        assertEquals(1, result.size());
        assertEquals("Vendor A Corp", result.get(0).getCompanyName());
        verify(supplierRepository, times(1)).findAll();
    }

    @Test
    void createSupplier_Success() {
        when(supplierRepository.existsByContactEmail("vendor@example.com")).thenReturn(false);
        when(supplierRepository.save(any(Supplier.class))).thenReturn(sampleSupplier);

        SupplierDto created = supplierService.createSupplier(sampleDto);

        assertNotNull(created);
        assertEquals("Vendor A Corp", created.getCompanyName());
    }

    @Test
    void createSupplier_DuplicateEmail_ThrowsBadRequest() {
        when(supplierRepository.existsByContactEmail("vendor@example.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> supplierService.createSupplier(sampleDto));
        verify(supplierRepository, never()).save(any(Supplier.class));
    }
}
