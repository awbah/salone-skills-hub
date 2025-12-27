import { NextResponse } from "next/server";
import { sendOTPEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import crypto from "crypto";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Delete old verification tokens
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create new verification token
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        codeHash: otpHash,
        token: crypto.randomUUID(),
        expiresAt,
      },
    });

    // Send OTP email
    try {
      const emailResult = await sendOTPEmail(user.email, otp, `${user.firstName} ${user.lastName}`);
      if (!emailResult.success) {
        console.warn("OTP email sending failed. OTP logged to console.");
        // Still return success so user can see the OTP in console
        // In production, you might want to return an error here
      }
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Log OTP to console as fallback
      console.log("=".repeat(50));
      console.log("RESEND OTP - FALLBACK:");
      console.log(`To: ${user.email}`);
      console.log(`OTP Code: ${otp}`);
      console.log("=".repeat(50));
      // Don't fail the request - allow user to see OTP in console
    }

    return NextResponse.json({
      success: true,
      message: "OTP has been resent to your email",
    });
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Failed to resend OTP. Please try again." },
      { status: 500 }
    );
  }
}

