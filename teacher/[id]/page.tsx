// src/app/teacher/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Star,
  Users,
  Award,
  Briefcase,
  GraduationCap,
  Globe,
  MessageSquare,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { getTeacherProfile as getTeacherProfileFromProfile } from '@/lib/api/profile';
import { User, Product } from '@/types';
import { toast } from 'sonner';
import { getAllProducts } from '@/lib/api/products';
import { formatCurrency, formatProductType } from '@/lib/utils/formatters';

interface TeacherProfileData {
  teacher: User & {
    workExperiences?: Array<{
      id: string;
      position: string;
      institution: string;
      startDate: string;
      endDate?: string;
      isCurrent: boolean;
      description?: string;
    }>;
    education?: Array<{
      id: string;
      degree: string;
      fieldOfStudy: string;
      institution: string;
      graduationYear: number;
      isFeatured: boolean;
      description?: string;
    }>;
    profileCertifications?: Array<{
      id: string;
      name: string;
      issuingOrganization: string;
      issueDate: string;
      credentialUrl?: string;
    }>;
    verificationBadge?: {
      status: string;
      icon: string;
      text: string;
    };
  };
}

export default function PublicTeacherProfilePage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  const [profileData, setProfileData] = useState<TeacherProfileData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacherId) {
      fetchTeacherProfile();
      fetchTeacherProducts();
    }
  }, [teacherId]);

  const fetchTeacherProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching teacher profile for ID:', teacherId);
      
      const response = await getTeacherProfileFromProfile(teacherId);
      
      console.log('API Response:', response);
      
      if (!response.data || !response.data.teacher) {
        throw new Error('No teacher data received');
      }
      
      setProfileData({ teacher: response.data.teacher });
    } catch (error: any) {
      console.error('Error fetching teacher profile:', error);
      setError(error?.message || 'Failed to fetch teacher profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherProducts = async () => {
    try {
      setLoadingProducts(true);
      
      console.log('Fetching products for teacher ID:', teacherId);
      
      const response = await getAllProducts({
        teacherId: teacherId,
        page: 1,
        limit: 20
      });
      
      console.log('Products Response:', response);
      
      if (response.data && response.data.products) {
        const approvedProducts = response.data.products.filter(
          (product: Product) => product.isApproved && product.isActive
        );
        setProducts(approvedProducts);
      }
    } catch (error: any) {
      console.error('Error fetching teacher products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading teacher profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !profileData || !profileData.teacher) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {error?.includes('404') ? 'Teacher Not Found' : 'Unable to Load Profile'}
            </h2>
            <p className="text-gray-600 mb-2">
              {error || "The teacher profile you're looking for doesn't exist or hasn't been set up yet."}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Teacher ID: {teacherId}
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.back()} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
              <Link href="/student/discover">
                <Button>
                  Explore Other Teachers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const teacher = profileData.teacher;

  return (
    <DashboardLayout>
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="pl-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Main Content with 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN COLUMN - Profile Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <div className="relative flex-shrink-0">
                  <img
                    src={teacher.profileImage || '/default-avatar.png'}
                    alt={`${teacher.firstName} ${teacher.lastName}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                  />
                  {teacher.isVerified && teacher.verificationBadge && (
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">
                        {teacher.verificationBadge.icon} Verified
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {teacher.title && `${teacher.title} `}
                    {teacher.firstName} {teacher.lastName}
                  </h1>
                  {teacher.headline && (
                    <p className="text-lg text-gray-600 mt-2">{teacher.headline}</p>
                  )}
                  {teacher.specializations && teacher.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {teacher.specializations.map((spec, idx) => (
                        <Badge key={idx} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">Rating</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {teacher.averageRating?.toFixed(1) || '0.0'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {teacher.totalRatings || 0} reviews
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">Students</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {teacher.totalStudents || 0}
                      </p>
                      <p className="text-xs text-gray-500">Total taught</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm">Experience</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {teacher.yearsOfExperience || 0}
                      </p>
                      <p className="text-xs text-gray-500">Years</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio */}
          {teacher.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {teacher.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Teaching Philosophy */}
          {teacher.teachingPhilosophy && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Teaching Philosophy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {teacher.teachingPhilosophy}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Work Experience */}
          {teacher.workExperiences && teacher.workExperiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teacher.workExperiences.map((exp) => (
                    <div key={exp.id} className="pb-4 border-b last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                          <p className="text-gray-600">{exp.institution}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            {' - '}
                            {exp.endDate 
                              ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                              : 'Present'
                            }
                          </p>
                          {exp.description && (
                            <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                          )}
                        </div>
                        {exp.isCurrent && <Badge>Current</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {teacher.education && teacher.education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teacher.education.map((edu) => (
                    <div key={edu.id} className="pb-4 border-b last:border-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {edu.degree} in {edu.fieldOfStudy}
                          </h4>
                          <p className="text-gray-600">{edu.institution}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Graduated {edu.graduationYear}
                          </p>
                          {edu.description && (
                            <p className="text-gray-700 mt-2 text-sm">{edu.description}</p>
                          )}
                        </div>
                        {edu.isFeatured && <Badge variant="secondary">Featured</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {teacher.profileCertifications && teacher.profileCertifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {teacher.profileCertifications.map((cert) => (
                    <div key={cert.id} className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Issued {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                      {cert.credentialUrl && (
                        <a 
                          href={cert.credentialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                        >
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teacher.achievements && teacher.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {teacher.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {teacher.languagesSpoken && teacher.languagesSpoken.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Languages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {teacher.languagesSpoken.map((language, idx) => (
                      <Badge key={idx} variant="outline">{language}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR - Teacher's Products */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : products.length > 0 ? (
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                  {products.map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`}>
                      <div className="group p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 hover:border-blue-300 cursor-pointer">
                        <div className="flex items-start gap-3">
                          {product.images?.[0]?.imageUrl ? (
                            <img
                              src={product.images[0].imageUrl}
                              alt={product.title}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-6 w-6 text-blue-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {product.title}
                            </h4>
                            <div className="flex items-center justify-between mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {formatProductType(product.type)}
                              </Badge>
                              <span className="text-xs font-bold text-blue-600">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No products yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </DashboardLayout>
  );
}