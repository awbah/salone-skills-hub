"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

export default function SignupPage() {
  const [selectedType, setSelectedType] = useState<"freelancer" | "client" | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sierra-white via-blue-50 to-green-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-20 mt-20">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Join as a client or freelancer
              </h1>
              <p className="text-xl text-gray-600">
                Choose how you want to use Salone SkillsHub
              </p>
            </div>

            {/* Selection Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Freelancer Card */}
              <button
                onClick={() => setSelectedType("freelancer")}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                  selectedType === "freelancer"
                    ? "border-sierra-green bg-green-50 shadow-xl"
                    : "border-gray-200 bg-white hover:border-sierra-green hover:shadow-lg"
                }`}
              >
                {/* Radio Button */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedType === "freelancer"
                        ? "border-sierra-green bg-sierra-green"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedType === "freelancer" && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-sierra-green to-sierra-green-dark rounded-xl flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
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
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  I'm a freelancer, looking for work
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Find job opportunities, showcase your skills, and connect with
                  employers across Sierra Leone. Perfect for students, graduates,
                  and skilled artisans.
                </p>

                {/* Features List */}
                <ul className="mt-6 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-sierra-green"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Browse job opportunities</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-sierra-green"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Create your professional profile</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-sierra-green"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Apply to jobs and get hired</span>
                  </li>
                </ul>
              </button>

              {/* Client/Employer Card */}
              <button
                onClick={() => setSelectedType("client")}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-105 ${
                  selectedType === "client"
                    ? "border-sierra-blue bg-blue-50 shadow-xl"
                    : "border-gray-200 bg-white hover:border-sierra-blue hover:shadow-lg"
                }`}
              >
                {/* Radio Button */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedType === "client"
                        ? "border-sierra-blue bg-sierra-blue"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedType === "client" && (
                      <div className="w-3 h-3 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-sierra-blue to-sierra-blue-dark rounded-xl flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  I'm a client, hiring for a project
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Post jobs, find talented freelancers, and build your team.
                  Connect with skilled professionals ready to work on your projects.
                </p>

                {/* Features List */}
                <ul className="mt-6 space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-sierra-blue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Post job opportunities</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-sierra-blue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Browse freelancer profiles</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-sierra-blue"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Hire the best talent</span>
                  </li>
                </ul>
              </button>
            </div>

            {/* Continue Button */}
            <div className="text-center">
              {selectedType ? (
                <Link
                  href={
                    selectedType === "freelancer"
                      ? "/register/seeker"
                      : "/register/employer"
                  }
                  className={`inline-block w-full md:w-auto px-8 py-4 rounded-lg font-semibold text-lg text-white transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                    selectedType === "freelancer"
                      ? "bg-gradient-to-r from-sierra-green to-sierra-green-dark"
                      : "bg-gradient-to-r from-sierra-blue to-sierra-blue-dark"
                  }`}
                >
                  Create Account
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full md:w-auto px-8 py-4 rounded-lg font-semibold text-lg text-gray-400 bg-gray-100 cursor-not-allowed"
                >
                  Create Account
                </button>
              )}

              <p className="mt-6 text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-sierra-green font-semibold hover:text-sierra-green-dark transition-colors duration-300"
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
