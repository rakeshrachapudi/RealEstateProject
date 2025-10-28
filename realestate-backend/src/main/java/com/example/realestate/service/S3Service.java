package com.example.realestate.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class S3Service {

    private static final Logger logger = LoggerFactory.getLogger(S3Service.class);

    private final S3Client s3Client;
    private final String bucketName;
    private final Region awsRegion;

    public S3Service(@Value("${aws.accessKeyId}") String accessKey,
                     @Value("${aws.secretKey}") String secretKey,
                     @Value("${aws.region}") String region,
                     @Value("${aws.s3.bucket}") String bucketName) {

        this.awsRegion = Region.of(region);
        this.bucketName = bucketName;

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        this.s3Client = S3Client.builder()
                .region(awsRegion)
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();

        logger.info("✅ S3Service initialized - Bucket: {}, Region: {}", bucketName, awsRegion);
    }

    /**
     * Upload file to S3 with custom key
     */
    public String uploadFile(String key, Path filePath, String contentType) throws IOException {
        logger.info("Uploading file to S3 - Key: {}, ContentType: {}", key, contentType);

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .acl("public-read")
                .build();

        PutObjectResponse response = s3Client.putObject(putRequest, filePath);
        String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, awsRegion.id(), key);

        logger.info("✅ File uploaded successfully to: {}", fileUrl);
        return fileUrl;
    }

    /**
     * Upload property image to S3 (organized by property ID)
     */
    public String uploadPropertyImage(Long propertyId, Path filePath, String originalFilename, String contentType) throws IOException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedFilename = sanitizeFilename(originalFilename);

        // Structure: properties/{propertyId}/images/{timestamp}_{uniqueId}_{filename}
        String key = String.format("properties/%d/images/%s_%s_%s",
                propertyId, timestamp, uniqueId, sanitizedFilename);

        logger.info("📸 Uploading property image - Property ID: {}, Key: {}", propertyId, key);
        return uploadFile(key, filePath, contentType);
    }

    /**
     * Upload property document to S3 (organized by property ID)
     * This is what's needed for the deal document uploads!
     */
    public String uploadPropertyDocument(Long propertyId, Path filePath, String originalFilename, String contentType) throws IOException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedFilename = sanitizeFilename(originalFilename);

        // Structure: properties/{propertyId}/documents/{timestamp}_{uniqueId}_{filename}
        String key = String.format("properties/%d/documents/%s_%s_%s",
                propertyId, timestamp, uniqueId, sanitizedFilename);

        logger.info("📄 Uploading property document - Property ID: {}, Key: {}", propertyId, key);
        return uploadFile(key, filePath, contentType);
    }

    /**
     * Upload deal document to S3 (organized by deal ID)
     */
    public String uploadDealDocument(Long dealId, Long propertyId, Path filePath, String originalFilename, String contentType) throws IOException {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedFilename = sanitizeFilename(originalFilename);

        // Structure: properties/{propertyId}/deals/{dealId}/documents/{timestamp}_{uniqueId}_{filename}
        String key = String.format("properties/%d/deals/%d/documents/%s_%s_%s",
                propertyId, dealId, timestamp, uniqueId, sanitizedFilename);

        logger.info("📑 Uploading deal document - Deal ID: {}, Property ID: {}, Key: {}", dealId, propertyId, key);
        return uploadFile(key, filePath, contentType);
    }

    /**
     * Sanitize filename to remove special characters
     */
    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        // Remove special characters but keep extension
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}