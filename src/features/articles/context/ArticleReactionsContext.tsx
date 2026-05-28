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
import { toApiError } from '../../../services/api/apiError';
import { articlesService } from '../services/articles.service';
import type {
  ArticleDetail,
  ArticleListItem,
  SavedArticle,
} from '../types/article';

type ArticleReactionCandidate = Pick<
  ArticleListItem | ArticleDetail | SavedArticle,
  'id' | 'isReacted' | 'reactionsCount'
>;

type ArticleReactionState = {
  isReacted: boolean;
  reactionsCount: number;
};

type ArticleReactionsContextValue = {
  reactionLoadingIds: Set<string>;
  syncArticleReactions: (
    article:
      | ArticleReactionCandidate
      | ArticleReactionCandidate[]
      | null
      | undefined,
  ) => void;
  getArticleReactionState: (
    article: ArticleReactionCandidate,
  ) => ArticleReactionState;
  isArticleReactionLoading: (articleId: string) => boolean;
  toggleArticleReaction: (
    article: ArticleReactionCandidate,
  ) => Promise<ArticleReactionState>;
};

const ArticleReactionsContext = createContext<
  ArticleReactionsContextValue | undefined
>(undefined);

type ArticleReactionsProviderProps = {
  children: ReactNode;
};

function normalizeReactionsCount(value: unknown) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(value, 0);
}

function toReactionState(
  article: ArticleReactionCandidate | null | undefined,
): ArticleReactionState {
  return {
    isReacted: article?.isReacted === true,
    reactionsCount: normalizeReactionsCount(article?.reactionsCount),
  };
}

function hasReactionPayload(
  article: ArticleReactionCandidate | null | undefined,
): article is ArticleReactionCandidate {
  return Boolean(
    article &&
      article.id &&
      (article.isReacted !== undefined || article.reactionsCount !== undefined),
  );
}

export function ArticleReactionsProvider({
  children,
}: ArticleReactionsProviderProps) {
  const [reactionStates, setReactionStates] = useState<
    Record<string, ArticleReactionState>
  >({});
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const reactionStatesRef = useRef(reactionStates);
  const loadingIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    reactionStatesRef.current = reactionStates;
  }, [reactionStates]);

  useEffect(() => {
    loadingIdsRef.current = new Set(loadingIds);
  }, [loadingIds]);

  const setArticleReactionLoading = useCallback(
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

  const syncArticleReactions = useCallback(
    (
      articleOrArticles:
        | ArticleReactionCandidate
        | ArticleReactionCandidate[]
        | null
        | undefined,
    ) => {
      const nextArticles = Array.isArray(articleOrArticles)
        ? articleOrArticles
        : articleOrArticles
        ? [articleOrArticles]
        : [];

      if (nextArticles.length === 0) {
        return;
      }

      setReactionStates(currentStates => {
        let hasChanged = false;
        const nextStates = { ...currentStates };

        nextArticles.forEach(article => {
          if (!hasReactionPayload(article)) {
            return;
          }

          if (loadingIdsRef.current.has(article.id)) {
            return;
          }

          const currentState = currentStates[article.id];
          const resolvedState = toReactionState(article);

          if (
            currentState?.isReacted === resolvedState.isReacted &&
            currentState?.reactionsCount === resolvedState.reactionsCount
          ) {
            return;
          }

          nextStates[article.id] = resolvedState;
          hasChanged = true;
        });

        return hasChanged ? nextStates : currentStates;
      });
    },
    [],
  );

  const getArticleReactionState = useCallback(
    (article: ArticleReactionCandidate) =>
      reactionStates[article.id] ?? toReactionState(article),
    [reactionStates],
  );

  const isArticleReactionLoading = useCallback(
    (articleId: string) => loadingIdsRef.current.has(articleId),
    [],
  );

  const toggleArticleReaction = useCallback(
    async (article: ArticleReactionCandidate) => {
      if (loadingIdsRef.current.has(article.id)) {
        return (
          reactionStatesRef.current[article.id] ?? toReactionState(article)
        );
      }

      const previousState =
        reactionStatesRef.current[article.id] ?? toReactionState(article);
      const nextState = previousState.isReacted
        ? {
            isReacted: false,
            reactionsCount: Math.max(previousState.reactionsCount - 1, 0),
          }
        : {
            isReacted: true,
            reactionsCount: previousState.reactionsCount + 1,
          };

      setArticleReactionLoading(article.id, true);
      setReactionStates(currentStates => ({
        ...currentStates,
        [article.id]: nextState,
      }));

      try {
        const response = previousState.isReacted
          ? await articlesService.removeArticleReaction(article.id)
          : await articlesService.reactToArticle(article.id);
        const resolvedState = {
          isReacted: response.isReacted,
          reactionsCount: normalizeReactionsCount(response.reactionsCount),
        };

        setReactionStates(currentStates => ({
          ...currentStates,
          [article.id]: resolvedState,
        }));

        return resolvedState;
      } catch (error) {
        setReactionStates(currentStates => ({
          ...currentStates,
          [article.id]: previousState,
        }));

        throw toApiError(error);
      } finally {
        setArticleReactionLoading(article.id, false);
      }
    },
    [setArticleReactionLoading],
  );

  const value = useMemo<ArticleReactionsContextValue>(
    () => ({
      reactionLoadingIds: new Set(loadingIds),
      syncArticleReactions,
      getArticleReactionState,
      isArticleReactionLoading,
      toggleArticleReaction,
    }),
    [
      getArticleReactionState,
      isArticleReactionLoading,
      loadingIds,
      syncArticleReactions,
      toggleArticleReaction,
    ],
  );

  return (
    <ArticleReactionsContext.Provider value={value}>
      {children}
    </ArticleReactionsContext.Provider>
  );
}

export function useArticleReactions() {
  const context = useContext(ArticleReactionsContext);

  if (!context) {
    throw new Error(
      'useArticleReactions must be used within ArticleReactionsProvider',
    );
  }

  return context;
}

export function useOptionalArticleReactions() {
  return useContext(ArticleReactionsContext);
}
