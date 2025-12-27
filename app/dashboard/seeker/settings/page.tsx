"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/app/components/DashboardHeader";
import DashboardFooter from "@/app/components/DashboardFooter";
import DashboardSidebar from "@/app/components/DashboardSidebar";

interface User {
  userId: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  gender: string | null;
  role: string;
}

export default function SeekerSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFileId, setResumeFileId] = useState<string | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const [profileInfo, setProfileInfo] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    gender: "",
  });

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        if (data.user.role !== "JOB_SEEKER") {
          router.push("/");
          return;
        }
        setUser(data.user);
        setProfileInfo({
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          phone: data.user.phone || "",
          gender: data.user.gender || "",
        });
        
        // Load seeker profile to get resume info
        try {
          const profileResponse = await fetch("/api/profile/seeker");
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            if (profileData.profile?.resumeFile) {
              setResumeFileId(profileData.profile.resumeFile.id);
              setResumeFileName(profileData.profile.resumeFile.bucketKey.split('/').pop() || "Resume");
            }
          }
        } catch (error) {
          console.error("Error loading seeker profile:", error);
        }
        
        // Load profile photo if exists
        // Note: This requires profilePhoto field in User model
        // For now, we'll check if there's a profilePhoto in the user data
        if (data.user.profilePhoto) {
          try {
            const urlResponse = await fetch(`/api/profile/photo/${data.user.profilePhoto}`);
            if (urlResponse.ok) {
              const urlData = await urlResponse.json();
              setProfilePhotoUrl(urlData.url);
              setProfilePhoto(data.user.profilePhoto);
            }
          } catch (error) {
            console.error("Error loading profile photo:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", "other");

      const response = await fetch("/api/profile/photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload photo");
      }

      const data = await response.json();
      setProfilePhoto(data.fileId);
      
      // Use the URL returned from the upload endpoint
      if (data.url) {
        setProfilePhotoUrl(data.url);
      } else if (data.fileId) {
        // Fallback: Get the photo URL if not provided
        const urlResponse = await fetch(`/api/profile/photo/${data.fileId}`);
        if (urlResponse.ok) {
          const urlData = await urlResponse.json();
          setProfilePhotoUrl(urlData.url);
        }
      }
      
      alert("Profile photo uploaded successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileInfo),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      const data = await response.json();
      setUser({ ...user!, ...data.user });
      alert("Profile updated successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", "resume");
      formData.append("userId", user!.userId.toString());

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload resume");
      }

      const data = await response.json();
      
      // Update seeker profile with resume file ID
      const updateResponse = await fetch("/api/profile/seeker", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeFileId: data.fileId }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update profile with resume");
      }

      setResumeFileId(data.fileId);
      setResumeFileName(file.name);
      alert("Resume uploaded successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to upload resume");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleResumeDelete = async () => {
    if (!confirm("Are you sure you want to remove your resume?")) {
      return;
    }

    try {
      const updateResponse = await fetch("/api/profile/seeker", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeFileId: null }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to remove resume");
      }

      setResumeFileId(null);
      setResumeFileName(null);
      alert("Resume removed successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to remove resume");
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (passwordInfo.newPassword.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordInfo.currentPassword,
          newPassword: passwordInfo.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      alert("Password changed successfully!");
      setPasswordInfo({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      alert(error.message || "Failed to change password");
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
        <DashboardSidebar role="JOB_SEEKER" />
        <div className="flex-1 flex flex-col" style={{ marginLeft: 'var(--sidebar-width, 80px)' }}>
          <main className="flex-grow transition-all duration-300 px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Settings
              </h1>

              {/* Resume/CV Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Resume/CV
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Upload your resume or CV. This will be used when applying for jobs.
                </p>
                {resumeFileId ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-sierra-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{resumeFileName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Resume uploaded</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`/api/files/${resumeFileId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 text-sierra-green border border-sierra-green rounded-lg hover:bg-sierra-green hover:text-white transition-colors text-sm font-medium"
                      >
                        View
                      </a>
                      <input
                        ref={resumeInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => resumeInputRef.current?.click()}
                        disabled={uploadingResume}
                        className="px-4 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors disabled:opacity-50 text-sm font-medium"
                      >
                        {uploadingResume ? "Uploading..." : "Replace"}
                      </button>
                      <button
                        onClick={handleResumeDelete}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
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
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                      No resume uploaded yet
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOC, or DOCX. Max size 5MB
                    </p>
                    <input
                      ref={resumeInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => resumeInputRef.current?.click()}
                      disabled={uploadingResume}
                      className="mt-4 px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors disabled:opacity-50 font-medium"
                    >
                      {uploadingResume ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </span>
                      ) : (
                        "Upload Resume"
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Profile Photo Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Profile Photo
                </h2>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    {profilePhotoUrl ? (
                      <img
                        src={profilePhotoUrl}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sierra-green to-sierra-blue flex items-center justify-center text-white font-bold text-2xl">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                    )}
                    {uploadingPhoto && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="px-4 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors disabled:opacity-50"
                    >
                      {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG or WebP. Max size 5MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "profile"
                          ? "border-sierra-green text-sierra-green"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600 dark:border-gray-600"
                      }`}
                    >
                      Profile Information
                    </button>
                    <button
                      onClick={() => setActiveTab("password")}
                      className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "password"
                          ? "border-sierra-green text-sierra-green"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:border-gray-600 dark:border-gray-600"
                      }`}
                    >
                      Change Password
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === "profile" && (
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={profileInfo.firstName}
                            onChange={(e) =>
                              setProfileInfo({ ...profileInfo, firstName: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={profileInfo.lastName}
                            onChange={(e) =>
                              setProfileInfo({ ...profileInfo, lastName: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={profileInfo.phone}
                            onChange={(e) =>
                              setProfileInfo({ ...profileInfo, phone: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Gender
                          </label>
                          <select
                            value={profileInfo.gender}
                            onChange={(e) =>
                              setProfileInfo({ ...profileInfo, gender: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                          >
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={user.username}
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Username cannot be changed
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </form>
                  )}

                  {activeTab === "password" && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Current Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={passwordInfo.currentPassword}
                            onChange={(e) =>
                              setPasswordInfo({
                                ...passwordInfo,
                                currentPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:text-gray-300"
                          >
                            {showCurrentPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={passwordInfo.newPassword}
                            onChange={(e) =>
                              setPasswordInfo({
                                ...passwordInfo,
                                newPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:text-gray-300"
                          >
                            {showNewPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Must be at least 8 characters long
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordInfo.confirmPassword}
                            onChange={(e) =>
                              setPasswordInfo({
                                ...passwordInfo,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-sierra-green focus:border-transparent dark:bg-gray-700 dark:text-white"
                            required
                            minLength={8}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:text-gray-300"
                          >
                            {showConfirmPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-sierra-green text-white rounded-lg hover:bg-sierra-green-dark transition-colors disabled:opacity-50"
                      >
                        {saving ? "Changing..." : "Change Password"}
                      </button>
                    </form>
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

