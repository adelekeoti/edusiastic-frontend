// src/app/(auth)/register/parent/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, GraduationCap, ArrowLeft, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getAllCategories } from '@/lib/api/categories';
import { parentRegistrationSchema, ParentRegistrationFormData } from '@/lib/validations/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Badge } from '@/components/ui/badge';

export default function ParentRegistrationPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const { registerParent, isRegistering } = useAuth();

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  const categories = categoriesData?.data?.categories || [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch
  } = useForm<ParentRegistrationFormData>({
    resolver: zodResolver(parentRegistrationSchema),
    defaultValues: {
      children: [{ name: '', class: '', studentId: '' }],
      learningPreference: undefined
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'children'
  });

  const learningPreference = watch('learningPreference');

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

  const onSubmit = (data: ParentRegistrationFormData) => {
    const payload = {
      ...data,
      role: 'PARENT' as const,
      children: data.children.map(child => ({
        name: child.name,
        class: child.class,
        studentId: child.studentId || undefined
      }))
    };
    registerParent(payload);
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
            <CardTitle className="text-2xl text-center">Parent Registration</CardTitle>
            <CardDescription className="text-center">
              Monitor your children's learning and connect with expert teachers
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

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    rows={3}
                    {...register('bio')}
                  />
                </div>
              </div>

              {/* Children Information */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Children Information *</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: '', class: '', studentId: '' })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Child
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 bg-gray-50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">Child {index + 1}</h4>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`children.${index}.name`}>Child's Name *</Label>
                          <Input
                            id={`children.${index}.name`}
                            placeholder="e.g., Sarah"
                            {...register(`children.${index}.name` as const)}
                            className={errors.children?.[index]?.name ? 'border-red-500' : ''}
                          />
                          {errors.children?.[index]?.name && (
                            <p className="text-sm text-red-500">
                              {errors.children[index]?.name?.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`children.${index}.class`}>Class/Grade *</Label>
                          <Input
                            id={`children.${index}.class`}
                            placeholder="e.g., Primary 5"
                            {...register(`children.${index}.class` as const)}
                            className={errors.children?.[index]?.class ? 'border-red-500' : ''}
                          />
                          {errors.children?.[index]?.class && (
                            <p className="text-sm text-red-500">
                              {errors.children[index]?.class?.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`children.${index}.studentId`}>
                          Link Existing Student Account (Optional)
                        </Label>
                        <Input
                          id={`children.${index}.studentId`}
                          placeholder="Enter student account ID if they have one"
                          {...register(`children.${index}.studentId` as const)}
                        />
                        <p className="text-xs text-gray-500">
                          If your child already has a student account, enter their account ID to link it
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}

                {errors.children && typeof errors.children === 'object' && 'message' in errors.children && (
                  <p className="text-sm text-red-500">{errors.children.message as string}</p>
                )}
              </div>

              {/* Learning Preference */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Learning Preference *</h3>
                <Select
                  value={learningPreference}
                  onValueChange={(value) => setValue('learningPreference', value as any)}
                >
                  <SelectTrigger className={errors.learningPreference ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Choose your preferred learning mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online Classes Only</SelectItem>
                    <SelectItem value="PHYSICAL">Physical/Home Tutoring Only</SelectItem>
                    <SelectItem value="BOTH">Both Online & Physical</SelectItem>
                  </SelectContent>
                </Select>
                {errors.learningPreference && (
                  <p className="text-sm text-red-500">{errors.learningPreference.message}</p>
                )}
              </div>

              {/* Subject Interests */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Select Subject Interests * (1-9)
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose subjects you want your children to learn
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

              {/* Information Notice */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">👨‍👩‍👧‍👦 Parent Features</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Browse and purchase courses for your children</li>
                  <li>• Connect with teachers directly</li>
                  <li>• Monitor your children's progress</li>
                  <li>• Manage subscriptions and payments</li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={isRegistering}
                size="lg"
              >
                {isRegistering ? 'Creating Account...' : 'Create Parent Account'}
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