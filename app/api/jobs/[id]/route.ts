import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const jobId = parseInt(id);
    
    if (isNaN(jobId)) {
      return NextResponse.json(
        { error: "Invalid job ID" },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
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
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    const formatted = {
      id: job.id,
      title: job.title,
      description: job.description,
      type: job.type,
      location: job.location,
      salaryRange: job.salaryRange,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      // Job type specific fields
      projectDuration: job.projectDuration,
      budget: job.budget,
      deadline: job.deadline,
      deliverables: job.deliverables,
      internshipDuration: job.internshipDuration,
      stipend: job.stipend,
      startDate: job.startDate,
      learningObjectives: job.learningObjectives,
      hoursPerWeek: job.hoursPerWeek,
      schedule: job.schedule,
      hourlyRate: job.hourlyRate,
      workArrangement: job.workArrangement,
      startDateFullTime: job.startDateFullTime,
      probationPeriod: job.probationPeriod,
      benefits: job.benefits,
      employer: {
        id: job.employer.id,
        name: job.employer.orgName,
        orgType: job.employer.orgType,
        website: job.employer.website,
        verified: job.employer.verified,
        companyLogo: job.employer.companyLogoFile
          ? {
              id: job.employer.companyLogoFile.id,
              bucketKey: job.employer.companyLogoFile.bucketKey,
              contentType: job.employer.companyLogoFile.contentType,
            }
          : null,
        user: {
          name: `${job.employer.user.firstName} ${job.employer.user.lastName}`,
          email: job.employer.user.email,
          phone: job.employer.user.phone,
        },
      },
      skills: job.skills.map((sj) => ({
        name: sj.skill.name,
        slug: sj.skill.slug,
        required: sj.required,
      })),
    };

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error("Error fetching job details:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}

