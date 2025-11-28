// src/app/(dashboard)/student/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getStudentProfile, StudentProfile } from '@/lib/api/studentProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  User, 
  Mail, 
  School, 
  BookOpen, 
  Edit, 
  Eye, 
  EyeOff,
  Calendar,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function StudentProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-profile'],
    queryFn: getStudentProfile,
    enabled: !!user && user.role === 'STUDENT'
  });

  const profile = data?.data?.profile;

  useEffect(() => {
    if (user && user.role !== 'STUDENT') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-center">
                Failed to load profile. Please try again later.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">View and manage your profile information</p>
          </div>
          <Link href="/student/profile/edit">
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32 border-4 border-primary/10">
                  <AvatarImage src={profile.profileImage || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                {/* Profile Visibility Badge */}
                <div className="mt-4">
                  {profile.isProfilePublic ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Public Profile
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <EyeOff className="h-3 w-3" />
                      Private Profile
                    </Badge>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600 mt-1">
                    <Mail className="h-4 w-4" />
                    <span>{profile.email}</span>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Bio</h3>
                    <p className="text-gray-600">{profile.bio}</p>
                  </div>
                )}

                {/* Academic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.school && (
                    <div className="flex items-start gap-2">
                      <School className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">School</p>
                        <p className="text-gray-600">{profile.school}</p>
                      </div>
                    </div>
                  )}

                  {profile.class && (
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Class</p>
                        <p className="text-gray-600">{profile.class}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Member Since */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Member since {format(new Date(profile.createdAt), 'MMMM yyyy')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interests Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  My Interests
                </CardTitle>
                <CardDescription>
                  Subjects you're interested in learning
                </CardDescription>
              </div>
              <Badge variant="outline">{profile.interests.length} selected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {profile.interests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't selected any interests yet</p>
                <Link href="/student/profile/edit">
                  <Button variant="outline">Add Interests</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Group interests by category */}
                {Object.entries(
                  profile.interests.reduce((acc, interest) => {
                    if (!acc[interest.categoryName]) {
                      acc[interest.categoryName] = {
                        icon: interest.categoryIcon,
                        interests: []
                      };
                    }
                    acc[interest.categoryName].interests.push(interest.subcategoryName);
                    return acc;
                  }, {} as Record<string, { icon?: string; interests: string[] }>)
                ).map(([categoryName, { icon, interests }]) => (
                  <div key={categoryName}>
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      {icon && <span className="text-xl">{icon}</span>}
                      {categoryName}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Email Verification</p>
                <p className="text-sm text-gray-600">
                  {profile.isVerified ? 'Your email is verified' : 'Verify your email to unlock all features'}
                </p>
              </div>
              {profile.isVerified ? (
                <Badge className="bg-green-500">Verified</Badge>
              ) : (
                <Link href="/verify-email-prompt">
                  <Button size="sm" variant="outline">Verify Now</Button>
                </Link>
              )}
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Profile Visibility</p>
                <p className="text-sm text-gray-600">
                  {profile.isProfilePublic 
                    ? 'Teachers can view your profile' 
                    : 'Your profile is hidden from teachers'}
                </p>
              </div>
              <Link href="/student/profile/edit">
                <Button size="sm" variant="outline">Change</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}