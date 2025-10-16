package com.example.realestate.repository;

import com.example.realestate.model.DealStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DealStatusRepository extends JpaRepository<DealStatus, Long> {

    // Find deal by property and buyer (combination)
    Optional<DealStatus> findByPropertyIdAndBuyerId(Long propertyId, Long buyerId);

    // Find all deals for a specific property
    List<DealStatus> findByPropertyId(Long propertyId);

    // Find all deals assigned to an agent
    List<DealStatus> findByAgentId(Long agentId);

    // Find deals by specific stage
    List<DealStatus> findByStage(DealStatus.DealStage stage);

    // Find all deals for a buyer
    List<DealStatus> findByBuyerId(Long buyerId);

    // Find all active deals for an agent (not completed)
    @Query("SELECT d FROM DealStatus d WHERE d.agent.id = :agentId AND d.stage != com.example.realestate.model.DealStatus$DealStage.COMPLETED ORDER BY d.updatedAt DESC")
    List<DealStatus> findActiveDealsForAgent(@Param("agentId") Long agentId);

    // Find all active deals for a buyer (not completed)
    @Query("SELECT d FROM DealStatus d WHERE d.buyer.id = :buyerId AND d.stage != com.example.realestate.model.DealStatus$DealStage.COMPLETED ORDER BY d.updatedAt DESC")
    List<DealStatus> findActiveDealForBuyer(@Param("buyerId") Long buyerId);

    // Find deals at specific stages
    @Query("SELECT d FROM DealStatus d WHERE d.stage IN :stages ORDER BY d.updatedAt DESC")
    List<DealStatus> findByStages(@Param("stages") List<DealStatus.DealStage> stages);

    // Count deals by stage
    @Query("SELECT COUNT(d) FROM DealStatus d WHERE d.stage = :stage")
    Long countByStage(@Param("stage") DealStatus.DealStage stage);

    // Find deals by agent and stage
    @Query("SELECT d FROM DealStatus d WHERE d.agent.id = :agentId AND d.stage = :stage")
    List<DealStatus> findByAgentIdAndStage(@Param("agentId") Long agentId, @Param("stage") DealStatus.DealStage stage);

    // Check if deal exists
    boolean existsByPropertyIdAndBuyerId(Long propertyId, Long buyerId);
}