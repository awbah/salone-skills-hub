"use client";

import { useEffect, useState } from "react";
import RecruitTalentModal from "./RecruitTalentModal";

interface TalentProfileModalProps {
  talentId: number | null;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string; // To show recruit button only for employers
}

interface Talent {
  id: number;
  userId: number;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profilePhoto: string | null;
  gender: string | null;
  pathway: "STUDENT" | "GRADUATE" | "ARTISAN";
  profession: string | null;
  headline: string | null;
  bio: string | null;
  dateOfBirth: string | null;
  yearsExperience: number | null;
  availability: string | null;
  resumeFileId: string | null;
  resumeFile: {
    id: string;
    bucketKey: string;
    contentType: string | null;
    sizeBytes: number | null;
  } | null;
  skills: Array<{
    id: number;
    name: string;
    slug: string;
    level: number | null;
  }>;
  portfolio: Array<{
    id: number;
    title: string;
    description: string | null;
    linkUrl: string | null;
    fileId: string | null;
    file: {
      id: string;
      bucketKey: string;
      contentType: string | null;
    } | null;
  }>;
  education: Array<{
    id: number;
    school: string;
    credential: string | null;
    field: string | null;
    startYear: number | null;
    endYear: number | null;
  }>;
  trainings: Array<{
    id: number;
    trainingName: string;
    institute: string | null;
    certificate: string | null;
    startDate: string | null;
    endDate: string | null;
  }>;
  experiences: Array<{
    id: number;
    companyName: string;
    roleTitle: string | null;
    startDate: string | null;
    endDate: string | null;
    description: string | null;
  }>;
  address: {
    addressLine1: string;
    addressLine2: string | null;
    city: string | null;
    region: string | null;
    district: string | null;
    postalCode: string | null;
  } | null;
  createdAt: string;
}

export default function TalentProfileModal({ talentId, isOpen, onClose, userRole }: TalentProfileModalProps) {
  const [talent, setTalent] = useState<Talent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [recruitSuccess, setRecruitSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && talentId) {
      // Trigger animation after a brief delay to ensure the element is rendered
      setTimeout(() => setIsAnimating(true), 10);
      fetchTalentDetails();
    } else {
      setIsAnimating(false);
      setTalent(null);
      setError(null);
    }
  }, [isOpen, talentId]);

  const fetchTalentDetails = async () => {
    if (!talentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/talents/${talentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch talent details");
      }
      const data = await response.json();
      setTalent(data.talent);
    } catch (error: any) {
      console.error("Error fetching talent details:", error);
      setError(error.message || "Failed to load talent profile");
    } finally {
      setLoading(false);
    }
  };

  const getPathwayLabel = (pathway: string) => {
    switch (pathway) {
      case "STUDENT":
        return "Student";
      case "GRADUATE":
        return "Graduate";
      case "ARTISAN":
        return "Artisan";
      default:
        return pathway;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatMonthYear = (dateString: string | null | undefined) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };

  const handleResumeDownload = async (resumeFile: { id: string; bucketKey: string }) => {
    try {
      window.open(`/api/files/${resumeFile.id}`, "_blank");
    } catch (error) {
      console.error("Error downloading resume:", error);
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
        className="fixed inset-0 bg-black/50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-5xl bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Talent Profile</h2>
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
          <div className="flex-1 overflow-y-auto p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sierra-green"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading profile...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {!loading && !error && talent && (
              <div className="space-y-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                  <div className="relative w-32 h-32 flex-shrink-0">
                    {talent.profilePhoto ? (
                      <img
                        src={talent.profilePhoto}
                        alt={talent.name}
                        className="w-32 h-32 rounded-full border-4 border-sierra-green object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white text-5xl font-bold">
                        {getInitials(talent.firstName, talent.lastName)}
                      </div>
                    )}
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {talent.name}
                    </h3>
                    {talent.profession && (
                      <p className="text-sierra-green dark:text-sierra-green-300 text-lg mt-1">
                        {talent.profession}
                      </p>
                    )}
                    {talent.headline && (
                      <p className="text-gray-600 dark:text-gray-400 mt-2">{talent.headline}</p>
                    )}
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-3">
                      {talent.email && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {talent.email}
                        </span>
                      )}
                      {talent.phone && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {talent.phone}
                        </span>
                      )}
                      <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {getPathwayLabel(talent.pathway)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {talent.bio && (
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About Me</h4>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{talent.bio}</p>
                  </div>
                )}

                {/* Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Pathway:</p>
                    <p className="text-gray-900 dark:text-white font-semibold">{getPathwayLabel(talent.pathway)}</p>
                  </div>
                  {talent.yearsExperience !== null && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Years Experience:</p>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {talent.yearsExperience} {talent.yearsExperience === 1 ? "Year" : "Years"}
                      </p>
                    </div>
                  )}
                  {talent.availability && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Availability:</p>
                      <p className="text-gray-900 dark:text-white font-semibold">{talent.availability}</p>
                    </div>
                  )}
                  {talent.gender && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Gender:</p>
                      <p className="text-gray-900 dark:text-white font-semibold">{talent.gender}</p>
                    </div>
                  )}
                </div>

                {/* Skills */}
                {talent.skills.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {talent.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-3 py-1 rounded-full text-sm font-medium bg-sierra-green/10 text-sierra-green dark:bg-sierra-green/20 dark:text-sierra-green-300"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {talent.experiences.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Work Experience</h4>
                    <div className="space-y-4">
                      {talent.experiences.map((exp) => (
                        <div key={exp.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {exp.roleTitle || "N/A"} at {exp.companyName}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {formatMonthYear(exp.startDate)} - {formatMonthYear(exp.endDate)}
                          </p>
                          {exp.description && (
                            <p className="text-gray-700 dark:text-gray-300 mt-2 whitespace-pre-line">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {talent.education.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Education</h4>
                    <div className="space-y-4">
                      {talent.education.map((edu) => (
                        <div key={edu.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {edu.credential} in {edu.field}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {edu.school} ({edu.startYear} - {edu.endYear || "Present"})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vocational Training */}
                {talent.trainings.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Vocational Training</h4>
                    <div className="space-y-4">
                      {talent.trainings.map((train) => (
                        <div key={train.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {train.trainingName}
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {train.institute} ({formatMonthYear(train.startDate)} - {formatMonthYear(train.endDate)})
                          </p>
                          {train.certificate && (
                            <p className="text-gray-700 dark:text-gray-300 mt-2">
                              Certificate: {train.certificate}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Portfolio */}
                {talent.portfolio.length > 0 && (
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Portfolio</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {talent.portfolio.map((item) => (
                        <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            {item.title}
                          </h5>
                          {item.description && (
                            <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 line-clamp-3">
                              {item.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.linkUrl && (
                              <a
                                href={item.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                View Project
                              </a>
                            )}
                            {item.file && (
                              <a
                                href={`/api/files/${item.file.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13l-3 3m0 0l-3-3m3 3V8m0 13a9 9 0 110-18 9 9 0 010 18z" />
                                </svg>
                                View File
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex items-center gap-4">
                  {talent.resumeFile && (
                    <button
                      onClick={() => handleResumeDownload(talent.resumeFile!)}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Resume
                    </button>
                  )}
                  {userRole === "EMPLOYER" && (
                    <button
                      onClick={() => setShowRecruitModal(true)}
                      className="inline-flex items-center px-6 py-3 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Recruit This Talent
                    </button>
                  )}
                </div>

                {/* Success Message */}
                {recruitSuccess && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      ✓ Recruitment invitation sent successfully!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recruit Talent Modal */}
      {talent && (
        <RecruitTalentModal
          isOpen={showRecruitModal}
          onClose={() => {
            setShowRecruitModal(false);
            setRecruitSuccess(false);
          }}
          talentId={talent.id}
          talentName={talent.name}
          onSuccess={() => {
            setRecruitSuccess(true);
            setTimeout(() => setRecruitSuccess(false), 5000);
          }}
        />
      )}
    </>
  );
}

