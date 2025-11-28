// src/app/(dashboard)/payments/verify/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PaymentVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  
  const [status, setStatus] = useState<'verifying' | 'redirecting'>('verifying');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // This page should only be reached if backend verification failed
    // or if user manually navigated here
    
    if (!reference) {
      // No reference, redirect to browse
      router.replace('/student/browse');
      return;
    }

    // Show verification message for a moment
    setStatus('redirecting');

    // Start countdown
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          // Check if already verified (backend redirect already happened)
          // If user reached this page, something went wrong
          router.replace(`/payments/failed?ref=${reference}&reason=verification_timeout`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reference, router]);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Payment Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 space-y-4">
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-blue-600" />
              <h3 className="text-xl font-semibold">Verifying your payment...</h3>
              <p className="text-gray-600">
                Please wait while we confirm your transaction
              </p>
              
              {status === 'redirecting' && (
                <div className="mt-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-600">
                      Checking status... {countdown}s
                    </span>
                  </div>
                </div>
              )}

              {reference && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">Transaction Reference</p>
                  <code className="text-sm font-mono">{reference}</code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>Having issues? Contact support at support@edusiastic.com</p>
        </div>
      </div>
    </DashboardLayout>
  );
}