package com.example.realestate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // CORS is handled by nginx - no need for Spring CORS configuration

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // CORS disabled - handled by nginx
                .cors(cors -> cors.disable())

                // CSRF disabled for stateless REST API
                .csrf(csrf -> csrf.disable())

                .authorizeHttpRequests(authz -> authz
                        // Allow all OPTIONS requests (preflight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/properties/**").permitAll()
                        .requestMatchers("/api/areas/**").permitAll()
                        .requestMatchers("/api/users/**").permitAll()
                        .requestMatchers("/api/upload/image/**").permitAll()
                        .requestMatchers("/api/property-types/**").permitAll()

                        // ⚠️ IMPORTANT: Specific rules MUST come BEFORE general rules
                        // Admin-only deal endpoints
                        .requestMatchers("/api/deals/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/deals/stage/**").hasAuthority("ADMIN")

                        // General deals endpoints (must come AFTER specific admin rules)
                        .requestMatchers("/api/deals/**").permitAll()

                        // Agent endpoints require authentication
                        .requestMatchers("/api/agents/**").authenticated()

                        // All other requests require authentication
                        .anyRequest().authenticated()
                )

                // Stateless session management for REST API
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}