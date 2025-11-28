// src/app/(dashboard)/parent/profile/edit/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/lib/store/authStore';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getParentProfile,
  updateParentProfile,
  uploadParentProfilePicture,
  updateParentInterests,
  addChild,
  updateChild,
  deleteChild,
  Child
} from '@/lib/api/parentProfile';
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
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Users
} from 'lucide-react';
import Link from 'next/link';

const profileSchema = z.object({
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional(),
  learningPreference: z.enum(['ONLINE', 'PHYSICAL', 'BOTH']).optional(),
  isProfilePublic: z.boolean()
});

const childSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  class: z.string().min(1, 'Class is required'),
  studentId: z.string().optional()
});

type ProfileFormData = z.infer<typeof profileSchema>;
type ChildFormData = z.infer<typeof childSchema>;

export default function EditParentProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [editingChild, setEditingChild] = useState<{ id: string; data: ChildFormData } | null>(null);
  const [newChild, setNewChild] = useState<ChildFormData>({ name: '', class: '', studentId: '' });
  const [showAddChild, setShowAddChild] = useState(false);

  // Fetch profile
  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ['parent-profile'],
    queryFn: getParentProfile,
    enabled: !!user && user.role === 'PARENT'
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
      setValue('learningPreference', profile.learningPreference as any);
      setValue('isProfilePublic', profile.isProfilePublic);
      setImagePreview(profile.profileImage || null);
      setSelectedSubcategories(profile.interests.map(i => i.subcategoryId));
      setChildren(profile.children);
    }
  }, [profile, setValue]);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: updateParentProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-profile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const updateInterestsMutation = useMutation({
    mutationFn: updateParentInterests,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-profile'] });
      toast.success('Interests updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update interests');
    }
  });

  const uploadImageMutation = useMutation({
    mutationFn: uploadParentProfilePicture,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-profile'] });
      toast.success('Profile picture updated successfully');
      setProfileImage(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    }
  });

  const addChildMutation = useMutation({
    mutationFn: addChild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-profile'] });
      toast.success('Child added successfully');
      setNewChild({ name: '', class: '', studentId: '' });
      setShowAddChild(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add child');
    }
  });

  const updateChildMutation = useMutation({
    mutationFn: ({ childId, data }: { childId: string; data: any }) => 
      updateChild(childId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-profile'] });
      toast.success('Child updated successfully');
      setEditingChild(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update child');
    }
  });

  const deleteChildMutation = useMutation({
    mutationFn: deleteChild,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-profile'] });
      toast.success('Child removed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove child');
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

  const handleAddChild = async () => {
    if (!newChild.name || !newChild.class) {
      toast.error('Please fill in all required fields');
      return;
    }
    await addChildMutation.mutateAsync({
      name: newChild.name,
      class: newChild.class,
      studentId: newChild.studentId || undefined
    });
  };

  const handleUpdateChild = async (childId: string) => {
    if (!editingChild) return;
    await updateChildMutation.mutateAsync({
      childId,
      data: editingChild.data
    });
  };

  const handleDeleteChild = async (childId: string) => {
    if (!confirm('Are you sure you want to remove this child?')) return;
    await deleteChildMutation.mutateAsync(childId);
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

      router.push('/parent/profile');
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
            <Link href="/parent/profile">
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

              {/* Learning Preference */}
              <div className="space-y-2">
                <Label htmlFor="learningPreference">Learning Preference</Label>
                <select
                  id="learningPreference"
                  {...register('learningPreference')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select preference</option>
                  <option value="ONLINE">Online Learning</option>
                  <option value="PHYSICAL">Physical Classes</option>
                  <option value="BOTH">Both Online & Physical</option>
                </select>
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

          {/* Children Management Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    My Children
                  </CardTitle>
                  <CardDescription>
                    Manage your children's information
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddChild(!showAddChild)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Child
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Child Form */}
              {showAddChild && (
                <div className="p-4 border rounded-lg bg-blue-50 space-y-3">
                  <h4 className="font-semibold text-gray-900">Add New Child</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="newChildName">Name *</Label>
                      <Input
                        id="newChildName"
                        value={newChild.name}
                        onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                        placeholder="Child's name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newChildClass">Class *</Label>
                      <Input
                        id="newChildClass"
                        value={newChild.class}
                        onChange={(e) => setNewChild({ ...newChild, class: e.target.value })}
                        placeholder="e.g., Grade 5"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="newChildStudentId">Student Account ID (Optional)</Label>
                    <Input
                      id="newChildStudentId"
                      value={newChild.studentId}
                      onChange={(e) => setNewChild({ ...newChild, studentId: e.target.value })}
                      placeholder="Link existing student account"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddChild}
                      disabled={addChildMutation.isPending}
                    >
                      {addChildMutation.isPending ? 'Adding...' : 'Add Child'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowAddChild(false);
                        setNewChild({ name: '', class: '', studentId: '' });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Existing Children */}
              {children.length === 0 ? (
                <p className="text-center text-gray-500 py-4">No children added yet</p>
              ) : (
                <div className="space-y-3">
                  {children.map((child) => (
                    <div key={child.id} className="p-4 border rounded-lg">
                      {editingChild?.id === child.id ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <Label>Name</Label>
                              <Input
                                value={editingChild.data.name}
                                onChange={(e) =>
                                  setEditingChild({
                                    ...editingChild,
                                    data: { ...editingChild.data, name: e.target.value }
                                  })
                                }
                              />
                            </div>
                            <div>
                              <Label>Class</Label>
                              <Input
                                value={editingChild.data.class}
                                onChange={(e) =>
                                  setEditingChild({
                                    ...editingChild,
                                    data: { ...editingChild.data, class: e.target.value }
                                  })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => handleUpdateChild(child.id)}
                              disabled={updateChildMutation.isPending}
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingChild(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{child.name}</p>
                            <p className="text-sm text-gray-600">Class: {child.class}</p>
                            {child.linkedStudent && (
                              <Badge variant="secondary" className="text-xs mt-1">
                                Linked Account
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setEditingChild({
                                  id: child.id,
                                  data: {
                                    name: child.name,
                                    class: child.class,
                                    studentId: child.studentId
                                  }
                                })
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteChild(child.id)}
                              disabled={deleteChildMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interests Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Subject Interests (1-9)
                  </CardTitle>
                  <CardDescription>
                    Select subjects you're interested in for your children
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
            <Link href="/parent/profile">
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