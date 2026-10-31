import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError } from '../../../services/api/apiError';
import { productsService } from '../../products/services/products.service';
import type { ProductListItem } from '../../products/types/product';
import {
  ADMIN_REMOVE_ERROR_MESSAGE,
  isAdminAccessDeniedError,
} from '../utils/adminFeedback';

const ADMIN_PRODUCTS_PAGE_SIZE = 20;

export function useAdminProducts() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [hasAccessDeniedError, setHasAccessDeniedError] = useState(false);
  const isMounted = useRef(true);
  const requestId = useRef(0);
  const isLoadingRef = useRef(false);
  const deletionsInFlight = useRef(new Set<string>());

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      requestId.current += 1;
    };
  }, []);

  const loadProducts = useCallback(async (refresh = false) => {
    if (isLoadingRef.current) return;

    const currentRequestId = ++requestId.current;
    isLoadingRef.current = true;
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const response = await productsService.getProducts({
        page: 1,
        limit: ADMIN_PRODUCTS_PAGE_SIZE,
      });
      if (!isMounted.current || currentRequestId !== requestId.current) return;

      setProducts(response.data);
      setErrorMessage('');
      setHasAccessDeniedError(false);
    } catch (error) {
      if (!isMounted.current || currentRequestId !== requestId.current) return;
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        setErrorMessage('');
      } else {
        toApiError(error);
        setErrorMessage('Não foi possível carregar os produtos.');
      }
    } finally {
      if (isMounted.current && currentRequestId === requestId.current) {
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  const deleteProduct = useCallback(
    async (productId: string) => {
      if (deletionsInFlight.current.has(productId)) return false;

      deletionsInFlight.current.add(productId);
      setDeletingIds(current => [...current, productId]);
      setFeedbackMessage('');

      try {
        await productsService.deleteProduct(productId);
        if (!isMounted.current) return true;

        setFeedbackMessage('Produto removido.');
        setErrorMessage('');
        setProducts(current =>
          current.filter(product => product.id !== productId),
        );

        // A remoção invalida qualquer lista iniciada antes da operação.
        requestId.current += 1;
        isLoadingRef.current = false;
        setIsLoading(false);
        setIsRefreshing(false);
        await loadProducts(true);
        return true;
      } catch (error) {
        if (!isMounted.current) return false;
        if (isAdminAccessDeniedError(error)) {
          setHasAccessDeniedError(true);
        } else {
          setErrorMessage(ADMIN_REMOVE_ERROR_MESSAGE);
        }
        return false;
      } finally {
        deletionsInFlight.current.delete(productId);
        if (isMounted.current) {
          setDeletingIds(current => current.filter(id => id !== productId));
        }
      }
    },
    [loadProducts],
  );

  const isDeletingProduct = useCallback(
    (productId: string) => deletingIds.includes(productId),
    [deletingIds],
  );

  return {
    products,
    isLoading,
    isRefreshing,
    errorMessage,
    feedbackMessage,
    hasAccessDeniedError,
    loadProducts,
    deleteProduct,
    isDeletingProduct,
  };
}
