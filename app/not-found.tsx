'use client';

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Search, Ticket } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
            <Ticket className="w-5 h-5 text-white transform -rotate-45" />
          </div>
          <span className="text-lg font-bold text-gray-900">
            Tick<span className="text-orange-600">Flo</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              {/* Large 404 Text */}
              <div className="text-[120px] font-bold text-gray-200 leading-none select-none">
                404
              </div>
              
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-2">
              Page Not Found
            </h1>
            <p className="text-xs text-gray-600 leading-relaxed">
              Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or the URL might be incorrect.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">
              Need Help?
            </p>
            <p className="text-xs text-gray-600">
              If you believe this is an error, please contact your system administrator or try refreshing the page.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-gray-500">
            © 2026 TickFlo. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[10px] text-gray-500">
            <a href="#" className="hover:text-orange-600 transition-colors">Help</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Support</a>
            <a href="#" className="hover:text-orange-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
