package com.example.realestate.repository;

import com.example.realestate.model.Deal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DealRepository extends JpaRepository<Deal, Long> {

    List<Deal> findByAgentId(Long agentId);

    // ... (any other methods you have) ...

    // ⭐ ADD THIS NEW METHOD ⭐
    boolean existsByPropertyIdAndBuyerIdAndAgentId(Long propertyId, Long buyerId, Long agentId);
}