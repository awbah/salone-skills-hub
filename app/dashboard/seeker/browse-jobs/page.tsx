"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import DashboardFooter from "@/app/components/DashboardFooter";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import JobDetailsModal from "@/app/components/JobDetailsModal";
import ApplicationFormModal from "@/app/components/ApplicationFormModal";

interface User {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isEmailVerified: boolean;
}

interface Job {
  id: number;
  title: string;
  description: string;
  type: string;
  location: string | null;
  salaryRange: string | null;
  matchScore?: number;
  matchingSkillsCount?: number;
  employer: {
    id: number;
    name: string;
    verified: boolean;
    companyLogo: {
      id: string;
      bucketKey: string;
      contentType: string | null;
    } | null;
  };
  skills: Array<{
    id?: number;
    name: string;
    slug: string;
    required: boolean;
  }>;
  createdAt: string;
}

export default function BrowseJobsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [applicationJobId, setApplicationJobId] = useState<number | null>(null);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("");

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
      fetchJobs();
    }
  }, [user, searchQuery, jobTypeFilter, locationFilter]);

  const fetchJobs = async () => {
    setJobsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (jobTypeFilter !== "all") params.append("type", jobTypeFilter);
      if (locationFilter) params.append("location", locationFilter);

      // Use recommended endpoint for skill-based matching
      const response = await fetch(`/api/jobs/recommended?${params.toString()}`);
      if (!response.ok) {
        if (response.status === 404) {
          const errorData = await response.json();
          setError(errorData.error || "Please complete your profile to see recommended jobs");
        } else {
          throw new Error("Failed to fetch jobs");
        }
      } else {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      setError(error.message || "Failed to load jobs");
    } finally {
      setJobsLoading(false);
    }
  };

  const handleViewJob = (jobId: number) => {
    setSelectedJobId(jobId);
    setIsModalOpen(true);
  };

  const handleApplyJob = (jobId: number) => {
    const job = jobs.find((j) => j.id === jobId);
    if (job) {
      setApplicationJobId(jobId);
      setIsApplicationFormOpen(true);
    }
  };

  const handleApplicationSuccess = () => {
    setIsApplicationFormOpen(false);
    setApplicationJobId(null);
    fetchJobs(); // Refresh jobs list
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
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
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
        <div className="flex-1 flex flex-col" style={{ marginLeft: 'var(--sidebar-width, 80px)' }}>
          <main className="flex-grow transition-all duration-300 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Browse Jobs
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Discover opportunities that match your skills and interests. Jobs are automatically recommended based on your profile skills.
                </p>
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Search Jobs
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title, skills..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Job Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Type
                    </label>
                    <select
                      value={jobTypeFilter}
                      onChange={(e) => setJobTypeFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="all">All Types</option>
                      <option value="GIG">Freelance / Project-based</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="PART_TIME">Part-time</option>
                      <option value="FULL_TIME">Full-time</option>
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      placeholder="Filter by location..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Jobs List */}
              {jobsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sierra-green"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
                  </div>
                </div>
              ) : jobs.length === 0 ? (
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
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No jobs found
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Try adjusting your search or filters to find more opportunities.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200 flex flex-col"
                    >
                      {/* Company Logo and Header */}
                      <div className="flex items-start gap-3 mb-4">
                        {job.employer.companyLogo ? (
                          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100">
                            <img
                              src={`/api/files/${job.employer.companyLogo.id}`}
                              alt={job.employer.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                if (target.nextElementSibling) {
                                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                            <div className="w-full h-full bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white text-xl font-bold hidden">
                              {job.employer.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white text-xl font-bold">
                            {job.employer.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {job.employer.name}
                            </h4>
                            {job.employer.verified && (
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {getJobTypeLabel(job.type)}
                          </span>
                        </div>
                      </div>

                      {/* Match Score Badge */}
                      {job.matchScore !== undefined && job.matchScore > 0 && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              {job.matchScore}% Match
                            </span>
                            {job.matchingSkillsCount !== undefined && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {job.matchingSkillsCount} skill{job.matchingSkillsCount !== 1 ? 's' : ''} match
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Job Title */}
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {job.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm flex-grow">
                        {job.description}
                      </p>

                      {/* Location and Salary */}
                      <div className="flex flex-col gap-2 mb-4 text-sm">
                        {job.location && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{job.location}</span>
                          </div>
                        )}
                        {job.salaryRange && (
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{job.salaryRange}</span>
                          </div>
                        )}
                      </div>

                      {/* Skills */}
                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {job.skills.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                skill.required
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {skill.name}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="px-2 py-0.5 rounded text-xs font-medium text-gray-600 dark:text-gray-400">
                              +{job.skills.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Posted Date */}
                      <div className="text-xs text-gray-500 mb-4">
                        Posted {formatDate(job.createdAt)}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 mt-auto">
                        <button
                          onClick={() => handleViewJob(job.id)}
                          className="w-full px-4 py-2 border border-sierra-green text-sierra-green rounded-lg hover:bg-sierra-green hover:text-white transition-colors font-medium text-sm"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleApplyJob(job.id)}
                          className="w-full px-4 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium text-sm"
                        >
                          Apply Now
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

      {/* Application Form Modal */}
      {applicationJobId && (
        <ApplicationFormModal
          jobId={applicationJobId}
          jobTitle={jobs.find((j) => j.id === applicationJobId)?.title || ""}
          isOpen={isApplicationFormOpen}
          onClose={() => {
            setIsApplicationFormOpen(false);
            setApplicationJobId(null);
          }}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
}

