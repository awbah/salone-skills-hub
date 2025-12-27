"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SlideModal from "./SlideModal";

interface Job {
  id: number;
  title: string;
  description: string;
  type: string;
  location: string | null;
  salaryRange: string | null;
  employer: {
    name: string;
    verified: boolean;
  };
  skills: Array<{ name: string; slug: string; required: boolean }>;
  createdAt: string;
}

interface JobDetails extends Job {
  status?: string;
  updatedAt?: string;
  employer?: {
    id?: number;
    name: string;
    orgType?: string;
    website?: string;
    verified: boolean;
    user?: {
      name: string;
      email: string;
      phone: string;
    };
  };
}

export default function AvailableJobsSection() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetch("/api/jobs/available")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching jobs:", error);
        setLoading(false);
      });
  }, []);

  const handleViewDetails = async (jobId: number) => {
    setLoadingDetails(true);
    setIsModalOpen(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch job details");
      }
      const data = await response.json();
      setSelectedJob(data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      setSelectedJob(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleApply = (jobId: number) => {
    // Check if user is logged in (you can implement proper auth check later)
    // For now, always redirect to login
    window.location.href = `/login?redirect=/jobs/${jobId}&action=apply`;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
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

  const formatJobType = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sierra-green"></div>
          </div>
        </div>
      </section>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Available Jobs
            </h2>
            <p className="text-xl text-gray-600">
              Find your next opportunity in Sierra Leone
            </p>
          </div>
          <Link
            href="/jobs"
            className="hidden md:flex items-center space-x-2 px-6 py-3 bg-sierra-green text-white rounded-lg font-semibold hover:bg-sierra-green-dark transition-all duration-300 hover:scale-105"
          >
            <span>View All Jobs</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <div
              key={job.id}
              className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-sierra-green hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Job Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="text-sierra-blue font-semibold text-sm">
                      {job.employer.name}
                    </p>
                    {job.employer.verified && (
                      <svg
                        className="w-4 h-4 text-sierra-green"
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
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getJobTypeColor(
                    job.type
                  )}`}
                >
                  {formatJobType(job.type)}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {job.description}
              </p>

              {/* Location & Salary */}
              <div className="space-y-2 mb-4">
                {job.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <svg
                      className="w-4 h-4 mr-2"
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
                    {job.location}
                  </div>
                )}
                {job.salaryRange && (
                  <div className="flex items-center text-sm font-semibold text-sierra-green">
                    <svg
                      className="w-4 h-4 mr-2"
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
                    {job.salaryRange}
                  </div>
                )}
              </div>

              {/* Skills */}
              {job.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill.slug}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{job.skills.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleViewDetails(job.id)}
                  className="flex-1 px-4 py-3 bg-sierra-blue text-white rounded-lg font-semibold hover:bg-sierra-blue-dark transition-all duration-300"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleApply(job.id)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-sierra-green to-sierra-green-dark text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button - Mobile */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/jobs"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-sierra-green text-white rounded-lg font-semibold hover:bg-sierra-green-dark transition-all duration-300"
          >
            <span>View All Jobs</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Job Details Modal */}
      <SlideModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedJob ? selectedJob.title : "Job Details"}
      >
        {loadingDetails ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sierra-green"></div>
          </div>
        ) : selectedJob ? (
          <div className="space-y-6">
            {/* Job Header */}
            <div className="pb-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900 flex-1">
                  {selectedJob.title}
                </h3>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${getJobTypeColor(
                    selectedJob.type
                  )}`}
                >
                  {formatJobType(selectedJob.type)}
                </span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-sierra-blue font-semibold text-lg">
                  {selectedJob.employer?.name || "Employer"}
                </p>
                {selectedJob.employer?.verified && (
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
              {selectedJob.employer?.orgType && (
                <p className="text-gray-600 text-sm">{selectedJob.employer.orgType}</p>
              )}
            </div>

            {/* Job Details */}
            <div className="grid grid-cols-2 gap-4 pb-6 border-b">
              {selectedJob.location && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Location</h4>
                  <div className="flex items-center text-gray-700">
                    <svg
                      className="w-4 h-4 mr-2"
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
                    {selectedJob.location}
                  </div>
                </div>
              )}
              {selectedJob.salaryRange && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Salary Range</h4>
                  <div className="flex items-center text-sierra-green font-semibold">
                    <svg
                      className="w-4 h-4 mr-2"
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
                    {selectedJob.salaryRange}
                  </div>
                </div>
              )}
              {selectedJob.createdAt && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Posted</h4>
                  <p className="text-gray-700">
                    {new Date(selectedJob.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              {selectedJob.status && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 mb-1">Status</h4>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedJob.status === "OPEN"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedJob.status}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h4>
              <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedJob.description}
              </div>
            </div>

            {/* Required Skills */}
            {selectedJob.skills && selectedJob.skills.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.skills.map((skill) => (
                    <span
                      key={skill.slug}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        skill.required
                          ? "bg-sierra-green/10 text-sierra-green border border-sierra-green"
                          : "bg-gray-100 text-gray-700"
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
            {selectedJob.employer && (
              <div className="pt-6 border-t">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">About the Employer</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-gray-900">{selectedJob.employer.name}</p>
                  {selectedJob.employer.orgType && (
                    <p className="text-gray-600 text-sm">{selectedJob.employer.orgType}</p>
                  )}
                  {selectedJob.employer.website && (
                    <a
                      href={selectedJob.employer.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sierra-blue hover:text-sierra-blue-dark text-sm inline-flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-1"
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
                      {selectedJob.employer.website}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t flex gap-4">
              <button
                onClick={() => handleApply(selectedJob.id)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-sierra-green to-sierra-green-dark text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Apply Now
              </button>
              <Link
                href={`/jobs/${selectedJob.id}`}
                className="flex-1 px-6 py-3 bg-sierra-blue text-white rounded-lg font-semibold hover:bg-sierra-blue-dark transition-all duration-300 text-center"
              >
                View Full Job
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">Failed to load job details.</p>
          </div>
        )}
      </SlideModal>
    </section>
  );
}

