"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import DashboardFooter from "@/app/components/DashboardFooter";
import DashboardSidebar from "@/app/components/DashboardSidebar";
import Toast from "@/app/components/Toast";

interface User {
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

interface Skill {
  id: number;
  name: string;
  slug: string;
}

interface District {
  id: number;
  name: string;
}

interface Region {
  id: number;
  name: string;
  districts: District[];
}

interface JobSkill {
  id: number;
  name: string;
  required: boolean;
}

interface Job {
  id: number;
  title: string;
  description: string;
  type: "GIG" | "INTERNSHIP" | "PART_TIME" | "FULL_TIME";
  location: string | null;
  salaryRange: string | null;
  status: "OPEN" | "CLOSED";
  // GIG fields
  projectDuration: string | null;
  budget: string | null;
  deadline: string | null;
  deliverables: string | null;
  // INTERNSHIP fields
  internshipDuration: string | null;
  stipend: string | null;
  startDate: string | null;
  learningObjectives: string | null;
  // PART_TIME fields
  hoursPerWeek: string | null;
  schedule: string | null;
  hourlyRate: string | null;
  // FULL_TIME fields
  workArrangement: string | null;
  startDateFullTime: string | null;
  probationPeriod: string | null;
  benefits: string | null;
  skills: JobSkill[];
}

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Array<{ skillId: number; required: boolean }>>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [regionsLoading, setRegionsLoading] = useState(true);
  const [regionsError, setRegionsError] = useState<string | null>(null);
  const skillDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "GIG" as "GIG" | "INTERNSHIP" | "PART_TIME" | "FULL_TIME",
    location: "",
    salaryRange: "",
    status: "OPEN" as "OPEN" | "CLOSED",
    // GIG-specific fields
    projectDuration: "",
    budget: "",
    deadline: "",
    deliverables: "",
    // INTERNSHIP-specific fields
    internshipDuration: "",
    stipend: "",
    startDate: "",
    learningObjectives: "",
    // PART_TIME-specific fields
    hoursPerWeek: "",
    schedule: "",
    hourlyRate: "",
    // FULL_TIME-specific fields
    benefits: "",
    workArrangement: "",
    startDateFullTime: "",
    probationPeriod: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; isVisible: boolean }>({
    message: "",
    type: "success",
    isVisible: false,
  });

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
        if (userData.user.role !== "EMPLOYER") {
          router.push("/");
          return;
        }
        setUser(userData.user);

        // Fetch skills
        const skillsResponse = await fetch("/api/skills");
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          setSkills(skillsData.skills || []);
        }

        // Fetch regions and districts
        setRegionsLoading(true);
        setRegionsError(null);
        let regionsData: { regions: Region[] } | null = null;
        try {
          const regionsResponse = await fetch("/api/locations/regions");
          if (regionsResponse.ok) {
            regionsData = await regionsResponse.json();
            if (regionsData.regions && Array.isArray(regionsData.regions)) {
              setRegions(regionsData.regions);
            } else {
              setRegionsError("Invalid regions data received");
            }
          } else {
            const errorData = await regionsResponse.json().catch(() => ({}));
            setRegionsError(errorData.error || `Failed to load regions (${regionsResponse.status})`);
          }
        } catch (error) {
          setRegionsError("Failed to load regions. Please try again.");
        } finally {
          setRegionsLoading(false);
        }

        // Fetch job details
        if (jobId) {
          const jobResponse = await fetch(`/api/employer/jobs/${jobId}`);
          if (!jobResponse.ok) {
            if (jobResponse.status === 404) {
              router.push("/dashboard/employer/my-job-postings");
              return;
            }
            throw new Error("Failed to fetch job");
          }
          const jobData = await jobResponse.json();
          const job: Job = jobData.job;

          // Pre-fill form with job data
          setFormData({
            title: job.title || "",
            description: job.description || "",
            type: job.type,
            location: job.location || "",
            salaryRange: job.salaryRange || "",
            status: job.status,
            // GIG fields
            projectDuration: job.projectDuration || "",
            budget: job.budget || "",
            deadline: job.deadline ? new Date(job.deadline).toISOString().split("T")[0] : "",
            deliverables: job.deliverables || "",
            // INTERNSHIP fields
            internshipDuration: job.internshipDuration || "",
            stipend: job.stipend || "",
            startDate: job.startDate ? new Date(job.startDate).toISOString().split("T")[0] : "",
            learningObjectives: job.learningObjectives || "",
            // PART_TIME fields
            hoursPerWeek: job.hoursPerWeek || "",
            schedule: job.schedule || "",
            hourlyRate: job.hourlyRate || "",
            // FULL_TIME fields
            benefits: job.benefits || "",
            workArrangement: job.workArrangement || "",
            startDateFullTime: job.startDateFullTime ? new Date(job.startDateFullTime).toISOString().split("T")[0] : "",
            probationPeriod: job.probationPeriod || "",
          });

          // Pre-fill selected skills
          if (job.skills && job.skills.length > 0) {
            setSelectedSkills(
              job.skills.map((skill) => ({
                skillId: skill.id,
                required: skill.required,
              }))
            );
          }

          // Parse location to set region and district if possible
          if (job.location && regionsData && regionsData.regions) {
            const locationParts = job.location.split(",").map((p) => p.trim());
            if (locationParts.length >= 2) {
              const districtName = locationParts[0];
              const regionName = locationParts[1];
              const region = regionsData.regions.find((r: Region) => r.name === regionName);
              if (region) {
                setSelectedRegionId(region.id);
                const district = region.districts.find((d: District) => d.name === districtName);
                if (district) {
                  setSelectedDistrictId(district.id);
                }
              }
            } else if (locationParts.length === 1) {
              const regionName = locationParts[0];
              const region = regionsData.regions.find((r: Region) => r.name === regionName);
              if (region) {
                setSelectedRegionId(region.id);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setToast({
          message: "Failed to load job details. Please try again.",
          type: "error",
          isVisible: true,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router, jobId]);

  // Close skill dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (skillDropdownRef.current && !skillDropdownRef.current.contains(event.target as Node)) {
        setShowSkillDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Helper function to safely parse dates
  const parseDate = (dateString: string | null | undefined): string | null => {
    if (!dateString || dateString.trim() === "") return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } catch {
      return null;
    }
  };

  // Helper function to safely trim strings
  const safeTrim = (value: string | null | undefined): string | null => {
    if (!value || typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed === "" ? null : trimmed;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = "Job title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Job title must be at least 3 characters";
    }

    // Validate description
    if (!formData.description.trim()) {
      newErrors.description = "Job description is required";
    } else if (formData.description.trim().length < 20) {
      newErrors.description = "Job description must be at least 20 characters";
    }

    // Validate type
    if (!formData.type) {
      newErrors.type = "Job type is required";
    }

    // Validate status
    if (!formData.status) {
      newErrors.status = "Job status is required";
    } else if (!["OPEN", "CLOSED"].includes(formData.status)) {
      newErrors.status = "Invalid job status";
    }

    // Validate location (optional but if provided, should be valid)
    if (formData.location && formData.location.trim().length < 2) {
      newErrors.location = "Location must be at least 2 characters if provided";
    }

    // Validate skills - at least one skill is recommended
    if (selectedSkills.length === 0) {
      newErrors.skills = "Please add at least one skill to help candidates find your job";
    }

    // Validate date fields if provided
    if (formData.deadline && !parseDate(formData.deadline)) {
      newErrors.deadline = "Invalid deadline date";
    }
    if (formData.startDate && !parseDate(formData.startDate)) {
      newErrors.startDate = "Invalid start date";
    }
    if (formData.startDateFullTime && !parseDate(formData.startDateFullTime)) {
      newErrors.startDateFullTime = "Invalid start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      // Prepare data payload
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        skills: selectedSkills,
        location: safeTrim(formData.location),
        salaryRange: safeTrim(formData.salaryRange),
      };

      // Add GIG fields
      payload.projectDuration = safeTrim(formData.projectDuration);
      payload.budget = safeTrim(formData.budget);
      payload.deadline = parseDate(formData.deadline);
      payload.deliverables = safeTrim(formData.deliverables);

      // Add INTERNSHIP fields
      payload.internshipDuration = safeTrim(formData.internshipDuration);
      payload.stipend = safeTrim(formData.stipend);
      payload.startDate = parseDate(formData.startDate);
      payload.learningObjectives = safeTrim(formData.learningObjectives);

      // Add PART_TIME fields
      payload.hoursPerWeek = safeTrim(formData.hoursPerWeek);
      payload.schedule = safeTrim(formData.schedule);
      payload.hourlyRate = safeTrim(formData.hourlyRate);

      // Add FULL_TIME fields
      payload.workArrangement = safeTrim(formData.workArrangement);
      payload.startDateFullTime = parseDate(formData.startDateFullTime);
      payload.probationPeriod = safeTrim(formData.probationPeriod);
      payload.benefits = safeTrim(formData.benefits);

      const response = await fetch(`/api/employer/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update job");
      }

      setToast({
        message: "Job updated successfully!",
        type: "success",
        isVisible: true,
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/dashboard/employer/my-job-postings");
      }, 1500);
    } catch (error: any) {
      console.error("Error updating job:", error);
      setToast({
        message: error.message || "Failed to update job. Please try again.",
        type: "error",
        isVisible: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSkills = skills.filter(
    (skill) =>
      skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !selectedSkills.some((selected) => selected.skillId === skill.id)
  );

  const handleAddSkill = (skill: Skill) => {
    setSelectedSkills([...selectedSkills, { skillId: skill.id, required: true }]);
    setSkillSearch("");
    setShowSkillDropdown(false);
  };

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills(selectedSkills.filter((s) => s.skillId !== skillId));
  };

  const toggleSkillRequired = (skillId: number) => {
    setSelectedSkills(
      selectedSkills.map((s) =>
        s.skillId === skillId ? { ...s, required: !s.required } : s
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sierra-green"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job details...</p>
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
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900hover:text-white mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Job Postings
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Job Posting</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Update your job posting details</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-6">
                {/* Title and Description */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData({ ...formData, title: e.target.value });
                        if (errors.title) setErrors({ ...errors, title: "" });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent ${
                        errors.title
                          ? "border-red-500border-red-500"
                          : "border-gray-300border-gray-600"
                      }`}
                      placeholder="e.g., Senior Web Developer"
                    />
                    {errors.title && (
                      <p className="text-xs text-red-600text-red-400 mt-1">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => {
                        setFormData({ ...formData, description: e.target.value });
                        if (errors.description) setErrors({ ...errors, description: "" });
                      }}
                      rows={6}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent resize-none ${
                        errors.description
                          ? "border-red-500border-red-500"
                          : "border-gray-300border-gray-600"
                      }`}
                      placeholder="Describe the job responsibilities, requirements, and what you're looking for..."
                    />
                    {errors.description && (
                      <p className="text-xs text-red-600text-red-400 mt-1">{errors.description}</p>
                    )}
                  </div>
                </div>

                {/* Job Type and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => {
                        setFormData({ ...formData, type: e.target.value as any });
                        if (errors.type) setErrors({ ...errors, type: "" });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent ${
                        errors.type
                          ? "border-red-500border-red-500"
                          : "border-gray-300border-gray-600"
                      }`}
                    >
                      <option value="GIG">Freelance / Project-based</option>
                      <option value="INTERNSHIP">Internship</option>
                      <option value="PART_TIME">Part-time</option>
                      <option value="FULL_TIME">Full-time</option>
                    </select>
                    {errors.type && (
                      <p className="text-xs text-red-600text-red-400 mt-1">{errors.type}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => {
                        setFormData({ ...formData, status: e.target.value as any });
                        if (errors.status) setErrors({ ...errors, status: "" });
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent ${
                        errors.status
                          ? "border-red-500border-red-500"
                          : "border-gray-300border-gray-600"
                      }`}
                    >
                      <option value="OPEN">Open</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                    {errors.status && (
                      <p className="text-xs text-red-600text-red-400 mt-1">{errors.status}</p>
                    )}
                  </div>
                </div>

                {/* Location and Salary Range - Similar to post-job page */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Region
                      </label>
                      <select
                        value={selectedRegionId || ""}
                        onChange={(e) => {
                          const regionId = e.target.value ? parseInt(e.target.value) : null;
                          setSelectedRegionId(regionId);
                          setSelectedDistrictId(null);
                          const region = regions.find((r) => r.id === regionId);
                          if (region) {
                            setFormData({ ...formData, location: region.name });
                          } else {
                            setFormData({ ...formData, location: "" });
                          }
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent ${
                          regionsLoading || regionsError
                            ? "border-gray-300border-gray-600 bg-gray-100"
                            : "border-gray-300border-gray-600"
                        }`}
                        disabled={regionsLoading || regions.length === 0}
                      >
                        <option value="">
                          {regionsLoading
                            ? "Loading regions..."
                            : regionsError
                            ? "Error loading regions"
                            : regions.length === 0
                            ? "No regions available"
                            : "Select a region"}
                        </option>
                        {regions.map((region) => (
                          <option key={region.id} value={region.id}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        District
                      </label>
                      <select
                        value={selectedDistrictId || ""}
                        onChange={(e) => {
                          const districtId = e.target.value ? parseInt(e.target.value) : null;
                          setSelectedDistrictId(districtId);
                          const region = regions.find((r) => r.id === selectedRegionId);
                          const district = region?.districts.find((d) => d.id === districtId);
                          if (region && district) {
                            setFormData({ ...formData, location: `${district.name}, ${region.name}` });
                          } else if (region) {
                            setFormData({ ...formData, location: region.name });
                          }
                        }}
                        disabled={!selectedRegionId}
                        className={`w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent ${
                          !selectedRegionId
                            ? "bg-gray-100 text-gray-400text-gray-500 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="">
                          {!selectedRegionId
                            ? "Please select a region first"
                            : "Select a district (optional)"}
                        </option>
                        {selectedRegionId &&
                          (() => {
                            const selectedRegion = regions.find((r) => r.id === selectedRegionId);
                            const districts = selectedRegion?.districts || [];
                            return districts.length > 0 ? (
                              districts.map((district) => (
                                <option key={district.id} value={district.id}>
                                  {district.name}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>
                                No districts available
                              </option>
                            );
                          })()}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Location Details (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => {
                          setFormData({ ...formData, location: e.target.value });
                          if (errors.location) setErrors({ ...errors, location: "" });
                        }}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent ${
                          errors.location
                            ? "border-red-500border-red-500"
                            : "border-gray-300border-gray-600"
                        }`}
                        placeholder="e.g., Specific address, landmark, or area"
                      />
                      {errors.location && (
                        <p className="text-xs text-red-600text-red-400 mt-1">{errors.location}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {formData.type === "PART_TIME" ? "Hourly Rate / Salary Range" : "Salary Range"}
                    </label>
                    <input
                      type="text"
                      value={formData.salaryRange}
                      onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                      placeholder={
                        formData.type === "PART_TIME"
                          ? "e.g., 50,000 SLL/hour or 2,000,000 – 3,000,000 SLL/month"
                          : formData.type === "INTERNSHIP"
                          ? "e.g., 500,000 – 1,000,000 SLL (Stipend)"
                          : formData.type === "GIG"
                          ? "e.g., 1,000,000 – 2,000,000 SLL (Project Fee)"
                          : "e.g., 3,000,000 – 5,000,000 SLL"
                      }
                    />
                  </div>
                </div>

                {/* Dynamic Fields Based on Job Type - Same as post-job page */}
                {formData.type === "GIG" && (
                  <div className="bg-blue-50bg-blue-900/20 border border-blue-200border-blue-800 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Freelance / Project Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Project Duration
                        </label>
                        <input
                          type="text"
                          value={formData.projectDuration}
                          onChange={(e) => setFormData({ ...formData, projectDuration: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                          placeholder="e.g., 2 weeks, 1 month, 3 months"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Project Budget
                        </label>
                        <input
                          type="text"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                          placeholder="e.g., 1,500,000 – 2,500,000 SLL"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Deadline
                        </label>
                        <input
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Deliverables
                        </label>
                        <input
                          type="text"
                          value={formData.deliverables}
                          onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                          placeholder="e.g., Website design, Logo, Marketing materials"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.type === "INTERNSHIP" && (
                  <div className="bg-green-50bg-green-900/20 border border-green-200border-green-800 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Internship Program Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Internship Duration
                        </label>
                        <input
                          type="text"
                          value={formData.internshipDuration}
                          onChange={(e) => setFormData({ ...formData, internshipDuration: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                          placeholder="e.g., 3 months, 6 months, 1 year"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Stipend
                        </label>
                        <input
                          type="text"
                          value={formData.stipend}
                          onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                          placeholder="e.g., 500,000 – 1,000,000 SLL/month"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Learning Objectives
                        </label>
                        <textarea
                          value={formData.learningObjectives}
                          onChange={(e) => setFormData({ ...formData, learningObjectives: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent resize-none"
                          placeholder="e.g., Learn web development, Gain experience in project management..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.type === "PART_TIME" && (
                  <div className="bg-purple-50bg-purple-900/20 border border-purple-200border-purple-800 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Part-Time Work Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hours Per Week
                        </label>
                        <input
                          type="text"
                          value={formData.hoursPerWeek}
                          onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                          placeholder="e.g., 20 hours, 15-25 hours"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Schedule Flexibility
                        </label>
                        <input
                          type="text"
                          value={formData.schedule}
                          onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                          placeholder="e.g., Flexible, Weekdays only, Evenings, Weekends"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hourly Rate (if applicable)
                        </label>
                        <input
                          type="text"
                          value={formData.hourlyRate}
                          onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                          placeholder="e.g., 50,000 SLL/hour"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.type === "FULL_TIME" && (
                  <div className="bg-orange-50bg-orange-900/20 border border-orange-200border-orange-800 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Full-Time Employment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Work Arrangement
                        </label>
                        <select
                          value={formData.workArrangement}
                          onChange={(e) => setFormData({ ...formData, workArrangement: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                        >
                          <option value="">Select work arrangement</option>
                          <option value="On-site">On-site</option>
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                          <option value="Flexible">Flexible</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={formData.startDateFullTime}
                          onChange={(e) => setFormData({ ...formData, startDateFullTime: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Probation Period
                        </label>
                        <input
                          type="text"
                          value={formData.probationPeriod}
                          onChange={(e) => setFormData({ ...formData, probationPeriod: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                          placeholder="e.g., 3 months, 6 months"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Benefits
                        </label>
                        <textarea
                          value={formData.benefits}
                          onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent resize-none"
                          placeholder="e.g., Health insurance, Paid leave, Training opportunities..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Skills Section - Same as post-job page */}
                <div className="skill-dropdown-container" ref={skillDropdownRef}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Required Skills *
                    {errors.skills && (
                      <span className="text-red-600text-red-400 text-xs font-normal ml-2">
                        - {errors.skills}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={(e) => {
                        setSkillSearch(e.target.value);
                        setShowSkillDropdown(true);
                      }}
                      onFocus={() => setShowSkillDropdown(true)}
                      className="w-full px-4 py-2 border border-gray-300border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent"
                      placeholder="Search and add skills..."
                    />
                    {showSkillDropdown && filteredSkills.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredSkills.map((skill) => (
                          <button
                            key={skill.id}
                            type="button"
                            onClick={() => handleAddSkill(skill)}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100hover:bg-gray-600 text-gray-900 dark:text-white"
                          >
                            {skill.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedSkills.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedSkills.map((selectedSkill) => {
                        const skill = skills.find((s) => s.id === selectedSkill.skillId);
                        if (!skill) return null;
                        return (
                          <div
                            key={selectedSkill.skillId}
                            className="flex items-center gap-2 bg-sierra-green/10bg-sierra-green/20 border border-sierra-green/30 rounded-lg px-3 py-1.5"
                          >
                            <span className="text-sm text-gray-900 dark:text-white">{skill.name}</span>
                            <button
                              type="button"
                              onClick={() => toggleSkillRequired(selectedSkill.skillId)}
                              className={`text-xs px-2 py-0.5 rounded ${
                                selectedSkill.required
                                  ? "bg-sierra-green text-white"
                                  : "bg-gray-300bg-gray-600 text-gray-700 dark:text-gray-300 dark:text-gray-300"
                              }`}
                            >
                              {selectedSkill.required ? "Required" : "Preferred"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(selectedSkill.skillId)}
                              className="text-gray-500 hover:text-red-600hover:text-red-400"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">* Required fields</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => router.back()}
                      className="px-6 py-2 border border-gray-300border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors disabled:opacity-50 font-medium"
                    >
                      {submitting ? "Updating..." : "Update Job"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </main>
          <DashboardFooter />
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onDismiss={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

