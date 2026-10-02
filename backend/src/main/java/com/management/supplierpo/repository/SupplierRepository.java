package com.management.supplierpo.repository;

import com.management.supplierpo.model.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    @Query("SELECT s FROM Supplier s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(COALESCE(s.contactName, '')) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(COALESCE(s.category, '')) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Supplier> searchSuppliers(@Param("query") String query);

    default List<Supplier> findByNameContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(String name, String companyName) {
        String term = name != null ? name : companyName;
        return searchSuppliers(term != null ? term : "");
    }

    List<Supplier> findByActive(Boolean active);

    default List<Supplier> findByStatus(String status) {
        return findByActive(!"INACTIVE".equalsIgnoreCase(status));
    }

    Boolean existsByEmail(String email);

    default Boolean existsByContactEmail(String email) {
        return existsByEmail(email);
    }
}

