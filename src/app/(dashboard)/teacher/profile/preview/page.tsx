// src/app/(dashboard)/teacher/profile/preview/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Briefcase, GraduationCap, Award, Globe, MessageSquare, Star } from 'lucide-react';
import Link from 'next/link';
import { getProfilePreview } from '@/lib/api/profile';
import { TeacherProfile } from '@/lib/api/profile';
import { toast } from 'sonner';

export default function ProfilePreviewPage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfilePreview();
      if (!response.data) {
      throw new Error('No data received from server');
    }
      setProfile(response.data.profile);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div></DashboardLayout>;
  if (!profile) return <DashboardLayout><div className="text-center py-12">Failed to load profile</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/teacher/profile"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
            <div><h1 className="text-3xl font-bold">Profile Preview</h1><p className="text-gray-600 mt-1">How students will see your profile</p></div>
          </div>
          <Link href="/teacher/profile/edit"><Button>Edit Profile</Button></Link>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <img src={profile.profileImage || '/default-avatar.png'} alt={`${profile.firstName} ${profile.lastName}`} className="w-32 h-32 rounded-full object-cover border-4 border-gray-100" />
                {profile.isVerified && profile.verificationBadge && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2"><Badge className="bg-blue-600 text-white">{profile.verificationBadge.icon} Verified</Badge></div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{profile.title} {profile.firstName} {profile.lastName}</h2>
                {profile.headline && <p className="text-gray-600 mt-1">{profile.headline}</p>}
                {profile.specializations && profile.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">{profile.specializations.map((spec, idx) => <Badge key={idx} variant="secondary">{spec}</Badge>)}</div>
                )}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
                  <div><div className="flex items-center gap-2 text-gray-600 mb-1"><Star className="h-4 w-4" /><span className="text-sm">Rating</span></div><p className="text-2xl font-bold">{profile.averageRating?.toFixed(1) || '0.0'}</p></div>
                  <div><p className="text-sm text-gray-600 mb-1">Students</p><p className="text-2xl font-bold">{profile.totalStudents || 0}</p></div>
                  <div><p className="text-sm text-gray-600 mb-1">Experience</p><p className="text-2xl font-bold">{profile.yearsOfExperience || 0}y</p></div>
                  <div><p className="text-sm text-gray-600 mb-1">Complete</p><p className="text-2xl font-bold">{profile.profileCompletenessScore}%</p></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio & Philosophy */}
        {(profile.bio || profile.teachingPhilosophy) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {profile.bio && <Card><CardContent className="pt-6"><h3 className="font-semibold mb-2 flex items-center gap-2"><MessageSquare className="h-5 w-5" />About Me</h3><p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p></CardContent></Card>}
            {profile.teachingPhilosophy && <Card><CardContent className="pt-6"><h3 className="font-semibold mb-2 flex items-center gap-2"><GraduationCap className="h-5 w-5" />Teaching Philosophy</h3><p className="text-gray-700 whitespace-pre-wrap">{profile.teachingPhilosophy}</p></CardContent></Card>}
          </div>
        )}

        {/* Work Experience */}
        {profile.workExperiences && profile.workExperiences.length > 0 && (
          <Card><CardContent className="pt-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Briefcase className="h-5 w-5" />Work Experience</h3><div className="space-y-4">{profile.workExperiences.map(exp => <div key={exp.id} className="pb-4 border-b last:border-0"><div className="flex items-start justify-between"><div><h4 className="font-semibold">{exp.position}</h4><p className="text-gray-600">{exp.institution}</p><p className="text-sm text-gray-500 mt-1">{new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}</p>{exp.description && <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>}</div>{exp.isCurrent && <Badge>Current</Badge>}</div></div>)}</div></CardContent></Card>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <Card><CardContent className="pt-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><GraduationCap className="h-5 w-5" />Education</h3><div className="space-y-4">{profile.education.map(edu => <div key={edu.id} className="pb-4 border-b last:border-0"><div className="flex items-start justify-between"><div><h4 className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</h4><p className="text-gray-600">{edu.institution}</p><p className="text-sm text-gray-500 mt-1">Graduated {edu.graduationYear}</p></div>{edu.isFeatured && <Badge variant="secondary">Featured</Badge>}</div></div>)}</div></CardContent></Card>
        )}

        {/* Certifications */}
        {profile.profileCertifications && profile.profileCertifications.length > 0 && (
          <Card><CardContent className="pt-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Award className="h-5 w-5" />Certifications</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{profile.profileCertifications.map(cert => <div key={cert.id} className="p-4 bg-gray-50 rounded-lg"><h4 className="font-semibold">{cert.name}</h4><p className="text-sm text-gray-600">{cert.issuingOrganization}</p><p className="text-xs text-gray-500 mt-1">Issued {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p></div>)}</div></CardContent></Card>
        )}

        {/* Achievements & Languages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {profile.achievements && profile.achievements.length > 0 && (
            <Card><CardContent className="pt-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Award className="h-5 w-5" />Achievements</h3><ul className="space-y-2">{profile.achievements.map((ach, idx) => <li key={idx} className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" /><span className="text-gray-700">{ach}</span></li>)}</ul></CardContent></Card>
          )}
          {profile.languagesSpoken && profile.languagesSpoken.length > 0 && (
            <Card><CardContent className="pt-6"><h3 className="font-semibold mb-4 flex items-center gap-2"><Globe className="h-5 w-5" />Languages</h3><div className="flex flex-wrap gap-2">{profile.languagesSpoken.map((lang, idx) => <Badge key={idx} variant="outline">{lang}</Badge>)}</div></CardContent></Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}