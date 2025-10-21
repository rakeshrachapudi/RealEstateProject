package com.example.realestate.controller;

import com.example.realestate.model.User;
import com.example.realestate.repository.UserRepository;
import com.example.realestate.dto.ApiResponse;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // DTOs
    static class LoginRequest {
        public String username;
        public String password;

        public String getUsername() { return username; }
        public String getPassword() { return password; }
    }

    static class RegisterRequest {
        public String username;
        public String password;
        public String email;
        public String firstName;
        public String lastName;
        public String mobileNumber;

        public String getUsername() { return username; }
        public String getPassword() { return password; }
        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getMobileNumber() { return mobileNumber; }
    }

    // ==================== LOGIN ENDPOINT ====================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        LOGGER.info("Login attempt for username: {}", request.getUsername());

        try {
            Optional<User> userOptional = userRepository.findByUsername(request.getUsername());

            if (userOptional.isEmpty()) {
                LOGGER.warn("❌ User not found: {}", request.getUsername());
                return new ResponseEntity<>(
                        ApiResponse.error("Invalid username or password"),
                        HttpStatus.UNAUTHORIZED
                );
            }

            User user = userOptional.get();

            if (!user.getIsActive()) {
                LOGGER.warn("❌ User account is inactive: {}", request.getUsername());
                return new ResponseEntity<>(
                        ApiResponse.error("Account is inactive"),
                        HttpStatus.UNAUTHORIZED
                );
            }

            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                LOGGER.warn("❌ Invalid password for user: {}", request.getUsername());
                return new ResponseEntity<>(
                        ApiResponse.error("Invalid username or password"),
                        HttpStatus.UNAUTHORIZED
                );
            }

            String token = generateJWT(user);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful!");
            response.put("token", token);
            response.put("user", user);

            LOGGER.info("✅ User logged in successfully: {}", user.getUsername());
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            LOGGER.error("❌ Login error: ", e);
            return new ResponseEntity<>(
                    ApiResponse.error("An error occurred during login"),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // ==================== REGISTER ENDPOINT ====================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        LOGGER.info("Register attempt for username: {}", request.getUsername());

        try {
            // Validation
            if (userRepository.existsByUsername(request.getUsername())) {
                LOGGER.warn("❌ Username already exists: {}", request.getUsername());
                return new ResponseEntity<>(
                        ApiResponse.error("Username already exists"),
                        HttpStatus.BAD_REQUEST
                );
            }

            if (userRepository.existsByEmail(request.getEmail())) {
                LOGGER.warn("❌ Email already exists: {}", request.getEmail());
                return new ResponseEntity<>(
                        ApiResponse.error("Email already registered"),
                        HttpStatus.BAD_REQUEST
                );
            }

            if (request.getPassword().length() < 6) {
                LOGGER.warn("❌ Password too short for user: {}", request.getUsername());
                return new ResponseEntity<>(
                        ApiResponse.error("Password must be at least 6 characters"),
                        HttpStatus.BAD_REQUEST
                );
            }

            // Create new user
            User newUser = new User();
            newUser.setUsername(request.getUsername());
            newUser.setPassword(passwordEncoder.encode(request.getPassword()));
            newUser.setEmail(request.getEmail());
            newUser.setFirstName(request.getFirstName());
            newUser.setLastName(request.getLastName());
            newUser.setMobileNumber(request.getMobileNumber());
            newUser.setRole(User.UserRole.USER);
            newUser.setIsActive(true);

            User savedUser = userRepository.save(newUser);

            String token = generateJWT(savedUser);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful!");
            response.put("token", token);
            response.put("user", savedUser);

            LOGGER.info("✅ User registered successfully: {}", savedUser.getUsername());
            return new ResponseEntity<>(ApiResponse.success(response), HttpStatus.CREATED);

        } catch (Exception e) {
            LOGGER.error("❌ Registration error: ", e);
            return new ResponseEntity<>(
                    ApiResponse.error("An error occurred during registration"),
                    HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // ==================== VERIFY TOKEN ENDPOINT ====================
    @GetMapping("/verify")
    public ResponseEntity<?> verifyToken(@RequestHeader("Authorization") String token) {
        LOGGER.info("Verifying token");

        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return new ResponseEntity<>(
                        ApiResponse.error("Invalid token format"),
                        HttpStatus.UNAUTHORIZED
                );
            }

            String jwtToken = token.substring(7);
            // In production, validate JWT signature and expiry
            return ResponseEntity.ok(ApiResponse.success(Map.of("valid", true)));

        } catch (Exception e) {
            LOGGER.error("❌ Token verification error: ", e);
            return new ResponseEntity<>(
                    ApiResponse.error("Invalid token"),
                    HttpStatus.UNAUTHORIZED
            );
        }
    }

    // ==================== HELPER METHODS ====================
    private String generateJWT(User user) {
        // Simplified JWT - In production, use proper JWT library (jjwt)
        return "jwt_" + user.getId() + "_" + System.currentTimeMillis();
    }
}