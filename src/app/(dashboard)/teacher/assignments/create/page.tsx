// src/app/(dashboard)/teacher/assignments/create/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, Save, Calendar, Award } from 'lucide-react';
import Link from 'next/link';
import { createAssignment } from '@/lib/api/assignments';
import { getAllGroups } from '@/lib/api/groups';
import { LessonGroup } from '@/types';
import { toast } from 'sonner';

export default function CreateAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedGroupId = searchParams.get('groupId');

  const [saving, setSaving] = useState(false);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [groups, setGroups] = useState<LessonGroup[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    lessonGroupId: preSelectedGroupId || '',
    dueDate: '',
    totalPoints: 100
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoadingGroups(true);
      const response = await getAllGroups({ groupType: 'LESSON' });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Only show LESSON groups (assignments can't be created in SUPPORT groups)
      const lessonGroups = response.data.groups.filter(g => g.groupType === 'LESSON');
      setGroups(lessonGroups);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load groups');
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Description is required');
      return;
    }

    if (!formData.lessonGroupId) {
      toast.error('Please select a group');
      return;
    }

    if (formData.totalPoints < 1 || formData.totalPoints > 1000) {
      toast.error('Total points must be between 1 and 1000');
      return;
    }

    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      if (dueDate <= new Date()) {
        toast.error('Due date must be in the future');
        return;
      }
    }

    try {
      setSaving(true);
      const response = await createAssignment({
        title: formData.title.trim(),
        description: formData.description.trim(),
        lessonGroupId: formData.lessonGroupId,
        dueDate: formData.dueDate || undefined,
        totalPoints: formData.totalPoints
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      toast.success('Assignment created successfully');
      router.push(`/teacher/assignments/${response.data.assignment.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create assignment');
    } finally {
      setSaving(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
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
            <h1 className="text-3xl font-bold text-gray-900">Create Assignment</h1>
            <p className="text-gray-600 mt-1">Create a new assignment for your students</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment Details</CardTitle>
            <CardDescription>Fill in the assignment information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Group Selection */}
              <div className="space-y-2">
                <Label htmlFor="lessonGroupId">Select Group *</Label>
                {loadingGroups ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading groups...
                  </div>
                ) : groups.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      No lesson groups available. Please create a lesson group first.
                    </p>
                    <Link href="/teacher/groups/create">
                      <Button size="sm" className="mt-2">
                        Create Lesson Group
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Select
                    value={formData.lessonGroupId}
                    onValueChange={(value) => setFormData({ ...formData, lessonGroupId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          <div className="flex items-center justify-between gap-2">
                            <span>{group.name}</span>
                            <span className="text-xs text-gray-500">
                              ({group._count?.members || 0} students)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-xs text-gray-500">
                  Assignments can only be created in LESSON groups
                </p>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Week 1 Quiz - Algebra Basics"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={200}
                  required
                />
                <p className="text-xs text-gray-500">
                  {formData.title.length}/200 characters
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the assignment, include instructions, requirements, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  maxLength={2000}
                  required
                />
                <p className="text-xs text-gray-500">
                  {formData.description.length}/2000 characters
                </p>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Due Date (Optional)
                </Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  min={getMinDate()}
                />
                <p className="text-xs text-gray-500">
                  Leave empty for no due date. Must be a future date if provided.
                </p>
              </div>

              {/* Total Points */}
              <div className="space-y-2">
                <Label htmlFor="totalPoints" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Total Points
                </Label>
                <Input
                  id="totalPoints"
                  type="number"
                  min="1"
                  max="1000"
                  value={formData.totalPoints}
                  onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) || 100 })}
                  required
                />
                <p className="text-xs text-gray-500">
                  Maximum points students can earn (1-1000)
                </p>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• All group members will be notified about the new assignment</li>
                  <li>• Students can submit their work as text, URL, or DOCX file</li>
                  <li>• You'll be able to grade submissions and provide feedback</li>
                  <li>• Students will receive notifications when graded</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Link href="/teacher/groups" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={saving || groups.length === 0} 
                  className="flex-1"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Create Assignment
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