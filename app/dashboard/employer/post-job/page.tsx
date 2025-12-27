"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function PostJobPage() {
  const router = useRouter();
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

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "GIG",
    location: "",
    salaryRange: "",
    status: "OPEN", // JobStatus: OPEN or CLOSED
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
        try {
          const regionsResponse = await fetch("/api/locations/regions");
          if (regionsResponse.ok) {
            const regionsData = await regionsResponse.json();
            if (regionsData.regions && Array.isArray(regionsData.regions)) {
              setRegions(regionsData.regions);
            } else {
              setRegionsError("Invalid regions data received");
              console.error("Invalid regions data:", regionsData);
            }
          } else {
            const errorData = await regionsResponse.json().catch(() => ({}));
            setRegionsError(errorData.error || `Failed to load regions (${regionsResponse.status})`);
            console.error("Failed to fetch regions:", regionsResponse.status, errorData);
          }
        } catch (error) {
          setRegionsError("Failed to load regions. Please try again.");
          console.error("Error fetching regions:", error);
        } finally {
          setRegionsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

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
      // Prepare data payload with ALL fields from the Job model
      const payload: any = {
        // Required fields
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        status: formData.status,
        skills: selectedSkills,
        
        // Optional common fields
        location: safeTrim(formData.location),
        salaryRange: safeTrim(formData.salaryRange),
        
        // GIG/Freelance specific fields (all fields from schema)
        projectDuration: safeTrim(formData.projectDuration),
        budget: safeTrim(formData.budget),
        deadline: parseDate(formData.deadline),
        deliverables: safeTrim(formData.deliverables),
        
        // INTERNSHIP specific fields (all fields from schema)
        internshipDuration: safeTrim(formData.internshipDuration),
        stipend: safeTrim(formData.stipend),
        startDate: parseDate(formData.startDate),
        learningObjectives: safeTrim(formData.learningObjectives),
        
        // PART_TIME specific fields (all fields from schema)
        hoursPerWeek: safeTrim(formData.hoursPerWeek),
        schedule: safeTrim(formData.schedule),
        hourlyRate: safeTrim(formData.hourlyRate),
        
        // FULL_TIME specific fields (all fields from schema)
        workArrangement: safeTrim(formData.workArrangement),
        startDateFullTime: parseDate(formData.startDateFullTime),
        probationPeriod: safeTrim(formData.probationPeriod),
        benefits: safeTrim(formData.benefits),
      };

      const response = await fetch("/api/employer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `Failed to post job (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (data.success) {
        // Show success toast
        setToast({
          message: `Job "${formData.title}" posted successfully! 🎉`,
          type: "success",
          isVisible: true,
        });
        
        // Clear form after a short delay
        setTimeout(() => {
          // Reset form
          setFormData({
            title: "",
            description: "",
            type: "GIG",
            location: "",
            salaryRange: "",
            status: "OPEN",
            projectDuration: "",
            budget: "",
            deadline: "",
            deliverables: "",
            internshipDuration: "",
            stipend: "",
            startDate: "",
            learningObjectives: "",
            hoursPerWeek: "",
            schedule: "",
            hourlyRate: "",
            benefits: "",
            workArrangement: "",
            startDateFullTime: "",
            probationPeriod: "",
          });
          setSelectedSkills([]);
          setErrors({});
          
          // Redirect to employer dashboard after showing toast
          setTimeout(() => {
            router.push("/dashboard/employer");
          }, 2000);
        }, 500);
      } else {
        throw new Error(data.error || "Failed to post job");
      }
    } catch (error: any) {
      console.error("Error posting job:", error);
      const errorMessage = error.message || "Failed to post job. Please check all fields and try again.";
      setErrors({ submit: errorMessage });
      
      // Show error toast
      setToast({
        message: errorMessage,
        type: "error",
        isVisible: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSkill = (skill: Skill) => {
    if (!selectedSkills.find((s) => s.skillId === skill.id)) {
      setSelectedSkills([...selectedSkills, { skillId: skill.id, required: true }]);
    }
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

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !selectedSkills.find((s) => s.skillId === skill.id)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.skill-dropdown-container')) {
        setShowSkillDropdown(false);
      }
    };

    if (showSkillDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showSkillDropdown]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-gray-700 border-t-sierra-green"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={user} />
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
        duration={toast.type === "success" ? 3000 : 5000}
      />
      <div className="flex flex-1 pt-16">
        <DashboardSidebar role="EMPLOYER" />
        <div className="flex-1 flex flex-col" style={{ marginLeft: 'var(--sidebar-width, 80px)' }}>
          <main className="flex-grow transition-all duration-300 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Post a Job
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Create a new job posting to attract talented candidates
                </p>
              </div>

              {/* Job Posting Form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {errors.submit && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{errors.submit}</p>
                    </div>
                  )}

                  {/* Job Title */}
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
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600 dark:border-gray-600"
                      }`}
                      placeholder={
                        formData.type === "GIG"
                          ? "e.g., Website Design Project"
                          : formData.type === "INTERNSHIP"
                          ? "e.g., Web Development Intern"
                          : formData.type === "PART_TIME"
                          ? "e.g., Part-time Graphic Designer"
                          : "e.g., Senior Front-end Developer"
                      }
                      required
                    />
                    {errors.title && (
                      <p className="text-xs text-red-600 mt-1">{errors.title}</p>
                    )}
                    {!errors.title && (
                      <p className="text-xs text-gray-500 mt-1">
                        A clear and descriptive job title
                      </p>
                    )}
                  </div>

                  {/* Job Description */}
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
                      rows={8}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent resize-none ${
                        errors.description
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600 dark:border-gray-600"
                      }`}
                      placeholder={
                        formData.type === "GIG"
                          ? "Describe the freelance project, scope of work, specific tasks, deliverables, and what you're looking for in a freelancer..."
                          : formData.type === "INTERNSHIP"
                          ? "Describe the internship program, what the intern will learn, mentorship opportunities, and the learning environment..."
                          : formData.type === "PART_TIME"
                          ? "Describe the part-time role, responsibilities, schedule expectations, and what makes this opportunity great..."
                          : "Describe the role, responsibilities, requirements, company culture, and what makes this opportunity great..."
                      }
                      required
                    />
                    {errors.description && (
                      <p className="text-xs text-red-600 mt-1">{errors.description}</p>
                    )}
                    {!errors.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        Provide a detailed description of the {formData.type === "GIG" ? "freelance project" : formData.type === "INTERNSHIP" ? "internship program" : "role"} and requirements (minimum 20 characters)
                      </p>
                    )}
                  </div>

                  {/* Job Type and Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="GIG">Freelance / Project-based</option>
                        <option value="INTERNSHIP">Internship</option>
                        <option value="PART_TIME">Part-time</option>
                        <option value="FULL_TIME">Full-time</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Select the type of job you want to post
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData({ ...formData, status: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                        required
                      >
                        <option value="OPEN">Open (Accepting Applications)</option>
                        <option value="CLOSED">Closed (Not Accepting Applications)</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Set whether the job is open for applications
                      </p>
                    </div>
                  </div>

                  {/* Location (Region and District) and Salary Range */}
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
                            setSelectedDistrictId(null); // Reset district when region changes
                            // Update location field
                            const region = regions.find((r) => r.id === regionId);
                            if (region) {
                              setFormData({ ...formData, location: region.name });
                            } else {
                              setFormData({ ...formData, location: "" });
                            }
                            if (errors.location) setErrors({ ...errors, location: "" });
                          }}
                          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent ${
                            regionsLoading || regionsError
                              ? "border-gray-300 dark:border-gray-600 bg-gray-100"
                              : "border-gray-300 dark:border-gray-600 dark:border-gray-600"
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
                        {regionsError ? (
                          <p className="text-xs text-red-600 mt-1">
                            {regionsError}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500 mt-1">
                            {regionsLoading
                              ? "Loading regions..."
                              : "Select the region where the job is located"}
                          </p>
                        )}
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
                            // Update location field with region and district
                            const region = regions.find((r) => r.id === selectedRegionId);
                            const district = region?.districts.find((d) => d.id === districtId);
                            if (region && district) {
                              setFormData({ ...formData, location: `${district.name}, ${region.name}` });
                            } else if (region) {
                              setFormData({ ...formData, location: region.name });
                            }
                            if (errors.location) setErrors({ ...errors, location: "" });
                          }}
                          disabled={!selectedRegionId}
                          className={`w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white ${
                            !selectedRegionId 
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                              : ""
                          }`}
                        >
                          <option value="">
                            {!selectedRegionId 
                              ? "Please select a region first" 
                              : "Select a district (optional)"}
                          </option>
                          {selectedRegionId && (() => {
                            const selectedRegion = regions.find((r) => r.id === selectedRegionId);
                            const districts = selectedRegion?.districts || [];
                            return districts.length > 0 ? (
                              districts.map((district) => (
                                <option key={district.id} value={district.id}>
                                  {district.name}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>No districts available</option>
                            );
                          })()}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          {!selectedRegionId 
                            ? "Select a region first to choose a district" 
                            : "Select the district (optional)"}
                        </p>
                      </div>
                      {/* Fallback text input for custom location */}
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
                              ? "border-red-500"
                              : "border-gray-300 dark:border-gray-600 dark:border-gray-600"
                          }`}
                          placeholder="e.g., Specific address, landmark, or area"
                        />
                        {errors.location && (
                          <p className="text-xs text-red-600 mt-1">{errors.location}</p>
                        )}
                        {!errors.location && (
                          <p className="text-xs text-gray-500 mt-1">
                            Add specific address or area details if needed
                          </p>
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
                        onChange={(e) =>
                          setFormData({ ...formData, salaryRange: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.type === "INTERNSHIP" ? "Stipend or compensation range" : "Compensation range"}
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Fields Based on Job Type */}
                  {formData.type === "GIG" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
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
                            onChange={(e) =>
                              setFormData({ ...formData, projectDuration: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 2 weeks, 1 month, 3 months"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Expected duration of the project
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Project Budget
                          </label>
                          <input
                            type="text"
                            value={formData.budget}
                            onChange={(e) =>
                              setFormData({ ...formData, budget: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 1,500,000 – 2,500,000 SLL"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Total budget for this project
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Deadline
                          </label>
                          <input
                            type="date"
                            value={formData.deadline}
                            onChange={(e) =>
                              setFormData({ ...formData, deadline: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Project completion deadline
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Deliverables
                          </label>
                          <input
                            type="text"
                            value={formData.deliverables}
                            onChange={(e) =>
                              setFormData({ ...formData, deliverables: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Website design, Logo, Marketing materials"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            What will be delivered
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.type === "INTERNSHIP" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-4">
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
                            onChange={(e) =>
                              setFormData({ ...formData, internshipDuration: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 3 months, 6 months, 1 year"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Length of the internship program
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Stipend
                          </label>
                          <input
                            type="text"
                            value={formData.stipend}
                            onChange={(e) =>
                              setFormData({ ...formData, stipend: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 500,000 – 1,000,000 SLL/month"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Monthly stipend amount
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                              setFormData({ ...formData, startDate: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            When the internship begins
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Learning Objectives
                          </label>
                          <textarea
                            value={formData.learningObjectives}
                            onChange={(e) =>
                              setFormData({ ...formData, learningObjectives: e.target.value })
                            }
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            placeholder="e.g., Learn web development, Gain experience in project management..."
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            What the intern will learn
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.type === "PART_TIME" && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 space-y-4">
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
                            onChange={(e) =>
                              setFormData({ ...formData, hoursPerWeek: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 20 hours, 15-25 hours"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Expected weekly working hours
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Schedule Flexibility
                          </label>
                          <input
                            type="text"
                            value={formData.schedule}
                            onChange={(e) =>
                              setFormData({ ...formData, schedule: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., Flexible, Weekdays only, Evenings, Weekends"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Work schedule preferences
                          </p>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Hourly Rate (if applicable)
                          </label>
                          <input
                            type="text"
                            value={formData.hourlyRate}
                            onChange={(e) =>
                              setFormData({ ...formData, hourlyRate: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 50,000 SLL/hour"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Hourly rate (optional, can also use salary range above)
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.type === "FULL_TIME" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 space-y-4">
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
                            onChange={(e) =>
                              setFormData({ ...formData, workArrangement: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Select work arrangement</option>
                            <option value="On-site">On-site</option>
                            <option value="Remote">Remote</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="Flexible">Flexible</option>
                          </select>
                          <p className="text-xs text-gray-500 mt-1">
                            Where the work will be performed
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Start Date
                          </label>
                          <input
                            type="date"
                            value={formData.startDateFullTime}
                            onChange={(e) =>
                              setFormData({ ...formData, startDateFullTime: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Expected start date
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Probation Period
                          </label>
                          <input
                            type="text"
                            value={formData.probationPeriod}
                            onChange={(e) =>
                              setFormData({ ...formData, probationPeriod: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            placeholder="e.g., 3 months, 6 months"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Probation period duration
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Benefits
                          </label>
                          <textarea
                            value={formData.benefits}
                            onChange={(e) =>
                              setFormData({ ...formData, benefits: e.target.value })
                            }
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                            placeholder="e.g., Health insurance, Paid leave, Training opportunities..."
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Benefits and perks offered
                          </p>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Required Skills */}
                  <div className="skill-dropdown-container">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Required Skills *
                      {errors.skills && (
                        <span className="text-red-600 text-xs font-normal ml-2">
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
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="Search and add skills..."
                      />
                      {showSkillDropdown && filteredSkills.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredSkills.map((skill) => (
                            <button
                              key={skill.id}
                              type="button"
                              onClick={() => handleAddSkill(skill)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-900 dark:text-white"
                            >
                              {skill.name}
                            </button>
                          ))}
                        </div>
                      )}
                      {showSkillDropdown && skillSearch && filteredSkills.length === 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400">No skills found matching "{skillSearch}"</p>
                        </div>
                      )}
                    </div>
                    {errors.skills && (
                      <p className="text-xs text-red-600 mt-1">{errors.skills}</p>
                    )}
                    {!errors.skills && (
                      <p className="text-xs text-gray-500 mt-1">
                        Add skills that are required or preferred for this position (at least one skill is recommended)
                      </p>
                    )}

                    {/* Selected Skills */}
                    {selectedSkills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {selectedSkills.map((selectedSkill) => {
                          const skill = skills.find((s) => s.id === selectedSkill.skillId);
                          if (!skill) return null;
                          return (
                            <div
                              key={selectedSkill.skillId}
                              className="flex items-center gap-2 bg-sierra-green/10 border border-sierra-green/30 rounded-lg px-3 py-1.5"
                            >
                              <span className="text-sm text-gray-900 dark:text-white">
                                {skill.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleSkillRequired(selectedSkill.skillId)}
                                className={`text-xs px-2 py-0.5 rounded ${
                                  selectedSkill.required
                                    ? "bg-sierra-green text-white"
                                    : "bg-gray-300 text-gray-700 dark:text-gray-300 dark:text-gray-300"
                                }`}
                                title={selectedSkill.required ? "Required" : "Preferred"}
                              >
                                {selectedSkill.required ? "Required" : "Preferred"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(selectedSkill.skillId)}
                                className="text-gray-500 hover:text-red-600"
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      * Required fields
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors disabled:opacity-50 font-medium"
                      >
                        {submitting ? "Posting..." : "Post Job"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </main>
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}

