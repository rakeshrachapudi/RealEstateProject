package com.example.realestate.service;

import com.example.realestate.model.Property;
import com.example.realestate.model.SearchRequestDTO;
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

    public List<Property> searchProperties(SearchRequestDTO searchRequest) {
        List<String> locations = searchRequest.getLocations();
        String propertyType = searchRequest.getPropertyType();
        String budgetRange = searchRequest.getBudgetRange();

        Long minBudget = null;
        Long maxBudget = null;

        if (budgetRange != null && !budgetRange.isEmpty()) {
            String[] budgetParts = budgetRange.split("-");
            if (budgetParts.length == 2) {
                minBudget = Long.parseLong(budgetParts[0]);
                maxBudget = Long.parseLong(budgetParts[1]);
            }
        }

        return propertyRepository.searchProperties(locations, propertyType, minBudget, maxBudget);
    }
}