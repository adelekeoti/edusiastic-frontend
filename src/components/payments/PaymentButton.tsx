// src/components/payments/PaymentButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ShoppingCart, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { initializePayment } from '@/lib/api/payments';
import { useAuthStore, useHasHydrated } from '@/lib/store/authStore';
import { Product } from '@/types';

interface PaymentButtonProps {
  product: Product;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary';
  buttonText?: string;
  onPaymentSuccess?: () => void;
  preSelectedChildId?: string; // Child ID passed from parent component
  skipChildSelection?: boolean; // Skip showing child selection dialog
}

interface Child {
  id: string;
  name: string;
  class: string;
}

export function PaymentButton({ 
  product, 
  disabled = false,
  className,
  variant = 'default',
  buttonText,
  onPaymentSuccess,
  preSelectedChildId,
  skipChildSelection = false,
}: PaymentButtonProps) {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuthStore();
  const hasHydrated = useHasHydrated();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string>(preSelectedChildId || '');
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  
  const isParent = user?.role === 'PARENT';

  // Update selected child when prop changes
  useEffect(() => {
    if (preSelectedChildId) {
      setSelectedChildId(preSelectedChildId);
    }
  }, [preSelectedChildId]);

  // Initialize payment mutation
  const initPaymentMutation = useMutation({
    mutationFn: initializePayment,
    onSuccess: (response) => {
      console.log('✅ Payment initialization success:', response);
      if (response.success && response.data) {
        // Store product ID before redirecting
        sessionStorage.setItem('pending-purchase', product.id);
        
        // Redirect to Paystack payment page
        console.log('Redirecting to:', response.data.authorizationUrl);
        window.location.href = response.data.authorizationUrl;
      } else {
        console.error('❌ Payment response missing data:', response);
        toast.error(response.message || 'Failed to initialize payment');
      }
    },
    onError: (error: any) => {
      console.error('❌ Payment initialization error:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', Object.keys(error));
      console.error('Error.message:', error?.message);
      console.error('Error.success:', error?.success);
      console.error('Error.errors:', error?.errors);
      
      // Try to extract any useful info
      console.log('Full error inspection:');
      for (let key in error) {
        console.log(`  ${key}:`, error[key]);
      }
      
      // The axios interceptor returns response.data directly
      const errorMessage = error?.message || error?.errors?.[0] || 'Failed to initialize payment';
      
      console.log('Extracted error message:', errorMessage);
      
      // Check for "already purchased" error - special handling
      if (errorMessage.toLowerCase().includes('already purchased') || 
          errorMessage.toLowerCase().includes('already bought') ||
          errorMessage.toLowerCase().includes('duplicate purchase') ||
          errorMessage.toLowerCase().includes('active subscription')) {
        
        // Override the default error toast with info toast
        toast.dismiss();
        toast.info('You have already purchased this product', {
          description: 'Refreshing purchase status...',
        });
        
        setTimeout(() => {
          if (onPaymentSuccess) {
            console.log('Triggering purchase status refresh');
            onPaymentSuccess();
          }
          window.location.reload();
        }, 1500);
      }
      // For other errors, the interceptor already showed a toast
    },
  });

  // Fetch children for parent users
  const fetchChildren = async () => {
    setIsLoadingChildren(true);
    try {
      console.log('Fetching children...');
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        console.error('No token found for fetching children');
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/children`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      // If 404, the route doesn't exist yet - fail silently
      if (response.status === 404) {
        console.warn('Children endpoint not found - please add backend route');
        setChildren([]);
        return;
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Response is not JSON:', contentType);
        const text = await response.text();
        console.error('Response text:', text.substring(0, 200));
        toast.error('Invalid server response. Please contact support.');
        return;
      }
      
      const data = await response.json();
      console.log('Children response:', data);
      
      if (data.success) {
        setChildren(data.data?.children || []);
        console.log('✅ Children loaded:', data.data?.children?.length || 0);
      } else {
        console.error('Failed to fetch children:', data.message);
        // Only show error if it's not "route not found"
        if (!data.message?.toLowerCase().includes('route not found')) {
          toast.error(data.message || 'Failed to load children list');
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching children:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
      // Don't show toast for network errors - backend might not be ready
      console.warn('Skipping children fetch - backend endpoint may not exist yet');
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('=== Button Clicked ===');
    console.log('Has Hydrated:', hasHydrated);
    console.log('User:', user);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('User Role:', user?.role);
    console.log('Product:', product);
    console.log('Disabled:', disabled);
    console.log('Pre-selected Child ID:', preSelectedChildId);
    console.log('Skip Child Selection:', skipChildSelection);
    console.log('====================');
    
    // Wait for hydration before checking auth
    if (!hasHydrated) {
      console.log('⏳ Store not hydrated yet, waiting...');
      toast.error('Loading user session...');
      return;
    }

    // Check if button should be disabled
    if (disabled) {
      console.warn('Button is disabled');
      toast.error('This product is not available for purchase');
      return;
    }

    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      toast.error('Please login to purchase');
      router.push('/login');
      return;
    }

    if (!user) {
      console.log('❌ No user found in store');
      toast.error('User session not found. Please login again.');
      router.push('/login');
      return;
    }

    // Only students and parents can purchase
    if (user.role !== 'STUDENT' && user.role !== 'PARENT') {
      console.log('❌ Invalid role for purchase:', user.role);
      toast.error('Only students and parents can make purchases');
      return;
    }

    console.log('✅ User role valid, proceeding...');

    // If parent, handle child selection
    if (isParent) {
      // If skipChildSelection is true and we have a preSelectedChildId, proceed directly
      if (skipChildSelection && preSelectedChildId) {
        console.log('👨‍👩‍👧‍👦 Parent with pre-selected child, proceeding directly');
        handleInitializePayment(preSelectedChildId);
      } else {
        // Show child selection dialog
        console.log('👨‍👩‍👧‍👦 User is parent, showing child selection');
        fetchChildren();
        setShowDialog(true);
      }
    } else {
      // Direct purchase for students
      console.log('👨‍🎓 User is student, initializing payment directly');
      handleInitializePayment();
    }
  };

  const handleInitializePayment = (childId?: string) => {
    console.log('=== Initializing Payment ===');
    console.log('Product ID:', product.id);
    console.log('Product Title:', product.title);
    console.log('Product Price:', product.price);
    console.log('Child ID:', childId);
    console.log('User ID:', user?.id);
    console.log('Token exists:', !!token);
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('==========================');
    
    const paymentData = {
      productId: product.id,
      childId: childId || undefined,
    };
    
    console.log('Payment data being sent:', JSON.stringify(paymentData, null, 2));
    console.log('About to call mutation...');
    
    initPaymentMutation.mutate(paymentData);
  };

  const handleParentPurchase = () => {
    console.log('=== Parent Purchase Confirmation ===');
    console.log('Selected Child ID:', selectedChildId);
    console.log('Available Children:', children.length);
    
    if (isParent && !selectedChildId && children.length > 0) {
      console.warn('No child selected');
      toast.error('Please select a child for this purchase');
      return;
    }
    
    setShowDialog(false);
    handleInitializePayment(selectedChildId || undefined);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(price);
  };

  // Determine button text based on product type
  const getButtonText = () => {
    if (buttonText) return buttonText;
    
    switch (product.type) {
      case 'SUBSCRIPTION':
        return 'Enroll Now';
      case 'PDF':
        return 'Purchase PDF';
      case 'HOME_TUTORING':
        return 'Book Tutoring';
      default:
        return 'Buy Now';
    }
  };

  // Button is disabled if explicitly disabled, pending payment, or store not hydrated
  const isButtonDisabled = disabled || initPaymentMutation.isPending || !hasHydrated;

  return (
    <>
      <Button
        onClick={handleBuyClick}
        disabled={isButtonDisabled}
        className={className}
        variant={variant}
        size="lg"
        type="button"
      >
        {!hasHydrated ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : initPaymentMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            {getButtonText()} - {formatPrice(product.price)}
          </>
        )}
      </Button>

      {/* Parent Child Selection Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Purchase
            </DialogTitle>
            <DialogDescription>
              Select which child this purchase is for
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="child-select">Select Child</Label>
              {isLoadingChildren ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading children...</span>
                </div>
              ) : (
                <Select
                  value={selectedChildId}
                  onValueChange={setSelectedChildId}
                >
                  <SelectTrigger id="child-select">
                    <SelectValue placeholder="Choose a child" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No children found
                      </SelectItem>
                    ) : (
                      children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name} - {child.class}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Product:</span>
                <span className="font-medium">{product.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold">{formatPrice(product.price)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                className="flex-1"
                disabled={initPaymentMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleParentPurchase}
                className="flex-1"
                disabled={initPaymentMutation.isPending || children.length === 0 || isLoadingChildren}
              >
                {initPaymentMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}