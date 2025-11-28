// src/app/(dashboard)/student/products/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  ShoppingCart,
  Loader2,
  Calendar,
  FileText,
  Video,
  Home,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { getProductById } from '@/lib/api/products';
import { Product } from '@/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { PaymentButton } from '@/components/payments/PaymentButton';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await getProductById(productId);
      setProduct(response.data?.product || null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to fetch product');
      router.push('/student/browse');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12">
          <Card>
            <CardContent className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
              <p className="text-gray-600 mb-6">
                The product you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/student/browse">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Browse
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const teacher = product.teacher;
  const images = product.images || [];

  const getProductIcon = () => {
    switch (product.type) {
      case 'SUBSCRIPTION':
        return Video;
      case 'PDF':
        return FileText;
      case 'HOME_TUTORING':
        return Home;
      default:
        return ShoppingCart;
    }
  };

  const ProductIcon = getProductIcon();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <Card>
              <CardContent className="p-6">
                {images.length > 0 ? (
                  <>
                    <div className="rounded-lg overflow-hidden mb-4">
                      <img
                        src={images[selectedImage]?.imageUrl || images[0]?.imageUrl}
                        alt={product.title}
                        className="w-full h-96 object-cover"
                      />
                    </div>
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {images.map((img, idx) => (
                          <button
                            key={img.id}
                            onClick={() => setSelectedImage(idx)}
                            className={`rounded-lg overflow-hidden border-2 ${
                              selectedImage === idx ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          >
                            <img
                              src={img.imageUrl}
                              alt={`${product.title} ${idx + 1}`}
                              className="w-full h-20 object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                    <ProductIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{product.type.replace('_', ' ')}</Badge>
                      {product.subcategory && (
                        <Badge variant="outline">
                          {product.subcategory.category?.name} - {product.subcategory.name}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-3xl mb-2">{product.title}</CardTitle>
                    <p className="text-2xl font-bold text-blue-600">
                      ₦{product.price.toLocaleString()}
                      {product.type === 'SUBSCRIPTION' && product.duration && (
                        <span className="text-sm font-normal text-gray-600">
                          /{product.duration.toLowerCase()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Subscription Details */}
                {product.type === 'SUBSCRIPTION' && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Subscription Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-medium">{product.duration}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Auto-Renewal:</span>
                        <p className="font-medium">{product.autoRenewal ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    {product.meetingLink && (
                      <div>
                        <span className="text-gray-600 text-sm">Meeting Link:</span>
                        <p className="text-sm text-blue-600 truncate">{product.meetingLink}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Home Tutoring Details */}
                {product.type === 'HOME_TUTORING' && (
                  <div className="bg-green-50 rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Home Tutoring Details
                    </h4>
                    
                    {product.coverageAreas && product.coverageAreas.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Coverage Areas:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {product.coverageAreas.map((area, idx) => (
                            <Badge key={idx} variant="outline">
                              <MapPin className="w-3 h-3 mr-1" />
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {product.pricingType && (
                        <div>
                          <span className="text-gray-600">Pricing:</span>
                          <p className="font-medium">{product.pricingType}</p>
                        </div>
                      )}
                      {product.sessionsPerWeek && (
                        <div>
                          <span className="text-gray-600">Sessions/Week:</span>
                          <p className="font-medium">{product.sessionsPerWeek}</p>
                        </div>
                      )}
                      {product.sessionDuration && (
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-medium">{product.sessionDuration} mins</p>
                        </div>
                      )}
                      {product.transportFee && (
                        <div>
                          <span className="text-gray-600">Transport Fee:</span>
                          <p className="font-medium">₦{product.transportFee.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {product.subjects && product.subjects.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-600">Subjects:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {product.subjects.map((subject, idx) => (
                            <Badge key={idx} variant="secondary">{subject}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 pt-4 border-t">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-5 h-5" />
                    <span className="text-sm">{product.salesCount} enrolled</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm">
                      Added {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    ₦{product.price.toLocaleString()}
                  </p>
                  {product.type === 'SUBSCRIPTION' && product.duration && (
                    <p className="text-sm text-gray-600">per {product.duration.toLowerCase()}</p>
                  )}
                </div>
                <PaymentButton 
                  product={product}
                  className="w-full"
                  variant="default"
                />
                <div className="space-y-2 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Instant access after purchase</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Secure payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Card */}
            {teacher && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">About the Teacher</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={teacher.profileImage || '/default-avatar.png'}
                      alt={`${teacher.firstName} ${teacher.lastName}`}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">
                        {teacher.title && `${teacher.title} `}
                        {teacher.firstName} {teacher.lastName}
                      </h4>
                      {teacher.averageRating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{teacher.averageRating.toFixed(1)}</span>
                          <span className="text-gray-500">({teacher.totalRatings})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {teacher.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                      {teacher.bio}
                    </p>
                  )}

                  <div className="space-y-2 text-sm">
                    {teacher.totalStudents && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{teacher.totalStudents} students</span>
                      </div>
                    )}
                    {teacher.yearsOfExperience && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{teacher.yearsOfExperience} years experience</span>
                      </div>
                    )}
                  </div>

                  <Link href={`/student/teachers/${teacher.id}`}>
                    <Button variant="outline" className="w-full mt-4">
                      View Profile
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}