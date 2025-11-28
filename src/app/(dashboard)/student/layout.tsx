// src/app/(dashboard)/student/layout.tsx

'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.STUDENT]}>
      {children}
    </ProtectedRoute>
  );
}