import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

// GET - Get a single portfolio item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const portfolioItemId = parseInt(id);

    if (isNaN(portfolioItemId)) {
      return NextResponse.json(
        { error: "Invalid portfolio item ID" },
        { status: 400 }
      );
    }

    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id: portfolioItemId },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
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

    if (!portfolioItem) {
      return NextResponse.json(
        { error: "Portfolio item not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (portfolioItem.profile.userId !== session.user.userId) {
      return NextResponse.json(
        { error: "You don't have permission to access this portfolio item" },
        { status: 403 }
      );
    }

    return NextResponse.json({
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
    });
  } catch (error: any) {
    console.error("Error fetching portfolio item:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio item" },
      { status: 500 }
    );
  }
}

// PATCH - Update a portfolio item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const portfolioItemId = parseInt(id);

    if (isNaN(portfolioItemId)) {
      return NextResponse.json(
        { error: "Invalid portfolio item ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, linkUrl, fileId } = body;

    // Get portfolio item and verify ownership
    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id: portfolioItemId },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!portfolioItem) {
      return NextResponse.json(
        { error: "Portfolio item not found" },
        { status: 404 }
      );
    }

    if (portfolioItem.profile.userId !== session.user.userId) {
      return NextResponse.json(
        { error: "You don't have permission to update this portfolio item" },
        { status: 403 }
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

    // Update portfolio item
    const updatedItem = await prisma.portfolioItem.update({
      where: { id: portfolioItemId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(linkUrl !== undefined && { linkUrl: linkUrl?.trim() || null }),
        ...(fileId !== undefined && { fileId: fileId || null }),
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

    return NextResponse.json({
      success: true,
      portfolioItem: {
        id: updatedItem.id,
        title: updatedItem.title,
        description: updatedItem.description,
        linkUrl: updatedItem.linkUrl,
        file: updatedItem.file
          ? {
              id: updatedItem.file.id,
              bucketKey: updatedItem.file.bucketKey,
              contentType: updatedItem.file.contentType,
              sizeBytes: updatedItem.file.sizeBytes,
            }
          : null,
      },
    });
  } catch (error: any) {
    console.error("Error updating portfolio item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update portfolio item" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a portfolio item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const portfolioItemId = parseInt(id);

    if (isNaN(portfolioItemId)) {
      return NextResponse.json(
        { error: "Invalid portfolio item ID" },
        { status: 400 }
      );
    }

    // Get portfolio item and verify ownership
    const portfolioItem = await prisma.portfolioItem.findUnique({
      where: { id: portfolioItemId },
      include: {
        profile: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!portfolioItem) {
      return NextResponse.json(
        { error: "Portfolio item not found" },
        { status: 404 }
      );
    }

    if (portfolioItem.profile.userId !== session.user.userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this portfolio item" },
        { status: 403 }
      );
    }

    // Delete portfolio item
    await prisma.portfolioItem.delete({
      where: { id: portfolioItemId },
    });

    return NextResponse.json({
      success: true,
      message: "Portfolio item deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting portfolio item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete portfolio item" },
      { status: 500 }
    );
  }
}

