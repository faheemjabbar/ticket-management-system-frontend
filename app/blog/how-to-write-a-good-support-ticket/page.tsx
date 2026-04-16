import type { Metadata } from "next";
import BlogLayout from "@/components/blog/BlogLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Write a Good Support Ticket (Template Included)",
  description:
    "Bad support tickets slow everyone down. Share this guide with your customers to get better information upfront and resolve tickets faster.",
  keywords: ["how to write a support ticket", "support ticket template", "ticket management best practices"],
  openGraph: {
    title: "How to Write a Good Support Ticket — Template Included",
    description: "Share this with your customers to get better tickets and faster resolutions.",
    type: "article",
  },
};

export default function Post() {
  return (
    <BlogLayout
      title="How to Write a Good Support Ticket (Template Included)"
      description="Bad tickets slow everyone down. Share this guide with your customers and watch resolution times drop."
      date="April 18, 2026"
      readTime="4 min read"
      tag="Templates"
    >
      <p>
        The quality of a support ticket directly affects how fast it gets resolved. A vague ticket like
        "it's not working" can take 3–4 back-and-forth messages just to understand the problem.
        A well-written ticket gets resolved in one reply. Here's how to write one — and a template you can share with your customers.
      </p>

      <h2>Why bad tickets slow everything down</h2>
      <p>
        When a customer submits an incomplete ticket, your support team has to ask clarifying questions before they can
        even start working. Each round-trip adds hours or days to resolution time. Multiply that across dozens of tickets
        and your <strong>help desk</strong> becomes a bottleneck instead of a solution.
      </p>

      <h2>What to include in a support ticket</h2>
      <ul>
        <li><strong>A clear subject line</strong> — "Login button not working on mobile" beats "Problem with login"</li>
        <li><strong>What you were trying to do</strong> — The action that triggered the issue</li>
        <li><strong>What happened instead</strong> — The actual behavior vs the expected behavior</li>
        <li><strong>Steps to reproduce</strong> — How can the support agent recreate the issue?</li>
        <li><strong>Environment details</strong> — Browser, device, OS, app version if relevant</li>
        <li><strong>Screenshots or screen recordings</strong> — A picture is worth a thousand words in support</li>
        <li><strong>Priority/urgency</strong> — Is this blocking you completely or just inconvenient?</li>
      </ul>

      <h2>Support ticket template</h2>
      <p>Copy and share this with your customers:</p>

      <blockquote>
        <p><strong>Subject:</strong> [Short description of the issue]</p>
        <p><strong>What I was trying to do:</strong><br />
        [Describe the action you were taking]</p>
        <p><strong>What happened:</strong><br />
        [Describe the actual behavior]</p>
        <p><strong>What I expected to happen:</strong><br />
        [Describe what should have happened]</p>
        <p><strong>Steps to reproduce:</strong><br />
        1. [First step]<br />
        2. [Second step]<br />
        3. [Where it breaks]</p>
        <p><strong>Environment:</strong><br />
        Browser/Device/OS: [e.g., Chrome on Windows 11]</p>
        <p><strong>Attachments:</strong><br />
        [Screenshot or screen recording if available]</p>
        <p><strong>Priority:</strong><br />
        [ ] Blocking — I can't work at all<br />
        [ ] High — Major feature broken<br />
        [ ] Medium — Workaround exists<br />
        [ ] Low — Minor inconvenience</p>
      </blockquote>

      <h2>How TickFlo helps customers write better tickets</h2>
      <p>
        <Link href="/">TickFlo's</Link> ticket submission form is structured to guide customers through the right information
        automatically. Fields for priority, labels, and file attachments are built in — so you get better tickets
        without having to train every customer individually.
      </p>

      <p>
        Better tickets mean faster resolutions, happier customers, and a more efficient <strong>ticket management system</strong>.
        <Link href="/register"> Start your free trial</Link> and see the difference a structured help desk makes.
      </p>
    </BlogLayout>
  );
}
