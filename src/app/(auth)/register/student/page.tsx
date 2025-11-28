// src/app/(auth)/register/student/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, GraduationCap, ArrowLeft, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '@/lib/api/categories';
import { studentRegistrationSchema, StudentRegistrationFormData } from '@/lib/validations/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';

export default function StudentRegistrationPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const { registerStudent, isRegistering } = useAuth();

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  const categories = categoriesData?.data?.categories || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<StudentRegistrationFormData>({
    resolver: zodResolver(studentRegistrationSchema),
    defaultValues: {
      isProfilePublic: true
    }
  });

  const isProfilePublic = watch('isProfilePublic');

  // Update form when subcategories change
  useEffect(() => {
    setValue('subcategoryIds', selectedSubcategories);
  }, [selectedSubcategories, setValue]);

  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories((prev) => {
      if (prev.includes(subcategoryId)) {
        return prev.filter((id) => id !== subcategoryId);
      }
      if (prev.length >= 9) {
        return prev; // Max 9 selections
      }
      return [...prev, subcategoryId];
    });
  };

  const removeSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories((prev) => prev.filter((id) => id !== subcategoryId));
  };

  const onSubmit = (data: StudentRegistrationFormData) => {
    const payload = {
      ...data,
      role: 'STUDENT' as const
    };
    registerStudent(payload);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 py-12 px-4">
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
            <CardTitle className="text-2xl text-center">Student Registration</CardTitle>
            <CardDescription className="text-center">
              Create your account and start learning today
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

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="school">School (Optional)</Label>
                    <Input
                      id="school"
                      placeholder="Your school name"
                      {...register('school')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="class">Class/Grade (Optional)</Label>
                    <Input
                      id="class"
                      placeholder="e.g., SS3, Year 10"
                      {...register('class')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    rows={3}
                    {...register('bio')}
                    className={errors.bio ? 'border-red-500' : ''}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio.message}</p>
                  )}
                </div>
              </div>

              {/* Interests Selection */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Select Your Interests * (1-9)
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose subjects you're interested in learning
                  </p>
                </div>

                {/* Selected Interests */}
                {selectedSubcategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 bg-blue-50 rounded-lg">
                    {selectedSubcategories.map((subcatId) => {
                      const subcategory = categories
                        .flatMap((cat) => cat.subcategories ?? [])
                        .find((sub) => sub?.id === subcatId);
                      return (
                        <Badge
                          key={subcatId}
                          variant="secondary"
                          className="text-sm py-1.5 px-3"
                        >
                          {subcategory?.name}
                          <button
                            type="button"
                            onClick={() => removeSubcategory(subcatId)}
                            className="ml-2 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                    <span className="text-sm text-gray-600 ml-2">
                      {selectedSubcategories.length}/9 selected
                    </span>
                  </div>
                )}

                {/* Categories */}
                {loadingCategories ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-6 max-h-96 overflow-y-auto p-4 border rounded-lg">
                    {categories.map((category) => (
                      <div key={category.id}>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          {category.icon && <span className="mr-2">{category.icon}</span>}
                          {category.name}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {category.subcategories?.map((subcategory) => (
                            <div
                              key={subcategory.id}
                              className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                selectedSubcategories.includes(subcategory.id)
                                  ? 'border-primary bg-blue-50'
                                  : 'border-gray-200 hover:border-primary'
                              }`}
                              //onClick={() => toggleSubcategory(subcategory.id)}
                            >
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={selectedSubcategories.includes(subcategory.id)}
                                  onCheckedChange={() => toggleSubcategory(subcategory.id)}
                                />
                                <span className="text-sm">{subcategory.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {errors.subcategoryIds && (
                  <p className="text-sm text-red-500">{errors.subcategoryIds.message}</p>
                )}
              </div>

              {/* Privacy Setting */}
              <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  id="isProfilePublic"
                  checked={isProfilePublic}
                  onCheckedChange={(checked) =>
                    setValue('isProfilePublic', checked as boolean)
                  }
                />
                <Label htmlFor="isProfilePublic" className="text-sm cursor-pointer">
                  Make my profile public (teachers can view your profile)
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={isRegistering}
                size="lg"
              >
                {isRegistering ? 'Creating Account...' : 'Create Student Account'}
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