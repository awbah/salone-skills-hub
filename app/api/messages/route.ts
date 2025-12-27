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

    // Get all message threads where user is a participant
    const threads = await prisma.directMessageThread.findMany({
      where: {
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
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // Get last message
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Format threads with unread count
    const formattedThreads = await Promise.all(
      threads.map(async (thread) => {
        const otherParticipant = thread.participant1Id === userId 
          ? thread.participant2 
          : thread.participant1;

        const unreadCount = await prisma.directMessage.count({
          where: {
            threadId: thread.id,
            senderId: { not: userId },
            read: false,
          },
        });

        return {
          id: thread.id,
          otherParticipant: {
            id: otherParticipant.id,
            name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
            email: otherParticipant.email,
            role: otherParticipant.role,
          },
          lastMessage: thread.messages[0] 
            ? {
                id: thread.messages[0].id,
                body: thread.messages[0].body,
                senderId: thread.messages[0].senderId,
                senderName: `${thread.messages[0].sender.firstName} ${thread.messages[0].sender.lastName}`,
                createdAt: thread.messages[0].createdAt,
                read: thread.messages[0].read,
              }
            : null,
          unreadCount,
          updatedAt: thread.updatedAt,
        };
      })
    );

    return NextResponse.json({ threads: formattedThreads });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
