package com.example.realestate.service;

import com.example.realestate.model.PropertyViewTracking;
import com.example.realestate.model.User;
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
 * Sends notifications to:
 * 1. Agents/Admins - About buyer interest in properties
 * 2. Buyers - Reminders about properties they viewed
 */
@Service
public class PropertyNotificationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(PropertyNotificationScheduler.class);

    @Autowired
    private PropertyViewTrackingRepository viewTrackingRepository;

    @Autowired
    private UserRepository userRepository;

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

    @Value("${notification.batch.maxPropertiesPerEmail:10}")
    private int maxPropertiesPerEmail;


    @Scheduled(cron = "${notification.scheduler.cron:0 0 */6 * * *}")
    @Transactional
    public void sendBatchNotifications() {
        if (!notificationEnabled || !schedulerEnabled) {
            logger.info("⏸️ Notification scheduler is disabled");
            return;
        }

        logger.info("🔔 Starting batch notification process...");

        try {
            // Get all pending notifications
            List<PropertyViewTracking> pendingViews = viewTrackingRepository.findByNotificationSentFalse();

            if (pendingViews.isEmpty()) {
                logger.info("✅ No pending notifications to send");
                return;
            }

            logger.info("📊 Found {} pending property view(s)", pendingViews.size());

            // Filter to only buyers (ignore seller/broker views)
            List<PropertyViewTracking> buyerViews = pendingViews.stream()
                    .filter(v -> "buyer".equals(v.getUserType()))
                    .collect(Collectors.toList());

            if (buyerViews.isEmpty()) {
                logger.info("ℹ️ All pending views are from sellers/brokers - marking as processed");
                pendingViews.forEach(v -> {
                    v.setNotificationSent(true);
                    v.setNotificationSentAt(LocalDateTime.now());
                });
                viewTrackingRepository.saveAll(pendingViews);
                return;
            }

            logger.info("🎯 Processing {} buyer view(s)", buyerViews.size());

            // Group views by buyer
            Map<Long, List<PropertyViewTracking>> viewsByBuyer = buyerViews.stream()
                    .collect(Collectors.groupingBy(PropertyViewTracking::getBuyerId));

            logger.info("👥 Grouped into {} unique buyer(s)", viewsByBuyer.size());

            int agentEmailsSent = 0;
            int agentWhatsappSent = 0;
            int buyerEmailsSent = 0;
            int buyerWhatsappSent = 0;
            List<Long> processedIds = new ArrayList<>();

            // Process each buyer
            for (Map.Entry<Long, List<PropertyViewTracking>> entry : viewsByBuyer.entrySet()) {
                Long buyerId = entry.getKey();
                List<PropertyViewTracking> buyerPropertyViews = entry.getValue();

                try {
                    // 1. Send notifications to AGENTS/ADMINS about this buyer's interest
                    List<String> agentEmails = getRecipientEmails();
                    List<String> agentPhones = getRecipientPhones();

                    logger.info("📧 Sending to agents/admins: {} emails, {} phones",
                            agentEmails.size(), agentPhones.size());

                    // Send emails to agents/admins
                    for (String email : agentEmails) {
                        try {
                            sendAgentInterestEmail(email, buyerPropertyViews);
                            agentEmailsSent++;
                        } catch (Exception e) {
                            logger.error("❌ Failed to send email to agent {}", email, e);
                        }
                    }

                    // Send WhatsApp to agents/admins
                    for (String phone : agentPhones) {
                        try {
                            sendAgentInterestWhatsApp(phone, buyerPropertyViews);
                            agentWhatsappSent++;
                        } catch (Exception e) {
                            logger.error("❌ Failed to send WhatsApp to agent {}", phone, e);
                        }
                    }

                    // 2. Send REMINDER to BUYER about properties they viewed
                    if (buyerNotificationEnabled) {
                        PropertyViewTracking firstView = buyerPropertyViews.get(0);
                        String buyerEmail = firstView.getBuyerEmail();
                        String buyerMobile = firstView.getBuyerMobile();

                        logger.info("📨 Sending reminder to buyer: {} ({})",
                                firstView.getBuyerName(), buyerEmail);

                        // Send email reminder to buyer
                        if (buyerEmail != null && !buyerEmail.isEmpty()) {
                            try {
                                sendBuyerReminderEmail(buyerEmail, buyerPropertyViews);
                                buyerEmailsSent++;
                            } catch (Exception e) {
                                logger.error("❌ Failed to send email to buyer {}", buyerEmail, e);
                            }
                        }

                        // Send WhatsApp reminder to buyer
                        if (buyerMobile != null && !buyerMobile.isEmpty()) {
                            try {
                                sendBuyerReminderWhatsApp(buyerMobile, buyerPropertyViews);
                                buyerWhatsappSent++;
                            } catch (Exception e) {
                                logger.error("❌ Failed to send WhatsApp to buyer {}", buyerMobile, e);
                            }
                        }
                    }

                    // Mark as notified
                    buyerPropertyViews.forEach(view -> {
                        view.setNotificationSent(true);
                        view.setNotificationSentAt(LocalDateTime.now());
                        processedIds.add(view.getId());
                    });

                } catch (Exception e) {
                    logger.error("❌ Error processing buyer {}", buyerId, e);
                }
            }

            // Save all updates
            if (!processedIds.isEmpty()) {
                List<PropertyViewTracking> toUpdate = viewTrackingRepository.findAllById(processedIds);
                viewTrackingRepository.saveAll(toUpdate);
                logger.info("✅ Marked {} view(s) as notified", processedIds.size());
            }

            logger.info("✅ Batch notification complete:");
            logger.info("   📧 Agent emails: {}, Agent WhatsApp: {}", agentEmailsSent, agentWhatsappSent);
            logger.info("   📨 Buyer emails: {}, Buyer WhatsApp: {}", buyerEmailsSent, buyerWhatsappSent);

        } catch (Exception e) {
            logger.error("❌ Error in batch notification process", e);
        }
    }

    /**
     * Send email to AGENT/ADMIN about buyer interest.
     */
    private void sendAgentInterestEmail(String recipientEmail, List<PropertyViewTracking> views) {
        if (views.isEmpty()) return;

        PropertyViewTracking firstView = views.get(0);
        String buyerName = firstView.getBuyerName();
        String buyerEmail = firstView.getBuyerEmail();
        String buyerMobile = firstView.getBuyerMobile();

        List<PropertyViewTracking> limitedViews = views.stream()
                .limit(maxPropertiesPerEmail)
                .collect(Collectors.toList());

        String subject = String.format("🎯 New Buyer Interest - %s viewed %d propert%s",
                buyerName, views.size(), views.size() == 1 ? "y" : "ies");

        String htmlBody = buildAgentEmailHtml(buyerName, buyerEmail, buyerMobile, limitedViews);
        String textBody = buildAgentEmailText(buyerName, buyerEmail, buyerMobile, limitedViews);

        sesService.sendEmail(recipientEmail, subject, htmlBody, textBody);
    }

    /**
     * Send WhatsApp to AGENT/ADMIN about buyer interest.
     */
    private void sendAgentInterestWhatsApp(String recipientPhone, List<PropertyViewTracking> views) {
        if (views.isEmpty()) return;

        PropertyViewTracking firstView = views.get(0);
        String message = buildAgentWhatsAppMessage(
                firstView.getBuyerName(),
                firstView.getBuyerEmail(),
                firstView.getBuyerMobile(),
                views
        );

        whatsAppService.sendTextMessage(recipientPhone, message);
    }

    /**
     * Send REMINDER email to BUYER about properties they viewed.
     */
    private void sendBuyerReminderEmail(String buyerEmail, List<PropertyViewTracking> views) {
        if (views.isEmpty()) return;

        PropertyViewTracking firstView = views.get(0);
        String buyerName = firstView.getBuyerName();

        List<PropertyViewTracking> limitedViews = views.stream()
                .limit(maxPropertiesPerEmail)
                .collect(Collectors.toList());

        String subject = views.size() == 1
                ? "🏠 Property You Viewed - " + limitedViews.get(0).getPropertyTitle()
                : String.format("🏠 %d Properties You Viewed - Still Interested?", views.size());

        String htmlBody = buildBuyerReminderEmailHtml(buyerName, limitedViews);
        String textBody = buildBuyerReminderEmailText(buyerName, limitedViews);

        sesService.sendEmail(buyerEmail, subject, htmlBody, textBody);
    }

    /**
     * Send REMINDER WhatsApp to BUYER about properties they viewed.
     */
    private void sendBuyerReminderWhatsApp(String buyerMobile, List<PropertyViewTracking> views) {
        if (views.isEmpty()) return;

        PropertyViewTracking firstView = views.get(0);
        String message = buildBuyerReminderWhatsAppMessage(firstView.getBuyerName(), views);

        whatsAppService.sendTextMessage(buyerMobile, message);
    }

    // ========== AGENT EMAIL TEMPLATES ==========

    private String buildAgentEmailHtml(String buyerName, String buyerEmail, String buyerMobile,
                                       List<PropertyViewTracking> views) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append("body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}");
        html.append(".header{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);");
        html.append("color:#fff;padding:20px;text-align:center;}");
        html.append(".content{padding:20px;background:#fff;}");
        html.append(".buyer-info{background:#eff6ff;padding:15px;border-radius:8px;margin:15px 0;}");
        html.append(".property-item{background:#f9fafb;padding:15px;border-radius:8px;margin:10px 0;");
        html.append("border-left:4px solid #fb923c;}");
        html.append(".btn{display:inline-block;background:#10b981;color:#fff;");
        html.append("padding:10px 20px;text-decoration:none;border-radius:5px;margin-top:10px;}");
        html.append(".footer{text-align:center;padding:20px;color:#6b7280;font-size:12px;}");
        html.append("</style></head><body>");

        html.append("<div class='header'>");
        html.append("<h2>🎯 New Buyer Interest Alert!</h2>");
        html.append("</div>");

        html.append("<div class='content'>");

        html.append("<div class='buyer-info'>");
        html.append("<h3 style='color:#1e40af;margin-top:0;'>👤 Buyer Information</h3>");
        html.append("<p><strong>Name:</strong> ").append(buyerName).append("</p>");
        html.append("<p><strong>Mobile:</strong> ").append(buyerMobile).append("</p>");
        html.append("<p><strong>Email:</strong> ").append(buyerEmail).append("</p>");
        html.append("</div>");

        html.append("<h3 style='color:#92400e;'>🏠 Properties Viewed (")
                .append(views.size()).append(")</h3>");

        for (int i = 0; i < views.size(); i++) {
            PropertyViewTracking view = views.get(i);
            html.append("<div class='property-item'>");
            html.append("<h4 style='margin:0 0 8px 0;color:#1f2937;'>")
                    .append(i + 1).append(". ").append(view.getPropertyTitle()).append("</h4>");
            html.append("<p style='margin:5px 0;'><strong>ID:</strong> #").append(view.getPropertyId()).append("</p>");
            html.append("<p style='margin:5px 0;'><strong>Location:</strong> ")
                    .append(view.getPropertyArea()).append(", ").append(view.getPropertyCity()).append("</p>");
            html.append("<p style='margin:5px 0;'><strong>Price:</strong> ")
                    .append(view.getPropertyPrice()).append("</p>");
            html.append("<p style='margin:5px 0;'><strong>Viewed:</strong> ")
                    .append(view.getViewedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")))
                    .append("</p>");

            if (view.getOwnerName() != null) {
                html.append("<p style='margin:5px 0;'><strong>Owner:</strong> ")
                        .append(view.getOwnerName());
                if (view.getOwnerPhone() != null && !view.getOwnerPhone().isEmpty()) {
                    html.append(" | ").append(view.getOwnerPhone());
                }
                html.append("</p>");
            }

            html.append("<a href='").append(view.getPropertyUrl())
                    .append("' class='btn'>View Property</a>");
            html.append("</div>");
        }

        html.append("</div>");

        html.append("<div class='footer'>");
        html.append("<p>PropertyDealz.in - Automated Buyer Interest Notification</p>");
        html.append("</div>");

        html.append("</body></html>");
        return html.toString();
    }

    private String buildAgentEmailText(String buyerName, String buyerEmail, String buyerMobile,
                                       List<PropertyViewTracking> views) {
        StringBuilder text = new StringBuilder();
        text.append("NEW BUYER INTEREST ALERT!\n\n");
        text.append("BUYER INFORMATION:\n");
        text.append("Name: ").append(buyerName).append("\n");
        text.append("Mobile: ").append(buyerMobile).append("\n");
        text.append("Email: ").append(buyerEmail).append("\n\n");
        text.append("PROPERTIES VIEWED (").append(views.size()).append("):\n\n");

        for (int i = 0; i < views.size(); i++) {
            PropertyViewTracking view = views.get(i);
            text.append((i + 1)).append(". ").append(view.getPropertyTitle()).append("\n");
            text.append("   ID: #").append(view.getPropertyId()).append("\n");
            text.append("   Location: ").append(view.getPropertyArea())
                    .append(", ").append(view.getPropertyCity()).append("\n");
            text.append("   Price: ").append(view.getPropertyPrice()).append("\n");
            text.append("   URL: ").append(view.getPropertyUrl()).append("\n\n");
        }

        text.append("---\nPropertyDealz.in\n");
        return text.toString();
    }

    private String buildAgentWhatsAppMessage(String buyerName, String buyerEmail, String buyerMobile,
                                             List<PropertyViewTracking> views) {
        StringBuilder msg = new StringBuilder();
        msg.append("🎯 *New Buyer Interest Alert!*\n\n");
        msg.append("👤 *Buyer Information:*\n");
        msg.append("• Name: ").append(buyerName).append("\n");
        msg.append("• Mobile: ").append(buyerMobile).append("\n");
        msg.append("• Email: ").append(buyerEmail).append("\n\n");
        msg.append("🏠 *Properties Viewed:* ").append(views.size()).append("\n\n");

        int limit = Math.min(views.size(), 3);
        for (int i = 0; i < limit; i++) {
            PropertyViewTracking view = views.get(i);
            msg.append((i + 1)).append(". *").append(view.getPropertyTitle()).append("*\n");
            msg.append("   📍 ").append(view.getPropertyArea()).append(", ").append(view.getPropertyCity()).append("\n");
            msg.append("   💰 ").append(view.getPropertyPrice()).append("\n");
            msg.append("   🔗 ").append(view.getPropertyUrl()).append("\n\n");
        }

        if (views.size() > 3) {
            msg.append("... and ").append(views.size() - 3).append(" more\n\n");
        }

        msg.append("---\nPropertyDealz.in");
        return msg.toString();
    }

    // ========== BUYER REMINDER TEMPLATES ==========

    private String buildBuyerReminderEmailHtml(String buyerName, List<PropertyViewTracking> views) {
        StringBuilder html = new StringBuilder();
        html.append("<!DOCTYPE html><html><head><style>");
        html.append("body{font-family:Arial,sans-serif;line-height:1.6;color:#333;}");
        html.append(".header{background:linear-gradient(135deg,#10b981 0%,#059669 100%);");
        html.append("color:#fff;padding:20px;text-align:center;}");
        html.append(".content{padding:20px;background:#fff;}");
        html.append(".greeting{background:#f0fdf4;padding:15px;border-radius:8px;margin:15px 0;}");
        html.append(".property-card{background:#fff;padding:15px;border-radius:8px;margin:10px 0;");
        html.append("border:2px solid #d1fae5;box-shadow:0 2px 4px rgba(0,0,0,0.1);}");
        html.append(".btn{display:inline-block;background:#10b981;color:#fff;");
        html.append("padding:12px 24px;text-decoration:none;border-radius:8px;margin:10px 5px;font-weight:bold;}");
        html.append(".cta{background:#fef3c7;padding:20px;border-radius:8px;text-align:center;margin:20px 0;}");
        html.append(".footer{text-align:center;padding:20px;color:#6b7280;font-size:12px;}");
        html.append("</style></head><body>");

        html.append("<div class='header'>");
        html.append("<h2>🏠 Your Property Interests</h2>");
        html.append("</div>");

        html.append("<div class='content'>");

        html.append("<div class='greeting'>");
        html.append("<p style='margin:0;font-size:16px;'>Hi <strong>").append(buyerName).append("</strong>,</p>");
        html.append("<p style='margin:10px 0 0 0;'>You recently viewed ")
                .append(views.size()).append(" propert").append(views.size() == 1 ? "y" : "ies")
                .append(" on PropertyDealz.in. Still interested? We wanted to remind you about ")
                .append(views.size() == 1 ? "it" : "them").append("!</p>");
        html.append("</div>");

        for (int i = 0; i < views.size(); i++) {
            PropertyViewTracking view = views.get(i);
            html.append("<div class='property-card'>");
            html.append("<h3 style='margin:0 0 10px 0;color:#059669;'>")
                    .append(view.getPropertyTitle()).append("</h3>");
            html.append("<p style='margin:5px 0;'><strong>📍 Location:</strong> ")
                    .append(view.getPropertyArea()).append(", ").append(view.getPropertyCity()).append("</p>");
            html.append("<p style='margin:5px 0;'><strong>💰 Price:</strong> ")
                    .append(view.getPropertyPrice()).append("</p>");

            if (view.getOwnerName() != null) {
                html.append("<p style='margin:5px 0;'><strong>👤 Owner:</strong> ")
                        .append(view.getOwnerName()).append("</p>");
            }

            html.append("<a href='").append(view.getPropertyUrl())
                    .append("' class='btn'>View Property Details</a>");
            html.append("</div>");
        }

        html.append("<div class='cta'>");
        html.append("<h3 style='margin:0 0 10px 0;color:#92400e;'>Ready to Take the Next Step?</h3>");
        html.append("<p style='margin:0 0 15px 0;'>Contact the property owner or schedule a visit today!</p>");
        html.append("<a href='https://propertydealz.in' class='btn'>Browse More Properties</a>");
        html.append("</div>");

        html.append("</div>");

        html.append("<div class='footer'>");
        html.append("<p>PropertyDealz.in - Your Property Search Partner</p>");
        html.append("<p style='font-size:11px;color:#9ca3af;'>You received this email because you viewed properties on our platform.</p>");
        html.append("</div>");

        html.append("</body></html>");
        return html.toString();
    }

    private String buildBuyerReminderEmailText(String buyerName, List<PropertyViewTracking> views) {
        StringBuilder text = new StringBuilder();
        text.append("Hi ").append(buyerName).append(",\n\n");
        text.append("You recently viewed ").append(views.size())
                .append(" propert").append(views.size() == 1 ? "y" : "ies")
                .append(" on PropertyDealz.in. Still interested?\n\n");
        text.append("YOUR VIEWED PROPERTIES:\n\n");

        for (int i = 0; i < views.size(); i++) {
            PropertyViewTracking view = views.get(i);
            text.append((i + 1)).append(". ").append(view.getPropertyTitle()).append("\n");
            text.append("   Location: ").append(view.getPropertyArea())
                    .append(", ").append(view.getPropertyCity()).append("\n");
            text.append("   Price: ").append(view.getPropertyPrice()).append("\n");
            text.append("   View: ").append(view.getPropertyUrl()).append("\n\n");
        }

        text.append("Ready to take the next step? Contact the owner or schedule a visit!\n\n");
        text.append("Browse more: https://propertydealz.in\n\n");
        text.append("---\nPropertyDealz.in - Your Property Search Partner\n");
        return text.toString();
    }

    private String buildBuyerReminderWhatsAppMessage(String buyerName, List<PropertyViewTracking> views) {
        StringBuilder msg = new StringBuilder();
        msg.append("🏠 *Your Property Interests*\n\n");
        msg.append("Hi *").append(buyerName).append("*! 👋\n\n");
        msg.append("You recently viewed ").append(views.size())
                .append(" propert").append(views.size() == 1 ? "y" : "ies")
                .append(". Still interested?\n\n");

        int limit = Math.min(views.size(), 5);
        for (int i = 0; i < limit; i++) {
            PropertyViewTracking view = views.get(i);
            msg.append("*").append(i + 1).append(". ").append(view.getPropertyTitle()).append("*\n");
            msg.append("📍 ").append(view.getPropertyArea()).append(", ").append(view.getPropertyCity()).append("\n");
            msg.append("💰 ").append(view.getPropertyPrice()).append("\n");
            msg.append("🔗 ").append(view.getPropertyUrl()).append("\n\n");
        }

        if (views.size() > 5) {
            msg.append("... and ").append(views.size() - 5).append(" more!\n\n");
        }

        msg.append("✨ Ready to take the next step?\n");
        msg.append("Contact the owner or schedule a visit!\n\n");
        msg.append("🔍 Browse more: https://propertydealz.in\n\n");
        msg.append("---\nPropertyDealz.in");
        return msg.toString();
    }

    // ========== RECIPIENT HELPERS ==========

    private List<String> getRecipientEmails() {
        Set<String> emails = new HashSet<>();

        try {
            List<User> agents = userRepository.findByRole(User.UserRole.AGENT);
            agents.stream()
                    .filter(u -> u.getEmail() != null && !u.getEmail().isEmpty())
                    .forEach(u -> emails.add(u.getEmail()));
        } catch (Exception e) {
            logger.warn("Could not fetch agents: {}", e.getMessage());
        }

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

    private List<String> getRecipientPhones() {
        Set<String> phones = new HashSet<>();

        try {
            List<User> agents = userRepository.findByRole(User.UserRole.AGENT);
            agents.stream()
                    .filter(u -> u.getMobileNumber() != null && !u.getMobileNumber().isEmpty())
                    .forEach(u -> phones.add(u.getMobileNumber()));
        } catch (Exception e) {
            logger.warn("Could not fetch agents: {}", e.getMessage());
        }

        try {
            List<User> admins = userRepository.findByRole(User.UserRole.ADMIN);
            admins.stream()
                    .filter(u -> u.getMobileNumber() != null && !u.getMobileNumber().isEmpty())
                    .forEach(u -> phones.add(u.getMobileNumber()));
        } catch (Exception e) {
            logger.warn("Could not fetch admins: {}", e.getMessage());
        }

        if (adminPhonesConfig != null && !adminPhonesConfig.isEmpty()) {
            Arrays.stream(adminPhonesConfig.split(","))
                    .map(String::trim)
                    .filter(p -> !p.isEmpty())
                    .forEach(phones::add);
        }

        return new ArrayList<>(phones);
    }

    /**
     * Manual trigger for testing.
     */
    public void triggerManualNotification() {
        logger.info("🔔 Manual notification trigger");
        sendBatchNotifications();
    }
}