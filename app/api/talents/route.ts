import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only employers and admins can browse talents
    if (session.user.role !== "EMPLOYER" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.userId;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const pathway = searchParams.get("pathway"); // STUDENT, GRADUATE, ARTISAN
    const skillId = searchParams.get("skillId"); // Filter by skill ID
    const minExperience = searchParams.get("minExperience"); // Minimum years of experience
    const useMatching = searchParams.get("useMatching") !== "false"; // Default to true for skill matching
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get employer profile and their posted jobs' skills for matching
    let employerSkillIds: number[] = [];
    if (useMatching && session.user.role === "EMPLOYER") {
      const employerProfile = await prisma.employerProfile.findUnique({
        where: { userId },
        include: {
          jobs: {
            where: { status: "OPEN" },
            include: {
              skills: {
                include: {
                  skill: true,
                },
              },
            },
          },
        },
      });

      if (employerProfile && employerProfile.jobs.length > 0) {
        // Collect all unique skill IDs from all employer's open jobs
        const allJobSkills = employerProfile.jobs.flatMap((job) => job.skills);
        employerSkillIds = [...new Set(allJobSkills.map((sj) => sj.skillId))];
      }
    }

    // Build where clause for SeekerProfile
    const where: any = {
      user: {
        role: "JOB_SEEKER",
        isEmailVerified: true, // Only show verified users
      },
    };

    // Search filter (name, profession, headline, bio)
    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { profession: { contains: search, mode: "insensitive" } },
        { headline: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          },
        },
      ];
    }

    // Pathway filter
    if (pathway && ["STUDENT", "GRADUATE", "ARTISAN"].includes(pathway)) {
      where.pathway = pathway;
    }

    // Skill matching: If employer has posted jobs with skills, only show freelancers with matching skills
    if (useMatching && employerSkillIds.length > 0) {
      // If a specific skill is also selected, combine both conditions
      if (skillId) {
        const skillIdNum = parseInt(skillId);
        if (!isNaN(skillIdNum)) {
          // Show freelancers who have either the selected skill OR any of the employer's job skills
          where.skills = {
            some: {
              skillId: {
                in: [...employerSkillIds, skillIdNum],
              },
            },
          };
        }
      } else {
        // Only show freelancers who have at least one skill matching employer's job requirements
        where.skills = {
          some: {
            skillId: {
              in: employerSkillIds,
            },
          },
        };
      }
    } else if (skillId) {
      // Manual skill filter (when matching is disabled or no employer skills found)
      const skillIdNum = parseInt(skillId);
      if (!isNaN(skillIdNum)) {
        where.skills = {
          some: {
            skillId: skillIdNum,
          },
        };
      }
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

    // Fetch seekers with related data
    const seekers = await prisma.seekerProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
          take: 10, // Limit skills per profile
        },
        portfolio: {
          take: 3, // Limit portfolio items
        },
        _count: {
          select: {
            portfolio: true,
            experiences: true,
            education: true,
            trainings: true,
          },
        },
      },
      orderBy: {
        user: {
          createdAt: "desc",
        },
      },
      take: limit,
      skip: offset,
    });

    // Calculate match scores for each freelancer
    const talentsWithScores = seekers.map((seeker) => {
      const seekerSkillIds = seeker.skills.map((sp) => sp.skillId);
      let matchScore = 0;
      let matchingSkillsCount = 0;

      if (useMatching && employerSkillIds.length > 0) {
        const matchingSkills = seekerSkillIds.filter((skillId) =>
          employerSkillIds.includes(skillId)
        );
        matchingSkillsCount = matchingSkills.length;
        // Calculate match score as percentage of employer's required skills that the freelancer has
        matchScore = (matchingSkills.length / employerSkillIds.length) * 100;
      }

      return {
        id: seeker.id,
        userId: seeker.userId,
        name: `${seeker.user.firstName} ${seeker.user.lastName}`,
        firstName: seeker.user.firstName,
        lastName: seeker.user.lastName,
        email: seeker.user.email,
        phone: seeker.user.phone,
        profilePhoto: null, // Profile photos are stored in FileObject, not directly on User
        pathway: seeker.pathway,
        profession: seeker.profession,
        headline: seeker.headline,
        bio: seeker.bio,
        yearsExperience: seeker.yearsExperience,
        availability: seeker.availability,
        skills: seeker.skills.map((sp) => ({
          id: sp.skill.id,
          name: sp.skill.name,
          level: sp.level,
        })),
        matchScore: Math.round(matchScore),
        matchingSkillsCount,
        portfolioCount: seeker._count.portfolio,
        experienceCount: seeker._count.experiences,
        educationCount: seeker._count.education,
        trainingCount: seeker._count.trainings,
        portfolioItems: seeker.portfolio.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          linkUrl: item.linkUrl,
          fileId: item.fileId,
        })),
        createdAt: seeker.user.createdAt,
      };
    });

    // Sort by match score (highest first), then by creation date
    talentsWithScores.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const formattedTalents = talentsWithScores;

    // Get total count for pagination
    const total = await prisma.seekerProfile.count({ where });

    return NextResponse.json({
      talents: formattedTalents,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching talents:", error);
    return NextResponse.json({ error: "Failed to fetch talents" }, { status: 500 });
  }
}

