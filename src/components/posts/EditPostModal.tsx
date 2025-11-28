// src/components/posts/EditPostModal.tsx

import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { updatePost, validateWordCount, validateImageSize, validateImageType } from '@/lib/api/postApi';
import { Post } from '@/types';

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated?: () => void;
}

export default function EditPostModal({ post, isOpen, onClose, onPostUpdated }: EditPostModalProps) {
  const [formData, setFormData] = useState({
    title: post.title,
    content: post.content,
  });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(post.imageUrl || null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when post changes
  useEffect(() => {
    setFormData({
      title: post.title,
      content: post.content,
    });
    setImagePreview(post.imageUrl || null);
    setImage(null);
    setRemoveExistingImage(false);
    setError('');
    
    const validation = validateWordCount(post.content);
    setWordCount(validation.count);
  }, [post]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setRemoveExistingImage(false);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    setRemoveExistingImage(true);
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
      
      // Only send changed fields
      const updateData: any = {};
      
      if (formData.title !== post.title) {
        updateData.title = formData.title;
      }
      
      if (formData.content !== post.content) {
        updateData.content = formData.content;
      }
      
      if (image) {
        updateData.image = image;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length === 0 && !removeExistingImage) {
        toast.info('No changes made');
        onClose();
        return;
      }

      await updatePost(post.id, updateData);

      toast.success('Post updated successfully!');
      onPostUpdated?.();
      onClose();

    } catch (err: any) {
      setError(err?.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title.trim() && formData.content.trim() && wordCount <= 100;
  const hasChanges = 
    formData.title !== post.title || 
    formData.content !== post.content || 
    image !== null ||
    removeExistingImage;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Edit Post</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="edit-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter post title"
                maxLength={100}
                disabled={loading}
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700">
                  Content *
                </label>
                <span className={`text-sm ${wordCount > 100 ? 'text-red-500' : 'text-gray-500'}`}>
                  {wordCount}/100 words
                </span>
              </div>
              <textarea
                id="edit-content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Share your knowledge with students..."
                disabled={loading}
              />
            </div>

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
                    id="edit-post-image"
                    disabled={loading}
                  />
                  <label
                    htmlFor="edit-post-image"
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
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isFormValid || !hasChanges || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Post'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}