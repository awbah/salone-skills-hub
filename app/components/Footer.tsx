import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-sierra-green-dark to-sierra-green text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-sierra-blue rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold">SkillsHub</span>
            </div>
            <p className="text-white/80 text-sm">
              Connecting talent with opportunity across Sierra Leone. Empowering
              job seekers and employers to build a brighter future together.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/jobs"
                  className="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform"
                >
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/employers"
                  className="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform"
                >
                  For Employers
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Job Seekers</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/register/seeker"
                  className="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform"
                >
                  Create Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/login/seeker"
                  className="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform"
                >
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/register/employer"
                  className="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform"
                >
                  Post Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/login/employer"
                  className="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-white/80 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block transform"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} Salone SkillsHub. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link
              href="/privacy"
              className="text-white/60 hover:text-white text-sm transition-colors duration-300"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-white/60 hover:text-white text-sm transition-colors duration-300"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

