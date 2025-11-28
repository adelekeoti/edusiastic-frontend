// src/app/(dashboard)/student/teachers/[id]/page.tsx

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
  MapPin, 
  Users, 
  Award,
  Briefcase,
  GraduationCap,
  Languages,
  CheckCircle2,
  Mail,
  BookOpen,
  Loader2,
  Calendar,
  Building2,
  Trophy,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { getTeacherById } from '@/lib/api/teachers';
import { User } from '@/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function TeacherProfilePage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.id as string;

  const [teacher, setTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'products' | 'reviews'>('about');

  useEffect(() => {
    if (teacherId) {
      fetchTeacher();
    }
  }, [teacherId]);

  const fetchTeacher = async () => {
    try {
      setLoading(true);
      const response = await getTeacherById(teacherId);
      setTeacher(response.data?.teacher || null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch teacher profile');
      router.push('/student/teachers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!teacher) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Teacher Not Found</h2>
              <p className="text-gray-600 mb-6">
                The teacher profile you're looking for doesn't exist.
              </p>
              <Link href="/student/teachers">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Teachers
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const stats = teacher.stats || {};
  const products = teacher.products || [];
  const ratings = teacher.ratings || [];
  const workExperiences = teacher.workExperiences || [];
  const education = teacher.education || [];
  const certifications = teacher.certifications || [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Header */}
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <img
                src={teacher.profileImage || '/default-avatar.png'}
                alt={`${teacher.firstName} ${teacher.lastName}`}
                className="w-32 h-32 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-3xl font-bold">
                        {teacher.title && `${teacher.title} `}
                        {teacher.firstName} {teacher.lastName}
                      </h1>
                      {teacher.isVerified && (
                        <Badge className="bg-blue-600">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    {teacher.headline && (
                      <p className="text-lg text-gray-600 mb-3">{teacher.headline}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      {teacher.averageRating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-yellow-500 fill-current" />
                          <span className="font-semibold">{teacher.averageRating.toFixed(1)}</span>
                          <span className="text-gray-500">({teacher.totalRatings} reviews)</span>
                        </div>
                      )}
                      {teacher.totalStudents && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{teacher.totalStudents} students</span>
                        </div>
                      )}
                      {teacher.yearsOfExperience && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Award className="w-4 h-4" />
                          <span>{teacher.yearsOfExperience} years experience</span>
                        </div>
                      )}
                    </div>

                    {teacher.specializations && teacher.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {teacher.specializations.map((spec: string, idx: number) => (
                          <Badge key={idx} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button>
                      <Mail className="mr-2 h-4 w-4" />
                      Contact
                    </Button>
                    <Button variant="outline">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold">{stats.totalProducts || 0}</p>
              <p className="text-sm text-gray-600">Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold">{teacher.totalStudents || 0}</p>
              <p className="text-sm text-gray-600">Students</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">{teacher.averageRating?.toFixed(1) || '0.0'}</p>
              <p className="text-sm text-gray-600">Rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold">{teacher.totalRatings || 0}</p>
              <p className="text-sm text-gray-600">Reviews</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'about' as const, label: 'About' },
                { id: 'products' as const, label: 'Products' },
                { id: 'reviews' as const, label: 'Reviews' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Bio */}
                {teacher.bio && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">About Me</h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {teacher.bio}
                    </p>
                  </div>
                )}

                {/* Current Work */}
                {teacher.isCurrentlyWorking && teacher.currentWorkplace && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Current Position
                    </h3>
                    <Card>
                      <CardContent className="p-4">
                        <p className="font-semibold">{teacher.currentPosition}</p>
                        <p className="text-gray-600">{teacher.currentWorkplace}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Work Experience */}
                {workExperiences.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Work Experience
                    </h3>
                    <div className="space-y-4">
                      {workExperiences.map((exp: any) => (
                        <Card key={exp.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{exp.position}</p>
                                <p className="text-gray-600">{exp.institution}</p>
                                {exp.description && (
                                  <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                                )}
                              </div>
                              <Badge variant={exp.isCurrent ? 'default' : 'outline'}>
                                {exp.isCurrent ? 'Current' : new Date(exp.endDate).getFullYear()}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      Education
                    </h3>
                    <div className="space-y-4">
                      {education.map((edu: any) => (
                        <Card key={edu.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</p>
                                <p className="text-gray-600">{edu.institution}</p>
                                {edu.description && (
                                  <p className="text-sm text-gray-600 mt-2">{edu.description}</p>
                                )}
                              </div>
                              <Badge>{edu.graduationYear}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Certifications
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {certifications.map((cert: any) => (
                        <Card key={cert.id}>
                          <CardContent className="p-4">
                            <p className="font-semibold">{cert.name}</p>
                            <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Issued {new Date(cert.issueDate).getFullYear()}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements */}
                {teacher.achievements && teacher.achievements.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Achievements
                    </h3>
                    <ul className="space-y-2">
                      {teacher.achievements.map((achievement: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Languages */}
                {teacher.languagesSpoken && teacher.languagesSpoken.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Languages className="w-5 h-5" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {teacher.languagesSpoken.map((lang: string, idx: number) => (
                        <Badge key={idx} variant="outline">{lang}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teaching Philosophy */}
                {teacher.teachingPhilosophy && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Teaching Philosophy</h3>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {teacher.teachingPhilosophy}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No products available yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product: any) => (
                      <Link key={product.id} href={`/student/products/${product.id}`}>
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                          <CardContent className="p-4">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0].imageUrl}
                                alt={product.title}
                                className="w-full h-40 object-cover rounded-lg mb-3"
                              />
                            )}
                            <Badge variant="secondary" className="mb-2">
                              {product.type.replace('_', ' ')}
                            </Badge>
                            <h4 className="font-semibold mb-2 line-clamp-2">{product.title}</h4>
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {product.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold text-blue-600">
                                ₦{product.price.toLocaleString()}
                              </p>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Users className="w-4 h-4" />
                                <span>{product.salesCount}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {ratings.length === 0 ? (
                  <div className="text-center py-12">
                    <Star className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No reviews yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ratings.map((rating: any) => (
                      <Card key={rating.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <img
                              src={rating.student?.profileImage || '/default-avatar.png'}
                              alt={`${rating.student?.firstName} ${rating.student?.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-semibold">
                                    {rating.student?.firstName} {rating.student?.lastName}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${
                                          i < rating.overallRating
                                            ? 'text-yellow-500 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatDistanceToNow(new Date(rating.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              {rating.review && (
                                <p className="text-gray-700">{rating.review}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}