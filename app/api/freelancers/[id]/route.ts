import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profileId = parseInt(id);
    
    if (isNaN(profileId)) {
      return NextResponse.json(
        { error: "Invalid profile ID" },
        { status: 400 }
      );
    }

    const profile = await prisma.seekerProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        skills: {
          include: {
            skill: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        education: true,
        trainings: true,
        experiences: {
          orderBy: {
            startDate: "desc",
          },
        },
        portfolio: {
          take: 5,
          orderBy: {
            id: "desc",
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const formatted = {
      id: profile.id,
      userId: profile.userId,
      name: `${profile.user.firstName} ${profile.user.lastName}`,
      email: profile.user.email,
      phone: profile.user.phone,
      profession: profile.profession || "Professional",
      headline: profile.headline || "",
      bio: profile.bio || "",
      yearsExperience: profile.yearsExperience || 0,
      pathway: profile.pathway,
      availability: profile.availability,
      skills: profile.skills.map((sp) => ({
        name: sp.skill.name,
        slug: sp.skill.slug,
        level: sp.level || 1,
      })),
      education: profile.education,
      trainings: profile.trainings,
      experiences: profile.experiences,
      portfolio: profile.portfolio,
    };

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error fetching freelancer profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

