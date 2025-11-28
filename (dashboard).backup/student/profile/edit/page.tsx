// src/app/(dashboard)/student/profile/edit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadStudentProfilePicture,
  updateStudentInterests
} from '@/lib/api/studentProfile';
import { getAllCategories } from '@/lib/api/categories';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Camera, 
  X, 
  Save,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

const profileSchema = z.object({
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  school: z.string().max(100, 'School name cannot exceed 100 characters').optional(),
  class: z.string().max(50, 'Class cannot exceed 50 characters').optional(),
  isProfilePublic: z.boolean()
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function EditStudentProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch profile
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ['student-profile'],
    queryFn: getStudentProfile,
    enabled: !!user && user.role === 'STUDENT'
  });

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  const profile = profileData?.data?.profile;
  const categories = categoriesData?.data?.categories || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  const isProfilePublic = watch('isProfilePublic');

  // Set form values when profile loads
  useEffect(() => {
    if (profile) {
      setValue('bio', profile.bio || '');
      setValue('school', profile.school || '');
      setValue('class', profile.class || '');
      setValue('isProfilePublic', profile.isProfilePublic);
      setImagePreview(profile.profileImage || null);
      setSelectedSubcategories(profile.interests.map(i => i.subcategoryId));
    }
  }, [profile, setValue]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: updateStudentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  // Update interests mutation
  const updateInterestsMutation = useMutation({
    mutationFn: updateStudentInterests,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Interests updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update interests');
    }
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: uploadStudentProfilePicture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success('Profile picture updated successfully');
      setProfileImage(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories((prev) => {
      if (prev.includes(subcategoryId)) {
        return prev.filter((id) => id !== subcategoryId);
      }
      if (prev.length >= 9) {
        toast.error('You can select up to 9 interests only');
        return prev;
      }
      return [...prev, subcategoryId];
    });
  };

  const removeSubcategory = (subcategoryId: string) => {
    setSelectedSubcategories((prev) => prev.filter((id) => id !== subcategoryId));
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Update basic profile
      await updateProfileMutation.mutateAsync(data);

      // Update interests if changed
      const currentInterests = profile?.interests.map(i => i.subcategoryId).sort() || [];
      const newInterests = selectedSubcategories.sort();
      
      if (JSON.stringify(currentInterests) !== JSON.stringify(newInterests)) {
        if (selectedSubcategories.length === 0) {
          toast.error('Please select at least 1 interest');
          return;
        }
        await updateInterestsMutation.mutateAsync(selectedSubcategories);
      }

      // Upload profile image if changed
      if (profileImage) {
        await uploadImageMutation.mutateAsync(profileImage);
      }

      router.push('/student/profile');
    } catch (error) {
      // Error handling done in mutations
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loadingProfile || loadingCategories) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </DashboardLayout>
    );
  }

  const isSaving = 
    updateProfileMutation.isPending || 
    updateInterestsMutation.isPending || 
    uploadImageMutation.isPending;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/student/profile">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600 mt-1">Update your profile information</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a profile picture (max 5MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-32 w-32 border-4 border-primary/10">
                  <AvatarImage src={imagePreview || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(profile.firstName, profile.lastName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageChange}
                    className="hidden"
                    id="profile-image"
                  />
                  <label htmlFor="profile-image">
                    <Button type="button" variant="outline" asChild>
                      <span className="cursor-pointer">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Picture
                      </span>
                    </Button>
                  </label>
                  {profileImage && (
                    <p className="text-sm text-green-600">New image selected</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Accepted: JPG, JPEG, PNG (max 5MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  rows={4}
                  {...register('bio')}
                  className={errors.bio ? 'border-red-500' : ''}
                />
                {errors.bio && (
                  <p className="text-sm text-red-500">{errors.bio.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  {watch('bio')?.length || 0}/500 characters
                </p>
              </div>

              {/* School */}
              <div className="space-y-2">
                <Label htmlFor="school">School (Optional)</Label>
                <Input
                  id="school"
                  placeholder="Your school name"
                  {...register('school')}
                  className={errors.school ? 'border-red-500' : ''}
                />
                {errors.school && (
                  <p className="text-sm text-red-500">{errors.school.message}</p>
                )}
              </div>

              {/* Class */}
              <div className="space-y-2">
                <Label htmlFor="class">Class/Grade (Optional)</Label>
                <Input
                  id="class"
                  placeholder="e.g., SS3, Year 10"
                  {...register('class')}
                  className={errors.class ? 'border-red-500' : ''}
                />
                {errors.class && (
                  <p className="text-sm text-red-500">{errors.class.message}</p>
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
            </CardContent>
          </Card>

          {/* Interests Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    My Interests (1-9)
                  </CardTitle>
                  <CardDescription>
                    Select subjects you're interested in learning
                  </CardDescription>
                </div>
                <Badge variant="outline">
                  {selectedSubcategories.length}/9 selected
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                </div>
              )}

              {/* Categories */}
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
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/student/profile">
              <Button type="button" variant="outline" disabled={isSaving}>
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}