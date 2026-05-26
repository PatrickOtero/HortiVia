import { useCallback, useEffect, useState } from 'react';
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshRecentProducts = useCallback(async () => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const nextProducts = await getRecentProducts();
      setRecentProducts(nextProducts);
    } catch (error) {
      toApiError(error);
      setRecentProducts([]);
      setErrorMessage('Não foi possível carregar os produtos recentes.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRecentProducts();
  }, [refreshRecentProducts]);

  async function handleClearRecentProducts() {
    await clearRecentProducts();
    setRecentProducts([]);
  }

  async function handleRemoveRecentProduct(productId: string) {
    const nextProducts = await removeRecentProduct(productId);
    setRecentProducts(nextProducts);
  }

  return {
    recentProducts,
    isLoading,
    errorMessage,
    refreshRecentProducts,
    clearRecentProducts: handleClearRecentProducts,
    removeRecentProduct: handleRemoveRecentProduct,
  };
}
