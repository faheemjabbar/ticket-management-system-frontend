'use client';

import { useState, memo } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = memo(function DashboardLayout({ 
  children
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Left Column */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Page Content */}
        <main className="flex-1 p-3 md:p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  );
});

export default DashboardLayout;
