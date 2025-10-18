package com.example.realestate.service;

import com.example.realestate.dto.PropertyDTO;
import com.example.realestate.model.DealStatus;
import com.example.realestate.model.Property;
import com.example.realestate.model.User;
import com.example.realestate.repository.DealStatusRepository;
import com.example.realestate.repository.PropertyRepository;
import com.example.realestate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AgentService {

    private static final Logger logger = LoggerFactory.getLogger(AgentService.class);

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private DealStatusRepository dealStatusRepository;

    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getAgentDashboard(Long agentId) {
        logger.info("Generating dashboard for agent: {}", agentId);

        Map<String, Object> dashboard = new HashMap<>();

        User agent = userRepository.findById(agentId)
                .orElseThrow(() -> new RuntimeException("Agent not found"));

        dashboard.put("agentName", agent.getFirstName() + " " + agent.getLastName());
        dashboard.put("agentId", agent.getId());

        List<DealStatus> activeDeals = dealStatusRepository.findActiveDealsForAgent(agentId);
        dashboard.put("activeDealCount", activeDeals.size());

        Map<String, Long> dealsByStage = new HashMap<>();
        for (DealStatus.DealStage stage : DealStatus.DealStage.values()) {
            long count = activeDeals.stream()
                    .filter(d -> d.getStage() == stage)
                    .count();
            dealsByStage.put(stage.name(), count);
        }
        dashboard.put("dealsByStage", dealsByStage);

        List<DealStatus> allDeals = dealStatusRepository.findByAgentId(agentId);
        dashboard.put("totalDeals", allDeals.size());

        List<DealStatus> recentDeals = allDeals.stream()
                .sorted(Comparator.comparing(DealStatus::getUpdatedAt).reversed())
                .limit(5)
                .collect(Collectors.toList());
        dashboard.put("recentDeals", recentDeals);

        return dashboard;
    }

    public List<PropertyDTO> getAllPropertiesForAgent(Integer page, Integer size) {
        logger.info("Fetching all properties (page: {}, size: {})", page, size);
        List<Property> properties = propertyRepository.findByIsActiveTrueOrderByCreatedAtDesc();

        return properties.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getAgentStats(Long agentId) {
        logger.info("Calculating stats for agent: {}", agentId);

        Map<String, Object> stats = new HashMap<>();

        List<DealStatus> allDeals = dealStatusRepository.findByAgentId(agentId);
        stats.put("totalDeals", allDeals.size());

        long activeDeals = allDeals.stream()
                .filter(d -> d.getStage() != DealStatus.DealStage.COMPLETED)
                .count();
        stats.put("activeDealCount", activeDeals);

        long completedDeals = allDeals.stream()
                .filter(d -> d.getStage() == DealStatus.DealStage.COMPLETED)
                .count();
        stats.put("completedDealCount", completedDeals);

        long propertiesManaged = allDeals.stream()
                .map(d -> d.getProperty().getId())
                .distinct()
                .count();
        stats.put("propertiesManaged", propertiesManaged);

        // FIXED: Changed stage.getLabel() to stage.name()
        Map<String, Long> stageBreakdown = new HashMap<>();
        for (DealStatus.DealStage stage : DealStatus.DealStage.values()) {
            long count = allDeals.stream()
                    .filter(d -> d.getStage() == stage)
                    .count();
            stageBreakdown.put(stage.name(), count);  // ✅ FIXED: was getLabel()
        }
        stats.put("stageBreakdown", stageBreakdown);

        double conversionRate = allDeals.size() > 0 ? (completedDeals * 100.0) / allDeals.size() : 0;
        stats.put("conversionRate", String.format("%.2f%%", conversionRate));

        return stats;
    }

    private PropertyDTO convertToDTO(Property property) {
        PropertyDTO dto = new PropertyDTO();
        dto.setPropertyId(property.getId());
        dto.setPropertyType(property.getType());
        dto.setTitle(property.getTitle());
        dto.setDescription(property.getDescription());
        dto.setPrice(property.getPrice());
        dto.setAreaSqft(property.getAreaSqft());
        dto.setBedrooms(property.getBedrooms());
        dto.setBathrooms(property.getBathrooms());
        dto.setAddress(property.getAddress());
        dto.setStatus(property.getStatus());
        dto.setListingType(property.getListingType());
        dto.setImageUrl(property.getImageUrl());
        dto.setAmenities(property.getAmenities());
        dto.setIsFeatured(property.getIsFeatured());
        dto.setCreatedAt(property.getCreatedAt());
        dto.setPriceDisplay(property.getPriceDisplay());
        dto.setIsReadyToMove(property.getIsReadyToMove());
        dto.setOwnerType(property.getOwnerType());
        dto.setIsVerified(property.getIsVerified());

        if (property.getUser() != null) {
            PropertyDTO.UserDTO userDTO = new PropertyDTO.UserDTO();
            userDTO.setId(property.getUser().getId());
            userDTO.setFirstName(property.getUser().getFirstName());
            userDTO.setLastName(property.getUser().getLastName());
            userDTO.setEmail(property.getUser().getEmail());
            userDTO.setMobileNumber(property.getUser().getMobileNumber());
            dto.setUser(userDTO);
        }

        if (property.getArea() != null) {
            dto.setAreaName(property.getArea().getAreaName());
            dto.setPincode(property.getArea().getPincode());
            if (property.getArea().getCity() != null) {
                dto.setCityName(property.getArea().getCity().getCityName());
                dto.setState(property.getArea().getCity().getState());
            }
        }

        return dto;
    }
}