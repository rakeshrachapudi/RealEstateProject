package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.model.User;
import com.example.realestate.repository.UserRepository;
import com.example.realestate.service.DealService;
import com.example.realestate.service.PropertyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
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

    @Autowired
    private DealService dealService;

    @Autowired
    private PropertyService propertyService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ==================== ⭐ CREATE USER (NEW) ====================
    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        logger.info("Creating new user - Email: {}, Role: {}", request.getEmail(), request.getRole());

        try {
            if (request.getEmail() == null || request.getEmail().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email is required"));
            }

            if (request.getMobileNumber() == null || request.getMobileNumber().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Mobile number is required"));
            }

            if (userRepository.existsByEmail(request.getEmail())) {
                logger.warn("User creation failed - Email already exists: {}", request.getEmail());
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email already registered"));
            }

            Optional<User> existingByPhone = userRepository.findByMobileNumber(request.getMobileNumber());
            if (existingByPhone.isPresent()) {
                logger.warn("User creation failed - Mobile number already exists: {}", request.getMobileNumber());
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Mobile number already registered"));
            }

            User newUser = new User();
            newUser.setUsername(request.getEmail());
            newUser.setEmail(request.getEmail());
            newUser.setFirstName(request.getFirstName());
            newUser.setLastName(request.getLastName());
            newUser.setMobileNumber(request.getMobileNumber());
            newUser.setAddress(request.getAddress());

            String defaultPassword = "Welcome@123";
            newUser.setPassword(passwordEncoder.encode(defaultPassword)); // ⭐ FIXED: setPassword instead of setPasswordHash

            if (request.getRole() != null) {
                try {
                    newUser.setRole(User.UserRole.valueOf(request.getRole().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid role provided: {}. Defaulting to USER", request.getRole());
                    newUser.setRole(User.UserRole.USER);
                }
            } else {
                newUser.setRole(User.UserRole.USER);
            }

            newUser.setIsActive(true);

            User savedUser = userRepository.save(newUser);
            logger.info("✅ User created successfully - ID: {}, Email: {}", savedUser.getId(), savedUser.getEmail());

            UserResponse response = new UserResponse(savedUser, defaultPassword);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(response));

        } catch (Exception e) {
            logger.error("Error creating user: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error creating user: " + e.getMessage()));
        }
    }

    // ==================== GET ALL USERS ====================
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

    // ==================== GET ALL AGENTS ====================
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

    // ==================== UPDATE USER ====================
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

    // ==================== ⭐ DELETE USER WITH CASCADE (ENHANCED) ====================
    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        logger.info("🗑️ DELETE USER REQUEST - User ID: {}", userId);

        try {
            Optional<User> userOptional = userRepository.findById(userId);

            if (userOptional.isEmpty()) {
                logger.warn("User not found with ID: {}", userId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("User not found"));
            }

            User user = userOptional.get();
            String userRole = user.getRole().toString();

            logger.info("Deleting user: {} {} (Role: {}, Email: {})",
                    user.getFirstName(), user.getLastName(), userRole, user.getEmail());

            // ⭐ CASCADE DELETE LOGIC

            if (user.getRole() == User.UserRole.AGENT) {
                logger.info("👤 User is an AGENT. Initiating cascade delete for deals...");
                dealService.deleteAllDealsForAgent(userId);
            }

            logger.info("👤 Deleting all deals for user (as buyer/seller)...");
            dealService.deleteAllDealsForUser(userId);

            logger.info("🏠 Soft-deleting all properties owned by user...");
            propertyService.softDeleteAllPropertiesForUser(userId);

            userRepository.deleteById(userId);
            logger.info("✅ User with ID: {} deleted successfully", userId);

            return ResponseEntity.ok(ApiResponse.success("User and all related data deleted successfully"));

        } catch (Exception e) {
            logger.error("Error deleting user: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting user: " + e.getMessage()));
        }
    }

    // ==================== ⭐ DELETE AGENT WITH CASCADE (NEW) ====================
    @DeleteMapping("/agent/{agentId}")
    public ResponseEntity<?> deleteAgent(@PathVariable Long agentId) {
        logger.info("🗑️ DELETE AGENT REQUEST - Agent ID: {}", agentId);

        try {
            Optional<User> agentOptional = userRepository.findById(agentId);

            if (agentOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Agent not found"));
            }

            User agent = agentOptional.get();

            if (agent.getRole() != User.UserRole.AGENT) {
                logger.warn("User {} is not an agent. Role: {}", agentId, agent.getRole());
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User is not an agent"));
            }

            logger.info("Deleting agent: {} {} (Email: {})",
                    agent.getFirstName(), agent.getLastName(), agent.getEmail());

            dealService.deleteAllDealsForAgent(agentId);
            propertyService.softDeleteAllPropertiesForUser(agentId);
            userRepository.deleteById(agentId);

            logger.info("✅ Agent deleted successfully");

            return ResponseEntity.ok(ApiResponse.success("Agent and all assigned deals deleted successfully"));

        } catch (Exception e) {
            logger.error("Error deleting agent: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error deleting agent: " + e.getMessage()));
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

    // ==================== INNER CLASSES ====================

    public static class CreateUserRequest {
        private String email;
        private String firstName;
        private String lastName;
        private String mobileNumber;
        private String address;
        private String role;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getMobileNumber() { return mobileNumber; }
        public void setMobileNumber(String mobileNumber) { this.mobileNumber = mobileNumber; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class UserResponse {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String mobileNumber;
        private String role;
        private String temporaryPassword;

        public UserResponse(User user, String temporaryPassword) {
            this.id = user.getId();
            this.email = user.getEmail();
            this.firstName = user.getFirstName();
            this.lastName = user.getLastName();
            this.mobileNumber = user.getMobileNumber();
            this.role = user.getRole().toString();
            this.temporaryPassword = temporaryPassword;
        }

        public Long getId() { return id; }
        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getMobileNumber() { return mobileNumber; }
        public String getRole() { return role; }
        public String getTemporaryPassword() { return temporaryPassword; }
    }
}