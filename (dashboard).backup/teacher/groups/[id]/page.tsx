// src/app/(dashboard)/teacher/groups/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  UserPlus,
  Calendar,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { getGroupById } from '@/lib/api/groups';
import { LessonGroup } from '@/types';
import { toast } from 'sonner';
import MembersManagement from '@/components/groups/MembersManagement';
import GroupPosts from '@/components/groups/GroupPosts';
import GroupAssignments from '@/components/groups/GroupAssignments';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const [group, setGroup] = useState<LessonGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  

  useEffect(() => {
    loadGroup();
  }, [groupId]);

  const loadGroup = async () => {
    try {
      setLoading(true);
      const response = await getGroupById(groupId);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      setGroup(response.data.group);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load group');
      router.push('/teacher/groups');
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
            <p className="text-gray-600">Loading group...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!group) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Group not found</p>
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
            <Link href="/teacher/groups">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
                <Badge variant={group.groupType === 'LESSON' ? 'default' : 'secondary'}>
                  {group.groupType}
                </Badge>
                {!group.isActive && (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
              {group.description && (
                <p className="text-gray-600 mt-1">{group.description}</p>
              )}
            </div>
          </div>
          <Link href={`/teacher/groups/${groupId}/settings`}>
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{group._count?.members || 0}</div>
              {group.groupType === 'LESSON' && (
                <p className="text-xs text-gray-500">
                  Max: {group.maxStudents} students
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Assignments
              </CardTitle>
              <BookOpen className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{group._count?.assignments || 0}</div>
              <p className="text-xs text-gray-500">Total posted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Posts
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{group._count?.posts || 0}</div>
              <p className="text-xs text-gray-500">Announcements & updates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Activity
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {group._count?.messages || 0}
              </div>
              <p className="text-xs text-gray-500">Messages sent</p>
            </CardContent>
          </Card>
        </div>

        {/* Product Info */}
        {group.product && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Linked Product</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-blue-900">{group.product.title}</h3>
                  <p className="text-sm text-blue-700 mt-1">{group.product.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{group.product.type}</Badge>
                    <span className="text-sm font-semibold text-blue-900">
                      ₦{group.product.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Link href={`/teacher/products/${group.product.id}`}>
                  <Button variant="outline" size="sm">View Product</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">
              Members ({group._count?.members || 0})
            </TabsTrigger>
            <TabsTrigger value="assignments">
              Assignments ({group._count?.assignments || 0})
            </TabsTrigger>
            <TabsTrigger value="posts">
              Posts ({group._count?.posts || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Group Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Group Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium">{group.groupType}</p>
                  </div>
                  {group.groupType === 'LESSON' && (
                    <div>
                      <p className="text-sm text-gray-600">Capacity</p>
                      <p className="font-medium">
                        {group._count?.members || 0} / {group.maxStudents} students
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant={group.isActive ? 'default' : 'secondary'}>
                      {group.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium">
                      {new Date(group.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Students
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Post Announcement
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Session
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <MembersManagement groupId={groupId} group={group} onUpdate={loadGroup} />
          </TabsContent>

          <TabsContent value="assignments" className="mt-6">
            <GroupAssignments groupId={groupId} groupName={group.name} />
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments yet</h3>
                <p className="text-gray-600 mb-4">
                  Create your first assignment for this group
                </p>
                <Button>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create Assignment
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts" className="mt-6">
            <GroupPosts groupId={groupId} groupName={group.name} />
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">
                  Share announcements and updates with your group
                </p>
                <Button>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}