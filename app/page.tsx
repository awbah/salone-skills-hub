"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ImageSlider from "./components/ImageSlider";
import TopFreelancersSection from "./components/TopFreelancersSection";
import AvailableJobsSection from "./components/AvailableJobsSection";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"jobs" | "freelancers">("jobs");

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sierra-white via-blue-50 to-green-50">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section with Slider - Full Width */}
        <section className="relative overflow-hidden w-full">
          {/* Image Slider - Full Width, No Margins */}
          <div className="animate-fade-in w-full">
            <ImageSlider />
          </div>
          
          {/* Search & Browse Options Container */}
          <div className="w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-20">

            {/* Search & Browse Options */}
            <div className="max-w-6xl mx-auto animate-fade-in-up">
              {/* Tabs for Job Seeker / Employer */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                <div className="flex flex-wrap gap-4 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setSearchType("jobs")}
                    className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                      searchType === "jobs"
                        ? "text-sierra-green border-sierra-green"
                        : "text-gray-500 border-transparent hover:text-sierra-green"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>Find Work</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSearchType("freelancers")}
                    className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
                      searchType === "freelancers"
                        ? "text-sierra-blue border-sierra-blue"
                        : "text-gray-500 border-transparent hover:text-sierra-blue"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Hire Talent</span>
                    </div>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      searchType === "jobs"
                        ? "Search for jobs, skills, companies..."
                        : "Search for freelancers, skills, expertise..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-6 py-4 pl-14 pr-32 border-2 border-gray-200 rounded-lg text-lg text-black focus:ring-2 focus:ring-sierra-green focus:border-transparent outline-none transition-all duration-300"
                  />
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <button
                    onClick={() => {
                      if (searchType === "jobs") {
                        window.location.href = `/jobs?search=${encodeURIComponent(searchQuery)}`;
                      } else {
                        window.location.href = `/freelancers?search=${encodeURIComponent(searchQuery)}`;
                      }
                    }}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 ${
                      searchType === "jobs"
                        ? "bg-sierra-green hover:bg-sierra-green-dark"
                        : "bg-sierra-blue hover:bg-sierra-blue-dark"
                    }`}
                  >
                    Search
                  </button>
                </div>

                {/* Quick Browse Options */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {searchType === "jobs" ? (
                    <>
                      <Link
                        href="/jobs?type=full-time"
                        className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-2xl mb-2">💼</div>
                        <div className="font-semibold text-sierra-green">Full-time</div>
                      </Link>
                      <Link
                        href="/jobs?type=part-time"
                        className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-2xl mb-2">⏰</div>
                        <div className="font-semibold text-sierra-blue">Part-time</div>
                      </Link>
                      <Link
                        href="/jobs?type=internship"
                        className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-2xl mb-2">🎓</div>
                        <div className="font-semibold text-purple-600">Internship</div>
                      </Link>
                      <Link
                        href="/jobs?type=gig"
                        className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-2xl mb-2">⚡</div>
                        <div className="font-semibold text-orange-600">Gigs</div>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/freelancers?skill=frontend-development"
                        className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-2xl mb-2">💻</div>
                        <div className="font-semibold text-sierra-green">Developers</div>
                      </Link>
                      <Link
                        href="/freelancers?skill=graphic-design"
                        className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-2xl mb-2">🎨</div>
                        <div className="font-semibold text-sierra-blue">Designers</div>
                      </Link>
                      <Link
                        href="/freelancers?skill=digital-marketing"
                        className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-2xl mb-2">📱</div>
                        <div className="font-semibold text-purple-600">Marketers</div>
                      </Link>
                      <Link
                        href="/freelancers?skill=tailoring"
                        className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-all duration-300 hover:scale-105"
                      >
                        <div className="text-2xl mb-2">✂️</div>
                        <div className="font-semibold text-orange-600">Artisans</div>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Popular Skills/Tags */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  {searchType === "jobs" ? "Popular Job Categories" : "Browse by Skills"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(searchType === "jobs"
                    ? ["Front-end Developer", "Back-end Developer", "Graphic Designer", "Digital Marketer", "Data Entry", "Customer Service", "Accountant", "Project Manager"]
                    : ["React", "Node.js", "UI/UX Design", "Social Media Marketing", "Content Writing", "Tailoring", "Welding", "Accounting"]
                  ).map((tag) => (
                    <Link
                      key={tag}
                      href={
                        searchType === "jobs"
                          ? `/jobs?category=${encodeURIComponent(tag)}`
                          : `/freelancers?skill=${encodeURIComponent(tag)}`
                      }
                      className={`px-4 py-2 rounded-full font-medium transition-all duration-300 hover:scale-110 ${
                        searchType === "jobs"
                          ? "bg-green-100 text-sierra-green hover:bg-green-200"
                          : "bg-blue-100 text-sierra-blue hover:bg-blue-200"
                      }`}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-sierra-green to-sierra-green-dark text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="animate-fade-in-up">
                <div className="text-4xl lg:text-5xl font-bold mb-2">500+</div>
                <div className="text-lg text-white/90">Active Jobs</div>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="text-4xl lg:text-5xl font-bold mb-2">2K+</div>
                <div className="text-lg text-white/90">Job Seekers</div>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <div className="text-4xl lg:text-5xl font-bold mb-2">150+</div>
                <div className="text-lg text-white/90">Employers</div>
              </div>
              <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                <div className="text-4xl lg:text-5xl font-bold mb-2">40+</div>
                <div className="text-lg text-white/90">Skills Categories</div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Freelancers Section */}
        <TopFreelancersSection />

        {/* Available Jobs Section */}
        <AvailableJobsSection />

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Why Choose Salone SkillsHub?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A platform designed specifically for the Sierra Leone job market
              </p>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up">
                <div className="w-16 h-16 bg-gradient-to-br from-sierra-green to-sierra-green-dark rounded-xl flex items-center justify-center mb-6">
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Diverse Opportunities
                </h3>
                <p className="text-gray-600">
                  Find jobs ranging from gigs to full-time positions. Perfect for
                  students, graduates, and skilled artisans.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="w-16 h-16 bg-gradient-to-br from-sierra-blue to-sierra-blue-dark rounded-xl flex items-center justify-center mb-6">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Secure & Trusted
                </h3>
                <p className="text-gray-600">
                  Your data is protected with industry-standard security. Verified
                  employers and authenticated job seekers.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <div className="w-16 h-16 bg-gradient-to-br from-sierra-green to-sierra-green-dark rounded-xl flex items-center justify-center mb-6">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Local Focus
                </h3>
                <p className="text-gray-600">
                  Built for Sierra Leone with support for all regions and
                  districts. Connect with local opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-sierra-green to-sierra-green-dark text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto animate-fade-in-up">
              <h2 className="text-4xl font-bold mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of job seekers and employers building the future
                of Sierra Leone
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register/seeker"
                  className="px-8 py-4 bg-white text-sierra-green rounded-lg font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Create Job Seeker Profile
                </Link>
                <Link
                  href="/register/employer"
                  className="px-8 py-4 bg-sierra-blue text-white rounded-lg font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Create Employer Account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
