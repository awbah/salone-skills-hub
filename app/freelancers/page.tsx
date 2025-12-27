"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SlideModal from "../components/SlideModal";

interface Freelancer {
  id: number;
  userId: number;
  name: string;
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
}

interface FreelancerDetails extends Freelancer {
  email?: string;
  phone?: string | null;
  education?: Array<{
    id: number;
    school: string;
    credential: string | null;
    field: string | null;
    startYear: number | null;
    endYear: number | null;
  }>;
  trainings?: Array<{
    id: number;
    trainingName: string;
    institute: string | null;
    certificate: string | null;
    startDate: string | null;
    endDate: string | null;
  }>;
  experiences?: Array<{
    id: number;
    title: string;
    company: string;
    description: string | null;
    startDate: string;
    endDate: string | null;
    current: boolean;
  }>;
  portfolio?: Array<{
    id: number;
    title: string;
    description: string | null;
    linkUrl: string | null;
    fileId: string | null;
  }>;
}

export default function FreelancersPage() {
  const router = useRouter();
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pathwayFilter, setPathwayFilter] = useState<string>("all");
  const [experienceFilter, setExperienceFilter] = useState<string>("");
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchFreelancers();
  }, [searchQuery, pathwayFilter, experienceFilter]);

  const fetchFreelancers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (pathwayFilter !== "all") params.append("pathway", pathwayFilter);
      if (experienceFilter) params.append("minExperience", experienceFilter);

      const response = await fetch(`/api/freelancers/available?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch freelancers");
      }
      const data = await response.json();
      setFreelancers(data.freelancers || []);
    } catch (error: any) {
      console.error("Error fetching freelancers:", error);
      setError(error.message || "Failed to load freelancers");
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

  const handleViewProfile = async (freelancerId: number) => {
    setLoadingDetails(true);
    setIsModalOpen(true);
    try {
      const response = await fetch(`/api/freelancers/${freelancerId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch profile details");
      }
      const data = await response.json();
      setSelectedFreelancer(data);
    } catch (error) {
      console.error("Error fetching profile details:", error);
      setSelectedFreelancer(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFreelancer(null);
  };

  const handleHireNow = (freelancerId: number) => {
    router.push(`/login?redirect=/freelancers&action=hire&freelancerId=${freelancerId}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sierra-white via-blue-50 to-green-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Hire Freelancers
          </h1>
          <p className="text-xl text-gray-600">
            Find talented professionals for your projects
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Freelancers
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, profession, skills..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
              />
            </div>

            {/* Pathway Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pathway
              </label>
              <select
                value={pathwayFilter}
                onChange={(e) => setPathwayFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
              >
                <option value="all">All Pathways</option>
                <option value="STUDENT">Student</option>
                <option value="GRADUATE">Graduate</option>
                <option value="ARTISAN">Artisan</option>
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Experience
              </label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
              >
                <option value="">Any Experience</option>
                <option value="1">1+ years</option>
                <option value="2">2+ years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sierra-green"></div>
              <p className="mt-4 text-gray-600">Loading freelancers...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Freelancers Grid */}
        {!loading && !error && (
          <>
            {freelancers.length === 0 ? (
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No freelancers found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              <>
                <div className="mb-4 text-gray-600">
                  <p className="text-sm">
                    Found <span className="font-semibold text-sierra-green">{freelancers.length}</span>{" "}
                    {freelancers.length === 1 ? "freelancer" : "freelancers"}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {freelancers.map((freelancer, index) => (
                    <div
                      key={freelancer.id}
                      className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:border-sierra-green hover:shadow-xl transition-all duration-300 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Freelancer Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-sierra-green to-sierra-green-dark rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {freelancer.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
                            {freelancer.name}
                          </h3>
                          <p className="text-sierra-blue font-semibold text-sm mb-1">
                            {freelancer.profession}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${getPathwayColor(
                                freelancer.pathway
                              )}`}
                            >
                              {formatPathway(freelancer.pathway)}
                            </span>
                            {freelancer.yearsExperience > 0 && (
                              <span className="text-xs text-gray-600">
                                {freelancer.yearsExperience} year{freelancer.yearsExperience !== 1 ? "s" : ""} exp.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Headline */}
                      {freelancer.headline && (
                        <p className="text-gray-700 font-medium mb-3 line-clamp-2">
                          {freelancer.headline}
                        </p>
                      )}

                      {/* Bio */}
                      {freelancer.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {freelancer.bio}
                        </p>
                      )}

                      {/* Skills */}
                      {freelancer.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {freelancer.skills.slice(0, 4).map((skill) => (
                              <span
                                key={skill.slug}
                                className={`px-2 py-1 rounded text-xs font-medium ${getSkillLevelColor(
                                  skill.level
                                )}`}
                                title={`Level ${skill.level}`}
                              >
                                {skill.name}
                              </span>
                            ))}
                            {freelancer.skills.length > 4 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{freelancer.skills.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Availability */}
                      {freelancer.availability && (
                        <div className="mb-4 flex items-center text-sm text-gray-600">
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
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {freelancer.availability}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewProfile(freelancer.id)}
                          className="flex-1 px-4 py-3 bg-sierra-blue text-white rounded-lg font-semibold hover:bg-sierra-blue-dark transition-all duration-300"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleHireNow(freelancer.id)}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-sierra-green to-sierra-green-dark text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                        >
                          Hire Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>

      {/* Freelancer Details Modal */}
      <SlideModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedFreelancer ? `${selectedFreelancer.name}'s Profile` : "Profile Details"}
      >
        {loadingDetails ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-sierra-green"></div>
              <p className="mt-4 text-gray-600">Loading profile details...</p>
            </div>
          </div>
        ) : selectedFreelancer ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-start gap-4 pb-6 border-b">
              <div className="w-20 h-20 bg-gradient-to-br from-sierra-green to-sierra-green-dark rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
                {selectedFreelancer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedFreelancer.name}
                </h3>
                <p className="text-sierra-blue font-semibold text-lg mb-2">
                  {selectedFreelancer.profession}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getPathwayColor(
                      selectedFreelancer.pathway
                    )}`}
                  >
                    {formatPathway(selectedFreelancer.pathway)}
                  </span>
                  {selectedFreelancer.yearsExperience > 0 && (
                    <span className="text-sm text-gray-600">
                      {selectedFreelancer.yearsExperience} year{selectedFreelancer.yearsExperience !== 1 ? "s" : ""} experience
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Headline */}
            {selectedFreelancer.headline && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Headline</h4>
                <p className="text-gray-700">{selectedFreelancer.headline}</p>
              </div>
            )}

            {/* Bio */}
            {selectedFreelancer.bio && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">About</h4>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedFreelancer.bio}</p>
              </div>
            )}

            {/* Availability */}
            {selectedFreelancer.availability && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Availability</h4>
                <p className="text-gray-700">{selectedFreelancer.availability}</p>
              </div>
            )}

            {/* Skills */}
            {selectedFreelancer.skills && selectedFreelancer.skills.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedFreelancer.skills.map((skill) => (
                    <div key={skill.slug} className="flex items-center gap-2">
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
            {selectedFreelancer.experiences && selectedFreelancer.experiences.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h4>
                <div className="space-y-4">
                  {selectedFreelancer.experiences.map((exp) => (
                    <div key={exp.id} className="border-l-4 border-sierra-green pl-4">
                      <h5 className="font-semibold text-gray-900">{exp.title}</h5>
                      <p className="text-sierra-blue text-sm">{exp.company}</p>
                      <p className="text-gray-600 text-sm">
                        {new Date(exp.startDate).toLocaleDateString()} -{" "}
                        {exp.current || !exp.endDate
                          ? "Present"
                          : new Date(exp.endDate).toLocaleDateString()}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 text-sm mt-2 whitespace-pre-wrap">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {selectedFreelancer.education && selectedFreelancer.education.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Education</h4>
                <div className="space-y-3">
                  {selectedFreelancer.education.map((edu) => (
                    <div key={edu.id} className="border-l-4 border-sierra-blue pl-4">
                      <h5 className="font-semibold text-gray-900">{edu.school}</h5>
                      {edu.credential && (
                        <p className="text-sierra-blue text-sm">{edu.credential}</p>
                      )}
                      {edu.field && <p className="text-gray-600 text-sm">{edu.field}</p>}
                      <p className="text-gray-500 text-xs">
                        {edu.startYear || "N/A"} - {edu.endYear || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vocational Training */}
            {selectedFreelancer.trainings && selectedFreelancer.trainings.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Vocational Training</h4>
                <div className="space-y-3">
                  {selectedFreelancer.trainings.map((training) => (
                    <div key={training.id} className="border-l-4 border-purple-500 pl-4">
                      <h5 className="font-semibold text-gray-900">{training.trainingName}</h5>
                      {training.institute && (
                        <p className="text-gray-600 text-sm">{training.institute}</p>
                      )}
                      {training.certificate && (
                        <p className="text-sm text-gray-600">Certificate: {training.certificate}</p>
                      )}
                      <p className="text-gray-500 text-xs">
                        {training.startDate
                          ? new Date(training.startDate).toLocaleDateString()
                          : "N/A"}{" "}
                        -{" "}
                        {training.endDate
                          ? new Date(training.endDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {selectedFreelancer.portfolio && selectedFreelancer.portfolio.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Portfolio</h4>
                <div className="grid grid-cols-1 gap-4">
                  {selectedFreelancer.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-sierra-green transition-colors"
                    >
                      <h5 className="font-semibold text-gray-900 mb-2">{item.title}</h5>
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

            {/* Hire Now Button */}
            <div className="pt-6 border-t">
              <button
                onClick={() => handleHireNow(selectedFreelancer.id)}
                className="w-full px-6 py-3 bg-gradient-to-r from-sierra-green to-sierra-green-dark text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Hire Now
              </button>
              <p className="text-center text-sm text-gray-500 mt-2">
                You'll need to log in to hire this freelancer
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">Failed to load profile details.</p>
          </div>
        )}
      </SlideModal>

      <Footer />
    </div>
  );
}
