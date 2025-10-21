package com.example.realestate.controller;

import com.example.realestate.dto.ApiResponse;
import com.example.realestate.dto.AreaDTO;
import com.example.realestate.service.AreaService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/areas")
public class AreaController {

    private static final Logger logger = LoggerFactory.getLogger(AreaController.class);
    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AreaDTO>>> getAreas(
            @RequestParam(required = false, defaultValue = "Hyderabad") String city) {
        logger.info("Fetching areas for city: {}", city);
        try {
            List<AreaDTO> areas = areaService.getAreasByCity(city);
            return ResponseEntity.ok(ApiResponse.success(areas));
        } catch (Exception e) {
            logger.error("Error fetching areas", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error fetching areas"));
        }
    }
}