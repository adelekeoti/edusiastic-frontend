// src/lib/hooks/usePurchaseStatus.ts
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store/authStore';

interface PurchaseCheckResponse {
  success: boolean;
  message?: string;
  data?: {
    isPurchased: boolean;
    purchase?: {
      id: string;
      purchasedAt: string | null;
      subscriptionStatus?: string | null;
      startDate?: string | null;
      endDate?: string | null;
      isAutoRenewal?: boolean;
    };
  };
}

// Get API base URL from environment or default to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function usePurchaseStatus(productId: string) {
  const { isAuthenticated, token } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery<PurchaseCheckResponse>({
    queryKey: ['purchase-status', productId],
    queryFn: async () => {
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        console.warn('No authentication token found');
        // Return not purchased if no token
        return {
          success: true,
          data: {
            isPurchased: false,
          }
        };
      }

      const url = `${API_BASE_URL}/api/purchases/check/${productId}`;
      console.log('=== Checking Purchase Status ===');
      console.log('URL:', url);
      console.log('Product ID:', productId);
      console.log('Has Token:', !!authToken);

      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        console.log('Response OK:', response.ok);

        // Handle different response statuses
        if (response.status === 404) {
          // 404 typically means not purchased
          console.log('Product not purchased (404)');
          return {
            success: true,
            data: {
              isPurchased: false,
            }
          };
        }

        if (!response.ok) {
          // Try to get error details
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = {
              message: `HTTP ${response.status}: ${response.statusText}`
            };
          }
          
          console.error('Purchase check failed:', errorData);
          console.error('Response status:', response.status);
          console.error('Response statusText:', response.statusText);
          
          // For other errors, return not purchased rather than throwing
          // This prevents the UI from breaking
          console.warn('Assuming not purchased due to error');
          return {
            success: true,
            data: {
              isPurchased: false,
            }
          };
        }

        const result = await response.json();
        console.log('Purchase check result:', result);
        console.log('Is Purchased:', result.data?.isPurchased);
        
        return result;
      } catch (err) {
        console.error('Network error checking purchase:', err);
        // On network error, assume not purchased
        return {
          success: true,
          data: {
            isPurchased: false,
          }
        };
      }
    },
    enabled: !!productId && isAuthenticated,
    staleTime: 0, // Always consider data stale
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
    retry: false, // Don't retry - just use the fallback
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  const isPurchased = data?.data?.isPurchased ?? false;
  const purchase = data?.data?.purchase;

  console.log('usePurchaseStatus hook result:', {
    isPurchased,
    purchase,
    isLoading,
    error: error?.message,
    hasData: !!data
  });

  return {
    isPurchased,
    purchase,
    isLoading,
    error,
    refetch, // Export refetch function
  };
}