// src/components/shared/ProductCard.tsx

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Clock, BookOpen, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatProductType } from '@/lib/utils/formatters';

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProductCard({ product, showActions, onEdit, onDelete }: ProductCardProps) {
  const firstImage = product.images?.[0]?.imageUrl;
  
  // Determine product status
  const getProductStatus = () => {
    if (product.isApproved && product.isActive) {
      return {
        label: 'Approved',
        variant: 'default' as const,
        icon: CheckCircle,
        className: 'bg-green-500 text-white hover:bg-green-600'
      };
    }
    if (!product.isApproved && product.isActive) {
      return {
        label: 'Pending Review',
        variant: 'secondary' as const,
        icon: Clock,
        className: 'bg-yellow-500 text-white hover:bg-yellow-600'
      };
    }
    if (!product.isApproved && !product.isActive) {
      return {
        label: 'Rejected',
        variant: 'destructive' as const,
        icon: XCircle,
        className: 'bg-red-500 text-white hover:bg-red-600'
      };
    }
    return null;
  };

  const status = getProductStatus();
  const StatusIcon = status?.icon;
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link href={`/products/${product.id}`}>
        {/* Product Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
          {firstImage ? (
            <Image
              src={firstImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-16 w-16 text-gray-300" />
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-2 right-2">
            <Badge className="bg-white/90 text-gray-900">
              {formatProductType(product.type)}
            </Badge>
          </div>

          {/* Approval Status Badge */}
          {status && showActions && (
            <div className="absolute top-2 left-2">
              <Badge className={status.className}>
                <div className="flex items-center gap-1">
                  {StatusIcon && <StatusIcon className="h-3 w-3" />}
                  <span>{status.label}</span>
                </div>
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={`/products/${product.id}`}>
          {/* Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.title}
          </h3>

          {/* Teacher Info */}
          <div className="flex items-center gap-2 mb-3">
            {product.teacher?.profileImage ? (
              <Image
                src={product.teacher.profileImage}
                alt={`${product.teacher.firstName} ${product.teacher.lastName}`}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                {product.teacher?.firstName?.[0]}{product.teacher?.lastName?.[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {product.teacher?.firstName} {product.teacher?.lastName}
              </p>
              {product.teacher?.averageRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-600">
                    {product.teacher.averageRating.toFixed(1)} ({product.teacher.totalRatings})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>

          {/* Product Type Specific Info */}
          {product.type === 'HOME_TUTORING' && product.coverageAreas && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{product.coverageAreas[0]}</span>
              {product.coverageAreas.length > 1 && (
                <span>+{product.coverageAreas.length - 1} more</span>
              )}
            </div>
          )}

          {product.type === 'SUBSCRIPTION' && product.duration && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <Clock className="h-3 w-3" />
              <span>{product.duration.toLowerCase()}</span>
            </div>
          )}

          {/* Rejection Warning for Teacher */}
          {!product.isApproved && !product.isActive && showActions && (
            <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded-md mt-3">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600">
                This product was rejected. Please edit and resubmit.
              </p>
            </div>
          )}

          {/* Pending Warning for Teacher */}
          {!product.isApproved && product.isActive && showActions && (
            <div className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md mt-3">
              <Clock className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-600">
                Awaiting admin approval (24-48 hours)
              </p>
            </div>
          )}
        </Link>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        {/* Price */}
        <div>
          <div className="text-2xl font-bold text-primary">
            {formatCurrency(product.price)}
          </div>
          {product.type === 'HOME_TUTORING' && product.pricingType && (
            <div className="text-xs text-gray-500">
              per {product.pricingType === 'HOURLY' ? 'hour' : 'month'}
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              Edit
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        ) : (
          <Link href={`/products/${product.id}`}>
            <Button size="sm">View Details</Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}