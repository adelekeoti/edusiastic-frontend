// src/components/assignments/AssignmentDetail.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  Book,
  User,
  ArrowLeft,
  Loader2,
  MessageSquare,
  ExternalLink,
  Download
} from 'lucide-react';
import { getAssignmentById } from '@/lib/api/assignments';
import { Assignment } from '@/types';
import { toast } from 'sonner';
import SubmissionForm from './SubmissionForm';

interface AssignmentDetailProps {
  assignmentId: string;
}

export default function AssignmentDetail({ assignmentId }: AssignmentDetailProps) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await getAssignmentById(assignmentId);
      if (response.data) {
        setAssignment(response.data.assignment);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load assignment');
      router.push('/dashboard/student/assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionSuccess = () => {
    setShowSubmissionForm(false);
    fetchAssignment();
    toast.success('Assignment submitted successfully!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Assignment not found</h3>
          <Button onClick={() => router.push('/dashboard/student/assignments')}>
            Go back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const hasSubmission = !!assignment.mySubmission;
  const isGraded = assignment.mySubmission?.status === 'GRADED';
  const canSubmit = !isGraded;

  const getDaysUntilDue = () => {
    if (!assignment.dueDate) return null;
    const now = new Date();
    const due = new Date(assignment.dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600' };
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600' };
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-orange-600' };
    if (diffDays <= 3) return { text: `Due in ${diffDays} days`, color: 'text-yellow-600' };
    return { text: `Due in ${diffDays} days`, color: 'text-gray-600' };
  };

  const dueDateInfo = getDaysUntilDue();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard/student/assignments')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Assignments
      </Button>

      {/* Assignment Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {hasSubmission ? (
                  isGraded ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Graded
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Submitted
                    </Badge>
                  )
                ) : (
                  <Badge 
                    variant={isOverdue ? 'destructive' : 'secondary'} 
                    className="flex items-center gap-1"
                  >
                    {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {isOverdue ? 'Overdue' : 'Not Submitted'}
                  </Badge>
                )}
                
                {assignment.mySubmission?.grade !== null && 
                 assignment.mySubmission?.grade !== undefined && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    {assignment.mySubmission.grade}/{assignment.totalPoints} points
                  </Badge>
                )}
              </div>

              <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-3">
                <div className="flex items-center gap-2">
                  <Book className="h-4 w-4" />
                  <span>{assignment.lessonGroup?.name}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>
                    {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                  </span>
                </div>

                {assignment.dueDate && dueDateInfo && (
                  <div className={`flex items-center gap-2 font-semibold ${dueDateInfo.color}`}>
                    <Calendar className="h-4 w-4" />
                    <span>{dueDateInfo.text}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>{assignment.totalPoints} points</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>
            </div>

            {assignment.dueDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t">
                <Clock className="h-4 w-4" />
                <span>
                  Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* My Submission */}
      {hasSubmission && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              My Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="font-semibold">
                  {assignment.mySubmission?.status === 'GRADED' ? 'Graded' : 'Pending Review'}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Submitted:</span>
                <p className="font-semibold">
                  {assignment.mySubmission?.submittedAt && 
                    new Date(assignment.mySubmission.submittedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Your Work:</h4>
              {assignment.mySubmission?.type === 'TEXT' && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {assignment.mySubmission.content}
                  </p>
                </div>
              )}
              {assignment.mySubmission?.type === 'URL' && (
                <a
                  href={assignment.mySubmission.content}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  {assignment.mySubmission.content}
                </a>
              )}
              {assignment.mySubmission?.type === 'DOCX' && assignment.mySubmission.fileUrl && (
                <a
                  href={assignment.mySubmission.fileUrl}
                  download
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <Download className="h-4 w-4" />
                  Download Document
                </a>
              )}
            </div>

            {/* Grade & Feedback */}
            {isGraded && (
              <>
                <Separator />
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="text-sm text-green-800 font-medium">Your Grade</p>
                        <p className="text-2xl font-bold text-green-900">
                          {assignment.mySubmission?.grade}/{assignment.totalPoints}
                        </p>
                        <p className="text-sm text-green-700">
                          {((assignment.mySubmission?.grade! / assignment.totalPoints) * 100).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    {assignment.mySubmission?.gradedAt && (
                      <div className="text-right text-sm text-green-700">
                        <p>Graded on</p>
                        <p className="font-medium">
                          {new Date(assignment.mySubmission.gradedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                  </div>

                  {assignment.mySubmission?.feedback && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Teacher's Feedback</h4>
                      </div>
                      <p className="text-blue-800 whitespace-pre-wrap">
                        {assignment.mySubmission.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Resubmit Button */}
            {canSubmit && (
              <Button 
                onClick={() => setShowSubmissionForm(true)}
                variant="outline"
                className="w-full"
              >
                Update Submission
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Submission Form */}
      {(!hasSubmission || showSubmissionForm) && canSubmit && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {hasSubmission ? 'Update Your Submission' : 'Submit Your Work'}
            </CardTitle>
            <CardDescription>
              Choose how you'd like to submit your assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SubmissionForm
              assignmentId={assignment.id}
              onSuccess={handleSubmissionSuccess}
              onCancel={hasSubmission ? () => setShowSubmissionForm(false) : undefined}
            />
          </CardContent>
        </Card>
      )}

      {/* Graded Message */}
      {isGraded && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">
                This assignment has been graded. You cannot resubmit.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}