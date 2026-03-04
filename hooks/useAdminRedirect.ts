import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types/user.types';

/**
 * Custom hook to redirect admin users to organizations page
 * Use this in pages that admins shouldn't access
 */
export function useAdminRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === UserRole.ADMIN) {
      router.push('/organizations');
    }
  }, [user, router]);

  return { isAdmin: user?.role === UserRole.ADMIN };
}
