// src/app/(dashboard)/payments/failed/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { XCircle, AlertCircle, RefreshCw, Home, HelpCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function PaymentFailedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('ref') || searchParams.get('reference');
  const reason = searchParams.get('reason') || 'unknown';

  const getFailureMessage = (reason: string) => {
    const messages: Record<string, string> = {
      'verification_failed': 'We could not verify your payment with the payment provider',
      'not_successful': 'The payment was declined or cancelled',
      'timeout': 'Payment session expired',
      'insufficient_funds': 'Insufficient funds in your account',
      'card_declined': 'Your card was declined',
      'network_error': 'A network error occurred during payment',
      'unknown': 'An unexpected error occurred during payment'
    };
    return messages[reason] || messages.unknown;
  };

  const getFailureRecommendation = (reason: string) => {
    const recommendations: Record<string, string[]> = {
      'verification_failed': [
        'Wait a few minutes and check your email for confirmation',
        'Contact your bank to verify if the amount was debited',
        'If debited, contact our support team with your transaction reference'
      ],
      'not_successful': [
        'Try again with a different payment method',
        'Ensure your card has sufficient funds',
        'Check if your card is enabled for online transactions'
      ],
      'insufficient_funds': [
        'Check your account balance',
        'Try using a different card',
        'Top up your account and try again'
      ],
      'card_declined': [
        'Contact your bank to enable online transactions',
        'Verify that your card details are correct',
        'Try using a different card'
      ],
      'timeout': [
        'Try the payment again',
        'Ensure you have a stable internet connection',
        'Complete the payment within the allowed time'
      ],
      'unknown': [
        'Try the payment again',
        'Use a different payment method',
        'Contact support if the problem persists'
      ]
    };
    return recommendations[reason] || recommendations.unknown;
  };

  const handleRetryPayment = () => {
    router.push('/student/browse');
  };

  const handleContactSupport = () => {
    // TODO: Implement support contact or redirect to support page
    window.location.href = 'mailto:support@edusiastic.com?subject=Payment Failed - ' + reference;
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="space-y-6">
          {/* Failure Icon & Message */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-red-400 rounded-full blur-2xl opacity-20" />
              <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-xl">
                <XCircle className="w-14 h-14 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-gray-900">
                Payment Failed
              </h1>
              <p className="text-lg text-gray-600">
                {getFailureMessage(reason)}
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          <Card className="border-2 border-red-100">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant="destructive" className="gap-1">
                  <XCircle className="w-3 h-3" />
                  Failed
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

              {/* Recommendations */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  <AlertCircle className="w-5 h-5" />
                  <span>What you can do:</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  {getFailureRecommendation(reason).map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleRetryPayment}
              className="flex-1 gap-2"
              size="lg"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>
            <Button
              onClick={() => router.push('/student/browse')}
              variant="outline"
              className="flex-1 gap-2"
              size="lg"
            >
              <Home className="w-4 h-4" />
              Go to Browse
            </Button>
          </div>

          {/* FAQ Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-lg">Frequently Asked Questions</h3>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Was I charged for this failed payment?</AccordionTrigger>
                  <AccordionContent>
                    No, if the payment failed, you were not charged. However, in rare cases, 
                    you might see a temporary hold on your account that will be automatically 
                    reversed within 24-48 hours by your bank.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Why did my payment fail?</AccordionTrigger>
                  <AccordionContent>
                    Payment failures can occur for several reasons including insufficient funds, 
                    card restrictions, network issues, or security checks by your bank. 
                    Try using a different payment method or contact your bank for more details.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                  <AccordionContent>
                    We accept all major debit and credit cards (Visa, Mastercard, Verve), 
                    bank transfers, and USSD payments through our payment provider Paystack.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Can I get help with my payment?</AccordionTrigger>
                  <AccordionContent>
                    Yes! Our support team is here to help. Click the "Contact Support" button 
                    below or email us at support@edusiastic.com with your transaction reference.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6 text-center space-y-4">
              <h3 className="font-semibold text-lg">Still need help?</h3>
              <p className="text-sm text-gray-600">
                Our support team is available to assist you with any payment issues
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleContactSupport}
                  variant="outline"
                  className="gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  Contact Support
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="ghost"
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Go Back
                </Button>
              </div>
              <p className="text-xs text-gray-500 pt-2">
                Email: support@edusiastic.com | Response time: Within 24 hours
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}