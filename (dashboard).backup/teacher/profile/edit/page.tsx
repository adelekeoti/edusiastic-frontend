// src/app/(dashboard)/teacher/profile/edit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getProfilePreview, TeacherProfile } from '@/lib/api/profile';
import { toast } from 'sonner';

// Import tab components
import BasicInfoTab from '@/components/profile/tabs/BasicInfoTab';
import HeadlineTab from '@/components/profile/tabs/HeadlineTab';
import WorkExperienceTab from '@/components/profile/tabs/WorkExperienceTab';
import EducationTab from '@/components/profile/tabs/EducationTab';
import CertificationsTab from '@/components/profile/tabs/CertificationsTab';
import CurrentWorkTab from '@/components/profile/tabs/CurrentWorkTab';
import AchievementsTab from '@/components/profile/tabs/AchievementsTab';
import TeachingPhilosophyTab from '@/components/profile/tabs/TeachingPhilosophyTab';
// ✅ New import
import ExpertiseTab from '@/components/profile/tabs/ExpertiseTab';

export default function ProfileEditPage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfilePreview();

      if (!response.data) {
        throw new Error('No profile data received from server');
      }
      setProfile(response.data.profile);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    loadProfile(); // Reload profile after any update
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/teacher/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-1">Update your professional information</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* ✅ Updated TabsList to include Expertise */}
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-9 mb-6">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="headline">Headline</TabsTrigger>
                <TabsTrigger value="expertise">Expertise</TabsTrigger>
                <TabsTrigger value="current-work">Current Work</TabsTrigger>
                <TabsTrigger value="work-experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="certifications">Certs</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <BasicInfoTab profile={profile} onUpdate={handleProfileUpdate} />
              </TabsContent>

              <TabsContent value="headline" className="space-y-4">
                <HeadlineTab profile={profile} onUpdate={handleProfileUpdate} />
              </TabsContent>

              {/* ✅ New Expertise tab */}
              <TabsContent value="expertise" className="space-y-4">
                <ExpertiseTab profile={profile} onUpdate={handleProfileUpdate} />
              </TabsContent>

              <TabsContent value="current-work" className="space-y-4">
                <CurrentWorkTab profile={profile} onUpdate={handleProfileUpdate} />
              </TabsContent>

              <TabsContent value="work-experience" className="space-y-4">
                <WorkExperienceTab profile={profile} onUpdate={handleProfileUpdate} />
              </TabsContent>

              <TabsContent value="education" className="space-y-4">
                <EducationTab profile={profile} onUpdate={handleProfileUpdate} />
              </TabsContent>

              <TabsContent value="certifications" className="space-y-4">
                <CertificationsTab profile={profile} onUpdate={handleProfileUpdate} />
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <AchievementsTab profile={profile} onUpdate={handleProfileUpdate} />
              </TabsContent>

              <TabsContent value="philosophy" className="space-y-4">
                <TeachingPhilosophyTab profile={profile} onUpdate={handleProfileUpdate} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
