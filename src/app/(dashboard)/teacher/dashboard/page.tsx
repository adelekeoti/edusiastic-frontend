// src/app/(dashboard)/teacher/dashboard/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Users, DollarSign, Star, TrendingUp, ArrowRight, AlertCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function TeacherDashboardPage() {
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
      title: 'Total Products',
      value: '8',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/teacher/products'
    },
    {
      title: 'Active Students',
      value: '45',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/teacher/students'
    },
    {
      title: 'Monthly Earnings',
      value: '₦125,000',
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/teacher/earnings'
    },
    {
      title: 'Average Rating',
      value: user?.averageRating?.toFixed(1) || '0.0',
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/teacher/profile'
    },
  ];

  // Check if profile is complete
  const profileCompleteness = user?.profileCompletenessScore || 0;
  const isProfileIncomplete = profileCompleteness < 80;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.title} {user?.firstName}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your teaching business today
          </p>
        </div>

        {/* Profile Completion Alert */}
        {isProfileIncomplete && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="flex items-start gap-4 pt-6">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Your profile is {profileCompleteness}% complete. Complete it to be visible to students and start earning!
                </p>
                <Link href="/teacher/profile/edit">
                  <Button size="sm" className="mt-3">
                    Complete Profile Now
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

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
          {/* Recent Products */}
          <Card>
            <CardHeader>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage your offerings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Product Title {i}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">Active</Badge>
                      <span className="text-sm text-gray-600">₦{i * 5000}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">Edit</Button>
                </div>
              ))}
              <Link href="/teacher/products">
                <Button variant="outline" className="w-full">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Students */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>Your latest enrollments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Student Name {i}</p>
                    <p className="text-sm text-gray-600">Enrolled {i} days ago</p>
                  </div>
                  <Button size="sm" variant="ghost">View</Button>
                </div>
              ))}
              <Link href="/teacher/students">
                <Button variant="outline" className="w-full">
                  View All Students
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
            <CardDescription>Manage your teaching business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/teacher/products/create">
                <Button variant="outline" className="w-full h-20">
                  <div className="text-center">
                    <Package className="h-6 w-6 mx-auto mb-2" />
                    <span>Create Product</span>
                  </div>
                </Button>
              </Link>
              <Link href="/teacher/groups/create">
                <Button variant="outline" className="w-full h-20">
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-2" />
                    <span>Create Group</span>
                  </div>
                </Button>
              </Link>
              <Link href="/teacher/posts/create">
                <Button variant="outline" className="w-full h-20">
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                    <span>Create Post</span>
                  </div>
                </Button>
              </Link>
              <Link href="/teacher/earnings">
                <Button variant="outline" className="w-full h-20">
                  <div className="text-center">
                    <DollarSign className="h-6 w-6 mx-auto mb-2" />
                    <span>View Earnings</span>
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