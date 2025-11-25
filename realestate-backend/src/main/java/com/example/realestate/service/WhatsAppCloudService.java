package com.example.realestate.service;

import okhttp3.*;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class WhatsAppCloudService {

    private static final Logger logger = LoggerFactory.getLogger(WhatsAppCloudService.class);

    @Value("${whatsapp.api.url}")
    private String apiUrl;

    @Value("${whatsapp.phone.number.id}")
    private String phoneNumberId;

    @Value("${whatsapp.access.token}")
    private String accessToken;

    private OkHttpClient httpClient;

    @PostConstruct
    public void init() {
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build();

        logger.info("✅ WhatsApp Cloud API Service initialized");
        logger.info("   Phone Number ID: {}", maskId(phoneNumberId));
        logger.info("   API URL: {}", apiUrl);
    }

    /**
     * Send text message to single recipient
     */
    public boolean sendTextMessage(String toPhoneNumber, String message) {
        try {
            logger.info("📱 Sending WhatsApp to: {}", maskPhone(toPhoneNumber));

            String formattedNumber = formatPhoneNumber(toPhoneNumber);

            JSONObject payload = new JSONObject();
            payload.put("messaging_product", "whatsapp");
            payload.put("recipient_type", "individual");
            payload.put("to", formattedNumber);
            payload.put("type", "text");

            JSONObject text = new JSONObject();
            text.put("preview_url", false);
            text.put("body", message);
            payload.put("text", text);

            String url = String.format("%s/%s/messages", apiUrl, phoneNumberId);

            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(
                            payload.toString(),
                            MediaType.parse("application/json")
                    ))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "";

                if (response.isSuccessful()) {
                    JSONObject jsonResponse = new JSONObject(responseBody);
                    String messageId = jsonResponse.getJSONArray("messages")
                            .getJSONObject(0)
                            .getString("id");
                    logger.info("✅ WhatsApp sent successfully - Message ID: {}", messageId);
                    return true;
                } else {
                    logger.error("❌ WhatsApp API Error: {} - {}", response.code(), responseBody);
                    return false;
                }
            }

        } catch (Exception e) {
            logger.error("❌ Error sending WhatsApp to {}: {}", toPhoneNumber, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send template message (for business verification needed messages)
     */
    public boolean sendTemplateMessage(String toPhoneNumber, String templateName, JSONArray components) {
        try {
            logger.info("📱 Sending WhatsApp Template '{}' to: {}", templateName, maskPhone(toPhoneNumber));

            String formattedNumber = formatPhoneNumber(toPhoneNumber);

            JSONObject payload = new JSONObject();
            payload.put("messaging_product", "whatsapp");
            payload.put("to", formattedNumber);
            payload.put("type", "template");

            JSONObject template = new JSONObject();
            template.put("name", templateName);
            template.put("language", new JSONObject().put("code", "en"));
            if (components != null) {
                template.put("components", components);
            }
            payload.put("template", template);

            String url = String.format("%s/%s/messages", apiUrl, phoneNumberId);

            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(
                            payload.toString(),
                            MediaType.parse("application/json")
                    ))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "";

                if (response.isSuccessful()) {
                    logger.info("✅ WhatsApp template sent successfully");
                    return true;
                } else {
                    logger.error("❌ WhatsApp Template Error: {} - {}", response.code(), responseBody);
                    return false;
                }
            }

        } catch (Exception e) {
            logger.error("❌ Error sending WhatsApp template: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send message with button (Interactive message)
     */
    public boolean sendButtonMessage(String toPhoneNumber, String bodyText, List<String> buttons) {
        try {
            logger.info("📱 Sending WhatsApp Button Message to: {}", maskPhone(toPhoneNumber));

            String formattedNumber = formatPhoneNumber(toPhoneNumber);

            JSONObject payload = new JSONObject();
            payload.put("messaging_product", "whatsapp");
            payload.put("recipient_type", "individual");
            payload.put("to", formattedNumber);
            payload.put("type", "interactive");

            // Build interactive message
            JSONObject interactive = new JSONObject();
            interactive.put("type", "button");

            // Body
            JSONObject body = new JSONObject();
            body.put("text", bodyText);
            interactive.put("body", body);

            // Action (buttons)
            JSONObject action = new JSONObject();
            JSONArray buttonArray = new JSONArray();

            for (int i = 0; i < Math.min(buttons.size(), 3); i++) { // Max 3 buttons
                JSONObject button = new JSONObject();
                button.put("type", "reply");

                JSONObject reply = new JSONObject();
                reply.put("id", "btn_" + i);
                reply.put("title", buttons.get(i));
                button.put("reply", reply);

                buttonArray.put(button);
            }

            action.put("buttons", buttonArray);
            interactive.put("action", action);

            payload.put("interactive", interactive);

            String url = String.format("%s/%s/messages", apiUrl, phoneNumberId);

            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(
                            payload.toString(),
                            MediaType.parse("application/json")
                    ))
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                String responseBody = response.body() != null ? response.body().string() : "";

                if (response.isSuccessful()) {
                    logger.info("✅ WhatsApp button message sent successfully");
                    return true;
                } else {
                    logger.error("❌ WhatsApp Button Error: {} - {}", response.code(), responseBody);
                    return false;
                }
            }

        } catch (Exception e) {
            logger.error("❌ Error sending WhatsApp button message: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send bulk messages to multiple recipients
     */
    public void sendBulkMessages(List<String> phoneNumbers, String message) {
        logger.info("📱 Sending bulk WhatsApp to {} recipients", phoneNumbers.size());

        for (String phone : phoneNumbers) {
            try {
                sendTextMessage(phone, message);
                // Add delay to avoid rate limiting (20 messages per second limit)
                Thread.sleep(100);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                logger.error("❌ Interrupted while sending bulk WhatsApp");
                break;
            }
        }
    }

    /**
     * Format phone number (remove spaces, dashes, add country code)
     */
    private String formatPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.isEmpty()) {
            throw new IllegalArgumentException("Phone number cannot be empty");
        }

        // Remove spaces, dashes, parentheses
        phoneNumber = phoneNumber.replaceAll("[\\s\\-\\(\\)]", "");

        // Remove + if present
        phoneNumber = phoneNumber.replace("+", "");

        // Add country code for India if not present
        if (phoneNumber.length() == 10) {
            phoneNumber = "91" + phoneNumber;
        }

        return phoneNumber;
    }

    /**
     * Mask phone number for logging
     */
    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 6) return "****";
        return phone.substring(0, 4) + "****" + phone.substring(phone.length() - 2);
    }

    /**
     * Mask ID for logging
     */
    private String maskId(String id) {
        if (id == null || id.length() < 8) return "****";
        return id.substring(0, 4) + "****";
    }

    /**
     * Check WhatsApp API health
     */
    public boolean checkHealth() {
        try {
            String url = String.format("%s/%s", apiUrl, phoneNumberId);

            Request request = new Request.Builder()
                    .url(url)
                    .addHeader("Authorization", "Bearer " + accessToken)
                    .get()
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                boolean healthy = response.isSuccessful();
                logger.info("WhatsApp API Health Check: {}", healthy ? "✅ Healthy" : "❌ Unhealthy");
                return healthy;
            }

        } catch (Exception e) {
            logger.error("❌ WhatsApp API Health Check Failed: {}", e.getMessage());
            return false;
        }
    }
}