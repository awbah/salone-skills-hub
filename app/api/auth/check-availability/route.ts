import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get("email");
    const username = searchParams.get("username");

    if (!email && !username) {
      return NextResponse.json(
        { error: "Either email or username must be provided" },
        { status: 400 }
      );
    }

    const checks: { email?: boolean; username?: boolean } = {};

    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      checks.email = !!existingEmail;
    }

    if (username) {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });
      checks.username = !!existingUsername;
    }

    return NextResponse.json({
      available: {
        email: email ? !checks.email : undefined,
        username: username ? !checks.username : undefined,
      },
      exists: checks,
    });
  } catch (error: any) {
    console.error("Check availability error:", error);
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}

