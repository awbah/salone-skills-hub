"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

interface JobDetails {
  id: number;
  title: string;
  description: string;
  type: string;
  location: string | null;
  salaryRange: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  employer: {
    id: number;
    name: string;
    orgType: string | null;
    website: string | null;
    verified: boolean;
    companyLogo: {
      id: string;
      bucketKey: string;
      contentType: string | null;
    } | null;
    user: {
      name: string;
      email: string;
      phone: string | null;
    };
  };
  skills: Array<{
    name: string;
    slug: string;
    required: boolean;
  }>;
  // Job type specific fields
  projectDuration?: string | null;
  budget?: string | null;
  deadline?: string | null;
  deliverables?: string | null;
  internshipDuration?: string | null;
  stipend?: string | null;
  startDate?: string | null;
  learningObjectives?: string | null;
  hoursPerWeek?: string | null;
  schedule?: string | null;
  hourlyRate?: string | null;
  workArrangement?: string | null;
  startDateFullTime?: string | null;
  probationPeriod?: string | null;
  benefits?: string | null;
}

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const jobId = params?.id;
    if (jobId) {
      fetchJobDetails(Number(jobId));
    }
  }, [params]);

  const fetchJobDetails = async (jobId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Job not found");
        }
        throw new Error("Failed to fetch job details");
      }
      const data = await response.json();
      setJob(data);
    } catch (error: any) {
      console.error("Error fetching job details:", error);
      setError(error.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
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

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "bg-sierra-green text-white";
      case "PART_TIME":
        return "bg-sierra-blue text-white";
      case "INTERNSHIP":
        return "bg-purple-500 text-white";
      case "GIG":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const handleApply = () => {
    if (job) {
      router.push(`/login?redirect=/jobs/${job.id}&action=apply`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sierra-white via-blue-50 to-green-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-20">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sierra-green"></div>
              <p className="mt-4 text-gray-600">Loading job details...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sierra-white via-blue-50 to-green-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-20">
          <div className="text-center py-20">
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Job not found</h3>
            <p className="mt-1 text-sm text-gray-500">{error || "The job you're looking for doesn't exist."}</p>
            <div className="mt-6">
              <Link
                href="/jobs"
                className="inline-flex items-center px-4 py-2 bg-sierra-green text-white rounded-lg font-medium hover:bg-sierra-green-dark transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Jobs
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sierra-white via-blue-50 to-green-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-20">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/jobs"
            className="inline-flex items-center text-sierra-blue hover:text-sierra-blue-dark transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Jobs
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Job Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-start gap-6 mb-6">
              {job.employer.companyLogo ? (
                <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                  <img
                    src={`/api/files/${job.employer.companyLogo.id}`}
                    alt={job.employer.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = "flex";
                      }
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white text-3xl font-bold hidden">
                    {job.employer.name.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white text-3xl font-bold">
                  {job.employer.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1">
                    {job.title}
                  </h1>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ml-4 ${getJobTypeColor(
                      job.type
                    )}`}
                  >
                    {getJobTypeLabel(job.type)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-xl font-semibold text-sierra-blue">{job.employer.name}</p>
                  {job.employer.verified && (
                    <svg
                      className="w-5 h-5 text-sierra-green"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                {job.employer.orgType && (
                  <p className="text-gray-600 text-sm">{job.employer.orgType}</p>
                )}
              </div>
            </div>

            {/* Job Meta Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              {job.location && (
                <div className="flex items-center text-gray-700">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-500"
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
                  <span>{job.location}</span>
                </div>
              )}
              {job.salaryRange && (
                <div className="flex items-center text-sierra-green font-semibold">
                  <svg
                    className="w-5 h-5 mr-2"
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
                  <span>{job.salaryRange}</span>
                </div>
              )}
              <div className="flex items-center text-gray-600 text-sm">
                <svg
                  className="w-5 h-5 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Posted {formatDate(job.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
            </div>
          </div>

          {/* Job Type Specific Details */}
          {(job.type === "GIG" ||
            job.type === "INTERNSHIP" ||
            job.type === "PART_TIME" ||
            job.type === "FULL_TIME") && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {job.type === "GIG" && (
                  <>
                    {job.projectDuration && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Project Duration</h3>
                        <p className="text-gray-600">{job.projectDuration}</p>
                      </div>
                    )}
                    {job.budget && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Budget</h3>
                        <p className="text-gray-600">{job.budget}</p>
                      </div>
                    )}
                    {job.deadline && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Deadline</h3>
                        <p className="text-gray-600">{formatDate(job.deadline)}</p>
                      </div>
                    )}
                    {job.deliverables && (
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-gray-700 mb-1">Deliverables</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{job.deliverables}</p>
                      </div>
                    )}
                  </>
                )}
                {job.type === "INTERNSHIP" && (
                  <>
                    {job.internshipDuration && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Duration</h3>
                        <p className="text-gray-600">{job.internshipDuration}</p>
                      </div>
                    )}
                    {job.stipend && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Stipend</h3>
                        <p className="text-gray-600">{job.stipend}</p>
                      </div>
                    )}
                    {job.startDate && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Start Date</h3>
                        <p className="text-gray-600">{formatDate(job.startDate)}</p>
                      </div>
                    )}
                    {job.learningObjectives && (
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-gray-700 mb-1">Learning Objectives</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{job.learningObjectives}</p>
                      </div>
                    )}
                  </>
                )}
                {job.type === "PART_TIME" && (
                  <>
                    {job.hoursPerWeek && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Hours per Week</h3>
                        <p className="text-gray-600">{job.hoursPerWeek}</p>
                      </div>
                    )}
                    {job.schedule && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Schedule</h3>
                        <p className="text-gray-600">{job.schedule}</p>
                      </div>
                    )}
                    {job.hourlyRate && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Hourly Rate</h3>
                        <p className="text-gray-600">{job.hourlyRate}</p>
                      </div>
                    )}
                  </>
                )}
                {job.type === "FULL_TIME" && (
                  <>
                    {job.workArrangement && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Work Arrangement</h3>
                        <p className="text-gray-600">{job.workArrangement}</p>
                      </div>
                    )}
                    {job.startDateFullTime && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Start Date</h3>
                        <p className="text-gray-600">{formatDate(job.startDateFullTime)}</p>
                      </div>
                    )}
                    {job.probationPeriod && (
                      <div>
                        <h3 className="font-semibold text-gray-700 mb-1">Probation Period</h3>
                        <p className="text-gray-600">{job.probationPeriod}</p>
                      </div>
                    )}
                    {job.benefits && (
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-gray-700 mb-1">Benefits</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{job.benefits}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Required Skills */}
          {job.skills.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-3">
                {job.skills.map((skill) => (
                  <span
                    key={skill.slug}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      skill.required
                        ? "bg-sierra-green/10 text-sierra-green border-2 border-sierra-green"
                        : "bg-gray-100 text-gray-700 border border-gray-300"
                    }`}
                  >
                    {skill.name}
                    {skill.required && (
                      <span className="ml-2 text-xs font-semibold">(Required)</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Employer Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Employer</h2>
            <div className="space-y-3">
              <div>
                <span className="font-semibold text-gray-700">Organization: </span>
                <span className="text-gray-900">{job.employer.name}</span>
              </div>
              {job.employer.orgType && (
                <div>
                  <span className="font-semibold text-gray-700">Type: </span>
                  <span className="text-gray-600">{job.employer.orgType}</span>
                </div>
              )}
              {job.employer.website && (
                <div>
                  <span className="font-semibold text-gray-700">Website: </span>
                  <a
                    href={job.employer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sierra-blue hover:text-sierra-blue-dark hover:underline"
                  >
                    {job.employer.website}
                    <svg
                      className="w-4 h-4 inline ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Apply Button */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={handleApply}
              className="w-full px-6 py-4 bg-gradient-to-r from-sierra-green to-sierra-green-dark text-white rounded-lg font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <svg
                className="w-6 h-6"
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
              Apply for This Job
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              You'll need to log in to apply for this job
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

