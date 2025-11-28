// src/app/(dashboard)/teacher/posts/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import CreatePostForm from '@/components/posts/CreatePostForm';
import MyPostsList from '@/components/posts/MyPostsList';
import EditPostModal from '@/components/posts/EditPostModal';
import { Post, LessonGroup } from '@/types';
import { getAllGroups } from '@/lib/api/groups';
import { toast } from 'sonner';
import { FileText, BarChart3, PlusCircle } from 'lucide-react';

type TabType = 'create' | 'my-posts' | 'analytics';

export default function TeacherPostsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('my-posts');
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [lessonGroups, setLessonGroups] = useState<LessonGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);

  // Fetch teacher's lesson groups for posting
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoadingGroups(true);
        const response = await getAllGroups({ groupType: 'LESSON' });
        setLessonGroups(response.data?.groups || []);
      } catch (error: any) {
        console.error('Failed to fetch lesson groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    };

    if (user?.role === 'TEACHER') {
      fetchGroups();
    }
  }, [user]);

  // Redirect if not teacher
  useEffect(() => {
    if (user && user.role !== 'TEACHER') {
      toast.error('Access denied. Teachers only.');
      router.push('/dashboard');
    }
  }, [user, router]);

  const tabs = [
    { id: 'my-posts' as TabType, label: 'My Posts', icon: FileText },
    { id: 'create' as TabType, label: 'Create Post', icon: PlusCircle },
    { id: 'analytics' as TabType, label: 'Analytics', icon: BarChart3 },
  ];

  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('my-posts');
    toast.success('Post created! Switching to My Posts view...');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Posts</h1>
          <p className="text-gray-600 mt-2">
            Share your knowledge with students and grow your audience
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* My Posts Tab */}
            {activeTab === 'my-posts' && (
              <MyPostsList
                refreshTrigger={refreshKey}
                onEditPost={(post) => setEditingPost(post)}
              />
            )}

            {/* Create Post Tab */}
            {activeTab === 'create' && (
              <div className="max-w-3xl mx-auto">
                <CreatePostForm
                  lessonGroups={lessonGroups}
                  onPostCreated={handlePostCreated}
                />
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="max-w-4xl mx-auto">
                <PostAnalytics />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          isOpen={!!editingPost}
          onClose={() => setEditingPost(null)}
          onPostUpdated={() => {
            setEditingPost(null);
            setRefreshKey(prev => prev + 1);
          }}
        />
      )}
    </DashboardLayout>
  );
}

// Analytics Component (Placeholder for now)
function PostAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Post Analytics</h2>
        <p className="text-gray-600">
          Track your post performance and engagement metrics
        </p>
      </div>

      {/* Placeholder - Will be built in later steps */}
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Analytics Coming Soon
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Detailed analytics including post reach, engagement rate, best performing posts, 
          and audience insights will be available here.
        </p>
      </div>
    </div>
  );
}