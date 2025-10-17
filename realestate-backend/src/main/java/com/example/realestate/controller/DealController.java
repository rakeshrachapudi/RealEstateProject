package com.example.realestate.controller;

import com.example.realestate.model.DealStatus;
import com.example.realestate.service.DealService;
import com.example.realestate.dto.ApiResponse;
import com.example.realestate.dto.DealDTO;
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
import java.util.stream.Collectors;

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
        public String stage;
        public String notes;

        public String getStage() { return stage; }
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

            DealDTO dealDTO = convertToDTO(deal);
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(ApiResponse.success(dealDTO));

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
            DealDTO dealDTO = convertToDTO(deal);
            return ResponseEntity.ok(ApiResponse.success(dealDTO));

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
                dealId, request.stage, authentication != null ? authentication.getName() : "Unknown");

        try {
            String username = authentication != null ? authentication.getName() : "system";

            // Convert string stage to enum
            DealStatus.DealStage stage = DealStatus.DealStage.valueOf(request.stage.toUpperCase());

            DealStatus deal = dealService.updateDealStage(
                    dealId,
                    stage,
                    request.notes,
                    username
            );

            DealDTO dealDTO = convertToDTO(deal);
            return ResponseEntity.ok(ApiResponse.success(dealDTO));

        } catch (IllegalArgumentException e) {
            logger.error("❌ Invalid stage: {}", request.stage);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid stage: " + request.stage));

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

        logger.info("👤 Assigning agent to deal - DealId: {}, AgentId: {}",
                dealId, request.agentId);

        try {
            String username = authentication != null ? authentication.getName() : "system";

            DealStatus deal = dealService.assignAgentToDeal(
                    dealId,
                    request.agentId,
                    username
            );

            DealDTO dealDTO = convertToDTO(deal);
            return ResponseEntity.ok(ApiResponse.success(dealDTO));

        } catch (Exception e) {
            logger.error("❌ Error assigning agent: ", e);
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
            List<DealDTO> dealDTOs = deals.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

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
            List<DealDTO> dealDTOs = deals.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

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
            List<DealDTO> dealDTOs = deals.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

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
            List<DealDTO> dealDTOs = deals.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

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
            List<DealDTO> dealDTOs = deals.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(ApiResponse.success(dealDTOs));

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

    // ==================== HELPER METHOD ====================
    private DealDTO convertToDTO(DealStatus deal) {
        DealDTO dto = new DealDTO();

        dto.setId(deal.getId());
        dto.setDealId(deal.getId());
        dto.setStage(deal.getStage().name());
        dto.setCurrentStage(deal.getStage().name());
        dto.setNotes(deal.getNotes());
        dto.setCreatedAt(deal.getCreatedAt());
        dto.setUpdatedAt(deal.getUpdatedAt());
        dto.setLastUpdatedBy(deal.getLastUpdatedBy());

        // Property info
        if (deal.getProperty() != null) {
            dto.setPropertyId(deal.getProperty().getId());
            dto.setProperty(new DealDTO.PropertyInfo(
                    deal.getProperty().getId(),
                    deal.getProperty().getTitle(),
                    deal.getProperty().getCity(),
                    deal.getProperty().getPrice() != null ? deal.getProperty().getPrice().doubleValue() : 0,
                    deal.getProperty().getBedrooms(),
                    deal.getProperty().getImageUrl()
            ));
        }

        // Buyer info
        if (deal.getBuyer() != null) {
            dto.setBuyerId(deal.getBuyer().getId());
            dto.setBuyer(new DealDTO.UserInfo(
                    deal.getBuyer().getId(),
                    deal.getBuyer().getFirstName(),
                    deal.getBuyer().getLastName(),
                    deal.getBuyer().getEmail(),
                    deal.getBuyer().getMobileNumber()
            ));
        }

        // Agent info
        if (deal.getAgent() != null) {
            dto.setAgentId(deal.getAgent().getId());
            dto.setAgent(new DealDTO.UserInfo(
                    deal.getAgent().getId(),
                    deal.getAgent().getFirstName(),
                    deal.getAgent().getLastName(),
                    deal.getAgent().getEmail(),
                    deal.getAgent().getMobileNumber()
            ));
        }

        return dto;
    }
}