import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";
import prisma from "@/lib/prisma";
import crypto from "crypto";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, username, password, phone, orgName, orgType, website } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !username || !password || !orgName) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email or username already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        phone: phone || null,
        role: "USER",
        isEmailVerified: false,
      },
    });

    // Create employer profile
    await prisma.employerProfile.create({
      data: {
        userId: user.id,
        orgName,
        orgType: orgType || null,
        website: website || null,
        verified: false,
      },
    });

    // Update user role to EMPLOYER
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "EMPLOYER" },
    });

    // Generate OTP
    const otp = generateOTP();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create verification token
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
      const emailResult = await sendOTPEmail(email, otp, `${firstName} ${lastName}`);
      if (!emailResult.success) {
        console.warn("OTP email sending failed, but registration continues. OTP logged to console.");
      }
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Continue even if email fails - user can request resend
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please verify your email.",
      userId: user.id,
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

