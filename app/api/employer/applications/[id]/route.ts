import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Update application status
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;
    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const applicationId = parseInt(id);
    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["APPLIED", "SHORTLISTED", "HIRED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Verify the application belongs to one of the employer's jobs
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            employer: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.job.employer.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        job: updatedApplication.job,
        applicant: {
          id: updatedApplication.user.id,
          name: `${updatedApplication.user.firstName} ${updatedApplication.user.lastName}`,
          email: updatedApplication.user.email,
        },
      },
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      { error: "Failed to update application status" },
      { status: 500 }
    );
  }
}

// Delete application
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;
    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const applicationId = parseInt(id);
    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    // Verify the application belongs to one of the employer's jobs
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            employer: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.job.employer.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete application
    await prisma.application.delete({
      where: { id: applicationId },
    });

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}

// Get single application details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;
    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const applicationId = parseInt(id);
    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    // Fetch application with full details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            employer: {
              select: {
                userId: true,
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            phone: true,
          },
          include: {
            seekerProfile: {
              include: {
                skills: {
                  include: {
                    skill: true,
                  },
                },
                education: true,
                experiences: true,
                portfolio: {
                  take: 5,
                },
              },
            },
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Verify ownership
    if (application.job.employer.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({
      application: {
        id: application.id,
        status: application.status,
        expectedPay: application.expectedPay,
        createdAt: application.createdAt,
        job: {
          id: application.job.id,
          title: application.job.title,
          description: application.job.description,
          type: application.job.type,
          location: application.job.location,
          salaryRange: application.job.salaryRange,
          skills: application.job.skills.map((sj) => ({
            id: sj.skill.id,
            name: sj.skill.name,
            required: sj.required,
          })),
        },
        applicant: {
          id: application.user.id,
          name: `${application.user.firstName} ${application.user.lastName}`,
          email: application.user.email,
          username: application.user.username,
          phone: application.user.phone,
          profile: application.user.seekerProfile
            ? {
                headline: application.user.seekerProfile.headline,
                profession: application.user.seekerProfile.profession,
                bio: application.user.seekerProfile.bio,
                yearsExperience: application.user.seekerProfile.yearsExperience,
                availability: application.user.seekerProfile.availability,
                skills: application.user.seekerProfile.skills.map((s) => ({
                  id: s.skill.id,
                  name: s.skill.name,
                  level: s.level,
                })),
                education: application.user.seekerProfile.education,
                experiences: application.user.seekerProfile.experiences,
                portfolio: application.user.seekerProfile.portfolio,
              }
            : null,
        },
        files: {
          coverLetterFileId: application.coverLetterFileId,
          cvFileId: application.cvFileId,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
  }
}

