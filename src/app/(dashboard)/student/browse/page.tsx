// src/app/(dashboard)/student/browse/page.tsx - FIXED VERSION

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductCard } from '@/components/shared/ProductCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { getAllProducts } from '@/lib/api/products';
import { getAllCategories } from '@/lib/api/categories';
import { ProductType, ProductFilters } from '@/types';

export default function StudentBrowsePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    status: 'APPROVED'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products - ALWAYS include status: APPROVED
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => getAllProducts({ ...filters, status: 'APPROVED' })
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories
  });

  // Extract products and pagination from response
  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination;
  const categories = categoriesData?.data?.categories || [];

  // Get subcategories for selected category
  const selectedCategory = categories.find(c => c.id === filters.categoryId);
  const subcategories = selectedCategory?.subcategories || [];

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value, page: 1 };
      
      // Reset subcategory when category changes
      if (key === 'categoryId') {
        delete newFilters.subcategoryId;
      }
      
      return newFilters;
    });
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
    } else {
      setFilters(prev => {
        const newFilters = { ...prev };
        delete newFilters.search;
        return newFilters;
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearFilters = () => {
    setFilters({ page: 1, limit: 12, status: 'APPROVED' });
    setSearchQuery('');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>
          <p className="text-gray-600 mt-2">
            Discover courses, resources, and tutoring services from verified teachers
          </p>
        </div>

        {/* Search & Filter Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch}>Search</Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                  {/* Product Type */}
                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) => handleFilterChange('type', value === 'all' ? undefined : value as ProductType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Product Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                      <SelectItem value="PDF">PDF Resource</SelectItem>
                      <SelectItem value="HOME_TUTORING">Home Tutoring</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Category */}
                  <Select
                    value={filters.categoryId || 'all'}
                    onValueChange={(value) => handleFilterChange('categoryId', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Subcategory */}
                  <Select
                    value={filters.subcategoryId || 'all'}
                    onValueChange={(value) => handleFilterChange('subcategoryId', value === 'all' ? undefined : value)}
                    disabled={!filters.categoryId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subcategories</SelectItem>
                      {subcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Price Range */}
                  <Select
                    value={filters.maxPrice?.toString() || 'all'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        handleFilterChange('minPrice', undefined);
                        handleFilterChange('maxPrice', undefined);
                      } else {
                        const max = parseInt(value);
                        handleFilterChange('maxPrice', max);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Price Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="5000">Under ₦5,000</SelectItem>
                      <SelectItem value="10000">Under ₦10,000</SelectItem>
                      <SelectItem value="20000">Under ₦20,000</SelectItem>
                      <SelectItem value="50000">Under ₦50,000</SelectItem>
                      <SelectItem value="100000">Under ₦100,000</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select
                    value={filters.sortBy || 'rating'}
                    onValueChange={(value) => handleFilterChange('sortBy', value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="price">Price: Low to High</SelectItem>
                      <SelectItem value="createdAt">Newest First</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Order */}
                  {filters.sortBy && (
                    <Select
                      value={filters.sortOrder || 'desc'}
                      onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">
                          {filters.sortBy === 'price' ? 'High to Low' : 'Descending'}
                        </SelectItem>
                        <SelectItem value="asc">
                          {filters.sortBy === 'price' ? 'Low to High' : 'Ascending'}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  {/* Clear Filters Button */}
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="col-span-1"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Filters Display */}
        {(filters.type || filters.categoryId || filters.subcategoryId || filters.maxPrice || filters.search) && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.search && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  handleFilterChange('search', undefined);
                }}
              >
                Search: "{filters.search}" ×
              </Button>
            )}
            {filters.type && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('type', undefined)}
              >
                Type: {filters.type} ×
              </Button>
            )}
            {filters.categoryId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('categoryId', undefined)}
              >
                Category: {categories.find(c => c.id === filters.categoryId)?.name} ×
              </Button>
            )}
            {filters.subcategoryId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange('subcategoryId', undefined)}
              >
                Subcategory: {subcategories.find(s => s.id === filters.subcategoryId)?.name} ×
              </Button>
            )}
            {filters.maxPrice && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleFilterChange('minPrice', undefined);
                  handleFilterChange('maxPrice', undefined);
                }}
              >
                Max Price: ₦{filters.maxPrice.toLocaleString()} ×
              </Button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loadingProducts ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : !Array.isArray(products) || products.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">No products found</p>
              <p className="text-sm text-gray-500">
                Try adjusting your filters or search terms
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing {products.length} of {pagination?.total || 0} products
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600 px-4">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}