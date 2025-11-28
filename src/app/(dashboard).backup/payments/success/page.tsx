// src/app/(dashboard)/payments/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Download, ExternalLink, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref') || searchParams.get('reference');
  const alreadyVerified = searchParams.get('already_verified') === 'true';
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Only trigger confetti if not already verified
    if (!alreadyVerified) {
      // Trigger confetti animation
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10B981', '#3B82F6', '#8B5CF6']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10B981', '#3B82F6', '#8B5CF6']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
    }
  }, [alreadyVerified]);

  if (!mounted) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center space-y-6">
          {/* Success Icon */}
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-green-400 rounded-full blur-2xl opacity-20 animate-pulse" />
            <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl">
              <CheckCircle2 className="w-14 h-14 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Payment Successful!
              </h1>
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-lg text-gray-600">
              Your purchase has been completed successfully
            </p>
          </div>

          {/* Already Verified Notice */}
          {alreadyVerified && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <AlertCircle className="w-4 h-4" />
              <span>This payment was already verified</span>
            </div>
          )}

          {/* Transaction Details Card */}
          <Card className="border-2 border-green-100 shadow-lg">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              </div>

              {reference && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Transaction Reference</span>
                    <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
                      {reference}
                    </code>
                  </div>
                </>
              )}

              <Separator />

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-semibold">What happens next?</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You now have full access to your purchased content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>A receipt has been sent to your email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You can view your purchase in the "My Purchases" section</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={() => router.push('/student/purchases')}
              className="flex-1 gap-2 shadow-lg"
              size="lg"
            >
              View My Purchases
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => router.push('/student/browse')}
              variant="outline"
              className="flex-1 gap-2"
              size="lg"
            >
              Continue Shopping
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Download Receipt Option */}
          {reference && (
            <div className="pt-6">
              <Button
                variant="ghost"
                className="gap-2 text-gray-600 hover:text-gray-900"
                onClick={() => {
                  router.push(`/payments/history?highlight=${reference}`);
                }}
              >
                <Download className="w-4 h-4" />
                View Receipt
              </Button>
            </div>
          )}

          {/* Support Info */}
          <div className="pt-8 border-t">
            <p className="text-sm text-gray-500">
              Need help? Contact us at{' '}
              <a
                href="mailto:support@edusiastic.com"
                className="text-blue-600 hover:underline"
              >
                support@edusiastic.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}