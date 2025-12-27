import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

// GET - Fetch all applications for the logged-in seeker
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "JOB_SEEKER") {
      return NextResponse.json(
        { error: "Only job seekers can access applications" },
        { status: 403 }
      );
    }

    const userId = session.user.userId;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {
      userId,
    };

    if (status && status !== "all") {
      where.status = status;
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          include: {
            employer: {
              select: {
                orgName: true,
                verified: true,
                companyLogoFile: {
                  select: {
                    id: true,
                    bucketKey: true,
                  },
                },
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
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const formatted = applications.map((app) => ({
      id: app.id,
      status: app.status,
      coverLetterText: app.coverLetterText,
      expectedPay: app.expectedPay,
      createdAt: app.createdAt,
      job: {
        id: app.job.id,
        title: app.job.title,
        description: app.job.description,
        type: app.job.type,
        location: app.job.location,
        salaryRange: app.job.salaryRange,
        employer: {
          name: app.job.employer.orgName,
          verified: app.job.employer.verified,
          companyLogo: app.job.employer.companyLogoFile,
        },
        skills: app.job.skills.map((sj) => ({
          name: sj.skill.name,
          slug: sj.skill.slug,
          required: sj.required,
        })),
      },
    }));

    return NextResponse.json({ applications: formatted });
  } catch (error: any) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

