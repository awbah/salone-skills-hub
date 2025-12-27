"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import DashboardFooter from "@/app/components/DashboardFooter";
import DashboardSidebar from "@/app/components/DashboardSidebar";

interface User {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface MessageThread {
  id: number;
  otherParticipant: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  lastMessage: {
    id: number;
    body: string;
    senderId: number;
    senderName: string;
    createdAt: string;
    read: boolean;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

export default function SeekerMessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const userResponse = await fetch("/api/auth/me");
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user");
        }
        const userData = await userResponse.json();
        if (userData.user.role !== "JOB_SEEKER") {
          router.push("/");
          return;
        }
        setUser(userData.user);
        await fetchThreads();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  // Poll for new messages when a thread is selected
  useEffect(() => {
    if (selectedThread) {
      const interval = setInterval(() => {
        fetchMessages(selectedThread.id);
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [selectedThread]);

  const fetchThreads = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (threadId: number) => {
    try {
      const response = await fetch(`/api/messages/${threadId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setSelectedThread(data.thread);
        // Refresh threads to update unread count
        fetchThreads();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedThread || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/messages/${selectedThread.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages([...messages, data.message]);
        setNewMessage("");
        fetchThreads(); // Refresh to update last message
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-gray-700 border-t-sierra-green"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} />
      <div className="flex flex-1 pt-16">
        <DashboardSidebar role="JOB_SEEKER" />
        <div className="flex-1 flex flex-col" style={{ marginLeft: "var(--sidebar-width, 80px)" }}>
          <main className="flex-grow transition-all duration-300 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Messages</h1>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[calc(100vh-12rem)] flex">
                {/* Threads List */}
                <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Conversations</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {threads.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <p>No conversations yet</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {threads.map((thread) => (
                          <button
                            key={thread.id}
                            onClick={() => fetchMessages(thread.id)}
                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                              selectedThread?.id === thread.id ? "bg-gray-50 dark:bg-gray-900" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white font-semibold">
                                {thread.otherParticipant.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {thread.otherParticipant.name}
                                  </p>
                                  {thread.unreadCount > 0 && (
                                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-red-500 text-white">
                                      {thread.unreadCount}
                                    </span>
                                  )}
                                </div>
                                {thread.lastMessage && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {thread.lastMessage.body}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  {thread.lastMessage && formatTime(thread.lastMessage.createdAt)}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col">
                  {selectedThread ? (
                    <>
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {selectedThread.otherParticipant.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {selectedThread.otherParticipant.email}
                        </p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex items-end gap-2 ${message.isOwn ? "justify-end flex-row-reverse" : "justify-start"}`}
                          >
                            {/* Avatar for other user's messages (left side) */}
                            {!message.isOwn && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                {selectedThread.otherParticipant.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                            )}
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.isOwn
                                  ? "bg-sierra-green text-white rounded-br-none"
                                  : "bg-gray-100 text-gray-900 dark:text-white rounded-bl-none"
                              }`}
                            >
                              {!message.isOwn && (
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                                  {message.senderName}
                                </p>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.isOwn
                                    ? "text-white/70"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              >
                                {formatTime(message.createdAt)}
                              </p>
                            </div>
                            {/* Avatar for own messages (right side) */}
                            {message.isOwn && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                {user?.firstName && user?.lastName
                                  ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                                  : user?.email?.[0].toUpperCase() || "U"}
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            disabled={sending}
                          />
                          <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {sending ? "Sending..." : "Send"}
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <p className="mt-4">Select a conversation to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}

