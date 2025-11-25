package com.example.realestate.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ses.SesClient;
import software.amazon.awssdk.services.ses.model.*;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.util.List;

@Service
public class SESService {

    private static final Logger logger = LoggerFactory.getLogger(SESService.class);

    @Value("${aws.ses.access-key}")
    private String awsAccessKeyId;

    @Value("${aws.ses.secret-key}")
    private String awsSecretKey;


    @Value("${aws.ses.region:us-east-1}")
    private String sesRegion;

    @Value("${aws.ses.from.email}")
    private String fromEmail;

    @Value("${aws.ses.from.name:PropertyDealz Notifications}")
    private String fromName;

    private SesClient sesClient;

    @PostConstruct
    public void init() {
        try {
            AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(
                    awsAccessKeyId,
                    awsSecretKey
            );

            this.sesClient = SesClient.builder()
                    .region(Region.of(sesRegion))
                    .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                    .build();

            logger.info("✅ AWS SES Service initialized");
            logger.info("   Region: {}", sesRegion);
            logger.info("   From Email: {}", fromEmail);

        } catch (Exception e) {
            logger.error("❌ Failed to initialize AWS SES: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initialize AWS SES", e);
        }
    }

    @PreDestroy
    public void cleanup() {
        if (sesClient != null) {
            sesClient.close();
            logger.info("🔒 AWS SES Service closed");
        }
    }

    /**
     * Send email to a single recipient
     */
    public boolean sendEmail(String toEmail, String subject, String htmlBody, String textBody) {
        try {
            logger.info("📧 Sending email to: {}", maskEmail(toEmail));

            String source = String.format("%s <%s>", fromName, fromEmail);

            SendEmailRequest emailRequest = SendEmailRequest.builder()
                    .source(source)
                    .destination(Destination.builder()
                            .toAddresses(toEmail)
                            .build())
                    .message(Message.builder()
                            .subject(Content.builder()
                                    .data(subject)
                                    .charset("UTF-8")
                                    .build())
                            .body(Body.builder()
                                    .html(Content.builder()
                                            .data(htmlBody)
                                            .charset("UTF-8")
                                            .build())
                                    .text(Content.builder()
                                            .data(textBody)
                                            .charset("UTF-8")
                                            .build())
                                    .build())
                            .build())
                    .build();

            SendEmailResponse response = sesClient.sendEmail(emailRequest);
            logger.info("✅ Email sent successfully - Message ID: {}", response.messageId());
            return true;

        } catch (SesException e) {
            logger.error("❌ AWS SES Error sending email to {}: {} - {}",
                    toEmail, e.awsErrorDetails().errorCode(), e.awsErrorDetails().errorMessage());
            return false;
        } catch (Exception e) {
            logger.error("❌ Error sending email to {}: {}", toEmail, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Send email to multiple recipients
     */
    public void sendBulkEmail(List<String> toEmails, String subject, String htmlBody, String textBody) {
        if (toEmails == null || toEmails.isEmpty()) {
            logger.warn("⚠️ No email recipients provided");
            return;
        }

        logger.info("📧 Sending bulk email to {} recipients", toEmails.size());

        int successCount = 0;
        int failureCount = 0;

        for (String email : toEmails) {
            try {
                boolean sent = sendEmail(email, subject, htmlBody, textBody);
                if (sent) {
                    successCount++;
                } else {
                    failureCount++;
                }

                // Add small delay to avoid rate limiting (14 emails per second limit)
                Thread.sleep(80);

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                logger.error("❌ Interrupted while sending bulk emails");
                break;
            }
        }

        logger.info("📊 Bulk email summary - Success: {}, Failed: {}", successCount, failureCount);
    }

    /**
     * Send email with CC and BCC
     */
    public boolean sendEmailWithCcBcc(
            String toEmail,
            List<String> ccEmails,
            List<String> bccEmails,
            String subject,
            String htmlBody,
            String textBody) {

        try {
            logger.info("📧 Sending email with CC/BCC to: {}", maskEmail(toEmail));

            String source = String.format("%s <%s>", fromName, fromEmail);

            Destination.Builder destinationBuilder = Destination.builder()
                    .toAddresses(toEmail);

            if (ccEmails != null && !ccEmails.isEmpty()) {
                destinationBuilder.ccAddresses(ccEmails);
            }

            if (bccEmails != null && !bccEmails.isEmpty()) {
                destinationBuilder.bccAddresses(bccEmails);
            }

            SendEmailRequest emailRequest = SendEmailRequest.builder()
                    .source(source)
                    .destination(destinationBuilder.build())
                    .message(Message.builder()
                            .subject(Content.builder()
                                    .data(subject)
                                    .charset("UTF-8")
                                    .build())
                            .body(Body.builder()
                                    .html(Content.builder()
                                            .data(htmlBody)
                                            .charset("UTF-8")
                                            .build())
                                    .text(Content.builder()
                                            .data(textBody)
                                            .charset("UTF-8")
                                            .build())
                                    .build())
                            .build())
                    .build();

            SendEmailResponse response = sesClient.sendEmail(emailRequest);
            logger.info("✅ Email with CC/BCC sent successfully - Message ID: {}", response.messageId());
            return true;

        } catch (SesException e) {
            logger.error("❌ AWS SES Error: {} - {}",
                    e.awsErrorDetails().errorCode(), e.awsErrorDetails().errorMessage());
            return false;
        } catch (Exception e) {
            logger.error("❌ Error sending email with CC/BCC: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Verify email address
     */
    public boolean verifyEmailAddress(String email) {
        try {
            logger.info("🔍 Verifying email address: {}", maskEmail(email));

            VerifyEmailIdentityRequest verifyRequest = VerifyEmailIdentityRequest.builder()
                    .emailAddress(email)
                    .build();

            sesClient.verifyEmailIdentity(verifyRequest);
            logger.info("✅ Verification email sent to: {}", maskEmail(email));
            return true;

        } catch (Exception e) {
            logger.error("❌ Error verifying email {}: {}", email, e.getMessage());
            return false;
        }
    }

    /**
     * Check if email is verified
     */
    public boolean isEmailVerified(String email) {
        try {
            GetIdentityVerificationAttributesRequest request =
                    GetIdentityVerificationAttributesRequest.builder()
                            .identities(email)
                            .build();

            GetIdentityVerificationAttributesResponse response =
                    sesClient.getIdentityVerificationAttributes(request);

            if (response.verificationAttributes().containsKey(email)) {
                VerificationStatus status = response.verificationAttributes()
                        .get(email)
                        .verificationStatus();

                logger.info("📋 Email {} verification status: {}", maskEmail(email), status);
                return status == VerificationStatus.SUCCESS;
            }

            return false;

        } catch (Exception e) {
            logger.error("❌ Error checking email verification status: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get sending statistics
     */
    public void logSendingStatistics() {
        try {
            GetSendStatisticsRequest request = GetSendStatisticsRequest.builder().build();
            GetSendStatisticsResponse response = sesClient.getSendStatistics(request);

            logger.info("📊 AWS SES Sending Statistics:");
            response.sendDataPoints().stream()
                    .limit(5) // Show last 5 data points
                    .forEach(dataPoint -> {
                        logger.info("   Timestamp: {}", dataPoint.timestamp());
                        logger.info("   Sent: {}", dataPoint.deliveryAttempts());
                        logger.info("   Bounces: {}", dataPoint.bounces());
                        logger.info("   Complaints: {}", dataPoint.complaints());
                        logger.info("   Rejects: {}", dataPoint.rejects());
                        logger.info("   ---");
                    });

        } catch (Exception e) {
            logger.error("❌ Error fetching sending statistics: {}", e.getMessage());
        }
    }

    /**
     * Get account sending quota
     */
    public void logSendingQuota() {
        try {
            GetSendQuotaRequest request = GetSendQuotaRequest.builder().build();
            GetSendQuotaResponse response = sesClient.getSendQuota(request);

            logger.info("📊 AWS SES Sending Quota:");
            logger.info("   Max 24 Hour Send: {}", response.max24HourSend());
            logger.info("   Max Send Rate: {} emails/second", response.maxSendRate());
            logger.info("   Sent Last 24 Hours: {}", response.sentLast24Hours());

        } catch (Exception e) {
            logger.error("❌ Error fetching sending quota: {}", e.getMessage());
        }
    }

    /**
     * Mask email for logging
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "****";
        String[] parts = email.split("@");
        if (parts[0].length() <= 2) return "**@" + parts[1];
        return parts[0].substring(0, 2) + "****@" + parts[1];
    }

    /**
     * Check SES health
     */
    public boolean checkHealth() {
        try {
            // Try to get account sending quota as health check
            GetSendQuotaRequest request = GetSendQuotaRequest.builder().build();
            sesClient.getSendQuota(request);
            logger.info("AWS SES Health Check: ✅ Healthy");
            return true;
        } catch (Exception e) {
            logger.error("❌ AWS SES Health Check Failed: {}", e.getMessage());
            return false;
        }
    }
}