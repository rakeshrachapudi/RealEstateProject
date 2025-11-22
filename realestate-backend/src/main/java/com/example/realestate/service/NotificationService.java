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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    @Autowired
    private SESService sesService;

    @Autowired
    private WhatsAppCloudService whatsAppCloudService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Value("${notification.enabled:true}")
    private boolean notificationEnabled;

    @Value("${notification.admins.emails:}")
    private String adminEmails;

    @Value("${notification.admins.phones:}")
    private String adminPhones;

    @Value("${frontend.base.url:https://propertydealz.in}")
    private String frontendBaseUrl;

    /**
     * Send property view notification to all agents and admins
     */
    @Async
    public void sendPropertyViewNotification(Long propertyId, String guestIp, String guestDevice) {
        if (!notificationEnabled) {
            logger.info("ℹ️ Notifications are disabled");
            return;
        }

        logger.info("🔔 Processing property view notification for Property ID: {}", propertyId);

        try {
            // Fetch property details
            Property property = propertyRepository.findById(propertyId)
                    .orElseThrow(() -> new RuntimeException("Property not found"));

            // Build notification data
            PropertyViewNotificationDTO notificationData = buildNotificationData(property, guestIp, guestDevice);

            // Get all agents and admins
            List<User> agents = userRepository.findByRole(User.UserRole.AGENT);
            List<User> admins = userRepository.findByRole(User.UserRole.ADMIN);

            // Combine lists
            List<User> recipients = new ArrayList<>();
            recipients.addAll(agents);
            recipients.addAll(admins);

            // Add configured admin emails/phones
            addConfiguredAdmins(recipients);

            logger.info("📊 Total recipients: {} (Agents: {}, Admins: {})",
                    recipients.size(), agents.size(), admins.size());

            // Send email notifications
            sendEmailNotifications(recipients, notificationData);

            // Send WhatsApp notifications
            sendWhatsAppNotifications(recipients, notificationData);

            logger.info("✅ Property view notifications sent successfully");

        } catch (Exception e) {
            logger.error("❌ Error sending property view notification: {}", e.getMessage(), e);
        }
    }

    /**
     * Build notification data from property
     */
    private PropertyViewNotificationDTO buildNotificationData(Property property, String guestIp, String guestDevice) {
        String propertyUrl = frontendBaseUrl + "/property/" + property.getId();

        PropertyViewNotificationDTO dto = PropertyViewNotificationDTO.builder()
                .propertyId(property.getId())
                .propertyTitle(property.getTitle())
                .propertyCity(property.getCity())
                .propertyPrice(property.getPriceDisplay())
                .propertyUrl(propertyUrl)
                .guestIp(guestIp)
                .guestDevice(guestDevice)
                .viewedAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss")))
                .build();

        // Add area information
        if (property.getArea() != null) {
            dto.setPropertyArea(property.getArea().getAreaName());
        }

        // Add owner information
        if (property.getUser() != null) {
            User owner = property.getUser();
            dto.setOwnerName(owner.getFirstName() + " " + owner.getLastName());
            dto.setOwnerPhone(owner.getMobileNumber());
            dto.setOwnerEmail(owner.getEmail());
        }

        return dto;
    }

    /**
     * Send email notifications to all recipients
     */
    private void sendEmailNotifications(List<User> recipients, PropertyViewNotificationDTO data) {
        logger.info("📧 Sending email notifications to {} recipients", recipients.size());

        String subject = "🏠 Property Viewed: " + data.getPropertyTitle();

        String htmlBody = buildEmailHtml(data);
        String textBody = buildEmailText(data);

        List<String> emails = recipients.stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        logger.info("   Valid emails: {}", emails.size());
        sesService.sendBulkEmail(emails, subject, htmlBody, textBody);
    }

    /**
     * Send WhatsApp notifications to all recipients
     */
    private void sendWhatsAppNotifications(List<User> recipients, PropertyViewNotificationDTO data) {
        logger.info("📱 Sending WhatsApp notifications to {} recipients", recipients.size());

        String message = buildWhatsAppMessage(data);

        List<String> phones = recipients.stream()
                .map(User::getMobileNumber)
                .filter(phone -> phone != null && !phone.isEmpty())
                .distinct()
                .collect(Collectors.toList());

        logger.info("   Valid phones: {}", phones.size());
        whatsAppCloudService.sendBulkMessages(phones, message);
    }

    /**
     * Build HTML email body
     */
    private String buildEmailHtml(PropertyViewNotificationDTO data) {
        return String.format("""
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { 
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                            line-height: 1.6; 
                            color: #333; 
                            margin: 0;
                            padding: 0;
                            background-color: #f5f5f5;
                        }
                        .container { 
                            max-width: 600px; 
                            margin: 20px auto; 
                            background: white;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                        }
                        .header { 
                            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); 
                            color: white; 
                            padding: 30px 20px; 
                            text-align: center;
                        }
                        .header h2 {
                            margin: 0;
                            font-size: 24px;
                            font-weight: 600;
                        }
                        .content { 
                            padding: 30px 20px;
                        }
                        .alert-badge {
                            display: inline-block;
                            background: #fef3c7;
                            color: #92400e;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-size: 14px;
                            font-weight: 600;
                            margin-bottom: 20px;
                        }
                        .property-card { 
                            background: #f9fafb; 
                            padding: 20px; 
                            margin: 20px 0; 
                            border-left: 4px solid #667eea;
                            border-radius: 4px;
                        }
                        .property-card h3 {
                            margin: 0 0 15px 0;
                            color: #667eea;
                            font-size: 18px;
                        }
                        .detail-row { 
                            margin: 12px 0;
                            display: flex;
                            align-items: start;
                        }
                        .label { 
                            font-weight: 600; 
                            color: #4b5563;
                            min-width: 120px;
                            display: inline-block;
                        }
                        .value {
                            color: #1f2937;
                            flex: 1;
                        }
                        .button { 
                            display: inline-block; 
                            padding: 14px 32px; 
                            background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                            color: white; 
                            text-decoration: none; 
                            border-radius: 6px; 
                            margin: 20px 0;
                            font-weight: 600;
                            box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
                        }
                        .button:hover {
                            box-shadow: 0 6px 8px rgba(102, 126, 234, 0.4);
                        }
                        .viewer-info {
                            background: #f3f4f6;
                            padding: 15px;
                            border-radius: 4px;
                            margin-top: 20px;
                            font-size: 13px;
                            color: #6b7280;
                        }
                        .footer { 
                            text-align: center; 
                            padding: 20px; 
                            background: #f9fafb;
                            color: #6b7280; 
                            font-size: 13px;
                            border-top: 1px solid #e5e7eb;
                        }
                        .footer p {
                            margin: 5px 0;
                        }
                        @media only screen and (max-width: 600px) {
                            .container {
                                margin: 0;
                                border-radius: 0;
                            }
                            .content {
                                padding: 20px 15px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h2>🏠 PropertyDealz.in</h2>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Property View Alert</p>
                        </div>
                        
                        <div class="content">
                            <div class="alert-badge">
                                🔔 NEW PROPERTY VIEW
                            </div>
                            
                            <p style="font-size: 16px; color: #1f2937; margin-bottom: 20px;">
                                A guest has just viewed a property on your platform!
                            </p>
                            
                            <div class="property-card">
                                <h3>📋 Property Details</h3>
                                <div class="detail-row">
                                    <span class="label">Property ID:</span>
                                    <span class="value">#%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Title:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Location:</span>
                                    <span class="value">%s, %s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Price:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Viewed At:</span>
                                    <span class="value">%s</span>
                                </div>
                            </div>
                            
                            <div class="property-card">
                                <h3>👤 Owner Information</h3>
                                <div class="detail-row">
                                    <span class="label">Name:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Phone:</span>
                                    <span class="value">%s</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Email:</span>
                                    <span class="value">%s</span>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="%s" class="button">View Property Details →</a>
                            </div>
                            
                            <div class="viewer-info">
                                <strong>🌐 Visitor Information</strong><br>
                                IP Address: %s<br>
                                Device: %s
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p><strong>PropertyDealz.in</strong> - Your Trusted Real Estate Platform</p>
                            <p>© 2025 PropertyDealz.in. All Rights Reserved.</p>
                            <p style="margin-top: 10px;">
                                This is an automated notification. Please do not reply to this email.
                            </p>
                        </div>
                    </div>
                </body>
                </html>
                """,
                data.getPropertyId(),
                data.getPropertyTitle(),
                data.getPropertyArea() != null ? data.getPropertyArea() : "N/A",
                data.getPropertyCity(),
                data.getPropertyPrice(),
                data.getViewedAt(),
                data.getOwnerName() != null ? data.getOwnerName() : "N/A",
                data.getOwnerPhone() != null ? data.getOwnerPhone() : "N/A",
                data.getOwnerEmail() != null ? data.getOwnerEmail() : "N/A",
                data.getPropertyUrl(),
                data.getGuestIp() != null ? data.getGuestIp() : "Unknown",
                data.getGuestDevice() != null ? data.getGuestDevice() : "Unknown"
        );
    }

    /**
     * Build plain text email body
     */
    private String buildEmailText(PropertyViewNotificationDTO data) {
        return String.format("""
                PropertyDealz.in - Property View Alert
                =====================================
                
                🔔 A guest has just viewed a property!
                
                📋 PROPERTY DETAILS
                -------------------
                Property ID: #%s
                Title: %s
                Location: %s, %s
                Price: %s
                Viewed At: %s
                
                👤 OWNER INFORMATION
                --------------------
                Name: %s
                Phone: %s
                Email: %s
                
                🔗 View Property:
                %s
                
                🌐 VISITOR INFORMATION
                ----------------------
                IP Address: %s
                Device: %s
                
                ---
                © 2025 PropertyDealz.in - Your Trusted Real Estate Platform
                This is an automated notification. Please do not reply.
                """,
                data.getPropertyId(),
                data.getPropertyTitle(),
                data.getPropertyArea() != null ? data.getPropertyArea() : "N/A",
                data.getPropertyCity(),
                data.getPropertyPrice(),
                data.getViewedAt(),
                data.getOwnerName() != null ? data.getOwnerName() : "N/A",
                data.getOwnerPhone() != null ? data.getOwnerPhone() : "N/A",
                data.getOwnerEmail() != null ? data.getOwnerEmail() : "N/A",
                data.getPropertyUrl(),
                data.getGuestIp() != null ? data.getGuestIp() : "Unknown",
                data.getGuestDevice() != null ? data.getGuestDevice() : "Unknown"
        );
    }

    /**
     * Build WhatsApp message
     */
    private String buildWhatsAppMessage(PropertyViewNotificationDTO data) {
        return String.format("""
                🏠 *PropertyDealz.in*
                🔔 *Property View Alert*
                
                A guest just viewed a property!
                
                📋 *Property Details*
                • ID: #%s
                • Title: %s
                • Location: %s, %s
                • Price: %s
                • Viewed: %s
                
                👤 *Owner Info*
                • Name: %s
                • Phone: %s
                
                🔗 View: %s
                
                _PropertyDealz.in - Your Real Estate Partner_
                """,
                data.getPropertyId(),
                data.getPropertyTitle(),
                data.getPropertyArea() != null ? data.getPropertyArea() : "N/A",
                data.getPropertyCity(),
                data.getPropertyPrice(),
                data.getViewedAt(),
                data.getOwnerName() != null ? data.getOwnerName() : "N/A",
                data.getOwnerPhone() != null ? data.getOwnerPhone() : "N/A",
                data.getPropertyUrl()
        );
    }

    /**
     * Add configured admin emails and phones from application.properties
     */
    private void addConfiguredAdmins(List<User> recipients) {
        // Add admin emails
        if (adminEmails != null && !adminEmails.isEmpty()) {
            Arrays.stream(adminEmails.split(","))
                    .map(String::trim)
                    .filter(email -> !email.isEmpty())
                    .forEach(email -> {
                        User admin = new User();
                        admin.setEmail(email);
                        admin.setRole(User.UserRole.ADMIN);
                        recipients.add(admin);
                    });
        }

        // Add admin phones
        if (adminPhones != null && !adminPhones.isEmpty()) {
            Arrays.stream(adminPhones.split(","))
                    .map(String::trim)
                    .filter(phone -> !phone.isEmpty())
                    .forEach(phone -> {
                        User admin = new User();
                        admin.setMobileNumber(phone);
                        admin.setRole(User.UserRole.ADMIN);
                        recipients.add(admin);
                    });
        }
    }
}