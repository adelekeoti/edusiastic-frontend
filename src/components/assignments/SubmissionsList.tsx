// src/components/assignments/SubmissionsList.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  FileText,
  Loader2,
  User,
  Calendar,
  Award,
  MessageSquare,
  ExternalLink,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';
import { gradeSubmission } from '@/lib/api/assignments';
import { Submission } from '@/types';
import { toast } from 'sonner';

interface SubmissionsListProps {
  submissions: Submission[];
  loading: boolean;
  onGraded: () => void;
  totalPoints: number;
}

export default function SubmissionsList({ submissions, loading, onGraded, totalPoints }: SubmissionsListProps) {
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [grading, setGrading] = useState(false);
  const [gradeData, setGradeData] = useState({
    grade: 0,
    feedback: ''
  });

  const handleStartGrading = (submission: Submission) => {
    setGradingSubmissionId(submission.id);
    setGradeData({
      grade: submission.grade || 0,
      feedback: submission.feedback || ''
    });
  };

  const handleCancelGrading = () => {
    setGradingSubmissionId(null);
    setGradeData({ grade: 0, feedback: '' });
  };

  const handleSubmitGrade = async (submissionId: string) => {
    if (gradeData.grade < 0 || gradeData.grade > totalPoints) {
      toast.error(`Grade must be between 0 and ${totalPoints}`);
      return;
    }

    try {
      setGrading(true);
      await gradeSubmission(submissionId, {
        grade: gradeData.grade,
        feedback: gradeData.feedback.trim() || undefined
      });

      toast.success('Submission graded successfully');
      setGradingSubmissionId(null);
      setGradeData({ grade: 0, feedback: '' });
      onGraded();
    } catch (error: any) {
      toast.error(error.message || 'Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  const getSubmissionTypeIcon = (type: string) => {
    switch (type) {
      case 'TEXT':
        return <FileText className="h-4 w-4" />;
      case 'URL':
        return <ExternalLink className="h-4 w-4" />;
      case 'DOCX':
        return <Download className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'GRADED') {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Graded
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Loading submissions...</p>
        </CardContent>
      </Card>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
          <p className="text-gray-600">
            Students haven't submitted their work yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        const isGrading = gradingSubmissionId === submission.id;

        return (
          <Card key={submission.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={submission.student?.profileImage || '/default-avatar.png'}
                    alt={`${submission.student?.firstName} ${submission.student?.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <CardTitle className="text-base">
                      {submission.student?.firstName} {submission.student?.lastName}
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Submitted {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getSubmissionTypeIcon(submission.type)}
                        <span>{submission.type}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(submission.status)}
                  {submission.grade !== null && submission.grade !== undefined && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {submission.grade}/{totalPoints}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Submission Content */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Submission:</h4>
                {submission.type === 'TEXT' && (
                  <p className="text-gray-900 whitespace-pre-wrap">{submission.content}</p>
                )}
                {submission.type === 'URL' && (
                  <a
                    href={submission.content}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {submission.content}
                  </a>
                )}
                {submission.type === 'DOCX' && submission.fileUrl && (
                  <a
                    href={submission.fileUrl}
                    download
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Document
                  </a>
                )}
              </div>

              {/* Existing Feedback */}
              {submission.feedback && !isGrading && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <h4 className="text-sm font-semibold text-blue-900">Your Feedback:</h4>
                  </div>
                  <p className="text-blue-800 whitespace-pre-wrap">{submission.feedback}</p>
                  {submission.gradedAt && (
                    <p className="text-xs text-blue-600 mt-2">
                      Graded on {new Date(submission.gradedAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}
                </div>
              )}

              {/* Grading Form */}
              {isGrading ? (
                <div className="space-y-4 p-4 border-2 border-primary rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="grade">
                      Grade (0-{totalPoints}) *
                    </Label>
                    <Input
                      id="grade"
                      type="number"
                      min="0"
                      max={totalPoints}
                      value={gradeData.grade}
                      onChange={(e) => setGradeData({ ...gradeData, grade: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">Feedback (Optional)</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Provide feedback to the student..."
                      value={gradeData.feedback}
                      onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                      rows={4}
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500">
                      {gradeData.feedback.length}/1000 characters
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSubmitGrade(submission.id)}
                      disabled={grading}
                      className="flex-1"
                    >
                      {grading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Submit Grade
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelGrading}
                      variant="outline"
                      disabled={grading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => handleStartGrading(submission)}
                  variant={submission.status === 'GRADED' ? 'outline' : 'default'}
                  className="w-full"
                >
                  <Award className="mr-2 h-4 w-4" />
                  {submission.status === 'GRADED' ? 'Update Grade' : 'Grade Submission'}
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}