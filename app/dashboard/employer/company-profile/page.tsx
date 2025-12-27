"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
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

interface EmployerProfile {
  id: number;
  orgName: string;
  orgType: string | null;
  website: string | null;
  verified: boolean;
  companyLogo?: string | null; // FileObject.id
}

export default function CompanyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    orgName: "",
    orgType: "",
    website: "",
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

        // Fetch employer profile
        const profileResponse = await fetch("/api/profile/employer");
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.profile) {
            setProfile(profileData.profile);
            const existingData = {
              orgName: profileData.profile.orgName || "",
              orgType: profileData.profile.orgType || "",
              website: profileData.profile.website || "",
            };
            setFormData(existingData);
            // Check if any field has data
            const hasData = !!(existingData.orgName || existingData.orgType || existingData.website);
            setHasExistingData(hasData);
            
            // Load company logo if exists
            if (profileData.profile.companyLogo) {
              try {
                const urlResponse = await fetch(`/api/profile/photo/${profileData.profile.companyLogo}`);
                if (urlResponse.ok) {
                  const urlData = await urlResponse.json();
                  setCompanyLogoUrl(urlData.url);
                }
              } catch (error) {
                console.error("Error loading company logo:", error);
              }
            }
          } else {
            setHasExistingData(false);
          }
        } else if (profileResponse.status === 404) {
          // Profile doesn't exist yet - this is a new profile
          setHasExistingData(false);
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/profile/company-logo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload company logo");
      }

      const data = await response.json();
      
      // Get the logo URL
      if (data.url) {
        setCompanyLogoUrl(data.url);
      } else if (data.fileId) {
        const urlResponse = await fetch(`/api/profile/photo/${data.fileId}`);
        if (urlResponse.ok) {
          const urlData = await urlResponse.json();
          setCompanyLogoUrl(urlData.url);
        }
      }
      
      // Update profile state with new logo fileId
      if (profile && data.fileId) {
        setProfile({ ...profile, companyLogo: data.fileId });
      }
      
      alert("Company logo uploaded successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to upload company logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orgName.trim()) {
      alert("Organization name is required");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/profile/employer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save company profile");
      }

      const data = await response.json();
      setProfile(data.profile);
      // After saving, check if we have data
      const hasData = !!(data.profile.orgName || data.profile.orgType || data.profile.website);
      setHasExistingData(hasData);
      
      // Update logo URL if logo was updated
      if (data.profile.companyLogo) {
        try {
          const urlResponse = await fetch(`/api/profile/photo/${data.profile.companyLogo}`);
          if (urlResponse.ok) {
            const urlData = await urlResponse.json();
            setCompanyLogoUrl(urlData.url);
          }
        } catch (error) {
          console.error("Error loading company logo:", error);
        }
      }
      
      alert(hasData ? "Company profile updated successfully!" : "Company profile saved successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to save company profile");
    } finally {
      setSaving(false);
    }
  };

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
      <div className="flex flex-1 pt-16">
        <DashboardSidebar role="EMPLOYER" />
        <div className="flex-1 flex flex-col" style={{ marginLeft: 'var(--sidebar-width, 80px)' }}>
          <main className="flex-grow transition-all duration-300 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Company Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {hasExistingData
                    ? "Update your company information"
                    : "Complete your company profile to get started"}
                </p>
              </div>

              {/* Verification Status */}
              {profile?.verified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-green-600 mr-2"
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
                    <p className="text-sm font-medium text-green-800">
                      Your company profile is verified
                    </p>
                  </div>
                </div>
              )}

              {/* Company Logo Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Company Logo
                </h2>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {companyLogoUrl ? (
                      <img
                        src={companyLogoUrl}
                        alt="Company Logo"
                        className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white font-bold text-lg">
                        {formData.orgName?.[0]?.toUpperCase() || "LOGO"}
                      </div>
                    )}
                    {uploadingLogo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="px-4 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors disabled:opacity-50"
                    >
                      {uploadingLogo ? "Uploading..." : companyLogoUrl ? "Change Logo" : "Upload Logo"}
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG or WebP. Max size 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Company Profile Form */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      value={formData.orgName}
                      onChange={(e) =>
                        setFormData({ ...formData, orgName: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your organization name"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This is the official name of your company or organization
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Organization Type
                    </label>
                    <input
                      type="text"
                      value={formData.orgType}
                      onChange={(e) =>
                        setFormData({ ...formData, orgType: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Private Company, NGO, Government Agency, Startup"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Describe the type of organization you represent
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="https://www.example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Your company's website URL (optional)
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      * Required fields
                    </p>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors disabled:opacity-50 font-medium"
                    >
                      {saving
                        ? "Saving..."
                        : hasExistingData
                        ? "Update Company Profile"
                        : "Save Company Profile"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Additional Information */}
              {hasExistingData && profile && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Profile Information
                  </h3>
                  <div className="space-y-1 text-sm text-blue-800">
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      {profile.verified ? (
                        <span className="text-green-600">Verified</span>
                      ) : (
                        <span className="text-yellow-600">Pending Verification</span>
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Profile ID:</span> {profile.id}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </main>
          <DashboardFooter />
        </div>
      </div>
    </div>
  );
}

