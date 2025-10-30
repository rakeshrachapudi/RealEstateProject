package com.example.realestate.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
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
        logger.info("📤 Uploading file to S3");
        logger.info("   Bucket: {}", bucketName);
        logger.info("   Key: {}", key);
        logger.info("   ContentType: {}", contentType);
        logger.info("   FilePath: {}", filePath);

        PutObjectRequest putRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(contentType)
                .acl("public-read")
                .build();

        PutObjectResponse response = s3Client.putObject(putRequest, filePath);
        String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, awsRegion.id(), key);

        logger.info("✅ File uploaded successfully!");
        logger.info("   URL: {}", fileUrl);
        logger.info("   ETag: {}", response.eTag());

        return fileUrl;
    }

    /**
     * Upload property image to S3 (organized by property ID)
     */
    public String uploadPropertyImage(Long propertyId, Path filePath, String originalFilename, String contentType) throws IOException {
        logger.info("🏠 UPLOADING PROPERTY IMAGE");
        logger.info("   Property ID: {}", propertyId);
        logger.info("   Original Filename: {}", originalFilename);

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedFilename = sanitizeFilename(originalFilename);

        // Structure: properties/{propertyId}/images/{timestamp}_{uniqueId}_{filename}
        String key = String.format("properties/%d/images/%s_%s_%s",
                propertyId, timestamp, uniqueId, sanitizedFilename);

        logger.info("   Generated S3 Key: {}", key);
        logger.info("   This will create folder structure: properties/{}/images/", propertyId);

        String result = uploadFile(key, filePath, contentType);

        logger.info("✅ ✅ ✅ PROPERTY IMAGE UPLOADED SUCCESSFULLY");
        logger.info("   Check S3 bucket '{}' under path: properties/{}/images/", bucketName, propertyId);

        return result;
    }

    /**
     * Upload property document to S3 (organized by property ID)
     */
    public String uploadPropertyDocument(Long propertyId, Path filePath, String originalFilename, String contentType) throws IOException {
        logger.info("📄 UPLOADING PROPERTY DOCUMENT");
        logger.info("   Property ID: {}", propertyId);

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedFilename = sanitizeFilename(originalFilename);

        // Structure: properties/{propertyId}/documents/{timestamp}_{uniqueId}_{filename}
        String key = String.format("properties/%d/documents/%s_%s_%s",
                propertyId, timestamp, uniqueId, sanitizedFilename);

        logger.info("   Generated S3 Key: {}", key);

        return uploadFile(key, filePath, contentType);
    }

    /**
     * Upload deal document to S3 (organized by deal ID and property ID)
     */
    public String uploadDealDocument(Long dealId, Long propertyId, Path filePath, String originalFilename, String contentType) throws IOException {
        logger.info("🔐 UPLOADING DEAL DOCUMENT");
        logger.info("   Deal ID: {}", dealId);
        logger.info("   Property ID: {}", propertyId);

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedFilename = sanitizeFilename(originalFilename);

        // Structure: properties/{propertyId}/deals/{dealId}/documents/{timestamp}_{uniqueId}_{filename}
        String key = String.format("properties/%d/deals/%d/documents/%s_%s_%s",
                propertyId, dealId, timestamp, uniqueId, sanitizedFilename);

        logger.info("   Generated S3 Key: {}", key);

        return uploadFile(key, filePath, contentType);
    }

    /**
     * Sanitize filename to remove special characters
     */
    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        // Remove special characters but keep extension
        String sanitized = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        logger.debug("   Sanitized filename: {} -> {}", filename, sanitized);
        return sanitized;
    }

    /**
     * Delete a single file from S3 using its URL
     */
    public boolean deleteFile(String fileUrl) {
        try {
            String key = extractKeyFromUrl(fileUrl);
            if (key == null) {
                logger.warn("⚠️ Could not extract S3 key from URL: {}", fileUrl);
                return false;
            }

            logger.info("🗑️ Deleting file from S3");
            logger.info("   URL: {}", fileUrl);
            logger.info("   Key: {}", key);

            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);
            logger.info("✅ File deleted successfully: {}", key);
            return true;

        } catch (Exception e) {
            logger.error("❌ Error deleting file from S3: {}", fileUrl, e);
            return false;
        }
    }

    /**
     * Delete all files under a specific prefix (folder path)
     * Useful for deleting all property files or all deal documents
     */
    public int deleteByPrefix(String prefix) {
        int deletedCount = 0;
        try {
            logger.info("🗑️ Deleting all objects with prefix: {}", prefix);

            // List all objects with the given prefix
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(prefix)
                    .build();

            ListObjectsV2Response listResponse;
            do {
                listResponse = s3Client.listObjectsV2(listRequest);
                List<S3Object> objects = listResponse.contents();

                if (objects.isEmpty()) {
                    logger.info("ℹ️ No objects found with prefix: {}", prefix);
                    break;
                }

                // Delete objects in batch (up to 1000 at a time)
                List<ObjectIdentifier> keysToDelete = new ArrayList<>();
                for (S3Object object : objects) {
                    keysToDelete.add(ObjectIdentifier.builder().key(object.key()).build());
                }

                if (!keysToDelete.isEmpty()) {
                    Delete delete = Delete.builder().objects(keysToDelete).build();
                    DeleteObjectsRequest deleteRequest = DeleteObjectsRequest.builder()
                            .bucket(bucketName)
                            .delete(delete)
                            .build();

                    DeleteObjectsResponse deleteResponse = s3Client.deleteObjects(deleteRequest);
                    deletedCount += deleteResponse.deleted().size();
                    logger.info("✅ Deleted {} objects", deleteResponse.deleted().size());
                }

                // Check if there are more objects to list
                listRequest = listRequest.toBuilder()
                        .continuationToken(listResponse.nextContinuationToken())
                        .build();

            } while (listResponse.isTruncated());

            logger.info("✅ Total deleted: {} objects with prefix: {}", deletedCount, prefix);

        } catch (Exception e) {
            logger.error("❌ Error deleting objects with prefix: {}", prefix, e);
        }
        return deletedCount;
    }

    /**
     * Delete all files associated with a property
     * This includes images, documents, and all deal documents
     */
    public int deletePropertyFiles(Long propertyId) {
        logger.info("🗑️ Deleting all files for Property ID: {}", propertyId);
        String prefix = String.format("properties/%d/", propertyId);
        return deleteByPrefix(prefix);
    }

    /**
     * Delete all documents associated with a specific deal
     */
    public int deleteDealDocuments(Long propertyId, Long dealId) {
        logger.info("🗑️ Deleting all deal documents for Deal ID: {} (Property ID: {})", dealId, propertyId);
        String prefix = String.format("properties/%d/deals/%d/", propertyId, dealId);
        return deleteByPrefix(prefix);
    }

    /**
     * Delete a specific property image
     */
    public boolean deletePropertyImage(Long propertyId, String imageUrl) {
        logger.info("🗑️ Deleting property image for Property ID: {}", propertyId);
        return deleteFile(imageUrl);
    }

    /**
     * Extract S3 key from full URL
     * Example: https://bucket-name.s3.region.amazonaws.com/path/to/file.jpg -> path/to/file.jpg
     */
    private String extractKeyFromUrl(String fileUrl) {
        try {
            if (fileUrl == null || fileUrl.isEmpty()) {
                return null;
            }

            // Handle different S3 URL formats
            // Format 1: https://bucket.s3.region.amazonaws.com/key
            // Format 2: https://s3.region.amazonaws.com/bucket/key

            String[] parts = fileUrl.split(".amazonaws.com/");
            if (parts.length == 2) {
                return parts[1]; // Return the key part
            }

            logger.warn("⚠️ Unrecognized S3 URL format: {}", fileUrl);
            return null;

        } catch (Exception e) {
            logger.error("❌ Error extracting key from URL: {}", fileUrl, e);
            return null;
        }
    }


}
