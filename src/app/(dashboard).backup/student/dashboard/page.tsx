// src/app/(dashboard)/student/dashboard/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ClipboardList, Users, TrendingUp, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  // ✅ EMAIL VERIFICATION CHECK
  useEffect(() => {
    if (user && !user.isVerified) {
      router.push('/verify-email-prompt');
    }
  }, [user, router]);

  // Show loading while checking verification
  if (user && !user.isVerified) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-center">Email Verification Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Redirecting you to verify your email...
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      title: 'Active Courses',
      value: '3',
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/student/my-courses'
    },
    {
      title: 'Pending Assignments',
      value: '5',
      icon: ClipboardList,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/student/assignments'
    },
    {
      title: 'My Groups',
      value: '2',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/student/groups'
    },
    {
      title: 'Learning Streak',
      value: '7 days',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/student/dashboard'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Continue your learning journey and achieve your goals
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Stay on top of your deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Mathematics Assignment {i}</p>
                    <p className="text-sm text-gray-600">Due in {i + 1} days</p>
                  </div>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              ))}
              <Link href="/student/assignments">
                <Button variant="outline" className="w-full">
                  View All Assignments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Course Title {i}</p>
                    <p className="text-sm text-gray-600">{i * 30}% completed</p>
                  </div>
                  <Button size="sm" variant="ghost">Continue</Button>
                </div>
              ))}
              <Link href="/student/my-courses">
                <Button variant="outline" className="w-full">
                  View All Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Explore and discover new learning opportunities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/student/browse">
                <Button variant="outline" className="w-full h-20">
                  <div className="text-center">
                    <BookOpen className="h-6 w-6 mx-auto mb-2" />
                    <span>Browse Courses</span>
                  </div>
                </Button>
              </Link>
              <Link href="/student/discover">
                <Button variant="outline" className="w-full h-20">
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                    <span>Discover Posts</span>
                  </div>
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline" className="w-full h-20">
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-2" />
                    <span>Message Teachers</span>
                  </div>
                  
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}