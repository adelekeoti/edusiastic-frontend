// src/components/auth/ProtectedRoute.tsx - Enhanced with auto-redirect

'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { UserRole } from '@/types';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireVerification?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireVerification = false
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Check if email verification is required
    if (requireVerification && !user.isVerified) {
      router.push('/verify-email-prompt');
      return;
    }

    // Check if user has required role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on user's actual role
      switch (user.role) {
        case UserRole.STUDENT:
          router.push('/student/dashboard');
          break;
        case UserRole.TEACHER:
          router.push('/teacher/dashboard');
          break;
        case UserRole.PARENT:
          router.push('/parent/dashboard');
          break;
        case UserRole.ADMIN:
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/');
      }
      return;
    }
  }, [isAuthenticated, user, allowedRoles, requireVerification, router]);

  // Show loading while checking authentication
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Check role access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}