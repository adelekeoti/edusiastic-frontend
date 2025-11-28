// src/app/(dashboard)/parent/browse/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProducts } from '@/lib/hooks/useProducts';
import { useCategories } from '@/lib/hooks/useCategories';
import { useAuthStore } from '@/lib/store/authStore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  BookOpen,
  Star,
  Users,
  Filter,
  X,
  FileText,
  Video,
  Home,
  TrendingUp,
} from 'lucide-react';
import Image from 'next/image';
import { formatCurrency, formatProductType } from '@/lib/utils/formatters';
import { ProductType, ProductFilters } from '@/types';

export default function ParentBrowsePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({
    min: '',
    max: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories
  const { categories, isLoading: categoriesLoading } = useCategories();

  // Build filters object
  const filters: ProductFilters = {
    search: searchQuery || undefined,
    categoryId: selectedCategory || undefined,
    subcategoryId: selectedSubcategory || undefined,
    type: selectedType ? (selectedType as 'SUBSCRIPTION' | 'PDF') : undefined,
    minPrice: priceRange.min ? parseFloat(priceRange.min) : undefined,
    maxPrice: priceRange.max ? parseFloat(priceRange.max) : undefined,
    page: 1,
    limit: 12,
  };

  // Fetch products
  const { products, isLoading, pagination } = useProducts(filters);

  // Get subcategories for selected category
  const selectedCategoryData = categories.find((cat) => cat.id === selectedCategory);
  const subcategories = selectedCategoryData?.subcategories || [];

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedType('');
    setPriceRange({ min: '', max: '' });
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery ||
    selectedCategory ||
    selectedSubcategory ||
    selectedType ||
    priceRange.min ||
    priceRange.max;

  // Get product type icon
  const getProductTypeIcon = (type: ProductType) => {
    switch (type) {
      case ProductType.PDF:
        return FileText;
      case ProductType.SUBSCRIPTION:
        return Video;
      case ProductType.HOME_TUTORING:
        return Home;
      default:
        return BookOpen;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Courses</h1>
          <p className="text-gray-600 mt-2">
            Find the perfect learning resources for your children
          </p>
        </div>

        {/* Search and Filter Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search courses, topics, or teachers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Toggle Button (Mobile) */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="destructive" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>

              {/* Quick Filters (Desktop) */}
              <div className="hidden lg:flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Product Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All Types</SelectItem>
                    <SelectItem value="SUBSCRIPTION">Subscriptions</SelectItem>
                    <SelectItem value="PDF">PDF Resources</SelectItem>
                    <SelectItem value="HOME_TUTORING">Home Tutoring</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={(val) => {
                  setSelectedCategory(val);
                  setSelectedSubcategory('');
                }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-1"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Mobile Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t space-y-4 lg:hidden">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Product Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All Types</SelectItem>
                    <SelectItem value="SUBSCRIPTION">Subscriptions</SelectItem>
                    <SelectItem value="PDF">PDF Resources</SelectItem>
                    <SelectItem value="HOME_TUTORING">Home Tutoring</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={(val) => {
                  setSelectedCategory(val);
                  setSelectedSubcategory('');
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCategory && subcategories.length > 0 && (
                  <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">All Subcategories</SelectItem>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min Price"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max Price"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                  />
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        {pagination && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {products.length} of {pagination.total} products
            </p>
          </div>
        )}

        {/* Products Grid */}
        {isLoading || categoriesLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 text-center mb-4">
                Try adjusting your filters or search terms
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const TypeIcon = getProductTypeIcon(product.type);
              const firstImage = product.images?.[0];

              return (
                <Card
                  key={product.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  {/* Product Image */}
                  <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-secondary/10">
                    {firstImage ? (
                      <Image
                        src={firstImage.imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="h-16 w-16 text-gray-300" />
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-white/90 text-gray-900 gap-1">
                        <TypeIcon className="h-3 w-3" />
                        {formatProductType(product.type)}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-2">
                        {product.title}
                      </h3>

                      {/* Teacher Info */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                          {product.teacher?.firstName?.[0]}
                        </div>
                        <span>
                          {product.teacher?.firstName} {product.teacher?.lastName}
                        </span>
                      </div>

                      {/* Rating */}
                      {product.teacher?.averageRating && (
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {product.teacher.averageRating.toFixed(1)}
                          </span>
                          <span className="text-gray-600">
                            ({product.teacher.totalRatings})
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{product.salesCount} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{product.viewCount} views</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t pt-4">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="text-2xl font-bold text-primary">
                          {formatCurrency(product.price)}
                        </div>
                        {product.type === ProductType.SUBSCRIPTION && product.duration && (
                          <p className="text-xs text-gray-600">
                            per {product.duration.toLowerCase()}
                          </p>
                        )}
                      </div>
                      <Button size="sm">View Details</Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={pagination.page === 1}
              onClick={() => {
                // Implement pagination logic
              }}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={page === pagination.page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      // Implement pagination logic
                    }}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
            <Button
              variant="outline"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => {
                // Implement pagination logic
              }}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}