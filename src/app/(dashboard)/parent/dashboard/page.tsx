// src/app/(dashboard)/parent/dashboard/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ShoppingBag, BookOpen, TrendingUp, ArrowRight, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ParentDashboardPage() {
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
      title: 'My Children',
      value: '2',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/parent/children'
    },
    {
      title: 'Active Courses',
      value: '5',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/parent/purchases'
    },
    {
      title: 'Total Spent',
      value: '₦45,000',
      icon: ShoppingBag,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/parent/purchases'
    },
    {
      title: 'Progress',
      value: '78%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/parent/dashboard'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor your children's learning progress and manage their education
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

        {/* Children Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>My Children</CardTitle>
              <CardDescription>Monitor their progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Child Name {i}</p>
                    <p className="text-sm text-gray-600">SS{i} • {i + 1} active courses</p>
                  </div>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              ))}
              <Link href="/parent/children">
                <Button variant="outline" className="w-full">
                  Manage Children
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
              <CardDescription>Your latest transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Course Title {i}</p>
                    <p className="text-sm text-gray-600">₦{i * 5000} • {i} days ago</p>
                  </div>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              ))}
              <Link href="/parent/purchases">
                <Button variant="outline" className="w-full">
                  View All Purchases
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
            <CardDescription>Manage your children's education</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/parent/browse">
                <Button variant="outline" className="w-full h-20">
                  <div className="text-center">
                    <BookOpen className="h-6 w-6 mx-auto mb-2" />
                    <span>Browse Courses</span>
                  </div>
                </Button>
              </Link>
              <Link href="/parent/teachers">
                <Button variant="outline" className="w-full h-20">
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-2" />
                    <span>Find Teachers</span>
                  </div>
                </Button>
              </Link>
              <Link href="/messages">
                <Button variant="outline" className="w-full h-20">
                  <div className="text-center">
                    <ShoppingBag className="h-6 w-6 mx-auto mb-2" />
                    <span>View Purchases</span>
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