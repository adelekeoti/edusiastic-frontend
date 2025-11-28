// src/app/(dashboard)/teacher/layout.tsx

'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { UserRole } from '@/types';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={[UserRole.TEACHER]}>
      {children}
    </ProtectedRoute>
  );
}