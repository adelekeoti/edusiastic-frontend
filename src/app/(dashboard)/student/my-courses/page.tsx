// src/app/(dashboard)/student/my-courses/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  BookOpen, 
  Loader2,
  AlertCircle,
  Download,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Video,
  Home
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { getMyPurchases, toggleAutoRenewal, cancelSubscription, getPDFDownloadUrl, accessCourseContent } from '@/lib/api/purchases';
import { ProductPurchase } from '@/lib/api/purchases';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils/formatters';

export default function MyCoursesPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [purchases, setPurchases] = useState<ProductPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'subscriptions' | 'pdfs' | 'tutoring'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Email verification check
  useEffect(() => {
    if (user && !user.isVerified) {
      router.push('/verify-email-prompt');
    }
  }, [user, router]);

  useEffect(() => {
    loadPurchases();
  }, [activeTab]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (activeTab === 'subscriptions') filters.type = 'SUBSCRIPTION';
      if (activeTab === 'pdfs') filters.type = 'PDF';
      if (activeTab === 'tutoring') filters.type = 'HOME_TUTORING';

      const response = await getMyPurchases(filters);
      
      if (!response.data) {
        throw new Error('No data received');
      }
      
      setPurchases(response.data.purchases);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load purchases');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutoRenewal = async (purchaseId: string, currentValue: boolean) => {
    try {
      setProcessingId(purchaseId);
      await toggleAutoRenewal(purchaseId, !currentValue);
      toast.success(`Auto-renewal ${!currentValue ? 'enabled' : 'disabled'}`);
      loadPurchases();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update auto-renewal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelSubscription = async (purchaseId: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to cancel your subscription to "${productTitle}"? You will lose access at the end of your current billing period.`)) {
      return;
    }

    try {
      setProcessingId(purchaseId);
      await cancelSubscription(purchaseId, 'User requested cancellation');
      toast.success('Subscription cancelled successfully');
      loadPurchases();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel subscription');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadPDF = async (productId: string, productTitle: string) => {
    try {
      const response = await getPDFDownloadUrl(productId);
      if (response.data?.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
        toast.success('Opening PDF...');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to access PDF');
    }
  };

  const handleAccessCourse = async (productId: string) => {
    try {
      const response = await accessCourseContent(productId);
      if (response.data?.meetingLink) {
        window.open(response.data.meetingLink, '_blank');
        toast.success('Opening meeting link...');
      } else {
        toast.info('No meeting link available for this course');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to access course');
    }
  };

  const getStatusBadge = (purchase: ProductPurchase) => {
    if (purchase.product?.type === 'SUBSCRIPTION') {
      if (purchase.subscriptionStatus === 'ACTIVE') {
        return <Badge className="bg-green-600">Active</Badge>;
      } else if (purchase.subscriptionStatus === 'CANCELLED') {
        return <Badge variant="destructive">Cancelled</Badge>;
      } else if (purchase.subscriptionStatus === 'EXPIRED') {
        return <Badge variant="secondary">Expired</Badge>;
      }
    }
    return <Badge variant="default">Purchased</Badge>;
  };

  const getDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const days = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const filteredPurchases = purchases;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600 mt-1">Manage your purchased courses and subscriptions</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({purchases.length})</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="pdfs">PDFs</TabsTrigger>
            <TabsTrigger value="tutoring">Tutoring</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredPurchases.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No courses yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start your learning journey by browsing available courses
                  </p>
                  <Button onClick={() => router.push('/student/browse')}>
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPurchases.map((purchase) => {
                  const product = purchase.product;
                  if (!product) return null;

                  const isSubscription = product.type === 'SUBSCRIPTION';
                  const isPDF = product.type === 'PDF';
                  const isTutoring = product.type === 'HOME_TUTORING';
                  const daysLeft = getDaysRemaining(purchase.endDate);

                  return (
                    <Card key={purchase.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        {/* Product Image */}
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].imageUrl}
                            alt={product.title}
                            className="w-full h-40 object-cover rounded-lg mb-4"
                          />
                        ) : (
                          <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg mb-4 flex items-center justify-center">
                            {isPDF && <FileText className="h-16 w-16 text-blue-600" />}
                            {isSubscription && <Video className="h-16 w-16 text-blue-600" />}
                            {isTutoring && <Home className="h-16 w-16 text-blue-600" />}
                          </div>
                        )}

                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-lg line-clamp-2">{product.title}</CardTitle>
                            {getStatusBadge(purchase)}
                          </div>
                          
                          {/* Teacher Info */}
                          {product.teacher && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <img
                                src={product.teacher.profileImage || '/default-avatar.png'}
                                alt={`${product.teacher.firstName} ${product.teacher.lastName}`}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span>{product.teacher.firstName} {product.teacher.lastName}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Subscription Info */}
                        {isSubscription && purchase.subscriptionStatus === 'ACTIVE' && (
                          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                            {/* Days Remaining */}
                            {daysLeft !== null && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Days Left
                                </span>
                                <span className={`font-semibold ${daysLeft <= 7 ? 'text-red-600' : 'text-gray-900'}`}>
                                  {daysLeft} days
                                </span>
                              </div>
                            )}

                            {/* End Date */}
                            {purchase.endDate && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  Expires
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {new Date(purchase.endDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                            )}

                            {/* Auto-Renewal Toggle */}
                            <div className="flex items-center justify-between pt-2 border-t">
                              <span className="text-sm text-gray-700 font-medium">Auto-Renewal</span>
                              <Switch
                                checked={purchase.isAutoRenewal}
                                onCheckedChange={() => handleToggleAutoRenewal(purchase.id, purchase.isAutoRenewal)}
                                disabled={processingId === purchase.id}
                              />
                            </div>
                          </div>
                        )}

                        {/* Cancelled Subscription Info */}
                        {isSubscription && purchase.subscriptionStatus === 'CANCELLED' && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-red-900">Subscription Cancelled</p>
                                <p className="text-xs text-red-700 mt-1">
                                  {purchase.endDate && `Access until ${new Date(purchase.endDate).toLocaleDateString()}`}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Expired Subscription Info */}
                        {isSubscription && purchase.subscriptionStatus === 'EXPIRED' && (
                          <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-5 w-5 text-gray-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">Subscription Expired</p>
                                <p className="text-xs text-gray-700 mt-1">
                                  Renew to regain access
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Purchase Info */}
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Purchased</span>
                          <span>
                            {new Date(purchase.purchaseDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                          {/* Access Course/PDF */}
                          {isPDF && (
                            <Button
                              className="w-full"
                              onClick={() => handleDownloadPDF(product.id, product.title)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </Button>
                          )}

                          {isSubscription && purchase.subscriptionStatus === 'ACTIVE' && product.meetingLink && (
                            <Button
                              className="w-full"
                              onClick={() => handleAccessCourse(product.id)}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Join Class
                            </Button>
                          )}

                          {isTutoring && (
                            <Button
                              className="w-full"
                              onClick={() => router.push(`/messages?teacher=${product.teacher?.id}`)}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Contact Teacher
                            </Button>
                          )}

                          {/* View Product Details */}
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push(`/products/${product.id}`)}
                          >
                            View Details
                          </Button>

                          {/* Cancel Subscription */}
                          {isSubscription && purchase.subscriptionStatus === 'ACTIVE' && (
                            <Button
                              variant="outline"
                              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleCancelSubscription(purchase.id, product.title)}
                              disabled={processingId === purchase.id}
                            >
                              {processingId === purchase.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Cancelling...
                                </>
                              ) : (
                                <>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Subscription
                                </>
                              )}
                            </Button>
                          )}

                          {/* Renew Subscription */}
                          {isSubscription && (purchase.subscriptionStatus === 'EXPIRED' || purchase.subscriptionStatus === 'CANCELLED') && (
                            <Button
                              className="w-full"
                              onClick={() => router.push(`/products/${product.id}`)}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Renew Subscription
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}