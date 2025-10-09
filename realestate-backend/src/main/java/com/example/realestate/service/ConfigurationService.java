package com.example.realestate.service;

import com.example.realestate.model.Configuration;
import com.example.realestate.repository.ConfigurationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ConfigurationService {

    private static final Logger logger = LoggerFactory.getLogger(ConfigurationService.class);
    private final ConfigurationRepository configurationRepository;

    public ConfigurationService(ConfigurationRepository configurationRepository) {
        this.configurationRepository = configurationRepository;
    }

    /**
     * Get all configurations
     */
    public List<Configuration> getAllConfigurations() {
        logger.info("Fetching all configurations");
        return configurationRepository.findAll();
    }

    /**
     * Get configuration by key
     */
    public Configuration getConfigurationByKey(String configKey) {
        logger.info("Fetching configuration with key: {}", configKey);
        return configurationRepository.findByConfigKey(configKey)
                .orElse(null);
    }

    /**
     * Get configuration value by key
     */
    public String getConfigurationValue(String configKey) {
        logger.info("Fetching configuration value for key: {}", configKey);
        return configurationRepository.findByConfigKey(configKey)
                .map(Configuration::getConfigValue)
                .orElse(null);
    }

    /**
     * Get configuration value by key with default value
     */
    public String getConfigurationValue(String configKey, String defaultValue) {
        logger.info("Fetching configuration value for key: {} with default: {}", configKey, defaultValue);
        return configurationRepository.findByConfigKey(configKey)
                .map(Configuration::getConfigValue)
                .orElse(defaultValue);
    }

    /**
     * Create or update configuration
     */
    public Configuration saveConfiguration(String configKey, String configValue, String description) {
        logger.info("Saving configuration with key: {}", configKey);

        Configuration config = configurationRepository.findByConfigKey(configKey)
                .orElse(new Configuration());

        config.setConfigKey(configKey);
        config.setConfigValue(configValue);
        config.setDescription(description);
        config.setUpdatedAt(LocalDateTime.now());

        return configurationRepository.save(config);
    }

    /**
     * Update configuration value
     */
    public Configuration updateConfigurationValue(String configKey, String newValue) {
        logger.info("Updating configuration value for key: {}", configKey);

        Configuration config = configurationRepository.findByConfigKey(configKey)
                .orElseThrow(() -> new RuntimeException("Configuration not found with key: " + configKey));

        config.setConfigValue(newValue);
        config.setUpdatedAt(LocalDateTime.now());

        return configurationRepository.save(config);
    }

    /**
     * Delete configuration
     */
    public void deleteConfiguration(String configKey) {
        logger.info("Deleting configuration with key: {}", configKey);
        Configuration config = configurationRepository.findByConfigKey(configKey)
                .orElseThrow(() -> new RuntimeException("Configuration not found with key: " + configKey));

        configurationRepository.delete(config);
    }

    /**
     * Check if configuration exists
     */
    public boolean configurationExists(String configKey) {
        return configurationRepository.existsByConfigKey(configKey);
    }
}