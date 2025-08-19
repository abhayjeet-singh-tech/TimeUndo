// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Keep your existing fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Updated metadata for TimeUndo
export const metadata: Metadata = {
  title: "TimeUndo - AI Daily Scheduler",                    // ← Browser tab title
  description: "Plan your day with AI-powered scheduling. Add tasks and get an optimized daily schedule with smart breaks.", // ← Search engine description
  
  // ✅ Favicon configuration
  icons: {
    icon: "/favicon.svg",           // ← Your SVG favicon
    shortcut: "/favicon.svg",       // ← Shortcut icon
    apple: "/favicon.svg",          // ← Apple touch icon (iOS)
  },
  
  // ✅ Additional metadata for better SEO and social sharing
  keywords: ["time management", "AI scheduler", "productivity", "daily planner", "task organizer"],
  authors: [{ name: "Your Name" }], // ← Replace with your name
  
  // ✅ Open Graph tags (for social media sharing)
  openGraph: {
    title: "TimeUndo - AI Daily Scheduler",
    description: "Plan your day with AI-powered scheduling",
    type: "website",
    locale: "en_US",
  },
  
  // ✅ Mobile app configuration
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#4f46e5", // ← Matches your app's indigo theme
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}