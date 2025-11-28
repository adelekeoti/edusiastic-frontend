// src/app/(dashboard)/layout.tsx

'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}