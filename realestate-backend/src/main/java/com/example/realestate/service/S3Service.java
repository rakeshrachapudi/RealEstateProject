package com.example.realestate.service;

import com.example.realestate.repository.PropertyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * S3 helper service using AWS SDK v2.
 *
 * Provides methods for:
 * - Basic file operations (upload, move, delete)
 * - Property-specific uploads (images, documents)
 * - Deal document uploads
 * - URL generation and key extraction
 */
@Service
public class S3Service {

    private static final Logger logger = LoggerFactory.getLogger(S3Service.class);

    private final S3Client s3Client;
    private final String bucketName;
    private final Region awsRegion;
    @Autowired
    private PropertyDocumentService propertyDocumentService;
    @Autowired
    private PropertyImageService propertyImageService;

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
        Objects.requireNonNull(key, "key is required");
        Objects.requireNonNull(filePath, "filePath is required");

        logger.info("📤 Uploading file to S3");
        logger.info("   Bucket: {}", bucketName);
        logger.info("   Key: {}", key);
        logger.info("   ContentType: {}", contentType);
        logger.info("   FilePath: {}", filePath);

        try {
            PutObjectRequest.Builder requestBuilder = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .acl(ObjectCannedACL.PUBLIC_READ);

            if (contentType != null) {
                requestBuilder.contentType(contentType);
            }

            PutObjectRequest putRequest = requestBuilder.build();
            PutObjectResponse response = s3Client.putObject(putRequest, RequestBody.fromFile(filePath));

            String fileUrl = getFileUrl(key);

            logger.info("✅ File uploaded successfully!");
            logger.info("   URL: {}", fileUrl);
            logger.info("   ETag: {}", response.eTag());

            return fileUrl;
        } catch (Exception e) {
            logger.error("Failed to upload file to S3. key={}, cause={}", key, e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to S3: " + e.getMessage(), e);
        }
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
        logger.info("📝 UPLOADING DEAL DOCUMENT");
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
     * Delete an object from S3.
     */
    public void deleteFile(String key) {
        Objects.requireNonNull(key, "key is required");

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);
            logger.info("Deleted S3 object: {}", key);
        } catch (Exception e) {
            logger.error("Failed to delete file from S3. key={}, cause={}", key, e.getMessage(), e);
            throw new RuntimeException("Failed to delete file from S3: " + e.getMessage(), e);
        }
    }

    /**
     * Build public URL for a given key.
     */
    public String getFileUrl(String key) {
        try {
            // Build the standard S3 URL format
            return String.format("https://%s.s3.%s.amazonaws.com/%s",
                    bucketName, awsRegion.id(), key);
        } catch (Exception e) {
            logger.warn("Failed to build URL for bucket={}, key={}, cause={}", bucketName, key, e.getMessage());
            // fallback without region
            return String.format("https://%s.s3.amazonaws.com/%s", bucketName, key);
        }
    }

    /**
     * Extract S3 key from a public URL returned by S3 or stored previously.
     *
     * This handles:
     * - https://bucket.s3.region.amazonaws.com/key/path
     * - https://s3.region.amazonaws.com/bucket/key/path
     * - https://bucket.s3.amazonaws.com/key/path
     * - https://<cdn>/bucket/key/path
     *
     * Returns the key portion (e.g. "temp/images/xxx.jpg").
     * If extraction fails, returns null.
     */
    public String getKeyFromUrl(String url) {
        if (url == null) {
            return null;
        }

        try {
            String lower = url.toLowerCase();

            // If url contains the bucketName directly like .../{bucketName}/...
            String marker = "/" + bucketName.toLowerCase() + "/";
            int idx = lower.indexOf(marker);
            if (idx != -1) {
                return url.substring(idx + marker.length());
            }

            // if URL has bucket as subdomain: https://bucket.s3.region.amazonaws.com/key
            idx = lower.indexOf(".s3");
            if (idx != -1) {
                // find the first slash after domain
                int slash = lower.indexOf("/", idx);
                if (slash != -1 && slash + 1 < lower.length()) {
                    return url.substring(slash + 1);
                }
            }

            // if URL uses s3.amazonaws.com/bucket/key
            idx = lower.indexOf("s3.amazonaws.com/");
            if (idx != -1) {
                int start = idx + "s3.amazonaws.com/".length();
                // check if next portion is bucketName
                String bucketMarker = bucketName.toLowerCase() + "/";
                if (lower.startsWith(bucketMarker, start)) {
                    return url.substring(start + bucketName.length() + 1);
                } else {
                    // assume the rest is key (if bucket is not present)
                    return url.substring(start);
                }
            }

            // fallback: return substring after first single slash after host
            int proto = lower.indexOf("://");
            if (proto != -1) {
                int firstSlash = lower.indexOf("/", proto + 3);
                if (firstSlash != -1 && firstSlash + 1 < lower.length()) {
                    return url.substring(firstSlash + 1);
                }
            }

            // last resort - return null
            return null;
        } catch (Exception e) {
            logger.warn("Failed to extract key from url={} cause={}", url, e.getMessage());
            return null;
        }
    }

    /**
     * Check if an object exists in S3.
     */
    public boolean fileExists(String key) {
        Objects.requireNonNull(key, "key is required");

        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.headObject(headRequest);
            return true;
        } catch (NoSuchKeyException e) {
            return false;
        } catch (Exception e) {
            logger.error("Failed to check if file exists. key={}, cause={}", key, e.getMessage(), e);
            return false;
        }
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
     * ⭐ FIXED: Move a file from one S3 key to another (copy + delete)
     * NOW PROPERLY SETS ACL AND CONTENT-TYPE ON COPIED FILE
     *
     * @param sourceKey The current S3 key (e.g., "temp/images/file.jpg")
     * @param destinationKey The new S3 key (e.g., "properties/123/images/file.jpg")
     * @return true if successful, false otherwise
     */
    public boolean moveFile(String sourceKey, String destinationKey) {
        try {
            logger.info("📦 Moving S3 file: {} → {}", sourceKey, destinationKey);

            // Step 1: Get metadata from source file to preserve content-type
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(sourceKey)
                    .build();

            HeadObjectResponse headResponse = s3Client.headObject(headRequest);
            String contentType = headResponse.contentType();

            logger.info("   Source file content-type: {}", contentType);

            // Step 2: Copy the object to the new location WITH PUBLIC_READ ACL and content-type
            CopyObjectRequest copyRequest = CopyObjectRequest.builder()
                    .sourceBucket(bucketName)
                    .sourceKey(sourceKey)
                    .destinationBucket(bucketName)
                    .destinationKey(destinationKey)
                    .acl(ObjectCannedACL.PUBLIC_READ)  // ⭐ CRITICAL: Set ACL to public-read
                    .contentType(contentType)           // ⭐ CRITICAL: Preserve content-type
                    .metadataDirective(MetadataDirective.REPLACE)  // Required when setting content-type
                    .build();

            s3Client.copyObject(copyRequest);
            logger.info("✅ Copied S3 object to: {}", destinationKey);
            logger.info("   New file URL: {}", getFileUrl(destinationKey));

            // Step 3: Delete the original object
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(sourceKey)
                    .build();

            s3Client.deleteObject(deleteRequest);
            logger.info("🗑️ Deleted original S3 object: {}", sourceKey);

            return true;

        } catch (S3Exception e) {
            logger.error("❌ S3 error moving file: {}", e.awsErrorDetails().errorMessage());
            logger.error("   Error code: {}", e.awsErrorDetails().errorCode());
            logger.error("   Status code: {}", e.statusCode());
            return false;
        } catch (Exception e) {
            logger.error("❌ Error moving S3 file: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Optional: Batch move multiple files (more efficient)
     */
    public Map<String, Boolean> moveFiles(Map<String, String> fileMappings) {
        Map<String, Boolean> results = new HashMap<>();

        for (Map.Entry<String, String> entry : fileMappings.entrySet()) {
            String sourceKey = entry.getKey();
            String destinationKey = entry.getValue();
            boolean moved = moveFile(sourceKey, destinationKey);
            results.put(sourceKey, moved);
        }

        return results;
    }
}