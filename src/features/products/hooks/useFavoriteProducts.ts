import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { toApiError } from '../../../services/api/apiError';
import { PRODUCTS_PAGE_LIMIT, productsService } from '../services/products.service';
import type { FavoriteProduct, PaginationMeta, ProductListItem } from '../types/product';

const INITIAL_META: PaginationMeta = {
  page: 1,
  limit: PRODUCTS_PAGE_LIMIT,
  total: 0,
  totalPages: 0,
};

export function useFavoriteProducts() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(INITIAL_META);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const productsRef = useRef<FavoriteProduct[]>([]);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  const loadFavorites = useCallback(
    async (preserveCurrentItems = true) => {
      if (isAuthLoading) {
        return;
      }

      if (!isAuthenticated) {
        setProducts([]);
        setMeta(INITIAL_META);
        setErrorMessage(null);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      const hasCurrentItems =
        preserveCurrentItems && productsRef.current.length > 0;

      setErrorMessage(null);

      if (hasCurrentItems) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await productsService.listFavoriteProducts({
          page: 1,
          limit: PRODUCTS_PAGE_LIMIT,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setProducts(response.data);
        setMeta(response.meta);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        toApiError(error);
        setErrorMessage('Não foi possível carregar seus favoritos.');

        if (!hasCurrentItems) {
          setProducts([]);
          setMeta(INITIAL_META);
        }
      } finally {
        if (requestId !== requestIdRef.current) {
          return;
        }

        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isAuthenticated, isAuthLoading],
  );

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    loadFavorites();
  }, [isAuthLoading, loadFavorites]);

  const retry = useCallback(() => {
    loadFavorites(false);
  }, [loadFavorites]);

  const refresh = useCallback(() => {
    loadFavorites(true);
  }, [loadFavorites]);

  const removeProduct = useCallback((productId: string) => {
    setProducts(currentProducts =>
      currentProducts.filter(product => product.id !== productId),
    );
    setMeta(currentMeta => {
      const hasProduct = productsRef.current.some(product => product.id === productId);

      if (!hasProduct) {
        return currentMeta;
      }

      return {
        ...currentMeta,
        total: Math.max(currentMeta.total - 1, 0),
      };
    });
  }, []);

  const upsertProduct = useCallback((product: ProductListItem) => {
    const nextFavoriteProduct: FavoriteProduct = {
      ...product,
      isFavorite: true,
    };

    setProducts(currentProducts => {
      const currentIndex = currentProducts.findIndex(
        currentProduct => currentProduct.id === product.id,
      );

      if (currentIndex === 0) {
        return [nextFavoriteProduct, ...currentProducts.slice(1)];
      }

      if (currentIndex > 0) {
        const filteredProducts = currentProducts.filter(
          currentProduct => currentProduct.id !== product.id,
        );

        return [nextFavoriteProduct, ...filteredProducts];
      }

      return [nextFavoriteProduct, ...currentProducts];
    });

    setMeta(currentMeta => {
      const hasProduct = productsRef.current.some(
        currentProduct => currentProduct.id === product.id,
      );

      if (hasProduct) {
        return currentMeta;
      }

      return {
        ...currentMeta,
        total: currentMeta.total + 1,
      };
    });
  }, []);

  return {
    products,
    meta,
    isLoading,
    isRefreshing,
    isError: Boolean(errorMessage) && products.length === 0,
    isEmpty: !isLoading && !errorMessage && products.length === 0,
    errorMessage,
    retry,
    refresh,
    removeProduct,
    upsertProduct,
  };
}
