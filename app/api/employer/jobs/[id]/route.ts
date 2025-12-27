import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    // Get employer profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employerProfile) {
      return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
    }

    // Fetch job with all related data
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        employerId: employerProfile.id, // Ensure the job belongs to this employer
      },
      include: {
        applications: {
          select: {
            id: true,
            status: true,
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        contract: {
          include: {
            seeker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Format response
    const formattedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      type: job.type,
      location: job.location,
      salaryRange: job.salaryRange,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      // GIG/Freelance fields
      projectDuration: job.projectDuration,
      budget: job.budget,
      deadline: job.deadline,
      deliverables: job.deliverables,
      // INTERNSHIP fields
      internshipDuration: job.internshipDuration,
      stipend: job.stipend,
      startDate: job.startDate,
      learningObjectives: job.learningObjectives,
      // PART_TIME fields
      hoursPerWeek: job.hoursPerWeek,
      schedule: job.schedule,
      hourlyRate: job.hourlyRate,
      // FULL_TIME fields
      workArrangement: job.workArrangement,
      startDateFullTime: job.startDateFullTime,
      probationPeriod: job.probationPeriod,
      benefits: job.benefits,
      // Related data
      applicationCount: job._count.applications,
      applicationsByStatus: {
        applied: job.applications.filter((a) => a.status === "APPLIED").length,
        shortlisted: job.applications.filter((a) => a.status === "SHORTLISTED").length,
        hired: job.applications.filter((a) => a.status === "HIRED").length,
        rejected: job.applications.filter((a) => a.status === "REJECTED").length,
      },
      skills: job.skills.map((sj) => ({
        id: sj.skill.id,
        name: sj.skill.name,
        required: sj.required,
      })),
      hasContract: !!job.contract,
      contractSeeker: job.contract
        ? {
            id: job.contract.seeker.id,
            name: `${job.contract.seeker.firstName} ${job.contract.seeker.lastName}`,
            email: job.contract.seeker.email,
          }
        : null,
    };

    return NextResponse.json({ job: formattedJob });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 });
  }
}

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
    const jobId = parseInt(id);
    if (isNaN(jobId)) {
      return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      location,
      salaryRange,
      status,
      skills,
      // GIG fields
      projectDuration,
      budget,
      deadline,
      deliverables,
      // INTERNSHIP fields
      internshipDuration,
      stipend,
      startDate,
      learningObjectives,
      // PART_TIME fields
      hoursPerWeek,
      schedule,
      hourlyRate,
      // FULL_TIME fields
      workArrangement,
      startDateFullTime,
      probationPeriod,
      benefits,
    } = body;

    // Validate required fields
    if (!title || !description || !type) {
      return NextResponse.json(
        { error: "Title, description, and type are required" },
        { status: 400 }
      );
    }

    // Validate job type
    const validTypes = ["GIG", "INTERNSHIP", "PART_TIME", "FULL_TIME"];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid job type" },
        { status: 400 }
      );
    }

    // Validate job status
    const validStatuses = ["OPEN", "CLOSED"];
    const jobStatus = status && validStatuses.includes(status) ? status : undefined;

    // Get employer profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employerProfile) {
      return NextResponse.json(
        { error: "Employer profile not found" },
        { status: 404 }
      );
    }

    // Verify the job belongs to this employer
    const existingJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        employerId: employerProfile.id,
      },
    });

    if (!existingJob) {
      return NextResponse.json(
        { error: "Job not found or you don't have permission to update it" },
        { status: 404 }
      );
    }

    // Helper function to safely convert date strings to Date objects
    const parseDate = (dateString: string | null | undefined): Date | null => {
      if (!dateString || dateString.trim() === "") return null;
      try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    };

    // Helper function to safely trim strings and convert empty to null
    const safeTrim = (value: string | null | undefined): string | null => {
      if (!value || typeof value !== "string") return null;
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    };

    // Prepare update data
    const updateData: any = {
      title: title.trim(),
      description: description.trim(),
      type,
      location: safeTrim(location),
      salaryRange: safeTrim(salaryRange),
    };

    if (jobStatus) {
      updateData.status = jobStatus;
    }

    // Add GIG/Freelance fields
    updateData.projectDuration = safeTrim(projectDuration);
    updateData.budget = safeTrim(budget);
    updateData.deadline = parseDate(deadline);
    updateData.deliverables = safeTrim(deliverables);

    // Add INTERNSHIP fields
    updateData.internshipDuration = safeTrim(internshipDuration);
    updateData.stipend = safeTrim(stipend);
    updateData.startDate = parseDate(startDate);
    updateData.learningObjectives = safeTrim(learningObjectives);

    // Add PART_TIME fields
    updateData.hoursPerWeek = safeTrim(hoursPerWeek);
    updateData.schedule = safeTrim(schedule);
    updateData.hourlyRate = safeTrim(hourlyRate);

    // Add FULL_TIME fields
    updateData.workArrangement = safeTrim(workArrangement);
    updateData.startDateFullTime = parseDate(startDateFullTime);
    updateData.probationPeriod = safeTrim(probationPeriod);
    updateData.benefits = safeTrim(benefits);

    // Update job
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      // Delete existing skills
      await prisma.skillOnJob.deleteMany({
        where: { jobId },
      });

      // Add new skills
      if (skills.length > 0) {
        const skillIds = skills
          .map((s: any) => (typeof s === "object" && s.skillId ? s.skillId : s))
          .filter((id: any) => typeof id === "number");

        if (skillIds.length > 0) {
          const existingSkills = await prisma.skill.findMany({
            where: {
              id: { in: skillIds },
            },
          });

          const skillOnJobData = existingSkills.map((skill) => {
            const skillData = skills.find(
              (s: any) =>
                (typeof s === "object" && s.skillId === skill.id) || s === skill.id
            );
            return {
              jobId,
              skillId: skill.id,
              required:
                typeof skillData === "object" && skillData.required !== undefined
                  ? skillData.required
                  : true,
            };
          });

          if (skillOnJobData.length > 0) {
            await prisma.skillOnJob.createMany({
              data: skillOnJobData,
            });
          }
        }
      }
    }

    // Fetch updated job with skills
    const jobWithSkills = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      job: {
        id: jobWithSkills!.id,
        title: jobWithSkills!.title,
        description: jobWithSkills!.description,
        type: jobWithSkills!.type,
        location: jobWithSkills!.location,
        salaryRange: jobWithSkills!.salaryRange,
        status: jobWithSkills!.status,
        // GIG/Freelance fields
        projectDuration: jobWithSkills!.projectDuration,
        budget: jobWithSkills!.budget,
        deadline: jobWithSkills!.deadline,
        deliverables: jobWithSkills!.deliverables,
        // INTERNSHIP fields
        internshipDuration: jobWithSkills!.internshipDuration,
        stipend: jobWithSkills!.stipend,
        startDate: jobWithSkills!.startDate,
        learningObjectives: jobWithSkills!.learningObjectives,
        // PART_TIME fields
        hoursPerWeek: jobWithSkills!.hoursPerWeek,
        schedule: jobWithSkills!.schedule,
        hourlyRate: jobWithSkills!.hourlyRate,
        // FULL_TIME fields
        workArrangement: jobWithSkills!.workArrangement,
        startDateFullTime: jobWithSkills!.startDateFullTime,
        probationPeriod: jobWithSkills!.probationPeriod,
        benefits: jobWithSkills!.benefits,
        skills: jobWithSkills!.skills.map((sj) => ({
          id: sj.skill.id,
          name: sj.skill.name,
          required: sj.required,
        })),
        updatedAt: jobWithSkills!.updatedAt,
      },
      message: "Job updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating job:", error);

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || "Failed to update job. Please check all fields and try again.",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

