// src/app/(dashboard)/student/assignments/page.tsx
// FIXED: Changed router.push from /dashboard/student/assignments to /student/assignments

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Loader2,
  Award,
  Book,
  User,
  ArrowLeft,
  Target,
  Zap
} from 'lucide-react';
import { getAllAssignments } from '@/lib/api/assignments';
import { Assignment } from '@/types';
import { toast } from 'sonner';

export default function StudentAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAssignments();
  }, [page]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await getAllAssignments(undefined, page, 20);
      if (response.data) {
        setAssignments(response.data.assignments);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = assignment.mySubmission;
    
    if (!submission) {
      const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
      return {
        label: isOverdue ? 'Overdue' : 'Not Submitted',
        variant: isOverdue ? 'destructive' : 'secondary',
        icon: isOverdue ? AlertCircle : Clock,
        category: isOverdue ? 'overdue' : 'pending'
      };
    }

    if (submission.status === 'GRADED') {
      return {
        label: 'Graded',
        variant: 'default',
        icon: CheckCircle,
        category: 'graded'
      };
    }

    return {
      label: 'Submitted',
      variant: 'outline',
      icon: CheckCircle,
      category: 'submitted'
    };
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-orange-600' };
    return { text: `Due in ${diffDays} days`, color: 'text-gray-600' };
  };

  // Calculate statistics
  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => !a.mySubmission).length,
    submitted: assignments.filter(a => a.mySubmission?.status === 'PENDING').length,
    graded: assignments.filter(a => a.mySubmission?.status === 'GRADED').length,
    overdue: assignments.filter(a => !a.mySubmission && a.dueDate && new Date(a.dueDate) < new Date()).length,
    avgGrade: (() => {
      const gradedAssignments = assignments.filter(a => a.mySubmission?.grade !== null && a.mySubmission?.grade !== undefined);
      if (gradedAssignments.length === 0) return 0;
      const totalGrade = gradedAssignments.reduce((sum, a) => sum + (a.mySubmission?.grade || 0), 0);
      const totalPossible = gradedAssignments.reduce((sum, a) => sum + a.totalPoints, 0);
      return totalPossible > 0 ? Math.round((totalGrade / totalPossible) * 100) : 0;
    })()
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.lessonGroup?.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'all') return true;
    
    const status = getAssignmentStatus(assignment);
    return status.category === activeTab;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button & Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push('/student')}
              className="gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
            <p className="text-gray-600 mt-2">
              Track and submit assignments from all your courses
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-600">Total</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-gray-600">Overdue</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.submitted}</p>
                <p className="text-xs text-gray-600">Submitted</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.graded}</p>
                <p className="text-xs text-gray-600">Graded</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary to-primary/80">
            <CardContent className="pt-6">
              <div className="text-center text-white">
                <Target className="h-8 w-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.avgGrade}%</p>
                <p className="text-xs opacity-90">Avg Grade</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Tabs */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search assignments by title, description, or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">
                    All ({stats.total})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    Pending ({stats.pending})
                  </TabsTrigger>
                  <TabsTrigger value="overdue">
                    Overdue ({stats.overdue})
                  </TabsTrigger>
                  <TabsTrigger value="submitted">
                    Submitted ({stats.submitted})
                  </TabsTrigger>
                  <TabsTrigger value="graded">
                    Graded ({stats.graded})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || activeTab !== 'all' 
                  ? 'No assignments found' 
                  : 'No assignments yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || activeTab !== 'all'
                  ? 'Try adjusting your filters or search term'
                  : 'Your teachers haven\'t posted any assignments yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredAssignments.map((assignment) => {
              const status = getAssignmentStatus(assignment);
              const StatusIcon = status.icon;
              const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && !assignment.mySubmission;
              const dueInfo = assignment.dueDate ? getDaysUntilDue(assignment.dueDate) : null;

              return (
                <Card 
                  key={assignment.id}
                  className={`hover:shadow-lg transition-all cursor-pointer group ${
                    isOverdue ? 'border-red-200 bg-red-50/30' : ''
                  }`}
                  onClick={() => router.push(`/student/assignments/${assignment.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                          <Badge variant={status.variant as any} className="flex items-center gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                          
                          {assignment.mySubmission?.grade !== null && 
                           assignment.mySubmission?.grade !== undefined && (
                            <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                              <Award className="h-3 w-3" />
                              {assignment.mySubmission.grade}/{assignment.totalPoints} ({Math.round((assignment.mySubmission.grade / assignment.totalPoints) * 100)}%)
                            </Badge>
                          )}

                          {dueInfo && !assignment.mySubmission && (
                            <Badge variant="outline" className={`flex items-center gap-1 ${dueInfo.color}`}>
                              <Calendar className="h-3 w-3" />
                              {dueInfo.text}
                            </Badge>
                          )}
                        </div>
                        
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {assignment.title}
                        </CardTitle>
                        <CardDescription className="mt-2 line-clamp-2">
                          {assignment.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Assignment Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Book className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{assignment.lessonGroup?.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">
                            {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                          </span>
                        </div>

                        {assignment.dueDate && (
                          <div className={`flex items-center gap-2 font-medium ${
                            isOverdue ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>
                              {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-600">
                          <Award className="h-4 w-4 flex-shrink-0" />
                          <span>{assignment.totalPoints} points</span>
                        </div>
                      </div>

                      {/* Submission Info */}
                      {assignment.mySubmission?.submittedAt && (
                        <div className="pt-4 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                              <CheckCircle className="h-4 w-4" />
                              <span>
                                Submitted on {new Date(assignment.mySubmission.submittedAt).toLocaleDateString('en-US', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            {assignment.mySubmission.status === 'GRADED' && assignment.mySubmission.gradedAt && (
                              <div className="flex items-center gap-2 text-green-600">
                                <Award className="h-4 w-4" />
                                <span>
                                  Graded {new Date(assignment.mySubmission.gradedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 px-4">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}