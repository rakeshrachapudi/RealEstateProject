package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.model.User;
import com.example.realestate.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ==================== SEARCH USER ====================
    @GetMapping("/search")
    public ResponseEntity<?> searchUser(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String phone) {

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

        return ResponseEntity.badRequest()
                .body(ApiResponse.error("User not found"));
    }

    // ==================== GET ALL USERS (ADMIN ONLY) ====================
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ApiResponse.error("Failed to fetch users"));
        }
    }
}
