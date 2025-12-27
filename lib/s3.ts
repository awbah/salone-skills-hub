import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// Support both AWS_* and S3_* environment variable naming conventions
// This allows compatibility with AWS S3, Supabase Storage, and other S3-compatible services
const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || "";
const REGION = process.env.AWS_REGION || process.env.S3_REGION || "us-east-1";
const ENDPOINT = process.env.AWS_S3_ENDPOINT || process.env.S3_ENDPOINT || "";
const FORCE_PATH_STYLE = 
  process.env.AWS_S3_FORCE_PATH_STYLE === "true" || 
  process.env.S3_FORCE_PATH_STYLE === "true";
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || process.env.S3_BUCKET || "salone-skillshub-files";
const CDN_URL = process.env.NEXT_PUBLIC_S3_URL;

// Validate credentials
const hasCredentials = 
  ACCESS_KEY_ID !== "" && 
  SECRET_ACCESS_KEY !== "";

// Initialize S3 Client
const s3Client = hasCredentials
  ? new S3Client({
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      },
      ...(ENDPOINT && {
        endpoint: ENDPOINT,
        forcePathStyle: FORCE_PATH_STYLE,
      }),
    })
  : null;

/**
 * Upload a file to S3
 * @param fileBuffer - The file buffer to upload
 * @param fileName - The original file name
 * @param folder - The folder path in S3 (e.g., "applications/cv", "profiles/resumes")
 * @param contentType - MIME type of the file
 * @returns Object with bucketKey and metadata
 */
export async function uploadFileToS3(
  fileBuffer: Buffer,
  fileName: string,
  folder: string,
  contentType: string
): Promise<{ bucketKey: string; etag: string; sizeBytes: number }> {
  // Check if S3 is configured
  if (!s3Client || !hasCredentials) {
    throw new Error(
      "S3 storage is not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME in your .env file. " +
      "For development, you can use a local file storage alternative or configure S3-compatible services like DigitalOcean Spaces or Cloudflare R2."
    );
  }

  // Generate unique file name to avoid collisions
  const fileExtension = fileName.split(".").pop() || "";
  const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;
  const bucketKey = `${folder}/${uniqueFileName}`;

  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: bucketKey,
    Body: fileBuffer,
    ContentType: contentType,
    // Make files private by default
    ACL: "private",
    // Add metadata
    Metadata: {
      originalName: fileName,
      uploadedAt: new Date().toISOString(),
    },
  });

  const response = await s3Client.send(command);
  const etag = response.ETag?.replace(/"/g, "") || "";

  return {
    bucketKey,
    etag,
    sizeBytes: fileBuffer.length,
  };
}

/**
 * Get a presigned URL to access a file
 * @param bucketKey - The S3 key of the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Presigned URL
 */
export async function getFileUrl(bucketKey: string, expiresIn: number = 3600): Promise<string> {
  // Check if S3 is configured
  if (!s3Client || !hasCredentials) {
    throw new Error(
      "S3 storage is not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME in your .env file."
    );
  }

  // If CDN URL is configured, return direct CDN URL
  if (CDN_URL) {
    return `${CDN_URL}/${bucketKey}`;
  }

  // Otherwise, generate presigned URL
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: bucketKey,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn });
  return url;
}

/**
 * Delete a file from S3
 * @param bucketKey - The S3 key of the file to delete
 */
export async function deleteFileFromS3(bucketKey: string): Promise<void> {
  // Check if S3 is configured
  if (!s3Client || !hasCredentials) {
    throw new Error(
      "S3 storage is not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET_NAME in your .env file."
    );
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: bucketKey,
  });

  await s3Client.send(command);
}

/**
 * Generate a bucket key for different file types
 */
export function getBucketKeyPrefix(fileType: "cv" | "cover-letter" | "resume" | "portfolio" | "profile-photo" | "company-logo" | "other"): string {
  const prefixes: Record<string, string> = {
    cv: "applications/cv",
    "cover-letter": "applications/cover-letters",
    resume: "profiles/resumes",
    portfolio: "profiles/portfolio",
    "profile-photo": "profiles/photos",
    "company-logo": "companies/logos",
    other: "misc",
  };

  return prefixes[fileType] || prefixes.other;
}

/**
 * Validate file size and type
 */
export function validateFile(
  file: File | { size: number; type: string; name: string },
  maxSize: number = 5 * 1024 * 1024, // 5MB default
  allowedTypes: string[] = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "text/plain",
  ]
): { valid: boolean; error?: string } {
  const fileSize = file instanceof File ? file.size : file.size;
  const fileType = file instanceof File ? file.type : file.type;
  // Check file size
  if (fileSize > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(fileType)) {
    return {
      valid: false,
      error: `File type ${fileType} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

