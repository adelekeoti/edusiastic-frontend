// src/components/posts/CreatePostForm.tsx

import React, { useState, useRef } from 'react';
import { Camera, X, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPost, validateWordCount, validateImageSize, validateImageType } from '@/lib/api/postApi';
import { LessonGroup } from '@/types';

interface CreatePostFormProps {
  lessonGroups?: LessonGroup[];
  onPostCreated?: () => void;
}

export default function CreatePostForm({ lessonGroups = [], onPostCreated }: CreatePostFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    lessonGroupId: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'content') {
      const validation = validateWordCount(value);
      setWordCount(validation.count);
      
      if (!validation.valid) {
        setError(`Content exceeds 100 words limit. Current: ${validation.count} words`);
      } else {
        setError('');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateImageType(file)) {
      toast.error('Invalid file type. Please upload JPG, PNG, GIF, or WEBP images.');
      return;
    }

    const sizeValidation = validateImageSize(file);
    if (!sizeValidation.valid) {
      toast.error(`Image size exceeds 5MB limit. Current: ${sizeValidation.sizeInMB}MB`);
      return;
    }

    setImage(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    const validation = validateWordCount(formData.content);
    if (!validation.valid) {
      setError(`Content must be 100 words or less. Current: ${validation.count} words`);
      return;
    }

    try {
      setLoading(true);
      
      await createPost({
        title: formData.title,
        content: formData.content,
        lessonGroupId: formData.lessonGroupId || undefined,
        image: image || undefined,
      });

      toast.success('Post created successfully!');
      
      setFormData({ title: '', content: '', lessonGroupId: '' });
      setImage(null);
      setImagePreview(null);
      setWordCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onPostCreated?.();

    } catch (err: any) {
      setError(err?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.content.trim() && wordCount <= 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
      
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter post title"
            maxLength={100}
            disabled={loading}
          />
        </div>

        {/* Content Textarea */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content *
            </label>
            <span className={`text-sm ${wordCount > 100 ? 'text-red-500' : 'text-gray-500'}`}>
              {wordCount}/100 words
            </span>
          </div>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Share your knowledge with students..."
            disabled={loading}
          />
        </div>

        {/* Lesson Group Select (Optional) */}
        {lessonGroups.length > 0 && (
          <div>
            <label htmlFor="lessonGroupId" className="block text-sm font-medium text-gray-700 mb-2">
              Post to Lesson Group (Optional)
            </label>
            <select
              id="lessonGroupId"
              name="lessonGroupId"
              value={formData.lessonGroupId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="">Public Post (All Students)</option>
              {lessonGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} ({group._count?.members || 0} members)
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Leave empty to post publicly to all students with matching interests
            </p>
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image (Optional)
          </label>
          
          {!imagePreview ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
                id="post-image"
                disabled={loading}
              />
              <label
                htmlFor="post-image"
                className="cursor-pointer flex flex-col items-center"
              >
                <Camera className="w-10 h-10 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Click to upload image</span>
                <span className="text-xs text-gray-500 mt-1">Max 5MB (JPG, PNG, GIF, WEBP)</span>
              </label>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                disabled={loading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Daily Limit Info */}
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            You can create up to 3 posts per day
          </p>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!isFormValid || loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Post...
            </>
          ) : (
            'Create Post'
          )}
        </button>
      </div>
    </div>
  );
}