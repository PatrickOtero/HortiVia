import { useCallback, useEffect, useRef, useState } from 'react';
import { ARTICLE_CATEGORY_OPTIONS } from '../mappers/article.mapper';
import {
  ARTICLES_PAGE_LIMIT,
  articlesService,
} from '../services/articles.service';
import type {
  ArticleCategoryFilter,
  ArticleListItem,
  PaginationMeta,
} from '../types/article';

type UseArticlesOptions = {
  activeCategory: ArticleCategoryFilter;
};

type LoadArticlesOptions = {
  preserveCurrentItems?: boolean;
};

const INITIAL_META: PaginationMeta = {
  page: 1,
  limit: ARTICLES_PAGE_LIMIT,
  total: 0,
  totalPages: 0,
};

function mergeArticles(
  current: ArticleListItem[],
  incoming: ArticleListItem[],
): ArticleListItem[] {
  const ids = new Set(current.map(article => article.id));
  const additions = incoming.filter(article => {
    if (ids.has(article.id)) {
      return false;
    }
    ids.add(article.id);
    return true;
  });
  return [...current, ...additions];
}

export function useArticles({ activeCategory }: UseArticlesOptions) {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(INITIAL_META);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const articlesRef = useRef<ArticleListItem[]>([]);
  const metaRef = useRef<PaginationMeta>(INITIAL_META);
  const requestIdRef = useRef(0);
  const firstPageRequestIdRef = useRef<number | null>(null);
  const nextPageRequestIdRef = useRef<number | null>(null);
  const paginationFailedRef = useRef(false);
  const currentCategoryRef = useRef(activeCategory);
  currentCategoryRef.current = activeCategory;

  useEffect(() => {
    requestIdRef.current += 1;
    firstPageRequestIdRef.current = null;
    nextPageRequestIdRef.current = null;
    paginationFailedRef.current = false;
    articlesRef.current = [];
    metaRef.current = INITIAL_META;
    setArticles([]);
    setMeta(INITIAL_META);
    setErrorMessage(null);
    setLoadMoreError(null);
    setIsLoading(true);
    setIsRefreshing(false);
    setIsLoadingMore(false);
  }, [activeCategory]);

  const loadArticles = useCallback(async (options?: LoadArticlesOptions) => {
    if (firstPageRequestIdRef.current !== null) {
      return;
    }

    const preserveCurrentItems = options?.preserveCurrentItems ?? true;
    const hasCurrentItems = preserveCurrentItems && articlesRef.current.length > 0;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    firstPageRequestIdRef.current = requestId;
    nextPageRequestIdRef.current = null;
    paginationFailedRef.current = false;
    const category = currentCategoryRef.current;

    setErrorMessage(null);
    setLoadMoreError(null);
    setIsLoadingMore(false);

    if (hasCurrentItems) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await articlesService.listArticles({
        category: category === 'ALL' ? undefined : category,
        page: 1,
        limit: ARTICLES_PAGE_LIMIT,
      });

      if (
        requestId !== requestIdRef.current ||
        category !== currentCategoryRef.current
      ) {
        return;
      }

      articlesRef.current = response.data;
      metaRef.current = response.meta;
      setArticles(response.data);
      setMeta(response.meta);
    } catch {
      if (
        requestId !== requestIdRef.current ||
        category !== currentCategoryRef.current
      ) {
        return;
      }

      setErrorMessage('Não foi possível carregar os artigos.');

      if (!hasCurrentItems) {
        articlesRef.current = [];
        metaRef.current = INITIAL_META;
        setArticles([]);
        setMeta(INITIAL_META);
      }
    } finally {
      if (firstPageRequestIdRef.current === requestId) {
        firstPageRequestIdRef.current = null;
      }

      if (
        requestId === requestIdRef.current &&
        category === currentCategoryRef.current
      ) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    loadArticles().catch(() => undefined);
  }, [activeCategory, loadArticles]);

  const loadMorePage = useCallback(async () => {
    if (
      paginationFailedRef.current ||
      firstPageRequestIdRef.current !== null ||
      nextPageRequestIdRef.current !== null ||
      metaRef.current.page >= metaRef.current.totalPages
    ) {
      return;
    }

    const requestId = requestIdRef.current;
    const category = currentCategoryRef.current;
    const nextPage = metaRef.current.page + 1;
    nextPageRequestIdRef.current = requestId;
    setLoadMoreError(null);
    setIsLoadingMore(true);

    try {
      const response = await articlesService.listArticles({
        category: category === 'ALL' ? undefined : category,
        page: nextPage,
        limit: ARTICLES_PAGE_LIMIT,
      });

      if (
        requestId !== requestIdRef.current ||
        category !== currentCategoryRef.current
      ) {
        return;
      }

      const mergedArticles = mergeArticles(articlesRef.current, response.data);
      paginationFailedRef.current = false;
      articlesRef.current = mergedArticles;
      metaRef.current = response.meta;
      setArticles(mergedArticles);
      setMeta(response.meta);
    } catch {
      if (
        requestId === requestIdRef.current &&
        category === currentCategoryRef.current
      ) {
        paginationFailedRef.current = true;
        setLoadMoreError('Não foi possível carregar mais artigos.');
      }
    } finally {
      if (nextPageRequestIdRef.current === requestId) {
        nextPageRequestIdRef.current = null;
      }
      if (
        requestId === requestIdRef.current &&
        category === currentCategoryRef.current
      ) {
        setIsLoadingMore(false);
      }
    }
  }, []);

  const loadMore = useCallback(() => {
    if (paginationFailedRef.current) {
      return Promise.resolve();
    }
    return loadMorePage();
  }, [loadMorePage]);

  const retryLoadMore = useCallback(() => {
    if (!paginationFailedRef.current) {
      return Promise.resolve();
    }
    paginationFailedRef.current = false;
    setLoadMoreError(null);
    return loadMorePage();
  }, [loadMorePage]);

  function retry() {
    loadArticles({ preserveCurrentItems: false }).catch(() => undefined);
  }

  function refresh() {
    loadArticles({ preserveCurrentItems: true }).catch(() => undefined);
  }

  return {
    categories: ARTICLE_CATEGORY_OPTIONS,
    articles,
    meta,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasMore: meta.page < meta.totalPages,
    loadMoreError,
    isError: Boolean(errorMessage) && articles.length === 0,
    isEmpty: !isLoading && !errorMessage && articles.length === 0,
    errorMessage,
    canOpenArticle: true,
    loadMore,
    retryLoadMore,
    retry,
    refresh,
  };
}
