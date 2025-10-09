package com.example.realestate.repository;

import com.example.realestate.model.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AreaRepository extends JpaRepository<Area, Integer> {

    // Find areas by city name
    @Query("SELECT a FROM Area a JOIN a.city c WHERE c.cityName = :cityName AND a.isActive = true")
    List<Area> findByCityName(@Param("cityName") String cityName);

    // Find area by name and city
    @Query("SELECT a FROM Area a JOIN a.city c WHERE a.areaName = :areaName AND c.cityName = :cityName")
    Optional<Area> findByAreaNameAndCityName(@Param("areaName") String areaName, @Param("cityName") String cityName);

    // Find by pincode
    List<Area> findByPincode(String pincode);

    // Find active areas only
    List<Area> findByIsActiveTrue();

    // Find areas by city ID
    @Query("SELECT a FROM Area a WHERE a.city.cityId = :cityId AND a.isActive = true")
    List<Area> findByCityId(@Param("cityId") Integer cityId);
}