import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFileUrl } from "@/lib/s3";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.fileId;

    // Get file object
    const fileObject = await prisma.fileObject.findUnique({
      where: { id: fileId },
    });

    if (!fileObject) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Generate presigned URL (valid for 1 hour)
    const url = await getFileUrl(fileObject.bucketKey, 3600);

    return NextResponse.json({
      url,
      bucketKey: fileObject.bucketKey,
      contentType: fileObject.contentType,
    });
  } catch (error: any) {
    console.error("Error getting profile photo URL:", error);
    return NextResponse.json(
      { error: "Failed to get profile photo URL" },
      { status: 500 }
    );
  }
}

