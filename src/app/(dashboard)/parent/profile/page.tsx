// src/app/(dashboard)/parent/profile/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { getParentProfile, ParentProfile } from '@/lib/api/parentProfile';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { 
  Mail, 
  Edit, 
  Eye, 
  EyeOff,
  Calendar,
  Sparkles,
  Users,
  GraduationCap,
  Laptop,
  Home as HomeIcon,
  Globe
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default function ParentProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['parent-profile'],
    queryFn: getParentProfile,
    enabled: !!user && user.role === 'PARENT'
  });

  const profile = data?.data?.profile;

  useEffect(() => {
    if (user && user.role !== 'PARENT') {
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

  const getLearningPreferenceIcon = (preference?: string) => {
    switch (preference) {
      case 'ONLINE':
        return <Laptop className="h-4 w-4" />;
      case 'PHYSICAL':
        return <HomeIcon className="h-4 w-4" />;
      case 'BOTH':
        return <Globe className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getLearningPreferenceLabel = (preference?: string) => {
    switch (preference) {
      case 'ONLINE':
        return 'Online Learning';
      case 'PHYSICAL':
        return 'Physical Classes';
      case 'BOTH':
        return 'Both Online & Physical';
      default:
        return 'Not Set';
    }
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
          <Link href="/parent/profile/edit">
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

                {/* Learning Preference */}
                {profile.learningPreference && (
                  <div className="flex items-center gap-2">
                    {getLearningPreferenceIcon(profile.learningPreference)}
                    <div>
                      <p className="text-sm font-medium text-gray-700">Learning Preference</p>
                      <p className="text-gray-600">{getLearningPreferenceLabel(profile.learningPreference)}</p>
                    </div>
                  </div>
                )}

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

        {/* Children Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  My Children
                </CardTitle>
                <CardDescription>
                  Manage your children's information
                </CardDescription>
              </div>
              <Badge variant="outline">{profile.children.length} {profile.children.length === 1 ? 'child' : 'children'}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {profile.children.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't added any children yet</p>
                <Link href="/parent/profile/edit">
                  <Button variant="outline">Add Child</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {child.linkedStudent ? (
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={child.linkedStudent.profileImage || undefined} />
                          <AvatarFallback>
                            {child.linkedStudent.firstName.charAt(0)}
                            {child.linkedStudent.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{child.name}</p>
                        <p className="text-sm text-gray-600">Class: {child.class}</p>
                        {child.linkedStudent && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            Linked Account
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interests Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Subject Interests
                </CardTitle>
                <CardDescription>
                  Subjects you're interested in for your children
                </CardDescription>
              </div>
              <Badge variant="outline">{profile.interests.length} selected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {profile.interests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't selected any interests yet</p>
                <Link href="/parent/profile/edit">
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
                    ? 'Your profile is visible to teachers' 
                    : 'Your profile is hidden from teachers'}
                </p>
              </div>
              <Link href="/parent/profile/edit">
                <Button size="sm" variant="outline">Change</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}