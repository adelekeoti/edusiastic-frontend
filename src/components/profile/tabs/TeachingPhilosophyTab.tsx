// src/components/profile/tabs/TeachingPhilosophyTab.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save } from 'lucide-react';
import { updateTeachingPhilosophy } from '@/lib/api/profile';
import { toast } from 'sonner';

export default function TeachingPhilosophyTab({ profile, onUpdate }: any) {
  const [saving, setSaving] = useState(false);
  const [philosophy, setPhilosophy] = useState(profile?.teachingPhilosophy || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (philosophy.length < 50) return toast.error('Teaching philosophy must be at least 50 characters');
    try {
      setSaving(true);
      await updateTeachingPhilosophy(philosophy);
      toast.success('Teaching philosophy updated successfully');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Teaching Philosophy</CardTitle><CardDescription>Share your approach to teaching (50-1000 characters)</CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="philosophy">Your Teaching Philosophy</Label>
            <Textarea id="philosophy" value={philosophy} onChange={(e) => setPhilosophy(e.target.value)} placeholder="Describe your teaching approach, methods, and beliefs..." rows={8} maxLength={1000} />
            <p className="text-xs text-gray-500">{philosophy.length}/1000 characters {philosophy.length < 50 && `(${50 - philosophy.length} more required)`}</p>
          </div>
          <Button type="submit" disabled={saving || philosophy.length < 50} className="w-full">{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Teaching Philosophy</>}</Button>
        </form>
      </CardContent>
    </Card>
  );
}