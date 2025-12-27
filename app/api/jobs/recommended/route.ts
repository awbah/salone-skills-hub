import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only job seekers can get recommended jobs
    if (session.user.role !== "JOB_SEEKER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.userId;
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const location = searchParams.get("location");

    // Get job seeker profile with skills
    const seekerProfile = await prisma.seekerProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    if (!seekerProfile) {
      return NextResponse.json(
        { error: "Job seeker profile not found. Please complete your profile first." },
        { status: 404 }
      );
    }

    // Get job seeker's skill IDs
    const seekerSkillIds = seekerProfile.skills.map((sp) => sp.skillId);

    // Build where clause
    const where: any = {
      status: "OPEN",
    };

    // If job seeker has skills, only show jobs that require at least one of those skills
    if (seekerSkillIds.length > 0) {
      where.skills = {
        some: {
          skillId: {
            in: seekerSkillIds,
          },
        },
      };
    }

    // Additional filters
    if (type && type !== "all") {
      where.type = type;
    }

    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    if (search) {
      // If search is provided, add it to OR conditions
      const searchConditions: any[] = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];

      // If we have skill matching, we need to combine it properly
      if (seekerSkillIds.length > 0) {
        where.AND = [
          {
            skills: {
              some: {
                skillId: {
                  in: seekerSkillIds,
                },
              },
            },
          },
          {
            OR: searchConditions,
          },
        ];
        delete where.skills;
      } else {
        where.OR = searchConditions;
      }
    }

    const availableJobs = await prisma.job.findMany({
      where,
      include: {
        employer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            companyLogoFile: {
              select: {
                id: true,
                bucketKey: true,
                contentType: true,
              },
            },
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate match score for each job (how many skills match)
    const jobsWithScores = availableJobs.map((job) => {
      const jobSkillIds = job.skills.map((sj) => sj.skillId);
      const matchingSkills = jobSkillIds.filter((skillId) =>
        seekerSkillIds.includes(skillId)
      );
      const matchScore = seekerSkillIds.length > 0 
        ? (matchingSkills.length / Math.max(seekerSkillIds.length, jobSkillIds.length)) * 100
        : 0;

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        type: job.type,
        location: job.location,
        salaryRange: job.salaryRange,
        matchScore: Math.round(matchScore),
        matchingSkillsCount: matchingSkills.length,
        employer: {
          id: job.employer.id,
          name: job.employer.orgName,
          verified: job.employer.verified,
          companyLogo: job.employer.companyLogoFile
            ? {
                id: job.employer.companyLogoFile.id,
                bucketKey: job.employer.companyLogoFile.bucketKey,
                contentType: job.employer.companyLogoFile.contentType,
              }
            : null,
        },
        skills: job.skills.map((sj) => ({
          id: sj.skill.id,
          name: sj.skill.name,
          slug: sj.skill.slug,
          required: sj.required,
        })),
        createdAt: job.createdAt,
      };
    });

    // Sort by match score (highest first), then by creation date
    jobsWithScores.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json({ 
      jobs: jobsWithScores,
      userSkills: seekerProfile.skills.map((sp) => ({
        id: sp.skill.id,
        name: sp.skill.name,
        level: sp.level,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching recommended jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommended jobs" },
      { status: 500 }
    );
  }
}

