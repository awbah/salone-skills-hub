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
    
    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
      "company-logo", // Use company-logo type for proper folder organization
      userId
    );

    // Get or create employer profile
    let profile = await prisma.employerProfile.findUnique({
      where: { userId },
    });

    // Update profile with company logo fileId
    if (profile) {
      profile = await prisma.employerProfile.update({
        where: { userId },
        data: {
          companyLogo: result.fileId,
        },
      });
    } else {
      // Create new profile if it doesn't exist
      profile = await prisma.employerProfile.create({
        data: {
          userId,
          orgName: "Company", // Temporary, will be updated when user fills the form
          companyLogo: result.fileId,
        },
      });
    }

    // Generate presigned URL for immediate display
    const { getFileUrl } = await import("@/lib/s3");
    const logoUrl = await getFileUrl(result.bucketKey, 3600); // 1 hour expiry

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      bucketKey: result.bucketKey,
      url: logoUrl,
      message: "Company logo uploaded successfully",
    });
  } catch (error: any) {
    console.error("Company logo upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload company logo" },
      { status: 500 }
    );
  }
}

