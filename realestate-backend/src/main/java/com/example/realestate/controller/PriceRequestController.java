package com.example.realestate.controller;

import com.example.realestate.dto.CreateDealWithPriceRequestDto; // ⭐ Import DTO
import com.example.realestate.model.*;
import com.example.realestate.repository.PriceRequestRepository;
// Remove DealRepository if not needed elsewhere in this controller
// import com.example.realestate.repository.DealRepository;
import com.example.realestate.repository.UserRepository;
import com.example.realestate.service.DealService; // ⭐ Import DealService
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/price-requests")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PriceRequestController {

    private static final Logger logger = LoggerFactory.getLogger(PriceRequestController.class);

    @Autowired
    private PriceRequestRepository priceRequestRepository;

    // Remove DealRepository if only used for the incorrect save
    // @Autowired
    // private DealRepository dealRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired // ⭐ Inject DealService
    private DealService dealService;


    @GetMapping("/pending")
    public ResponseEntity<List<PriceRequest>> getPendingRequests(Authentication authentication) {
        // ... (existing code) ...
        logger.info("Fetching pending price requests");
        List<PriceRequest> pendingRequests = priceRequestRepository.findByStatus(PriceRequestStatus.PENDING);
        logger.info("Found {} pending requests", pendingRequests.size());
        return ResponseEntity.ok(pendingRequests);
    }

    @PostMapping("/{requestId}/accept")
    public ResponseEntity<?> acceptRequest(@PathVariable Long requestId) {
        logger.info("Attempting to accept price request ID: {}", requestId);

        // 1. Get Agent (No change)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        // ... (authentication checks) ...
        String currentUsername = authentication.getName();
        User agent;
        try {
            agent = userRepository.findByUsername(currentUsername)
                    .orElseThrow(() -> new EntityNotFoundException("Agent not found with username: " + currentUsername));
        } catch (EntityNotFoundException enfe) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", enfe.getMessage()));
        }
        // ... (role checks) ...


        // 2. Find Price Request (No change)
        PriceRequest request;
        try {
            request = priceRequestRepository.findById(requestId)
                    .orElseThrow(() -> new EntityNotFoundException("Price request not found with ID: " + requestId));
        } catch (EntityNotFoundException enfe) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", enfe.getMessage()));
        }

        // 3. Check Status (No change)
        if (request.getStatus() != PriceRequestStatus.PENDING) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "This request has already been " + request.getStatus()));
        }

        // 4. Ensure related entities are not null (No change)
        if (request.getProperty() == null || request.getBuyer() == null) {
            logger.error("Accept request failed: Price request ID {} is incomplete (missing property or buyer info)", requestId);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Price request is incomplete (missing property or buyer info)"));
        }


        try {
            // ⭐⭐⭐ FIX: Call DealService to create the DealStatus ⭐⭐⭐
            CreateDealWithPriceRequestDto createDealDto = new CreateDealWithPriceRequestDto();
            createDealDto.setPropertyId(request.getProperty().getId());
            createDealDto.setBuyerId(request.getBuyer().getId());
            createDealDto.setAgentId(agent.getId()); // Pass the agent ID
            createDealDto.setAgreedPrice(request.getInterestedPrice());
            // You can optionally add notes if needed from the request or generate default ones
            // createDealDto.setNotes("Deal created from accepted price request #" + requestId);

            // Call the service method - this handles saving the DealStatus
            DealStatus savedDeal = dealService.createDealWithPrice(createDealDto, agent.getId());
            logger.info("DealStatus created via DealService with ID: {}", savedDeal.getId());
            // ⭐⭐⭐ END FIX ⭐⭐⭐


            // 5. Update the Price Request status (No change here)
            request.setStatus(PriceRequestStatus.ACCEPTED);
            request.setAcceptedBy(agent);
            priceRequestRepository.save(request);
            logger.info("Price request ID {} status updated to ACCEPTED by agent ID {}", requestId, agent.getId());

            // Return 200 OK on success
            return ResponseEntity.ok(Map.of("message", "Deal created successfully from price request", "dealId", savedDeal.getId()));

        } catch (RuntimeException re) { // Catch specific service exceptions like "Deal already exists"
            logger.warn("Failed to create deal from price request {}: {}", requestId, re.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", re.getMessage())); // Return the specific error
        } catch (Exception e) {
            // Catch potential other issues
            logger.error("Error creating deal from price request {}: {}", requestId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An unexpected error occurred while creating the deal: " + e.getMessage()));
        }
    }
}