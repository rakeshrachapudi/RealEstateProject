package com.example.realestate.service;

import com.example.realestate.model.City;
import com.example.realestate.repository.CityRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CityService {

    private static final Logger logger = LoggerFactory.getLogger(CityService.class);
    private final CityRepository cityRepository;

    public CityService(CityRepository cityRepository) {
        this.cityRepository = cityRepository;
    }

    /**
     * Get all active cities
     */
    public List<City> getAllActiveCities() {
        logger.info("Fetching all active cities");
        return cityRepository.findByIsActiveTrue();
    }

    /**
     * Get all cities (including inactive)
     */
    public List<City> getAllCities() {
        logger.info("Fetching all cities");
        return cityRepository.findAll();
    }

    /**
     * Get city by ID
     */
    public City getCityById(Integer cityId) {
        logger.info("Fetching city with ID: {}", cityId);
        return cityRepository.findById(cityId)
                .orElseThrow(() -> new RuntimeException("City not found with id: " + cityId));
    }

    /**
     * Get city by name
     */
    public City getCityByName(String cityName) {
        logger.info("Fetching city with name: {}", cityName);
        return cityRepository.findByCityNameIgnoreCase(cityName)
                .orElse(null);
    }

    /**
     * Get cities by state
     */
    public List<City> getCitiesByState(String state) {
        logger.info("Fetching cities in state: {}", state);
        return cityRepository.findByState(state);
    }

    /**
     * Create new city
     */
    public City createCity(City city) {
        logger.info("Creating new city: {}", city.getCityName());

        // Check if city already exists
        if (cityRepository.existsByCityName(city.getCityName())) {
            throw new RuntimeException("City already exists: " + city.getCityName());
        }

        city.setCreatedAt(LocalDateTime.now());
        city.setUpdatedAt(LocalDateTime.now());
        return cityRepository.save(city);
    }

    /**
     * Update existing city
     */
    public City updateCity(Integer cityId, City cityDetails) {
        logger.info("Updating city with ID: {}", cityId);
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new RuntimeException("City not found with id: " + cityId));

        city.setCityName(cityDetails.getCityName());
        city.setState(cityDetails.getState());
        city.setIsActive(cityDetails.getIsActive());
        city.setUpdatedAt(LocalDateTime.now());

        return cityRepository.save(city);
    }

    /**
     * Delete city (soft delete by setting isActive to false)
     */
    public void deleteCity(Integer cityId) {
        logger.info("Deleting city with ID: {}", cityId);
        City city = cityRepository.findById(cityId)
                .orElseThrow(() -> new RuntimeException("City not found with id: " + cityId));

        city.setIsActive(false);
        city.setUpdatedAt(LocalDateTime.now());
        cityRepository.save(city);
    }
}