"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg"
          : "bg-gradient-to-b from-sierra-green to-sierra-green-dark"
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Left */}
          <Link
            href="/"
            className="flex items-center space-x-2 group transition-transform duration-300 hover:scale-105"
          >
            <div className="relative h-12 w-auto flex items-center">
              <Image
                src="/logo.png"
                alt="Salone SkillsHub Logo"
                width={180}
                height={48}
                className="h-10 sm:h-12 w-auto object-contain"
                priority
                style={{ maxHeight: '48px' }}
              />
            </div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href="/freelancers"
              className={`font-medium transition-all duration-300 hover:scale-110 ${
                isScrolled
                  ? "text-sierra-green hover:text-sierra-green-dark"
                  : "text-white hover:text-sierra-blue-light"
              }`}
            >
              Hire Freelancers
            </Link>
            <Link
              href="/jobs"
              className={`font-medium transition-all duration-300 hover:scale-110 ${
                isScrolled
                  ? "text-sierra-green hover:text-sierra-green-dark"
                  : "text-white hover:text-sierra-blue-light"
              }`}
            >
              Find Work
            </Link>
            <Link
              href="/about"
              className={`font-medium transition-all duration-300 hover:scale-110 ${
                isScrolled
                  ? "text-sierra-green hover:text-sierra-green-dark"
                  : "text-white hover:text-sierra-blue-light"
              }`}
            >
              About Us
            </Link>
            <Link
              href="/why"
              className={`font-medium transition-all duration-300 hover:scale-110 ${
                isScrolled
                  ? "text-sierra-green hover:text-sierra-green-dark"
                  : "text-white hover:text-sierra-blue-light"
              }`}
            >
              Why Salone SkillsHub
            </Link>
          </div>

          {/* Login & Signup Buttons on Right */}
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
                isScrolled
                  ? "text-sierra-green border-2 border-sierra-green hover:bg-sierra-green hover:text-white"
                  : "text-white border-2 border-white hover:bg-white hover:text-sierra-green"
              }`}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-sierra-blue text-white rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:bg-sierra-blue-dark hover:shadow-lg"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${
              isScrolled ? "text-sierra-green" : "text-white"
            }`}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="py-4 space-y-4">
            <Link
              href="/freelancers"
              className="block font-medium text-white hover:text-sierra-blue-light transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Hire Freelancers
            </Link>
            <Link
              href="/jobs"
              className="block font-medium text-white hover:text-sierra-blue-light transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Find Work
            </Link>
            <Link
              href="/about"
              className="block font-medium text-white hover:text-sierra-blue-light transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/why"
              className="block font-medium text-white hover:text-sierra-blue-light transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Why Salone SkillsHub
            </Link>
            <div className="pt-4 space-y-3 border-t border-white/20">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-2 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-sierra-green transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block w-full text-center px-4 py-2 bg-sierra-blue text-white rounded-lg font-medium hover:bg-sierra-blue-dark transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
