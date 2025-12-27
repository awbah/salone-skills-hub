"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SlideModal from "./SlideModal";

interface Freelancer {
  id: number;
  userId: number;
  name: string;
  profession: string;
  headline: string;
  bio: string;
  yearsExperience: number;
  pathway: string;
  skills: Array<{ name: string; slug: string; level: number }>;
}

interface FreelancerDetails extends Freelancer {
  email?: string;
  phone?: string;
  availability?: string;
  education?: any[];
  trainings?: any[];
  experiences?: any[];
  portfolio?: any[];
}

export default function TopFreelancersSection() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFreelancer, setSelectedFreelancer] = useState<FreelancerDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetch("/api/freelancers/top")
      .then((res) => res.json())
      .then((data) => {
        setFreelancers(data.freelancers || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching freelancers:", error);
        setLoading(false);
      });
  }, []);

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

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sierra-green"></div>
          </div>
        </div>
      </section>
    );
  }

  if (freelancers.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Top Talents
            </h2>
            <p className="text-xl text-gray-600">
              Discover skilled professionals ready to work
            </p>
          </div>
          <Link
            href="/freelancers"
            className="hidden md:flex items-center space-x-2 px-6 py-3 bg-sierra-blue text-white rounded-lg font-semibold hover:bg-sierra-blue-dark transition-all duration-300 hover:scale-105"
          >
            <span>View More</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {freelancers.map((freelancer, index) => (
            <div
              key={freelancer.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl p-6 transition-all duration-300 hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Avatar & Basic Info */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-sierra-green to-sierra-green-dark rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {freelancer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {freelancer.name}
                  </h3>
                  <p className="text-sierra-blue font-semibold">
                    {freelancer.profession}
                  </p>
                  {freelancer.yearsExperience > 0 && (
                    <p className="text-sm text-gray-600 mt-1">
                      {freelancer.yearsExperience} year
                      {freelancer.yearsExperience !== 1 ? "s" : ""} experience
                    </p>
                  )}
                </div>
              </div>

              {/* Headline */}
              {freelancer.headline && (
                <p className="text-gray-700 font-medium mb-3">
                  {freelancer.headline}
                </p>
              )}

              {/* Bio */}
              {freelancer.bio && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {freelancer.bio}
                </p>
              )}

              {/* Skills */}
              {freelancer.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {freelancer.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill.slug}
                      className="px-3 py-1 bg-sierra-blue/10 text-sierra-blue text-xs font-medium rounded-full"
                    >
                      {skill.name}
                    </span>
                  ))}
                  {freelancer.skills.length > 3 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      +{freelancer.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}

              {/* View Profile Button */}
              <button
                onClick={() => handleViewProfile(freelancer.id)}
                className="block w-full text-center px-4 py-2 bg-sierra-green text-white rounded-lg font-semibold hover:bg-sierra-green-dark transition-all duration-300"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>

        {/* View More Button - Mobile */}
        <div className="mt-8 text-center md:hidden">
          <Link
            href="/freelancers"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-sierra-blue text-white rounded-lg font-semibold hover:bg-sierra-blue-dark transition-all duration-300"
          >
            <span>View More Freelancers</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Profile Details Modal */}
      <SlideModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedFreelancer ? `${selectedFreelancer.name}'s Profile` : "Profile Details"}
      >
        {loadingDetails ? (
          <div className="flex items-center justify-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sierra-green"></div>
          </div>
        ) : selectedFreelancer ? (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-start space-x-4 pb-6 border-b">
              <div className="w-20 h-20 bg-gradient-to-br from-sierra-green to-sierra-green-dark rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {selectedFreelancer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedFreelancer.name}
                </h3>
                <p className="text-sierra-blue font-semibold text-lg mb-2">
                  {selectedFreelancer.profession}
                </p>
                {selectedFreelancer.yearsExperience > 0 && (
                  <p className="text-gray-600">
                    {selectedFreelancer.yearsExperience} year
                    {selectedFreelancer.yearsExperience !== 1 ? "s" : ""} of experience
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Pathway: {selectedFreelancer.pathway.replace("_", " ")}
                </p>
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
                <p className="text-gray-700 whitespace-pre-wrap">{selectedFreelancer.bio}</p>
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
                    <span
                      key={skill.slug}
                      className="px-4 py-2 bg-sierra-blue/10 text-sierra-blue rounded-lg font-medium"
                    >
                      {skill.name}
                      {skill.level > 1 && (
                        <span className="ml-2 text-xs">(Level {skill.level})</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {selectedFreelancer.experiences && selectedFreelancer.experiences.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h4>
                <div className="space-y-4">
                  {selectedFreelancer.experiences.map((exp: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-sierra-green pl-4">
                      <h5 className="font-semibold text-gray-900">{exp.title}</h5>
                      <p className="text-sierra-blue text-sm">{exp.company}</p>
                      <p className="text-gray-600 text-sm">
                        {exp.startDate && new Date(exp.startDate).toLocaleDateString()} -{" "}
                        {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "Present"}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 text-sm mt-2">{exp.description}</p>
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
                  {selectedFreelancer.education.map((edu: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-sierra-blue pl-4">
                      <h5 className="font-semibold text-gray-900">{edu.degree}</h5>
                      <p className="text-gray-600 text-sm">{edu.institution}</p>
                      {edu.graduationYear && (
                        <p className="text-gray-500 text-xs">Graduated: {edu.graduationYear}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {(selectedFreelancer.email || selectedFreelancer.phone) && (
              <div className="pt-4 border-t">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  {selectedFreelancer.email && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Email:</span> {selectedFreelancer.email}
                    </p>
                  )}
                  {selectedFreelancer.phone && (
                    <p className="text-gray-700">
                      <span className="font-semibold">Phone:</span> {selectedFreelancer.phone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* View Full Profile Link */}
            <div className="pt-6 border-t">
              <Link
                href={`/freelancers/${selectedFreelancer.userId}`}
                className="inline-flex items-center px-6 py-3 bg-sierra-green text-white rounded-lg font-semibold hover:bg-sierra-green-dark transition-all duration-300"
              >
                View Full Profile
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">Failed to load profile details.</p>
          </div>
        )}
      </SlideModal>
    </section>
  );
}

