import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFileUrl } from "@/lib/s3";

export async function GET(
  request: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fileId = params.fileId;
    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // Fetch file record
    const fileObject = await prisma.fileObject.findUnique({
      where: { id: fileId },
    });

    if (!fileObject) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Get presigned URL from S3
    try {
      const fileUrl = await getFileUrl(fileObject.bucketKey);
      
      // Redirect to the file URL
      return NextResponse.redirect(fileUrl);
    } catch (error) {
      console.error("Error generating file URL:", error);
      return NextResponse.json(
        { error: "Failed to generate file URL" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 });
  }
}

