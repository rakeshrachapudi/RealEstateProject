package com.example.realestate.service;

import com.example.realestate.dto.AreaDTO;
import com.example.realestate.model.Area;
import com.example.realestate.repository.AreaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AreaService {

    private static final Logger logger = LoggerFactory.getLogger(AreaService.class);
    private final AreaRepository areaRepository;

    public AreaService(AreaRepository areaRepository) {
        this.areaRepository = areaRepository;
    }

    /**
     * Get all areas for a specific city
     */
    public List<AreaDTO> getAreasByCity(String cityName) {
        logger.info("Fetching areas for city: {}", cityName);
        List<Area> areas = areaRepository.findByCityName(cityName);
        return areas.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all active areas
     */
    public List<AreaDTO> getAllActiveAreas() {
        logger.info("Fetching all active areas");
        List<Area> areas = areaRepository.findByIsActiveTrue();
        return areas.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get area by ID
     */
    public AreaDTO getAreaById(Integer areaId) {
        logger.info("Fetching area with ID: {}", areaId);
        return areaRepository.findById(areaId)
                .map(this::convertToDTO)
                .orElse(null);
    }

    /**
     * Get areas by pincode
     */
    public List<AreaDTO> getAreasByPincode(String pincode) {
        logger.info("Fetching areas with pincode: {}", pincode);
        List<Area> areas = areaRepository.findByPincode(pincode);
        return areas.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Create new area
     */
    public Area createArea(Area area) {
        logger.info("Creating new area: {}", area.getAreaName());
        return areaRepository.save(area);
    }

    /**
     * Update existing area
     */
    public Area updateArea(Integer areaId, Area areaDetails) {
        logger.info("Updating area with ID: {}", areaId);
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new RuntimeException("Area not found with id: " + areaId));

        area.setAreaName(areaDetails.getAreaName());
        area.setPincode(areaDetails.getPincode());
        area.setIsActive(areaDetails.getIsActive());

        return areaRepository.save(area);
    }

    /**
     * Delete area (soft delete by setting isActive to false)
     */
    public void deleteArea(Integer areaId) {
        logger.info("Deleting area with ID: {}", areaId);
        Area area = areaRepository.findById(areaId)
                .orElseThrow(() -> new RuntimeException("Area not found with id: " + areaId));

        area.setIsActive(false);
        areaRepository.save(area);
    }

    /**
     * Convert Area entity to AreaDTO
     */
    private AreaDTO convertToDTO(Area area) {
        AreaDTO dto = new AreaDTO();
        dto.setAreaId(area.getAreaId());
        dto.setAreaName(area.getAreaName());
        dto.setPincode(area.getPincode());
        if (area.getCity() != null) {
            dto.setCityName(area.getCity().getCityName());
        }
        return dto;
    }
}