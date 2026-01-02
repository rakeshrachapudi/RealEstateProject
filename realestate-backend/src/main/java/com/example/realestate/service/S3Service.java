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
 * - Basic file operations (upload, move, delete, copy)
 * - Property-specific uploads (images, documents)
 * - Deal document uploads
 * - URL generation and key extraction
 * - File listing and existence checks
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

    // ==================== UPLOAD OPERATIONS ====================

    /**
     * ✅ Upload file to S3 with custom key
     */
    public String uploadFile(String key, Path filePath, String contentType) throws IOException {
        Objects.requireNonNull(key, "key is required");
        Objects.requireNonNull(filePath, "filePath is required");

        logger.info("📤 [uploadFile] Uploading file to S3");
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

            logger.info("✅ [uploadFile] File uploaded successfully!");
            logger.info("   URL: {}", fileUrl);
            logger.info("   ETag: {}", response.eTag());

            return fileUrl;
        } catch (Exception e) {
            logger.error("❌ [uploadFile] Failed to upload file to S3. key={}, cause={}", key, e.getMessage(), e);
            throw new RuntimeException("Failed to upload file to S3: " + e.getMessage(), e);
        }
    }

    /**
     * ✅ Upload property image to S3 (organized by property ID)
     */
    public String uploadPropertyImage(Long propertyId, Path filePath, String originalFilename, String contentType) throws IOException {
        logger.info("📸 [uploadPropertyImage] UPLOADING PROPERTY IMAGE");
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

        logger.info("✅ ✅ ✅ [uploadPropertyImage] PROPERTY IMAGE UPLOADED SUCCESSFULLY");
        logger.info("   Check S3 bucket '{}' under path: properties/{}/images/", bucketName, propertyId);

        return result;
    }

    /**
     * ✅ Upload property document to S3 (organized by property ID)
     */
    public String uploadPropertyDocument(Long propertyId, Path filePath, String originalFilename, String contentType) throws IOException {
        logger.info("📄 [uploadPropertyDocument] UPLOADING PROPERTY DOCUMENT");
        logger.info("   Property ID: {}", propertyId);
        logger.info("   Original Filename: {}", originalFilename);

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedFilename = sanitizeFilename(originalFilename);

        // Structure: properties/{propertyId}/documents/{timestamp}_{uniqueId}_{filename}
        String key = String.format("properties/%d/documents/%s_%s_%s",
                propertyId, timestamp, uniqueId, sanitizedFilename);

        logger.info("   Generated S3 Key: {}", key);

        String result = uploadFile(key, filePath, contentType);

        logger.info("✅ [uploadPropertyDocument] PROPERTY DOCUMENT UPLOADED SUCCESSFULLY");
        logger.info("   URL: {}", result);

        return result;
    }

    /**
     * ✅ Upload deal document to S3 (organized by deal ID and property ID)
     */
    public String uploadDealDocument(Long dealId, Long propertyId, Path filePath, String originalFilename, String contentType) throws IOException {
        logger.info("📝 [uploadDealDocument] UPLOADING DEAL DOCUMENT");
        logger.info("   Deal ID: {}", dealId);
        logger.info("   Property ID: {}", propertyId);
        logger.info("   Original Filename: {}", originalFilename);

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String uniqueId = UUID.randomUUID().toString().substring(0, 8);
        String sanitizedFilename = sanitizeFilename(originalFilename);

        // Structure: properties/{propertyId}/deals/{dealId}/documents/{timestamp}_{uniqueId}_{filename}
        String key = String.format("properties/%d/deals/%d/documents/%s_%s_%s",
                propertyId, dealId, timestamp, uniqueId, sanitizedFilename);

        logger.info("   Generated S3 Key: {}", key);

        String result = uploadFile(key, filePath, contentType);

        logger.info("✅ [uploadDealDocument] DEAL DOCUMENT UPLOADED SUCCESSFULLY");
        logger.info("   URL: {}", result);

        return result;
    }

    // ==================== COPY & MOVE OPERATIONS ====================

    /**
     * ✅ FIXED: Copy a file from one S3 location to another (for moving files between folders)
     * NOW PROPERLY SETS ACL AND PRESERVES CONTENT-TYPE
     *
     * @param sourceKey The source S3 key (e.g., "temp/images/file.jpg")
     * @param destinationKey The destination S3 key (e.g., "properties/123/images/file.jpg")
     * @return true if successful, false otherwise
     */
    public boolean copyFile(String sourceKey, String destinationKey) {
        logger.info("📋 [copyFile] Copying file in S3");
        logger.info("   Source: {}", sourceKey);
        logger.info("   Destination: {}", destinationKey);

        try {
            // Step 1: Get metadata from source file to preserve content-type
            logger.info("   Getting metadata from source file...");
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(sourceKey)
                    .build();

            HeadObjectResponse headResponse = s3Client.headObject(headRequest);
            String contentType = headResponse.contentType();

            logger.info("   Source file content-type: {}", contentType);

            // Step 2: Copy the object to the new location WITH PUBLIC_READ ACL and content-type
            logger.info("   Copying object to destination...");
            CopyObjectRequest copyRequest = CopyObjectRequest.builder()
                    .sourceBucket(bucketName)
                    .sourceKey(sourceKey)
                    .destinationBucket(bucketName)
                    .destinationKey(destinationKey)
                    .acl(ObjectCannedACL.PUBLIC_READ)  // ⭐ CRITICAL: Set ACL to public-read
                    .contentType(contentType)           // ⭐ CRITICAL: Preserve content-type
                    .metadataDirective(MetadataDirective.REPLACE)  // Required when setting content-type
                    .build();

            CopyObjectResponse copyResponse = s3Client.copyObject(copyRequest);
            logger.info("✅ [copyFile] File copied successfully!");
            logger.info("   Destination: {}", destinationKey);
            logger.info("   New file URL: {}", getFileUrl(destinationKey));
            logger.info("   ETag: {}", copyResponse.copyObjectResult().eTag());

            return true;

        } catch (S3Exception e) {
            logger.error("❌ [copyFile] S3 error: {}", e.awsErrorDetails().errorMessage());
            logger.error("   Error code: {}", e.awsErrorDetails().errorCode());
            logger.error("   Status code: {}", e.statusCode());
            return false;
        } catch (Exception e) {
            logger.error("❌ [copyFile] Unexpected error: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * ✅ FIXED: Move a file from one S3 key to another (copy + delete)
     * NOW PROPERLY SETS ACL AND CONTENT-TYPE ON COPIED FILE
     *
     * @param sourceKey The current S3 key (e.g., "temp/images/file.jpg")
     * @param destinationKey The new S3 key (e.g., "properties/123/images/file.jpg")
     * @return true if successful, false otherwise
     */
    public boolean moveFile(String sourceKey, String destinationKey) {
        logger.info("📦 [moveFile] Moving S3 file: {} → {}", sourceKey, destinationKey);

        try {
            // Step 1: Copy file to new location
            if (!copyFile(sourceKey, destinationKey)) {
                logger.error("❌ [moveFile] Copy operation failed");
                return false;
            }

            // Step 2: Delete the original object
            logger.info("   Deleting original file...");
            deleteFile(sourceKey);
            logger.info("🗑️ [moveFile] Deleted original S3 object: {}", sourceKey);

            logger.info("✅ ✅ ✅ [moveFile] FILE MOVED SUCCESSFULLY");
            logger.info("   From: {}", sourceKey);
            logger.info("   To: {}", destinationKey);

            return true;

        } catch (Exception e) {
            logger.error("❌ [moveFile] Error moving S3 file: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * ✅ Batch move multiple files (more efficient than individual moves)
     */
    public Map<String, Boolean> moveFiles(Map<String, String> fileMappings) {
        logger.info("📦 [moveFiles] Batch moving {} files", fileMappings.size());

        Map<String, Boolean> results = new HashMap<>();

        for (Map.Entry<String, String> entry : fileMappings.entrySet()) {
            String sourceKey = entry.getKey();
            String destinationKey = entry.getValue();
            logger.info("   Moving: {} → {}", sourceKey, destinationKey);

            boolean moved = moveFile(sourceKey, destinationKey);
            results.put(sourceKey, moved);
        }

        logger.info("✅ [moveFiles] Batch move completed. Results: {}", results);
        return results;
    }

    // ==================== DELETE OPERATIONS ====================

    /**
     * ✅ Delete an object from S3.
     */
    public void deleteFile(String key) {
        Objects.requireNonNull(key, "key is required");

        logger.info("🗑️ [deleteFile] Deleting file from S3: {}", key);

        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteRequest);
            logger.info("✅ [deleteFile] Deleted S3 object: {}", key);
        } catch (S3Exception e) {
            logger.error("❌ [deleteFile] S3 error: {}", e.awsErrorDetails().errorMessage());
            throw new RuntimeException("Failed to delete file from S3: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("❌ [deleteFile] Error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete file from S3: " + e.getMessage(), e);
        }
    }

    /**
     * ✅ Delete all files with given prefix (e.g., delete all images for a property)
     */
    public void deleteFilesWithPrefix(String prefix) {
        logger.info("🗑️ [deleteFilesWithPrefix] Deleting all files with prefix: {}", prefix);

        try {
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(prefix)
                    .build();

            ListObjectsV2Response listing = s3Client.listObjectsV2(listRequest);

            int deleteCount = 0;
            for (S3Object s3Object : listing.contents()) {
                logger.info("   Deleting: {}", s3Object.key());
                deleteFile(s3Object.key());
                deleteCount++;
            }

            logger.info("✅ [deleteFilesWithPrefix] Deleted {} files with prefix", deleteCount);

        } catch (Exception e) {
            logger.error("❌ [deleteFilesWithPrefix] Error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to delete files: " + e.getMessage(), e);
        }
    }

    // ==================== URL & KEY OPERATIONS ====================

    /**
     * ✅ Build public URL for a given key.
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
     * ✅ Extract S3 key from a public URL returned by S3 or stored previously.
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
        logger.info("🔍 [getKeyFromUrl] Extracting S3 key from URL: {}", url);

        if (url == null) {
            return null;
        }

        try {
            String lower = url.toLowerCase();

            // If url contains the bucketName directly like .../{bucketName}/...
            String marker = "/" + bucketName.toLowerCase() + "/";
            int idx = lower.indexOf(marker);
            if (idx != -1) {
                String key = url.substring(idx + marker.length());
                logger.info("   ✅ Extracted key (format 1): {}", key);
                return key;
            }

            // if URL has bucket as subdomain: https://bucket.s3.region.amazonaws.com/key
            idx = lower.indexOf(".s3");
            if (idx != -1) {
                // find the first slash after domain
                int slash = lower.indexOf("/", idx);
                if (slash != -1 && slash + 1 < lower.length()) {
                    String key = url.substring(slash + 1);
                    logger.info("   ✅ Extracted key (format 2): {}", key);
                    return key;
                }
            }

            // if URL uses s3.amazonaws.com/bucket/key
            idx = lower.indexOf("s3.amazonaws.com/");
            if (idx != -1) {
                int start = idx + "s3.amazonaws.com/".length();
                // check if next portion is bucketName
                String bucketMarker = bucketName.toLowerCase() + "/";
                if (lower.startsWith(bucketMarker, start)) {
                    String key = url.substring(start + bucketName.length() + 1);
                    logger.info("   ✅ Extracted key (format 3): {}", key);
                    return key;
                } else {
                    // assume the rest is key (if bucket is not present)
                    String key = url.substring(start);
                    logger.info("   ✅ Extracted key (format 4): {}", key);
                    return key;
                }
            }

            // fallback: return substring after first single slash after host
            int proto = lower.indexOf("://");
            if (proto != -1) {
                int firstSlash = lower.indexOf("/", proto + 3);
                if (firstSlash != -1 && firstSlash + 1 < lower.length()) {
                    String key = url.substring(firstSlash + 1);
                    logger.info("   ✅ Extracted key (format 5): {}", key);
                    return key;
                }
            }

            // last resort - return null
            logger.warn("   ❌ Could not extract key from URL");
            return null;
        } catch (Exception e) {
            logger.warn("❌ [getKeyFromUrl] Failed to extract key from url={} cause={}", url, e.getMessage());
            return null;
        }
    }

    /**
     * ✅ Extract filename from S3 URL
     */
    public String extractFileNameFromUrl(String s3Url) {
        logger.info("🔍 [extractFileNameFromUrl] Extracting filename from URL");

        try {
            if (s3Url == null || s3Url.isEmpty()) {
                return null;
            }

            int lastSlash = s3Url.lastIndexOf("/");
            if (lastSlash >= 0 && lastSlash + 1 < s3Url.length()) {
                String fileName = s3Url.substring(lastSlash + 1);
                logger.info("   ✅ Extracted filename: {}", fileName);
                return fileName;
            }
            return null;

        } catch (Exception e) {
            logger.error("❌ [extractFileNameFromUrl] Error: {}", e.getMessage());
            return null;
        }
    }

    // ==================== EXISTENCE & METADATA CHECKS ====================

    /**
     * ✅ Check if an object exists in S3.
     */
    public boolean fileExists(String key) {
        Objects.requireNonNull(key, "key is required");

        logger.info("🔍 [fileExists] Checking if file exists: {}", key);

        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            s3Client.headObject(headRequest);
            logger.info("   ✅ File EXISTS");
            return true;
        } catch (NoSuchKeyException e) {
            logger.info("   ❌ File NOT FOUND");
            return false;
        } catch (Exception e) {
            logger.error("❌ [fileExists] Error checking if file exists. key={}, cause={}", key, e.getMessage(), e);
            return false;
        }
    }

    /**
     * ✅ Get file size in bytes
     */
    public long getFileSize(String key) {
        logger.info("📏 [getFileSize] Getting size for: {}", key);

        try {
            HeadObjectRequest headRequest = HeadObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            HeadObjectResponse headResponse = s3Client.headObject(headRequest);
            long size = headResponse.contentLength();

            logger.info("   Size: {} bytes", size);
            return size;

        } catch (NoSuchKeyException e) {
            logger.warn("   File not found");
            return 0;
        } catch (Exception e) {
            logger.error("❌ [getFileSize] Error: {}", e.getMessage(), e);
            return 0;
        }
    }

    // ==================== LIST OPERATIONS ====================

    /**
     * ✅ List all files in S3 bucket with given prefix
     */
    public List<String> listFiles(String prefix) {
        logger.info("📋 [listFiles] Listing files with prefix: {}", prefix);

        List<String> fileKeys = new ArrayList<>();

        try {
            ListObjectsV2Request listRequest = ListObjectsV2Request.builder()
                    .bucket(bucketName)
                    .prefix(prefix)
                    .build();

            ListObjectsV2Response listing = s3Client.listObjectsV2(listRequest);

            for (S3Object s3Object : listing.contents()) {
                fileKeys.add(s3Object.key());
            }

            logger.info("✅ [listFiles] Found {} files", fileKeys.size());
            return fileKeys;

        } catch (Exception e) {
            logger.error("❌ [listFiles] Error: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * ✅ Get all images for a property
     */
    public List<String> getPropertyImages(Long propertyId) {
        logger.info("📸 [getPropertyImages] Listing images for property: {}", propertyId);

        String prefix = String.format("properties/%d/images/", propertyId);
        return listFiles(prefix);
    }

    /**
     * ✅ Get all documents for a property
     */
    public List<String> getPropertyDocuments(Long propertyId) {
        logger.info("📄 [getPropertyDocuments] Listing documents for property: {}", propertyId);

        String prefix = String.format("properties/%d/documents/", propertyId);
        return listFiles(prefix);
    }

    // ==================== UTILITY METHODS ====================

    /**
     * ✅ Sanitize filename to remove special characters
     */
    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        // Remove special characters but keep extension
        String sanitized = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
        logger.debug("   Sanitized filename: {} -> {}", filename, sanitized);
        return sanitized;
    }

    /**
     * ✅ Get bucket name
     */
    public String getBucketName() {
        return bucketName;
    }

    /**
     * ✅ Get bucket region
     */
    public String getRegion() {
        return awsRegion.id();
    }
}