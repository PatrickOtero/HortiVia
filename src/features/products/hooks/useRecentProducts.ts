import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError } from '../../../services/api/apiError';
import {
  clearRecentProducts,
  getRecentProducts,
  removeRecentProduct,
} from '../storage/recentProducts.storage';
import type { RecentProduct } from '../types/product';

export function useRecentProducts() {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recentProductsRef = useRef<RecentProduct[]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    recentProductsRef.current = recentProducts;
  }, [recentProducts]);

  const refreshRecentProducts = useCallback(
    async (preserveCurrentItems = true) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      const hasCurrentItems =
        preserveCurrentItems && recentProductsRef.current.length > 0;

      setErrorMessage(null);

      if (hasCurrentItems) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const nextProducts = await getRecentProducts();

        if (requestId !== requestIdRef.current) {
          return;
        }

        setRecentProducts(nextProducts);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        toApiError(error);

        if (!hasCurrentItems) {
          setRecentProducts([]);
        }

        setErrorMessage('Não foi possível carregar os produtos recentes.');
      } finally {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    refreshRecentProducts();
  }, [refreshRecentProducts]);

  const handleClearRecentProducts = useCallback(async () => {
    await clearRecentProducts();
    setRecentProducts([]);
  }, []);

  const handleRemoveRecentProduct = useCallback(async (productId: string) => {
    const nextProducts = await removeRecentProduct(productId);
    setRecentProducts(nextProducts);
  }, []);

  return {
    recentProducts,
    isLoading,
    isRefreshing,
    errorMessage,
    refreshRecentProducts,
    clearRecentProducts: handleClearRecentProducts,
    removeRecentProduct: handleRemoveRecentProduct,
  };
}
