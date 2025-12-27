import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadAndCreateFileRecord } from "@/lib/file-upload";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (only images)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit." },
        { status: 400 }
      );
    }

    // Upload file to S3 and create database record
    const result = await uploadAndCreateFileRecord(
      file,
      "profile-photo", // Use profile-photo type for proper folder organization
      userId
    );

    // Get user to check for existing profile photo
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Note: To store profilePhoto in User model, you need to add:
    // profilePhoto String? // FileObject.id
    // to the User model in schema.prisma and run migration
    // For now, we return the fileId which can be stored in a custom field or added later
    // The fileId is already saved in FileObject table and linked to the user via createdById

    // Generate presigned URL for immediate display
    const { getFileUrl } = await import("@/lib/s3");
    const photoUrl = await getFileUrl(result.bucketKey, 3600); // 1 hour expiry

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      bucketKey: result.bucketKey,
      url: photoUrl,
      message: "Profile photo uploaded successfully",
    });
  } catch (error: any) {
    console.error("Profile photo upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload profile photo" },
      { status: 500 }
    );
  }
}

