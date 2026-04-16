import Link from "next/link";

interface BlogLayoutProps {
  title: string;
  description: string;
  date: string;
  readTime: string;
  tag: string;
  children: React.ReactNode;
}

export default function BlogLayout({ title, description, date, readTime, tag, children }: BlogLayoutProps) {
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
            <Link href="/pricing" className="hover:text-orange-600 transition-colors">Pricing</Link>
            <Link href="/blog" className="hover:text-orange-600 transition-colors">Blog</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="border-b border-gray-100 py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="text-xs text-orange-600 font-bold uppercase tracking-widest hover:underline">
            ← Back to Blog
          </Link>
          <div className="mt-4 mb-3">
            <span className="bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">{tag}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black leading-tight mb-4">{title}</h1>
          <p className="text-gray-500 text-base leading-relaxed mb-5">{description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{date}</span>
            <span>·</span>
            <span>{readTime}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <article className="prose prose-slate prose-headings:font-black prose-h2:text-2xl prose-h3:text-xl prose-a:text-orange-600 prose-strong:text-slate-900 max-w-none">
          {children}
        </article>

        {/* CTA */}
        <div className="mt-16 bg-orange-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-black mb-3">Ready to try TickFlo?</h2>
          <p className="text-orange-100 mb-6 text-sm">
            Start your 7-day free trial — no credit card required. Your help desk is ready in minutes.
          </p>
          <Link
            href="/register"
            className="inline-block bg-white text-orange-600 font-black py-3 px-8 rounded-xl hover:bg-orange-50 transition-all shadow-lg"
          >
            Get started free
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 text-sm text-gray-500 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-slate-900">© 2026 TickFlo</div>
          <div className="flex gap-8">
            <Link href="/" className="hover:text-orange-600 transition-colors font-medium">Home</Link>
            <Link href="/pricing" className="hover:text-orange-600 transition-colors font-medium">Pricing</Link>
            <Link href="/blog" className="hover:text-orange-600 transition-colors font-medium">Blog</Link>
            <Link href="#" className="hover:text-orange-600 transition-colors font-medium">Privacy policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
