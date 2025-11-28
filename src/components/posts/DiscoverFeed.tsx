// src/components/posts/DiscoverFeed.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Eye, Loader2, MessageCircle, Star, Calendar, BookOpen, User } from 'lucide-react';
import { toast } from 'sonner';
import { getDiscoverFeed, toggleLike } from '@/lib/api/posts';
import { Post } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface DiscoverFeedProps {
  onPostClick?: (post: Post) => void;
}

export default function DiscoverFeed({ onPostClick }: DiscoverFeedProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likingPost, setLikingPost] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchFeed = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getDiscoverFeed({ page, limit: 10 });
      
      // Handle response structure
      const postsData = response.data?.posts || [];
      const paginationData = response.data?.pagination;
      
      setPosts(postsData);
      if (paginationData) {
        setPagination({
          page: paginationData.page,
          limit: paginationData.limit,
          total: paginationData.total,
          totalPages: paginationData.totalPages,
        });
      }
    } catch (error: any) {
      console.error('Fetch feed error:', error);
      toast.error(error?.message || 'Failed to fetch discover feed');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(1);
  }, []);

  const handleLike = async (postId: string, currentlyLiked: boolean) => {
    try {
      setLikingPost(postId);
      
      const response = await toggleLike(postId);
      
      // Update post in state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                hasLiked: response.data?.liked ?? !currentlyLiked,
                likesCount: response.data?.liked 
                  ? (post.likesCount || 0) + 1 
                  : Math.max((post.likesCount || 0) - 1, 0),
              }
            : post
        )
      );

      toast.success(response.data?.liked ? 'Post liked!' : 'Post unliked');
    } catch (error: any) {
      console.error('Like error:', error);
      toast.error(error?.message || 'Failed to update like');
    } finally {
      setLikingPost(null);
    }
  };

  const handleTeacherClick = (teacherId: string) => {
    router.push(`/student/teachers/${teacherId}`);
  };

  const handlePageChange = (newPage: number) => {
    fetchFeed(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts available</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any posts matching your interests yet.
          </p>
          <p className="text-sm text-gray-500">
            Try updating your interests in your profile to see relevant content from teachers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover</h2>
        <p className="text-gray-600">
          Posts from teachers in your areas of interest
        </p>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Teacher Info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <div 
                  className="cursor-pointer"
                  onClick={() => post.teacher?.id && handleTeacherClick(post.teacher.id)}
                >
                  {post.teacher?.profileImage ? (
                    <img
                      src={post.teacher.profileImage}
                      alt={`${post.teacher?.firstName} ${post.teacher?.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
                    onClick={() => post.teacher?.id && handleTeacherClick(post.teacher.id)}
                  >
                    <h4 className="font-semibold text-gray-900">
                      {post.teacher?.title && `${post.teacher.title} `}
                      {post.teacher?.firstName} {post.teacher?.lastName}
                    </h4>
                    {post.teacher?.averageRating && post.teacher.averageRating > 0 && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">
                          {post.teacher.averageRating.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  {post.teacher?.headline && (
                    <p className="text-sm text-gray-600 truncate">{post.teacher.headline}</p>
                  )}
                  {post.teacher?.teacherExpertise?.subcategory && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {post.teacher.teacherExpertise.subcategory.category?.name}
                      </span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {post.teacher.teacherExpertise.subcategory.name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    {post.teacher?.totalStudents && (
                      <span>{post.teacher.totalStudents} students</span>
                    )}
                    {post.teacher?.yearsOfExperience && (
                      <>
                        <span>•</span>
                        <span>{post.teacher.yearsOfExperience} years exp.</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            {/* Post Content */}
            <div 
              className="p-6 cursor-pointer"
              onClick={() => onPostClick?.(post)}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{post.title}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>

              {/* Post Image */}
              {post.imageUrl && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-auto max-h-96 object-cover"
                  />
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="px-6 pb-4 flex items-center gap-6">
              <button
                onClick={() => handleLike(post.id, post.hasLiked || false)}
                disabled={likingPost === post.id}
                className={`flex items-center gap-2 transition-colors ${
                  post.hasLiked
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-500 hover:text-red-500'
                }`}
              >
                {likingPost === post.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart
                    className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`}
                  />
                )}
                <span className="text-sm font-medium">{post.likesCount || 0}</span>
              </button>

              <div className="flex items-center gap-2 text-gray-500">
                <Eye className="w-5 h-5" />
                <span className="text-sm font-medium">{post.viewsCount || 0}</span>
              </div>

              <button
                onClick={() => onPostClick?.(post)}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors ml-auto"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">View Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} posts
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}