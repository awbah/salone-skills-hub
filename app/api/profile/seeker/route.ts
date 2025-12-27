import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;
    if (session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        seekerProfile: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
            education: true,
            trainings: true,
            experiences: true,
            portfolio: {
              take: 10,
            },
            resumeFile: {
              select: {
                id: true,
                bucketKey: true,
                contentType: true,
                sizeBytes: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.seekerProfile) {
      return NextResponse.json(
        { error: "Seeker profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
      },
      profile: user.seekerProfile,
    });
  } catch (error: any) {
    console.error("Error fetching seeker profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;
    if (session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      pathway,
      profession,
      headline,
      bio,
      dateOfBirth,
      yearsExperience,
      availability,
      resumeFileId,
    } = body;

    // Get or create seeker profile
    let profile = await prisma.seekerProfile.findUnique({
      where: { userId },
    });

    const profileData: any = {};
    if (pathway !== undefined) profileData.pathway = pathway;
    if (profession !== undefined) profileData.profession = profession;
    if (headline !== undefined) profileData.headline = headline;
    if (bio !== undefined) profileData.bio = bio;
    if (dateOfBirth !== undefined) profileData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (yearsExperience !== undefined) profileData.yearsExperience = yearsExperience;
    if (availability !== undefined) profileData.availability = availability;
    if (resumeFileId !== undefined) {
      // Verify file exists if provided
      if (resumeFileId) {
        const file = await prisma.fileObject.findUnique({
          where: { id: resumeFileId },
        });
        if (!file) {
          return NextResponse.json(
            { error: "Resume file not found" },
            { status: 404 }
          );
        }
      }
      profileData.resumeFileId = resumeFileId || null;
    }

    if (profile) {
      // Update existing profile
      profile = await prisma.seekerProfile.update({
        where: { userId },
        data: profileData,
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          resumeFile: {
            select: {
              id: true,
              bucketKey: true,
              contentType: true,
              sizeBytes: true,
            },
          },
        },
      });
    } else {
      // Create new profile if it doesn't exist
      if (!pathway) {
        return NextResponse.json(
          { error: "Pathway is required for new profiles" },
          { status: 400 }
        );
      }
      profile = await prisma.seekerProfile.create({
        data: {
          userId,
          pathway,
          ...profileData,
        },
        include: {
          skills: {
            include: {
              skill: true,
            },
          },
          resumeFile: {
            select: {
              id: true,
              bucketKey: true,
              contentType: true,
              sizeBytes: true,
            },
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating seeker profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

