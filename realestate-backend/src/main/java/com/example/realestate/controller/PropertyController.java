package com.example.realestate.controller;

import com.example.realestate.model.Property;
import com.example.realestate.service.PropertyService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PropertyController {
    private final PropertyService service;

    public PropertyController(PropertyService service) {
        this.service = service;
    }

    @GetMapping
    public List<Property> all() {
        return service.findAll();
    }

    @GetMapping("/city/{city}")
    public List<Property> byCity(@PathVariable String city) {
        return service.findByCity(city);
    }

    @PostMapping
    public Property create(@RequestBody Property property) {
        return service.save(property);
    }
}