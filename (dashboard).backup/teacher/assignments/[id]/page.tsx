// src/app/(dashboard)/teacher/assignments/[id]/page.tsx

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
  Calendar,
  Award,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { getAssignmentById, deleteAssignment, getAssignmentSubmissions } from '@/lib/api/assignments';
import { Assignment, Submission } from '@/types';
import { toast } from 'sonner';
import SubmissionsList from '@/components/assignments/SubmissionsList';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    loadAssignment();
    loadSubmissions();
  }, [assignmentId]);

  const loadAssignment = async () => {
    try {
      setLoading(true);
      const response = await getAssignmentById(assignmentId);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      setAssignment(response.data.assignment);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load assignment');
      router.push('/teacher/groups');
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const response = await getAssignmentSubmissions(assignmentId);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      setSubmissions(response.data.submissions);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleDelete = async () => {
    if (!assignment) return;

    const confirmMessage = `Are you sure you want to delete "${assignment.title}"?\n\nThis action cannot be undone.`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteAssignment(assignmentId);
      toast.success('Assignment deleted successfully');
      router.push(`/teacher/groups/${assignment.lessonGroupId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete assignment');
    }
  };

  const getStatusInfo = () => {
    if (!assignment?.dueDate) {
      return {
        badge: <Badge variant="secondary">No Due Date</Badge>,
        text: 'No deadline set',
        icon: <Calendar className="h-5 w-5 text-gray-400" />
      };
    }

    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = dueDate < now;

    if (isOverdue) {
      return {
        badge: (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Overdue
          </Badge>
        ),
        text: `Was due ${dueDate.toLocaleDateString()}`,
        icon: <AlertCircle className="h-5 w-5 text-red-600" />
      };
    }

    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue <= 3) {
      return {
        badge: (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Due Soon
          </Badge>
        ),
        text: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
        icon: <Clock className="h-5 w-5 text-orange-600" />
      };
    }

    return {
      badge: (
        <Badge variant="default" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Active
        </Badge>
      ),
      text: `Due in ${daysUntilDue} days`,
      icon: <CheckCircle className="h-5 w-5 text-green-600" />
    };
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const graded = submissions.filter(s => s.status === 'GRADED').length;
    const pending = submissions.filter(s => s.status === 'PENDING').length;
    
    return { total, graded, pending };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading assignment...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!assignment) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Assignment not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = getStatusInfo();
  const stats = getSubmissionStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/teacher/groups/${assignment.lessonGroupId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                {statusInfo.badge}
              </div>
              <p className="text-gray-600 mt-1">
                {assignment.lessonGroup?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Due Date
              </CardTitle>
              {statusInfo.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignment.dueDate 
                  ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'No deadline'}
              </div>
              <p className="text-xs text-gray-500">{statusInfo.text}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Points
              </CardTitle>
              <Award className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignment.totalPoints}</div>
              <p className="text-xs text-gray-500">Maximum score</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Submissions
              </CardTitle>
              <Users className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-500">Total received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Graded
              </CardTitle>
              <CheckCircle className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.graded}</div>
              <p className="text-xs text-gray-500">
                {stats.pending} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="submissions">
              Submissions ({stats.total})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {assignment.description}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Created</p>
                      <p className="font-medium">
                        {new Date(assignment.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {assignment.dueDate && (
                      <div>
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-medium">
                          {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="mt-6">
            <SubmissionsList 
              submissions={submissions} 
              loading={loadingSubmissions}
              onGraded={loadSubmissions}
              totalPoints={assignment.totalPoints}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}