import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export interface SessionData {
  userId: number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isEmailVerified: boolean;
}

// Generate a secure session token
export function generateSessionToken(): string {
  return Buffer.from(`${Date.now()}-${Math.random()}`).toString("base64");
}

// Create a session
export async function createSession(userId: number): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires: expiresAt,
    },
  });

  return sessionToken;
}

// Get session from token
export async function getSession(sessionToken: string): Promise<SessionData | null> {
  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isEmailVerified: true,
        },
      },
    },
  });

  if (!session || session.expires < new Date()) {
    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    username: session.user.username,
    firstName: session.user.firstName,
    lastName: session.user.lastName,
    role: session.user.role,
    isEmailVerified: session.user.isEmailVerified,
  };
}

// Delete session
export async function deleteSession(sessionToken: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { sessionToken },
  });
}

// Get current user from cookies
export async function getCurrentUser(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  return getSession(sessionToken);
}

// Get session from cookies (returns session with user property for compatibility)
export async function getSessionFromCookies(): Promise<{ user: SessionData } | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          isEmailVerified: true,
        },
      },
    },
  });

  if (!session || session.expires < new Date()) {
    return null;
  }

  return {
    user: {
      userId: session.user.id,
      email: session.user.email,
      username: session.user.username,
      firstName: session.user.firstName,
      lastName: session.user.lastName,
      role: session.user.role,
      isEmailVerified: session.user.isEmailVerified,
    },
  };
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

