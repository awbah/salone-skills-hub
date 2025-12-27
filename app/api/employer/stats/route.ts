import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;
    if (session.user.role !== "EMPLOYER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get employer profile
    const employerProfile = await prisma.employerProfile.findUnique({
      where: { userId },
      include: {
        jobs: {
          include: {
            applications: true,
            contract: {
              include: {
                milestones: true,
              },
            },
          },
        },
      },
    });

    if (!employerProfile) {
      return NextResponse.json({ error: "Employer profile not found" }, { status: 404 });
    }

    // Calculate statistics
    const totalJobs = employerProfile.jobs.length;
    const activeJobs = employerProfile.jobs.filter((job) => job.status === "OPEN").length;
    const closedJobs = employerProfile.jobs.filter((job) => job.status === "CLOSED").length;

    const allApplications = employerProfile.jobs.flatMap((job) => job.applications);
    const totalApplications = allApplications.length;
    const pendingApplications = allApplications.filter(
      (app) => app.status === "APPLIED"
    ).length;
    const shortlistedApplications = allApplications.filter(
      (app) => app.status === "SHORTLISTED"
    ).length;
    const hiredApplications = allApplications.filter((app) => app.status === "HIRED").length;
    const rejectedApplications = allApplications.filter(
      (app) => app.status === "REJECTED"
    ).length;

    const activeContracts = employerProfile.jobs.filter((job) => job.contract).length;
    const contractsWithMilestones = employerProfile.jobs
      .filter((job) => job.contract)
      .map((job) => job.contract!)
      .filter((contract) => contract.status === "ACTIVE");

    const totalMilestones = contractsWithMilestones.reduce(
      (sum, contract) => sum + contract.milestones.length,
      0
    );
    const pendingMilestones = contractsWithMilestones.reduce(
      (sum, contract) =>
        sum +
        contract.milestones.filter(
          (m) => m.status === "PROPOSED" || m.status === "IN_PROGRESS"
        ).length,
      0
    );

    return NextResponse.json({
      stats: {
        jobs: {
          total: totalJobs,
          active: activeJobs,
          closed: closedJobs,
        },
        applications: {
          total: totalApplications,
          pending: pendingApplications,
          shortlisted: shortlistedApplications,
          hired: hiredApplications,
          rejected: rejectedApplications,
        },
        contracts: {
          active: activeContracts,
          totalMilestones,
          pendingMilestones,
        },
      },
      employerProfile: {
        orgName: employerProfile.orgName,
        orgType: employerProfile.orgType,
        website: employerProfile.website,
        verified: employerProfile.verified,
      },
    });
  } catch (error) {
    console.error("Error fetching employer stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch employer statistics" },
      { status: 500 }
    );
  }
}

