// src/app/(dashboard)/products/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useProduct } from '@/lib/hooks/useProducts';
import { usePurchaseStatus } from '@/lib/hooks/usePurchaseStatus';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  Star,
  MapPin,
  Clock,
  BookOpen,
  Users,
  Calendar,
  Video,
  FileText,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Loader2,
} from 'lucide-react';
import { formatCurrency, formatProductType } from '@/lib/utils/formatters';
import { ProductType } from '@/types';
import { PaymentButton } from '@/components/payments/PaymentButton';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const productId = params.id as string;
  
  const { product, isLoading, error } = useProduct(productId);
  const { 
    isPurchased, 
    purchase, 
    isLoading: isPurchaseLoading, 
    refetch: refetchPurchaseStatus,
    error: purchaseError 
  } = usePurchaseStatus(productId);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Log purchase check errors but don't block UI
  useEffect(() => {
    if (purchaseError) {
      console.warn('Purchase status check error (non-blocking):', purchaseError);
    }
  }, [purchaseError]);

  // Check for payment callback in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get('reference');
    const trxref = urlParams.get('trxref');
    
    if (reference || trxref) {
      console.log('Payment callback detected, refetching purchase status');
      // Payment callback detected, wait a bit and refetch
      const timer = setTimeout(() => {
        refetchPurchaseStatus();
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [refetchPurchaseStatus]);

  // Refetch purchase status when page gains focus (user comes back from Paystack)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        console.log('Page became visible, refetching purchase status');
        refetchPurchaseStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isAuthenticated, refetchPurchaseStatus]);

  // Listen for storage events (in case purchase happens in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'purchase-completed' && e.newValue === productId) {
        console.log('Purchase completed in another context, refetching');
        refetchPurchaseStatus();
        localStorage.removeItem('purchase-completed');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [productId, refetchPurchaseStatus]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !product) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12 text-center">
          <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Show loading state while checking authentication and purchase status
  const isCheckingPurchase = isPurchaseLoading && isAuthenticated;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10">
                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[currentImageIndex].imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                      priority
                    />
                    
                    {/* Image Navigation */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                        
                        {/* Image Indicators */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                          {images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-24 w-24 text-gray-300" />
                  </div>
                )}

                {/* Type Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-gray-900 text-sm">
                    {formatProductType(product.type)}
                  </Badge>
                </div>

                {/* Approval Status */}
                {!product.isApproved && !isPurchased && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-yellow-500 text-white">
                      Pending Approval
                    </Badge>
                  </div>
                )}

                {/* Already Purchased Badge */}
                {isPurchased && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-500 text-white gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Purchased
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            {/* Product Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{product.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{product.salesCount} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>{product.viewCount} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">About this {formatProductType(product.type)}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
                </div>

                <Separator />

                {/* Subscription Specific Details */}
                {product.type === ProductType.SUBSCRIPTION && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Subscription Details</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {product.duration && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Duration</p>
                            <p className="text-sm text-gray-600">{product.duration.toLowerCase()}</p>
                          </div>
                        </div>
                      )}
                      {product.autoRenewal !== undefined && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Auto-Renewal</p>
                            <p className="text-sm text-gray-600">
                              {product.autoRenewal ? 'Enabled' : 'Disabled'}
                            </p>
                          </div>
                        </div>
                      )}
                      {product.meetingLink && (
                        <div className="flex items-start gap-3">
                          <Video className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Online Classes</p>
                            <a
                              href={product.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              Join Meeting
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* PDF Specific Details */}
                {product.type === ProductType.PDF && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">PDF Resource Details</h3>
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                      <FileText className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Downloadable PDF</p>
                        <p className="text-sm text-gray-600">
                          {product.pdfFileSize
                            ? `File size: ${(product.pdfFileSize / 1024 / 1024).toFixed(2)} MB`
                            : 'Digital resource included'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Home Tutoring Specific Details */}
                {product.type === ProductType.HOME_TUTORING && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Tutoring Details</h3>
                    
                    {/* Coverage Areas */}
                    {product.coverageAreas && product.coverageAreas.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <p className="font-medium">Coverage Areas</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {product.coverageAreas.map((area) => (
                            <Badge key={area} variant="secondary">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pricing & Schedule */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {product.pricingType && (
                        <div className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Pricing Type</p>
                            <p className="text-sm text-gray-600">
                              {product.pricingType === 'HOURLY' ? 'Hourly Rate' : 'Monthly Package'}
                            </p>
                          </div>
                        </div>
                      )}
                      {product.sessionsPerWeek && (
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Sessions per Week</p>
                            <p className="text-sm text-gray-600">{product.sessionsPerWeek} sessions</p>
                          </div>
                        </div>
                      )}
                      {product.sessionDuration && (
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Session Duration</p>
                            <p className="text-sm text-gray-600">{product.sessionDuration} minutes</p>
                          </div>
                        </div>
                      )}
                      {product.transportFee !== undefined && product.transportFee > 0 && (
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Transport Fee</p>
                            <p className="text-sm text-gray-600">
                              {formatCurrency(product.transportFee)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Subjects */}
                    {product.subjects && product.subjects.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <p className="font-medium">Subjects Offered</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {product.subjects.map((subject) => (
                            <Badge key={subject} variant="outline">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Separator />

                {/* Category */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Category</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {product.subcategory?.category?.name}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                    <Badge variant="outline">
                      {product.subcategory?.name}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card className="sticky top-6">
              <CardContent className="p-6 space-y-4">
                {/* Price */}
                <div>
                  <div className="text-4xl font-bold text-primary mb-1">
                    {formatCurrency(product.price)}
                  </div>
                  {product.type === ProductType.HOME_TUTORING && product.pricingType && (
                    <p className="text-sm text-gray-600">
                      per {product.pricingType === 'HOURLY' ? 'hour' : 'month'}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Show loading state while checking purchase status */}
                {isCheckingPurchase ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-gray-600">Checking purchase status...</span>
                  </div>
                ) : isPurchased ? (
                  /* Already Purchased State */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-green-900">Already Purchased</p>
                        <p className="text-sm text-green-700">
                          You have access to this product
                        </p>
                      </div>
                    </div>

                    {/* Show subscription info if applicable */}
                    {purchase?.subscriptionStatus && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                        <p className="font-medium text-blue-900 mb-1">Subscription Status</p>
                        <p className="text-blue-700">
                          Status: <span className="font-medium capitalize">{purchase.subscriptionStatus.toLowerCase()}</span>
                        </p>
                        {purchase.endDate && (
                          <p className="text-blue-700">
                            Valid until: {' '}
                            <span className="font-medium">
                              {new Date(purchase.endDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={() => router.push('/student/purchases')}
                      className="w-full"
                      variant="default"
                    >
                      View My Purchases
                    </Button>
                  </div>
                ) : (
                  /* Not Purchased - Show Purchase Button */
                  <>
                    <div className="w-full">
                      <PaymentButton 
                        product={product}
                        disabled={!product.isApproved || !isAuthenticated}
                        className="w-full"
                        variant="default"
                        onPaymentSuccess={() => {
                          // Refetch purchase status after successful payment
                          refetchPurchaseStatus();
                        }}
                      />
                    </div>

                    {!product.isApproved && (
                      <p className="text-sm text-amber-600 text-center">
                        This product is pending approval
                      </p>
                    )}

                    {/* What's Included */}
                    <div className="space-y-2 pt-4">
                      <p className="font-semibold text-sm">What's included:</p>
                      <ul className="space-y-2 text-sm text-gray-600">
                        {product.type === ProductType.SUBSCRIPTION && (
                          <>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Access to online classes</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Direct teacher support</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{product.duration?.toLowerCase()} access</span>
                            </li>
                          </>
                        )}
                        {product.type === ProductType.PDF && (
                          <>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Downloadable PDF resource</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Lifetime access</span>
                            </li>
                          </>
                        )}
                        {product.type === ProductType.HOME_TUTORING && (
                          <>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Personalized one-on-one sessions</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Flexible scheduling</span>
                            </li>
                            {product.sessionsPerWeek && (
                              <li className="flex items-start gap-2">
                                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{product.sessionsPerWeek} sessions per week</span>
                              </li>
                            )}
                          </>
                        )}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Teacher Card */}
            {product.teacher && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About the Teacher</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Teacher Profile */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                      {product.teacher.firstName[0]}{product.teacher.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">
                        {product.teacher.firstName} {product.teacher.lastName}
                      </p>
                      {product.teacher.headline && (
                        <p className="text-sm text-gray-600">{product.teacher.headline}</p>
                      )}
                      {product.teacher.averageRating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {product.teacher.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-600">
                            ({product.teacher.totalRatings} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Teacher Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    {product.teacher.totalStudents !== undefined && (
                      <div className="text-center">
                        <Users className="h-5 w-5 mx-auto text-primary mb-1" />
                        <p className="text-2xl font-bold">{product.teacher.totalStudents}</p>
                        <p className="text-xs text-gray-600">Students</p>
                      </div>
                    )}
                    {product.teacher.yearsOfExperience && (
                      <div className="text-center">
                        <GraduationCap className="h-5 w-5 mx-auto text-primary mb-1" />
                        <p className="text-2xl font-bold">{product.teacher.yearsOfExperience}</p>
                        <p className="text-xs text-gray-600">Years Exp.</p>
                      </div>
                    )}
                  </div>

                  {/* View Profile Button */}
                  <Button variant="outline" className="w-full" size="sm">
                    View Full Profile
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}