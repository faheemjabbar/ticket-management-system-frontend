'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setIsRedirecting(true);
      router.push('/login');
      return;
    }

    // Check if user's organization is inactive (only for non-admin users)
    if (!loading && isAuthenticated && user) {
      if (user.role !== 'admin' && user.organization && user.organization.isActive === false) {
        setIsRedirecting(true);
        toast.error('Your organization has been deactivated. Please contact support.');
        logout();
      }
    }
  }, [isAuthenticated, loading, user, router, logout]);

  // Show loading state while checking authentication or redirecting
  if (loading || isRedirecting) {
    return <LoadingSpinner fullScreen size="lg" text={isRedirecting ? "Redirecting..." : "Authenticating..."} />;
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return <LoadingSpinner fullScreen size="lg" text="Redirecting..." />;
  }

  // Don't render if organization is inactive (non-admin users)
  if (user && user.role !== 'admin' && user.organization && user.organization.isActive === false) {
    return <LoadingSpinner fullScreen size="lg" text="Redirecting..." />;
  }

  return <>{children}</>;
}
