// src/app/(dashboard)/teacher/profile/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Edit,
  Share2,
  Eye,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';
import Link from 'next/link';
import { getProfilePreview } from '@/lib/api/profile';
import { TeacherProfile, ProfileCompleteness } from '@/lib/api/profile';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from 'sonner';

export default function TeacherProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [completeness, setCompleteness] = useState<ProfileCompleteness | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
      setCompleteness(response.data.completeness);
      setWarnings(response.data.warnings || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load profile');
      setProfile(null);
      setCompleteness(null);
      setWarnings([]);
    } finally {
      setLoading(false);
    }
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

  if (!profile || !completeness) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  const canPublish = completeness.score >= 80;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your teaching profile</p>
          </div>
          <div className="flex gap-3">
            <Link href="/teacher/profile/preview">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </Link>
            <Link href="/teacher/profile/edit">
              <Button>
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Completeness Card */}
        <Card className={canPublish ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {canPublish ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  )}
                  <h3 className="font-semibold text-gray-900">
                    Profile {completeness.score}% Complete
                  </h3>
                  <Badge variant={canPublish ? 'default' : 'secondary'} className="ml-2">
                    {completeness.status.status}
                  </Badge>
                </div>
                <Progress value={completeness.score} className="h-2 mb-3" />
                <p className="text-sm text-gray-600">
                  {completeness.status.message}
                </p>
                {warnings.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {!canPublish && (
                <Link href="/teacher/profile/edit">
                  <Button size="sm">Complete Now</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <img
                  src={profile.profileImage || '/default-avatar.png'}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                />
                {profile.isVerified && profile.verificationBadge && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">
                      {profile.verificationBadge.icon} Verified
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {profile.title} {profile.firstName} {profile.lastName}
                    </h2>
                    {profile.headline && (
                      <p className="text-gray-600 mt-1">{profile.headline}</p>
                    )}
                    {profile.specializations && profile.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {profile.specializations.map((spec, idx) => (
                          <Badge key={idx} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => router.push('/teacher/profile/share')}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Star className="h-4 w-4" />
                      <span className="text-sm">Rating</span>
                    </div>
                    <p className="text-2xl font-bold">{profile.averageRating?.toFixed(1) || '0.0'}</p>
                    <p className="text-xs text-gray-500">{profile.totalRatings || 0} reviews</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Students</span>
                    </div>
                    <p className="text-2xl font-bold">{profile.totalStudents || 0}</p>
                    <p className="text-xs text-gray-500">Total enrolled</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Briefcase className="h-4 w-4" />
                      <span className="text-sm">Experience</span>
                    </div>
                    <p className="text-2xl font-bold">{profile.yearsOfExperience || 0}</p>
                    <p className="text-xs text-gray-500">Years</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Profile</span>
                    </div>
                    <p className="text-2xl font-bold">{completeness.score}%</p>
                    <p className="text-xs text-gray-500">Complete</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio & Philosophy */}
        {(profile.bio || profile.teachingPhilosophy) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {profile.bio && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    About Me
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
                </CardContent>
              </Card>
            )}
            
            {profile.teachingPhilosophy && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Teaching Philosophy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{profile.teachingPhilosophy}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Work Experience */}
        {profile.workExperiences && profile.workExperiences.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.workExperiences.map((exp) => (
                  <div key={exp.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                          <p className="text-gray-600">{exp.institution}</p>
                        </div>
                        {exp.isCurrent && <Badge>Current</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' - '}
                        {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 mt-2">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {profile.education && profile.education.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.education.map((edu) => (
                  <div key={edu.id} className="flex gap-4 pb-4 border-b last:border-0">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {edu.degree} in {edu.fieldOfStudy}
                          </h4>
                          <p className="text-gray-600">{edu.institution}</p>
                        </div>
                        {edu.isFeatured && <Badge variant="secondary">Featured</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Graduated {edu.graduationYear}</p>
                      {edu.description && (
                        <p className="text-gray-700 mt-2">{edu.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Certifications */}
        {profile.profileCertifications && profile.profileCertifications.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.profileCertifications.map((cert) => (
                  <div key={cert.id} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                    <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Issued {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                    {cert.credentialUrl && (
                      <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">
                        View Credential →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements & Languages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {profile.achievements && profile.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {profile.achievements.map((achievement, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {profile.languagesSpoken && profile.languagesSpoken.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.languagesSpoken.map((language, idx) => (
                    <Badge key={idx} variant="outline">{language}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}