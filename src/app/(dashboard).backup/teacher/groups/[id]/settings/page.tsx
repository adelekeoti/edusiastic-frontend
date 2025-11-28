// src/app/(dashboard)/teacher/groups/[id]/settings/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Save, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getGroupById, updateGroup, deleteGroup } from '@/lib/api/groups';
import { LessonGroup } from '@/types';
import { toast } from 'sonner';

export default function GroupSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;
  const [group, setGroup] = useState<LessonGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

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
      
      const groupData = response.data.group;
      setGroup(groupData);
      setFormData({
        name: groupData.name,
        description: groupData.description || '',
        isActive: groupData.isActive
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to load group');
      router.push('/teacher/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      setSaving(true);
      await updateGroup(groupId, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive
      });
      
      toast.success('Group updated successfully');
      router.push(`/teacher/groups/${groupId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update group');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!group) return;

    const confirmMessage = `Are you sure you want to delete "${group.name}"?\n\nThis action cannot be undone. All group data including members, assignments, and posts will be permanently deleted.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting(true);
      await deleteGroup(groupId);
      toast.success('Group deleted successfully');
      router.push('/teacher/groups');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete group');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
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
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/teacher/groups/${groupId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Group Settings</h1>
            <p className="text-gray-600 mt-1">Manage {group.name}</p>
          </div>
        </div>

        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Update your group details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Type (Read-only) */}
              <div className="space-y-2">
                <Label>Group Type</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={group.groupType === 'LESSON' ? 'default' : 'secondary'}>
                    {group.groupType}
                  </Badge>
                  <p className="text-sm text-gray-500">
                    Group type cannot be changed after creation
                  </p>
                </div>
              </div>

              {/* Group Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Mathematics Grade 12"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  maxLength={100}
                  required
                />
                <p className="text-xs text-gray-500">
                  {formData.name.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this group is about..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Group Status</Label>
                  <p className="text-sm text-gray-500">
                    {formData.isActive 
                      ? 'Group is active and visible to members' 
                      : 'Group is inactive and hidden from members'}
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              {/* Max Students (Read-only for LESSON groups) */}
              {group.groupType === 'LESSON' && (
                <div className="space-y-2">
                  <Label>Maximum Students</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">
                      {group.maxStudents} students (maximum capacity)
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Currently enrolled: {group._count?.members || 0} students
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Maximum capacity cannot be changed after creation
                  </p>
                </div>
              )}

              {/* Save Button */}
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Warning */}
            {group._count && (group._count.members > 0 || group._count.assignments > 0) && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900">Warning</p>
                  <p className="text-yellow-800 mt-1">
                    This group has {group._count.members} member(s) and {group._count.assignments} assignment(s). 
                    You may need to remove all members and assignments before deleting.
                  </p>
                </div>
              </div>
            )}

            {/* Delete Button */}
            <div className="flex items-start justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-900">Delete Group</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Permanently delete this group and all its data. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Group
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}