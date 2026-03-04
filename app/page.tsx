'use client'

import React from 'react';
import { CheckCircle2, Mail } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { authAPI } from '@/lib/api';

// --- Sub-Components ---

const DottedBackground: React.FC<{ opacity?: string; size?: string }> = ({ 
  opacity = "opacity-[0.12]", 
  size = "200px" 
}) => (
  <div 
    className={`absolute inset-0 ${opacity} pointer-events-none z-0`}
    style={{ 
      backgroundImage: 'url("/dotted.jpg")', 
      backgroundRepeat: 'repeat',
      backgroundSize: size,
    }}
  />
);

interface FeatureCardProps {
  title: string;
  description: string;
  points: string[];
  buttonText: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, points, buttonText }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col h-full relative z-10 border border-slate-100">
    <h3 className="text-3xl font-bold mb-4 text-slate-900">{title}</h3>
    <p className="text-gray-600 mb-6 text-base leading-relaxed">{description}</p>
    <ul className="space-y-3 mb-8 flex-grow">
      {points.map((point, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
          <CheckCircle2 className="text-orange-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{point}</span>
        </li>
      ))}
    </ul>
    <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-all w-full shadow-md hover:shadow-lg">
      {buttonText}
    </button>
  </div>
);

interface TestimonialProps {
  image: string;
  quote: string;
  name: string;
  title: string;
  reverse?: boolean;
}

const Testimonial: React.FC<TestimonialProps> = ({ image, quote, name, title, reverse }) => (
  <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 my-16 max-w-5xl mx-auto px-4 relative z-10`}>
    <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0 shadow-xl rounded-full">
      <img src={image} alt={name} className="rounded-full w-full h-full object-cover border-4 border-white" />
    </div>
    <div className="flex-1 text-left">
      <blockquote className="text-lg md:text-xl text-gray-700 italic mb-6 leading-relaxed bg-white/50 p-4 rounded-lg">
        "{quote}"
      </blockquote>
      <p className="font-bold text-gray-900 text-base">{name}</p>
      <p className="text-orange-600 text-sm mt-1">{title}</p>
    </div>
  </div>
);

// --- Main Page Component ---
export default function TickFloLanding() {
  const router = useRouter();
  const featureRef = useRef<HTMLDivElement>(null);
  const footerCTARef = useRef<HTMLDivElement>(null);

    const scrollToFeature = () => {
    featureRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const scrollToFooterCTA = () => {
    footerCTARef.current?.scrollIntoView({ behavior: "smooth" });
  }

  const handleSignInClick = async () => {
    try {
      // Check if admin exists via API
      const { exists } = await authAPI.checkAdminExists();
      if (exists) {
        router.push("/login");
      } else {
        router.push("/register");
      }
    } catch {
      // If API call fails, default to login
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm w-full">
        <div className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">T</div>
            <span className="text-xl font-extrabold tracking-tight">Tick<span className="text-orange-600">Flo</span></span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
            <button onClick={handleSignInClick} className="hover:text-orange-600 transition-colors">Sign in</button>
            <a onClick={scrollToFeature} className="hover:text-orange-600 transition-colors">About</a>
            <a onClick={scrollToFooterCTA} className="hover:text-orange-600 transition-colors">Contact Us</a>
          </div>
        </div>
      </nav>

      {/* Hero Section - WITH DOTS */}
      <header className="relative py-16 md:py-24 px-4 bg-white overflow-hidden border-b border-gray-100">
        <DottedBackground opacity="opacity-[0.15]" size="180px" />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 max-w-4xl mx-auto leading-tight">
            Save time managing tickets <br />
            <span className="text-orange-600">higher quality support</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-12 leading-relaxed">
            A dedicated platform for customers to submit tickets and get answers. While developers get insights to improve their products and services.
          </p>
          <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-white">
             <div className="relative aspect-[16/9]">
              <Image src="/inbox_overview_page.png" alt="Dashboard" fill className="object-contain" priority />
             </div>
          </div>
        </div>
      </header>

      {/* Feature Split Section - WITH DOTS */}
      <section ref={featureRef} className="relative bg-slate-900 py-20 text-white overflow-hidden">
        <DottedBackground opacity="opacity-[0.05]" size="250px" />
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">See how you can use Tick<span className="text-orange-600">Flo</span></h2>
            <p className="text-slate-400 text-lg max-w-3xl mx-auto">Information tailored for both sides of the support ticket.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <FeatureCard title="Developers" description="Spend time building and resolving issues efficiently." points={["Clear overview of all tickets", "Auto-assign tickets", "Detailed insights", "Advanced Analytics"]} buttonText="Read more" />
            <FeatureCard title="Customers" description="Report issues easily and get timely responses." points={["Easy ticket submission", "Rich text support", "Image/File uploads", "Real-time tracking"]} buttonText="Read more" />
          </div>
        </div>
      </section>

      {/* Stats Section - NO DOTS */}
      <section className="py-24 text-center bg-white border-y border-gray-50">
        <h2 className="text-3xl md:text-4xl font-bold mb-16">Trusted by developers and customers</h2>
        <div className="flex flex-wrap justify-center gap-16 md:gap-32 max-w-4xl mx-auto px-4">
          {[ { n: "2500+", l: "Users" }, { n: "4000+", l: "Tickets created" }, { n: "100+", l: "Inboxes" } ].map((stat, i) => (
            <div key={i} className="group">
              <div className="text-5xl md:text-6xl font-black text-orange-600 mb-2 transition-transform group-hover:scale-110">{stat.n}</div>
              <div className="text-gray-500 font-bold uppercase tracking-widest text-xs md:text-sm">{stat.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials - WITH DOTS */}
      <section className="relative py-20 bg-gray-50 overflow-hidden">
        <DottedBackground opacity="opacity-[0.12]" size="150px" />
        <Testimonial image="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200" name="Michael Chen" title="Lead Developer" quote="TickFlo has transformed how our team handles support. The analytics give us insights into what customers really need." />
        <Testimonial reverse image="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200" name="Sarah Martinez" title="Product Manager" quote="A game-changer. Customers can easily submit tickets with details, and we track everything in one place." />
      </section>

      {/* Footer CTA - WITH DOTS */}
      <section className="relative max-w-7xl mx-auto px-4 py-20 overflow-hidden">
        <div className="bg-orange-600 rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between text-white relative shadow-2xl overflow-hidden z-10">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          
          <div className="z-10 md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Ready to dive in?</h2>
            <p className="mb-10 text-orange-100 text-lg">We love to have a conversation with you and discuss the possibilities.</p>
            <button className="bg-white text-orange-600 font-black py-4 px-10 rounded-xl flex items-center gap-3 hover:bg-orange-50 transition-all shadow-xl">
              <Mail size={20} />
              Send us an email
            </button>
          </div>
          <div className="hidden md:block md:w-1/2 relative h-80 z-10">
            <Image src="/inbox_overview_page.png" alt="Preview" fill className="object-contain drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Bottom Footer - NO DOTS */}
      <footer ref={footerCTARef} className="border-t py-12 text-sm text-gray-500 bg-white">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-slate-900">© 2026 TickFlo</div>
          <div className="flex gap-8">
            <a onClick={scrollToFooterCTA} className="hover:text-orange-600 transition-colors font-medium">Contact</a>
            <a href="#" className="hover:text-orange-600 transition-colors font-medium">Privacy policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}