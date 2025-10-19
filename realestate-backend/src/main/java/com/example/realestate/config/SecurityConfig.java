package com.example.realestate.config;

import com.example.realestate.security.JwtFilter; // ⭐ 1. Import JwtFilter
import org.springframework.beans.factory.annotation.Autowired; // ⭐ Import Autowired
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; // ⭐ Import this filter class

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // ⭐ 2. Add field for the filter
    private final JwtFilter jwtFilter;

    // ⭐ 3. Add constructor injection
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
                        .requestMatchers(HttpMethod.GET, "/api/properties/**").permitAll()
                        .requestMatchers("/api/areas/**").permitAll()
                        .requestMatchers("/api/property-types/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/**").permitAll()

                        // ==================== ADMIN ONLY ====================
                        .requestMatchers("/api/deals/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/deals/stage/**").hasRole("ADMIN")

                        // ==================== AGENT & ADMIN ====================
                        .requestMatchers("/api/agents/**").hasAnyRole("AGENT", "ADMIN")
                        .requestMatchers("/api/deals/agent/**").hasAnyRole("AGENT", "ADMIN")
                        .requestMatchers("/api/price-requests/**").hasAnyRole("AGENT", "ADMIN")

                        // ==================== ANY LOGGED-IN USER (Authenticated) ====================
                        .requestMatchers(HttpMethod.POST, "/api/properties/interested-price").authenticated()
                        .requestMatchers("/api/deals/property/**").authenticated()
                        .requestMatchers("/api/deals/my-deals/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/properties/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/users/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").authenticated()

                        // ==================== DEFAULT ====================
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // ⭐ 4. Add the filter to the chain
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}