package com.example.realestate;

import com.example.realestate.model.Property;
import com.example.realestate.repository.PropertyRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class RealEstateApplication {

    public static void main(String[] args) {
        SpringApplication.run(RealEstateApplication.class, args);
    }

    // Bean to insert sample data on startup
    // In RealEstateApplication.java

    @Bean
    CommandLineRunner initData(PropertyRepository repo) {
        return args -> {
            // --- Corrected Way ---

//            // Property 1
//            Property p1 = new Property();
//            p1.setTitle("2 BHK Apartment in Koramangala");
//            p1.setType("Apartment");
//            p1.setCity("Bangalore");
//            p1.setImageUrl("https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1");
//            p1.setPriceDisplay("₹1.20 Cr");
//            repo.save(p1);
//
//            // Property 2
//            Property p2 = new Property();
//            p2.setTitle("3 BHK Sea View Apartment");
//            p2.setType("Apartment");
//            p2.setCity("Mumbai");
//            p2.setImageUrl("https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1");
//            p2.setPriceDisplay("₹2.50 Cr");
//            repo.save(p2);
//
//            // Property 3
//            Property p3 = new Property();
//            p3.setTitle("Modern Villa in Jubilee Hills");
//            p3.setType("Villa");
//            p3.setCity("Hyderabad");
//            p3.setImageUrl("https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg");
//            p3.setPriceDisplay("₹3.10 Cr");
//            repo.save(p3);
        };
    }
}