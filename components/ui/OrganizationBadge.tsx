'use client';

import { Building2, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function OrganizationBadge() {
  const { user } = useAuth();

  if (!user) return null;

  // Admin badge (was superadmin)
  if (user.role === 'admin') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-900/20 border border-red-700/30 rounded-lg">
        <Shield className="w-4 h-4 text-red-400" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-red-400 uppercase tracking-wide">
            System Admin
          </div>
          <div className="text-[9px] text-red-300/70">
            All Organizations
          </div>
        </div>
      </div>
    );
  }

  // Regular user with organization
  if (user.organization) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-orange-900/20 border border-orange-700/30 rounded-lg">
        <Building2 className="w-4 h-4 text-orange-400" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold text-orange-400 uppercase tracking-wide">
            Organization
          </div>
          <div className="text-[9px] text-orange-300/70 truncate">
            {user.organization.name}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
