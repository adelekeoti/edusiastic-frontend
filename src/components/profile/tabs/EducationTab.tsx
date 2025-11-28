// src/components/profile/tabs/EducationTab.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { GraduationCap, Edit, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import {
  addEducation,
  getEducation,
  updateEducation,
  deleteEducation,
  Education
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EducationTabProps {
  profile: TeacherProfile | null;
  onUpdate: () => void;
}

const DEGREE_TYPES = [
  { value: 'PHD', label: 'PhD' },
  { value: 'MASTERS', label: "Master's Degree" },
  { value: 'BACHELORS', label: "Bachelor's Degree" },
  { value: 'HND', label: 'Higher National Diploma (HND)' },
  { value: 'NCE', label: 'Nigeria Certificate in Education (NCE)' },
  { value: 'OND', label: 'Ordinary National Diploma (OND)' },
  { value: 'DIPLOMA', label: 'Diploma' },
  { value: 'CERTIFICATE', label: 'Certificate' },
  { value: 'OTHER', label: 'Other' }
];

export default function EducationTab({ profile, onUpdate }: EducationTabProps) {
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEdu, setEditingEdu] = useState<Education | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    degree: '',
    fieldOfStudy: '',
    institution: '',
    graduationYear: new Date().getFullYear(),
    isFeatured: false,
    description: ''
  });

  useEffect(() => {
    loadEducation();
  }, []);

  const loadEducation = async () => {
    try {
      setLoading(true);
      const response = await getEducation();

      if (!response.data) {
      throw new Error('No data received from server');
    }
      setEducationList(response.data.education);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load education');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (edu?: Education) => {
    if (edu) {
      setEditingEdu(edu);
      setFormData({
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        institution: edu.institution,
        graduationYear: edu.graduationYear,
        isFeatured: edu.isFeatured,
        description: edu.description || ''
      });
    } else {
      setEditingEdu(null);
      setFormData({
        degree: '',
        fieldOfStudy: '',
        institution: '',
        graduationYear: new Date().getFullYear(),
        isFeatured: false,
        description: ''
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEdu(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.degree || !formData.fieldOfStudy || !formData.institution) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      if (editingEdu) {
        await updateEducation(editingEdu.id, formData);
        toast.success('Education updated successfully');
      } else {
        await addEducation(formData);
        toast.success('Education added successfully');
      }
      handleCloseDialog();
      loadEducation();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save education');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education record?')) return;

    try {
      await deleteEducation(id);
      toast.success('Education deleted successfully');
      loadEducation();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete education');
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
              <CardTitle>Education</CardTitle>
              <CardDescription>Add your academic qualifications</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Education
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {educationList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No education records added yet</p>
              <Button onClick={() => handleOpenDialog()} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Qualification
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {educationList.map((edu) => (
                <div key={edu.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">
                          {DEGREE_TYPES.find(d => d.value === edu.degree)?.label} in {edu.fieldOfStudy}
                        </h4>
                        {edu.isFeatured && <Badge variant="secondary">Featured</Badge>}
                      </div>
                      <p className="text-gray-600">{edu.institution}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Graduated {edu.graduationYear}
                      </p>
                      {edu.description && (
                        <p className="text-gray-700 mt-2 text-sm">{edu.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(edu)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(edu.id)}
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
              {editingEdu ? 'Edit Education' : 'Add Education'}
            </DialogTitle>
            <DialogDescription>
              Enter details about your academic qualification
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree Type *</Label>
              <Select
                value={formData.degree}
                onValueChange={(value) => setFormData({ ...formData, degree: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select degree type" />
                </SelectTrigger>
                <SelectContent>
                  {DEGREE_TYPES.map((degree) => (
                    <SelectItem key={degree.value} value={degree.value}>
                      {degree.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                <Input
                  id="fieldOfStudy"
                  value={formData.fieldOfStudy}
                  onChange={(e) => setFormData({ ...formData, fieldOfStudy: e.target.value })}
                  placeholder="e.g., Mathematics"
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
              <Label htmlFor="graduationYear">Graduation Year *</Label>
              <Input
                id="graduationYear"
                type="number"
                min="1950"
                max={new Date().getFullYear()}
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details about your studies..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-gray-500">{formData.description.length}/500</p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isFeatured"
                checked={formData.isFeatured}
                onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
              />
              <Label htmlFor="isFeatured">Feature this qualification on my profile</Label>
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
                    {editingEdu ? 'Update' : 'Add'} Education
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