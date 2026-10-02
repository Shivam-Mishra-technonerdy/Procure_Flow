package com.management.supplierpo.repository;

import com.management.supplierpo.model.Role;
import com.management.supplierpo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByRole(Role role);

    default Optional<User> findByUsername(String username) {
        return findByEmail(username);
    }

    default Optional<User> findByUsernameOrEmail(String username, String email) {
        if (email != null && !email.trim().isEmpty()) {
            return findByEmail(email);
        }
        return findByEmail(username);
    }

    default Boolean existsByUsername(String username) {
        return existsByEmail(username);
    }
}

