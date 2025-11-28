// src/components/assignments/SubmissionForm.tsx
// FIXED: Corrected data structure for submission

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Link as LinkIcon, 
  Upload, 
  Loader2,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { submitAssignment } from '@/lib/api/assignments';
import { SubmissionType } from '@/types';
import { toast } from 'sonner';

interface SubmissionFormProps {
  assignmentId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function SubmissionForm({ assignmentId, onSuccess, onCancel }: SubmissionFormProps) {
  const [submissionType, setSubmissionType] = useState<SubmissionType>(SubmissionType.TEXT);
  const [textContent, setTextContent] = useState('');
  const [urlContent, setUrlContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (submissionType === SubmissionType.TEXT) {
      if (!textContent.trim()) {
        newErrors.text = 'Text content is required';
      } else if (textContent.trim().length < 10) {
        newErrors.text = 'Text must be at least 10 characters';
      }
    }

    if (submissionType === SubmissionType.URL) {
      if (!urlContent.trim()) {
        newErrors.url = 'URL is required';
      } else {
        try {
          new URL(urlContent);
        } catch {
          newErrors.url = 'Please enter a valid URL (e.g., https://example.com)';
        }
      }
    }

    if (submissionType === SubmissionType.DOCX) {
      if (!file) {
        newErrors.file = 'Please select a file to upload';
      } else {
        const allowedTypes = [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/msword',
          'application/pdf'
        ];
        if (!allowedTypes.includes(file.type)) {
          newErrors.file = 'Only Word documents (.docx, .doc) and PDFs are allowed';
        }
        if (file.size > 10 * 1024 * 1024) {
          newErrors.file = 'File size must be less than 10MB';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors({ ...errors, file: '' });
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Build the submission data object
      const submissionData: {
        assignmentId: string;
        type: SubmissionType;
        content?: string;
        file?: File;
      } = {
        assignmentId: assignmentId, // Ensure assignmentId is passed
        type: submissionType
      };

      // Add content or file based on submission type
      if (submissionType === SubmissionType.TEXT) {
        submissionData.content = textContent.trim();
      } else if (submissionType === SubmissionType.URL) {
        submissionData.content = urlContent.trim();
      } else if (submissionType === SubmissionType.DOCX && file) {
        submissionData.file = file;
      }

      console.log('Submitting assignment with data:', {
        assignmentId: submissionData.assignmentId,
        type: submissionData.type,
        hasContent: !!submissionData.content,
        hasFile: !!submissionData.file
      });

      await submitAssignment(submissionData);
      
      // Reset form
      setTextContent('');
      setUrlContent('');
      setFile(null);
      setErrors({});
      
      toast.success('Assignment submitted successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Submission Type Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Submission Type</Label>
        <RadioGroup 
          value={submissionType} 
          onValueChange={(value) => {
            setSubmissionType(value as SubmissionType);
            setErrors({});
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card 
            className={`cursor-pointer transition-all ${
              submissionType === SubmissionType.TEXT 
                ? 'border-primary border-2 bg-primary/5' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => setSubmissionType(SubmissionType.TEXT)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={SubmissionType.TEXT} id="text" />
                <Label htmlFor="text" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">Text</p>
                      <p className="text-xs text-gray-600">Type your answer</p>
                    </div>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              submissionType === SubmissionType.URL 
                ? 'border-primary border-2 bg-primary/5' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => setSubmissionType(SubmissionType.URL)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={SubmissionType.URL} id="url" />
                <Label htmlFor="url" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">URL</p>
                      <p className="text-xs text-gray-600">Submit a link</p>
                    </div>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${
              submissionType === SubmissionType.DOCX 
                ? 'border-primary border-2 bg-primary/5' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => setSubmissionType(SubmissionType.DOCX)}
          >
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={SubmissionType.DOCX} id="docx" />
                <Label htmlFor="docx" className="cursor-pointer flex-1">
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold">File</p>
                      <p className="text-xs text-gray-600">Upload document</p>
                    </div>
                  </div>
                </Label>
              </div>
            </CardContent>
          </Card>
        </RadioGroup>
      </div>

      {/* Text Submission */}
      {submissionType === SubmissionType.TEXT && (
        <div className="space-y-2">
          <Label htmlFor="text-content">
            Your Answer <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="text-content"
            placeholder="Type your answer here..."
            value={textContent}
            onChange={(e) => {
              setTextContent(e.target.value);
              if (errors.text) setErrors({ ...errors, text: '' });
            }}
            rows={10}
            className={errors.text ? 'border-red-500' : ''}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {textContent.length} characters (minimum 10)
            </p>
            {errors.text && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.text}
              </p>
            )}
          </div>
        </div>
      )}

      {/* URL Submission */}
      {submissionType === SubmissionType.URL && (
        <div className="space-y-2">
          <Label htmlFor="url-content">
            URL <span className="text-red-500">*</span>
          </Label>
          <Input
            id="url-content"
            type="url"
            placeholder="https://example.com"
            value={urlContent}
            onChange={(e) => {
              setUrlContent(e.target.value);
              if (errors.url) setErrors({ ...errors, url: '' });
            }}
            className={errors.url ? 'border-red-500' : ''}
          />
          {errors.url && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.url}
            </p>
          )}
          <p className="text-xs text-gray-500">
            Enter the full URL including https://
          </p>
        </div>
      )}

      {/* File Upload */}
      {submissionType === SubmissionType.DOCX && (
        <div className="space-y-2">
          <Label htmlFor="file-upload">
            Upload Document <span className="text-red-500">*</span>
          </Label>
          
          {!file ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <Label 
                htmlFor="file-upload" 
                className="cursor-pointer text-primary hover:text-primary/80 font-semibold"
              >
                Click to upload
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Word documents (.docx, .doc) or PDF (max 10MB)
              </p>
              <Input
                id="file-upload"
                type="file"
                accept=".doc,.docx,.pdf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {errors.file && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.file}
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={submitting}
          className="flex-1"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Submit Assignment
            </>
          )}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}