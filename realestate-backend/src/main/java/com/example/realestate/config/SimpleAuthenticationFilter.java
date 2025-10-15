package com.example.realestate.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Simple authentication filter for development that accepts dummy JWT tokens.
 * In production, replace this with proper JWT validation.
 */
@Component
public class SimpleAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(SimpleAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            logger.debug("Processing token: {}", token);

            // For development: Accept any token that starts with "dummy-jwt-"
            if (token.startsWith("dummy-jwt-")) {
                try {
                    // Extract username from token
                    // Format: "dummy-jwt-for-signup-username" or "dummy-jwt-for-password-login-username"
                    String username = extractUsernameFromToken(token);

                    logger.info("Authenticated user: {} from token", username);

                    // Create authentication with USER role
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    username,
                                    null,
                                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                            );

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } catch (Exception e) {
                    logger.error("Error processing authentication token", e);
                }
            } else {
                logger.warn("Invalid token format: {}", token);
            }
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Extract username from dummy JWT token
     * Format: "dummy-jwt-for-signup-username" or "dummy-jwt-for-password-login-username"
     */
    private String extractUsernameFromToken(String token) {
        // Split by '-' and get the last part
        String[] parts = token.split("-");
        if (parts.length > 0) {
            return parts[parts.length - 1];
        }
        return "anonymous";
    }
}