package com.example.realestate.repository;

import com.example.realestate.model.PriceRequest;
import com.example.realestate.model.PriceRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PriceRequestRepository extends JpaRepository<PriceRequest, Long> {

    // Find all requests that are still PENDING
    List<PriceRequest> findByStatus(PriceRequestStatus status);
}