'use client';

import { memo, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Plus,
  X,
  Settings,
  LogOut,
  Folder,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import OrganizationBadge from '@/components/ui/OrganizationBadge';
import { useRouter } from "next/navigation";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = memo(function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, hasRole, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    {
      name: 'Overview',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['project-manager', 'developer', 'qa'],  // Fixed: use hyphen
    },
    {
      name: 'Tickets',
      href: '/tickets',
      icon: Ticket,
      roles: ['project-manager', 'qa'],  // Fixed: use hyphen
    },
  ];

  const staffNavigation = [
    {
      name: 'Organizations',
      href: '/organizations',
      icon: Building2,
      roles: ['admin'],  // Only admin
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: Folder,
      roles: ['project-manager', 'qa'],  // Fixed: use hyphen
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      roles: ['project-manager', 'qa'],  // Fixed: use hyphen
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['project-manager', 'developer', 'qa', 'admin'],  // Fixed: use hyphen
    },
  ];

  // Filter navigation based on user role
  const filteredNavigation = navigation.filter(item => 
    user && hasRole(item.roles)
  );

  const filteredStaffNav = staffNavigation.filter(item => 
    user && hasRole(item.roles)
  );

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-[#2C3E50] text-white z-50 transition-transform duration-300 ease-in-out flex flex-col",
          "w-64 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Ticket className="text-white w-5 h-5 transform -rotate-45" />
            </div>
            <span className="text-lg font-bold">
              Tick<span className="text-orange-500">Flo</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">         
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0 space-y-3">
          {/* Organization Badge */}
          <OrganizationBadge />
          
          <div>
            <div className="text-sm font-medium text-white">
              {user?.name || 'Guest User'}
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {user?.role || 'No role'}
            </div>
          </div>
          
          {/* Only show New Ticket button for QA and Project Manager (not admin) */}
          {user && (user.role === 'qa' || user.role === 'project-manager') && (
            <button
              onClick={() => router.push('/tickets/create')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-sm hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              New Ticket
            </button>
          )}
        </div>

        {/* Navigation - Scrollable content */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                  isActive
                    ? "bg-gray-700 text-white font-medium"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Staff Only Section */}
          {filteredStaffNav.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-3">
                  Staff Only
                </div>
              </div>
              {filteredStaffNav.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                      isActive
                        ? "bg-gray-700 text-white font-medium"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        {/* User Profile at Bottom */}
        {user && (
          <div className="p-4 border-t border-gray-700 bg-[#2C3E50] flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.name}
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  if (onClose) onClose();
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors group"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
});

export default Sidebar;
