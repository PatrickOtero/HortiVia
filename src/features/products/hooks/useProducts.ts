import { useCallback, useEffect, useRef, useState } from 'react';
import { toApiError } from '../../../services/api/apiError';
import { PRODUCT_CATEGORY_OPTIONS } from '../mappers/product.mapper';
import {
  PRODUCTS_PAGE_LIMIT,
  productsService,
} from '../services/products.service';
import type {
  PaginationMeta,
  ProductCategoryFilter,
  ProductListItem,
} from '../types/product';

type UseProductsOptions = {
  activeCategory: ProductCategoryFilter;
  searchQuery: string;
};

type LoadProductsOptions = {
  preserveCurrentItems?: boolean;
};

const INITIAL_META: PaginationMeta = {
  page: 1,
  limit: PRODUCTS_PAGE_LIMIT,
  total: 0,
  totalPages: 0,
};

export function useProducts({
  activeCategory,
  searchQuery,
}: UseProductsOptions) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(INITIAL_META);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    searchQuery.trim(),
  );
  const productsRef = useRef<ProductListItem[]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 350);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  const loadProducts = useCallback(async (options?: LoadProductsOptions) => {
    const preserveCurrentItems = options?.preserveCurrentItems ?? true;
    const hasCurrentItems = preserveCurrentItems && productsRef.current.length > 0;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setErrorMessage(null);

    if (hasCurrentItems) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await productsService.listProducts({
        search: debouncedSearchQuery || undefined,
        category: activeCategory === 'ALL' ? undefined : activeCategory,
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
      setErrorMessage('Não foi possível carregar os produtos.');

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
  }, [activeCategory, debouncedSearchQuery]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  function retry() {
    loadProducts({ preserveCurrentItems: false });
  }

  function refresh() {
    loadProducts({ preserveCurrentItems: true });
  }

  return {
    categories: PRODUCT_CATEGORY_OPTIONS,
    products,
    meta,
    isLoading,
    isRefreshing,
    isError: Boolean(errorMessage) && products.length === 0,
    isEmpty: !isLoading && !errorMessage && products.length === 0,
    errorMessage,
    retry,
    refresh,
  };
}
