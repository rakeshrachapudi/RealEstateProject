package com.example.realestate.service;

import com.example.realestate.model.Property;
import com.example.realestate.model.PropertyViewTracking;
import com.example.realestate.model.User;
import com.example.realestate.repository.PropertyRepository;
import com.example.realestate.repository.PropertyViewTrackingRepository;
import com.example.realestate.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Scheduler service for batch processing property view notifications.
 * Runs based on configured cron expression (default: every 6 hours at 00:00, 06:00, 12:00, 18:00 IST)
 *
 * Sends notifications to:
 * 1. Admin - Summary of all buyer views for each property
 * 2. Seller/Broker - Notification for their properties (property owner)
 * 3. Buyer - Individual thank-you email with AGENT contact details (not owner)
 */
@Service
public class PropertyNotificationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(PropertyNotificationScheduler.class);

    @Autowired
    private PropertyViewTrackingRepository viewTrackingRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AgentService agentService;

    @Autowired
    private SESService sesService;

    @Autowired
    private WhatsAppCloudService whatsAppService;

    @Value("${notification.enabled:true}")
    private boolean notificationEnabled;

    @Value("${notification.scheduler.enabled:true}")
    private boolean schedulerEnabled;

    @Value("${notification.buyer.enabled:true}")
    private boolean buyerNotificationEnabled;

    @Value("${notification.admins.emails:}")
    private String adminEmailsConfig;

    @Value("${notification.admins.phones:}")
    private String adminPhonesConfig;

    @Scheduled(cron = "${notification.scheduler.cron:0 0 0,6,12,18 * * *}")
    @Transactional
    public void sendBatchNotifications() {
        if (!notificationEnabled || !schedulerEnabled) {
            logger.info("⏸️ Notification scheduler is disabled");
            return;
        }

        logger.info("🔔 Starting batch notification process...");

        try {
            // Get all pending BUYER views (only buyers are saved)
            List<PropertyViewTracking> pendingViews = viewTrackingRepository.findByNotificationSentFalse();

            if (pendingViews.isEmpty()) {
                logger.info("✅ No pending buyer views to process");
                return;
            }

            logger.info("📊 Found {} pending buyer view(s)", pendingViews.size());

            // ✅ GROUP BY PROPERTY (not by buyer)
            Map<Long, List<PropertyViewTracking>> viewsByProperty = pendingViews.stream()
                    .collect(Collectors.groupingBy(PropertyViewTracking::getPropertyId));

            logger.info("🏠 Grouped into {} unique propert(y/ies)", viewsByProperty.size());

            int adminEmailsSent = 0;
            int sellerEmailsSent = 0;
            int buyerEmailsSent = 0;
            List<Long> processedIds = new ArrayList<>();

            // Process each property
            for (Map.Entry<Long, List<PropertyViewTracking>> entry : viewsByProperty.entrySet()) {
                Long propertyId = entry.getKey();
                List<PropertyViewTracking> buyerViews = entry.getValue();

                logger.info("🏠 Processing Property ID: {} - {} buyer view(s)",
                        propertyId, buyerViews.size());

                try {
                    // Fetch property details
                    Optional<Property> propertyOpt = propertyRepository.findById(propertyId);
                    if (!propertyOpt.isPresent()) {
                        logger.warn("⚠️ Property not found: {} - Skipping", propertyId);
                        continue;
                    }

                    Property property = propertyOpt.get();
                    User owner = property.getUser();

                    // === 1. SEND TO ADMIN ===
                    List<String> adminEmails = getAdminEmails();
                    for (String adminEmail : adminEmails) {
                        try {
                            sendAdminSummaryEmail(adminEmail, property, buyerViews);
                            adminEmailsSent++;
                        } catch (Exception e) {
                            logger.error("❌ Failed to send admin email to {}", adminEmail, e);
                        }
                    }

                    // === 2. SEND TO SELLER/BROKER (property owner) ===
                    if (owner != null && owner.getEmail() != null && !owner.getEmail().isEmpty()) {
                        try {
                            sendSellerNotificationEmail(owner.getEmail(), property, buyerViews);
                            sellerEmailsSent++;
                        } catch (Exception e) {
                            logger.error("❌ Failed to send seller email to {}", owner.getEmail(), e);
                        }
                    }

                    // === 3. SEND INDIVIDUAL THANK-YOU TO EACH BUYER (with AGENT details) ===
                    if (buyerNotificationEnabled) {
                        for (PropertyViewTracking view : buyerViews) {
                            if (view.getBuyerEmail() != null && !view.getBuyerEmail().isEmpty()) {
                                try {
                                    sendBuyerThankYouEmail(view.getBuyerEmail(), property, view);
                                    buyerEmailsSent++;
                                } catch (Exception e) {
                                    logger.error("❌ Failed to send buyer email to {}",
                                            view.getBuyerEmail(), e);
                                }
                            }
                        }
                    }

                    // Mark all views for this property as notified
                    buyerViews.forEach(view -> {
                        view.setNotificationSent(true);
                        view.setNotificationSentAt(LocalDateTime.now());
                        processedIds.add(view.getId());
                    });

                } catch (Exception e) {
                    logger.error("❌ Error processing property {}: {}", propertyId, e.getMessage(), e);
                }
            }

            // Save all as notified
            viewTrackingRepository.saveAll(pendingViews);

            logger.info("✅ Batch notification complete:");
            logger.info("   📧 Admin emails: {}", adminEmailsSent);
            logger.info("   📧 Seller/Broker emails: {}", sellerEmailsSent);
            logger.info("   📧 Buyer thank-you emails: {}", buyerEmailsSent);
            logger.info("   ✓ Processed view IDs: {}", processedIds.size());

        } catch (Exception e) {
            logger.error("❌ Error in batch notification process: {}", e.getMessage(), e);
        }
    }

    // ========== EMAIL TEMPLATES ==========

    /**
     * ADMIN TEMPLATE - Summary of all buyer views for the property
     */
    private void sendAdminSummaryEmail(String adminEmail, Property property,
                                       List<PropertyViewTracking> buyerViews) {
        String subject = String.format("🏠 [ADMIN] %d Buyer(s) Viewed Property #%d",
                buyerViews.size(), property.getId());

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append("body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}");
        html.append(".container{max-width:700px;margin:0 auto;padding:20px;}");
        html.append(".header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);");
        html.append("color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0;}");
        html.append(".content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px;}");
        html.append(".property-box{background:#fff3e0;padding:20px;border-radius:8px;margin-bottom:20px;");
        html.append("border-left:4px solid #ff9800;}");
        html.append(".buyer-table{width:100%;border-collapse:collapse;margin:20px 0;}");
        html.append(".buyer-table th{background:#667eea;color:white;padding:12px;text-align:left;}");
        html.append(".buyer-table td{background:white;padding:12px;border-bottom:1px solid #ddd;}");
        html.append(".footer{text-align:center;padding:20px;color:#999;font-size:12px;}");
        html.append("</style></head><body>");

        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>📊 Admin: Buyer Interest Report</h1>");
        html.append("<p>Property received ").append(buyerViews.size()).append(" buyer view(s)</p>");
        html.append("</div>");

        html.append("<div class='content'>");
        html.append("<div class='property-box'>");
        html.append("<h2>🏠 Property Details</h2>");
        html.append("<p><strong>ID:</strong> #").append(property.getId()).append("</p>");
        html.append("<p><strong>Title:</strong> ").append(property.getTitle()).append("</p>");
        html.append("<p><strong>Location:</strong> ");
        if (property.getArea() != null) {
            html.append(property.getArea().getAreaName());
        }
        html.append(", ").append(property.getCity()).append("</p>");
        html.append("<p><strong>Owner:</strong> ");
        if (property.getUser() != null) {
            html.append(property.getUser().getFirstName()).append(" ")
                    .append(property.getUser().getLastName());
        }
        html.append("</p>");
        html.append("</div>");

        html.append("<h3>👥 Buyer Details (").append(buyerViews.size()).append(" viewer(s))</h3>");
        html.append("<table class='buyer-table'>");
        html.append("<tr><th>Name</th><th>Mobile</th><th>Email</th><th>Viewed At</th></tr>");

        for (PropertyViewTracking view : buyerViews) {
            html.append("<tr>");
            html.append("<td>").append(view.getBuyerName()).append("</td>");
            html.append("<td>").append(view.getBuyerMobile()).append("</td>");
            html.append("<td>").append(view.getBuyerEmail()).append("</td>");
            html.append("<td>").append(view.getViewedAt().format(
                    DateTimeFormatter.ofPattern("dd-MMM-yyyy HH:mm"))).append("</td>");
            html.append("</tr>");
        }

        html.append("</table>");
        html.append("</div>");
        html.append("<div class='footer'><p>PropertyDealz.in - Admin Dashboard</p></div>");
        html.append("</div></body></html>");

        sesService.sendEmail(adminEmail, subject, html.toString(),
                "Admin Report: " + buyerViews.size() + " buyer(s) viewed property #" + property.getId());
    }

    /**
     * SELLER/BROKER TEMPLATE - Notification for their property
     */
    private void sendSellerNotificationEmail(String sellerEmail, Property property,
                                             List<PropertyViewTracking> buyerViews) {
        String subject = String.format("🎉 Great News! %d Buyer(s) Viewed Your Property",
                buyerViews.size());

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append("body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}");
        html.append(".container{max-width:700px;margin:0 auto;padding:20px;}");
        html.append(".header{background:linear-gradient(135deg,#f59e0b 0%,#d97706 100%);");
        html.append("color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0;}");
        html.append(".content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px;}");
        html.append(".success-box{background:#fef3c7;padding:20px;border-radius:8px;margin:15px 0;");
        html.append("border-left:4px solid #f59e0b;}");
        html.append(".stats{background:white;padding:20px;border-radius:8px;margin:15px 0;}");
        html.append(".buyer-card{background:#e0f2fe;padding:15px;border-radius:8px;margin:10px 0;");
        html.append("border-left:4px solid #0ea5e9;}");
        html.append("</style></head><body>");

        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>🎉 Buyer Interest Alert!</h1>");
        html.append("<p>Your property is generating interest</p>");
        html.append("</div>");

        html.append("<div class='content'>");
        html.append("<div class='success-box'>");
        html.append("<h2>📊 Property Performance</h2>");
        html.append("<p style='font-size:24px;font-weight:bold;color:#d97706;margin:10px 0;'>");
        html.append(buyerViews.size()).append(" Buyer View(s)</p>");
        html.append("<p>in the recent period</p>");
        html.append("</div>");

        html.append("<div class='stats'>");
        html.append("<h3>🏠 Your Property</h3>");
        html.append("<p><strong>").append(property.getTitle()).append("</strong></p>");
        html.append("<p>📍 ");
        if (property.getArea() != null) {
            html.append(property.getArea().getAreaName()).append(", ");
        }
        html.append(property.getCity()).append("</p>");
        html.append("</div>");

        html.append("<h3>👥 Interested Buyers (").append(buyerViews.size()).append(")</h3>");
        for (PropertyViewTracking view : buyerViews) {
            html.append("<div class='buyer-card'>");
            html.append("<p><strong>").append(view.getBuyerName()).append("</strong></p>");
            html.append("<p>📱 ").append(view.getBuyerMobile()).append("</p>");
            html.append("<p>📧 ").append(view.getBuyerEmail()).append("</p>");
            html.append("<p style='color:#6b7280;font-size:14px;'>Viewed: ")
                    .append(view.getViewedAt().format(DateTimeFormatter.ofPattern("dd-MMM HH:mm")))
                    .append("</p>");
            html.append("</div>");
        }

        html.append("<p style='margin-top:20px;color:#6b7280;'>Our agents will follow up with these buyers. ");
        html.append("You can also contact them directly if you prefer. PropertyDealz.in team is here to help!</p>");
        html.append("</div>");
        html.append("<div style='text-align:center;padding:20px;color:#999;font-size:12px;'>");
        html.append("<p>PropertyDealz.in - Seller Dashboard</p></div>");
        html.append("</div></body></html>");

        sesService.sendEmail(sellerEmail, subject, html.toString(),
                "Seller Update: " + buyerViews.size() + " buyer(s) viewed your property");
    }

    /**
     * BUYER TEMPLATE - Thank-you email with AGENT contact details (NOT owner details)
     */
    private void sendBuyerThankYouEmail(String buyerEmail, Property property,
                                        PropertyViewTracking view) {
        String subject = "Thank you for viewing " + property.getTitle();

        // ✅ GET AGENT FOR THIS PROPERTY (using AgentService)
        User assignedAgent = agentService.getAgentForProperty(property.getId());

        // Fallback to random agent if getAgentForProperty returns null
        if (assignedAgent == null) {
            Optional<User> randomAgentOpt = agentService.getRandomAgent();
            assignedAgent = randomAgentOpt.orElse(null);
        }

        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append("body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}");
        html.append(".container{max-width:700px;margin:0 auto;padding:20px;}");
        html.append(".header{background:linear-gradient(135deg,#3b82f6 0%,#2563eb 100%);");
        html.append("color:white;padding:30px;text-align:center;border-radius:10px 10px 0 0;}");
        html.append(".content{background:#f9f9f9;padding:30px;border-radius:0 0 10px 10px;}");
        html.append(".property-card{background:white;padding:20px;border-radius:8px;margin:15px 0;}");
        html.append(".contact-box{background:#dbeafe;padding:20px;border-radius:8px;margin:15px 0;");
        html.append("border-left:4px solid #3b82f6;}");
        html.append(".btn{background:#3b82f6;color:white;padding:12px 24px;text-decoration:none;");
        html.append("border-radius:8px;display:inline-block;margin:10px 0;}");
        html.append(".agent-highlight{background:#10b981;color:white;padding:3px 8px;border-radius:4px;");
        html.append("font-size:12px;font-weight:bold;}");
        html.append("</style></head><body>");

        html.append("<div class='container'>");
        html.append("<div class='header'>");
        html.append("<h1>🏠 Thank You for Your Interest!</h1>");
        html.append("<p>We're here to help you find your perfect property</p>");
        html.append("</div>");

        html.append("<div class='content'>");
        html.append("<p>Hi <strong>").append(view.getBuyerName()).append("</strong>,</p>");
        html.append("<p>Thank you for viewing this property on PropertyDealz.in!</p>");

        html.append("<div class='property-card'>");
        html.append("<h3>").append(property.getTitle()).append("</h3>");
        html.append("<p>📍 ");
        if (property.getArea() != null) {
            html.append(property.getArea().getAreaName()).append(", ");
        }
        html.append(property.getCity()).append("</p>");
        html.append("<p>💰 ").append(view.getPropertyPrice()).append("</p>");
        html.append("<a href='").append(view.getPropertyUrl()).append("' class='btn'>");
        html.append("View Full Details</a>");
        html.append("</div>");

        html.append("<div class='contact-box'>");
        html.append("<h3>📞 Ready to Take the Next Step?</h3>");

        if (assignedAgent != null) {
            // ✅ Show AGENT contact details
            html.append("<p><span class='agent-highlight'>YOUR AGENT</span></p>");
            html.append("<p><strong>Contact Your Dedicated Agent:</strong></p>");
            html.append("<p>👤 <strong>").append(assignedAgent.getFirstName()).append(" ")
                    .append(assignedAgent.getLastName()).append("</strong></p>");

            if (assignedAgent.getMobileNumber() != null && !assignedAgent.getMobileNumber().isEmpty()) {
                html.append("<p>📱 <strong>").append(assignedAgent.getMobileNumber()).append("</strong></p>");
            }

            if (assignedAgent.getEmail() != null && !assignedAgent.getEmail().isEmpty()) {
                html.append("<p>📧 ").append(assignedAgent.getEmail()).append("</p>");
            }

            html.append("<p style='margin-top:15px;color:#6b7280;font-size:14px;'>");
            html.append("Your agent will help you schedule a visit, answer questions, and guide you through the buying process.</p>");
        } else {
            // Fallback if no agent available
            html.append("<p><strong>Contact PropertyDealz.in Support:</strong></p>");
            html.append("<p>📧 support@propertydealz.in</p>");
            html.append("<p style='color:#6b7280;'>Our team will assign an agent to assist you shortly.</p>");
        }

        html.append("</div>");

        html.append("<p style='margin-top:20px;'>Schedule a visit or ask any questions - ");
        html.append("we're here to help!</p>");
        html.append("</div>");
        html.append("<div style='text-align:center;padding:20px;color:#999;font-size:12px;'>");
        html.append("<p>PropertyDealz.in - Your Property Search Partner</p></div>");
        html.append("</div></body></html>");

        sesService.sendEmail(buyerEmail, subject, html.toString(),
                "Thank you for viewing " + property.getTitle());

        logger.info("✅ Buyer email sent with agent details - Agent: {}",
                assignedAgent != null ? assignedAgent.getFirstName() : "None");
    }

    // ========== HELPER METHODS ==========

    private List<String> getAdminEmails() {
        Set<String> emails = new HashSet<>();

        try {
            List<User> admins = userRepository.findByRole(User.UserRole.ADMIN);
            admins.stream()
                    .filter(u -> u.getEmail() != null && !u.getEmail().isEmpty())
                    .forEach(u -> emails.add(u.getEmail()));
        } catch (Exception e) {
            logger.warn("Could not fetch admins: {}", e.getMessage());
        }

        if (adminEmailsConfig != null && !adminEmailsConfig.isEmpty()) {
            Arrays.stream(adminEmailsConfig.split(","))
                    .map(String::trim)
                    .filter(e -> !e.isEmpty())
                    .forEach(emails::add);
        }

        return new ArrayList<>(emails);
    }

    /**
     * Manual trigger for testing.
     */
    public void triggerManualNotification() {
        logger.info("🔔 Manual notification trigger");
        sendBatchNotifications();
    }
}