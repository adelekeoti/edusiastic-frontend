// src/app/(auth)/verify-email/[token]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, GraduationCap } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const { verifyEmail } = useAuth();

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    try {
      await verifyEmail(token);
      setStatus('success');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-yellow-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3">
          <div className="flex justify-center mb-2">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-10 w-10 text-primary" />
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Edusiastic
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
              <CardTitle className="text-2xl">Verifying Your Email...</CardTitle>
              <CardDescription>Please wait while we verify your email address</CardDescription>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. You can now access all features.
              </CardDescription>
              
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-700">
                  Redirecting to login page in a few seconds...
                </p>
              </div>

              <Link href="/login">
                <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Go to Login Now
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Verification Failed</CardTitle>
              <CardDescription>
                The verification link is invalid or has expired
              </CardDescription>
              
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-gray-700">
                  <strong>What to do next:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-600 text-left">
                  <li>• The link may have expired (valid for 24 hours)</li>
                  <li>• Try requesting a new verification email</li>
                  <li>• Contact support if the problem persists</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                    Go to Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    Create New Account
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}