"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import DashboardFooter from "@/app/components/DashboardFooter";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import TalentProfileModal from "@/app/components/TalentProfileModal";
import RecruitTalentModal from "@/app/components/RecruitTalentModal";

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
  pathway: "STUDENT" | "GRADUATE" | "ARTISAN";
  profession: string | null;
  headline: string | null;
  bio: string | null;
  yearsExperience: number | null;
  availability: string | null;
  skills: Array<{
    id: number;
    name: string;
    level: number | null;
  }>;
  matchScore?: number;
  matchingSkillsCount?: number;
  portfolioCount: number;
  experienceCount: number;
  educationCount: number;
  trainingCount: number;
  portfolioItems: Array<{
    id: number;
    title: string;
    description: string | null;
    linkUrl: string | null;
    fileId: string | null;
  }>;
  createdAt: string;
}

interface Skill {
  id: number;
  name: string;
  slug: string;
}

export default function BrowseTalentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [talents, setTalents] = useState<Talent[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPathway, setSelectedPathway] = useState<string>("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [minExperience, setMinExperience] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTalentId, setSelectedTalentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recruitTalentId, setRecruitTalentId] = useState<number | null>(null);
  const [recruitTalentName, setRecruitTalentName] = useState<string>("");
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);
  const [recruitSuccess, setRecruitSuccess] = useState(false);

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
          const errorData = await userResponse.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch user");
        }
        const userData = await userResponse.json();
        if (userData.user.role !== "EMPLOYER" && userData.user.role !== "ADMIN") {
          router.push("/");
          return;
        }
        setUser(userData.user);

        // Fetch skills for filter
        const skillsResponse = await fetch("/api/skills");
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          setSkills(skillsData.skills || []);
        }

        // Fetch talents
        await fetchTalents();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const fetchTalents = async (reset = false) => {
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedPathway) params.append("pathway", selectedPathway);
      if (selectedSkill) params.append("skillId", selectedSkill);
      if (minExperience) params.append("minExperience", minExperience);
      params.append("limit", "20");
      params.append("offset", reset ? "0" : talents.length.toString());

      const response = await fetch(`/api/talents?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch talents");
      }
      const data = await response.json();
      
      if (reset) {
        setTalents(data.talents || []);
      } else {
        setTalents([...talents, ...(data.talents || [])]);
      }
      setTotal(data.pagination?.total || 0);
      setHasMore(data.pagination?.hasMore || false);
      setError(null);
    } catch (error) {
      console.error("Error fetching talents:", error);
      setError("Failed to load talents. Please try again.");
    }
  };

  const handleSearch = () => {
    fetchTalents(true);
  };

  const handleFilterChange = () => {
    fetchTalents(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sierra-green"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading talents...</p>
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
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Browse Talent
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Discover skilled professionals for your projects. Results are automatically matched based on skills from your posted jobs.
                </p>
              </div>

              {/* Search and Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Search by name, profession, or skills..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium"
                    >
                      Search
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pathway
                      </label>
                      <select
                        value={selectedPathway}
                        onChange={(e) => {
                          setSelectedPathway(e.target.value);
                          handleFilterChange();
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">All Pathways</option>
                        <option value="STUDENT">Student</option>
                        <option value="GRADUATE">Graduate</option>
                        <option value="ARTISAN">Artisan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Skill
                      </label>
                      <select
                        value={selectedSkill}
                        onChange={(e) => {
                          setSelectedSkill(e.target.value);
                          handleFilterChange();
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">All Skills</option>
                        {skills.map((skill) => (
                          <option key={skill.id} value={skill.id.toString()}>
                            {skill.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Min. Experience (Years)
                      </label>
                      <select
                        value={minExperience}
                        onChange={(e) => {
                          setMinExperience(e.target.value);
                          handleFilterChange();
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Any Experience</option>
                        <option value="0">0+ years</option>
                        <option value="1">1+ years</option>
                        <option value="2">2+ years</option>
                        <option value="3">3+ years</option>
                        <option value="5">5+ years</option>
                        <option value="10">10+ years</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Found <span className="font-semibold text-gray-900 dark:text-white">{total}</span> talents
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Talents Grid */}
              {talents.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
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
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                    No talents found
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {talents.map((talent) => (
                      <div
                        key={talent.id}
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          {talent.profilePhoto ? (
                            <img
                              src={talent.profilePhoto}
                              alt={talent.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white font-semibold text-lg">
                              {getInitials(talent.firstName, talent.lastName)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {talent.name}
                              </h3>
                              {talent.matchScore !== undefined && talent.matchScore > 0 && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium whitespace-nowrap">
                                  {talent.matchScore}% Match
                                </span>
                              )}
                            </div>
                            {talent.profession && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                {talent.profession}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                                {getPathwayLabel(talent.pathway)}
                              </span>
                              {talent.matchingSkillsCount !== undefined && talent.matchingSkillsCount > 0 && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {talent.matchingSkillsCount} skill{talent.matchingSkillsCount !== 1 ? 's' : ''} match
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {talent.headline && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                            {talent.headline}
                          </p>
                        )}

                        {/* Skills */}
                        {talent.skills.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {talent.skills.slice(0, 5).map((skill) => (
                                <span
                                  key={skill.id}
                                  className="px-2 py-1 text-xs font-medium rounded bg-sierra-green/10 text-sierra-green"
                                >
                                  {skill.name}
                                </span>
                              ))}
                              {talent.skills.length > 5 && (
                                <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700 dark:text-gray-300 dark:text-gray-300">
                                  +{talent.skills.length - 5}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                          {talent.yearsExperience !== null && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{talent.yearsExperience} years</span>
                            </div>
                          )}
                          {talent.portfolioCount > 0 && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              <span>{talent.portfolioCount} projects</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTalentId(talent.id);
                              setIsModalOpen(true);
                            }}
                            className="flex-1 text-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => {
                              setRecruitTalentId(talent.id);
                              setRecruitTalentName(talent.name);
                              setIsRecruitModalOpen(true);
                            }}
                            className="flex-1 text-center px-4 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors font-medium flex items-center justify-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Recruit
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => fetchTalents(false)}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Load More
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>
          <DashboardFooter />
        </div>
      </div>

      {/* Talent Profile Modal */}
      <TalentProfileModal
        talentId={selectedTalentId}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTalentId(null);
        }}
        userRole={user?.role}
      />

      {/* Recruit Talent Modal */}
      {recruitTalentId && (
        <RecruitTalentModal
          isOpen={isRecruitModalOpen}
          onClose={() => {
            setIsRecruitModalOpen(false);
            setRecruitTalentId(null);
            setRecruitTalentName("");
            setRecruitSuccess(false);
          }}
          talentId={recruitTalentId}
          talentName={recruitTalentName}
          onSuccess={() => {
            setRecruitSuccess(true);
            // Refresh talents list to show updated status
            fetchTalents(true);
          }}
        />
      )}

      {/* Success Toast */}
      {recruitSuccess && (
        <div className="fixed top-20 right-4 z-50 max-w-md w-full animate-slide-in">
          <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-start gap-3">
            <div className="flex-shrink-0 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Recruitment invitation sent successfully!
              </p>
            </div>
            <button
              onClick={() => setRecruitSuccess(false)}
              className="flex-shrink-0 text-green-800 hover:opacity-70 transition-opacity"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

