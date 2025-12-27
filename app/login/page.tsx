"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get("redirect");
  const action = searchParams?.get("action");
  const [userType, setUserType] = useState<"seeker" | "employer">("seeker");
  
  useEffect(() => {
    // If action is "apply", default to seeker
    if (action === "apply") {
      setUserType("seeker");
    }
  }, [action]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sierra-white via-blue-50 to-green-50">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-20 mt-20">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 animate-fade-in-up">
            {/* User Type Selection */}
            <div className="flex gap-4 mb-8 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setUserType("seeker")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  userType === "seeker"
                    ? "bg-sierra-green text-white shadow-lg"
                    : "text-gray-600 hover:text-sierra-green"
                }`}
              >
                Job Seeker
              </button>
              <button
                onClick={() => setUserType("employer")}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  userType === "employer"
                    ? "bg-sierra-blue text-white shadow-lg"
                    : "text-gray-600 hover:text-sierra-blue"
                }`}
              >
                Employer
              </button>
            </div>

            {/* Redirect to specific login */}
            <div className="text-center">
              {action === "apply" && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
                  Please login to apply for this job
                </div>
              )}
              <Link
                href={
                  userType === "seeker"
                    ? redirect
                      ? `/login/seeker?redirect=${encodeURIComponent(redirect)}`
                      : "/login/seeker"
                    : redirect
                    ? `/login/employer?redirect=${encodeURIComponent(redirect)}`
                    : "/login/employer"
                }
                className={`w-full block px-6 py-4 rounded-lg font-semibold text-lg text-white transition-all duration-300 hover:scale-105 ${
                  userType === "seeker"
                    ? "bg-gradient-to-r from-sierra-green to-sierra-green-dark hover:shadow-lg"
                    : "bg-gradient-to-r from-sierra-blue to-sierra-blue-dark hover:shadow-lg"
                }`}
              >
                Continue to Login
              </Link>
              <p className="mt-4 text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-sierra-green font-semibold hover:text-sierra-green-dark transition-colors duration-300"
                >
                  Sign Up
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sierra-white via-blue-50 to-green-50">
        <Header />
        <main className="flex-grow flex items-center justify-center px-4 py-20 mt-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sierra-green"></div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

