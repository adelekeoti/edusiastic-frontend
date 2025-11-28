// src/app/(dashboard)/teacher/assignments/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus,
  Search,
  FileText,
  Calendar,
  Award,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { getAllAssignments } from '@/lib/api/assignments';
import { Assignment } from '@/types';
import { toast } from 'sonner';

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAssignments, setTotalAssignments] = useState(0);

  useEffect(() => {
    loadAssignments();
  }, [currentPage]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await getAllAssignments(undefined, currentPage, 12);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      setAssignments(response.data.assignments);
      setTotalPages(response.data.pagination.totalPages);
      setTotalAssignments(response.data.pagination.total);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (assignment: Assignment) => {
    if (!assignment.dueDate) {
      return {
        badge: <Badge variant="secondary">No Due Date</Badge>,
        text: 'No deadline',
        color: 'text-gray-600'
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
        color: 'text-red-600'
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
        color: 'text-orange-600'
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
      color: 'text-green-600'
    };
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.lessonGroup?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubmissionStats = (assignment: Assignment) => {
    const totalSubmissions = assignment._count?.submissions || 0;
    const gradedSubmissions = assignment.submissions?.filter(s => s.status === 'GRADED').length || 0;
    
    return { total: totalSubmissions, graded: gradedSubmissions };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assignments</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all your assignments
            </p>
          </div>
          <Link href="/teacher/assignments/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Assignments
              </CardTitle>
              <FileText className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAssignments}</div>
              <p className="text-xs text-gray-500">Across all groups</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active
              </CardTitle>
              <Clock className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => {
                  if (!a.dueDate) return true;
                  return new Date(a.dueDate) >= new Date();
                }).length}
              </div>
              <p className="text-xs text-gray-500">Not yet due</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Overdue
              </CardTitle>
              <AlertCircle className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {assignments.filter(a => {
                  if (!a.dueDate) return false;
                  return new Date(a.dueDate) < new Date();
                }).length}
              </div>
              <p className="text-xs text-gray-500">Past deadline</p>
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
              <div className="text-2xl font-bold">
                {assignments.reduce((sum, a) => sum + (a._count?.submissions || 0), 0)}
              </div>
              <p className="text-xs text-gray-500">Total received</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assignments by title, description, or group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Loading assignments...</p>
            </CardContent>
          </Card>
        ) : filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No assignments found' : 'No assignments yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first assignment to get started'}
              </p>
              {!searchQuery && (
                <Link href="/teacher/assignments/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssignments.map((assignment) => {
              const statusInfo = getStatusInfo(assignment);
              const stats = getSubmissionStats(assignment);

              return (
                <Card 
                  key={assignment.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/teacher/assignments/${assignment.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {assignment.title}
                      </CardTitle>
                      {statusInfo.badge}
                    </div>
                    <CardDescription className="line-clamp-2">
                      {assignment.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Group Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span className="truncate">{assignment.lessonGroup?.name}</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <Award className="h-3 w-3" />
                          Points
                        </div>
                        <p className="text-lg font-semibold">{assignment.totalPoints}</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                          <CheckCircle className="h-3 w-3" />
                          Submissions
                        </div>
                        <p className="text-lg font-semibold">
                          {stats.graded}/{stats.total}
                        </p>
                      </div>
                    </div>

                    {/* Due Date */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Due date:</span>
                        <span className={`font-medium ${statusInfo.color}`}>
                          {assignment.dueDate
                            ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })
                            : 'No deadline'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}