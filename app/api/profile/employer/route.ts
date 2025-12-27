import { NextRequest, NextResponse } from "next/server";
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employerProfile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        gender: user.gender,
      },
      profile: user.employerProfile, // Will be null if profile doesn't exist yet
    });
  } catch (error: any) {
    console.error("Error fetching employer profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const { orgName, orgType, website, companyLogo } = body;

    // Get or create employer profile
    let profile = await prisma.employerProfile.findUnique({
      where: { userId },
    });

    const profileData: any = {};
    if (orgName !== undefined) profileData.orgName = orgName;
    if (orgType !== undefined) profileData.orgType = orgType;
    if (website !== undefined) profileData.website = website;
    if (companyLogo !== undefined) profileData.companyLogo = companyLogo;

    if (profile) {
      // Update existing profile
      profile = await prisma.employerProfile.update({
        where: { userId },
        data: profileData,
      });
    } else {
      // Create new profile if it doesn't exist
      if (!orgName) {
        return NextResponse.json(
          { error: "Organization name is required for new profiles" },
          { status: 400 }
        );
      }
      profile = await prisma.employerProfile.create({
        data: {
          userId,
          orgName,
          ...profileData,
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile,
      message: "Profile updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating employer profile:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}

