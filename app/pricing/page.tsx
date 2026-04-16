import type { Metadata } from "next";
import { CheckCircle2, X, Zap, Building2, Users, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing — Help Desk & Ticket Management Plans",
  description:
    "Simple, transparent pricing for TickFlo's ticket management system. Start with a free 1-week trial — no credit card required. Find the right help desk plan for your team.",
  keywords: [
    "TickFlo pricing",
    "help desk pricing",
    "ticket system plans",
    "ticket management pricing",
    "free trial help desk",
    "ticketing software cost",
  ],
  openGraph: {
    title: "TickFlo Pricing | Help Desk & Ticket Management Plans",
    description:
      "Try TickFlo's ticket system free for 7 days. No credit card needed. Upgrade to the plan that fits your team.",
    type: "website",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does the 1-week free trial work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sign up and get full access to your chosen plan for 7 days — no credit card required. At the end of the trial you can subscribe or your account pauses automatically.",
      },
    },
    {
      "@type": "Question",
      name: "Can I switch plans later?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. You can upgrade or downgrade your ticket management plan at any time from your account settings. Changes take effect immediately.",
      },
    },
    {
      "@type": "Question",
      name: "What counts as a ticket?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Any support request submitted through the TickFlo ticket system counts as one ticket, regardless of how many replies it has.",
      },
    },
    {
      "@type": "Question",
      name: "Is there a setup fee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "None. Your help desk is ready to go the moment you sign up. No onboarding fees, no hidden costs.",
      },
    },
  ],
};

// --- Types ---

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  icon: React.ReactNode;
  price: string;
  period: string;
  description: string;
  features: PlanFeature[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

// --- Data ---

const plans: Plan[] = [
  {
    name: "Starter",
    icon: <Zap size={20} />,
    price: "$19",
    period: "/ month",
    description: "Perfect for small teams getting started with a ticket system.",
    highlighted: false,
    cta: "Start free trial",
    features: [
      { text: "Up to 3 agents", included: true },
      { text: "500 tickets / month", included: true },
      { text: "Email ticket submission", included: true },
      { text: "Basic help desk dashboard", included: true },
      { text: "File & image attachments", included: true },
      { text: "1-week free trial", included: true },
      { text: "Custom ticket labels", included: false },
      { text: "Advanced analytics", included: false },
      { text: "Priority support", included: false },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Pro",
    icon: <Users size={20} />,
    price: "$49",
    period: "/ month",
    description: "For growing teams that need full ticket management power.",
    highlighted: true,
    badge: "Most popular",
    cta: "Start free trial",
    features: [
      { text: "Up to 15 agents", included: true },
      { text: "Unlimited tickets", included: true },
      { text: "Email ticket submission", included: true },
      { text: "Full help desk dashboard", included: true },
      { text: "File & image attachments", included: true },
      { text: "1-week free trial", included: true },
      { text: "Custom ticket labels", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support", included: false },
      { text: "API access", included: false },
    ],
  },
  {
    name: "Enterprise",
    icon: <Building2 size={20} />,
    price: "Custom",
    period: "",
    description: "Scalable ticket management for large orgs with complex needs.",
    highlighted: false,
    cta: "Contact us",
    features: [
      { text: "Unlimited agents", included: true },
      { text: "Unlimited tickets", included: true },
      { text: "Email ticket submission", included: true },
      { text: "Full help desk dashboard", included: true },
      { text: "File & image attachments", included: true },
      { text: "1-week free trial", included: true },
      { text: "Custom ticket labels", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Priority support", included: true },
      { text: "API access", included: true },
    ],
  },
];

const faqs = [
  {
    q: "How does the 1-week free trial work?",
    a: "Sign up and get full access to your chosen plan for 7 days — no credit card required. At the end of the trial you can subscribe or your account pauses automatically.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade your ticket management plan at any time from your account settings. Changes take effect immediately.",
  },
  {
    q: "What counts as a ticket?",
    a: "Any support request submitted through the TickFlo ticket system counts as one ticket, regardless of how many replies it has.",
  },
  {
    q: "Is there a setup fee?",
    a: "None. Your help desk is ready to go the moment you sign up. No onboarding fees, no hidden costs.",
  },
];

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

const PlanCard: React.FC<{ plan: Plan }> = ({ plan }) => (
  <div
    className={`relative flex flex-col rounded-2xl p-8 h-full transition-all ${
      plan.highlighted
        ? "bg-slate-900 text-white shadow-2xl scale-[1.03] border-2 border-orange-500"
        : "bg-white text-slate-900 shadow-lg border border-slate-100"
    }`}
  >
    {plan.badge && (
      <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow">
        {plan.badge}
      </span>
    )}

    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${plan.highlighted ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-600"}`}>
      {plan.icon}
    </div>

    <h3 className="text-xl font-black mb-1">{plan.name}</h3>
    <p className={`text-sm mb-6 leading-relaxed ${plan.highlighted ? "text-slate-400" : "text-gray-500"}`}>
      {plan.description}
    </p>

    <div className="flex items-end gap-1 mb-8">
      <span className="text-5xl font-black">{plan.price}</span>
      {plan.period && (
        <span className={`text-sm mb-2 ${plan.highlighted ? "text-slate-400" : "text-gray-400"}`}>
          {plan.period}
        </span>
      )}
    </div>

    <ul className="space-y-3 mb-8 flex-grow">
      {plan.features.map((f, i) => (
        <li key={i} className="flex items-center gap-3 text-sm">
          {f.included ? (
            <CheckCircle2 className="text-orange-500 w-4 h-4 flex-shrink-0" />
          ) : (
            <X className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? "text-slate-600" : "text-gray-300"}`} />
          )}
          <span className={!f.included ? (plan.highlighted ? "text-slate-500" : "text-gray-400") : ""}>
            {f.text}
          </span>
        </li>
      ))}
    </ul>

    <a
      href={plan.name === "Enterprise" ? "mailto:hello@tickflo.com" : "/register"}
      className={`w-full text-center font-bold py-3 px-6 rounded-xl transition-all shadow-md ${
        plan.highlighted
          ? "bg-orange-500 hover:bg-orange-600 text-white"
          : "bg-slate-900 hover:bg-slate-800 text-white"
      }`}
    >
      {plan.cta}
    </a>
  </div>
);

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm w-full">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">T</div>
            <span className="text-xl font-extrabold tracking-tight">Tick<span className="text-orange-600">Flo</span></span>
          </a>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <a href="/login" className="hover:text-orange-600 transition-colors">Sign in</a>
            <a href="/about-us" className="hover:text-orange-600 transition-colors">About</a>
            <a href="/" className="hover:text-orange-600 transition-colors">Contact</a>
            <a href="/pricing" className="text-orange-600 font-semibold">Pricing</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative py-20 md:py-24 px-4 bg-white overflow-hidden border-b border-gray-100 text-center">
        <DottedBackground opacity="opacity-[0.15]" size="180px" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="inline-block bg-orange-50 text-orange-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            Simple pricing
          </span>
          <h1 className="text-4xl md:text-6xl font-black mb-5 leading-tight">
            One week free, <span className="text-orange-600">no strings attached</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Try TickFlo's full ticket management system free for 7 days. No credit card required.
            Pick the help desk plan that fits your team and scale as you grow.
          </p>
        </div>
      </header>

      {/* Trial Banner */}
      <div className="bg-orange-50 border-y border-orange-100 py-4 px-4 text-center">
        <p className="text-sm font-semibold text-orange-700">
          🎉 Every plan includes a <span className="underline underline-offset-2">7-day free trial</span> — no credit card needed. Cancel anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-10">
            All prices in USD. Annual billing available — save up to 20%.
          </p>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="relative bg-slate-900 py-20 px-4 text-white overflow-hidden">
        <DottedBackground opacity="opacity-[0.05]" size="250px" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Everything your help desk needs
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Unlimited ticket history",
              "Custom ticket labels & priorities",
              "Multi-agent collaboration",
              "Rich text & file attachments",
              "Real-time ticket status tracking",
              "Help desk analytics dashboard",
              "Sprint & project integration",
              "Role-based access control",
              "Email notifications",
              "Mobile-friendly ticket system",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm">
                <CheckCircle2 className="text-orange-500 w-4 h-4 flex-shrink-0" />
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-20 px-4 bg-gray-50 overflow-hidden">
        <DottedBackground opacity="opacity-[0.08]" size="200px" />
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-7xl mx-auto px-4 py-20 overflow-hidden">
        <div className="bg-orange-600 rounded-3xl p-8 md:p-16 text-white relative shadow-2xl overflow-hidden text-center">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
              Start your free trial today
            </h2>
            <p className="text-orange-100 text-lg mb-8">
              7 days of full access to TickFlo's ticket management system. No credit card, no commitment.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/register"
                className="bg-white text-orange-600 font-black py-3 px-10 rounded-xl hover:bg-orange-50 transition-all shadow-xl"
              >
                Get started free
              </a>
              <a
                href="mailto:hello@tickflo.com"
                className="border-2 border-white/40 text-white font-bold py-3 px-8 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Mail size={18} />
                Talk to sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 text-sm text-gray-500 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-slate-900">© 2026 TickFlo</div>
          <div className="flex gap-8">
            <a href="/" className="hover:text-orange-600 transition-colors font-medium">Home</a>
            <a href="/about-us" className="hover:text-orange-600 transition-colors font-medium">About Us</a>
            <a href="#" className="hover:text-orange-600 transition-colors font-medium">Privacy policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
