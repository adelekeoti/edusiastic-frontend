// src/components/assignments/AssignmentsList.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Loader2,
  Award,
  Book,
  User
} from 'lucide-react';
import { getAllAssignments } from '@/lib/api/assignments';
import { Assignment } from '@/types';
import { toast } from 'sonner';

export default function AssignmentsList() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
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
        icon: isOverdue ? AlertCircle : Clock
      };
    }

    if (submission.status === 'GRADED') {
      return {
        label: 'Graded',
        variant: 'default',
        icon: CheckCircle
      };
    }

    return {
      label: 'Submitted',
      variant: 'outline',
      icon: CheckCircle
    };
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.lessonGroup?.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    
    const submission = assignment.mySubmission;
    if (statusFilter === 'pending') return matchesSearch && !submission;
    if (statusFilter === 'submitted') return matchesSearch && submission?.status === 'PENDING';
    if (statusFilter === 'graded') return matchesSearch && submission?.status === 'GRADED';
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-600 mt-2">
          View and submit assignments from all your groups
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignments</SelectItem>
                <SelectItem value="pending">Not Submitted</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' 
                ? 'No assignments found' 
                : 'No assignments yet'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
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

            return (
              <Card 
                key={assignment.id}
                className={`hover:shadow-md transition-shadow cursor-pointer ${
                  isOverdue ? 'border-red-200 bg-red-50/30' : ''
                }`}
                onClick={() => router.push(`/dashboard/student/assignments/${assignment.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={status.variant as any} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                        {assignment.mySubmission?.grade !== null && 
                         assignment.mySubmission?.grade !== undefined && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {assignment.mySubmission.grade}/{assignment.totalPoints}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl">{assignment.title}</CardTitle>
                      <CardDescription className="mt-2 line-clamp-2">
                        {assignment.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Book className="h-4 w-4" />
                      <span className="truncate">{assignment.lessonGroup?.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span className="truncate">
                        {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                      </span>
                    </div>

                    {assignment.dueDate && (
                      <div className={`flex items-center gap-2 ${
                        isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'
                      }`}>
                        <Calendar className="h-4 w-4" />
                        <span>{getDaysUntilDue(assignment.dueDate)}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-gray-600">
                      <Award className="h-4 w-4" />
                      <span>{assignment.totalPoints} points</span>
                    </div>
                  </div>

                  {assignment.mySubmission?.submittedAt && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-gray-500">
                        Submitted on {new Date(assignment.mySubmission.submittedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
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
          <span className="text-sm text-gray-600">
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
  );
}