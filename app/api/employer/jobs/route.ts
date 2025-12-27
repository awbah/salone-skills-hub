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
    const status = searchParams.get("status"); // "OPEN" | "CLOSED" | null (all)
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Get employer profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employerProfile) {
      return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
    }

    // Build where clause
    const where: any = {
      employerId: employerProfile.id,
    };

    if (status === "OPEN" || status === "CLOSED") {
      where.status = status;
    }

    // Fetch jobs with application counts
    const jobs = await prisma.job.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });

    // Format response
    const formattedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      type: job.type,
      location: job.location,
      salaryRange: job.salaryRange,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
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
    }));

    // Get total count for pagination
    const total = await prisma.job.count({ where });

    return NextResponse.json({
      jobs: formattedJobs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching employer jobs:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;
    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

    // Validate job status (default to OPEN if not provided)
    const validStatuses = ["OPEN", "CLOSED"];
    const jobStatus = status && validStatuses.includes(status) ? status : "OPEN";

    // Get employer profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId },
    });

    if (!employerProfile) {
      return NextResponse.json(
        { error: "Employer profile not found. Please complete your company profile first." },
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

    // Create job with all fields
    const jobData: any = {
      employerId: employerProfile.id,
      title: title.trim(),
      description: description.trim(),
      type,
      location: safeTrim(location),
      salaryRange: safeTrim(salaryRange),
      status: jobStatus,
    };

    // Add GIG/Freelance fields
    jobData.projectDuration = safeTrim(projectDuration);
    jobData.budget = safeTrim(budget);
    jobData.deadline = parseDate(deadline);
    jobData.deliverables = safeTrim(deliverables);

    // Add INTERNSHIP fields
    jobData.internshipDuration = safeTrim(internshipDuration);
    jobData.stipend = safeTrim(stipend);
    jobData.startDate = parseDate(startDate);
    jobData.learningObjectives = safeTrim(learningObjectives);

    // Add PART_TIME fields
    jobData.hoursPerWeek = safeTrim(hoursPerWeek);
    jobData.schedule = safeTrim(schedule);
    jobData.hourlyRate = safeTrim(hourlyRate);

    // Add FULL_TIME fields
    jobData.workArrangement = safeTrim(workArrangement);
    jobData.startDateFullTime = parseDate(startDateFullTime);
    jobData.probationPeriod = safeTrim(probationPeriod);
    jobData.benefits = safeTrim(benefits);

    const job = await prisma.job.create({
      data: jobData,
    });

    // Add skills if provided
    if (skills && Array.isArray(skills) && skills.length > 0) {
      // Validate skill IDs exist
      const skillIds = skills.map((s: any) => 
        typeof s === "object" && s.skillId ? s.skillId : s
      ).filter((id: any) => typeof id === "number");

      if (skillIds.length > 0) {
        const existingSkills = await prisma.skill.findMany({
          where: {
            id: { in: skillIds },
          },
        });

        // Create SkillOnJob records
        const skillOnJobData = existingSkills.map((skill) => {
          const skillData = skills.find((s: any) => 
            (typeof s === "object" && s.skillId === skill.id) || s === skill.id
          );
          return {
            jobId: job.id,
            skillId: skill.id,
            required: typeof skillData === "object" && skillData.required !== undefined 
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

    // Fetch created job with skills
    const createdJob = await prisma.job.findUnique({
      where: { id: job.id },
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
        id: createdJob!.id,
        title: createdJob!.title,
        description: createdJob!.description,
        type: createdJob!.type,
        location: createdJob!.location,
        salaryRange: createdJob!.salaryRange,
        status: createdJob!.status,
        // GIG/Freelance fields
        projectDuration: createdJob!.projectDuration,
        budget: createdJob!.budget,
        deadline: createdJob!.deadline,
        deliverables: createdJob!.deliverables,
        // INTERNSHIP fields
        internshipDuration: createdJob!.internshipDuration,
        stipend: createdJob!.stipend,
        startDate: createdJob!.startDate,
        learningObjectives: createdJob!.learningObjectives,
        // PART_TIME fields
        hoursPerWeek: createdJob!.hoursPerWeek,
        schedule: createdJob!.schedule,
        hourlyRate: createdJob!.hourlyRate,
        // FULL_TIME fields
        workArrangement: createdJob!.workArrangement,
        startDateFullTime: createdJob!.startDateFullTime,
        probationPeriod: createdJob!.probationPeriod,
        benefits: createdJob!.benefits,
        skills: createdJob!.skills.map((sj) => ({
          id: sj.skill.id,
          name: sj.skill.name,
          required: sj.required,
        })),
        createdAt: createdJob!.createdAt,
      },
      message: "Job posted successfully",
    });
  } catch (error: any) {
    console.error("Error creating job:", error);
    
    // Handle Prisma errors specifically
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A job with this information already exists" },
        { status: 409 }
      );
    }
    
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid employer profile. Please complete your company profile first." },
        { status: 400 }
      );
    }

    // Handle field validation errors
    if (error.message?.includes("Unknown argument") || error.message?.includes("Unknown field")) {
      console.error("Database schema mismatch. Please run: npx prisma migrate dev");
      return NextResponse.json(
        { error: "Database schema needs to be updated. Please contact support." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: error.message || "Failed to create job. Please check all fields and try again.",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

