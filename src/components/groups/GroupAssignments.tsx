// src/components/groups/GroupAssignments.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Plus,
  Loader2,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { getAllAssignments, deleteAssignment } from '@/lib/api/assignments';
import { Assignment } from '@/types';
import { toast } from 'sonner';

interface GroupAssignmentsProps {
  groupId: string;
  groupName: string;
}

export default function GroupAssignments({ groupId, groupName }: GroupAssignmentsProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, [groupId]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await getAllAssignments(groupId);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      setAssignments(response.data.assignments);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully');
      loadAssignments();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete assignment');
    }
  };

  const getStatusBadge = (assignment: Assignment) => {
    if (!assignment.dueDate) {
      return <Badge variant="secondary">No Due Date</Badge>;
    }

    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = dueDate < now;

    if (isOverdue) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Overdue
        </Badge>
      );
    }

    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 3) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center gap-1">
        <Calendar className="h-3 w-3" />
        Due in {daysUntilDue} days
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading assignments...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Assignment Button */}
      <Card>
        <CardContent className="pt-6">
          <Button 
            onClick={() => router.push(`/teacher/assignments/create?groupId=${groupId}`)} 
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Assignment
          </Button>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments ({assignments.length})</CardTitle>
          <CardDescription>Manage assignments for {groupName}</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first assignment to get started
              </p>
              <Button onClick={() => router.push(`/teacher/assignments/create?groupId=${groupId}`)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Assignment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/teacher/assignments/${assignment.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {assignment.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {assignment.description}
                          </p>

                          {/* Assignment Info */}
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            {/* Due Date Badge */}
                            {getStatusBadge(assignment)}

                            {/* Points */}
                            <div className="flex items-center gap-1 text-gray-600">
                              <CheckCircle className="h-4 w-4" />
                              <span>{assignment.totalPoints} points</span>
                            </div>

                            {/* Submissions */}
                            <div className="flex items-center gap-1 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span>{assignment._count?.submissions || 0} submission{assignment._count?.submissions !== 1 ? 's' : ''}</span>
                            </div>

                            {/* Created Date */}
                            <div className="flex items-center gap-1 text-gray-500 text-xs">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Created {new Date(assignment.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAssignment(assignment.id, assignment.title);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}