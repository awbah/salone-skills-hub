import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Salone SkillsHub - Connect Talent with Opportunity",
  description: "Empowering job seekers and employers across Sierra Leone to build a brighter future together. Find your dream job or the perfect candidate today.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const root = document.documentElement;
                  // CRITICAL: Always remove dark class first to prevent flash
                  root.classList.remove('dark');
                  root.classList.add('light');
                  
                  // Check for saved theme preference
                  const savedTheme = localStorage.getItem('theme');
                  
                  // Default to light mode if no preference or if preference is light
                  if (!savedTheme || savedTheme === 'light') {
                    root.classList.remove('dark');
                    root.classList.add('light');
                    localStorage.setItem('theme', 'light');
                    return; // Exit early, light mode is set
                  }
                  
                  // Only apply dark mode if explicitly saved as 'dark'
                  if (savedTheme === 'dark') {
                    root.classList.remove('light');
                    root.classList.add('dark');
                  } else if (savedTheme === 'system') {
                    // System theme - check preference
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      root.classList.remove('light');
                      root.classList.add('dark');
                    } else {
                      root.classList.remove('dark');
                      root.classList.add('light');
                    }
                  }
                } catch (e) {
                  // On any error, ensure light mode
                  const root = document.documentElement;
                  root.classList.remove('dark');
                  root.classList.add('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
