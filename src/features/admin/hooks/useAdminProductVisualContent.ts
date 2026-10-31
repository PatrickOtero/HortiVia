import { useCallback, useEffect, useRef, useState } from 'react';
import { productsService } from '../../products/services/products.service';
import type { ProductDetail } from '../../products/types/product';
import { isAdminAccessDeniedError } from '../utils/adminFeedback';
import { toApiError } from '../../../services/api/apiError';

export function useAdminProductVisualContent(productId: string) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasAccessDeniedError, setHasAccessDeniedError] = useState(false);
  const requestId = useRef(0);
  const hasLoadedProduct = useRef(false);

  const refresh = useCallback(async () => {
    const request = ++requestId.current;
    setErrorMessage('');
    setHasAccessDeniedError(false);
    if (!hasLoadedProduct.current) setIsLoading(true);

    try {
      const nextProduct = await productsService.getProductById(productId);
      if (request !== requestId.current) return;
      hasLoadedProduct.current = true;
      setProduct(nextProduct);
    } catch (error) {
      if (request !== requestId.current) return;
      if (isAdminAccessDeniedError(error)) {
        setHasAccessDeniedError(true);
        return;
      }
      toApiError(error);
      setErrorMessage('Não foi possível carregar o conteúdo visual.');
    } finally {
      if (request === requestId.current) setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    hasLoadedProduct.current = false;
    setProduct(null);
    setIsLoading(true);
    refresh();
    return () => {
      requestId.current += 1;
    };
  }, [refresh]);

  const markAccessDenied = useCallback(() => setHasAccessDeniedError(true), []);

  return {
    product: product?.id === productId ? product : null,
    isLoading: isLoading || (product !== null && product.id !== productId),
    errorMessage,
    hasAccessDeniedError,
    refresh,
    markAccessDenied,
  };
}
