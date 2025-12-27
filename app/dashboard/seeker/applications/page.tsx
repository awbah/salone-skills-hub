"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import DashboardFooter from "@/app/components/DashboardFooter";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import JobDetailsModal from "@/app/components/JobDetailsModal";

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
    coverLetterText: string | null;
    expectedPay: number | null;
    createdAt: string;
    job: {
        id: number;
        title: string;
        description: string;
        type: string;
        location: string | null;
        salaryRange: string | null;
        employer: {
            name: string;
            verified: boolean;
            companyLogo: {
                id: string;
                bucketKey: string;
            } | null;
        };
        skills: Array<{
            name: string;
            slug: string;
            required: boolean;
        }>;
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

export default function MyApplicationsPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState<Application[]>([]);
    const [applicationsLoading, setApplicationsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch("/api/auth/me");
                if (!response.ok) {
                    router.push("/login");
                    return;
                }
                const data = await response.json();
                if (data.user.role !== "JOB_SEEKER") {
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
    }, [user, statusFilter]);

    const fetchApplications = async () => {
        setApplicationsLoading(true);
        setError(null);
        try {
            const url =
                statusFilter === "all"
                    ? "/api/seeker/applications"
                    : `/api/seeker/applications?status=${statusFilter}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error("Failed to fetch applications");
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

    const handleViewJob = (jobId: number) => {
        setSelectedJobId(jobId);
        setIsModalOpen(true);
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
                <div
                    className="flex-1 flex flex-col"
                    style={{ marginLeft: "var(--sidebar-width, 80px)" }}
                >
                    <main className="flex-grow transition-all duration-300 px-4 sm:px-6 lg:px-8 py-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <div className="mb-6">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    My Applications
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Track the status of your job applications
                                </p>
                            </div>

                            {/* Status Filter */}
                            <div className="mb-6 flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setStatusFilter("all")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        statusFilter === "all"
                                            ? "bg-sierra-green text-white"
                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900"
                                    }`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setStatusFilter("APPLIED")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        statusFilter === "APPLIED"
                                            ? "bg-blue-600 text-white"
                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900"
                                    }`}
                                >
                                    Applied
                                </button>
                                <button
                                    onClick={() => setStatusFilter("SHORTLISTED")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        statusFilter === "SHORTLISTED"
                                            ? "bg-yellow-600 text-white"
                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900"
                                    }`}
                                >
                                    Shortlisted
                                </button>
                                <button
                                    onClick={() => setStatusFilter("HIRED")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        statusFilter === "HIRED"
                                            ? "bg-green-600 text-white"
                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900"
                                    }`}
                                >
                                    Hired
                                </button>
                                <button
                                    onClick={() => setStatusFilter("REJECTED")}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        statusFilter === "REJECTED"
                                            ? "bg-red-600 text-white"
                                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:bg-gray-900"
                                    }`}
                                >
                                    Rejected
                                </button>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <p className="text-red-800">{error}</p>
                                </div>
                            )}

                            {/* Applications List */}
                            {applicationsLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sierra-green"></div>
                                        <p className="mt-4 text-gray-600 dark:text-gray-400">
                                            Loading applications...
                                        </p>
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
                                        {statusFilter === "all"
                                            ? "You haven't applied for any jobs yet."
                                            : `You don't have any ${getStatusLabel(
                                                statusFilter
                                            ).toLowerCase()} applications.`}
                                    </p>
                                    <a
                                        href="/dashboard/seeker/browse-jobs"
                                        className="mt-6 inline-block px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium"
                                    >
                                        Browse Jobs
                                    </a>
                                </div>
                            ) : (
                                // 🔹 GRID of three (responsive)
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {applications.map((application) => (
                                        <div
                                            key={application.id}
                                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow flex flex-col"
                                        >
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex items-start gap-4 mb-4">
                                                    {application.job.employer.companyLogo ? (
                                                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100">
                                                            <img
                                                                src={`/api/files/${application.job.employer.companyLogo.id}`}
                                                                alt={application.job.employer.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = "none";
                                                                    if (target.nextElementSibling) {
                                                                        (
                                                                            target.nextElementSibling as HTMLElement
                                                                        ).style.display = "flex";
                                                                    }
                                                                }}
                                                            />
                                                            <div className="w-full h-full bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white text-xl font-bold hidden">
                                                                {application.job.employer.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white text-xl font-bold">
                                                            {application.job.employer.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                                            {application.job.title}
                                                        </h3>
                                                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                            {application.job.employer.name}
                                                            {application.job.employer.verified && (
                                                                <span className="ml-2 inline-block px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800">
                                  Verified
                                </span>
                                                            )}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            {application.job.location && (
                                                                <span className="flex items-center gap-1">
                                  <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                  >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                                                    {application.job.location}
                                </span>
                                                            )}
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                {getJobTypeLabel(application.job.type)}
                              </span>
                                                            {application.job.salaryRange && (
                                                                <span className="flex items-center gap-1">
                                  <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                  >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                                                    {application.job.salaryRange}
                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Application Details */}
                                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                                    <div className="flex flex-wrap items-center gap-4 text-sm">
                                                        <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                                Status:
                              </span>
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                                                    application.status
                                                                )}`}
                                                            >
                                {getStatusLabel(application.status)}
                              </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                                Applied:
                              </span>
                                                            <span className="text-gray-600 dark:text-gray-400">
                                {new Date(
                                    application.createdAt
                                ).toLocaleDateString()}
                              </span>
                                                        </div>
                                                        {application.expectedPay && (
                                                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">
                                  Expected Pay:
                                </span>
                                                                <span className="text-gray-600 dark:text-gray-400">
                                  {application.expectedPay.toLocaleString()} SLL
                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => handleViewJob(application.job.id)}
                                                    className="px-4 py-2 border border-sierra-green text-sierra-green rounded-lg hover:bg-sierra-green hover:text-white transition-colors font-medium"
                                                >
                                                    View Job
                                                </button>
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

            {/* Job Details Modal */}
            {selectedJobId && (
                <JobDetailsModal
                    jobId={selectedJobId}
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedJobId(null);
                    }}
                />
            )}
        </div>
    );
}
