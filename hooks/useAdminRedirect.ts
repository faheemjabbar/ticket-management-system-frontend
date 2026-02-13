import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Custom hook to redirect admin users to organizations page
 * Use this in pages that admins shouldn't access
 */
export function useAdminRedirect() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role === 'admin') {
      router.push('/organizations');
    }
  }, [user, router]);

  return { isAdmin: user?.role === 'admin' };
}
