package com.example.realestate.config;

import com.example.realestate.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Autowired
    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

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
                        // Public GET requests to view properties
                        .requestMatchers(HttpMethod.GET, "/api/properties/**").permitAll()
                        .requestMatchers("/api/areas/**").permitAll()
                        .requestMatchers("/api/property-types/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll()

                        // ==================== ADMIN ONLY ====================
                        .requestMatchers("/api/deals/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/deals/stage/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/all").hasRole("ADMIN") // ⭐ NEW: For UserManagementTab

                        // ==================== AGENT & ADMIN ====================
                        .requestMatchers("/api/agents/**").hasAnyRole("AGENT", "ADMIN")
                        .requestMatchers("/api/deals/agent/**").hasAnyRole("AGENT", "ADMIN")
                        .requestMatchers("/api/price-requests/**").hasAnyRole("AGENT", "ADMIN")

                        // ==================== SELLER & ADMIN (Property Management) ====================
                        // Seller POSTs a new property
                        .requestMatchers(HttpMethod.POST, "/api/properties").hasAnyRole("SELLER", "ADMIN","USER")
                        // Seller UPDATES or DELETES their own property (assuming PUT/DELETE targets /api/properties/{id})
                        .requestMatchers(HttpMethod.PUT, "/api/properties/**").hasAnyRole("SELLER", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/properties/**").hasAnyRole("SELLER", "ADMIN")

                        // ==================== ANY LOGGED-IN USER (Authenticated) ====================
                        .requestMatchers(HttpMethod.POST, "/api/properties/interested-price").authenticated()
                        .requestMatchers("/api/deals/property/**").authenticated()
                        .requestMatchers("/api/deals/my-deals/**").authenticated()

                        // User updates their own profile
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").authenticated()

                        // ==================== DEFAULT ====================
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Add the filter to the chain
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
