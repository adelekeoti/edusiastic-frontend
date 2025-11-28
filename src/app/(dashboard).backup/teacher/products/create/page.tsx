// src/app/(dashboard)/teacher/products/create/page.tsx

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Upload, X, AlertCircle } from 'lucide-react';
import { useCreateProduct } from '@/lib/hooks/useProducts';
import { getAllCategories } from '@/lib/api/categories';
import { ProductType, SubscriptionDuration, HomeTutoringPricingType } from '@/types';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const productSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  type: z.enum(['SUBSCRIPTION', 'PDF', 'HOME_TUTORING']),
  price: z.number().min(100, 'Price must be at least ₦100').max(1000000),
  subcategoryId: z.string().min(1, 'Please select a category'),
  
  // Subscription fields
  duration: z.string().optional(),
  autoRenewal: z.boolean().optional(),
  meetingLink: z.string().url().optional().or(z.literal('')),
  
  // Home tutoring fields
  coverageAreas: z.array(z.string()).optional(),
  pricingType: z.string().optional(),
  hourlyRate: z.number().optional(),
  sessionsPerWeek: z.number().optional(),
  sessionDuration: z.number().optional(),
  minimumCommitment: z.number().optional(),
  transportFee: z.number().optional(),
  subjects: z.array(z.string()).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const createProductMutation = useCreateProduct();
  
  const [selectedType, setSelectedType] = useState<ProductType>(ProductType.SUBSCRIPTION);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverageAreas, setCoverageAreas] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newArea, setNewArea] = useState('');
  const [newSubject, setNewSubject] = useState('');

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  const categories = categoriesData?.data?.categories || [];
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      type: ProductType.SUBSCRIPTION,
      autoRenewal: false
    }
  });

  const watchType = watch('type');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 2) {
      alert('Maximum 2 images allowed');
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert('PDF file size must be less than 50MB');
        return;
      }
      setPdfFile(file);
    }
  };

  const addCoverageArea = () => {
    if (newArea.trim() && !coverageAreas.includes(newArea.trim())) {
      setCoverageAreas(prev => [...prev, newArea.trim()]);
      setNewArea('');
    }
  };

  const removeCoverageArea = (area: string) => {
    setCoverageAreas(prev => prev.filter(a => a !== area));
  };

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects(prev => [...prev, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const removeSubject = (subject: string) => {
    setSubjects(prev => prev.filter(s => s !== subject));
  };

  const onSubmit = (data: ProductFormData) => {
    // Validation
    if (images.length === 0) {
      alert('Please upload at least one product image');
      return;
    }

    if (data.type === 'PDF' && !pdfFile) {
      alert('Please upload a PDF file');
      return;
    }

    if (data.type === 'HOME_TUTORING' && coverageAreas.length === 0) {
      alert('Please add at least one coverage area');
      return;
    }

    // Build FormData
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('type', data.type);
    formData.append('price', data.price.toString());
    formData.append('subcategoryId', data.subcategoryId);

    // Add images
    images.forEach(image => {
      formData.append('images', image);
    });

    // Type-specific fields
    if (data.type === 'SUBSCRIPTION') {
      if (data.duration) formData.append('duration', data.duration);
      formData.append('autoRenewal', data.autoRenewal?.toString() || 'false');
      if (data.meetingLink) formData.append('meetingLink', data.meetingLink);
    }

    if (data.type === 'PDF' && pdfFile) {
      formData.append('pdfFile', pdfFile);
    }

    if (data.type === 'HOME_TUTORING') {
      formData.append('coverageAreas', JSON.stringify(coverageAreas));
      if (data.pricingType) formData.append('pricingType', data.pricingType);
      if (data.hourlyRate) formData.append('hourlyRate', data.hourlyRate.toString());
      if (data.sessionsPerWeek) formData.append('sessionsPerWeek', data.sessionsPerWeek.toString());
      if (data.sessionDuration) formData.append('sessionDuration', data.sessionDuration.toString());
      if (data.minimumCommitment) formData.append('minimumCommitment', data.minimumCommitment.toString());
      if (data.transportFee !== undefined) formData.append('transportFee', data.transportFee.toString());
      if (subjects.length > 0) formData.append('subjects', JSON.stringify(subjects));
      if (data.meetingLink) formData.append('meetingLink', data.meetingLink);
    }

    createProductMutation.mutate(formData);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Product</h1>
            <p className="text-gray-600 mt-1">
              Add a new product to your catalog
            </p>
          </div>
        </div>

        {/* Info Alert */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-start gap-4 pt-6">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">Product Review</h3>
              <p className="text-sm text-gray-600 mt-1">
                All products are reviewed by our admin team before being published. This usually takes 24-48 hours.
              </p>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Tell students about your product</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Complete Mathematics for SS3"
                  {...register('title')}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn..."
                  rows={5}
                  {...register('description')}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Product Type */}
              <div className="space-y-2">
                <Label>Product Type *</Label>
                <Select
                  value={watchType}
                  onValueChange={(value) => {
                    setValue('type', value as ProductType);
                    setSelectedType(value as ProductType);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUBSCRIPTION">Subscription (Online Classes)</SelectItem>
                    <SelectItem value="PDF">PDF Resource</SelectItem>
                    <SelectItem value="HOME_TUTORING">Home Tutoring</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label htmlFor="price">Price (₦) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="100"
                  placeholder="5000"
                  {...register('price', { valueAsNumber: true })}
                  className={errors.price ? 'border-red-500' : ''}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
              <CardDescription>Choose the subject area</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingCategories ? (
                      <div className="p-2"><LoadingSpinner size="sm" /></div>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory */}
              {selectedCategoryId && (
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Select
                    onValueChange={(value) => setValue('subcategoryId', value)}
                  >
                    <SelectTrigger className={errors.subcategoryId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCategory?.subcategories?.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subcategoryId && (
                    <p className="text-sm text-red-500">{errors.subcategoryId.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images *</CardTitle>
              <CardDescription>Upload 1-2 images (Max 2MB each)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {images.length < 2 && (
                <div>
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload image</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      onChange={handleImageChange}
                      className="hidden"
                      multiple
                    />
                  </label>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Specific Fields */}
          {watchType === 'SUBSCRIPTION' && (
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Configure your subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Duration */}
                  <div className="space-y-2">
                    <Label>Duration *</Label>
                    <Select onValueChange={(value) => setValue('duration', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DAILY">Daily</SelectItem>
                        <SelectItem value="WEEKLY">Weekly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Meeting Link */}
                  <div className="space-y-2">
                    <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                    <Input
                      id="meetingLink"
                      type="url"
                      placeholder="https://zoom.us/j/..."
                      {...register('meetingLink')}
                    />
                  </div>
                </div>

                {/* Auto Renewal */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoRenewal"
                    onCheckedChange={(checked) => setValue('autoRenewal', checked as boolean)}
                  />
                  <Label htmlFor="autoRenewal" className="font-normal cursor-pointer">
                    Enable auto-renewal
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PDF Specific Fields */}
          {watchType === 'PDF' && (
            <Card>
              <CardHeader>
                <CardTitle>PDF File *</CardTitle>
                <CardDescription>Upload your PDF resource (Max 50MB)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {pdfFile ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{pdfFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPdfFile(null)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload PDF</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfChange}
                      className="hidden"
                    />
                  </label>
                )}
              </CardContent>
            </Card>
          )}

          {/* Home Tutoring Specific Fields */}
          {watchType === 'HOME_TUTORING' && (
            <Card>
              <CardHeader>
                <CardTitle>Home Tutoring Details</CardTitle>
                <CardDescription>Configure your tutoring service</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coverage Areas */}
                <div className="space-y-2">
                  <Label>Coverage Areas *</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Ikeja, Lagos"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCoverageArea())}
                    />
                    <Button type="button" onClick={addCoverageArea}>Add</Button>
                  </div>
                  {coverageAreas.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {coverageAreas.map((area) => (
                        <span
                          key={area}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
                        >
                          {area}
                          <button
                            type="button"
                            onClick={() => removeCoverageArea(area)}
                            className="hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing Type & Rate */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pricing Type *</Label>
                    <Select onValueChange={(value) => setValue('pricingType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOURLY">Hourly Rate</SelectItem>
                        <SelectItem value="MONTHLY">Monthly Package</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Rate (₦)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      placeholder="2000"
                      {...register('hourlyRate', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                {/* Sessions & Duration */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionsPerWeek">Sessions per Week</Label>
                    <Input
                      id="sessionsPerWeek"
                      type="number"
                      min="1"
                      max="7"
                      placeholder="3"
                      {...register('sessionsPerWeek', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sessionDuration">Session Duration (minutes)</Label>
                    <Select onValueChange={(value) => setValue('sessionDuration', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Transport Fee */}
                <div className="space-y-2">
                  <Label htmlFor="transportFee">Transport Fee (₦)</Label>
                  <Input
                    id="transportFee"
                    type="number"
                    min="0"
                    placeholder="1000"
                    {...register('transportFee', { valueAsNumber: true })}
                  />
                </div>

                {/* Subjects */}
                <div className="space-y-2">
                  <Label>Subjects (Optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Algebra"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
                    />
                    <Button type="button" onClick={addSubject}>Add</Button>
                  </div>
                  {subjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {subjects.map((subject) => (
                        <span
                          key={subject}
                          className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm flex items-center gap-2"
                        >
                          {subject}
                          <button
                            type="button"
                            onClick={() => removeSubject(subject)}
                            className="hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProductMutation.isPending}
            >
              {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}