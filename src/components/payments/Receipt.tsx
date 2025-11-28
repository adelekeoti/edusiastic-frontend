// src/components/payments/Receipt.tsx
'use client';

import { forwardRef } from 'react';
import { format } from 'date-fns';
import { CheckCircle2, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ReceiptProps {
  transaction: {
    id: string;
    paystackRef: string;
    amount: number;
    platformFee: number;
    teacherAmount: number;
    status: string;
    createdAt: string;
    metadata?: string;
    product?: {
      title: string;
      type: string;
      teacher?: {
        firstName: string;
        lastName: string;
      };
    };
  };
  buyer: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ transaction, buyer }, ref) => {
    const metadata = transaction.metadata 
      ? JSON.parse(transaction.metadata) 
      : null;

    return (
      <div ref={ref} className="bg-white p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            EDUSIASTIC
          </h1>
          <p className="text-sm text-gray-600">Payment Receipt</p>
        </div>

        {/* Success Badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold">Payment Successful</span>
          </div>
        </div>

        {/* Receipt Info */}
        <Card className="mb-6">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Receipt Number</p>
                <p className="font-semibold">{transaction.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 mb-1">Date</p>
                <p className="font-semibold">
                  {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Transaction Reference</p>
                <p className="font-mono text-xs break-all">{transaction.paystackRef}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 mb-1">Payment Method</p>
                <p className="font-semibold">Card Payment</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buyer Info */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Buyer Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{buyer.firstName} {buyer.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{buyer.email}</span>
              </div>
              {metadata?.childName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Purchased For:</span>
                  <span className="font-medium">{metadata.childName}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Product Details */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Product Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {transaction.product?.title || metadata?.productTitle}
                  </p>
                  <p className="text-sm text-gray-600">
                    Type: {transaction.product?.type || metadata?.productType}
                  </p>
                  {transaction.product?.teacher && (
                    <p className="text-sm text-gray-600">
                      Teacher: {transaction.product.teacher.firstName}{' '}
                      {transaction.product.teacher.lastName}
                    </p>
                  )}
                  {metadata?.duration && (
                    <p className="text-sm text-gray-600">
                      Duration: {metadata.duration}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ₦{transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Breakdown */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Payment Breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₦{transaction.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Platform Fee (15%)</span>
                <span>₦{transaction.platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Teacher Amount (85%)</span>
                <span>₦{transaction.teacherAmount.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total Paid</span>
                <span className="text-green-600">
                  ₦{transaction.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 space-y-2">
          <p>Thank you for your purchase!</p>
          <p>This is a computer-generated receipt and does not require a signature.</p>
          <Separator className="my-4" />
          <p>
            For support, contact us at support@edusiastic.com
          </p>
          <p>© {new Date().getFullYear()} Edusiastic. All rights reserved.</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';

// ==================== Receipt Download Hook ====================

import { useRef } from 'react';
import { toast } from 'sonner';

export const useReceiptDownload = () => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const downloadReceipt = async (
    transaction: any,
    buyer: { firstName: string; lastName: string; email: string }
  ) => {
    try {
      // For now, we'll use the browser's print functionality
      // You can later integrate a PDF library like jsPDF or html2canvas + jsPDF
      
      // Create a temporary container
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Please allow popups to download receipt');
        return;
      }

      // Get receipt HTML
      const receiptElement = document.createElement('div');
      receiptElement.innerHTML = generateReceiptHTML(transaction, buyer);

      // Write to new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${transaction.paystackRef}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                padding: 40px;
                background: white;
              }
              .container { max-width: 800px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 40px; }
              .header h1 { font-size: 32px; color: #1f2937; margin-bottom: 8px; }
              .header p { color: #6b7280; }
              .success-badge { 
                display: inline-flex; 
                align-items: center; 
                gap: 8px;
                background: #d1fae5; 
                color: #065f46; 
                padding: 8px 16px; 
                border-radius: 9999px;
                margin-bottom: 24px;
              }
              .card { 
                border: 1px solid #e5e7eb; 
                border-radius: 8px; 
                padding: 24px; 
                margin-bottom: 24px; 
              }
              .card h3 { margin-bottom: 16px; color: #1f2937; }
              .row { display: flex; justify-content: space-between; margin-bottom: 12px; }
              .label { color: #6b7280; }
              .value { font-weight: 600; color: #1f2937; }
              .separator { border-top: 1px solid #e5e7eb; margin: 16px 0; }
              .total { font-size: 20px; }
              .footer { 
                text-align: center; 
                color: #6b7280; 
                font-size: 12px; 
                margin-top: 40px;
                padding-top: 24px;
                border-top: 1px solid #e5e7eb;
              }
              @media print {
                body { padding: 20px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${receiptElement.innerHTML}
            <div class="no-print" style="text-align: center; margin-top: 24px;">
              <button onclick="window.print()" style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 600;
              ">
                Print Receipt
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();

      toast.success('Receipt opened in new window');
    } catch (error) {
      console.error('Download receipt error:', error);
      toast.error('Failed to generate receipt');
    }
  };

  const generateReceiptHTML = (transaction: any, buyer: any) => {
    const metadata = transaction.metadata ? JSON.parse(transaction.metadata) : null;
    
    return `
      <div class="container">
        <div class="header">
          <h1>EDUSIASTIC</h1>
          <p>Payment Receipt</p>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <div class="success-badge">
            <span>✓ Payment Successful</span>
          </div>
        </div>

        <div class="card">
          <div class="row">
            <div>
              <div class="label">Receipt Number</div>
              <div class="value">${transaction.id.slice(0, 8).toUpperCase()}</div>
            </div>
            <div style="text-align: right;">
              <div class="label">Date</div>
              <div class="value">${format(new Date(transaction.createdAt), 'MMM dd, yyyy')}</div>
            </div>
          </div>
          <div class="separator"></div>
          <div class="row">
            <div>
              <div class="label">Transaction Reference</div>
              <div class="value" style="font-family: monospace; font-size: 12px;">
                ${transaction.paystackRef}
              </div>
            </div>
            <div style="text-align: right;">
              <div class="label">Payment Method</div>
              <div class="value">Card Payment</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Buyer Information</h3>
          <div class="row">
            <span class="label">Name:</span>
            <span class="value">${buyer.firstName} ${buyer.lastName}</span>
          </div>
          <div class="row">
            <span class="label">Email:</span>
            <span class="value">${buyer.email}</span>
          </div>
          ${metadata?.childName ? `
            <div class="row">
              <span class="label">Purchased For:</span>
              <span class="value">${metadata.childName}</span>
            </div>
          ` : ''}
        </div>

        <div class="card">
          <h3>Product Details</h3>
          <div class="row" style="align-items: flex-start;">
            <div>
              <div class="value" style="margin-bottom: 8px;">
                ${transaction.product?.title || metadata?.productTitle}
              </div>
              <div style="font-size: 14px; color: #6b7280;">
                Type: ${transaction.product?.type || metadata?.productType}
              </div>
              ${transaction.product?.teacher ? `
                <div style="font-size: 14px; color: #6b7280;">
                  Teacher: ${transaction.product.teacher.firstName} ${transaction.product.teacher.lastName}
                </div>
              ` : ''}
            </div>
            <div class="value" style="font-size: 20px;">
              ₦${transaction.amount.toLocaleString()}
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Payment Breakdown</h3>
          <div class="row">
            <span class="label">Subtotal</span>
            <span>₦${transaction.amount.toLocaleString()}</span>
          </div>
          <div class="row" style="font-size: 12px; color: #6b7280;">
            <span>Platform Fee (15%)</span>
            <span>₦${transaction.platformFee.toLocaleString()}</span>
          </div>
          <div class="row" style="font-size: 12px; color: #6b7280;">
            <span>Teacher Amount (85%)</span>
            <span>₦${transaction.teacherAmount.toLocaleString()}</span>
          </div>
          <div class="separator"></div>
          <div class="row total">
            <span class="value">Total Paid</span>
            <span class="value" style="color: #059669;">
              ₦${transaction.amount.toLocaleString()}
            </span>
          </div>
        </div>

        <div class="footer">
          <p style="margin-bottom: 8px;">Thank you for your purchase!</p>
          <p style="margin-bottom: 16px;">
            This is a computer-generated receipt and does not require a signature.
          </p>
          <p>For support, contact us at support@edusiastic.com</p>
          <p style="margin-top: 8px;">
            © ${new Date().getFullYear()} Edusiastic. All rights reserved.
          </p>
        </div>
      </div>
    `;
  };

  return { downloadReceipt, receiptRef };
};