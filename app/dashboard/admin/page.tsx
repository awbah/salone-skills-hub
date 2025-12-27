"use client";

import { useEffect, useState } from "react";
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
  isEmailVerified: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        if (data.user.role !== "ADMIN") {
          router.push("/");
          return;
        }
        setUser(data.user);
      } catch (error) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);


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
        <DashboardSidebar role="ADMIN" />
        <div className="flex-1 flex flex-col" style={{ marginLeft: 'var(--sidebar-width, 80px)' }}>
          <main className="flex-grow transition-all duration-300 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Welcome Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  Welcome back{user.firstName ? `, ${user.firstName}` : ""}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">Manage the platform and users</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    Total Users
                  </h3>
                  <p className="text-3xl font-bold text-sierra-green">-</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    Total Jobs
                  </h3>
                  <p className="text-3xl font-bold text-sierra-blue">-</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">
                    Total Applications
                  </h3>
                  <p className="text-3xl font-bold text-purple-500">-</p>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Admin Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sierra-green transition-colors text-left bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Manage Users
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View and manage all registered users
                    </p>
                  </button>
                  <button className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sierra-green transition-colors text-left bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Manage Jobs
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View and manage all job postings
                    </p>
                  </button>
                  <button className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sierra-green transition-colors text-left bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      System Settings
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configure system-wide settings
                    </p>
                  </button>
                  <button className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sierra-green transition-colors text-left bg-gray-50/50">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Reports & Analytics
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      View system reports and analytics
                    </p>
                  </button>
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

