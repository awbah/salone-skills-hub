import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, otp } = body;

    if (!userId || !otp) {
      return NextResponse.json(
        { error: "User ID and OTP are required" },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: parseInt(userId),
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Verify OTP
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    if (verificationToken.codeHash !== otpHash) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Update user email verification status
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isEmailVerified: true },
    });

    // Delete the used verification token
    await prisma.emailVerificationToken.delete({
      where: { id: verificationToken.id },
    });

    // Create session
    const sessionToken = await createSession(user.id);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    // Determine redirect URL based on role
    let redirectUrl = "/";
    if (user.role === "JOB_SEEKER") {
      redirectUrl = "/dashboard/seeker";
    } else if (user.role === "EMPLOYER") {
      redirectUrl = "/dashboard/employer";
    } else if (user.role === "ADMIN") {
      redirectUrl = "/dashboard/admin";
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully",
      redirectUrl,
      role: user.role,
    });
  } catch (error: any) {
    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}

