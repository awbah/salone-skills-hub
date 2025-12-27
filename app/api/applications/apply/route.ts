import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;
    const body = await request.json();
    const { jobId, coverLetterText, coverLetterFileId, cvFileId, expectedPay } = body;

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    // Verify user is a job seeker
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { seekerProfile: true },
    });

    if (!user || user.role !== "JOB_SEEKER") {
      return NextResponse.json(
        { error: "Only job seekers can apply for jobs" },
        { status: 403 }
      );
    }

    if (!user.seekerProfile) {
      return NextResponse.json(
        { error: "Please complete your profile before applying" },
        { status: 400 }
      );
    }

    // Check if job exists and is open
    const job = await prisma.job.findUnique({
      where: { id: parseInt(jobId) },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== "OPEN") {
      return NextResponse.json(
        { error: "This job is no longer accepting applications" },
        { status: 400 }
      );
    }

    // Validate that we have either CV or cover letter file
    const finalCvFileId = cvFileId || user.seekerProfile.resumeFileId;
    const finalCoverLetterFileId = coverLetterFileId || user.seekerProfile.resumeFileId;

    if (!finalCvFileId && !finalCoverLetterFileId) {
      return NextResponse.json(
        {
          error: "Please upload your CV/resume to your profile or provide a cover letter file",
          requiresResume: true,
        },
        { status: 400 }
      );
    }

    // Verify files exist if provided
    if (finalCvFileId) {
      const cvFile = await prisma.fileObject.findUnique({
        where: { id: finalCvFileId },
      });
      if (!cvFile) {
        return NextResponse.json(
          { error: "CV file not found" },
          { status: 404 }
        );
      }
    }

    if (finalCoverLetterFileId) {
      const coverLetterFile = await prisma.fileObject.findUnique({
        where: { id: finalCoverLetterFileId },
      });
      if (!coverLetterFile) {
        return NextResponse.json(
          { error: "Cover letter file not found" },
          { status: 404 }
        );
      }
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        jobId: parseInt(jobId),
        userId: userId,
        coverLetterText: coverLetterText || null,
        coverLetterFileId: finalCoverLetterFileId!,
        cvFileId: finalCvFileId!,
        expectedPay: expectedPay ? parseInt(expectedPay) : null,
      },
      include: {
        job: {
          select: {
            title: true,
            employer: {
              select: {
                orgName: true,
              },
            },
          },
        },
      },
    });

    // Create notification for employer
    const employer = await prisma.employerProfile.findUnique({
      where: { id: job.employerId },
      select: { userId: true },
    });

    if (employer) {
      await prisma.notification.create({
        data: {
          userId: employer.userId,
          type: "APPLICATION_RECEIVED",
          title: "New Application Received",
          message: `${user.firstName} ${user.lastName} applied for: ${job.title}`,
          link: `/dashboard/employer/applications?jobId=${jobId}`,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Application submitted successfully",
        application: {
          id: application.id,
          status: application.status,
          job: application.job,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error applying for job:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}

