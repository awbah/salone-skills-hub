import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const type = searchParams.get("type");
    const location = searchParams.get("location");

    const where: any = {
      status: "OPEN",
    };

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
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
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

    const formatted = availableJobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      type: job.type,
      location: job.location,
      salaryRange: job.salaryRange,
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
        name: sj.skill.name,
        slug: sj.skill.slug,
        required: sj.required,
      })),
      createdAt: job.createdAt,
    }));

    return NextResponse.json({ jobs: formatted });
  } catch (error: any) {
    console.error("Error fetching available jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

