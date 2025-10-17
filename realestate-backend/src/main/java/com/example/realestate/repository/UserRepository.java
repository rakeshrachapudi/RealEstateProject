package com.example.realestate.repository;

import com.example.realestate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByMobileNumber(String mobileNumber);  // ✅ ADD THIS
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByRole(User.UserRole role);
    List<User> findByIsActiveTrue();
}