"use client";

import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

interface FAQ {
  question: string;
  answer: string;
  category: "general" | "job-seekers" | "employers";
}

const faqs: FAQ[] = [
  {
    category: "general",
    question: "What is Salone SkillsHub?",
    answer:
      "Salone SkillsHub is a comprehensive job marketplace designed specifically for Sierra Leone, connecting job seekers (students, graduates, and artisans) with employers across the country. We support various employment types including gigs, internships, part-time, and full-time positions.",
  },
  {
    category: "general",
    question: "Is Salone SkillsHub free to use?",
    answer:
      "Yes, creating an account and browsing jobs or freelancers is completely free. Employers can post jobs and job seekers can apply at no cost. Some premium features may be available for enhanced visibility.",
  },
  {
    category: "job-seekers",
    question: "How do I create a job seeker profile?",
    answer:
      "Click on 'Sign Up' in the header, select 'I'm a freelancer, looking for work', and follow the registration process. You'll need to provide basic information, create your profile, and verify your email address.",
  },
  {
    category: "job-seekers",
    question: "How do I apply for a job?",
    answer:
      "Browse available jobs on the Jobs page, click on a job that interests you, and click 'Apply Now'. You'll need to be logged in and provide your CV, cover letter, and any other required documents.",
  },
  {
    category: "job-seekers",
    question: "What types of jobs are available?",
    answer:
      "We support four main job types: GIG (freelance/project-based), INTERNSHIP, PART_TIME, and FULL_TIME positions. Each type has specific fields and requirements tailored to that employment model.",
  },
  {
    category: "job-seekers",
    question: "How do I track my applications?",
    answer:
      "Once logged in, go to your dashboard and navigate to 'My Applications'. You'll see all your submitted applications with their current status (Applied, Shortlisted, Hired, or Rejected).",
  },
  {
    category: "employers",
    question: "How do I post a job?",
    answer:
      "First, create an employer account by clicking 'Sign Up' and selecting 'I'm an employer, looking to hire'. Once your account is verified, you can post jobs from your employer dashboard by clicking 'Post a Job'.",
  },
  {
    category: "employers",
    question: "How do I find qualified candidates?",
    answer:
      "You can browse the Freelancers page to see available talent, or use the search and filter features to find candidates with specific skills, experience levels, or pathways (Student, Graduate, Artisan).",
  },
  {
    category: "employers",
    question: "How do I manage applications?",
    answer:
      "In your employer dashboard, go to 'My Job Postings' and click on any job to see all applications. You can review applications, shortlist candidates, and manage the hiring process from there.",
  },
  {
    category: "employers",
    question: "Can I verify my company profile?",
    answer:
      "Yes, company verification is available. Verified companies have a badge displayed on their profile and job postings, which helps build trust with job seekers. Contact support for verification assistance.",
  },
];

export default function HelpPage() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "general" | "job-seekers" | "employers">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFAQs = selectedCategory === "all" ? faqs : faqs.filter((faq) => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sierra-white via-blue-50 to-green-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-20 mt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Help Center</h1>
            <p className="text-xl text-gray-600">Find answers to common questions and get support</p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-sierra-green text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              All Questions
            </button>
            <button
              onClick={() => setSelectedCategory("general")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === "general"
                  ? "bg-sierra-green text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              General
            </button>
            <button
              onClick={() => setSelectedCategory("job-seekers")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === "job-seekers"
                  ? "bg-sierra-green text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Job Seekers
            </button>
            <button
              onClick={() => setSelectedCategory("employers")}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === "employers"
                  ? "bg-sierra-green text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Employers
            </button>
          </div>

          {/* FAQ Section */}
          <div className="space-y-4 mb-12">
            {filteredFAQs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transform transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Support Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="px-6 py-3 bg-sierra-green text-white rounded-lg font-semibold hover:bg-sierra-green-dark transition-all duration-300 hover:scale-105"
              >
                Contact Support
              </a>
              <a
                href="mailto:support@saloneskillshub.com"
                className="px-6 py-3 bg-sierra-blue text-white rounded-lg font-semibold hover:bg-sierra-blue-dark transition-all duration-300 hover:scale-105"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

