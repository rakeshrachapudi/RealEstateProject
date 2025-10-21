package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.model.User;
import com.example.realestate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserRepository userRepository;

    // ==================== GET ALL USERS (ADMIN) ====================
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        logger.info("Fetching all users");
        try {
            List<User> users = userRepository.findAll();
            logger.info("Retrieved {} users", users.size());
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            logger.error("Error fetching users: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching users"));
        }
    }

    // ==================== GET ALL AGENTS (ADMIN) ====================
    @GetMapping("/agents")
    public ResponseEntity<?> getAllAgents() {
        logger.info("Fetching all agents");
        try {
            List<User> agents = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == User.UserRole.AGENT)
                    .collect(Collectors.toList());
            logger.info("Retrieved {} agents", agents.size());
            return ResponseEntity.ok(ApiResponse.success(agents));
        } catch (Exception e) {
            logger.error("Error fetching agents: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching agents"));
        }
    }

    // ==================== GET USER BY ID ====================
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        logger.info("Fetching user with ID: {}", userId);
        try {
            Optional<User> user = userRepository.findById(userId);
            if (user.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(user.get()));
            } else {
                logger.warn("User not found with ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }
        } catch (Exception e) {
            logger.error("Error fetching user: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching user"));
        }
    }

    // ==================== SEARCH USERS ====================
    @GetMapping("/search")
    public ResponseEntity<?> searchUser(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {

        logger.info("Searching user by email: {} or phone: {}", email, phone);

        if (email != null && !email.isEmpty()) {
            Optional<User> user = userRepository.findByEmail(email);
            if (user.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(user.get()));
            }
        }

        if (phone != null && !phone.isEmpty()) {
            Optional<User> user = userRepository.findByMobileNumber(phone);
            if (user.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(user.get()));
            }
        }

        logger.warn("User not found with email: {} or phone: {}", email, phone);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("User not found"));
    }

    // ==================== UPDATE USER (ADMIN) ====================
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody User userDetails) {

        logger.info("Updating user with ID: {}", userId);

        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isEmpty()) {
                logger.warn("User not found with ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            User user = userOptional.get();

            // Update fields if provided
            if (userDetails.getFirstName() != null && !userDetails.getFirstName().isEmpty()) {
                user.setFirstName(userDetails.getFirstName());
            }
            if (userDetails.getLastName() != null && !userDetails.getLastName().isEmpty()) {
                user.setLastName(userDetails.getLastName());
            }
            if (userDetails.getEmail() != null && !userDetails.getEmail().isEmpty()) {
                user.setEmail(userDetails.getEmail());
            }
            if (userDetails.getMobileNumber() != null && !userDetails.getMobileNumber().isEmpty()) {
                user.setMobileNumber(userDetails.getMobileNumber());
            }
            if (userDetails.getRole() != null) {
                user.setRole(userDetails.getRole());
            }
            if (userDetails.getAddress() != null && !userDetails.getAddress().isEmpty()) {
                user.setAddress(userDetails.getAddress());
            }
            if (userDetails.getIsActive() != null) {
                user.setIsActive(userDetails.getIsActive());
            }

            User updatedUser = userRepository.save(user);
            logger.info("User with ID: {} updated successfully", userId);

            return ResponseEntity.ok(ApiResponse.success(updatedUser));

        } catch (Exception e) {
            logger.error("Error updating user: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error updating user: " + e.getMessage()));
        }
    }

    // ==================== DELETE USER (ADMIN) ====================
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        logger.info("Deleting user with ID: {}", userId);

        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isEmpty()) {
                logger.warn("User not found with ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            userRepository.deleteById(userId);
            logger.info("User with ID: {} deleted successfully", userId);

            return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));

        } catch (Exception e) {
            logger.error("Error deleting user: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting user: " + e.getMessage()));
        }
    }

    // ==================== GET USERS BY ROLE ====================
    @GetMapping("/role/{role}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String role) {
        logger.info("Fetching users with role: {}", role);

        try {
            User.UserRole userRole;
            try {
                userRole = User.UserRole.valueOf(role.toUpperCase());
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid role: {}", role);
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Invalid role: " + role));
            }

            List<User> users = userRepository.findAll().stream()
                    .filter(user -> user.getRole() == userRole)
                    .collect(Collectors.toList());

            logger.info("Retrieved {} users with role: {}", users.size(), role);
            return ResponseEntity.ok(ApiResponse.success(users));

        } catch (Exception e) {
            logger.error("Error fetching users by role: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching users"));
        }
    }

    // ==================== DEACTIVATE USER ====================
    @PutMapping("/{userId}/deactivate")
    public ResponseEntity<?> deactivateUser(@PathVariable Long userId) {
        logger.info("Deactivating user with ID: {}", userId);

        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isEmpty()) {
                logger.warn("User not found with ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            User user = userOptional.get();
            user.setIsActive(false);
            User updatedUser = userRepository.save(user);

            logger.info("User with ID: {} deactivated successfully", userId);
            return ResponseEntity.ok(ApiResponse.success(updatedUser));

        } catch (Exception e) {
            logger.error("Error deactivating user: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deactivating user"));
        }
    }

    // ==================== ACTIVATE USER ====================
    @PutMapping("/{userId}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long userId) {
        logger.info("Activating user with ID: {}", userId);

        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isEmpty()) {
                logger.warn("User not found with ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            User user = userOptional.get();
            user.setIsActive(true);
            User updatedUser = userRepository.save(user);

            logger.info("User with ID: {} activated successfully", userId);
            return ResponseEntity.ok(ApiResponse.success(updatedUser));

        } catch (Exception e) {
            logger.error("Error activating user: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error activating user"));
        }
    }
}