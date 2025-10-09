package com.example.realestate.repository;

import com.example.realestate.model.Configuration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConfigurationRepository extends JpaRepository<Configuration, Integer> {

    // Find configuration by key
    Optional<Configuration> findByConfigKey(String configKey);

    // Check if configuration key exists
    boolean existsByConfigKey(String configKey);
}