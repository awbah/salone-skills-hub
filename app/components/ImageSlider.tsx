"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface SliderImage {
  src: string;
  alt: string;
}

const sliderImages: SliderImage[] = [
  {
    src: "/images/slider-apply-online.jpg",
    alt: "Apply online - Find your dream job",
  },
  {
    src: "/images/slider-dream-job.jpg",
    alt: "Find your dream job in Sierra Leone",
  },
  {
    src: "/images/slider-hiring.jpg",
    alt: "We're hiring - Join our team",
  },
  {
    src: "/images/slider-career.jpg",
    alt: "Build your career with us",
  },
];

const ZOOM_DURATION = 12000; // 12 seconds for zoom animation
const FADE_DURATION = 800; // 800ms for fade transition

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Wait for zoom to complete (12s) + fade transition (0.8s) before changing
    const interval = setInterval(() => {
      setIsTransitioning(true);
      // Wait for fade out to complete
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
        // Wait a bit then fade in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, FADE_DURATION);
    }, ZOOM_DURATION + FADE_DURATION); // Total time: zoom duration + fade duration

    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, FADE_DURATION);
  };

  return (
    <div className="relative w-full h-[500px] md:h-[550px] lg:h-[600px] overflow-hidden">
      {/* Image Container with Zoom Effect */}
      <div className="relative w-full h-full">
        {sliderImages.map((image, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-[800ms] ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div
                className={`relative w-full h-full ${
                  isActive && !isTransitioning ? "animate-slow-zoom" : ""
                }`}
                style={{
                  transform: isActive && !isTransitioning 
                    ? undefined // Let CSS animation handle it
                    : "scale(1.1)", // Start zoomed in
                }}
              >
                {/* Fallback gradient background if image doesn't load */}
                <div className="absolute inset-0 bg-gradient-to-br from-sierra-green via-sierra-blue to-sierra-green-dark"></div>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                  onError={(e) => {
                    // Hide image if it fails to load, show gradient instead
                    e.currentTarget.style.display = "none";
                  }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 text-white">
                  <h2 className="text-3xl lg:text-5xl font-bold mb-4 animate-fade-in-up">
                    {index === 0 && "Find Your Dream Job"}
                    {index === 1 && "Connect with Opportunity"}
                    {index === 2 && "We're Hiring!"}
                    {index === 3 && "Build Your Career"}
                  </h2>
                  <p className="text-lg lg:text-xl text-white/90 max-w-2xl mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                    {index === 0 && "Join thousands of job seekers finding opportunities in Sierra Leone"}
                    {index === 1 && "Empowering talent and employers to build a brighter future together"}
                    {index === 2 && "Post jobs and find the perfect candidates for your organization"}
                    {index === 3 && "Explore diverse career paths from gigs to full-time positions"}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                    <Link
                      href="/jobs"
                      className="px-6 py-3 bg-sierra-green hover:bg-sierra-green-dark text-white rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <span>Browse for Jobs</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      href="/freelancers"
                      className="px-6 py-3 bg-sierra-blue hover:bg-sierra-blue-dark text-white rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <span>Hire Talents</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Previous/Next Buttons */}
      <button
        onClick={() => goToSlide((currentIndex - 1 + sliderImages.length) % sliderImages.length)}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        onClick={() => goToSlide((currentIndex + 1) % sliderImages.length)}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}
