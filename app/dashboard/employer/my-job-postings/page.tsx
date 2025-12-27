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
}

interface Job {
  id: number;
  title: string;
  description: string;
  type: "GIG" | "INTERNSHIP" | "PART_TIME" | "FULL_TIME";
  location: string | null;
  salaryRange: string | null;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  applicationCount: number;
  applicationsByStatus: {
    applied: number;
    shortlisted: number;
    hired: number;
    rejected: number;
  };
  skills: Array<{
    id: number;
    name: string;
    required: boolean;
  }>;
  hasContract: boolean;
  contractSeeker: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export default function MyJobPostingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user
        const userResponse = await fetch("/api/auth/me");
        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user");
        }
        const userData = await userResponse.json();
        if (userData.user.role !== "EMPLOYER") {
          router.push("/");
          return;
        }
        setUser(userData.user);

        // Fetch jobs
        await fetchJobs("ALL");
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const fetchJobs = async (status: "ALL" | "OPEN" | "CLOSED") => {
    try {
      const statusParam = status === "ALL" ? "" : `?status=${status}`;
      const jobsResponse = await fetch(`/api/employer/jobs${statusParam}`);
      if (!jobsResponse.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const jobsData = await jobsResponse.json();
      setJobs(jobsData.jobs || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load jobs. Please try again.");
    }
  };

  const handleFilterChange = (status: "ALL" | "OPEN" | "CLOSED") => {
    setFilterStatus(status);
    fetchJobs(status);
  };

  const getJobTypeLabel = (type: string) => {
    switch (type) {
      case "GIG":
        return "Freelance / Project-based";
      case "INTERNSHIP":
        return "Internship";
      case "PART_TIME":
        return "Part-time";
      case "FULL_TIME":
        return "Full-time";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sierra-green"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader user={user} />
      <div className="flex flex-1 pt-16">
        <DashboardSidebar role="EMPLOYER" />
        <div className="flex-1 flex flex-col" style={{ marginLeft: "var(--sidebar-width, 256px)" }}>
          <main className="flex-1 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      My Job Postings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Manage and track all your job postings
                    </p>
                  </div>
                  <Link
                    href="/dashboard/employer/post-job"
                    className="px-4 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Post a Job
                  </Link>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleFilterChange("ALL")}
                    className={`px-4 py-2 font-medium transition-colors ${
                      filterStatus === "ALL"
                        ? "text-sierra-green border-b-2 border-sierra-green"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                    }`}
                  >
                    All Jobs ({jobs.length})
                  </button>
                  <button
                    onClick={() => handleFilterChange("OPEN")}
                    className={`px-4 py-2 font-medium transition-colors ${
                      filterStatus === "OPEN"
                        ? "text-sierra-green border-b-2 border-sierra-green"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleFilterChange("CLOSED")}
                    className={`px-4 py-2 font-medium transition-colors ${
                      filterStatus === "CLOSED"
                        ? "text-sierra-green border-b-2 border-sierra-green"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white"
                    }`}
                  >
                    Closed
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Jobs List */}
              {jobs.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No job postings found
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {filterStatus === "ALL"
                      ? "Get started by posting your first job."
                      : `No ${filterStatus.toLowerCase()} jobs found.`}
                  </p>
                  {filterStatus === "ALL" && (
                    <div className="mt-6">
                      <Link
                        href="/dashboard/employer/post-job"
                        className="inline-flex items-center px-4 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium"
                      >
                        Post Your First Job
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {job.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                job.status === "OPEN"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {job.status}
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getJobTypeLabel(job.type)}
                            </span>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {job.location && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>{job.location}</span>
                              </div>
                            )}
                            {job.salaryRange && (
                              <div className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{job.salaryRange}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Posted {formatDate(job.createdAt)}</span>
                            </div>
                          </div>

                          {/* Skills */}
                          {job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills.slice(0, 5).map((skill) => (
                                <span
                                  key={skill.id}
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    skill.required
                                      ? "bg-sierra-green/10 text-sierra-green"
                                      : "bg-gray-100 text-gray-700 dark:text-gray-300 dark:text-gray-300"
                                  }`}
                                >
                                  {skill.name}
                                  {skill.required && (
                                    <span className="ml-1 text-sierra-green">*</span>
                                  )}
                                </span>
                              ))}
                              {job.skills.length > 5 && (
                                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:text-gray-300 dark:text-gray-300">
                                  +{job.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* Application Stats */}
                          <div className="flex items-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                                Applications:
                              </span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {job.applicationCount}
                              </span>
                            </div>
                            {job.applicationCount > 0 && (
                              <div className="flex items-center gap-4 text-xs">
                                <span className="text-blue-600">
                                  {job.applicationsByStatus.applied} Applied
                                </span>
                                <span className="text-yellow-600">
                                  {job.applicationsByStatus.shortlisted} Shortlisted
                                </span>
                                <span className="text-green-600">
                                  {job.applicationsByStatus.hired} Hired
                                </span>
                                {job.applicationsByStatus.rejected > 0 && (
                                  <span className="text-red-600">
                                    {job.applicationsByStatus.rejected} Rejected
                                  </span>
                                )}
                              </div>
                            )}
                            {job.hasContract && job.contractSeeker && (
                              <div className="flex items-center gap-2 text-xs">
                                <span className="px-2 py-1 rounded bg-purple-100 text-purple-800">
                                  Contract Active
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  with {job.contractSeeker.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="ml-4 flex flex-col gap-2">
                          <Link
                            href={`/dashboard/employer/jobs/${job.id}`}
                            className="px-4 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors text-sm font-medium text-center"
                          >
                            View Details
                          </Link>
                          {job.applicationCount > 0 && (
                            <Link
                              href={`/dashboard/employer/applications?jobId=${job.id}`}
                              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-center"
                            >
                              View Applications
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}

