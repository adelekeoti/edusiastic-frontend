// src/app/(dashboard)/teacher/products/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProductCard } from '@/components/shared/ProductCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useTeacherProducts, useDeleteProduct } from '@/lib/hooks/useProducts';
import { useAuthStore } from '@/lib/store/authStore';
import { Product } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function TeacherProductsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch teacher's products
  const { products, isLoading } = useTeacherProducts(user?.id);
  const deleteProductMutation = useDeleteProduct();

  // Ensure products is always an array with proper typing
  const productList: Product[] = Array.isArray(products) ? products : [];

  // Filter products by status
  const allProducts: Product[] = productList;
  const pendingProducts: Product[] = productList.filter(p => !p.isApproved && p.isActive);
  const approvedProducts: Product[] = productList.filter(p => p.isApproved && p.isActive);
  const rejectedProducts: Product[] = productList.filter(p => !p.isApproved && !p.isActive);

  const handleEdit = (productId: string) => {
    router.push(`/teacher/products/${productId}/edit`);
  };

  const handleDelete = (productId: string) => {
    setDeleteId(productId);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteProductMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const renderProductsGrid = (filteredProducts: typeof productList) => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      const emptyMessages = {
        all: {
          icon: Package,
          title: 'No products yet',
          description: 'Create your first product to start earning'
        },
        pending: {
          icon: Clock,
          title: 'No pending products',
          description: 'All your products have been reviewed'
        },
        approved: {
          icon: CheckCircle,
          title: 'No approved products',
          description: 'Your approved products will appear here'
        },
        rejected: {
          icon: XCircle,
          title: 'No rejected products',
          description: 'Products that need revision will appear here'
        }
      };

      const message = emptyMessages[activeTab as keyof typeof emptyMessages];
      const Icon = message.icon;

      return (
        <Card>
          <CardContent className="py-12 text-center space-y-4">
            <Icon className="h-16 w-16 mx-auto text-gray-300" />
            <div>
              <h3 className="font-semibold text-lg">{message.title}</h3>
              <p className="text-gray-500 mt-2">{message.description}</p>
            </div>
            {activeTab === 'all' && (
              <Button
                onClick={() => router.push('/teacher/products/create')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Product
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showActions
            onEdit={() => handleEdit(product.id)}
            onDelete={() => handleDelete(product.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-2">
              Manage your courses, PDFs, and tutoring services
            </p>
          </div>
          <Button
            onClick={() => router.push('/teacher/products/create')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{allProducts.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {10 - allProducts.length} slots remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingProducts.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedProducts.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Live products</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedProducts.length}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-gray-500 mt-2">Needs revision</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({allProducts.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingProducts.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedProducts.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedProducts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {renderProductsGrid(allProducts)}
          </TabsContent>

          <TabsContent value="pending">
            {renderProductsGrid(pendingProducts)}
          </TabsContent>

          <TabsContent value="approved">
            {renderProductsGrid(approvedProducts)}
          </TabsContent>

          <TabsContent value="rejected">
            {renderProductsGrid(rejectedProducts)}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}