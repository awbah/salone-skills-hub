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
  isEmailVerified: boolean;
}

interface Application {
  id: number;
  status: string;
  expectedPay: number | null;
  createdAt: string;
  job: {
    id: number;
    title: string;
    type: string;
    location: string | null;
  };
  applicant: {
    id: number;
    name: string;
    email: string;
    username: string;
    profile: {
      headline: string | null;
      profession: string | null;
      yearsExperience: number | null;
      skills: Array<{
        id: number;
        name: string;
        level: number | null;
      }>;
    } | null;
  };
  hasFiles: {
    coverLetter: boolean;
    cv: boolean;
  };
}

function getStatusColor(status: string) {
  switch (status) {
    case "APPLIED":
      return "bg-blue-100 text-blue-800";
    case "SHORTLISTED":
      return "bg-yellow-100 text-yellow-800";
    case "HIRED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "APPLIED":
      return "Applied";
    case "SHORTLISTED":
      return "Shortlisted";
    case "HIRED":
      return "Hired";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

function getJobTypeLabel(type: string) {
  switch (type) {
    case "GIG":
      return "Gig";
    case "INTERNSHIP":
      return "Internship";
    case "PART_TIME":
      return "Part-time";
    case "FULL_TIME":
      return "Full-time";
    default:
      return type;
  }
}

export default function EmployerApplicationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobFilter, setJobFilter] = useState<string>("all");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [changingStatus, setChangingStatus] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const menuRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

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
    if (user) {
      fetchApplications();
    }
  }, [user, statusFilter, jobFilter]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const menuElement = menuRefs.current[openMenuId];
        if (menuElement && !menuElement.contains(event.target as Node)) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

  const fetchApplications = async () => {
    setApplicationsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (jobFilter !== "all") {
        params.append("jobId", jobFilter);
      }

      const url = `/api/employer/applications${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch applications");
      }
      const data = await response.json();
      setApplications(data.applications || []);
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      setError(error.message || "Failed to load applications");
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: number, newStatus: string) => {
    setChangingStatus(applicationId);
    setOpenMenuId(null);
    try {
      const response = await fetch(`/api/employer/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update status");
      }

      // Refresh applications
      await fetchApplications();
    } catch (error: any) {
      console.error("Error updating status:", error);
      alert(error.message || "Failed to update application status");
    } finally {
      setChangingStatus(null);
    }
  };

  const handleDelete = async (applicationId: number) => {
    if (!confirm("Are you sure you want to delete this application? This action cannot be undone.")) {
      return;
    }

    setDeletingId(applicationId);
    setOpenMenuId(null);
    try {
      const response = await fetch(`/api/employer/applications/${applicationId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete application");
      }

      // Refresh applications
      await fetchApplications();
    } catch (error: any) {
      console.error("Error deleting application:", error);
      alert(error.message || "Failed to delete application");
    } finally {
      setDeletingId(null);
    }
  };

  const handleViewSeeker = (applicantId: number) => {
    router.push(`/dashboard/employer/talent/${applicantId}`);
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

  // Get unique jobs for filter
  const uniqueJobs = Array.from(
    new Map(applications.map((app) => [app.job.id, app.job])).values()
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} />
      <div className="flex flex-1 pt-16">
        <DashboardSidebar role="EMPLOYER" />
        <div className="flex-1 flex flex-col" style={{ marginLeft: 'var(--sidebar-width, 80px)' }}>
          <main className="flex-grow transition-all duration-300 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Job Applications
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Review and manage applications for your job postings
                </p>
              </div>

              {/* Filters */}
              <div className="mb-6 flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="APPLIED">Applied</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="HIRED">Hired</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Job
                  </label>
                  <select
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Jobs</option>
                    {uniqueJobs.map((job) => (
                      <option key={job.id} value={job.id.toString()}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Applications Table */}
              {applicationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sierra-green"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading applications...</p>
                  </div>
                </div>
              ) : applications.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No applications found
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {statusFilter === "all" && jobFilter === "all"
                      ? "You haven't received any applications yet."
                      : "No applications match your current filters."}
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applicant
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Job Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expected Pay
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Applied Date
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                        {applications.map((application) => (
                          <tr key={application.id} className="hover:bg-gray-50 dark:bg-gray-900">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white font-bold text-sm mr-3">
                                  {application.applicant.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {application.applicant.name}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {application.applicant.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {application.job.title}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {getJobTypeLabel(application.job.type)}
                                {application.job.location && ` • ${application.job.location}`}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}>
                                {getStatusLabel(application.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {application.expectedPay
                                ? `${application.expectedPay.toLocaleString()} SLL`
                                : "—"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(application.createdAt).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="relative inline-block" ref={(el) => (menuRefs.current[application.id] = el)}>
                                <button
                                  onClick={() => setOpenMenuId(openMenuId === application.id ? null : application.id)}
                                  className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 transition-colors"
                                  aria-label="Actions"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                  </svg>
                                </button>

                                {openMenuId === application.id && (
                                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                                    <div className="py-1">
                                      <button
                                        onClick={() => handleViewSeeker(application.applicant.id)}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        View Job Seeker
                                      </button>
                                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                      <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">
                                        Change Status
                                      </div>
                                      {["APPLIED", "SHORTLISTED", "HIRED", "REJECTED"].map((status) => (
                                        <button
                                          key={status}
                                          onClick={() => handleStatusChange(application.id, status)}
                                          disabled={changingStatus === application.id || application.status === status}
                                          className={`block w-full text-left px-4 py-2 text-sm ${
                                            application.status === status
                                              ? "bg-sierra-green/10 text-sierra-green font-medium"
                                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                          } ${changingStatus === application.id ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                          {changingStatus === application.id && application.status === status ? (
                                            <span className="flex items-center gap-2">
                                              <div className="w-4 h-4 border-2 border-sierra-green border-t-transparent rounded-full animate-spin"></div>
                                              Updating...
                                            </span>
                                          ) : (
                                            getStatusLabel(status)
                                          )}
                                        </button>
                                      ))}
                                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                      <button
                                        onClick={() => handleDelete(application.id)}
                                        disabled={deletingId === application.id}
                                        className={`block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 ${
                                          deletingId === application.id ? "opacity-50 cursor-not-allowed" : ""
                                        }`}
                                      >
                                        {deletingId === application.id ? (
                                          <span className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                            Deleting...
                                          </span>
                                        ) : (
                                          "Delete Application"
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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
