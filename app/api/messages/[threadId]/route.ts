import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;
    const { threadId } = await params;
    const threadIdNum = parseInt(threadId);

    // Verify user is a participant in this thread
    const thread = await prisma.directMessageThread.findFirst({
      where: {
        id: threadIdNum,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        participant2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found or access denied" },
        { status: 404 }
      );
    }

    // Get all messages in thread
    const messages = await prisma.directMessage.findMany({
      where: { threadId: threadIdNum },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages as read
    await prisma.directMessage.updateMany({
      where: {
        threadId: threadIdNum,
        senderId: { not: userId },
        read: false,
      },
      data: { read: true },
    });

    const otherParticipant = thread.participant1Id === userId 
      ? thread.participant2 
      : thread.participant1;

    return NextResponse.json({
      thread: {
        id: thread.id,
        otherParticipant: {
          id: otherParticipant.id,
          name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
          email: otherParticipant.email,
          role: otherParticipant.role,
        },
      },
      messages: messages.map((msg) => ({
        id: msg.id,
        body: msg.body,
        senderId: msg.senderId,
        senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
        isOwn: msg.senderId === userId,
        read: msg.read,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching thread messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await getSessionFromCookies();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.userId;
    const { threadId } = await params;
    const threadIdNum = parseInt(threadId);
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Verify user is a participant
    const thread = await prisma.directMessageThread.findFirst({
      where: {
        id: threadIdNum,
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      include: {
        participant1: true,
        participant2: true,
      },
    });

    if (!thread) {
      return NextResponse.json(
        { error: "Thread not found or access denied" },
        { status: 404 }
      );
    }

    // Create message
    const newMessage = await prisma.directMessage.create({
      data: {
        threadId: threadIdNum,
        senderId: userId,
        body: message.trim(),
        read: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Update thread updatedAt
    await prisma.directMessageThread.update({
      where: { id: threadIdNum },
      data: { updatedAt: new Date() },
    });

    // Create notification for recipient
    const recipientId = thread.participant1Id === userId 
      ? thread.participant2Id 
      : thread.participant1Id;

    const senderName = `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() || "Someone";

    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "MESSAGE",
        title: "New Message",
        message: `${senderName} sent you a message`,
        link: `/dashboard/${session.user.role === "EMPLOYER" ? "employer" : "seeker"}/messages`,
        read: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: {
        id: newMessage.id,
        body: newMessage.body,
        senderId: newMessage.senderId,
        senderName: `${newMessage.sender.firstName} ${newMessage.sender.lastName}`,
        isOwn: true,
        read: false,
        createdAt: newMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
