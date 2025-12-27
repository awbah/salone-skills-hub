"use client";

export default function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto relative z-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            © {currentYear} Salone SkillsHub. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <a
              href="/terms"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-sierra-green dark:hover:text-sierra-green transition-colors"
            >
              Terms
            </a>
            <a
              href="/privacy"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-sierra-green dark:hover:text-sierra-green transition-colors"
            >
              Privacy
            </a>
            <a
              href="/about"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-sierra-green dark:hover:text-sierra-green transition-colors"
            >
              About
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

