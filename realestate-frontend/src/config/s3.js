import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Never hardcode credentials in frontend for real projects. Use a backend to sign requests!
const REGION = `$`; // e.g., "ap-south-1"
const BUCKET_NAME = "YOUR_BUCKET_NAME";

export const s3Client = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: "YOUR_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_SECRET_ACCESS_KEY",
  },
});

export const uploadFileToS3 = async (file, key) => {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key, // e.g., `properties/${file.name}`
      Body: file,
      ContentType: file.type,
      ACL: "public-read", // optional if you want public URLs
    });

    await s3Client.send(command);
    const fileUrl = `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
    return { success: true, url: fileUrl };
  } catch (err) {
    console.error("S3 Upload Error:", err);
    return { success: false, error: err.message };
  }
};
