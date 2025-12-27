import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;
    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // Filter by application status
    const jobId = searchParams.get("jobId"); // Filter by specific job
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get employer profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId },
      include: {
        jobs: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!employerProfile) {
      return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
    }

    const employerJobIds = employerProfile.jobs.map((job) => job.id);

    // Build where clause
    const where: any = {
      jobId: {
        in: employerJobIds,
      },
    };

    if (status && ["APPLIED", "SHORTLISTED", "HIRED", "REJECTED"].includes(status)) {
      where.status = status;
    }

    if (jobId) {
      const jobIdNum = parseInt(jobId);
      if (employerJobIds.includes(jobIdNum)) {
        where.jobId = jobIdNum;
      } else {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
    }

    // Fetch applications with related data
    const applications = await prisma.application.findMany({
      where,
      include: {
        job: {
          select: {
            id: true,
            title: true,
            type: true,
            location: true,
          },
        },
        user: {
          include: {
            seekerProfile: {
              select: {
                id: true,
                headline: true,
                profession: true,
                yearsExperience: true,
                skills: {
                  include: {
                    skill: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                  take: 5, // Limit to top 5 skills
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Format response
    const formattedApplications = applications.map((app) => ({
      id: app.id,
      status: app.status,
      expectedPay: app.expectedPay,
      createdAt: app.createdAt,
      job: {
        id: app.job.id,
        title: app.job.title,
        type: app.job.type,
        location: app.job.location,
      },
      applicant: {
        id: app.user.id,
        name: `${app.user.firstName} ${app.user.lastName}`,
        email: app.user.email,
        username: app.user.username,
        profile: app.user.seekerProfile
          ? {
              headline: app.user.seekerProfile.headline,
              profession: app.user.seekerProfile.profession,
              yearsExperience: app.user.seekerProfile.yearsExperience,
              skills: app.user.seekerProfile.skills.map((s) => ({
                id: s.skill.id,
                name: s.skill.name,
                level: s.level,
              })),
            }
          : null,
      },
      hasFiles: {
        coverLetter: !!app.coverLetterFileId,
        cv: !!app.cvFileId,
      },
    }));

    // Get total count for pagination
    const total = await prisma.application.count({ where });

    return NextResponse.json({
      applications: formattedApplications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching employer applications:", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

