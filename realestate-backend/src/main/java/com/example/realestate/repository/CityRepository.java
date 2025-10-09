package com.example.realestate.repository;

import com.example.realestate.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Integer> {

    // Find city by name
    Optional<City> findByCityName(String cityName);

    // Find city by name (case insensitive)
    Optional<City> findByCityNameIgnoreCase(String cityName);

    // Find all active cities
    List<City> findByIsActiveTrue();

    // Find cities by state
    List<City> findByState(String state);

    // Check if city exists by name
    boolean existsByCityName(String cityName);
}