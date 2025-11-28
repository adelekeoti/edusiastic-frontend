// src/components/profile/tabs/HeadlineTab.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Loader2, Plus, Save, X } from 'lucide-react';
import { updateHeadline, updateTitle, updateSpecializations, getHeadlineSuggestion } from '@/lib/api/profile';
import { TeacherProfile } from '@/lib/api/profile';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HeadlineTabProps {
  profile: TeacherProfile | null;
  onUpdate: () => void;
}

const TITLE_OPTIONS = ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Miss', 'Ms.'];

export default function HeadlineTab({ profile, onUpdate }: HeadlineTabProps) {
  const [saving, setSaving] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [title, setTitle] = useState(profile?.title || '');
  const [specializations, setSpecializations] = useState<string[]>(profile?.specializations || []);
  const [newSpecialization, setNewSpecialization] = useState('');

  const handleGetSuggestion = async () => {
    try {
      setLoadingSuggestion(true);
      const response = await getHeadlineSuggestion();

      if (!response.data) {
      throw new Error('No data received from server');
    }
      setHeadline(response.data.suggestion);
      toast.success('Headline suggestion generated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate suggestion');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleAddSpecialization = () => {
    if (!newSpecialization.trim()) return;
    if (specializations.length >= 5) {
      toast.error('Maximum 5 specializations allowed');
      return;
    }
    if (specializations.includes(newSpecialization.trim())) {
      toast.error('This specialization already exists');
      return;
    }
    setSpecializations([...specializations, newSpecialization.trim()]);
    setNewSpecialization('');
  };

  const handleRemoveSpecialization = (spec: string) => {
    setSpecializations(specializations.filter(s => s !== spec));
  };

  const handleSaveHeadline = async () => {
    if (!headline.trim()) {
      toast.error('Headline is required');
      return;
    }

    try {
      setSaving(true);
      await updateHeadline(headline);
      toast.success('Headline updated successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update headline');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTitle = async () => {
    try {
      setSaving(true);
      await updateTitle(title);
      toast.success('Title updated successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update title');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSpecializations = async () => {
    if (specializations.length === 0) {
      toast.error('Add at least one specialization');
      return;
    }

    try {
      setSaving(true);
      await updateSpecializations(specializations);
      toast.success('Specializations updated successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update specializations');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Title</CardTitle>
          <CardDescription>Select your professional title (optional)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Select value={title} onValueChange={setTitle}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a title" />
                </SelectTrigger>
                <SelectContent>
                  {TITLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveTitle} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Title
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Headline */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Headline</CardTitle>
          <CardDescription>
            A compelling headline that summarizes your expertise (10-150 characters)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input
                id="headline"
                placeholder="e.g., PhD in Mathematics with 9 years of experience"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={150}
              />
              <p className="text-xs text-gray-500">
                {headline.length}/150 characters
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGetSuggestion}
                disabled={loadingSuggestion}
              >
                {loadingSuggestion ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Get AI Suggestion
                  </>
                )}
              </Button>

              <Button onClick={handleSaveHeadline} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Headline
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specializations */}
      <Card>
        <CardHeader>
          <CardTitle>Specializations</CardTitle>
          <CardDescription>
            Add up to 5 areas you specialize in (e.g., Algebra, Calculus)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter a specialization"
                value={newSpecialization}
                onChange={(e) => setNewSpecialization(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                maxLength={50}
              />
              <Button
                type="button"
                onClick={handleAddSpecialization}
                disabled={specializations.length >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {specializations.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {specializations.map((spec, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm py-1 px-3">
                    {spec}
                    <button
                      onClick={() => handleRemoveSpecialization(spec)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <Button onClick={handleSaveSpecializations} disabled={saving || specializations.length === 0}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Specializations
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}