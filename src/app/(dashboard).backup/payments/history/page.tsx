// src/app/(dashboard)/payments/history/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Receipt, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Search,
  Filter,
  ChevronDown,
  FileText,
  CreditCard
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { getPaymentHistory } from '@/lib/api/payments';

export default function PaymentHistoryPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch payment history
  const { data, isLoading, error } = useQuery({
    queryKey: ['payment-history', page, limit],
    queryFn: () => getPaymentHistory({ page, limit })
  });

  const transactions = data?.data?.transactions || [];
  const pagination = data?.data?.pagination;

  // Filter transactions locally
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = searchQuery === '' || 
      transaction.product?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.paystackRef.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      transaction.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    const variants: Record<string, any> = {
      COMPLETED: 'default',
      PENDING: 'secondary',
      FAILED: 'destructive',
      REFUNDED: 'outline'
    };

    return (
      <Badge variant={variants[statusUpper] || 'secondary'} className="gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const handleDownloadReceipt = (transaction: any) => {
    // TODO: Implement receipt download
    console.log('Download receipt for:', transaction.paystackRef);
  };

  const calculateStats = () => {
    const completed = transactions.filter(t => t.status === 'COMPLETED');
    const totalSpent = completed.reduce((sum, t) => sum + t.amount, 0);
    const totalTransactions = transactions.length;
    const successRate = totalTransactions > 0 
      ? ((completed.length / totalTransactions) * 100).toFixed(1)
      : '0';

    return { totalSpent, totalTransactions, successRate };
  };

  const stats = calculateStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">
            View all your transactions and download receipts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₦{stats.totalSpent.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalTransactions}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.successRate}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by product name or reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <XCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <p className="text-gray-600">Failed to load transaction history</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">No transactions found</p>
                <p className="text-sm text-gray-500">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your filters'
                    : 'Make your first purchase to see transactions here'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Transaction Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {transaction.product?.title || 'Product'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {transaction.product?.teacher && (
                                <>
                                  by {transaction.product.teacher.firstName}{' '}
                                  {transaction.product.teacher.lastName}
                                </>
                              )}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {transaction.paystackRef}
                              </code>
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Amount & Actions */}
                      <div className="flex items-center gap-4 md:flex-col md:items-end">
                        <div className="flex-1 md:flex-none">
                          <p className="text-xl font-bold text-gray-900">
                            ₦{transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>

                        {transaction.status === 'COMPLETED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(transaction)}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Metadata (if available) */}
                    {transaction.metadata && (
                      <div className="mt-3 pt-3 border-t">
                        <details className="text-xs text-gray-600">
                          <summary className="cursor-pointer hover:text-gray-900 flex items-center gap-1">
                            <ChevronDown className="w-3 h-3" />
                            Transaction Details
                          </summary>
                          <div className="mt-2 space-y-1 pl-4">
                            {(() => {
                              try {
                                const metadata = JSON.parse(transaction.metadata);
                                return (
                                  <>
                                    <p>Type: {metadata.productType}</p>
                                    <p>Platform Fee: ₦{transaction.platformFee.toLocaleString()}</p>
                                    <p>Teacher Amount: ₦{transaction.teacherAmount.toLocaleString()}</p>
                                    {metadata.childName && (
                                      <p>Purchased for: {metadata.childName}</p>
                                    )}
                                  </>
                                );
                              } catch {
                                return null;
                              }
                            })()}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <>
                <Separator className="my-6" />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {((page - 1) * limit) + 1} to{' '}
                    {Math.min(page * limit, pagination.total)} of {pagination.total} transactions
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}