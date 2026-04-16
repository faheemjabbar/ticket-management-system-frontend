import type { Metadata } from "next";
import { CheckCircle2, Users, Zap, Shield, HeadphonesIcon, TicketIcon, BarChart3, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | TickFlo - Help Desk & Ticket Management System",
  description:
    "TickFlo is a modern help desk and ticket management platform built to streamline support workflows. Learn how our ticket system empowers teams to resolve issues faster.",
  keywords: [
    "help desk",
    "ticket system",
    "ticket management",
    "TickFlo",
    "support platform",
    "customer support software",
    "issue tracking",
    "ticketing software",
  ],
  openGraph: {
    title: "About TickFlo | Help Desk & Ticket Management",
    description:
      "Discover how TickFlo's ticket management system helps teams deliver faster, smarter support through a powerful help desk platform.",
    type: "website",
  },
};

// --- Sub-components ---

const DottedBackground: React.FC<{ opacity?: string; size?: string }> = ({
  opacity = "opacity-[0.12]",
  size = "200px",
}) => (
  <div
    className={`absolute inset-0 ${opacity} pointer-events-none z-0`}
    style={{
      backgroundImage: 'url("/dotted.jpg")',
      backgroundRepeat: "repeat",
      backgroundSize: size,
    }}
  />
);

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ValueCard: React.FC<ValueCardProps> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 flex flex-col gap-4">
    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-900">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
  </div>
);

interface TeamMemberProps {
  name: string;
  role: string;
  initials: string;
}



// --- Main Page ---

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm w-full">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">T</div>
            <span className="text-xl font-extrabold tracking-tight">Tick<span className="text-orange-600">Flo</span></span>
          </a>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <a href="/login" className="hover:text-orange-600 transition-colors">Sign in</a>
            <a href="/about-us" className="text-orange-600 transition-colors">About</a>
            <a href="/" className="hover:text-orange-600 font-semibold">Contact</a>
            <a href="/pricing" className="hover:text-orange-600 font-semibold">Pricing</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative py-20 md:py-28 px-4 bg-white overflow-hidden border-b border-gray-100 text-center">
        <DottedBackground opacity="opacity-[0.15]" size="180px" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            About TickFlo
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            The help desk built for <span className="text-orange-600">modern teams</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            TickFlo is a ticket management system designed to close the gap between customers and the teams that support them.
            Our ticket system makes help desk operations faster, clearer, and more human.
          </p>
        </div>
      </header>

      {/* Mission */}
      <section className="relative bg-slate-900 py-20 text-white overflow-hidden">
        <DottedBackground opacity="opacity-[0.05]" size="250px" />
        <div className="max-w-5xl mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-snug">
              Our mission: make ticket management <span className="text-orange-500">effortless</span>
            </h2>
            <p className="text-slate-400 leading-relaxed mb-4">
              We started TickFlo because we experienced firsthand how broken most help desk tools are. Tickets get lost,
              customers wait too long, and support teams burn out juggling disconnected systems.
            </p>
            <p className="text-slate-400 leading-relaxed">
              So we built a ticket system that works the way support teams actually think — organized, transparent, and fast.
              Whether you're running a small help desk or scaling enterprise-level ticket management, TickFlo adapts to you.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: "2500+", l: "Users" },
              { n: "4000+", l: "Tickets resolved" },
              { n: "100+", l: "Teams onboarded" },
              { n: "99.9%", l: "Uptime" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
                <div className="text-3xl font-black text-orange-500 mb-1">{stat.n}</div>
                <div className="text-slate-400 text-xs uppercase tracking-widest font-semibold">{stat.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What drives us</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-base">
              Every feature in our ticket system is built around these core principles.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ValueCard
              icon={<HeadphonesIcon size={22} />}
              title="Help desk first"
              description="We obsess over the help desk experience. Every workflow in TickFlo is designed to reduce friction for support agents and customers alike."
            />
            <ValueCard
              icon={<TicketIcon size={22} />}
              title="Smarter ticket management"
              description="Our ticket management engine auto-routes, prioritizes, and tracks every ticket so nothing slips through the cracks."
            />
            <ValueCard
              icon={<Zap size={22} />}
              title="Speed by default"
              description="Fast load times, instant updates, and a snappy interface — because slow tools kill productivity in any ticket system."
            />
            <ValueCard
              icon={<Shield size={22} />}
              title="Trust and transparency"
              description="Customers always know where their ticket stands. No black boxes, no guessing — just clear, honest communication."
            />
            <ValueCard
              icon={<BarChart3 size={22} />}
              title="Data-driven support"
              description="TickFlo surfaces the insights your team needs to improve response times and spot recurring issues before they escalate."
            />
            <ValueCard
              icon={<Users size={22} />}
              title="Built for teams"
              description="From solo founders to large support orgs, our ticket management system scales with your team without adding complexity."
            />
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="relative py-20 px-4 bg-white overflow-hidden">
        <DottedBackground opacity="opacity-[0.10]" size="200px" />
        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">How TickFlo started</h2>
          <p className="text-gray-600 leading-relaxed mb-5">
            TickFlo was born out of frustration with clunky, overpriced help desk software that required weeks of setup
            just to handle basic ticket management. We wanted something lean, intuitive, and actually enjoyable to use.
          </p>
          <p className="text-gray-600 leading-relaxed mb-5">
            Our founding team had backgrounds in developer tooling and customer support, which gave us a unique lens:
            we understood both sides of the ticket system equation. Developers need clean data and fast workflows.
            Customers need clarity and responsiveness.
          </p>
          <p className="text-gray-600 leading-relaxed">
            TickFlo bridges that gap — a help desk platform where both sides win.
          </p>
        </div>
      </section>

      {/* Team */}
      {/* <section className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The team behind TickFlo</h2>
          <p className="text-slate-400 mb-14 max-w-xl mx-auto">
            A small, focused team passionate about building the best ticket management system on the market.
          </p>
          <div className="flex flex-wrap justify-center gap-12">
            <TeamMember name="Alex Rivera" role="Co-founder & CEO" initials="AR" />
            <TeamMember name="Jordan Kim" role="Co-founder & CTO" initials="JK" />
            <TeamMember name="Sam Patel" role="Head of Product" initials="SP" />
            <TeamMember name="Casey Morgan" role="Lead Engineer" initials="CM" />
          </div>
        </div>
      </section> */}

      {/* CTA */}
      <section className="relative max-w-7xl mx-auto px-4 py-20 overflow-hidden">
        <div className="bg-orange-600 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between text-white relative shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="z-10 md:w-2/3 mb-8 md:mb-0">
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Ready to upgrade your help desk?
            </h2>
            <p className="text-orange-100 text-lg mb-8 max-w-lg">
              Join thousands of teams using TickFlo's ticket system to deliver faster, smarter support.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/register"
                className="bg-white text-orange-600 font-black py-3 px-8 rounded-xl hover:bg-orange-50 transition-all shadow-xl"
              >
                Get started free
              </a>
              <a
                href="mailto:hello@tickflo.com"
                className="border-2 border-white/40 text-white font-bold py-3 px-8 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Mail size={18} />
                Contact
              </a>
            </div>
          </div>
          <div className="z-10 hidden md:flex flex-col items-center gap-3">
            <CheckCircle2 size={80} className="text-white/20" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 text-sm text-gray-500 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-slate-900">© 2026 TickFlo</div>
          <div className="flex gap-8">
            <a href="/" className="hover:text-orange-600 transition-colors font-medium">Home</a>
            <a href="#" className="hover:text-orange-600 transition-colors font-medium">Privacy policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
