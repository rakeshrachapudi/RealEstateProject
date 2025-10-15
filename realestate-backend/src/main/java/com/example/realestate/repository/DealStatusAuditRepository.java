package com.example.realestate.repository;

import com.example.realestate.model.DealStatusAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DealStatusAuditRepository extends JpaRepository<DealStatusAudit, Long> {
    List<DealStatusAudit> findByPropertyIdOrderByTimestampDesc(Long propertyId);
}