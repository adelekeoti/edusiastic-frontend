// src/app/(dashboard)/teacher/groups/create/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Users, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { createGroup } from '@/lib/api/groups';
import { GroupType } from '@/types';
import { toast } from 'sonner';

export default function CreateGroupPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    groupType: 'LESSON' as GroupType,
    maxStudents: 25
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (!formData.groupType) {
      toast.error('Please select a group type');
      return;
    }

    try {
      setSaving(true);
      const response = await createGroup({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        groupType: formData.groupType,
        maxStudents: formData.groupType === 'LESSON' ? formData.maxStudents : undefined
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      toast.success('Group created successfully');
      router.push(`/teacher/groups/${response.data.group.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/teacher/groups">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Group</h1>
            <p className="text-gray-600 mt-1">Create a new lesson or support group</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Group Details</CardTitle>
            <CardDescription>Fill in the information about your group</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Type */}
              <div className="space-y-2">
                <Label htmlFor="groupType">Group Type *</Label>
                <Select
                  value={formData.groupType}
                  onValueChange={(value) => setFormData({ ...formData, groupType: value as GroupType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LESSON">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Lesson Group</p>
                          <p className="text-xs text-gray-500">For paid courses with limited enrollment</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="SUPPORT">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Support Group</p>
                          <p className="text-xs text-gray-500">For community support and discussions</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {formData.groupType === 'LESSON' 
                    ? 'Lesson groups are for structured courses with limited seats'
                    : 'Support groups are for open community discussions with unlimited members'}
                </p>
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
                <Label htmlFor="description">Description (Optional)</Label>
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

              {/* Max Students (only for LESSON groups) */}
              {formData.groupType === 'LESSON' && (
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Maximum Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 25 })}
                  />
                  <p className="text-xs text-gray-500">
                    Maximum number of students allowed in this group (1-100)
                  </p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• After creating the group, you can add students manually</li>
                  <li>• You can post assignments, announcements, and resources</li>
                  <li>• Students can interact through group discussions</li>
                  {formData.groupType === 'LESSON' && (
                    <li>• You can link this group to a specific product/course</li>
                  )}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Link href="/teacher/groups" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Group
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}