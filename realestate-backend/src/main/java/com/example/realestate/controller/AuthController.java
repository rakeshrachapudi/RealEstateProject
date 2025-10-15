package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.model.User;
import com.example.realestate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // DTOs
    static class SignupRequest {
        public String username;
        public String password;
        public String email;
        public String firstName;
        public String lastName;
        public String mobileNumber;
    }

    static class LoginRequest {
        public String username;
        public String password;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        logger.info("Signup attempt for username: {}", request.username);

        // Validate input
        if (request.username == null || request.username.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Username is required"));
        }
        if (request.password == null || request.password.length() < 6) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Password must be at least 6 characters"));
        }
        if (request.email == null || !request.email.contains("@")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Valid email is required"));
        }

        // Check if username already exists
        if (userRepository.existsByUsername(request.username)) {
            logger.warn("Signup failed - username already exists: {}", request.username);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Username already exists"));
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.email)) {
            logger.warn("Signup failed - email already exists: {}", request.email);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Email already registered"));
        }

        // Create new user
        User user = new User();
        user.setUsername(request.username);
        user.setPassword(passwordEncoder.encode(request.password));
        user.setEmail(request.email);
        user.setFirstName(request.firstName);
        user.setLastName(request.lastName);
        user.setMobileNumber(request.mobileNumber);

        User savedUser = userRepository.save(user);
        logger.info("User registered successfully: {}", savedUser.getUsername());

        // Create response without password
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration successful!");
        response.put("user", createUserResponse(savedUser));
        response.put("token", "jwt-token-" + savedUser.getId()); // Simplified token

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        logger.info("Login attempt for username: {}", request.username);

        // Validate input
        if (request.username == null || request.username.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Username is required"));
        }
        if (request.password == null || request.password.trim().isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Password is required"));
        }

        // Find user by username
        User user = userRepository.findByUsername(request.username).orElse(null);

        if (user == null) {
            logger.warn("Login failed - user not found: {}", request.username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        }

        // Check password
        if (user.getPassword() == null || !passwordEncoder.matches(request.password, user.getPassword())) {
            logger.warn("Login failed - invalid password for: {}", request.username);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid username or password"));
        }

        logger.info("User logged in successfully: {}", user.getUsername());

        // Create response without password
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful!");
        response.put("user", createUserResponse(user));
        response.put("token", "jwt-token-" + user.getId()); // Simplified token

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String token) {
        // For now, just return a mock response since we're using simple tokens
        if (token == null || !token.startsWith("jwt-token-")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Unauthorized"));
        }

        // Extract user ID from token (simplified)
        try {
            String userId = token.replace("jwt-token-", "");
            User user = userRepository.findById(Long.parseLong(userId)).orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.error("User not found"));
            }

            return ResponseEntity.ok(ApiResponse.success(createUserResponse(user)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Invalid token"));
        }
    }

    // Helper method to create user response without password
    private Map<String, Object> createUserResponse(User user) {
        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("username", user.getUsername());
        userMap.put("email", user.getEmail());
        userMap.put("firstName", user.getFirstName());
        userMap.put("lastName", user.getLastName());
        userMap.put("mobileNumber", user.getMobileNumber());
        return userMap;
    }
}
