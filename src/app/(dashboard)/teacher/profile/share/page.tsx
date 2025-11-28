// src/app/(dashboard)/teacher/profile/share/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Check, Copy, Mail, Facebook, Twitter, Linkedin, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { generateShareLink, ShareLinks } from '@/lib/api/profile';
import { toast } from 'sonner';

export default function ShareProfilePage() {
  const [shareLinks, setShareLinks] = useState<ShareLinks | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadShareLinks();
  }, []);

  const loadShareLinks = async () => {
    try {
      const response = await generateShareLink();
      if (!response.data) {
      throw new Error('No data received from server');
    }
      setShareLinks(response.data.shareLinks);
      setTeacherName(response.data.teacher.name);
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate share links');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareLinks) return;
    try {
      await navigator.clipboard.writeText(shareLinks.direct);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div></DashboardLayout>;
  if (!shareLinks) return <DashboardLayout><div className="text-center py-12">Failed to generate share links</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/teacher/profile"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div><h1 className="text-3xl font-bold">Share Your Profile</h1><p className="text-gray-600 mt-1">Share your teaching profile with students</p></div>
        </div>

        {/* Direct Link */}
        <Card>
          <CardHeader><CardTitle>Profile Link</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={shareLinks.direct} readOnly className="font-mono text-sm" />
              <Button onClick={handleCopy} variant={copied ? 'default' : 'outline'}>{copied ? <><Check className="mr-2 h-4 w-4" />Copied</> : <><Copy className="mr-2 h-4 w-4" />Copy</>}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader><CardTitle>Share on Social Media</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full"><MessageCircle className="mr-2 h-4 w-4 text-green-600" />WhatsApp</Button></a>
              <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full"><Twitter className="mr-2 h-4 w-4 text-blue-400" />Twitter</Button></a>
              <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full"><Facebook className="mr-2 h-4 w-4 text-blue-600" />Facebook</Button></a>
              <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer"><Button variant="outline" className="w-full"><Linkedin className="mr-2 h-4 w-4 text-blue-700" />LinkedIn</Button></a>
              <a href={shareLinks.email}><Button variant="outline" className="w-full"><Mail className="mr-2 h-4 w-4 text-gray-600" />Email</Button></a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}