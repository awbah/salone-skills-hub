"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function TalentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const talentId = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [talent, setTalent] = useState<Talent | null>(null);
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
        if (userData.user.role !== "EMPLOYER" && userData.user.role !== "ADMIN") {
          router.push("/");
          return;
        }
        setUser(userData.user);

        // Fetch talent details
        if (talentId) {
          const talentResponse = await fetch(`/api/talents/${talentId}`);
          if (!talentResponse.ok) {
            if (talentResponse.status === 404) {
              router.push("/dashboard/employer/browse-talent");
              return;
            }
            throw new Error("Failed to fetch talent");
          }
          const talentData = await talentResponse.json();
          setTalent(talentData.talent);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load talent profile. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router, talentId]);

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatYear = (year: number | null) => {
    return year ? year.toString() : "N/A";
  };

  const getSkillLevelLabel = (level: number | null) => {
    if (level === null) return "Not specified";
    if (level <= 2) return "Beginner";
    if (level <= 4) return "Intermediate";
    if (level <= 6) return "Advanced";
    return "Expert";
  };

  const getResumeUrl = () => {
    if (!talent?.resumeFile) return null;
    // This would typically be a presigned URL from S3
    return `/api/files/${talent.resumeFile.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sierra-green"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading talent profile...</p>
        </div>
      </div>
    );
  }

  if (!talent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Talent Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The talent profile you're looking for doesn't exist.</p>
          <Link
            href="/dashboard/employer/browse-talent"
            className="inline-block px-4 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors"
          >
            Back to Browse Talent
          </Link>
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
            <div className="max-w-5xl mx-auto">
              {/* Back Button */}
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900hover:text-white mb-6"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Browse Talent
              </button>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50bg-red-900/20 border border-red-200border-red-800 rounded-lg">
                  <p className="text-red-800text-red-200">{error}</p>
                </div>
              )}

              {/* Profile Header */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {talent.profilePhoto ? (
                    <img
                      src={talent.profilePhoto}
                      alt={talent.name}
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white font-semibold text-3xl">
                      {getInitials(talent.firstName, talent.lastName)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                          {talent.name}
                        </h1>
                        {talent.profession && (
                          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                            {talent.profession}
                          </p>
                        )}
                        {talent.headline && (
                          <p className="text-gray-700 dark:text-gray-300 mb-4">
                            {talent.headline}
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 text-sm font-medium rounded bg-blue-100 text-blue-800bg-blue-900/30text-blue-400">
                        {getPathwayLabel(talent.pathway)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {talent.yearsExperience !== null && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{talent.yearsExperience} years experience</span>
                        </div>
                      )}
                      {talent.availability && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>{talent.availability}</span>
                        </div>
                      )}
                      {talent.address && (
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>
                            {talent.address.city || talent.address.district || talent.address.region || "Location not specified"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contact and Resume */}
                    <div className="flex flex-wrap gap-3">
                      {talent.email && (
                        <a
                          href={`mailto:${talent.email}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Contact
                        </a>
                      )}
                      {talent.resumeFile && (
                        <a
                          href={getResumeUrl() || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Resume
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              {talent.bio && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{talent.bio}</p>
                </div>
              )}

              {/* Skills */}
              {talent.skills.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-3">
                    {talent.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center gap-2 px-4 py-2 bg-sierra-green/10bg-sierra-green/20 border border-sierra-green/30 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {skill.name}
                        </span>
                        {skill.level !== null && (
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            ({getSkillLevelLabel(skill.level)})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {talent.experiences.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Work Experience</h2>
                  <div className="space-y-4">
                    {talent.experiences.map((exp) => (
                      <div key={exp.id} className="border-l-2 border-sierra-green pl-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {exp.roleTitle || "Position"} at {exp.companyName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
                        </p>
                        {exp.description && (
                          <p className="text-gray-700 dark:text-gray-300 dark:text-gray-300">{exp.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {talent.education.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Education</h2>
                  <div className="space-y-4">
                    {talent.education.map((edu) => (
                      <div key={edu.id} className="border-l-2 border-blue-500 pl-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{edu.school}</h3>
                        {edu.credential && (
                          <p className="text-gray-700 dark:text-gray-300 dark:text-gray-300">{edu.credential}</p>
                        )}
                        {edu.field && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">{edu.field}</p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatYear(edu.startYear)} - {formatYear(edu.endYear)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocational Training */}
              {talent.trainings.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Vocational Training</h2>
                  <div className="space-y-4">
                    {talent.trainings.map((training) => (
                      <div key={training.id} className="border-l-2 border-green-500 pl-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{training.trainingName}</h3>
                        {training.institute && (
                          <p className="text-gray-700 dark:text-gray-300 dark:text-gray-300">{training.institute}</p>
                        )}
                        {training.certificate && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">Certificate: {training.certificate}</p>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(training.startDate)} - {training.endDate ? formatDate(training.endDate) : "Present"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {talent.portfolio.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Portfolio</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {talent.portfolio.map((item) => (
                      <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{item.description}</p>
                        )}
                        {item.linkUrl && (
                          <a
                            href={item.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-sierra-green hover:text-sierra-green-dark"
                          >
                            <span>View Project</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                <div className="space-y-2 text-gray-700 dark:text-gray-300 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${talent.email}`} className="hover:text-sierra-green">
                      {talent.email}
                    </a>
                  </div>
                  {talent.phone && (
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <a href={`tel:${talent.phone}`} className="hover:text-sierra-green">
                        {talent.phone}
                      </a>
                    </div>
                  )}
                  {talent.address && (
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div>
                        <p>{talent.address.addressLine1}</p>
                        {talent.address.addressLine2 && <p>{talent.address.addressLine2}</p>}
                        <p>
                          {[talent.address.city, talent.address.district, talent.address.region]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {talent.address.postalCode && <p>{talent.address.postalCode}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}

