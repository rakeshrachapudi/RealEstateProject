package com.example.realestate.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try { // Add try-catch for safety
                if (jwtUtil.isTokenValid(token)) {
                    String username = jwtUtil.getUsername(token);
                    List<SimpleGrantedAuthority> authorities = jwtUtil.getRoles(token).stream()
                            .map(role -> new SimpleGrantedAuthority("ROLE_" + role)) // Spring Security expects ROLE_
                            .collect(Collectors.toList());

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(username, null, authorities);

                    // ⭐⭐⭐ ADD THIS DEBUG LINE 👇 ⭐⭐⭐
                    System.out.println("✅✅✅ [JwtFilter] Setting Authentication for user '" + username + "' with roles: " + authorities);

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                } else {
                    System.out.println("⚠️⚠️⚠️ [JwtFilter] Token INVALID for header: " + authHeader);
                }
            } catch (Exception e) {
                System.err.println("🔥🔥🔥 [JwtFilter] Error processing JWT token: " + e.getMessage());
            }
        } else {
            // Optional: Log if header is missing
            // System.out.println("ℹ️ℹ️ℹ️ [JwtFilter] No Bearer token found.");
        }

        filterChain.doFilter(request, response); // Always continue the chain
    }
}