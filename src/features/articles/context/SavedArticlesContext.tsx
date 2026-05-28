import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { toApiError } from '../../../services/api/apiError';
import {
  ARTICLES_PAGE_LIMIT,
  articlesService,
} from '../services/articles.service';
import type {
  ArticleDetail,
  ArticleListItem,
  PaginationMeta,
  SavedArticle,
} from '../types/article';

const INITIAL_META: PaginationMeta = {
  page: 1,
  limit: ARTICLES_PAGE_LIMIT,
  total: 0,
  totalPages: 0,
};

type SavedArticleCandidate = ArticleListItem | ArticleDetail;

type SavedArticlesContextValue = {
  articles: SavedArticle[];
  meta: PaginationMeta;
  isLoading: boolean;
  isRefreshing: boolean;
  isError: boolean;
  isEmpty: boolean;
  errorMessage: string | null;
  savedArticleIds: Set<string>;
  savedArticleLoadingIds: Set<string>;
  refreshSavedArticles: () => void;
  retrySavedArticles: () => void;
  isArticleSaved: (article: { id: string; isSaved?: boolean }) => boolean;
  isArticleSaveLoading: (articleId: string) => boolean;
  toggleSavedArticle: (article: SavedArticleCandidate) => Promise<boolean>;
};

const SavedArticlesContext = createContext<
  SavedArticlesContextValue | undefined
>(undefined);

type SavedArticlesProviderProps = {
  children: ReactNode;
};

function toSavedArticle(article: SavedArticleCandidate): SavedArticle {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    summary: article.summary,
    category: article.category,
    imageUrl: article.imageUrl ?? null,
    subtitle: article.subtitle,
    coverImageUrl: article.coverImageUrl ?? null,
    coverImageAlt: article.coverImageAlt,
    tags: Array.isArray(article.tags) ? article.tags : [],
    publishedAt: article.publishedAt,
    readingTimeMinutes: article.readingTimeMinutes,
    featured: article.featured ?? false,
    author: article.author,
    reactionsCount: article.reactionsCount ?? 0,
    isReacted: article.isReacted ?? false,
    isSaved: true,
  };
}

export function SavedArticlesProvider({
  children,
}: SavedArticlesProviderProps) {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>(INITIAL_META);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const requestIdRef = useRef(0);
  const articlesRef = useRef<SavedArticle[]>([]);

  useEffect(() => {
    articlesRef.current = articles;
  }, [articles]);

  const setSavedArticleLoading = useCallback(
    (articleId: string, nextIsLoading: boolean) => {
      setLoadingIds(currentIds => {
        const nextIds = new Set(currentIds);

        if (nextIsLoading) {
          nextIds.add(articleId);
        } else {
          nextIds.delete(articleId);
        }

        return Array.from(nextIds);
      });
    },
    [],
  );

  const loadSavedArticles = useCallback(
    async (preserveCurrentItems = true) => {
      if (isAuthLoading) {
        return;
      }

      if (!isAuthenticated) {
        setArticles([]);
        setMeta(INITIAL_META);
        setErrorMessage(null);
        setIsLoading(false);
        setIsRefreshing(false);
        setLoadingIds([]);
        return;
      }

      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      const hasCurrentItems =
        preserveCurrentItems && articlesRef.current.length > 0;

      setErrorMessage(null);

      if (hasCurrentItems) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await articlesService.listSavedArticles({
          page: 1,
          limit: ARTICLES_PAGE_LIMIT,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setArticles(response.data);
        setMeta(response.meta);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        toApiError(error);
        setErrorMessage('Não foi possível carregar suas leituras salvas.');

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
    },
    [isAuthenticated, isAuthLoading],
  );

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    loadSavedArticles();
  }, [isAuthLoading, loadSavedArticles]);

  const upsertArticle = useCallback((article: SavedArticleCandidate) => {
    const nextSavedArticle = toSavedArticle(article);

    setArticles(currentArticles => {
      const currentIndex = currentArticles.findIndex(
        currentArticle => currentArticle.id === article.id,
      );

      if (currentIndex === 0) {
        return [nextSavedArticle, ...currentArticles.slice(1)];
      }

      if (currentIndex > 0) {
        const filteredArticles = currentArticles.filter(
          currentArticle => currentArticle.id !== article.id,
        );

        return [nextSavedArticle, ...filteredArticles];
      }

      return [nextSavedArticle, ...currentArticles];
    });

    setMeta(currentMeta => {
      const hasArticle = articlesRef.current.some(
        currentArticle => currentArticle.id === article.id,
      );

      if (hasArticle) {
        return currentMeta;
      }

      return {
        ...currentMeta,
        total: currentMeta.total + 1,
      };
    });
  }, []);

  const removeArticle = useCallback((articleId: string) => {
    setArticles(currentArticles =>
      currentArticles.filter(article => article.id !== articleId),
    );
    setMeta(currentMeta => {
      const hasArticle = articlesRef.current.some(
        article => article.id === articleId,
      );

      if (!hasArticle) {
        return currentMeta;
      }

      return {
        ...currentMeta,
        total: Math.max(currentMeta.total - 1, 0),
      };
    });
  }, []);

  const savedArticleIds = useMemo(
    () => new Set(articles.map(article => article.id)),
    [articles],
  );
  const savedArticleLoadingIds = useMemo(
    () => new Set(loadingIds),
    [loadingIds],
  );

  const isArticleSaved = useCallback(
    (article: { id: string; isSaved?: boolean }) =>
      savedArticleIds.has(article.id) || article.isSaved === true,
    [savedArticleIds],
  );

  const isArticleSaveLoading = useCallback(
    (articleId: string) => savedArticleLoadingIds.has(articleId),
    [savedArticleLoadingIds],
  );

  const toggleSavedArticle = useCallback(
    async (article: SavedArticleCandidate) => {
      if (savedArticleLoadingIds.has(article.id)) {
        return isArticleSaved(article);
      }

      const nextIsSaved = !isArticleSaved(article);

      setSavedArticleLoading(article.id, true);

      if (nextIsSaved) {
        upsertArticle(article);
      } else {
        removeArticle(article.id);
      }

      try {
        if (nextIsSaved) {
          await articlesService.saveArticle(article.id);
        } else {
          await articlesService.unsaveArticle(article.id);
        }

        return nextIsSaved;
      } catch (error) {
        if (nextIsSaved) {
          removeArticle(article.id);
        } else {
          upsertArticle(article);
        }

        throw toApiError(error);
      } finally {
        setSavedArticleLoading(article.id, false);
      }
    },
    [
      isArticleSaved,
      removeArticle,
      savedArticleLoadingIds,
      setSavedArticleLoading,
      upsertArticle,
    ],
  );

  const retrySavedArticles = useCallback(() => {
    loadSavedArticles(false);
  }, [loadSavedArticles]);

  const refreshSavedArticles = useCallback(() => {
    loadSavedArticles(true);
  }, [loadSavedArticles]);

  const value = useMemo<SavedArticlesContextValue>(
    () => ({
      articles,
      meta,
      isLoading,
      isRefreshing,
      isError: Boolean(errorMessage) && articles.length === 0,
      isEmpty: !isLoading && !errorMessage && articles.length === 0,
      errorMessage,
      savedArticleIds,
      savedArticleLoadingIds,
      refreshSavedArticles,
      retrySavedArticles,
      isArticleSaved,
      isArticleSaveLoading,
      toggleSavedArticle,
    }),
    [
      articles,
      errorMessage,
      isArticleSaveLoading,
      isArticleSaved,
      isLoading,
      isRefreshing,
      meta,
      refreshSavedArticles,
      retrySavedArticles,
      savedArticleIds,
      savedArticleLoadingIds,
      toggleSavedArticle,
    ],
  );

  return (
    <SavedArticlesContext.Provider value={value}>
      {children}
    </SavedArticlesContext.Provider>
  );
}

export function useSavedArticles() {
  const context = useContext(SavedArticlesContext);

  if (!context) {
    throw new Error(
      'useSavedArticles must be used within SavedArticlesProvider',
    );
  }

  return context;
}

export function useOptionalSavedArticles() {
  return useContext(SavedArticlesContext);
}
