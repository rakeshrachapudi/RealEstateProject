package com.example.realestate.service;

import com.example.realestate.dto.PropertyViewNotificationDTO;
import com.example.realestate.model.Property;
import com.example.realestate.model.User;
import com.example.realestate.repository.PropertyRepository;
import com.example.realestate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private SESService sesService;

    @Autowired
    private WhatsAppCloudService whatsAppService;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${notification.enabled:true}")
    private boolean notificationEnabled;

    @Value("${notification.admins.emails:}")
    private String adminEmailsConfig;

    @Value("${notification.admins.phones:}")
    private String adminPhonesConfig;

    @Value("${frontend.base.url:https://propertydealz.in}")
    private String frontendBaseUrl;

    /**
     * ✅ Send property view notification for BUYER
     */
    @Async
    public void sendPropertyViewNotificationForBuyer(
            Long propertyId,
            Long buyerId,
            String buyerName,
            String buyerMobile,
            String buyerEmail) {

        try {
            if (!notificationEnabled) {
                logger.info("Notifications are disabled");
                return;
            }

            logger.info("📧 Preparing to send property view notification for buyer: {}", buyerName);

            // Fetch property details
            Optional<Property> propertyOpt = propertyRepository.findById(propertyId);
            if (!propertyOpt.isPresent()) {
                logger.error("Property not found with ID: {}", propertyId);
                return;
            }

            Property property = propertyOpt.get();
            User owner = property.getUser();

            // Build notification DTO
            PropertyViewNotificationDTO notificationDTO = PropertyViewNotificationDTO.builder()
                    .propertyId(propertyId)
                    .propertyTitle(property.getTitle())
                    .propertyArea(property.getArea().getAreaName())  // Area object
                    .propertyCity(property.getCity())
                    .propertyPrice(property.getPrice())  // BigDecimal
                    .propertyUrl(frontendBaseUrl + "/property/" + propertyId)
                    .buyerId(buyerId)
                    .buyerName(buyerName)
                    .buyerMobile(buyerMobile)
                    .buyerEmail(buyerEmail)
                    .ownerName(owner != null ? owner.getFirstName() + " " + owner.getLastName() : "N/A")
                    .ownerPhone(owner != null ? owner.getMobileNumber() : "N/A")
                    .ownerEmail(owner != null ? owner.getEmail() : "N/A")
                    .viewedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MMM-yyyy hh:mm a")))
                    .build();

            // Get recipients (Agents and Admins)
            List<String> recipientEmails = getRecipientEmails();
            List<String> recipientPhones = getRecipientPhones();

            logger.info("📧 Sending notifications to {} emails and {} phones",
                    recipientEmails.size(), recipientPhones.size());

            // Send Email Notifications
            if (!recipientEmails.isEmpty()) {
                sendBuyerViewEmailNotifications(recipientEmails, notificationDTO);
            }

            // Send WhatsApp Notifications
            if (!recipientPhones.isEmpty()) {
                sendBuyerViewWhatsAppNotifications(recipientPhones, notificationDTO);
            }

            logger.info("✅ Property view notifications sent successfully for buyer: {}", buyerName);

        } catch (Exception e) {
            logger.error("❌ Error sending property view notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Send email notifications to all recipients
     */
    private void sendBuyerViewEmailNotifications(
            List<String> recipientEmails,
            PropertyViewNotificationDTO dto) {

        String subject = "🎯 Buyer Viewed Property: " + dto.getPropertyTitle();
        String htmlBody = buildBuyerViewEmailTemplate(dto);
        String textBody = buildBuyerViewTextTemplate(dto);

        for (String email : recipientEmails) {
            try {
                sesService.sendEmail(email, subject, htmlBody, textBody);
                logger.info("✅ Email sent to: {}", email);
            } catch (Exception e) {
                logger.error("❌ Failed to send email to {}: {}", email, e.getMessage());
            }
        }
    }

    /**
     * Send WhatsApp notifications to all recipients
     */
    private void sendBuyerViewWhatsAppNotifications(
            List<String> recipientPhones,
            PropertyViewNotificationDTO dto) {

        String message = buildBuyerViewWhatsAppMessage(dto);

        for (String phone : recipientPhones) {
            try {
                whatsAppService.sendTextMessage(phone, message);
                logger.info("✅ WhatsApp sent to: {}", phone);
            } catch (Exception e) {
                logger.error("❌ Failed to send WhatsApp to {}: {}", phone, e.getMessage());
            }
        }
    }

    /**
     * Build HTML email template for buyer view notification
     */
    private String buildBuyerViewEmailTemplate(PropertyViewNotificationDTO dto) {
        // Format location: Get area name
        String location = getAreaName(dto.getPropertyArea()) + ", " + dto.getPropertyCity();

        // Format price
        String formattedPrice = formatPrice(dto.getPropertyPrice());

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }" +
                ".content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }" +
                ".buyer-section { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #2196F3; }" +
                ".property-section { background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ff9800; }" +
                ".owner-section { background: #f1f8e9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #8bc34a; }" +
                ".info-row { margin: 10px 0; }" +
                ".label { font-weight: bold; color: #555; }" +
                ".value { color: #333; }" +
                ".button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }" +
                ".footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>🎯 New Buyer Interest!</h1>" +
                "<p>A potential buyer has viewed a property</p>" +
                "</div>" +
                "<div class='content'>" +

                "<div class='buyer-section'>" +
                "<h2>👤 Buyer Information</h2>" +
                "<div class='info-row'><span class='label'>Name:</span> <span class='value'>" + dto.getBuyerName() + "</span></div>" +
                "<div class='info-row'><span class='label'>Mobile:</span> <span class='value'>" + dto.getBuyerMobile() + "</span></div>" +
                "<div class='info-row'><span class='label'>Email:</span> <span class='value'>" + dto.getBuyerEmail() + "</span></div>" +
                "<div class='info-row'><span class='label'>Viewed At:</span> <span class='value'>" + dto.getViewedAt() + "</span></div>" +
                "</div>" +

                "<div class='property-section'>" +
                "<h2>🏠 Property Details</h2>" +
                "<div class='info-row'><span class='label'>Title:</span> <span class='value'>" + dto.getPropertyTitle() + "</span></div>" +
                "<div class='info-row'><span class='label'>ID:</span> <span class='value'>#" + dto.getPropertyId() + "</span></div>" +
                "<div class='info-row'><span class='label'>Location:</span> <span class='value'>" + location + "</span></div>" +
                "<div class='info-row'><span class='label'>Price:</span> <span class='value'>" + formattedPrice + "</span></div>" +
                "</div>" +

                "<div class='owner-section'>" +
                "<h2>👨‍💼 Owner Details</h2>" +
                "<div class='info-row'><span class='label'>Name:</span> <span class='value'>" + dto.getOwnerName() + "</span></div>" +
                "<div class='info-row'><span class='label'>Phone:</span> <span class='value'>" + dto.getOwnerPhone() + "</span></div>" +
                "<div class='info-row'><span class='label'>Email:</span> <span class='value'>" + dto.getOwnerEmail() + "</span></div>" +
                "</div>" +

                "<div style='text-align: center;'>" +
                "<a href='" + dto.getPropertyUrl() + "' class='button'>View Property Details</a>" +
                "</div>" +

                "</div>" +
                "<div class='footer'>" +
                "<p>This is an automated notification from PropertyDealz.in</p>" +
                "<p>&copy; 2024 PropertyDealz. All rights reserved.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    /**
     * Build text email template for buyer view notification
     */
    private String buildBuyerViewTextTemplate(PropertyViewNotificationDTO dto) {
        // Format location
        String location = getAreaName(dto.getPropertyArea()) + ", " + dto.getPropertyCity();

        // Format price
        String formattedPrice = formatPrice(dto.getPropertyPrice());

        return "NEW BUYER INTEREST ALERT!\n\n" +
                "BUYER INFORMATION:\n" +
                "Name: " + dto.getBuyerName() + "\n" +
                "Mobile: " + dto.getBuyerMobile() + "\n" +
                "Email: " + dto.getBuyerEmail() + "\n" +
                "Viewed At: " + dto.getViewedAt() + "\n\n" +

                "PROPERTY DETAILS:\n" +
                "Title: " + dto.getPropertyTitle() + "\n" +
                "ID: #" + dto.getPropertyId() + "\n" +
                "Location: " + location + "\n" +
                "Price: " + formattedPrice + "\n\n" +

                "OWNER DETAILS:\n" +
                "Name: " + dto.getOwnerName() + "\n" +
                "Phone: " + dto.getOwnerPhone() + "\n" +
                "Email: " + dto.getOwnerEmail() + "\n\n" +

                "View Property: " + dto.getPropertyUrl() + "\n\n" +
                "---\n" +
                "This is an automated notification from PropertyDealz.in\n" +
                "(c) 2024 PropertyDealz. All rights reserved.";
    }

    /**
     * Build WhatsApp message for buyer view notification
     */
    private String buildBuyerViewWhatsAppMessage(PropertyViewNotificationDTO dto) {
        // Format location
        String location = getAreaName(dto.getPropertyArea()) + ", " + dto.getPropertyCity();

        // Format price
        String formattedPrice = formatPrice(dto.getPropertyPrice());

        return "🎯 *New Buyer Interest Alert!*\n\n" +
                "👤 *Buyer Information:*\n" +
                "• Name: " + dto.getBuyerName() + "\n" +
                "• Mobile: " + dto.getBuyerMobile() + "\n" +
                "• Email: " + dto.getBuyerEmail() + "\n" +
                "• Viewed: " + dto.getViewedAt() + "\n\n" +

                "🏠 *Property Details:*\n" +
                "• ID: #" + dto.getPropertyId() + "\n" +
                "• Title: " + dto.getPropertyTitle() + "\n" +
                "• Location: " + location + "\n" +
                "• Price: " + formattedPrice + "\n\n" +

                "👨‍💼 *Owner Details:*\n" +
                "• Name: " + dto.getOwnerName() + "\n" +
                "• Phone: " + dto.getOwnerPhone() + "\n" +
                "• Email: " + dto.getOwnerEmail() + "\n\n" +

                "🔗 View Property: " + dto.getPropertyUrl() + "\n\n" +
                "---\n" +
                "PropertyDealz.in - Automated Notification";
    }

    /**
     * Get all recipient emails (Agents + Admins)
     */
    private List<String> getRecipientEmails() {
        Set<String> emails = new HashSet<>();

        try {
            // Add AGENT and ADMIN users from database
            List<User> agents = userRepository.findByRole(User.UserRole.AGENT);
            List<User> admins = userRepository.findByRole(User.UserRole.ADMIN);

            emails.addAll(agents.stream()
                    .map(User::getEmail)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList()));

            emails.addAll(admins.stream()
                    .map(User::getEmail)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList()));
        } catch (Exception e) {
            logger.warn("⚠️ Could not fetch agents/admins from database: {}", e.getMessage());
        }

        // Add configured admin emails
        if (adminEmailsConfig != null && !adminEmailsConfig.trim().isEmpty()) {
            String[] configEmails = adminEmailsConfig.split(",");
            for (String email : configEmails) {
                if (email != null && !email.trim().isEmpty()) {
                    emails.add(email.trim());
                }
            }
        }

        logger.info("📧 Found {} recipient emails", emails.size());
        return new ArrayList<>(emails);
    }

    /**
     * Get all recipient phones (Agents + Admins)
     */
    private List<String> getRecipientPhones() {
        Set<String> phones = new HashSet<>();

        try {
            // Add AGENT and ADMIN users from database
            List<User> agents = userRepository.findByRole(User.UserRole.AGENT);
            List<User> admins = userRepository.findByRole(User.UserRole.ADMIN);

            phones.addAll(agents.stream()
                    .map(User::getMobileNumber)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList()));

            phones.addAll(admins.stream()
                    .map(User::getMobileNumber)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList()));
        } catch (Exception e) {
            logger.warn("⚠️ Could not fetch agents/admins from database: {}", e.getMessage());
        }

        // Add configured admin phones
        if (adminPhonesConfig != null && !adminPhonesConfig.trim().isEmpty()) {
            String[] configPhones = adminPhonesConfig.split(",");
            for (String phone : configPhones) {
                if (phone != null && !phone.trim().isEmpty()) {
                    phones.add(phone.trim());
                }
            }
        }

        logger.info("📱 Found {} recipient phones", phones.size());
        return new ArrayList<>(phones);
    }

    /**
     * Get area name from Area object
     */
    private String getAreaName(Object areaObj) {
        if (areaObj == null) return "N/A";

        try {
            // Try to get name property using reflection
            return areaObj.getClass().getMethod("getName").invoke(areaObj).toString();
        } catch (Exception e) {
            // Fallback to toString()
            return areaObj.toString();
        }
    }

    /**
     * Format price for display (handles BigDecimal)
     */
    private String formatPrice(Object priceObj) {
        if (priceObj == null) return "N/A";

        try {
            BigDecimal price = (BigDecimal) priceObj;
            long priceValue = price.longValue();

            if (priceValue >= 10000000) { // >= 1 Crore
                return String.format("₹%.2f Cr", priceValue / 10000000.0);
            } else if (priceValue >= 100000) { // >= 1 Lakh
                return String.format("₹%.2f L", priceValue / 100000.0);
            } else {
                return String.format("₹%,d", priceValue);
            }
        } catch (Exception e) {
            return "₹" + priceObj.toString();
        }
    }
}