// src/components/profile/tabs/CurrentWorkTab.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { updateCurrentWork } from '@/lib/api/profile';
import { toast } from 'sonner';

export default function CurrentWorkTab({ profile, onUpdate }: any) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    currentWorkplace: profile?.currentWorkplace || '',
    currentPosition: profile?.currentPosition || '',
    isCurrentlyWorking: profile?.isCurrentlyWorking || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateCurrentWork(formData);
      toast.success('Current work updated successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Current Work</CardTitle><CardDescription>Update your current employment status</CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2 p-4 border rounded-lg">
            <Switch checked={formData.isCurrentlyWorking} onCheckedChange={(checked) => setFormData({ ...formData, isCurrentlyWorking: checked })} />
            <Label>I am currently working</Label>
          </div>
          {formData.isCurrentlyWorking && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Current Workplace</Label><Input value={formData.currentWorkplace} onChange={(e) => setFormData({ ...formData, currentWorkplace: e.target.value })} placeholder="e.g., University of Lagos" /></div>
              <div className="space-y-2"><Label>Current Position</Label><Input value={formData.currentPosition} onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })} placeholder="e.g., Senior Lecturer" /></div>
            </div>
          )}
          <Button type="submit" disabled={saving} className="w-full">{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Changes</>}</Button>
        </form>
      </CardContent>
    </Card>
  );
}