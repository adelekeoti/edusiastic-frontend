// src/app/(dashboard)/student/discover/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import DiscoverFeed from '@/components/posts/DiscoverFeed';
import { Post } from '@/types';
import { toast } from 'sonner';

export default function StudentDiscoverPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Redirect if not student
  useEffect(() => {
    if (user && user.role !== 'STUDENT') {
      toast.error('Access denied. Students only.');
      router.push('/dashboard');
    }
  }, [user, router]);

  // Email verification check
  useEffect(() => {
    if (user && !user.isVerified) {
      router.push('/verify-email-prompt');
    }
  }, [user, router]);

  const handlePostClick = (post: Post) => {
    router.push(`/student/posts/${post.id}`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <DiscoverFeed onPostClick={handlePostClick} />
      </div>
    </DashboardLayout>
  );
}