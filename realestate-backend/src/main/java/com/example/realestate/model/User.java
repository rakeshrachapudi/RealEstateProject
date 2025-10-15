package com.example.realestate.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Represents a User in the application, storing authentication and profile details.
 * Contains all necessary fields used by the AuthController for registration and OTP flow.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Authentication & Identity Fields ---
    private String mobileNumber;
    private String username; // Used for permanent login via signup
    private String password; // Stored hashed in a real application
    private String email;

    // --- Profile Fields ---
    private String firstName;
    private String lastName;

    // --- OTP Fields ---
    private String otp;
    private LocalDateTime otpExpiryTime;

    // --- Constructors ---
    public User() {
    }

    // --- Getters and Setters (CRITICAL for compilation) ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    // FIX: Missing setUsername method that caused the "cannot find symbol" error
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
    // END FIX

    // FIX: setPassword is also mandatory for the /register-with-otp flow
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
    // END FIX

    // FIX: setFirstName and setLastName are used in both signup and quick register
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    // END FIX

    // FIX: setEmail is mandatory for the /register-with-otp flow
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
    // END FIX

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public LocalDateTime getOtpExpiryTime() {
        return otpExpiryTime;
    }

    public void setOtpExpiryTime(LocalDateTime otpExpiryTime) {
        this.otpExpiryTime = otpExpiryTime;
    }
}
