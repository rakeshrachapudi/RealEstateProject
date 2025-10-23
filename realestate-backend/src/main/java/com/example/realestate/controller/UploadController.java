package com.example.realestate.controller;

import com.example.realestate.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Autowired
    private S3Service s3Service;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "No file uploaded"));

        try {
            Path tempFile = Files.createTempFile("upload-", file.getOriginalFilename());
            file.transferTo(tempFile.toFile());

            String s3Key = "properties/" + file.getOriginalFilename();
            String fileUrl = s3Service.uploadFile(s3Key, tempFile, file.getContentType());

            Files.deleteIfExists(tempFile);

            return ResponseEntity.ok(Map.of("success", true, "url", fileUrl));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", e.getMessage() != null ? e.getMessage() : "Unknown error"
            ));
        }
    }


    static class UploadResponse {
        public boolean success;
        public String url;
        public UploadResponse(boolean success, String url) { this.success = success; this.url = url; }
    }
}
