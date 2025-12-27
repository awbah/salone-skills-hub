import { uploadFileToS3, getBucketKeyPrefix, validateFile } from "./s3";
import { prisma } from "./prisma";

export interface UploadFileResult {
  fileId: string;
  bucketKey: string;
  url: string;
  sizeBytes: number;
}

/**
 * Upload a file and create a FileObject record in the database
 * @param file - File object from form data
 * @param fileType - Type of file being uploaded
 * @param userId - ID of the user uploading the file
 * @returns FileObject ID and metadata
 */
export async function uploadAndCreateFileRecord(
  file: File,
  fileType: "cv" | "cover-letter" | "resume" | "portfolio" | "profile-photo" | "company-logo" | "other",
  userId?: number
): Promise<UploadFileResult> {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Get appropriate folder prefix
  const folder = getBucketKeyPrefix(fileType);

  // Upload to S3
  const { bucketKey, etag, sizeBytes } = await uploadFileToS3(
    buffer,
    file.name,
    folder,
    file.type
  );

  // Create database record
  const fileObject = await prisma.fileObject.create({
    data: {
      bucketKey,
      contentType: file.type,
      sizeBytes,
      etag,
      createdById: userId,
    },
  });

  // Generate URL (for now, return bucket key - URL will be generated when needed)
  const url = bucketKey; // This will be replaced with presigned URL when accessed

  return {
    fileId: fileObject.id,
    bucketKey: fileObject.bucketKey,
    url,
    sizeBytes: fileObject.sizeBytes || 0,
  };
}

/**
 * Get file URL (presigned if needed)
 * @param fileId - FileObject ID
 * @param expiresIn - Expiration time for presigned URL in seconds
 * @returns File URL
 */
export async function getFileUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
  const fileObject = await prisma.fileObject.findUnique({
    where: { id: fileId },
  });

  if (!fileObject) {
    throw new Error("File not found");
  }

  // Import getFileUrl dynamically to avoid issues
  const { getFileUrl: getS3FileUrl } = await import("./s3");
  return getS3FileUrl(fileObject.bucketKey, expiresIn);
}

/**
 * Delete a file from S3 and database
 * @param fileId - FileObject ID
 */
export async function deleteFile(fileId: string): Promise<void> {
  const fileObject = await prisma.fileObject.findUnique({
    where: { id: fileId },
  });

  if (!fileObject) {
    throw new Error("File not found");
  }

  // Delete from S3
  const { deleteFileFromS3 } = await import("./s3");
  await deleteFileFromS3(fileObject.bucketKey);

  // Delete from database
  await prisma.fileObject.delete({
    where: { id: fileId },
  });
}

