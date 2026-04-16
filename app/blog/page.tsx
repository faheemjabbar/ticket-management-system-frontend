import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog — Help Desk & Ticket Management Tips",
  description:
    "Guides, tips, and strategies for running a better help desk and ticket management system. Built for startups and small support teams.",
  openGraph: {
    title: "TickFlo Blog — Help Desk & Ticket Management Tips",
    description:
      "Practical guides for startups on ticket management, help desk setup, and support best practices.",
    type: "website",
  },
};

const posts = [
  {
    slug: "why-your-startup-needs-a-ticket-management-system",
    title: "Why Your Startup Needs a Ticket Management System (Not Just Email)",
    description:
      "Email threads lose tickets. A proper ticket management system keeps your team organized and your customers happy.",
    date: "April 10, 2026",
    readTime: "5 min read",
    tag: "Getting Started",
  },
  {
    slug: "zendesk-vs-freshdesk-vs-tickflo",
    title: "Zendesk vs Freshdesk vs TickFlo: Which Help Desk Is Right for Small Teams?",
    description:
      "A no-fluff comparison of the top help desk tools — pricing, features, and who each one is actually built for.",
    date: "April 11, 2026",
    readTime: "7 min read",
    tag: "Comparison",
  },
  {
    slug: "how-to-set-up-a-help-desk-for-your-startup",
    title: "How to Set Up a Help Desk for Your Startup in Under 30 Minutes",
    description:
      "A step-by-step walkthrough for getting your first help desk live — no IT team required.",
    date: "April 12, 2026",
    readTime: "6 min read",
    tag: "Tutorial",
  },
  {
    slug: "signs-your-team-is-losing-track-of-support-tickets",
    title: "8 Signs Your Team Is Losing Track of Customer Support Tickets",
    description:
      "If any of these sound familiar, it's time to move beyond spreadsheets and email chains.",
    date: "April 13, 2026",
    readTime: "4 min read",
    tag: "Tips",
  },
  {
    slug: "free-vs-paid-help-desk-software",
    title: "Free vs Paid Help Desk Software: What Do You Actually Need?",
    description:
      "Not every team needs a $50/seat tool. Here's how to decide what's right for your stage.",
    date: "April 14, 2026",
    readTime: "5 min read",
    tag: "Buying Guide",
  },
  {
    slug: "how-dev-teams-use-a-ticket-system-for-bug-reports",
    title: "How Dev Teams Can Use a Ticket System to Manage Bug Reports",
    description:
      "Bug trackers and help desks don't have to be separate. Here's how to unify them.",
    date: "April 15, 2026",
    readTime: "5 min read",
    tag: "Developer Tips",
  },
  {
    slug: "what-is-a-help-desk",
    title: "What Is a Help Desk? A Plain-English Guide for Non-Technical Founders",
    description:
      "No jargon. Just a clear explanation of what a help desk does and when you need one.",
    date: "April 16, 2026",
    readTime: "4 min read",
    tag: "Explainer",
  },
  {
    slug: "real-cost-of-zendesk-for-small-teams",
    title: "The Real Cost of Zendesk for Small Teams (And What to Use Instead)",
    description:
      "Zendesk's pricing adds up fast. We break down the real numbers and show you a leaner alternative.",
    date: "April 17, 2026",
    readTime: "5 min read",
    tag: "Comparison",
  },
  {
    slug: "how-to-write-a-good-support-ticket",
    title: "How to Write a Good Support Ticket (Template Included)",
    description:
      "Bad tickets slow everyone down. Share this guide with your customers and watch resolution times drop.",
    date: "April 18, 2026",
    readTime: "4 min read",
    tag: "Templates",
  },
  {
    slug: "ticket-management-best-practices-for-small-teams",
    title: "Ticket Management Best Practices for Teams Under 20 People",
    description:
      "Simple rules that keep your ticket system clean, fast, and actually useful as you grow.",
    date: "April 19, 2026",
    readTime: "5 min read",
    tag: "Best Practices",
  },
];

const tagColors: Record<string, string> = {
  "Getting Started": "bg-green-50 text-green-700",
  Comparison: "bg-blue-50 text-blue-700",
  Tutorial: "bg-purple-50 text-purple-700",
  Tips: "bg-yellow-50 text-yellow-700",
  "Buying Guide": "bg-orange-50 text-orange-700",
  "Developer Tips": "bg-slate-100 text-slate-700",
  Explainer: "bg-pink-50 text-pink-700",
  Templates: "bg-teal-50 text-teal-700",
  "Best Practices": "bg-indigo-50 text-indigo-700",
};

export default function BlogIndexPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm w-full">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">T</div>
            <span className="text-xl font-extrabold tracking-tight">Tick<span className="text-orange-600">Flo</span></span>
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <Link href="/login" className="hover:text-orange-600 transition-colors">Sign in</Link>
            <Link href="/" className="hover:text-orange-600 transition-colors">Home</Link>
            <Link href="/about-us" className="hover:text-orange-600 transition-colors">About Us</Link>
            <Link href="/pricing" className="hover:text-orange-600 transition-colors">Pricing</Link>
            <Link href="/blog" className="text-orange-600 font-semibold">Blog</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="py-16 px-4 text-center border-b border-gray-100">
        <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-5">
          TickFlo Blog
        </span>
        <h1 className="text-4xl md:text-5xl font-black mb-4">
          Help desk & ticket management <span className="text-orange-600">guides</span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-base">
          Practical advice for startups and small teams running a better ticket system.
        </p>
      </header>

      {/* Posts Grid */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white border border-slate-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
            >
              <span className={`self-start text-xs font-bold px-3 py-1 rounded-full ${tagColors[post.tag] ?? "bg-gray-100 text-gray-600"}`}>
                {post.tag}
              </span>
              <h2 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed flex-grow">{post.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                <span>{post.date}</span>
                <span>·</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 text-sm text-gray-500 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-slate-900">© 2026 TickFlo</div>
          <div className="flex gap-8">
            <Link href="/" className="hover:text-orange-600 transition-colors font-medium">Home</Link>
            <Link href="/pricing" className="hover:text-orange-600 transition-colors font-medium">Pricing</Link>
            <Link href="/about-us" className="hover:text-orange-600 transition-colors font-medium">About Us</Link>
            <Link href="#" className="hover:text-orange-600 transition-colors font-medium">Privacy policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
