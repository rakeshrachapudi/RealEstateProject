package com.example.realestate.repository;

import com.example.realestate.model.PropertyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyTypeRepository extends JpaRepository<PropertyType, Integer> {

    Optional<PropertyType> findByTypeName(String typeName);

    Optional<PropertyType> findByTypeNameIgnoreCase(String typeName);

    List<PropertyType> findByIsActiveTrue();

    // ADDED THIS MISSING METHOD TO CHECK FOR EXISTENCE
    boolean existsByTypeName(String typeName);
}

