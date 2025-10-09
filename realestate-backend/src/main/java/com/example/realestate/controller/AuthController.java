package com.example.realestate.controller;

import com.example.realestate.model.User;
import com.example.realestate.repository.UserRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // 1. Initialize the logger for this class
    private static final Logger LOGGER = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${twilio.account_sid}")
    private String accountSid;
    @Value("${twilio.auth_token}")
    private String authToken;
    @Value("${twilio.phone_number}")
    private String twilioPhoneNumber;

    @PostConstruct
    public void initTwilio() {
        Twilio.init(accountSid, authToken);
    }

    // --- DTOs ---
    static class RegistrationRequest {
        public String mobileNumber;
        public String otp;
        public String firstName;
        public String lastName;
        public String email;
        public String username;
        public String password;
    }

    static class VerifyOtpRequest {
        public String mobileNumber;
        public String otp;
        public String firstName;
        public String lastName;
        public String email;
    }

    static class PasswordLoginRequest {
        public String username;
        public String password;
    }

    // --- Endpoints ---

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> payload) {
        String mobileNumber = payload.get("mobileNumber");
        LOGGER.info("Received OTP request for mobile number: {}", mobileNumber);

        String otp = new Random().ints(100000, 1000000).findFirst().getAsInt() + "";

        Optional<User> userOptional = userRepository.findByMobileNumber(mobileNumber);
        boolean isNewUser = userOptional.isEmpty() || userOptional.get().getFirstName() == null;
        LOGGER.info("User status: {}", isNewUser ? "New user" : "Existing user");

        User user = userOptional.orElseGet(() -> {
            User newUser = new User();
            newUser.setMobileNumber(mobileNumber);
            return newUser;
        });

        user.setOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        try {
            Message.creator(
                    new PhoneNumber(mobileNumber),
                    new PhoneNumber(twilioPhoneNumber),
                    "Your Visionary Homes OTP is: " + otp
            ).create();
            LOGGER.info("OTP sent successfully via Twilio to {}", mobileNumber);
        } catch (Exception e) {
            // 2. Use LOGGER.error for exceptions
            LOGGER.error("Could not send SMS via Twilio. Error: {}", e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "OTP sent successfully.", "isNewUser", isNewUser));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        LOGGER.info("Received OTP verification request for mobile number: {}", request.mobileNumber);
        User user = userRepository.findByMobileNumber(request.mobileNumber).orElse(null);

        if (user == null || user.getOtp() == null || !user.getOtp().equals(request.otp) || user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            LOGGER.warn("Failed OTP verification for {}: Invalid or expired OTP.", request.mobileNumber);
            return new ResponseEntity<>(Map.of("message", "Invalid or expired OTP."), HttpStatus.BAD_REQUEST);
        }

        if (user.getFirstName() == null && request.firstName != null) {
            user.setFirstName(request.firstName);
            user.setLastName(request.lastName);
            user.setEmail(request.email);
        }

        user.setOtp(null);
        user.setOtpExpiryTime(null);
        User savedUser = userRepository.save(user);

        String token = "dummy-jwt-for-" + user.getMobileNumber();
        LOGGER.info("OTP verification successful for {}", request.mobileNumber);
        return ResponseEntity.ok(Map.of("message", "Login successful!", "token", token, "user", savedUser));
    }

    @PostMapping("/register-with-otp")
    public ResponseEntity<?> registerWithOtp(@RequestBody RegistrationRequest request) {
        LOGGER.info("Received registration request for username: {}", request.username);
        User user = userRepository.findByMobileNumber(request.mobileNumber).orElse(null);

        if (user == null || user.getOtp() == null || !user.getOtp().equals(request.otp) || user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            LOGGER.warn("Registration failed for {}: Invalid or expired OTP.", request.username);
            return new ResponseEntity<>(Map.of("message", "Invalid or expired OTP."), HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByUsername(request.username)) {
            LOGGER.warn("Registration failed for {}: Username already taken.", request.username);
            return new ResponseEntity<>(Map.of("message", "Username is already taken."), HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByEmail(request.email)) {
            LOGGER.warn("Registration failed for {}: Email already registered.", request.username);
            return new ResponseEntity<>(Map.of("message", "Email is already registered."), HttpStatus.BAD_REQUEST);
        }

        user.setFirstName(request.firstName);
        user.setLastName(request.lastName);
        user.setUsername(request.username);
        user.setEmail(request.email);
        user.setPassword(passwordEncoder.encode(request.password));

        user.setOtp(null);
        user.setOtpExpiryTime(null);
        User savedUser = userRepository.save(user);

        String token = "dummy-jwt-for-signup-" + user.getMobileNumber();
        LOGGER.info("User '{}' registered successfully.", savedUser.getUsername());
        return ResponseEntity.ok(Map.of("message", "Registration successful!", "token", token, "user", savedUser));
    }

    @PostMapping("/login-with-password")
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