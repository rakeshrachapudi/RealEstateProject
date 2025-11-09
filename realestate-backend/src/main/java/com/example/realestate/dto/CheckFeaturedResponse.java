package com.example.realestate.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckFeaturedResponse {
    private boolean isFeatured;
    private FeaturedPropertyResponse featuredDetails;
}
