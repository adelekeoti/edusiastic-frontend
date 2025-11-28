// src/components/assignments/SubmissionHistory.tsx

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Clock,
  CheckCircle,
  Award,
  MessageSquare,
  ExternalLink,
  Download,
  History
} from 'lucide-react';
import { Submission } from '@/types';

interface SubmissionHistoryProps {
  submissions: Submission[];
  totalPoints: number;
}

export default function SubmissionHistory({ submissions, totalPoints }: SubmissionHistoryProps) {
  if (!submissions || submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Submission History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>No previous submissions</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort submissions by date (newest first)
  const sortedSubmissions = [...submissions].sort((a, b) => {
    const dateA = new Date(a.submittedAt || '').getTime();
    const dateB = new Date(b.submittedAt || '').getTime();
    return dateB - dateA;
  });

  const getStatusBadge = (submission: Submission) => {
    if (submission.status === 'GRADED') {
      return (
        <Badge variant="default" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Graded
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Pending Review
      </Badge>
    );
  };

  const getSubmissionTypeBadge = (type: string) => {
    const types = {
      TEXT: { label: 'Text', color: 'bg-blue-100 text-blue-800' },
      URL: { label: 'URL', color: 'bg-purple-100 text-purple-800' },
      DOCX: { label: 'File', color: 'bg-green-100 text-green-800' }
    };
    
    const typeInfo = types[type as keyof typeof types] || types.TEXT;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Submission History
          <Badge variant="secondary" className="ml-auto">
            {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedSubmissions.map((submission, index) => (
            <div key={submission.id}>
              {index > 0 && <Separator className="my-6" />}
              
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(submission)}
                      {getSubmissionTypeBadge(submission.type)}
                      {index === 0 && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>
                        Submitted on{' '}
                        {submission.submittedAt && new Date(submission.submittedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Grade if graded */}
                  {submission.status === 'GRADED' && submission.grade !== null && submission.grade !== undefined && (
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-primary">
                        <Award className="h-5 w-5" />
                        <span className="text-2xl font-bold">
                          {submission.grade}/{totalPoints}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {((submission.grade / totalPoints) * 100).toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Submitted Work:</h4>
                    
                    {submission.type === 'TEXT' && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-900 whitespace-pre-wrap text-sm">
                          {submission.content}
                        </p>
                      </div>
                    )}
                    
                    {submission.type === 'URL' && (
                      <a
                        href={submission.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline p-3 bg-purple-50 rounded-lg border border-purple-200"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="text-sm break-all">{submission.content}</span>
                      </a>
                    )}
                    
                    {submission.type === 'DOCX' && submission.fileUrl && (
                      <a
                        href={submission.fileUrl}
                        download
                        className="inline-flex items-center gap-2 text-primary hover:underline p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <Download className="h-4 w-4" />
                        <span className="text-sm">Download Submitted Document</span>
                      </a>
                    )}
                  </div>

                  {/* Feedback */}
                  {submission.status === 'GRADED' && submission.feedback && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <h4 className="text-sm font-semibold text-blue-900">Teacher's Feedback</h4>
                      </div>
                      <p className="text-sm text-blue-800 whitespace-pre-wrap">
                        {submission.feedback}
                      </p>
                      {submission.gradedAt && (
                        <p className="text-xs text-blue-600 mt-2">
                          Graded on {new Date(submission.gradedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}