// src/app/(dashboard)/teacher/groups/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, BookOpen, MessageSquare, Search, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllGroups, deleteGroup } from '@/lib/api/groups';
import { LessonGroup, GroupType } from '@/types';
import { toast } from 'sonner';

export default function GroupsListPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<LessonGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'LESSON' | 'SUPPORT'>('all');

  useEffect(() => {
    loadGroups();
  }, [activeTab]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const filters = activeTab !== 'all' ? { groupType: activeTab as GroupType } : {};
      const response = await getAllGroups(filters);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      setGroups(response.data.groups);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Are you sure you want to delete "${groupName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteGroup(groupId);
      toast.success('Group deleted successfully');
      loadGroups();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete group');
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading groups...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
            <p className="text-gray-600 mt-1">Manage your lesson and support groups</p>
          </div>
          <Link href="/teacher/groups/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </Link>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="all">All Groups ({groups.length})</TabsTrigger>
            <TabsTrigger value="LESSON">Lesson Groups</TabsTrigger>
            <TabsTrigger value="SUPPORT">Support Groups</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredGroups.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No groups found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchQuery ? 'Try a different search term' : 'Create your first group to get started'}
                  </p>
                  {!searchQuery && (
                    <Link href="/teacher/groups/create">
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Group
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map((group) => (
                  <Card key={group.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={group.groupType === 'LESSON' ? 'default' : 'secondary'}>
                              {group.groupType}
                            </Badge>
                            {!group.isActive && (
                              <Badge variant="outline">Inactive</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {group.description && (
                        <CardDescription className="mt-2 line-clamp-2">
                          {group.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-2 bg-gray-50 rounded">
                            <Users className="h-4 w-4 mx-auto text-gray-600 mb-1" />
                            <p className="text-sm font-semibold">{group._count?.members || 0}</p>
                            <p className="text-xs text-gray-600">Members</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <BookOpen className="h-4 w-4 mx-auto text-gray-600 mb-1" />
                            <p className="text-sm font-semibold">{group._count?.assignments || 0}</p>
                            <p className="text-xs text-gray-600">Tasks</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded">
                            <MessageSquare className="h-4 w-4 mx-auto text-gray-600 mb-1" />
                            <p className="text-sm font-semibold">{group._count?.posts || 0}</p>
                            <p className="text-xs text-gray-600">Posts</p>
                          </div>
                        </div>

                        {/* Product info */}
                        {group.product && (
                          <div className="p-2 bg-blue-50 rounded text-sm">
                            <p className="text-gray-600">Linked to:</p>
                            <p className="font-medium text-blue-900">{group.product.title}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            onClick={() => router.push(`/teacher/groups/${group.id}`)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/teacher/groups/${group.id}/settings`)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteGroup(group.id, group.name)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}