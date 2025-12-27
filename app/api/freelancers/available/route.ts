import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const pathway = searchParams.get("pathway");
    const minExperience = searchParams.get("minExperience");

    const where: any = {
      user: {
        role: "JOB_SEEKER",
        isEmailVerified: true,
      },
    };

    // Pathway filter
    if (pathway && pathway !== "all" && ["STUDENT", "GRADUATE", "ARTISAN"].includes(pathway)) {
      where.pathway = pathway;
    }

    // Experience filter
    if (minExperience) {
      const minExp = parseInt(minExperience);
      if (!isNaN(minExp)) {
        where.yearsExperience = {
          gte: minExp,
        };
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { profession: { contains: search, mode: "insensitive" } },
        { headline: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    const freelancers = await prisma.seekerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        skills: {
          include: {
            skill: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
          take: 5,
        },
      },
      orderBy: {
        yearsExperience: "desc",
      },
    });

    const formatted = freelancers.map((profile) => ({
      id: profile.id,
      userId: profile.userId,
      name: `${profile.user.firstName} ${profile.user.lastName}`,
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
    }));

    return NextResponse.json({ freelancers: formatted });
  } catch (error: any) {
    console.error("Error fetching available freelancers:", error);
    return NextResponse.json(
      { error: "Failed to fetch freelancers" },
      { status: 500 }
    );
  }
}

