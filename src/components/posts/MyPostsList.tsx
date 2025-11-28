// src/components/posts/MyPostsList.tsx

import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, Heart, Loader2, Calendar, Users, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { getMyPosts, deletePost, getPostStats } from '@/lib/api/postApi';
import { Post } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface MyPostsListProps {
  refreshTrigger?: number;
  onEditPost?: (post: Post) => void;
}

export default function MyPostsList({ refreshTrigger, onEditPost }: MyPostsListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    totalPublicPosts: 0,
    totalGroupPosts: 0,
    totalLikes: 0,
    totalViews: 0,
  });

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getMyPosts({ page, limit: 10 });
      
      console.log('API Response:', response);
      
      // Handle different response structures
      let postsData: Post[] = [];
      let paginationData = { page: 1, limit: 10, total: 0, totalPages: 0 };
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          postsData = response.data;
        } else if (typeof response.data === 'object' && 'posts' in response.data && Array.isArray((response.data as any).posts)) {
          postsData = (response.data as any).posts;
        }
      }
      
      // Handle pagination
      if (response.pagination) {
        paginationData = {
          page: response.pagination.page || 1,
          limit: response.pagination.limit || 10,
          total: response.pagination.total || 0,
          totalPages: response.pagination.totalPages || 0,
        };
      }
      
      console.log('Processed posts:', postsData);
      console.log('Processed pagination:', paginationData);
      
      setPosts(postsData);
      setPagination(paginationData);
    } catch (error: any) {
      console.error('Fetch posts error:', error);
      toast.error(error?.message || 'Failed to fetch posts');
      setPosts([]);
      setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // NOTE: Temporarily disabled until backend implements /posts/stats endpoint
    // This is not critical - we'll calculate stats from posts data instead
    return;
    
    /* Uncomment when backend is ready:
    try {
      const response = await getPostStats();
      if (response.success && response.data?.stats) {
        setStats({
          totalPublicPosts: response.data.stats.totalPosts || 0,
          totalGroupPosts: 0,
          totalLikes: response.data.stats.totalLikes || 0,
          totalViews: response.data.stats.totalViews || 0,
        });
      }
    } catch (error: any) {
      console.error('Fetch stats error:', error?.message || error);
    }
    */
  };

  useEffect(() => {
    fetchPosts(1);
    // fetchStats(); // Disabled until backend implements endpoint
  }, [refreshTrigger]);

  // Calculate stats from current posts data (fallback if API fails)
  useEffect(() => {
    if (Array.isArray(posts) && posts.length > 0) {
      const publicCount = posts.filter(post => !post.lessonGroupId).length;
      const groupCount = posts.filter(post => post.lessonGroupId).length;
      const totalLikes = posts.reduce((sum, post) => sum + (post.likesCount || 0), 0);
      const totalViews = posts.reduce((sum, post) => sum + (post.viewsCount || 0), 0);
      
      // Calculate stats from current page data
      setStats({
        totalPublicPosts: publicCount,
        totalGroupPosts: groupCount,
        totalLikes: totalLikes,
        totalViews: totalViews,
      });
    } else {
      // Reset stats if no posts
      setStats({
        totalPublicPosts: 0,
        totalGroupPosts: 0,
        totalLikes: 0,
        totalViews: 0,
      });
    }
  }, [posts]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(postId);
      await deletePost(postId);
      toast.success('Post deleted successfully');
      
      // Refresh posts list (stats will auto-calculate from updated posts)
      fetchPosts(pagination.page);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete post');
    } finally {
      setDeleting(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchPosts(newPage);
  };

  const currentPagePublicPosts = Array.isArray(posts) ? posts.filter(post => !post.lessonGroupId).length : 0;
  const currentPageGroupPosts = Array.isArray(posts) ? posts.filter(post => post.lessonGroupId).length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Edit2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
          <p className="text-gray-600">
            Start sharing your knowledge with students by creating your first post!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Post Analytics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.totalPublicPosts}</p>
            <p className="text-sm text-gray-600">Public (This Page)</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.totalLikes}</p>
            <p className="text-sm text-gray-600">Likes (This Page)</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.totalViews}</p>
            <p className="text-sm text-gray-600">Views (This Page)</p>
          </div>
        </div>
        
        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              {stats.totalPublicPosts} Public
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {stats.totalGroupPosts} Group
            </span>
          </div>
          <span className="text-xs text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{post.title}</h3>
                    {post.lessonGroupId ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        <Users className="w-3 h-3" />
                        Group Post
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <Globe className="w-3 h-3" />
                        Public
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEditPost?.(post)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit post"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deleting === post.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete post"
                  >
                    {deleting === post.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

              {/* Post Image */}
              {post.imageUrl && (
                <div className="mb-4 rounded-lg overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Post Stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-600">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.likesCount || 0} likes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.viewsCount || 0} views</span>
                </div>
                {(post.likesCount || 0) > 0 && (post.viewsCount || 0) > 0 && (
                  <div className="ml-auto text-sm text-gray-500">
                    Engagement: {(((post.likesCount || 0) / Math.max((post.viewsCount || 0), 1)) * 100).toFixed(1)}%
                  </div>
                )}
              </div>
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