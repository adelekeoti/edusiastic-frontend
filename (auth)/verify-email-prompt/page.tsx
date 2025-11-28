// src/app/(auth)/verify-email-prompt/page.tsx

'use client';

import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPromptPage() {
  const { user } = useAuthStore();
  const { resendVerification, logout } = useAuth();
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      await resendVerification(user.email);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
          <CardDescription className="text-center">
            Please verify your email address to access all features
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700">
              We've sent a verification link to:
            </p>
            <p className="font-semibold text-lg text-gray-900 mt-2">
              {user?.email}
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              <strong>Didn't receive the email?</strong>
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Click the button below to resend</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleResend}
              disabled={resending}
              className="w-full"
              variant="outline"
            >
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <Button
              onClick={() => logout()}
              variant="ghost"
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}