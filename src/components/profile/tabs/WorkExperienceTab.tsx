// src/components/profile/tabs/WorkExperienceTab.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Briefcase, Edit, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import {
  addWorkExperience,
  getWorkExperiences,
  updateWorkExperience,
  deleteWorkExperience,
  WorkExperience
} from '@/lib/api/profile';
import { TeacherProfile } from '@/lib/api/profile';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface WorkExperienceTabProps {
  profile: TeacherProfile | null;
  onUpdate: () => void;
}

export default function WorkExperienceTab({ profile, onUpdate }: WorkExperienceTabProps) {
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<WorkExperience | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    institution: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const response = await getWorkExperiences();

      if (!response.data) {
      throw new Error('No data received from server');
    }
      setExperiences(response.data.workExperiences);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load work experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (exp?: WorkExperience) => {
    if (exp) {
      setEditingExp(exp);
      setFormData({
        institution: exp.institution,
        position: exp.position,
        description: exp.description || '',
        startDate: exp.startDate.split('T')[0],
        endDate: exp.endDate ? exp.endDate.split('T')[0] : '',
        isCurrent: exp.isCurrent
      });
    } else {
      setEditingExp(null);
      setFormData({
        institution: '',
        position: '',
        description: '',
        startDate: '',
        endDate: '',
        isCurrent: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingExp(null);
    setFormData({
      institution: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.institution || !formData.position || !formData.startDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      if (editingExp) {
        await updateWorkExperience(editingExp.id, {
          ...formData,
          endDate: formData.isCurrent ? undefined : formData.endDate || undefined
        });
        toast.success('Work experience updated successfully');
      } else {
        await addWorkExperience({
          ...formData,
          endDate: formData.isCurrent ? undefined : formData.endDate || undefined
        });
        toast.success('Work experience added successfully');
      }
      handleCloseDialog();
      loadExperiences();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save work experience');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work experience?')) return;

    try {
      await deleteWorkExperience(id);
      toast.success('Work experience deleted successfully');
      loadExperiences();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete work experience');
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Work Experience</CardTitle>
              <CardDescription>Add your professional work history</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No work experience added yet</p>
              <Button onClick={() => handleOpenDialog()} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Experience
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                        {exp.isCurrent && <Badge>Current</Badge>}
                      </div>
                      <p className="text-gray-600">{exp.institution}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        {' - '}
                        {exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                      </p>
                      {exp.description && (
                        <p className="text-gray-700 mt-2 text-sm">{exp.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(exp)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(exp.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExp ? 'Edit Work Experience' : 'Add Work Experience'}
            </DialogTitle>
            <DialogDescription>
              Enter details about your professional experience
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="e.g., Mathematics Teacher"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institution *</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="e.g., University of Lagos"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your responsibilities and achievements..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500">{formData.description.length}/1000</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  disabled={formData.isCurrent}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isCurrent"
                checked={formData.isCurrent}
                onCheckedChange={(checked) => setFormData({ ...formData, isCurrent: checked, endDate: checked ? '' : formData.endDate })}
              />
              <Label htmlFor="isCurrent">I currently work here</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {editingExp ? 'Update' : 'Add'} Experience
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}