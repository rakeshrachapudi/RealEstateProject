package com.example.realestate.controller;

import com.example.realestate.model.DealStatus;
import com.example.realestate.model.User;
import com.example.realestate.service.DealService;
import com.example.realestate.dto.ApiResponse;
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
@RequestMapping("/api/deals")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DealController {

    private static final Logger logger = LoggerFactory.getLogger(DealController.class);

    @Autowired
    private DealService dealService;

    // ==================== DTOs ====================
    static class CreateDealRequest {
        public Long propertyId;
        public Long buyerId;
        public Long agentId;

        public Long getPropertyId() { return propertyId; }
        public Long getBuyerId() { return buyerId; }
        public Long getAgentId() { return agentId; }
    }

    static class UpdateDealStageRequest {
        public DealStatus.DealStage stage;
        public String notes;

        public DealStatus.DealStage getStage() { return stage; }
        public String getNotes() { return notes; }
    }

    static class AssignAgentRequest {
        public Long agentId;

        public Long getAgentId() { return agentId; }
    }

    // ==================== CREATE DEAL ====================
    @PostMapping("/create")
    public ResponseEntity<?> createDeal(@RequestBody CreateDealRequest request) {
        logger.info("📝 Creating new deal - Request: propertyId={}, buyerId={}, agentId={}",
                request.propertyId, request.buyerId, request.agentId);

        try {
            if (request.propertyId == null || request.buyerId == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Property ID and Buyer ID are required"));
            }

            DealStatus deal = dealService.createDeal(
                    request.propertyId,
                    request.buyerId,
                    request.agentId
            );

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(deal));

        } catch (Exception e) {
            logger.error("❌ Error creating deal: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET DEAL BY ID ====================
    @GetMapping("/{dealId}")
    public ResponseEntity<?> getDeal(@PathVariable Long dealId) {
        logger.info("🔍 Fetching deal: {}", dealId);

        try {
            DealStatus deal = dealService.getDealById(dealId);
            return ResponseEntity.ok(ApiResponse.success(deal));

        } catch (Exception e) {
            logger.error("❌ Error fetching deal: ", e);
            return ResponseEntity.notFound().build();
        }
    }

    // ==================== UPDATE DEAL STAGE ====================
    @PutMapping("/{dealId}/stage")
    public ResponseEntity<?> updateDealStage(
            @PathVariable Long dealId,
            @RequestBody UpdateDealStageRequest request,
            Authentication authentication) {

        logger.info("📊 Updating deal stage - DealId: {}, NewStage: {}, User: {}",
                dealId, request.stage, authentication.getName());

        try {
            String username = authentication.getName();

            DealStatus deal = dealService.updateDealStage(
                    dealId,
                    request.stage,
                    request.notes,
                    username
            );

            return ResponseEntity.ok(ApiResponse.success(deal));

        } catch (Exception e) {
            logger.error("❌ Error updating deal stage: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== ASSIGN AGENT ====================
    @PostMapping("/{dealId}/assign-agent")
    public ResponseEntity<?> assignAgent(
            @PathVariable Long dealId,
            @RequestBody AssignAgentRequest request,
            Authentication authentication) {

        logger.info("👤 Assigning agent to deal - DealId: {}, AgentId: {}, AssignedBy: {}",
                dealId, request.agentId, authentication.getName());

        try {
            String username = authentication.getName();

            DealStatus deal = dealService.assignAgentToDeal(
                    dealId,
                    request.agentId,
                    username
            );

            return ResponseEntity.ok(ApiResponse.success(deal));

        } catch (Exception e) {
            logger.error("❌ Error assigning agent: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET DEALS BY PROPERTY ====================
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> getPropertyDeals(@PathVariable Long propertyId) {
        logger.info("🏠 Fetching deals for property: {}", propertyId);

        try {
            List<DealStatus> deals = dealService.getDealsForProperty(propertyId);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching property deals: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET DEALS BY AGENT ====================
    @GetMapping("/agent/{agentId}")
    public ResponseEntity<?> getAgentDeals(@PathVariable Long agentId) {
        logger.info("👤 Fetching all deals for agent: {}", agentId);

        try {
            List<DealStatus> deals = dealService.getDealsForAgent(agentId);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching agent deals: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET ACTIVE DEALS BY AGENT ====================
    @GetMapping("/agent/{agentId}/active")
    public ResponseEntity<?> getActiveAgentDeals(@PathVariable Long agentId) {
        logger.info("⚡ Fetching active deals for agent: {}", agentId);

        try {
            List<DealStatus> deals = dealService.getActiveDealsForAgent(agentId);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching active agent deals: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET DEALS BY BUYER ====================
    @GetMapping("/buyer/{buyerId}")
    public ResponseEntity<?> getBuyerDeals(@PathVariable Long buyerId) {
        logger.info("👥 Fetching deals for buyer: {}", buyerId);

        try {
            List<DealStatus> deals = dealService.getBuyerDeals(buyerId);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching buyer deals: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET ACTIVE DEALS BY BUYER ====================
    @GetMapping("/buyer/{buyerId}/active")
    public ResponseEntity<?> getActiveBuyerDeals(@PathVariable Long buyerId) {
        logger.info("⚡ Fetching active deals for buyer: {}", buyerId);

        try {
            List<DealStatus> deals = dealService.getActiveDealForBuyer(buyerId);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (Exception e) {
            logger.error("❌ Error fetching active buyer deals: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET DEALS BY STAGE ====================
    @GetMapping("/stage/{stage}")
    public ResponseEntity<?> getDealsByStage(@PathVariable String stage) {
        logger.info("📊 Fetching deals at stage: {}", stage);

        try {
            DealStatus.DealStage dealStage = DealStatus.DealStage.valueOf(stage.toUpperCase());
            List<DealStatus> deals = dealService.getDealsByStage(dealStage);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (IllegalArgumentException e) {
            logger.error("❌ Invalid stage: {}", stage);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid stage: " + stage));

        } catch (Exception e) {
            logger.error("❌ Error fetching deals by stage: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET STATISTICS ====================
    @GetMapping("/stats/by-stage")
    public ResponseEntity<?> getStageStats() {
        logger.info("📈 Fetching stage statistics");

        try {
            Map<String, Long> stats = new HashMap<>();
            for (DealStatus.DealStage stage : DealStatus.DealStage.values()) {
                stats.put(stage.name(), dealService.getCountByStage(stage));
            }

            return ResponseEntity.ok(ApiResponse.success(stats));

        } catch (Exception e) {
            logger.error("❌ Error fetching stage stats: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    // ==================== GET AGENT DEALS AT STAGE ====================
    @GetMapping("/agent/{agentId}/stage/{stage}")
    public ResponseEntity<?> getAgentDealsAtStage(
            @PathVariable Long agentId,
            @PathVariable String stage) {

        logger.info("📊 Fetching deals for agent {} at stage {}", agentId, stage);

        try {
            DealStatus.DealStage dealStage = DealStatus.DealStage.valueOf(stage.toUpperCase());
            List<DealStatus> deals = dealService.getAgentDealsAtStage(agentId, dealStage);
            return ResponseEntity.ok(ApiResponse.success(deals));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid stage: " + stage));

        } catch (Exception e) {
            logger.error("❌ Error fetching agent deals at stage: ", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}