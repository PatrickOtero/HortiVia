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

function mergeProducts(
  current: ProductListItem[],
  incoming: ProductListItem[],
): ProductListItem[] {
  const ids = new Set(current.map(product => product.id));
  const additions = incoming.filter(product => {
    if (ids.has(product.id)) {
      return false;
    }
    ids.add(product.id);
    return true;
  });
  return [...current, ...additions];
}

export function useProducts({
  activeCategory,
  searchQuery,
}: UseProductsOptions) {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(INITIAL_META);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(
    searchQuery.trim(),
  );
  const productsRef = useRef<ProductListItem[]>([]);
  const metaRef = useRef<PaginationMeta>(INITIAL_META);
  const requestIdRef = useRef(0);
  const nextPageRequestIdRef = useRef<number | null>(null);
  const firstPageRequestIdRef = useRef<number | null>(null);
  const currentFilterKey = `${activeCategory}:${searchQuery.trim()}`;
  const currentFilterKeyRef = useRef(currentFilterKey);
  currentFilterKeyRef.current = currentFilterKey;
  const isSearchPending = searchQuery.trim() !== debouncedSearchQuery;
  const isSearchPendingRef = useRef(isSearchPending);
  isSearchPendingRef.current = isSearchPending;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    requestIdRef.current += 1;
    firstPageRequestIdRef.current = null;
    nextPageRequestIdRef.current = null;
    productsRef.current = [];
    metaRef.current = INITIAL_META;
    setProducts([]);
    setMeta(INITIAL_META);
    setErrorMessage(null);
    setLoadMoreError(null);
    setIsLoading(true);
    setIsRefreshing(false);
    setIsLoadingMore(false);
  }, [currentFilterKey]);

  const loadProducts = useCallback(async (options?: LoadProductsOptions) => {
    if (isSearchPendingRef.current || firstPageRequestIdRef.current !== null) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    firstPageRequestIdRef.current = requestId;
    nextPageRequestIdRef.current = null;
    const filterKey = currentFilterKeyRef.current;
    const preserveCurrentItems = options?.preserveCurrentItems ?? true;
    const hasCurrentItems = preserveCurrentItems && productsRef.current.length > 0;

    setErrorMessage(null);
    setLoadMoreError(null);
    setIsLoadingMore(false);
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

      if (
        requestId !== requestIdRef.current ||
        filterKey !== currentFilterKeyRef.current
      ) {
        return;
      }

      productsRef.current = response.data;
      metaRef.current = response.meta;
      setProducts(response.data);
      setMeta(response.meta);
    } catch (error) {
      if (
        requestId !== requestIdRef.current ||
        filterKey !== currentFilterKeyRef.current
      ) {
        return;
      }

      toApiError(error);
      setErrorMessage('Não foi possível carregar os produtos.');

      if (!hasCurrentItems) {
        productsRef.current = [];
        metaRef.current = INITIAL_META;
        setProducts([]);
        setMeta(INITIAL_META);
      }
    } finally {
      if (firstPageRequestIdRef.current === requestId) {
        firstPageRequestIdRef.current = null;
      }
      if (
        requestId === requestIdRef.current &&
        filterKey === currentFilterKeyRef.current
      ) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [activeCategory, debouncedSearchQuery]);

  useEffect(() => {
    if (!isSearchPending) {
      loadProducts().catch(() => undefined);
    }
  }, [isSearchPending, loadProducts]);

  const loadMore = useCallback(async () => {
    if (
      isSearchPendingRef.current ||
      firstPageRequestIdRef.current !== null ||
      nextPageRequestIdRef.current !== null ||
      metaRef.current.page >= metaRef.current.totalPages
    ) {
      return;
    }

    const requestId = requestIdRef.current;
    const filterKey = currentFilterKeyRef.current;
    const nextPage = metaRef.current.page + 1;
    nextPageRequestIdRef.current = requestId;
    setLoadMoreError(null);
    setIsLoadingMore(true);

    try {
      const response = await productsService.listProducts({
        search: debouncedSearchQuery || undefined,
        category: activeCategory === 'ALL' ? undefined : activeCategory,
        page: nextPage,
        limit: PRODUCTS_PAGE_LIMIT,
      });

      if (
        requestId !== requestIdRef.current ||
        filterKey !== currentFilterKeyRef.current
      ) {
        return;
      }

      const mergedProducts = mergeProducts(productsRef.current, response.data);
      productsRef.current = mergedProducts;
      metaRef.current = response.meta;
      setProducts(mergedProducts);
      setMeta(response.meta);
    } catch {
      if (
        requestId === requestIdRef.current &&
        filterKey === currentFilterKeyRef.current
      ) {
        setLoadMoreError('Não foi possível carregar mais produtos.');
      }
    } finally {
      if (nextPageRequestIdRef.current === requestId) {
        nextPageRequestIdRef.current = null;
      }
      if (
        requestId === requestIdRef.current &&
        filterKey === currentFilterKeyRef.current
      ) {
        setIsLoadingMore(false);
      }
    }
  }, [activeCategory, debouncedSearchQuery]);

  function retry() {
    loadProducts({ preserveCurrentItems: false }).catch(() => undefined);
  }

  function refresh() {
    loadProducts({ preserveCurrentItems: true }).catch(() => undefined);
  }

  return {
    categories: PRODUCT_CATEGORY_OPTIONS,
    products,
    meta,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore: meta.page < meta.totalPages,
    loadMoreError,
    errorMessage,
    isError: Boolean(errorMessage) && products.length === 0,
    isEmpty: !isLoading && !errorMessage && products.length === 0,
    loadMore,
    retryLoadMore: loadMore,
    retry,
    refresh,
  };
}
