// src/app/(dashboard)/student/posts/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Heart, 
  Eye, 
  Calendar, 
  Star,
  User,
  Loader2,
  Share2
} from 'lucide-react';
import { getPostById, toggleLike } from '@/lib/api/posts';
import { Post } from '@/types';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
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
      console.error('Fetch post error:', error);
      toast.error(error?.message || 'Failed to load post');
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
      
      setPost(prev => prev ? {
        ...prev,
        hasLiked: response.data?.liked ?? !prev.hasLiked,
        likesCount: response.data?.liked 
          ? (prev.likesCount || 0) + 1 
          : Math.max((prev.likesCount || 0) - 1, 0),
      } : null);

      toast.success(response.data?.liked ? 'Post liked!' : 'Post unliked');
    } catch (error: any) {
      console.error('Like error:', error);
      toast.error(error?.message || 'Failed to update like');
    } finally {
      setLikingPost(false);
    }
  };

  const handleTeacherClick = () => {
    if (post?.teacher?.id) {
      router.push(`/student/teachers/${post.teacher.id}`);
    }
  };

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.content.substring(0, 100) + '...',
        url: window.location.href,
      }).catch(() => {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
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
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Post not found</p>
            <Button 
              onClick={() => router.push('/student/discover')}
              className="mt-4"
            >
              Back to Discover
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        {/* Post Card */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Teacher Info */}
            <div 
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handleTeacherClick}
            >
              {post.teacher?.profileImage ? (
                <img
                  src={post.teacher.profileImage}
                  alt={`${post.teacher?.firstName} ${post.teacher?.lastName}`}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {post.teacher?.title && `${post.teacher.title} `}
                    {post.teacher?.firstName} {post.teacher?.lastName}
                  </h3>
                  {post.teacher?.averageRating && post.teacher.averageRating > 0 && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        {post.teacher.averageRating.toFixed(1)}
                      </span>
                      {post.teacher.totalRatings && (
                        <span className="text-xs text-gray-500">
                          ({post.teacher.totalRatings})
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {post.teacher?.headline && (
                  <p className="text-sm text-gray-600 mb-2">{post.teacher.headline}</p>
                )}
                {post.teacher?.teacherExpertise?.subcategory && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                      {post.teacher.teacherExpertise.subcategory.category?.name}
                    </span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {post.teacher.teacherExpertise.subcategory.name}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {post.teacher?.totalStudents && (
                    <span>{post.teacher.totalStudents} students</span>
                  )}
                  {post.teacher?.yearsOfExperience && (
                    <>
                      <span>•</span>
                      <span>{post.teacher.yearsOfExperience} years experience</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Post Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
              </div>
            </div>

            {/* Post Content */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
              <p className="text-gray-700 text-lg whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Post Image */}
            {post.imageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Engagement Stats */}
            <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleLike}
                disabled={likingPost}
                className={`flex items-center gap-2 transition-colors ${
                  post.hasLiked
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                {likingPost ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Heart
                    className={`w-6 h-6 ${post.hasLiked ? 'fill-current' : ''}`}
                  />
                )}
                <span className="text-base font-medium">{post.likesCount || 0}</span>
              </button>

              <div className="flex items-center gap-2 text-gray-500">
                <Eye className="w-6 h-6" />
                <span className="text-base font-medium">{post.viewsCount || 0} views</span>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors ml-auto"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>

            {/* Teacher CTA */}
            <div className="pt-6 border-t border-gray-200">
              <Button
                onClick={handleTeacherClick}
                className="w-full"
                size="lg"
              >
                View Teacher Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}