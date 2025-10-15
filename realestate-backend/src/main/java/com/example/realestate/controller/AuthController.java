package com.example.realestate.controller;

import com.example.realestate.model.User;
import com.example.realestate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    static class RegistrationRequest {
        public String firstName;
        public String lastName;
        public String email;
        public String username;
        public String password;
        public String mobileNumber;
    }

    static class PasswordLoginRequest {
        public String username;
        public String password;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationRequest request) {
        LOGGER.info("Received registration request for username: {}", request.username);

        if (userRepository.existsByUsername(request.username)) {
            return new ResponseEntity<>(Map.of("message", "Username is already taken."), HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(request.email)) {
            return new ResponseEntity<>(Map.of("message", "Email is already registered."), HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setFirstName(request.firstName);
        user.setLastName(request.lastName);
        user.setUsername(request.username);
        user.setEmail(request.email);
        user.setMobileNumber(request.mobileNumber);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setRole(User.UserRole.USER); // Default role

        User savedUser = userRepository.save(user);

        String token = "dummy-jwt-for-signup-" + user.getUsername();
        LOGGER.info("User '{}' registered successfully.", savedUser.getUsername());
        return ResponseEntity.ok(Map.of("message", "Registration successful!", "token", token, "user", savedUser));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginWithPassword(@RequestBody PasswordLoginRequest request) {
        LOGGER.info("Received password login attempt for username: {}", request.username);
        User user = userRepository.findByUsername(request.username).orElse(null);

        if (user == null || user.getPassword() == null || !passwordEncoder.matches(request.password, user.getPassword())) {
            LOGGER.warn("Failed password login for username '{}': Invalid credentials.", request.username);
            return new ResponseEntity<>(Map.of("message", "Invalid username or password."), HttpStatus.UNAUTHORIZED);
        }

        String token = "dummy-jwt-for-password-login-" + user.getUsername();
        LOGGER.info("User '{}' logged in successfully with password.", user.getUsername());
        return ResponseEntity.ok(Map.of("message", "Login successful!", "token", token, "user", user));
    }
}