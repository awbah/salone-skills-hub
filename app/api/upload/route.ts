import { NextRequest, NextResponse } from "next/server";
import { uploadAndCreateFileRecord } from "@/lib/file-upload";
import { validateFile } from "@/lib/s3";

/**
 * API Route for uploading files to S3
 * POST /api/upload
 * 
 * Form data:
 * - file: The file to upload
 * - fileType: Type of file (cv | cover-letter | resume | portfolio | other)
 * - userId: Optional user ID who is uploading the file
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string;
    const userId = formData.get("userId") ? parseInt(formData.get("userId") as string) : undefined;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!fileType) {
      return NextResponse.json(
        { error: "File type is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const validFileTypes: Array<"cv" | "cover-letter" | "resume" | "portfolio" | "profile-photo" | "other"> = [
      "cv",
      "cover-letter",
      "resume",
      "portfolio",
      "profile-photo",
      "other",
    ];

    if (!validFileTypes.includes(fileType as any)) {
      return NextResponse.json(
        { error: "Invalid file type. Must be one of: cv, cover-letter, resume, portfolio, profile-photo, other" },
        { status: 400 }
      );
    }

    // Validate file
    const maxSize = process.env.MAX_FILE_SIZE
      ? parseInt(process.env.MAX_FILE_SIZE)
      : 5 * 1024 * 1024; // 5MB default

    const allowedTypes = process.env.ALLOWED_FILE_TYPES
      ? process.env.ALLOWED_FILE_TYPES.split(",")
      : [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "image/jpeg",
          "image/png",
          "text/plain",
        ];

    const validation = validateFile(
      {
        size: file.size,
        type: file.type,
        name: file.name,
      },
      maxSize,
      allowedTypes
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Upload file to S3 and create database record
    const result = await uploadAndCreateFileRecord(
      file,
      fileType as "cv" | "cover-letter" | "resume" | "portfolio" | "profile-photo" | "other",
      userId
    );

    return NextResponse.json(
      {
        success: true,
        fileId: result.fileId,
        bucketKey: result.bucketKey,
        sizeBytes: result.sizeBytes,
        message: "File uploaded successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}

