"use client";

import { useEffect, useState } from "react";
import ApplicationFormModal from "./ApplicationFormModal";

interface JobDetailsModalProps {
  jobId: number;
  isOpen: boolean;
  onClose: () => void;
}

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

export default function JobDetailsModal({ jobId, isOpen, onClose }: JobDetailsModalProps) {
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (isOpen && jobId) {
      setTimeout(() => setIsAnimating(true), 10);
      fetchJobDetails();
    } else {
      setIsAnimating(false);
      setJob(null);
      setError(null);
      setShowApplicationForm(false);
    }
  }, [isOpen, jobId]);

  const fetchJobDetails = async () => {
    if (!jobId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
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

  const handleApply = () => {
    if (!job) return;
    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = () => {
    // Optionally refresh job details or show success message
    fetchJobDetails();
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

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-5xl bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Details</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scroll">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sierra-green"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job details...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {!loading && !error && job && (
              <div className="space-y-6">
                {/* Job Header */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="flex items-start gap-4 mb-4">
                    {job.employer.companyLogo ? (
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700">
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
                        <div className="w-full h-full bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white text-2xl font-bold hidden">
                          {job.employer.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white text-2xl font-bold">
                        {job.employer.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {job.title}
                      </h1>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{job.employer.name}</span>
                        {job.employer.verified && (
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {job.location && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{job.location}</span>
                      </div>
                    )}
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                      {getJobTypeLabel(job.type)}
                    </span>
                    {job.salaryRange && (
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{job.salaryRange}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Job Description
                  </h2>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {job.description}
                    </p>
                  </div>
                </div>

                {/* Job Type Specific Details */}
                {(job.type === "GIG" || job.type === "INTERNSHIP" || job.type === "PART_TIME" || job.type === "FULL_TIME") && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Additional Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {job.type === "GIG" && (
                        <>
                          {job.projectDuration && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Project Duration: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.projectDuration}</span>
                            </div>
                          )}
                          {job.budget && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Budget: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.budget}</span>
                            </div>
                          )}
                          {job.deadline && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Deadline: </span>
                              <span className="text-gray-600 dark:text-gray-400">{formatDate(job.deadline)}</span>
                            </div>
                          )}
                          {job.deliverables && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Deliverables: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.deliverables}</span>
                            </div>
                          )}
                        </>
                      )}
                      {job.type === "INTERNSHIP" && (
                        <>
                          {job.internshipDuration && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Duration: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.internshipDuration}</span>
                            </div>
                          )}
                          {job.stipend && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Stipend: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.stipend}</span>
                            </div>
                          )}
                          {job.startDate && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Start Date: </span>
                              <span className="text-gray-600 dark:text-gray-400">{formatDate(job.startDate)}</span>
                            </div>
                          )}
                          {job.learningObjectives && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Learning Objectives: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.learningObjectives}</span>
                            </div>
                          )}
                        </>
                      )}
                      {job.type === "PART_TIME" && (
                        <>
                          {job.hoursPerWeek && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Hours per Week: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.hoursPerWeek}</span>
                            </div>
                          )}
                          {job.schedule && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Schedule: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.schedule}</span>
                            </div>
                          )}
                          {job.hourlyRate && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Hourly Rate: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.hourlyRate}</span>
                            </div>
                          )}
                        </>
                      )}
                      {job.type === "FULL_TIME" && (
                        <>
                          {job.workArrangement && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Work Arrangement: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.workArrangement}</span>
                            </div>
                          )}
                          {job.startDateFullTime && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Start Date: </span>
                              <span className="text-gray-600 dark:text-gray-400">{formatDate(job.startDateFullTime)}</span>
                            </div>
                          )}
                          {job.probationPeriod && (
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Probation Period: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.probationPeriod}</span>
                            </div>
                          )}
                          {job.benefits && (
                            <div className="md:col-span-2">
                              <span className="font-medium text-gray-700 dark:text-gray-300">Benefits: </span>
                              <span className="text-gray-600 dark:text-gray-400">{job.benefits}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Required Skills */}
                {job.skills.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Required Skills
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            skill.required
                              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Employer Info */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    About the Employer
                  </h2>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Organization: </span>
                      {job.employer.name}
                    </p>
                    {job.employer.orgType && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Type: </span>
                        {job.employer.orgType}
                      </p>
                    )}
                    {job.employer.website && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Website: </span>
                        <a
                          href={job.employer.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sierra-green hover:underline"
                        >
                          {job.employer.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* Apply Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <button
                    onClick={handleApply}
                    className="w-full px-6 py-3 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Apply for This Job
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {job && (
        <ApplicationFormModal
          jobId={job.id}
          jobTitle={job.title}
          isOpen={showApplicationForm}
          onClose={() => setShowApplicationForm(false)}
          onSuccess={handleApplicationSuccess}
        />
      )}
    </>
  );
}

