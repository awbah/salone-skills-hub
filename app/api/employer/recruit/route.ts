import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { talentId, jobId, message } = body;

    if (!talentId || !jobId) {
      return NextResponse.json(
        { error: "Talent ID and Job ID are required" },
        { status: 400 }
      );
    }

    const employerUserId = session.user.userId;

    // Get employer profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId: employerUserId },
    });

    if (!employerProfile) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    // Verify the job belongs to this employer
    const job = await prisma.job.findFirst({
      where: {
        id: parseInt(jobId),
        employerId: employerProfile.id,
      },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Job not found or you don't have permission" },
        { status: 404 }
      );
    }

    // Get talent's user ID from seeker profile
    const seekerProfile = await prisma.seekerProfile.findUnique({
      where: { id: parseInt(talentId) },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!seekerProfile) {
      return NextResponse.json({ error: "Talent not found" }, { status: 404 });
    }

    const talentUserId = seekerProfile.userId;

    // Check if application already exists
    const existingApplication = await prisma.application.findFirst({
      where: {
        jobId: job.id,
        userId: talentUserId,
      },
    });

    let application = null;
    if (existingApplication) {
      // Update status to SHORTLISTED if it's not already
      if (existingApplication.status !== "SHORTLISTED" && existingApplication.status !== "HIRED") {
        application = await prisma.application.update({
          where: { id: existingApplication.id },
          data: { status: "SHORTLISTED" },
        });
      } else {
        application = existingApplication;
      }
    } else {
      // Check if talent has a resume file
      const resumeFile = seekerProfile.resumeFileId
        ? await prisma.fileObject.findUnique({
            where: { id: seekerProfile.resumeFileId },
          })
        : null;

      if (resumeFile) {
        // Create a placeholder cover letter file (or use resume as both)
        const coverLetterFile = resumeFile;

        // Create application with SHORTLISTED status (employer-initiated)
        application = await prisma.application.create({
          data: {
            jobId: job.id,
            userId: talentUserId,
            status: "SHORTLISTED",
            coverLetterText: message || `You have been invited to apply for the position: ${job.title}`,
            coverLetterFileId: coverLetterFile.id,
            cvFileId: resumeFile.id,
          },
        });
      }
      // If no resume, we'll just send a message without creating an application
    }

    // Get employer user info for message
    const employerUser = await prisma.user.findUnique({
      where: { id: employerUserId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        employerProfile: {
          select: {
            orgName: true,
          },
        },
      },
    });

    const employerName = employerUser?.employerProfile?.orgName || 
      `${employerUser?.firstName || ""} ${employerUser?.lastName || ""}`.trim() || 
      "An employer";
    
    const organizationEmail = employerUser?.email || null;

    // Create or get direct message thread between employer and talent
    let thread = await prisma.directMessageThread.findFirst({
      where: {
        OR: [
          { participant1Id: employerUserId, participant2Id: talentUserId },
          { participant1Id: talentUserId, participant2Id: employerUserId },
        ],
      },
    });

    if (!thread) {
      // Create new thread (always put smaller ID as participant1)
      const [p1, p2] = employerUserId < talentUserId 
        ? [employerUserId, talentUserId] 
        : [talentUserId, employerUserId];
      
      thread = await prisma.directMessageThread.create({
        data: {
          participant1Id: p1,
          participant2Id: p2,
        },
      });
    }

    // Create recruitment message
    const hasResume = !!seekerProfile.resumeFileId;
    let recruitmentMessage = "";
    
    if (message) {
      recruitmentMessage = `Hi ${seekerProfile.user.firstName || "there"},\n\n${message}\n\n`;
    } else {
      recruitmentMessage = `Hi ${seekerProfile.user.firstName || "there"},\n\n`;
    }
    
    recruitmentMessage += `I'd like to invite you to apply for the position: ${job.title}.`;
    
    if (!hasResume) {
      if (organizationEmail) {
        recruitmentMessage += `\n\nPlease upload your CV to your profile or send it to ${organizationEmail} to proceed with your application.`;
      } else {
        recruitmentMessage += `\n\nPlease upload your CV to your profile to proceed with your application.`;
      }
    }
    
    recruitmentMessage += `\n\nBest regards,\n${employerName}`;

    await prisma.directMessage.create({
      data: {
        threadId: thread.id,
        senderId: employerUserId,
        body: recruitmentMessage,
        read: false,
      },
    });

    // Create notification for talent
    await prisma.notification.create({
      data: {
        userId: talentUserId,
        type: "RECRUITMENT",
        title: "New Recruitment Invitation",
        message: `${employerName} has invited you to apply for: ${job.title}`,
        link: `/dashboard/seeker/messages`,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: hasResume 
        ? "Recruitment invitation sent successfully! Application created."
        : "Recruitment message sent successfully! The talent will be notified to upload their CV.",
      application: application ? {
        id: application.id,
        status: application.status,
        talentName: `${seekerProfile.user.firstName} ${seekerProfile.user.lastName}`,
        jobTitle: job.title,
      } : null,
      hasResume,
    });
  } catch (error: any) {
    console.error("Error recruiting talent:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to send recruitment invitation",
      },
      { status: 500 }
    );
  }
}
