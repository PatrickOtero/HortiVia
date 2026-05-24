import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError } from '../../../services/api/apiError';
import { productsService } from '../services/products.service';
import type { ProductDetail } from '../types/product';

type UseProductByIdOptions = {
  productId?: string;
};

export function useProductById({ productId }: UseProductByIdOptions) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const requestIdRef = useRef(0);

  const loadProduct = useCallback(async () => {
    if (!productId) {
      setProduct(null);
      setIsNotFound(true);
      setErrorMessage('Produto não encontrado.');
      setIsLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setErrorMessage(null);
    setIsNotFound(false);

    try {
      const nextProduct = await productsService.getProductById(productId);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setProduct(nextProduct);
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const apiError = toApiError(error);
      const missingProduct = apiError.status === 404;

      setProduct(null);
      setIsNotFound(missingProduct);
      setErrorMessage(
        missingProduct
          ? 'Produto não encontrado.'
          : 'Não foi possível carregar este produto.',
      );
    } finally {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  function retry() {
    loadProduct();
  }

  return {
    product,
    isLoading,
    isNotFound,
    errorMessage,
    retry,
  };
}
