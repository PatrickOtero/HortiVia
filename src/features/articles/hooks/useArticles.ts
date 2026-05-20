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

export function useArticles({ activeCategory }: UseArticlesOptions) {
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(INITIAL_META);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const articlesRef = useRef<ArticleListItem[]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  const loadArticles = useCallback(async (options?: LoadArticlesOptions) => {
    const preserveCurrentItems = options?.preserveCurrentItems ?? true;
    const hasCurrentItems = preserveCurrentItems && articlesRef.current.length > 0;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setErrorMessage(null);

    if (hasCurrentItems) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await articlesService.listArticles({
        category: activeCategory === 'ALL' ? undefined : activeCategory,
        page: 1,
        limit: ARTICLES_PAGE_LIMIT,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setArticles(response.data);
      setMeta(response.meta);
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setErrorMessage('Nao foi possivel carregar os artigos.');

      if (!hasCurrentItems) {
        setArticles([]);
        setMeta(INITIAL_META);
      }
    } finally {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  function retry() {
    loadArticles({ preserveCurrentItems: false });
  }

  function refresh() {
    loadArticles({ preserveCurrentItems: true });
  }

  return {
    categories: ARTICLE_CATEGORY_OPTIONS,
    articles,
    meta,
    isLoading,
    isRefreshing,
    isError: Boolean(errorMessage) && articles.length === 0,
    isEmpty: !isLoading && !errorMessage && articles.length === 0,
    errorMessage,
    canOpenArticle: true,
    retry,
    refresh,
  };
}
