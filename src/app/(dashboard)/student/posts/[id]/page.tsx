// src/app/(dashboard)/student/posts/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Eye, 
  Calendar, 
  ArrowLeft, 
  Star, 
  Loader2,
  Mail,
  Users,
  BookOpen,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import { getPostById, toggleLike } from '@/lib/api/postApi';
import { Post } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [likingPost, setLikingPost] = useState(false);

  useEffect(() => {
    if (postId) {
      fetchPost();
    }
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await getPostById(postId);
      setPost(response.data?.post || null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch post');
      router.push('/student/discover');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      setLikingPost(true);
      const response = await toggleLike(post.id);

      // Update post state
      setPost(prev => prev ? {
        ...prev,
        hasLiked: response.data?.liked ?? !prev.hasLiked,
        likesCount: response.data?.liked 
          ? prev.likesCount + 1 
          : prev.likesCount - 1,
      } : null);

      toast.success(response.data?.liked ? 'Post liked!' : 'Post unliked');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update like');
    } finally {
      setLikingPost(false);
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

  if (!post) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h2>
              <p className="text-gray-600 mb-6">
                The post you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/student/discover">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Discover
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const teacher = post.teacher;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Card */}
            <Card>
              <CardContent className="p-6">
                {/* Post Header */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.viewsCount} views
                    </span>
                  </div>
                </div>

                {/* Post Image */}
                {post.imageUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-auto max-h-[500px] object-cover"
                    />
                  </div>
                )}

                {/* Post Content */}
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-6"></div>

                {/* Like Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleLike}
                      disabled={likingPost}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                        post.hasLiked
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {likingPost ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Heart
                          className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`}
                        />
                      )}
                      <span>{post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">
                    <Eye className="w-5 h-5" />
                    <span className="text-sm">{post.viewsCount} views</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Teacher Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">About the Teacher</h3>

                {/* Teacher Profile */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={teacher?.profileImage || '/default-avatar.png'}
                      alt={`${teacher?.firstName} ${teacher?.lastName}`}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {teacher?.title && `${teacher.title} `}
                        {teacher?.firstName} {teacher?.lastName}
                      </h4>
                      {teacher?.headline && (
                        <p className="text-sm text-gray-600">{teacher.headline}</p>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  {teacher?.averageRating && teacher.averageRating > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 rounded-lg p-3">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {teacher.averageRating.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {teacher.totalRatings} {teacher.totalRatings === 1 ? 'rating' : 'ratings'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="space-y-2">
                    {teacher?.totalStudents && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{teacher.totalStudents} students</span>
                      </div>
                    )}
                    {teacher?.yearsOfExperience && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award className="w-4 h-4" />
                        <span className="text-sm">{teacher.yearsOfExperience} years experience</span>
                      </div>
                    )}
                    {teacher?.teacherExpertise?.subcategory && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm">
                          {teacher.teacherExpertise.subcategory.category?.name} - {teacher.teacherExpertise.subcategory.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {teacher?.bio && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Bio</h5>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {teacher.bio}
                      </p>
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="space-y-2 pt-4">
                    <Link href={`/teacher/${teacher?.id}`}>
                      <Button variant="default" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full">
                      <Mail className="mr-2 h-4 w-4" />
                      Contact Teacher
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}