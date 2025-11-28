// src/components/profile/tabs/ExpertiseTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2, Save } from 'lucide-react';
import { getAllCategories, updateTeacherExpertise } from '@/lib/api/categories';
import { Category, Subcategory } from '@/types';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ExpertiseTabProps {
  profile: any;
  onUpdate: () => void;
}

export default function ExpertiseTab({ profile, onUpdate }: ExpertiseTabProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    // Set initial values from profile
    if (profile?.teacherExpertise?.subcategory) {
      setSelectedSubcategoryId(profile.teacherExpertise.subcategory.id);
      setSelectedCategoryId(profile.teacherExpertise.subcategory.categoryId);
    }
  }, [profile]);

  useEffect(() => {
    // Update subcategories when category changes
    if (selectedCategoryId) {
      const category = categories.find(c => c.id === selectedCategoryId);
      setSubcategories(category?.subcategories || []);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId, categories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await getAllCategories();
      if (!response.data) {
        throw new Error('No data received from server');
      }
      setCategories(response.data.categories || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSubcategoryId) {
      toast.error('Please select your area of expertise');
      return;
    }

    try {
      setSaving(true);
      await updateTeacherExpertise(selectedSubcategoryId);
      toast.success('Expertise updated successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update expertise');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Teaching Expertise
        </CardTitle>
        <CardDescription>
          Select your primary area of teaching expertise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Expertise Display */}
          {profile?.teacherExpertise?.subcategory && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-1">Current Expertise:</p>
              <p className="font-semibold text-gray-900">
                {profile.teacherExpertise.subcategory.category?.name} - {profile.teacherExpertise.subcategory.name}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={selectedCategoryId} 
              onValueChange={(value) => {
                setSelectedCategoryId(value);
                setSelectedSubcategoryId(''); // Reset subcategory when category changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcategory">Subject/Expertise *</Label>
            <Select
              value={selectedSubcategoryId}
              onValueChange={setSelectedSubcategoryId}
              disabled={!selectedCategoryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your expertise" />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((subcategory) => (
                  <SelectItem key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedCategoryId && (
              <p className="text-xs text-gray-500">Please select a category first</p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your primary expertise determines how students discover you on the platform. 
              Choose the subject you're most qualified to teach.
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={saving || !selectedSubcategoryId} 
            className="w-full"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Expertise
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}