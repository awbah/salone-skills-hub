"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

interface FreelancerDetails {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string | null;
  profession: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  pathway: string;
  availability: string | null;
  skills: Array<{
    name: string;
    slug: string;
    level: number;
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
    title: string;
    company: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
  }>;
  portfolio: Array<{
    id: number;
    title: string;
    description: string | null;
    linkUrl: string | null;
    fileId: string | null;
  }>;
}

export default function FreelancerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [freelancer, setFreelancer] = useState<FreelancerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const freelancerId = params?.id;
    if (freelancerId) {
      fetchFreelancerDetails(Number(freelancerId));
    }
  }, [params]);

  const fetchFreelancerDetails = async (freelancerId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/freelancers/${freelancerId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Freelancer not found");
        }
        throw new Error("Failed to fetch freelancer details");
      }
      const data = await response.json();
      setFreelancer(data);
    } catch (error: any) {
      console.error("Error fetching freelancer details:", error);
      setError(error.message || "Failed to load freelancer details");
    } finally {
      setLoading(false);
    }
  };

  const formatPathway = (pathway: string) => {
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

  const getPathwayColor = (pathway: string) => {
    switch (pathway) {
      case "STUDENT":
        return "bg-blue-100 text-blue-800";
      case "GRADUATE":
        return "bg-green-100 text-green-800";
      case "ARTISAN":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSkillLevelColor = (level: number) => {
    if (level >= 4) return "bg-sierra-green text-white";
    if (level >= 3) return "bg-sierra-blue text-white";
    if (level >= 2) return "bg-yellow-500 text-white";
    return "bg-gray-400 text-white";
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const formatYear = (year: number | null) => {
    return year ? year.toString() : "N/A";
  };

  const handleContact = () => {
    if (freelancer) {
      router.push(`/login?redirect=/freelancers/${freelancer.id}&action=contact`);
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
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !freelancer) {
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
            <h3 className="mt-2 text-lg font-medium text-gray-900">Profile not found</h3>
            <p className="mt-1 text-sm text-gray-500">{error || "The profile you're looking for doesn't exist."}</p>
            <div className="mt-6">
              <Link
                href="/freelancers"
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
                Back to Freelancers
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
            href="/freelancers"
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
            Back to Freelancers
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-sierra-green to-sierra-green-dark rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
                {freelancer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {freelancer.name}
                    </h1>
                    <p className="text-xl font-semibold text-sierra-blue mb-2">
                      {freelancer.profession}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ml-4 ${getPathwayColor(
                      freelancer.pathway
                    )}`}
                  >
                    {formatPathway(freelancer.pathway)}
                  </span>
                </div>
                {freelancer.headline && (
                  <p className="text-lg text-gray-700 font-medium mb-3">
                    {freelancer.headline}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  {freelancer.yearsExperience > 0 && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
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
                      <span>{freelancer.yearsExperience} year{freelancer.yearsExperience !== 1 ? "s" : ""} experience</span>
                    </div>
                  )}
                  {freelancer.availability && (
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{freelancer.availability}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {freelancer.bio && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{freelancer.bio}</p>
            </div>
          )}

          {/* Skills */}
          {freelancer.skills.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-3">
                {freelancer.skills.map((skill) => (
                  <div
                    key={skill.slug}
                    className="flex items-center gap-2"
                  >
                    <span
                      className={`px-4 py-2 rounded-lg font-medium ${getSkillLevelColor(
                        skill.level
                      )}`}
                    >
                      {skill.name}
                    </span>
                    <span className="text-xs text-gray-500">Level {skill.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {freelancer.experiences.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Work Experience</h2>
              <div className="space-y-6">
                {freelancer.experiences.map((exp) => (
                  <div key={exp.id} className="border-l-4 border-sierra-green pl-6 pb-6 last:pb-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{exp.title}</h3>
                    <p className="text-sierra-blue font-semibold mb-2">{exp.company}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                    </p>
                    {exp.description && (
                      <p className="text-gray-700 whitespace-pre-wrap">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {freelancer.education.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Education</h2>
              <div className="space-y-4">
                {freelancer.education.map((edu) => (
                  <div key={edu.id} className="border-l-4 border-sierra-blue pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{edu.school}</h3>
                    {edu.credential && (
                      <p className="text-sierra-blue font-semibold mb-1">{edu.credential}</p>
                    )}
                    {edu.field && (
                      <p className="text-gray-600 mb-1">{edu.field}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {formatYear(edu.startYear)} - {formatYear(edu.endYear)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocational Training */}
          {freelancer.trainings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vocational Training</h2>
              <div className="space-y-4">
                {freelancer.trainings.map((training) => (
                  <div key={training.id} className="border-l-4 border-purple-500 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{training.trainingName}</h3>
                    {training.institute && (
                      <p className="text-gray-600 mb-1">{training.institute}</p>
                    )}
                    {training.certificate && (
                      <p className="text-sm text-gray-600 mb-1">Certificate: {training.certificate}</p>
                    )}
                    <p className="text-sm text-gray-600">
                      {formatDate(training.startDate)} - {formatDate(training.endDate)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio */}
          {freelancer.portfolio.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {freelancer.portfolio.map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:border-sierra-green transition-colors">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    )}
                    <div className="flex gap-2">
                      {item.linkUrl && (
                        <a
                          href={item.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sierra-blue hover:text-sierra-blue-dark text-sm font-medium inline-flex items-center"
                        >
                          View Project
                          <svg
                            className="w-4 h-4 ml-1"
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
                      )}
                      {item.fileId && (
                        <a
                          href={`/api/files/${item.fileId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sierra-green hover:text-sierra-green-dark text-sm font-medium inline-flex items-center"
                        >
                          Download
                          <svg
                            className="w-4 h-4 ml-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Button */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={handleContact}
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
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Contact Freelancer
            </button>
            <p className="text-center text-sm text-gray-500 mt-4">
              You'll need to log in to contact this freelancer
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

