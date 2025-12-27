"use client";

import { useEffect, useState } from "react";

interface RecruitTalentModalProps {
  isOpen: boolean;
  onClose: () => void;
  talentId: number;
  talentName: string;
  onSuccess: () => void;
}

interface Job {
  id: number;
  title: string;
  type: string;
  status: string;
  location: string | null;
}

export default function RecruitTalentModal({
  isOpen,
  onClose,
  talentId,
  talentName,
  onSuccess,
}: RecruitTalentModalProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchJobs();
    } else {
      // Reset form when modal closes
      setSelectedJobId("");
      setMessage("");
      setError(null);
    }
  }, [isOpen]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/employer/jobs");
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      const data = await response.json();
      // Filter to only show OPEN jobs
      const openJobs = (data.jobs || []).filter((job: Job) => job.status === "OPEN");
      setJobs(openJobs);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      setError("Failed to load your job postings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedJobId) {
      setError("Please select a job posting");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/employer/recruit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          talentId,
          jobId: selectedJobId,
          message: message.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send recruitment invitation");
      }

      // Success - show appropriate message
      const successMsg = data.hasResume 
        ? "Recruitment invitation sent! Application created."
        : "Message sent! The talent will be notified to upload their CV.";
      
      // Success
      onSuccess();
      // Close after a brief delay to show success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      console.error("Error recruiting talent:", error);
      setError(error.message || "Failed to send recruitment invitation");
    } finally {
      setSubmitting(false);
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
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recruit {talentName}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Send a recruitment invitation for one of your job postings
              </p>
            </div>
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
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sierra-green"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading jobs...</p>
                </div>
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-12">
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
                  No open job postings
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  You need to have at least one open job posting to recruit talent.
                </p>
                <a
                  href="/dashboard/employer/post-job"
                  className="mt-4 inline-block px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium"
                >
                  Post a Job
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {/* Job Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Job Posting *
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => {
                      setSelectedJobId(e.target.value);
                      setError(null);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Choose a job posting...</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} ({getJobTypeLabel(job.type)})
                        {job.location && ` - ${job.location}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select the job you want to recruit this talent for
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    placeholder="Add a personal message to your recruitment invitation..."
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This message will be included in the recruitment invitation
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedJobId}
                    className="px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Send Recruitment Invitation
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

