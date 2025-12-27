"use client";

import { useEffect, useState, useRef } from "react";

interface ApplicationFormModalProps {
  jobId: number;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SeekerProfile {
  resumeFileId: string | null;
  resumeFile: {
    id: string;
    bucketKey: string;
    contentType: string | null;
    sizeBytes: number | null;
  } | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function ApplicationFormModal({
  jobId,
  jobTitle,
  isOpen,
  onClose,
  onSuccess,
}: ApplicationFormModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seekerProfile, setSeekerProfile] = useState<SeekerProfile | null>(null);
  const [formData, setFormData] = useState({
    coverLetterText: "",
    expectedPay: "",
    coverLetterFileId: null as string | null,
  });
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const coverLetterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
      fetchSeekerProfile();
    } else {
      setIsAnimating(false);
      setFormData({
        coverLetterText: "",
        expectedPay: "",
        coverLetterFileId: null,
      });
      setError(null);
    }
  }, [isOpen]);

  const fetchSeekerProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile/seeker");
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setSeekerProfile({
        resumeFileId: data.profile.resumeFileId,
        resumeFile: data.profile.resumeFile,
        user: {
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          email: data.user.email,
        },
      });
    } catch (error: any) {
      console.error("Error fetching seeker profile:", error);
      setError("Failed to load profile information");
    } finally {
      setLoading(false);
    }
  };

  const handleCoverLetterUpload = async (file: File) => {
    setUploadingCoverLetter(true);
    try {
      // Get user ID from auth
      const authResponse = await fetch("/api/auth/me");
      if (!authResponse.ok) {
        throw new Error("Failed to get user information");
      }
      const authData = await authResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", "cover-letter");
      formData.append("userId", authData.user.userId.toString());

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload cover letter");
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, coverLetterFileId: data.fileId }));
      return data.fileId;
    } catch (error: any) {
      console.error("Error uploading cover letter:", error);
      alert(error.message || "Failed to upload cover letter");
      return null;
    } finally {
      setUploadingCoverLetter(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Validate that we have either CV or cover letter file
      if (!seekerProfile?.resumeFileId && !formData.coverLetterFileId) {
        setError("Please upload your CV/resume to your profile first, or upload a cover letter file");
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/applications/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId,
          coverLetterText: formData.coverLetterText || null,
          coverLetterFileId: formData.coverLetterFileId || seekerProfile?.resumeFileId || null,
          cvFileId: seekerProfile?.resumeFileId || null,
          expectedPay: formData.expectedPay ? parseInt(formData.expectedPay) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error submitting application:", error);
      setError(error.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-4xl bg-white dark:bg-gray-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Apply for Job
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {jobTitle}
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
          <div className="flex-1 overflow-y-auto p-6 custom-scroll">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sierra-green"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your profile...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Applicant Information */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={`${seekerProfile?.user.firstName || ""} ${seekerProfile?.user.lastName || ""}`}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={seekerProfile?.user.email || ""}
                        disabled
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* CV/Resume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    CV/Resume <span className="text-red-500">*</span>
                  </label>
                  {seekerProfile?.resumeFile ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {seekerProfile.resumeFile.bucketKey.split('/').pop() || "Resume"}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {seekerProfile.resumeFile.sizeBytes
                              ? `${(seekerProfile.resumeFile.sizeBytes / 1024).toFixed(2)} KB`
                              : "File uploaded"}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`/api/files/${seekerProfile.resumeFile.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sierra-green border border-sierra-green rounded-lg hover:bg-sierra-green hover:text-white transition-colors text-sm font-medium"
                      >
                        View
                      </a>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ Please upload your CV/resume in your profile settings before applying.
                      </p>
                      <a
                        href="/dashboard/seeker/settings"
                        className="mt-2 inline-block text-sm text-sierra-green hover:underline font-medium"
                      >
                        Go to Settings →
                      </a>
                    </div>
                  )}
                </div>

                {/* Cover Letter Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    value={formData.coverLetterText}
                    onChange={(e) => setFormData({ ...formData, coverLetterText: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Write a cover letter explaining why you're a good fit for this position..."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Optional: You can also upload a cover letter file below
                  </p>
                </div>

                {/* Cover Letter File */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cover Letter File (Optional)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      ref={coverLetterInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleCoverLetterUpload(file);
                        }
                      }}
                      disabled={uploadingCoverLetter}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sierra-green file:text-white hover:file:bg-sierra-green-dark disabled:opacity-50"
                    />
                    {uploadingCoverLetter && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-4 h-4 border-2 border-sierra-green border-t-transparent rounded-full animate-spin"></div>
                        Uploading...
                      </div>
                    )}
                  </div>
                  {formData.coverLetterFileId && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                      ✓ Cover letter file uploaded successfully
                    </p>
                  )}
                </div>

                {/* Expected Pay */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expected Pay (SLL)
                  </label>
                  <input
                    type="number"
                    value={formData.expectedPay}
                    onChange={(e) => setFormData({ ...formData, expectedPay: e.target.value })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 5000000"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Optional: Your expected salary or rate
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingCoverLetter || !seekerProfile?.resumeFileId}
                    className="flex-1 px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Submit Application
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

