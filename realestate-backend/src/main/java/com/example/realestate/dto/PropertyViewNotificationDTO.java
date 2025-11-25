package com.example.realestate.dto;

import com.example.realestate.model.Area;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for Property View Notification - BUYER VERSION
 * Contains buyer information instead of guest tracking data
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyViewNotificationDTO {

    // Buyer Information (NEW - replaces guestIp and guestDevice)
    private Long buyerId;
    private String buyerName;
    private String buyerMobile;
    private String buyerEmail;

    // Property Information
    private Long propertyId;
    private String propertyTitle;
    private String propertyArea;
    private String propertyCity;
    private BigDecimal propertyPrice;
    private String propertyUrl;

    // Owner Information
    private String ownerName;
    private String ownerPhone;
    private String ownerEmail;

    // Timestamp
    private String viewedAt;
}