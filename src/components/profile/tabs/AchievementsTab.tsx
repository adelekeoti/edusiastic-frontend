// src/components/profile/tabs/AchievementsTab.tsx
'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Loader2, Plus, Save, X } from 'lucide-react';
import { updateAchievements, updateLanguages } from '@/lib/api/profile';
import { toast } from 'sonner';

export default function AchievementsTab({ profile, onUpdate }: any) {
  const [savingAch, setSavingAch] = useState(false);
  const [savingLang, setSavingLang] = useState(false);
  const [achievements, setAchievements] = useState<string[]>(profile?.achievements || []);
  const [languages, setLanguages] = useState<string[]>(profile?.languagesSpoken || []);
  const [newAch, setNewAch] = useState('');
  const [newLang, setNewLang] = useState('');

  const handleSaveAchievements = async () => {
    if (achievements.length === 0) return toast.error('Add at least one achievement');
    try {
      setSavingAch(true);
      await updateAchievements(achievements);
      toast.success('Achievements updated');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSavingAch(false);
    }
  };

  const handleSaveLanguages = async () => {
    if (languages.length === 0) return toast.error('Add at least one language');
    try {
      setSavingLang(true);
      await updateLanguages(languages);
      toast.success('Languages updated');
      onUpdate();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSavingLang(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Achievements</CardTitle><CardDescription>Add up to 10 professional achievements</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={newAch} onChange={(e) => setNewAch(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), achievements.length < 10 && newAch.trim() && (setAchievements([...achievements, newAch.trim()]), setNewAch('')))} placeholder="Enter an achievement" maxLength={200} />
            <Button type="button" onClick={() => { if (achievements.length < 10 && newAch.trim()) { setAchievements([...achievements, newAch.trim()]); setNewAch(''); } }} disabled={achievements.length >= 10}><Plus className="h-4 w-4" /></Button>
          </div>
          {achievements.length > 0 && (
            <div className="space-y-2">
              {achievements.map((ach, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="flex-1 text-sm">{ach}</span>
                  <button onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))} className="text-red-600 hover:text-red-800"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
          <Button onClick={handleSaveAchievements} disabled={savingAch || achievements.length === 0} className="w-full">{savingAch ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Achievements</>}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Languages</CardTitle><CardDescription>Add up to 10 languages you speak</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={newLang} onChange={(e) => setNewLang(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), languages.length < 10 && newLang.trim() && (setLanguages([...languages, newLang.trim()]), setNewLang('')))} placeholder="Enter a language" maxLength={50} />
            <Button type="button" onClick={() => { if (languages.length < 10 && newLang.trim()) { setLanguages([...languages, newLang.trim()]); setNewLang(''); } }} disabled={languages.length >= 10}><Plus className="h-4 w-4" /></Button>
          </div>
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {languages.map((lang, idx) => (
                <Badge key={idx} variant="outline" className="text-sm py-1 px-3">{lang}<button onClick={() => setLanguages(languages.filter((_, i) => i !== idx))} className="ml-2 hover:text-red-600"><X className="h-3 w-3" /></button></Badge>
              ))}
            </div>
          )}
          <Button onClick={handleSaveLanguages} disabled={savingLang || languages.length === 0} className="w-full">{savingLang ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Languages</>}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
