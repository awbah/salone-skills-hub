"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

interface DashboardStats {
  jobs: {
    total: number;
    active: number;
    closed: number;
  };
  applications: {
    total: number;
    pending: number;
    shortlisted: number;
    hired: number;
    rejected: number;
  };
  contracts: {
    active: number;
    totalMilestones: number;
    pendingMilestones: number;
  };
}

interface RecentApplication {
  id: number;
  status: string;
  createdAt: string;
  job: {
    id: number;
    title: string;
    type: string;
  };
  applicant: {
    id: number;
    name: string;
    email: string;
    profile: {
      headline: string | null;
      profession: string | null;
      yearsExperience: number | null;
    } | null;
  };
}

export default function EmployerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const data = await response.json();
        if (data.user.role !== "EMPLOYER") {
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

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return;

      try {
        // Fetch stats
        const statsResponse = await fetch("/api/employer/stats");
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData.stats);
        }

        // Fetch recent applications
        const applicationsResponse = await fetch("/api/employer/applications?limit=5");
        if (applicationsResponse.ok) {
          const applicationsData = await applicationsResponse.json();
          setRecentApplications(applicationsData.applications);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchDashboardData();
  }, [user]);


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
        <DashboardSidebar role="EMPLOYER" />
        <div className="flex-1 flex flex-col" style={{ marginLeft: 'var(--sidebar-width, 80px)' }}>
          <main className="flex-grow transition-all duration-300 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Welcome back{user.firstName ? `, ${user.firstName}` : ""}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your job postings and applications</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-sierra-green">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Active Jobs
              </h3>
              <p className="text-3xl font-bold text-sierra-green">
                {loadingStats ? (
                  <span className="text-gray-300">-</span>
                ) : (
                  stats?.jobs.active ?? 0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats ? `${stats.jobs.total} total` : ""}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-sierra-blue">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Total Applications
              </h3>
              <p className="text-3xl font-bold text-sierra-blue">
                {loadingStats ? (
                  <span className="text-gray-300">-</span>
                ) : (
                  stats?.applications.total ?? 0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats
                  ? `${stats.applications.pending} pending, ${stats.applications.shortlisted} shortlisted`
                  : ""}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Active Contracts
              </h3>
              <p className="text-3xl font-bold text-purple-500">
                {loadingStats ? (
                  <span className="text-gray-300">-</span>
                ) : (
                  stats?.contracts.active ?? 0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats
                  ? `${stats.contracts.pendingMilestones} pending milestones`
                  : ""}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border-l-4 border-orange-500">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                Hired Candidates
              </h3>
              <p className="text-3xl font-bold text-orange-500">
                {loadingStats ? (
                  <span className="text-gray-300">-</span>
                ) : (
                  stats?.applications.hired ?? 0
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats ? `${stats.applications.rejected} rejected` : ""}
              </p>
            </div>
          </div>

          {/* Recent Applications */}
          {recentApplications.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Applications
                </h2>
                <Link
                  href="/applications"
                  className="text-sm text-sierra-green hover:text-sierra-green-dark font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {recentApplications.map((application) => (
                  <Link
                    key={application.id}
                    href={`/applications/${application.id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sierra-green transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {application.applicant.name}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              application.status === "APPLIED"
                                ? "bg-blue-100 text-blue-800"
                                : application.status === "SHORTLISTED"
                                ? "bg-yellow-100 text-yellow-800"
                                : application.status === "HIRED"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {application.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Applied for: <span className="font-medium">{application.job.title}</span>
                        </p>
                        {application.applicant.profile?.headline && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {application.applicant.profile.headline}
                          </p>
                        )}
                        {application.applicant.profile?.yearsExperience && (
                          <p className="text-xs text-gray-500 mt-1">
                            {application.applicant.profile.yearsExperience} years experience
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/jobs/create"
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sierra-green transition-colors text-left bg-gray-50/50"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Post a New Job
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create a new job posting to attract talent
                </p>
              </Link>
              <Link
                href="/jobs/my-jobs"
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sierra-green transition-colors text-left bg-gray-50/50"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  My Job Postings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View and manage your job postings
                </p>
              </Link>
              <Link
                href="/applications"
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sierra-green transition-colors text-left bg-gray-50/50"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  View Applications
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review applications for your jobs
                </p>
              </Link>
              <Link
                href="/profile/employer"
                className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-sierra-green transition-colors text-left bg-gray-50/50"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Company Profile
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update your company information
                </p>
              </Link>
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

