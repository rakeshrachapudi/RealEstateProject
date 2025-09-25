package com.example.realestate.service;

import com.example.realestate.model.Property;
import com.example.realestate.repository.PropertyRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PropertyService {
    private final PropertyRepository repo;

    public PropertyService(PropertyRepository repo) {
        this.repo = repo;
    }

    public List<Property> findAll() {
        return repo.findAll();
    }

    public List<Property> findByCity(String city) {
        return repo.findByCityIgnoreCase(city);
    }

    public Property save(Property p) {
        return repo.save(p);
    }
}