import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only employers and admins can view talent details
    if (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const seekerProfileId = parseInt(id);
    if (isNaN(seekerProfileId)) {
      return NextResponse.json({ error: "Invalid talent ID" }, { status: 400 });
    }

    // Fetch seeker profile with all related data
    const seeker = await prisma.seekerProfile.findUnique({
      where: { id: seekerProfileId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            gender: true,
            createdAt: true,
            addresses: {
              include: {
                region: true,
                district: true,
              },
            },
          },
        },
        skills: {
          include: {
            skill: true,
          },
          orderBy: {
            skill: {
              name: "asc",
            },
          },
        },
        portfolio: {
          include: {
            file: true,
          },
          orderBy: {
            id: "desc",
          },
        },
        education: {
          orderBy: {
            startYear: "desc",
          },
        },
        trainings: {
          orderBy: {
            startDate: "desc",
          },
        },
        experiences: {
          orderBy: {
            startDate: "desc",
          },
        },
        resumeFile: true,
      },
    });

    if (!seeker) {
      return NextResponse.json({ error: "Talent not found" }, { status: 404 });
    }

    // Format response
    const formattedTalent = {
      id: seeker.id,
      userId: seeker.userId,
      name: `${seeker.user.firstName} ${seeker.user.lastName}`,
      firstName: seeker.user.firstName,
      lastName: seeker.user.lastName,
      email: seeker.user.email,
      phone: seeker.user.phone,
      profilePhoto: null, // Profile photos are stored in FileObject, not directly on User
      gender: seeker.user.gender,
      pathway: seeker.pathway,
      profession: seeker.profession,
      headline: seeker.headline,
      bio: seeker.bio,
      dateOfBirth: seeker.dateOfBirth,
      yearsExperience: seeker.yearsExperience,
      availability: seeker.availability,
      resumeFileId: seeker.resumeFileId,
      resumeFile: seeker.resumeFile
        ? {
            id: seeker.resumeFile.id,
            bucketKey: seeker.resumeFile.bucketKey,
            contentType: seeker.resumeFile.contentType,
            sizeBytes: seeker.resumeFile.sizeBytes,
          }
        : null,
      skills: seeker.skills.map((sp) => ({
        id: sp.skill.id,
        name: sp.skill.name,
        slug: sp.skill.slug,
        level: sp.level,
      })),
      portfolio: seeker.portfolio.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        linkUrl: item.linkUrl,
        fileId: item.fileId,
        file: item.file
          ? {
              id: item.file.id,
              bucketKey: item.file.bucketKey,
              contentType: item.file.contentType,
            }
          : null,
      })),
      education: seeker.education.map((edu) => ({
        id: edu.id,
        school: edu.school,
        credential: edu.credential,
        field: edu.field,
        startYear: edu.startYear,
        endYear: edu.endYear,
      })),
      trainings: seeker.trainings.map((training) => ({
        id: training.id,
        trainingName: training.trainingName,
        institute: training.institute,
        certificate: training.certificate,
        startDate: training.startDate,
        endDate: training.endDate,
      })),
      experiences: seeker.experiences.map((exp) => ({
        id: exp.id,
        companyName: exp.companyName,
        roleTitle: exp.roleTitle,
        startDate: exp.startDate,
        endDate: exp.endDate,
        description: exp.description,
      })),
      address: seeker.user.addresses.length > 0
        ? {
            addressLine1: seeker.user.addresses[0].addressLine1,
            addressLine2: seeker.user.addresses[0].addressLine2,
            city: seeker.user.addresses[0].city,
            region: seeker.user.addresses[0].region?.name,
            district: seeker.user.addresses[0].district?.name,
            postalCode: seeker.user.addresses[0].postalCode,
          }
        : null,
      createdAt: seeker.user.createdAt,
    };

    return NextResponse.json({ talent: formattedTalent });
  } catch (error) {
    console.error("Error fetching talent details:", error);
    return NextResponse.json({ error: "Failed to fetch talent details" }, { status: 500 });
  }
}

