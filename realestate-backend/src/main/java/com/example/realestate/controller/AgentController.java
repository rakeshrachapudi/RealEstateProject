package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.dto.PropertyDTO;
import com.example.realestate.model.User;
import com.example.realestate.repository.UserRepository;
import com.example.realestate.service.AgentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/agents")
public class AgentController {

    private static final Logger logger = LoggerFactory.getLogger(AgentController.class);

    @Autowired
    private AgentService agentService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/{agentId}/dashboard")
    public ResponseEntity<?> getAgentDashboard(@PathVariable Long agentId, Authentication authentication) {
        logger.info("📊 Fetching dashboard for agent: {}", agentId);
        try {
            User agent = userRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent not found"));

            if (!agent.getRole().equals(User.UserRole.AGENT) && !agent.getRole().equals(User.UserRole.ADMIN)) {
                return new ResponseEntity<>(
                        ApiResponse.error("User is not an agent"),
                        HttpStatus.FORBIDDEN
                );
            }

            Map<String, Object> dashboard = agentService.getAgentDashboard(agentId);
            return ResponseEntity.ok(ApiResponse.success(dashboard));

        } catch (Exception e) {
            logger.error("❌ Error fetching agent dashboard: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{agentId}/all-properties")
    public ResponseEntity<?> getAllPropertiesForAgent(
            @PathVariable Long agentId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size
    ) {
        logger.info("🏠 Fetching all properties for agent: {}", agentId);
        try {
            User agent = userRepository.findById(agentId)
                    .orElseThrow(() -> new RuntimeException("Agent not found"));

            if (!agent.getRole().equals(User.UserRole.AGENT) && !agent.getRole().equals(User.UserRole.ADMIN)) {
                return new ResponseEntity<>(
                        ApiResponse.error("Unauthorized: User is not an agent"),
                        HttpStatus.FORBIDDEN
                );
            }

            List<PropertyDTO> properties = agentService.getAllPropertiesForAgent(page, size);
            return ResponseEntity.ok(ApiResponse.success(properties));

        } catch (Exception e) {
            logger.error("❌ Error fetching properties for agent: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{agentId}/stats")
    public ResponseEntity<?> getAgentStats(@PathVariable Long agentId) {
        logger.info("📈 Fetching stats for agent: {}", agentId);
        try {
            Map<String, Object> stats = agentService.getAgentStats(agentId);
            return ResponseEntity.ok(ApiResponse.success(stats));

        } catch (Exception e) {
            logger.error("❌ Error fetching agent stats: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}