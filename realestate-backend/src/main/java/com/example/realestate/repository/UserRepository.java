package com.example.realestate.repository;

import com.example.realestate.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Used for all OTP-based flows (request-otp, verify-otp, register-with-otp)
    Optional<User> findByMobileNumber(String mobileNumber);


    Optional<User> findByUsername(String username);

    // Methods needed to support the AuthController's uniqueness checks
    // These methods return a boolean and are highly optimized for existence checks.
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
