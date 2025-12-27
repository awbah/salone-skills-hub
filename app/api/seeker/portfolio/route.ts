import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

// GET - Fetch all portfolio items for the logged-in seeker
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "JOB_SEEKER") {
      return NextResponse.json(
        { error: "Only job seekers can access portfolio" },
        { status: 403 }
      );
    }

    const userId = session.user.userId;

    // Get seeker profile
    const seekerProfile = await prisma.seekerProfile.findUnique({
      where: { userId },
      include: {
        portfolio: {
          include: {
            file: {
              select: {
                id: true,
                bucketKey: true,
                contentType: true,
                sizeBytes: true,
              },
            },
          },
          orderBy: {
            id: "desc",
          },
        },
      },
    });

    if (!seekerProfile) {
      return NextResponse.json(
        { error: "Seeker profile not found" },
        { status: 404 }
      );
    }

    const portfolioItems = seekerProfile.portfolio.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      linkUrl: item.linkUrl,
      file: item.file
        ? {
            id: item.file.id,
            bucketKey: item.file.bucketKey,
            contentType: item.file.contentType,
            sizeBytes: item.file.sizeBytes,
          }
        : null,
    }));

    return NextResponse.json({ portfolio: portfolioItems });
  } catch (error: any) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}

// POST - Create a new portfolio item
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "JOB_SEEKER") {
      return NextResponse.json(
        { error: "Only job seekers can create portfolio items" },
        { status: 403 }
      );
    }

    const userId = session.user.userId;
    const body = await request.json();
    const { title, description, linkUrl, fileId } = body;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Get seeker profile
    const seekerProfile = await prisma.seekerProfile.findUnique({
      where: { userId },
    });

    if (!seekerProfile) {
      return NextResponse.json(
        { error: "Seeker profile not found" },
        { status: 404 }
      );
    }

    // Verify file exists if provided
    if (fileId) {
      const file = await prisma.fileObject.findUnique({
        where: { id: fileId },
      });
      if (!file) {
        return NextResponse.json(
          { error: "File not found" },
          { status: 404 }
        );
      }
    }

    // Create portfolio item
    const portfolioItem = await prisma.portfolioItem.create({
      data: {
        profileId: seekerProfile.id,
        title: title.trim(),
        description: description?.trim() || null,
        linkUrl: linkUrl?.trim() || null,
        fileId: fileId || null,
      },
      include: {
        file: {
          select: {
            id: true,
            bucketKey: true,
            contentType: true,
            sizeBytes: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        portfolioItem: {
          id: portfolioItem.id,
          title: portfolioItem.title,
          description: portfolioItem.description,
          linkUrl: portfolioItem.linkUrl,
          file: portfolioItem.file
            ? {
                id: portfolioItem.file.id,
                bucketKey: portfolioItem.file.bucketKey,
                contentType: portfolioItem.file.contentType,
                sizeBytes: portfolioItem.file.sizeBytes,
              }
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating portfolio item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portfolio item" },
      { status: 500 }
    );
  }
}

