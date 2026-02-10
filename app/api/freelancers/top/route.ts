import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const topFreelancers = await prisma.seekerProfile.findMany({
      take: 3,
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
                id: true,
                name: true,
                slug: true,
              },
            },
          },
          take: 3,
        },
      },
      orderBy: {
        yearsExperience: "desc",
      },
    });

    const formatted = topFreelancers.map((profile) => ({
      id: profile.id,
      userId: profile.userId,
      name: `${profile.user.firstName} ${profile.user.lastName}`,
      profession: profile.profession || "Professional",
      headline: profile.headline || "",
      bio: profile.bio || "",
      yearsExperience: profile.yearsExperience || 0,
      pathway: profile.pathway,
      skills: profile.skills.map((sp) => ({
        name: sp.skill.name,
        slug: sp.skill.slug,
        level: sp.level || 1,
      })),
    }));

    return NextResponse.json({ freelancers: formatted });
  } catch (error: any) {
    console.error("Error fetching top freelancers:", error);
    return NextResponse.json(
      { error: "Failed to fetch freelancers" },
      { status: 500 }
    );
  }
}

