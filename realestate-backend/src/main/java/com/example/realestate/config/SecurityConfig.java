package com.example.realestate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // ==================== PUBLIC ENDPOINTS ====================
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/properties/**").permitAll()
                        .requestMatchers("/api/areas/**").permitAll()
                        .requestMatchers("/api/users/**").permitAll()
                        .requestMatchers("/api/deals/**").permitAll()
                        .requestMatchers("/api/property-types/**").permitAll()

                        // ==================== ADMIN ONLY ENDPOINTS ====================
                        // ⭐ CRITICAL: Use hasAuthority() NOT hasRole()
                        // hasRole() adds "ROLE_" prefix, but our DB stores just "ADMIN"
                        .requestMatchers("/api/deals/admin/**").hasAuthority("ADMIN")
                        .requestMatchers("/api/deals/stage/**").hasAuthority("ADMIN")

                        // ==================== AGENT ENDPOINTS ====================
                        .requestMatchers("/api/agents/**").authenticated()

                        // ==================== AUTHENTICATED DEAL ENDPOINTS ====================
                        // All other /api/deals/** endpoints require authentication
                        .requestMatchers("/api/deals/**").authenticated()

                        // ==================== DEFAULT: Everything else requires authentication ====================
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }
}