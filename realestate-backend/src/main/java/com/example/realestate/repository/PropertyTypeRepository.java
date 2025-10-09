package com.example.realestate.repository;

import com.example.realestate.model.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyTypeRepository extends JpaRepository<PropertyType, Integer> {

    // Find property type by name
    Optional<PropertyType> findByTypeName(String typeName);

    // Find property type by name (case insensitive)
    Optional<PropertyType> findByTypeNameIgnoreCase(String typeName);

    // Find all active property types
    List<PropertyType> findByIsActiveTrue();

    // Check if property type exists by name
    boolean existsByTypeName(String typeName);
}