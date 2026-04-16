import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tickflo.com"),
  title: {
    default: "TickFlo — Simple Help Desk & Ticket Management System",
    template: "%s | TickFlo",
  },
  description:
    "TickFlo is a lightweight ticket management system for startups and small teams. Manage support tickets, track issues, and resolve faster. Try free for 7 days.",
  keywords: [
    "ticket management system",
    "help desk software",
    "ticketing system",
    "support ticket software",
    "help desk for startups",
    "simple ticket system",
    "TickFlo",
  ],
  authors: [{ name: "TickFlo" }],
  creator: "TickFlo",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tickflo.com",
    siteName: "TickFlo",
    title: "TickFlo — Simple Help Desk & Ticket Management System",
    description:
      "Lightweight ticket management for startups and small teams. Try free for 7 days — no credit card required.",
    images: [
      {
        url: "/inbox_overview_page.png",
        width: 1200,
        height: 630,
        alt: "TickFlo help desk dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TickFlo — Simple Help Desk & Ticket Management System",
    description:
      "Lightweight ticket management for startups and small teams. Try free for 7 days.",
    images: ["/inbox_overview_page.png"],
  },
  verification: {
    google: "KZGtXiiztaOH2T992_ADTCNzRb3wzIMycrsVd1b9wbs",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased font-sans`}>
        <ErrorBoundary>
          <AuthProvider>
            <Toaster position="top-right" />
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
