// src/components/profile/tabs/CertificationsTab.tsx
'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Edit, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { addCertification, getCertifications, updateCertification, deleteCertification, ProfileCertification } from '@/lib/api/profile';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function CertificationsTab({ profile, onUpdate }: any) {
  const [certifications, setCertifications] = useState<ProfileCertification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<ProfileCertification | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '', description: ''
  });

  useEffect(() => { loadCertifications(); }, []);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const response = await getCertifications();
      if (!response.data) {
      throw new Error('No data received from server');
    }
      setCertifications(response.data.certifications);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load certifications');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (cert?: ProfileCertification) => {
    if (cert) {
      setEditingCert(cert);
      setFormData({
        name: cert.name, issuingOrganization: cert.issuingOrganization,
        issueDate: cert.issueDate.split('T')[0], expiryDate: cert.expiryDate ? cert.expiryDate.split('T')[0] : '',
        credentialId: cert.credentialId || '', credentialUrl: cert.credentialUrl || '', description: cert.description || ''
      });
    } else {
      setEditingCert(null);
      setFormData({ name: '', issuingOrganization: '', issueDate: '', expiryDate: '', credentialId: '', credentialUrl: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.issuingOrganization || !formData.issueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setSaving(true);
      if (editingCert) {
        await updateCertification(editingCert.id, formData);
        toast.success('Certification updated successfully');
      } else {
        await addCertification(formData);
        toast.success('Certification added successfully');
      }
      setIsDialogOpen(false);
      loadCertifications();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save certification');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certification?')) return;
    try {
      await deleteCertification(id);
      toast.success('Certification deleted');
      loadCertifications();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div><CardTitle>Certifications</CardTitle><CardDescription>Add professional certifications (max 10)</CardDescription></div>
            <Button onClick={() => handleOpenDialog()} disabled={certifications.length >= 10}><Plus className="mr-2 h-4 w-4" />Add Certification</Button>
          </div>
        </CardHeader>
        <CardContent>
          {certifications.length === 0 ? (
            <div className="text-center py-12 text-gray-500"><Award className="h-12 w-12 mx-auto mb-4 text-gray-300" /><p>No certifications added yet</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certifications.map((cert) => (
                <div key={cert.id} className="p-4 border rounded-lg hover:border-primary transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(cert)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cert.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                  <p className="text-xs text-gray-500 mt-1">Issued {new Date(cert.issueDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                  {cert.credentialUrl && <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 inline-block">View Credential →</a>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingCert ? 'Edit' : 'Add'} Certification</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Certification Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Issuing Organization *</Label><Input value={formData.issuingOrganization} onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })} required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Issue Date *</Label><Input type="date" value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} required /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Credential ID</Label><Input value={formData.credentialId} onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })} /></div>
              <div className="space-y-2"><Label>Credential URL</Label><Input type="url" value={formData.credentialUrl} onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} maxLength={500} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />{editingCert ? 'Update' : 'Add'}</>}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
