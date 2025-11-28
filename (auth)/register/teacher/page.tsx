// src/app/(auth)/register/teacher/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, GraduationCap, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '@/lib/api/categories';
import { teacherRegistrationSchema, TeacherRegistrationFormData } from '@/lib/validations/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function TeacherRegistrationPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const { registerTeacher, isRegistering } = useAuth();

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  const categories = categoriesData?.data?.categories || [];
  const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<TeacherRegistrationFormData>({
    resolver: zodResolver(teacherRegistrationSchema),
    defaultValues: {
      isAvailableForHomeTutoring: false
    }
  });

  const subcategoryId = watch('subcategoryId');
  const isAvailableForHomeTutoring = watch('isAvailableForHomeTutoring');

  const onSubmit = (data: TeacherRegistrationFormData) => {
    const payload = {
      ...data,
      role: 'TEACHER' as const,
      yearsOfExperience: data.yearsOfExperience ? Number(data.yearsOfExperience) : undefined
    };
    registerTeacher(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/register')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to role selection
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="space-y-3">
            <div className="flex justify-center mb-2">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-10 w-10 text-primary" />
                <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Edusiastic
                </span>
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Teacher Registration</CardTitle>
            <CardDescription className="text-center">
              Join our community of expert teachers and start earning
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      {...register('firstName')}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      {...register('lastName')}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      {...register('password')}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Must contain 8+ characters, uppercase, lowercase, number, and special character
                  </p>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Professional Information</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Select Subject Category *</Label>
                  <Select
                    value={selectedCategoryId}
                    onValueChange={(value) => {
                      setSelectedCategoryId(value);
                      setValue('subcategoryId', ''); // Reset subcategory when category changes
                    }}
                  >
                    <SelectTrigger className={!selectedCategoryId && errors.subcategoryId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCategories ? (
                        <div className="p-2">
                          <LoadingSpinner size="sm" />
                        </div>
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

                {selectedCategoryId && (
                  <div className="space-y-2">
                    <Label htmlFor="subcategoryId">Select Your Expertise *</Label>
                    <Select
                      value={subcategoryId}
                      onValueChange={(value) => setValue('subcategoryId', value)}
                    >
                      <SelectTrigger className={errors.subcategoryId ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Choose your area of expertise" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCategory?.subcategories?.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subcategoryId && (
                      <p className="text-sm text-red-500">{errors.subcategoryId.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience (Optional)</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    max="50"
                    placeholder="e.g., 5"
                    {...register('yearsOfExperience', { valueAsNumber: true })}
                  />
                  {errors.yearsOfExperience && (
                    <p className="text-sm text-red-500">{errors.yearsOfExperience.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications (Optional)</Label>
                  <Textarea
                    id="certifications"
                    placeholder="List your relevant certifications (e.g., B.Ed, PGDE, subject certifications)"
                    rows={3}
                    {...register('certifications')}
                  />
                  <p className="text-xs text-gray-500">
                    You'll be able to upload verification documents after registration
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Professional Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell students about your teaching experience and approach..."
                    rows={4}
                    {...register('bio')}
                    className={errors.bio ? 'border-red-500' : ''}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio.message}</p>
                  )}
                </div>
              </div>

              {/* Home Tutoring Availability */}
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="isAvailableForHomeTutoring"
                    checked={isAvailableForHomeTutoring}
                    onCheckedChange={(checked) =>
                      setValue('isAvailableForHomeTutoring', checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="isAvailableForHomeTutoring" className="cursor-pointer font-semibold">
                      I'm available for home tutoring
                    </Label>
                    <p className="text-sm text-gray-600 mt-1">
                      Check this if you can travel to students' homes to teach. You can update this anytime from your profile.
                    </p>
                  </div>
                </div>
              </div>

              {/* Information Notice */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">📋 What happens next?</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Complete your profile with work experience and education</li>
                  <li>• Upload verification documents (ID, certificates)</li>
                  <li>• Wait for admin approval (usually 24-48 hours)</li>
                  <li>• Start creating products and earning!</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:opacity-90 text-white"
                disabled={isRegistering}
                size="lg"
              >
                {isRegistering ? 'Creating Account...' : 'Create Teacher Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center mt-6 text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}