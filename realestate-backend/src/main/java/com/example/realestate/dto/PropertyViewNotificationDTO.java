package com.example.realestate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyViewNotificationDTO {
    private Long propertyId;
    private String propertyTitle;
    private String propertyArea;
    private String propertyCity;
    private String propertyPrice;
    private String propertyUrl;

    private String ownerName;
    private String ownerPhone;
    private String ownerEmail;

    private String guestIp;
    private String guestDevice;
    private String viewedAt;
}