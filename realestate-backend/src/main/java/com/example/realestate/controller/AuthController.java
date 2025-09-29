package com.example.realestate.controller;

import com.example.realestate.model.User;
import com.example.realestate.repository.UserRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

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

    @PostMapping("/request-otp")
    public ResponseEntity<?> requestOtp(@RequestBody Map<String, String> payload) {
        String mobileNumber = payload.get("mobileNumber");
        String otp = new Random().ints(100000, 1000000).findFirst().getAsInt() + "";

        Optional<User> userOptional = userRepository.findByMobileNumber(mobileNumber);
        boolean isNewUser = userOptional.isEmpty() || userOptional.get().getFirstName() == null;

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
        } catch (Exception e) {
            System.err.println("Could not send SMS. Error: " + e.getMessage());
        }

        System.out.println("OTP for " + mobileNumber + " is: " + otp);

        // Instead of returning a plain string, we return a Map, which Spring Boot
        // automatically converts into a JSON object like {"message": "...", "isNewUser": ...}
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully.", "isNewUser", isNewUser));
    }

    static class VerifyOtpRequest {
        public String mobileNumber;
        public String otp;
        public String firstName;
        public String lastName;
        public String email;
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        User user = userRepository.findByMobileNumber(request.mobileNumber).orElse(null);

        if (user == null || user.getOtp() == null || !user.getOtp().equals(request.otp) || user.getOtpExpiryTime().isBefore(LocalDateTime.now())) {
            return new ResponseEntity<>("Invalid or expired OTP.", HttpStatus.BAD_REQUEST);
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
        return ResponseEntity.ok(Map.of("message", "Login successful!", "token", token, "user", savedUser));
    }
}

